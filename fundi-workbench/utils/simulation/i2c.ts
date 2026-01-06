/**
 * I2C Bus Emulation for FUNDI Workbench
 * 
 * Provides a simulated I2C bus for communication between
 * the AVR simulation and virtual I2C peripherals like LCDs, OLEDs, etc.
 */

export interface I2CDevice {
    /** 7-bit I2C address */
    address: number;
    /** Device name for logging/debugging */
    name: string;
    /** Handle a write transaction. Called on STOP condition for buffered devices. */
    write?: (data: number[]) => void;
    /** Handle a read request - return the data to send back */
    read?: () => number[];
    /** Reset the device state */
    reset?: () => void;
    /** 
     * If true, write() is called immediately for each byte instead of buffering.
     * Streaming mode bypasses the internal buffer entirely - each I2C data byte 
     * triggers an immediate write([byte]) call. Required for devices like LCD1602
     * (PCF8574 backpack) that need real-time byte processing to detect signal edges.
     */
    streamingWrite?: boolean;
}

export type I2CTransactionType = 'start' | 'stop' | 'write' | 'read';

export interface I2CTransaction {
    type: I2CTransactionType;
    address?: number;
    data?: number[];
    timestamp: number;
}

/**
 * I2C Bus Manager - manages I2C peripherals and transactions
 */
class I2CBus {
    private devices: Map<number, I2CDevice> = new Map();
    private currentAddress: number | null = null;
    private currentBuffer: number[] = [];
    private currentReadBuffer: number[] = [];
    private transactionLog: I2CTransaction[] = [];
    private isReading: boolean = false;
    private listeners: Set<(tx: I2CTransaction) => void> = new Set();

    /**
     * Register an I2C device at a specific address
     */
    registerDevice(device: I2CDevice): void {
        if (this.devices.has(device.address)) {
            console.warn(`[I2C] Overwriting device at address 0x${device.address.toString(16)}`);
        }
        this.devices.set(device.address, device);
        console.log(`[I2C] Registered device '${device.name}' at 0x${device.address.toString(16)}`);
    }

    /**
     * Unregister a device
     */
    unregisterDevice(address: number): void {
        this.devices.delete(address);
    }

    /**
     * Get a registered device by address
     */
    getDevice(address: number): I2CDevice | undefined {
        return this.devices.get(address);
    }

    /**
     * Get all registered devices
     */
    getAllDevices(): I2CDevice[] {
        return Array.from(this.devices.values());
    }

    /**
     * Start condition - begin a new transaction
     */
    start(): void {
        // Repeated-start: if we were writing data and haven't seen STOP yet,
        // flush the buffered write before starting the next transaction.
        if (this.currentAddress !== null && !this.isReading && this.currentBuffer.length > 0) {
            const device = this.devices.get(this.currentAddress);
            if (device?.write) {
                device.write([...this.currentBuffer]);
            }
        }

        const tx: I2CTransaction = { type: 'start', timestamp: Date.now() };
        this.transactionLog.push(tx);
        this.notifyListeners(tx);
        this.currentBuffer = [];
        this.currentReadBuffer = [];
        this.currentAddress = null;
        this.isReading = false;
    }

    /**
     * Stop condition - end current transaction
     */
    stop(): void {
        // If we were writing, flush buffer to device
        if (this.currentAddress !== null && !this.isReading && this.currentBuffer.length > 0) {
            const device = this.devices.get(this.currentAddress);
            if (device?.write) {
                device.write([...this.currentBuffer]);
            }
        }

        const tx: I2CTransaction = { type: 'stop', timestamp: Date.now() };
        this.transactionLog.push(tx);
        this.notifyListeners(tx);

        this.currentAddress = null;
        this.currentBuffer = [];
        this.currentReadBuffer = [];
        this.isReading = false;
    }

    /**
     * Write a byte to the bus (address or data)
     * Returns true for ACK, false for NACK
     */
    writeByte(byte: number): boolean {
        // First byte after start is address + R/W bit
        if (this.currentAddress === null) {
            const address = byte >> 1;  // 7-bit address
            this.isReading = (byte & 1) === 1;  // R/W bit
            this.currentAddress = address;
            this.currentReadBuffer = [];

            const tx: I2CTransaction = {
                type: 'write',
                address,
                data: [byte],
                timestamp: Date.now()
            };
            this.transactionLog.push(tx);
            this.notifyListeners(tx);

            // ACK if device exists at this address
            return this.devices.has(address);
        }

        // Subsequent bytes are data
        const device = this.devices.get(this.currentAddress);
        
        // For devices that need streaming writes (like LCD1602), forward byte immediately
        if (device?.streamingWrite && device.write && !this.isReading) {
            device.write([byte]);
        } else {
            // Otherwise buffer for batch write on STOP
            this.currentBuffer.push(byte);
        }

        const tx: I2CTransaction = {
            type: 'write',
            address: this.currentAddress,
            data: [byte],
            timestamp: Date.now()
        };
        this.transactionLog.push(tx);
        this.notifyListeners(tx);

        // ACK data
        return true;
    }

    /**
     * Read a byte from the bus
     */
    readByte(ack: boolean = true): number {
        if (this.currentAddress === null) {
            return 0xFF;  // No device addressed
        }

        const device = this.devices.get(this.currentAddress);
        if (!device?.read) {
            return 0xFF;  // Device doesn't support reading
        }

        // Buffer device read responses so multi-byte reads work correctly.
        // If buffer is empty, fetch a fresh chunk from device.
        if (this.currentReadBuffer.length === 0) {
            const data = device.read();
            this.currentReadBuffer = Array.isArray(data) ? [...data] : [];
        }

        const byte = this.currentReadBuffer.length > 0 ? (this.currentReadBuffer.shift() as number) : 0xFF;

        const tx: I2CTransaction = {
            type: 'read',
            address: this.currentAddress,
            data: [byte],
            timestamp: Date.now()
        };
        this.transactionLog.push(tx);
        this.notifyListeners(tx);

        return byte;
    }

    /**
     * Get transaction log (for debugging/logic analyzer)
     */
    getTransactionLog(limit: number = 100): I2CTransaction[] {
        return this.transactionLog.slice(-limit);
    }

    /**
     * Clear transaction log
     */
    clearLog(): void {
        this.transactionLog = [];
    }

    /**
     * Reset all devices
     */
    resetAll(): void {
        for (const device of this.devices.values()) {
            device.reset?.();
        }
        this.currentAddress = null;
        this.currentBuffer = [];
        this.currentReadBuffer = [];
        this.isReading = false;
    }

    /**
     * Subscribe to transactions
     */
    subscribe(listener: (tx: I2CTransaction) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(tx: I2CTransaction): void {
        for (const listener of this.listeners) {
            listener(tx);
        }
    }
}

// Singleton I2C bus instance
let i2cBusInstance: I2CBus | null = null;

/**
 * Get the I2C bus singleton
 */
export function getI2CBus(): I2CBus {
    if (!i2cBusInstance) {
        i2cBusInstance = new I2CBus();
    }
    return i2cBusInstance;
}

export type { I2CBus };
