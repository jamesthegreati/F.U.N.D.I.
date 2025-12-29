'use client';

import { I2CDevice, getI2CBus } from './i2c';

/**
 * SSD1306 OLED Display Emulator (128x64 or 128x32)
 * 
 * Emulates an SSD1306 OLED display over I2C.
 * Common I2C address: 0x3C or 0x3D
 */

// SSD1306 Commands
const SSD1306_DISPLAYOFF = 0xAE;
const SSD1306_DISPLAYON = 0xAF;
const SSD1306_SETCONTRAST = 0x81;
const SSD1306_DISPLAYALLON_RESUME = 0xA4;
const SSD1306_DISPLAYALLON = 0xA5;
const SSD1306_NORMALDISPLAY = 0xA6;
const SSD1306_INVERTDISPLAY = 0xA7;
const SSD1306_SETMULTIPLEX = 0xA8;
const SSD1306_SETLOWCOLUMN = 0x00;
const SSD1306_SETHIGHCOLUMN = 0x10;
const SSD1306_MEMORYMODE = 0x20;
const SSD1306_COLUMNADDR = 0x21;
const SSD1306_PAGEADDR = 0x22;
const SSD1306_SETSTARTLINE = 0x40;
const SSD1306_SETDISPLAYOFFSET = 0xD3;
const SSD1306_SETCOMPINS = 0xDA;
const SSD1306_SETVCOMDETECT = 0xDB;
const SSD1306_SETDISPLAYCLOCKDIV = 0xD5;
const SSD1306_SETPRECHARGE = 0xD9;
const SSD1306_SEGREMAP = 0xA0;
const SSD1306_COMSCANINC = 0xC0;
const SSD1306_COMSCANDEC = 0xC8;
const SSD1306_CHARGEPUMP = 0x8D;
const SSD1306_DEACTIVATE_SCROLL = 0x2E;

// Data/Command control byte
const CONTROL_COMMAND = 0x00;
const CONTROL_DATA = 0x40;
const CONTROL_CONTINUE = 0x80;

export interface SSD1306State {
    /** Pixel buffer (true = pixel on) */
    pixels: boolean[][];
    /** Display width */
    width: number;
    /** Display height */
    height: number;
    /** Display on/off */
    displayOn: boolean;
    /** Inverted display */
    inverted: boolean;
    /** Contrast level (0-255) */
    contrast: number;
}

export type SSD1306StateListener = (state: SSD1306State) => void;

/**
 * SSD1306 OLED I2C Device Implementation
 */
class SSD1306Device implements I2CDevice {
    readonly address: number;
    readonly name = 'SSD1306';
    readonly width: number;
    readonly height: number;

    // Display RAM - organized as pages (8 vertical pixels per page)
    private gddram: number[][] = [];
    private displayOn: boolean = false;
    private inverted: boolean = false;
    private contrast: number = 0x7F;

    // Column/Page addressing
    private colStart: number = 0;
    private colEnd: number = 127;
    private pageStart: number = 0;
    private pageEnd: number = 7;
    private currentCol: number = 0;
    private currentPage: number = 0;
    private memoryMode: number = 0; // 0=Horizontal, 1=Vertical, 2=Page

    // Command parsing state
    private pendingCommand: number | null = null;
    private pendingArgs: number[] = [];
    private expectedArgs: number = 0;
    private controlByte: number = 0;

    // State listeners
    private listeners: Set<SSD1306StateListener> = new Set();
    private updateTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(address: number = 0x3C, width: number = 128, height: number = 64) {
        this.address = address;
        this.width = width;
        this.height = height;
        this.reset();
    }

    reset(): void {
        const pages = this.height / 8;
        this.gddram = [];
        for (let p = 0; p < pages; p++) {
            this.gddram.push(new Array(this.width).fill(0));
        }

        this.displayOn = false;
        this.inverted = false;
        this.contrast = 0x7F;
        this.colStart = 0;
        this.colEnd = this.width - 1;
        this.pageStart = 0;
        this.pageEnd = pages - 1;
        this.currentCol = 0;
        this.currentPage = 0;
        this.memoryMode = 0;
        this.pendingCommand = null;
        this.pendingArgs = [];
        this.expectedArgs = 0;

        this.scheduleUpdate();
    }

    write(data: number[]): void {
        if (data.length === 0) return;

        let i = 0;
        while (i < data.length) {
            // First byte is control byte
            const control = data[i++];
            this.controlByte = control;

            // Is this a data stream or command stream?
            const isData = (control & CONTROL_DATA) !== 0;
            const isContinue = (control & CONTROL_CONTINUE) !== 0;

            if (isData) {
                // All remaining bytes in this chunk are data
                while (i < data.length && (data[i] & CONTROL_CONTINUE) === 0) {
                    this.writeDataByte(data[i++]);
                }
            } else {
                // Command byte follows
                if (i < data.length) {
                    this.processCommand(data[i++]);
                }
            }
        }

        this.scheduleUpdate();
    }

    read(): number[] {
        // SSD1306 read returns status byte
        return [this.displayOn ? 0x00 : 0x40];
    }

