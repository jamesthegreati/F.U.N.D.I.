'use client';

import { AVRIOPort, PinState } from 'avr8js';

export type KeypadBinding = {
  rowPorts: { port: AVRIOPort; bit: number }[];  // R1, R2, R3, R4
  colPorts: { port: AVRIOPort; bit: number }[];  // C1, C2, C3, C4
  getButtonState: (row: number, col: number) => boolean;
};

/**
 * Simulates a 4x4 (or smaller) membrane keypad matrix.
 * 
 * Matrix scanning principle:
 * 1. MCU sets all row pins as OUTPUT and column pins as INPUT_PULLUP
 * 2. MCU drives one row LOW at a time
 * 3. MCU reads all column pins
 * 4. If a button is pressed connecting the active row to a column,
 *    that column will read LOW
 * 5. Repeat for all rows to detect all pressed buttons
 * 
 * Default 4x4 keypad layout:
 *        C1   C2   C3   C4
 *   R1 [ 1 ] [ 2 ] [ 3 ] [ A ]
 *   R2 [ 4 ] [ 5 ] [ 6 ] [ B ]
 *   R3 [ 7 ] [ 8 ] [ 9 ] [ C ]
 *   R4 [ * ] [ 0 ] [ # ] [ D ]
 */
export class KeypadDevice {
  private readonly rowPorts: { port: AVRIOPort; bit: number }[];
  private readonly colPorts: { port: AVRIOPort; bit: number }[];
  private readonly getButtonState: (row: number, col: number) => boolean;

  constructor(binding: KeypadBinding) {
    this.rowPorts = binding.rowPorts;
    this.colPorts = binding.colPorts;
    this.getButtonState = binding.getButtonState;
  }

  reset(): void {
    // Nothing to reset - state is derived from current pin states
  }

  /**
   * Call frequently to update column pin states based on row scanning.
   * This simulates the electrical connection when a button is pressed.
   */
  tick(): void {
    // For each column, check if any pressed button connects it to an active (LOW) row
    for (let col = 0; col < this.colPorts.length; col++) {
      const colPort = this.colPorts[col];
      const colPinState = colPort.port.pinState(colPort.bit);

      // Only update if column is configured as input (with or without pullup)
      if (colPinState !== PinState.Input && colPinState !== PinState.InputPullUp) {
        continue;
      }

      // Check if any row driving LOW has a pressed button in this column
      let shouldPullLow = false;

      for (let row = 0; row < this.rowPorts.length; row++) {
        const rowPort = this.rowPorts[row];
        const rowPinState = rowPort.port.pinState(rowPort.bit);

        // If row is driven LOW and button at (row, col) is pressed
        if (rowPinState === PinState.Low && this.getButtonState(row, col)) {
          shouldPullLow = true;
          break;
        }
      }

      // Set the column pin state based on button connections
      // When button is pressed and row is LOW, column sees LOW
      // Otherwise, column floats HIGH due to INPUT_PULLUP
      colPort.port.setPin(colPort.bit, !shouldPullLow);
    }
  }

  /**
   * Get the number of rows in this keypad.
   */
  get rows(): number {
    return this.rowPorts.length;
  }

  /**
   * Get the number of columns in this keypad.
   */
  get cols(): number {
    return this.colPorts.length;
  }
}

/**
 * Default key layout for 4x4 membrane keypad.
 */
export const DEFAULT_KEYPAD_KEYS = [
  ['1', '2', '3', 'A'],
  ['4', '5', '6', 'B'],
  ['7', '8', '9', 'C'],
  ['*', '0', '#', 'D'],
];

/**
 * Helper to get key label at a specific row/col position.
 */
export function getKeyLabel(row: number, col: number, keys: string[][] = DEFAULT_KEYPAD_KEYS): string | null {
  if (row >= 0 && row < keys.length && col >= 0 && col < keys[row].length) {
    return keys[row][col];
  }
  return null;
}

/**
 * Helper to find row/col position of a key by its label.
 */
export function findKeyPosition(label: string, keys: string[][] = DEFAULT_KEYPAD_KEYS): { row: number; col: number } | null {
  for (let row = 0; row < keys.length; row++) {
    for (let col = 0; col < keys[row].length; col++) {
      if (keys[row][col] === label) {
        return { row, col };
      }
    }
  }
  return null;
}
