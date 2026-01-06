import type { AVRIOPort } from 'avr8js';
import { PinState } from 'avr8js';

export type RelayTransistorMode = 'npn' | 'pnp';

export interface RelayModuleConfig {
  inPort: AVRIOPort;
  inBit: number;
  transistor?: RelayTransistorMode;
  onChange?: (state: RelayModuleState) => void;
}

export interface RelayModuleState {
  /** True if COM is connected to NO. False means COM->NC. */
  comToNo: boolean;
}

/**
 * Minimal relay module emulator.
 *
 * Matches Wokwi docs:
 * - transistor=npn (default): IN high/disconnected => COM->NC, IN low => COM->NO
 * - transistor=pnp: inverted
 */
export class RelayModuleDevice {
  private readonly inPort: AVRIOPort;
  private readonly inBit: number;
  private readonly transistor: RelayTransistorMode;
  private readonly onChange?: (state: RelayModuleState) => void;

  private state: RelayModuleState = { comToNo: false };

  constructor(config: RelayModuleConfig) {
    this.inPort = config.inPort;
    this.inBit = config.inBit;
    this.transistor = config.transistor ?? 'npn';
    this.onChange = config.onChange;
  }

  getState(): RelayModuleState {
    return { ...this.state };
  }

  tick(): void {
    const inHigh = this.inPort.pinState(this.inBit) === PinState.High;

    // Per docs, NPN energizes when IN is low.
    const comToNo = this.transistor === 'npn' ? !inHigh : inHigh;

    if (this.state.comToNo !== comToNo) {
      this.state.comToNo = comToNo;
      if (this.onChange) this.onChange(this.getState());
    }
  }
}
