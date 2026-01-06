import type { PortBit, SPIRoutedDevice } from './spiBus';

export interface ILI9341Frame {
  width: number;
  height: number;
  /** RGB565 pixels, row-major */
  pixels: Uint16Array;
}

export type ILI9341Listener = (frame: ILI9341Frame) => void;

const WIDTH = 240;
const HEIGHT = 320;

class ILI9341Device implements SPIRoutedDevice {
  readonly cs: PortBit;
  readonly dc: PortBit;

  private readonly pixels = new Uint16Array(WIDTH * HEIGHT);
  private listeners = new Set<ILI9341Listener>();
  private dirty = false;

  private lastCmd: number | null = null;
  private expectedParams = 0;
  private paramBuf: number[] = [];

  private windowX0 = 0;
  private windowX1 = WIDTH - 1;
  private windowY0 = 0;
  private windowY1 = HEIGHT - 1;
  private curX = 0;
  private curY = 0;

  private writePixels = false;
  private pixelByteHi: number | null = null;

  constructor(pins: { cs: PortBit; dc: PortBit }) {
    this.cs = pins.cs;
    this.dc = pins.dc;
    // default framebuffer: black
    this.pixels.fill(0x0000);
  }

  subscribe(listener: ILI9341Listener): () => void {
    this.listeners.add(listener);
    // initial
    listener(this.getFrame());
    return () => this.listeners.delete(listener);
  }

  getFrame(): ILI9341Frame {
    return { width: WIDTH, height: HEIGHT, pixels: this.pixels };
  }

  onSelect(): void {
    // no-op
  }

  onDeselect(): void {
    // Flush any pending partial pixel
    this.pixelByteHi = null;

    if (this.dirty) {
      this.dirty = false;
      const frame = this.getFrame();
      for (const l of this.listeners) l(frame);
    }
  }

  transferByte(value: number, isData: boolean): number {
    if (!isData) {
      // command
      this.writePixels = false;
      this.pixelByteHi = null;
      this.lastCmd = value & 0xff;
      this.paramBuf = [];
      this.expectedParams = this.expectedParamsForCmd(this.lastCmd);

      if (this.lastCmd === 0x2c) {
        // RAMWR - subsequent data is pixel stream
        this.writePixels = true;
        this.curX = this.windowX0;
        this.curY = this.windowY0;
      }
      return 0xff;
    }

    // data
    if (this.writePixels) {
      return this.handlePixelData(value & 0xff);
    }

    if (this.lastCmd == null) return 0xff;

    if (this.expectedParams > 0) {
      this.paramBuf.push(value & 0xff);
      if (this.paramBuf.length >= this.expectedParams) {
        this.applyCommandParams(this.lastCmd, this.paramBuf);
        this.paramBuf = [];
        this.expectedParams = 0;
      }
    }

    return 0xff;
  }

  private expectedParamsForCmd(cmd: number): number {
    switch (cmd) {
      case 0x2a: // CASET
      case 0x2b: // PASET
        return 4;
      case 0x36: // MADCTL
      case 0x3a: // COLMOD
        return 1;
      default:
        return 0;
    }
  }

  private applyCommandParams(cmd: number, params: number[]): void {
    if (cmd === 0x2a && params.length === 4) {
      const x0 = ((params[0] << 8) | params[1]) & 0xffff;
      const x1 = ((params[2] << 8) | params[3]) & 0xffff;
      this.windowX0 = clamp(x0, 0, WIDTH - 1);
      this.windowX1 = clamp(x1, 0, WIDTH - 1);
      if (this.windowX1 < this.windowX0) [this.windowX0, this.windowX1] = [this.windowX1, this.windowX0];
      this.curX = this.windowX0;
    }

    if (cmd === 0x2b && params.length === 4) {
      const y0 = ((params[0] << 8) | params[1]) & 0xffff;
      const y1 = ((params[2] << 8) | params[3]) & 0xffff;
      this.windowY0 = clamp(y0, 0, HEIGHT - 1);
      this.windowY1 = clamp(y1, 0, HEIGHT - 1);
      if (this.windowY1 < this.windowY0) [this.windowY0, this.windowY1] = [this.windowY1, this.windowY0];
      this.curY = this.windowY0;
    }

    // For now, ignore MADCTL/COLMOD beyond accepting the bytes.
  }

  private handlePixelData(b: number): number {
    if (this.pixelByteHi == null) {
      this.pixelByteHi = b;
      return 0xff;
    }

    const rgb565 = ((this.pixelByteHi << 8) | b) & 0xffff;
    this.pixelByteHi = null;

    if (this.curX >= 0 && this.curX < WIDTH && this.curY >= 0 && this.curY < HEIGHT) {
      this.pixels[this.curY * WIDTH + this.curX] = rgb565;
      this.dirty = true;
    }

    // advance within address window
    this.curX++;
    if (this.curX > this.windowX1) {
      this.curX = this.windowX0;
      this.curY++;
      if (this.curY > this.windowY1) {
        this.curY = this.windowY0;
      }
    }

    return 0xff;
  }
}

function clamp(n: number, lo: number, hi: number): number {
  if (n < lo) return lo;
  if (n > hi) return hi;
  return n;
}

const registry = new Map<string, ILI9341Device>();

export function registerILI9341(partId: string, dev: ILI9341Device): void {
  registry.set(partId, dev);
}

export function getILI9341(partId: string): ILI9341Device | null {
  return registry.get(partId) ?? null;
}

export function resetILI9341Registry(): void {
  registry.clear();
}

export { ILI9341Device };