    private processCommand(cmd: number): void {
        // If we're expecting command arguments
        if (this.expectedArgs > 0) {
            this.pendingArgs.push(cmd);
            this.expectedArgs--;

            if (this.expectedArgs === 0) {
                this.executeCommand(this.pendingCommand!, this.pendingArgs);
                this.pendingCommand = null;
                this.pendingArgs = [];
            }
            return;
        }

        // Parse command
        if (cmd === SSD1306_DISPLAYOFF) {
            this.displayOn = false;
        } else if (cmd === SSD1306_DISPLAYON) {
            this.displayOn = true;
        } else if (cmd === SSD1306_NORMALDISPLAY) {
            this.inverted = false;
        } else if (cmd === SSD1306_INVERTDISPLAY) {
            this.inverted = true;
        } else if (cmd === SSD1306_DEACTIVATE_SCROLL) {
            // Scrolling not implemented
        } else if ((cmd & 0xF0) === SSD1306_SETLOWCOLUMN) {
            this.currentCol = (this.currentCol & 0xF0) | (cmd & 0x0F);
        } else if ((cmd & 0xF0) === SSD1306_SETHIGHCOLUMN) {
            this.currentCol = (this.currentCol & 0x0F) | ((cmd & 0x0F) << 4);
        } else if ((cmd & 0xF8) === 0xB0) {
            // Set page start address for page addressing mode
            this.currentPage = cmd & 0x07;
        } else if ((cmd & 0xC0) === SSD1306_SETSTARTLINE) {
            // Set display start line - ignored for simple emulation
        } else if (cmd === SSD1306_SETCONTRAST) {
            this.pendingCommand = cmd;
            this.expectedArgs = 1;
        } else if (cmd === SSD1306_MEMORYMODE) {
            this.pendingCommand = cmd;
            this.expectedArgs = 1;
        } else if (cmd === SSD1306_COLUMNADDR) {
            this.pendingCommand = cmd;
            this.expectedArgs = 2;
        } else if (cmd === SSD1306_PAGEADDR) {
            this.pendingCommand = cmd;
            this.expectedArgs = 2;
        } else if (cmd === SSD1306_SETMULTIPLEX || cmd === SSD1306_SETDISPLAYOFFSET ||
            cmd === SSD1306_SETCOMPINS || cmd === SSD1306_SETVCOMDETECT ||
            cmd === SSD1306_SETDISPLAYCLOCKDIV || cmd === SSD1306_SETPRECHARGE ||
            cmd === SSD1306_CHARGEPUMP) {
            // Commands with 1 arg
            this.pendingCommand = cmd;
            this.expectedArgs = 1;
        }
        // SEGREMAP, COMSCANINC, COMSCANDEC are single-byte commands - ignored
    }

    private executeCommand(cmd: number, args: number[]): void {
        if (cmd === SSD1306_SETCONTRAST) {
            this.contrast = args[0];
        } else if (cmd === SSD1306_MEMORYMODE) {
            this.memoryMode = args[0] & 0x03;
        } else if (cmd === SSD1306_COLUMNADDR) {
            this.colStart = args[0];
            this.colEnd = args[1];
            this.currentCol = this.colStart;
        } else if (cmd === SSD1306_PAGEADDR) {
            this.pageStart = args[0];
            this.pageEnd = args[1];
            this.currentPage = this.pageStart;
        }
        // Other commands are configuration - mostly ignored
    }

    private writeDataByte(data: number): void {
        // Write a byte to GDDRAM at current position
        if (this.currentPage < this.gddram.length && this.currentCol < this.width) {
            this.gddram[this.currentPage][this.currentCol] = data;
        }

        // Advance position based on memory mode
        if (this.memoryMode === 0) {
            // Horizontal addressing mode
            this.currentCol++;
            if (this.currentCol > this.colEnd) {
                this.currentCol = this.colStart;
                this.currentPage++;
                if (this.currentPage > this.pageEnd) {
                    this.currentPage = this.pageStart;
                }
            }
        } else if (this.memoryMode === 1) {
            // Vertical addressing mode
            this.currentPage++;
            if (this.currentPage > this.pageEnd) {
                this.currentPage = this.pageStart;
                this.currentCol++;
                if (this.currentCol > this.colEnd) {
                    this.currentCol = this.colStart;
                }
            }
        } else {
            // Page addressing mode
            this.currentCol++;
            if (this.currentCol >= this.width) {
                this.currentCol = 0;
            }
        }
    }

    /**
     * Get current display state as pixel array
     */
    getState(): SSD1306State {
        // Convert page-based GDDRAM to pixel array
        const pixels: boolean[][] = [];
        for (let y = 0; y < this.height; y++) {
            const row: boolean[] = [];
            const page = Math.floor(y / 8);
            const bit = y % 8;
            for (let x = 0; x < this.width; x++) {
                const pixelOn = (this.gddram[page][x] & (1 << bit)) !== 0;
                row.push(this.inverted ? !pixelOn : pixelOn);
            }
            pixels.push(row);
        }

        return {
            pixels,
            width: this.width,
            height: this.height,
            displayOn: this.displayOn,
            inverted: this.inverted,
            contrast: this.contrast,
        };
    }

    /**
     * Subscribe to state changes
     */
    subscribe(listener: SSD1306StateListener): () => void {
        this.listeners.add(listener);
        listener(this.getState());
        return () => this.listeners.delete(listener);
    }

    private scheduleUpdate(): void {
        // Debounce updates to avoid excessive renders
        if (this.updateTimer) {
            clearTimeout(this.updateTimer);
        }
        this.updateTimer = setTimeout(() => {
            this.notifyListeners();
            this.updateTimer = null;
        }, 16); // ~60fps max
    }

    private notifyListeners(): void {
        const state = this.getState();
        for (const listener of this.listeners) {
            listener(state);
        }
    }
}

// Device instance cache
const oledDevices: Map<number, SSD1306Device> = new Map();

/**
 * Get or create an SSD1306 device at the specified address
 */
export function getSSD1306(
    address: number = 0x3C,
    width: number = 128,
    height: number = 64
): SSD1306Device {
    let device = oledDevices.get(address);
    if (!device) {
        device = new SSD1306Device(address, width, height);
        oledDevices.set(address, device);
        getI2CBus().registerDevice(device);
    }
    return device;
}

export type { SSD1306Device };
