'use client';

/**
 * Membrane Keypad Matrix Scanner Emulator
 * 
 * Emulates 3x4 or 4x4 membrane keypads with matrix scanning.
 * Connects to GPIO pins for row/column scanning.
 */

// Standard keypad layouts
export const KEYPAD_3X4_LAYOUT = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
];

export const KEYPAD_4X4_LAYOUT = [
    ['1', '2', '3', 'A'],
    ['4', '5', '6', 'B'],
    ['7', '8', '9', 'C'],
    ['*', '0', '#', 'D'],
];

export interface KeypadConfig {
    /** Number of rows */
    rows: number;
    /** Number of columns */
    cols: number;
    /** Key layout (2D array of key labels) */
    layout: string[][];
    /** Row pin numbers (outputs from MCU perspective) */
    rowPins: number[];
    /** Column pin numbers (inputs from MCU perspective) */
    colPins: number[];
}

export interface KeypadState {
    /** Currently pressed keys */
    pressedKeys: Set<string>;
    /** Key layout */
    layout: string[][];
    /** Last key pressed (for getKey() style reading) */
    lastKey: string | null;
}

export type KeypadStateListener = (state: KeypadState) => void;

/**
 * Membrane Keypad Emulator
 */
class KeypadEmulator {
    readonly config: KeypadConfig;

    // Key state - which keys are pressed
    private pressedKeys: Set<string> = new Set();
    private lastKey: string | null = null;

    // Pin state for matrix scanning
    private rowStates: boolean[] = [];  // Current row output states
    private colStates: boolean[] = [];  // Current column input readings

    // Listeners
    private listeners: Set<KeypadStateListener> = new Set();

    constructor(config: KeypadConfig) {
        this.config = config;
        this.rowStates = new Array(config.rows).fill(true);  // Default HIGH (pullup)
        this.colStates = new Array(config.cols).fill(true);  // Default HIGH (pullup)
    }

    /**
     * Set row output state (called by simulation when MCU sets row pins)
     */
    setRowState(rowIndex: number, high: boolean): void {
        if (rowIndex >= 0 && rowIndex < this.config.rows) {
            this.rowStates[rowIndex] = high;
            this.updateColumnStates();
        }
    }

    /**
     * Get column input state (called by simulation when MCU reads column pins)
     */
    getColumnState(colIndex: number): boolean {
        if (colIndex >= 0 && colIndex < this.config.cols) {
            return this.colStates[colIndex];
        }
        return true; // Default HIGH
    }

    /**
     * Press a key (user interaction)
     */
    pressKey(key: string): void {
        if (!this.pressedKeys.has(key)) {
            this.pressedKeys.add(key);
            this.lastKey = key;
            this.updateColumnStates();
            this.notifyListeners();
            console.log(`[Keypad] Key pressed: ${key}`);
        }
    }

    /**
     * Release a key (user interaction)
     */
    releaseKey(key: string): void {
        if (this.pressedKeys.delete(key)) {
            this.updateColumnStates();
            this.notifyListeners();
            console.log(`[Keypad] Key released: ${key}`);
        }
    }

    /**
     * Toggle a key (for click interaction)
     */
    toggleKey(key: string): void {
        if (this.pressedKeys.has(key)) {
            this.releaseKey(key);
        } else {
            this.pressKey(key);
            // Auto-release after a short delay (simulating button press)
            setTimeout(() => this.releaseKey(key), 150);
        }
    }

    /**
     * Find key position in layout
     */
    findKeyPosition(key: string): { row: number; col: number } | null {
        for (let row = 0; row < this.config.layout.length; row++) {
            for (let col = 0; col < this.config.layout[row].length; col++) {
                if (this.config.layout[row][col] === key) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    /**
     * Update column states based on row states and pressed keys
     * This simulates the electrical behavior of the matrix
     */
    private updateColumnStates(): void {
        // Reset all columns to HIGH
        this.colStates.fill(true);

        // For each pressed key, if its row is LOW, pull its column LOW
        for (const key of this.pressedKeys) {
            const pos = this.findKeyPosition(key);
            if (pos && !this.rowStates[pos.row]) {
                // Row is LOW and key is pressed → column goes LOW
                this.colStates[pos.col] = false;
            }
        }
    }

    /**
     * Get current state
     */
    getState(): KeypadState {
        return {
            pressedKeys: new Set(this.pressedKeys),
            layout: this.config.layout,
            lastKey: this.lastKey,
        };
    }

    /**
     * Get and clear last key (like Keypad library getKey())
     */
    getLastKey(): string | null {
        const key = this.lastKey;
        this.lastKey = null;
        return key;
    }

    /**
     * Subscribe to state changes
     */
    subscribe(listener: KeypadStateListener): () => void {
        this.listeners.add(listener);
        listener(this.getState());
        return () => this.listeners.delete(listener);
    }

    /**
     * Reset state
     */
    reset(): void {
        this.pressedKeys.clear();
        this.lastKey = null;
        this.rowStates.fill(true);
        this.colStates.fill(true);
        this.notifyListeners();
    }

    private notifyListeners(): void {
        const state = this.getState();
        for (const listener of this.listeners) {
            listener(state);
        }
    }
}

// Keypad instances cache
const keypads: Map<string, KeypadEmulator> = new Map();

/**
 * Create a 3x4 keypad
 */
export function createKeypad3x4(
    rowPins: number[] = [9, 8, 7, 6],
    colPins: number[] = [5, 4, 3]
): KeypadEmulator {
    const id = `3x4_${rowPins.join(',')}_${colPins.join(',')}`;
    let keypad = keypads.get(id);
    if (!keypad) {
        keypad = new KeypadEmulator({
            rows: 4,
            cols: 3,
            layout: KEYPAD_3X4_LAYOUT,
            rowPins,
            colPins,
        });
        keypads.set(id, keypad);
    }
    return keypad;
}

/**
 * Create a 4x4 keypad
 */
export function createKeypad4x4(
    rowPins: number[] = [9, 8, 7, 6],
    colPins: number[] = [5, 4, 3, 2]
): KeypadEmulator {
    const id = `4x4_${rowPins.join(',')}_${colPins.join(',')}`;
    let keypad = keypads.get(id);
    if (!keypad) {
        keypad = new KeypadEmulator({
            rows: 4,
            cols: 4,
            layout: KEYPAD_4X4_LAYOUT,
            rowPins,
            colPins,
        });
        keypads.set(id, keypad);
    }
    return keypad;
}

export type { KeypadEmulator };
