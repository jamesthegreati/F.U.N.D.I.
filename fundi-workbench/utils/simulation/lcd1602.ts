import { I2CDevice, getI2CBus } from './i2c';

/**
 * LCD 1602 HD44780 Emulator (I2C mode via PCF8574 backpack)
 * 
 * Emulates a 16x2 character LCD with I2C interface.
 * Common I2C addresses: 0x27 (PCF8574) or 0x3F (PCF8574A)
 */

// LCD command definitions
const LCD_CLEARDISPLAY = 0x01;
const LCD_RETURNHOME = 0x02;
const LCD_ENTRYMODESET = 0x04;
const LCD_DISPLAYCONTROL = 0x08;
const LCD_CURSORSHIFT = 0x10;
const LCD_FUNCTIONSET = 0x20;
const LCD_SETCGRAMADDR = 0x40;
const LCD_SETDDRAMADDR = 0x80;

// Display control flags
const LCD_DISPLAYON = 0x04;
const LCD_CURSORON = 0x02;
const LCD_BLINKON = 0x01;

// PCF8574 bit mapping to LCD pins (typical wiring)
const PCF8574_RS = 0x01;  // Register Select
const PCF8574_RW = 0x02;  // Read/Write (usually tied low)
const PCF8574_EN = 0x04;  // Enable
const PCF8574_BL = 0x08;  // Backlight
// High nibble (D4-D7) is in bits 4-7

export interface LCD1602State {
    /** Display RAM - 2 rows of 16 characters */
    display: string[][];
    /** Current cursor row (0 or 1) */
    cursorRow: number;
    /** Current cursor column (0-15) */
    cursorCol: number;
    /** Display on/off */
    displayOn: boolean;
    /** Cursor visible */
    cursorOn: boolean;
    /** Cursor blink */
    blinkOn: boolean;
    /** Backlight on/off */
    backlightOn: boolean;
    /** CGRAM (custom characters) - 8 characters of 8 bytes each */
    cgram: number[][];
}

export type LCD1602StateListener = (state: LCD1602State) => void;

/**
 * LCD 1602 I2C Device Implementation
 */
class LCD1602Device implements I2CDevice {
    readonly address: number;
    readonly name = 'LCD1602';
    /** Enable streaming writes so each I2C byte is processed immediately */
    readonly streamingWrite = true;

    // Internal state
    private rows: number = 2;
    private cols: number = 16;
    private ddram: number[][] = []; // Display Data RAM
    private cursorRow: number = 0;
    private cursorCol: number = 0;
    private displayOn: boolean = false;
    private cursorOn: boolean = false;
    private blinkOn: boolean = false;
    private backlightOn: boolean = true;
    private cgram: number[][] = []; // Custom character RAM
    private cgramAddr: number = 0;
    private writingCgram: boolean = false;

    // I2C/nibble mode handling
    private lastByte: number = 0;
    private nibbleBuffer: number | null = null;
    private regSelect: boolean = false;  // RS: 0=command, 1=data

    // State listeners
    private listeners: Set<LCD1602StateListener> = new Set();

    constructor(address: number = 0x27) {
        this.address = address;
        this.reset();
    }

    reset(): void {
        // Initialize DDRAM with spaces
        this.ddram = [];
        for (let r = 0; r < this.rows; r++) {
            this.ddram.push(new Array(this.cols).fill(0x20)); // Space character
        }

        // Initialize CGRAM (8 custom chars, 8 bytes each)
        this.cgram = [];
        for (let i = 0; i < 8; i++) {
            this.cgram.push(new Array(8).fill(0));
        }

        this.cursorRow = 0;
        this.cursorCol = 0;
        this.displayOn = false;
        this.cursorOn = false;
        this.blinkOn = false;
        this.backlightOn = true;
        this.nibbleBuffer = null;
        this.writingCgram = false;
        this.cgramAddr = 0;

        this.notifyListeners();
    }

    write(data: number[]): void {
        for (const byte of data) {
            this.processByte(byte);
        }
    }

    read(): number[] {
        // LCD busy flag and address counter (not typically used in write-only implementations)
        return [0x00];
    }

