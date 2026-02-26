export type GateKind = 'not' | 'and' | 'or' | 'xor' | 'nand' | 'nor';

export type LogicOutputs = Record<string, boolean>;

export interface LogicDevice {
  evaluate(inputs: Record<string, boolean>): LogicOutputs;
}

export class LogicGateDevice implements LogicDevice {
  constructor(private readonly kind: GateKind) {}

  evaluate(inputs: Record<string, boolean>): LogicOutputs {
    const a = !!inputs.A;
    const b = !!inputs.B;

    let y = false;
    switch (this.kind) {
      case 'not':
        y = !a;
        break;
      case 'and':
        y = a && b;
        break;
      case 'or':
        y = a || b;
        break;
      case 'xor':
        y = a !== b;
        break;
      case 'nand':
        y = !(a && b);
        break;
      case 'nor':
        y = !(a || b);
        break;
    }

    return { Y: y };
  }
}

export class Mux2Device implements LogicDevice {
  evaluate(inputs: Record<string, boolean>): LogicOutputs {
    const i0 = !!inputs.I0;
    const i1 = !!inputs.I1;
    const s = !!inputs.S;
    return { Y: s ? i1 : i0 };
  }
}

export class DFlipFlopDevice implements LogicDevice {
  private q = false;
  private lastClk = false;

  evaluate(inputs: Record<string, boolean>): LogicOutputs {
    const d = !!inputs.D;
    const clk = !!inputs.CLK;

    if (clk && !this.lastClk) {
      this.q = d;
    }
    this.lastClk = clk;

    return { Q: this.q, NQ: !this.q };
  }
}

export class DSRFlipFlopDevice implements LogicDevice {
  private q = false;
  private lastClk = false;

  evaluate(inputs: Record<string, boolean>): LogicOutputs {
    const d = !!inputs.D;
    const clk = !!inputs.CLK;
    const s = !!inputs.S;
    const r = !!inputs.R;

    if (r) {
      this.q = false;
    } else if (s) {
      this.q = true;
    } else if (clk && !this.lastClk) {
      this.q = d;
    }

    this.lastClk = clk;
    return { Q: this.q, NQ: !this.q };
  }
}
