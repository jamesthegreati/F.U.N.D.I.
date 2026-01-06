import type { PortBit, SPIRoutedDevice } from './spiBus';

/**
 * Minimal SD card model in SPI mode.
 *
 * Enough to support deterministic tests and basic init + single-block read/write:
 * - CMD0, CMD8, CMD55, ACMD41, CMD58, CMD16, CMD17, CMD24
 */
export class MicroSDCardDevice implements SPIRoutedDevice {
  readonly cs: PortBit;

  private responseQueue: number[] = [];

  private cmdBuf: number[] = [];
  private expectingCmd = false;

  private isIdle = true;
  private appCmd = false;
  private isSdhc = true;

  private blockLen = 512;
  private blocks = new Map<number, Uint8Array>();

  // write state
  private pendingWriteLba: number | null = null;
  private awaitingDataToken = false;
  private writeBuf: number[] = [];

  constructor(pins: { cs: PortBit }) {
    this.cs = pins.cs;
  }

  onSelect(): void {
    // In SPI mode, card drives MISO high when idle.
  }

  onDeselect(): void {
    this.cmdBuf = [];
    this.expectingCmd = false;
    this.appCmd = false;

    this.pendingWriteLba = null;
    this.awaitingDataToken = false;
    this.writeBuf = [];

    // Keep responseQueue: deselect typically aborts transactions
    this.responseQueue = [];
  }

  transferByte(value: number, _isData: boolean): number {
    // Priority: if we have bytes to shift out, do that.
    if (this.responseQueue.length) {
      return this.responseQueue.shift()!;
    }

    // Handle write data phase after CMD24
    if (this.pendingWriteLba != null) {
      if (!this.awaitingDataToken) {
        if (value === 0xfe) {
          this.awaitingDataToken = true;
          this.writeBuf = [];
        }
        return 0xff;
      }

      // Collect 512 data bytes + 2 CRC bytes
      this.writeBuf.push(value & 0xff);
      if (this.writeBuf.length >= this.blockLen + 2) {
        const data = this.writeBuf.slice(0, this.blockLen);
        this.blocks.set(this.pendingWriteLba, Uint8Array.from(data));

        this.pendingWriteLba = null;
        this.awaitingDataToken = false;
        this.writeBuf = [];

        // Data response token: 0bxxx00101 = 0x05 (accepted)
        // Then busy (0x00) for a short time; we just return to 0xFF.
        this.responseQueue = [0x05, 0xff, 0xff];
      }
      return 0xff;
    }

    // Detect start of command (0x40..0x7f)
    if ((value & 0xc0) === 0x40) {
      this.cmdBuf = [value & 0xff];
      this.expectingCmd = true;
      return 0xff;
    }

    if (this.expectingCmd) {
      this.cmdBuf.push(value & 0xff);
      if (this.cmdBuf.length >= 6) {
        this.expectingCmd = false;
        this.processCommand(this.cmdBuf);
        this.cmdBuf = [];
      }
      return 0xff;
    }

    // Default idle fill
    return 0xff;
  }

  private processCommand(buf: number[]): void {
    const cmd = buf[0] & 0x3f;
    const arg = ((buf[1] << 24) | (buf[2] << 16) | (buf[3] << 8) | buf[4]) >>> 0;

    // Typical Ncr delay: some 0xFFs before actual response
    const ncr = [0xff, 0xff];

    if (cmd === 55) {
      this.appCmd = true;
      this.responseQueue = [...ncr, this.r1()];
      return;
    }

    if (this.appCmd && cmd === 41) {
      // ACMD41
      this.appCmd = false;
      this.isIdle = false;
      this.responseQueue = [...ncr, this.r1()];
      return;
    }

    this.appCmd = false;

    switch (cmd) {
      case 0: {
        // CMD0: go idle
        this.isIdle = true;
        this.responseQueue = [...ncr, 0x01];
        return;
      }
      case 8: {
        // CMD8: R7
        // return: R1 + 32-bit (0x000001AA)
        this.responseQueue = [...ncr, this.r1(), 0x00, 0x00, 0x01, 0xaa];
        return;
      }
      case 58: {
        // CMD58: OCR
        // bit30 (CCS) set if SDHC
        const ocr0 = this.isSdhc ? 0x40 : 0x00;
        this.responseQueue = [...ncr, this.r1(), ocr0, 0x00, 0x00, 0x00];
        return;
      }
      case 16: {
        // CMD16: set block length
        this.blockLen = arg;
        // Only support 512 for our tests
        if (this.blockLen !== 512) {
          this.responseQueue = [...ncr, 0x04]; // parameter error
        } else {
          this.responseQueue = [...ncr, this.r1()];
        }
        return;
      }
      case 17: {
        // CMD17: read single block
        const lba = this.isSdhc ? arg : Math.floor(arg / 512);
        const data = this.blocks.get(lba) ?? new Uint8Array(512);
        const tokenDelay = [0xff, 0xff, 0xff, 0xff];
        this.responseQueue = [
          ...ncr,
          this.r1(),
          ...tokenDelay,
          0xfe,
          ...Array.from(data),
          0x12,
          0x34,
        ];
        return;
      }
      case 24: {
        // CMD24: write single block
        const lba = this.isSdhc ? arg : Math.floor(arg / 512);
        this.pendingWriteLba = lba;
        this.awaitingDataToken = false;
        this.writeBuf = [];
        this.responseQueue = [...ncr, this.r1()];
        return;
      }
      default: {
        // Unknown command => illegal command bit
        this.responseQueue = [...ncr, this.r1() | 0x04];
      }
    }
  }

  private r1(): number {
    return this.isIdle ? 0x01 : 0x00;
  }

  /** For headless tests: inspect a stored block */
  getBlock(lba: number): Uint8Array {
    const b = this.blocks.get(lba);
    return b ? new Uint8Array(b) : new Uint8Array(512);
  }
}