    private processByte(byte: number): void {
        // Extract control signals from PCF8574 byte
        const rs = (byte & PCF8574_RS) !== 0;
        const en = (byte & PCF8574_EN) !== 0;
        const bl = (byte & PCF8574_BL) !== 0;
        const nibble = (byte >> 4) & 0x0F;

        // Update backlight
        if (this.backlightOn !== bl) {
            this.backlightOn = bl;
        }

        // Only process on falling edge of Enable (EN low after being high)
        if ((this.lastByte & PCF8574_EN) && !en) {
            if (this.nibbleBuffer === null) {
                // First nibble (high nibble)
                this.nibbleBuffer = nibble << 4;
                this.regSelect = rs;
            } else {
                // Second nibble (low nibble) - complete the byte
                const fullByte = this.nibbleBuffer | nibble;
                this.nibbleBuffer = null;

                if (this.regSelect) {
                    this.writeData(fullByte);
                } else {
                    this.writeCommand(fullByte);
                }
            }
        }

        this.lastByte = byte;
    }

    private writeCommand(cmd: number): void {
        if (cmd & LCD_SETDDRAMADDR) {
            // Set DDRAM address (cursor position)
            this.writingCgram = false;
            const addr = cmd & 0x7F;
            if (addr >= 0x40) {
                this.cursorRow = 1;
                this.cursorCol = Math.min(addr - 0x40, this.cols - 1);
            } else {
                this.cursorRow = 0;
                this.cursorCol = Math.min(addr, this.cols - 1);
            }
        } else if (cmd & LCD_SETCGRAMADDR) {
            // Set CGRAM address (custom character)
            this.writingCgram = true;
            this.cgramAddr = cmd & 0x3F;
        } else if (cmd & LCD_DISPLAYCONTROL) {
            // Display control
            this.displayOn = (cmd & LCD_DISPLAYON) !== 0;
            this.cursorOn = (cmd & LCD_CURSORON) !== 0;
            this.blinkOn = (cmd & LCD_BLINKON) !== 0;
        } else if (cmd === LCD_CLEARDISPLAY) {
            // Clear display
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    this.ddram[r][c] = 0x20; // Space
                }
            }
            this.cursorRow = 0;
            this.cursorCol = 0;
        } else if (cmd === LCD_RETURNHOME) {
            // Return home
            this.cursorRow = 0;
            this.cursorCol = 0;
        }
        // Other commands (entry mode, function set, etc.) we mostly ignore for display purposes

        this.notifyListeners();
    }

    private writeData(data: number): void {
        if (this.writingCgram) {
            // Writing to CGRAM
            const charIndex = Math.floor(this.cgramAddr / 8);
            const lineIndex = this.cgramAddr % 8;
            if (charIndex < 8 && lineIndex < 8) {
                this.cgram[charIndex][lineIndex] = data & 0x1F; // 5 bits per line
            }
            this.cgramAddr = (this.cgramAddr + 1) & 0x3F;
        } else {
            // Writing to DDRAM (display)
            if (this.cursorRow < this.rows && this.cursorCol < this.cols) {
                this.ddram[this.cursorRow][this.cursorCol] = data;
                this.cursorCol++;
                if (this.cursorCol >= this.cols) {
                    // Wrap to next line or stay at end
                    if (this.cursorRow < this.rows - 1) {
                        this.cursorRow++;
                        this.cursorCol = 0;
                    } else {
                        this.cursorCol = this.cols - 1;
                    }
                }
            }
        }

        this.notifyListeners();
    }

    /**
     * Get current display state
     */
    getState(): LCD1602State {
        // Convert character codes to strings
        const display = this.ddram.map(row =>
            row.map(code => {
                if (code < 8) {
                    // Custom character - return placeholder
                    return String.fromCharCode(0x2588); // Block character
                } else if (code >= 0x20 && code <= 0x7E) {
                    // Standard ASCII
                    return String.fromCharCode(code);
                } else {
                    // Non-printable or extended
                    return '?';
                }
            })
        );

        return {
            display,
            cursorRow: this.cursorRow,
            cursorCol: this.cursorCol,
            displayOn: this.displayOn,
            cursorOn: this.cursorOn,
            blinkOn: this.blinkOn,
            backlightOn: this.backlightOn,
            cgram: this.cgram.map(char => [...char]),
        };
    }

    /**
     * Subscribe to state changes
     */
    subscribe(listener: LCD1602StateListener): () => void {
        this.listeners.add(listener);
        // Immediately notify with current state
        listener(this.getState());
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        const state = this.getState();
        for (const listener of this.listeners) {
            listener(state);
        }
    }
}

// LCD device instance cache
const lcdDevices: Map<number, LCD1602Device> = new Map();

/**
 * Get or create an LCD1602 device at the specified address
 */
export function getLCD1602(address: number = 0x27): LCD1602Device {
    let device = lcdDevices.get(address);
    if (!device) {
        device = new LCD1602Device(address);
        lcdDevices.set(address, device);
        getI2CBus().registerDevice(device);
    }
    return device;
}

export type { LCD1602Device };
