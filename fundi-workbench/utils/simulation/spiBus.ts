import { AVRIOPort, PinState, type CPU, type AVRSPI } from 'avr8js';

export type PortBit = { port: AVRIOPort; bit: number };

export interface SPIRoutedDevice {
  /** Active-low chip select pin */
  cs: PortBit;
  /** Optional D/C pin (common on SPI displays); HIGH = data, LOW = command */
  dc?: PortBit;

  onSelect?: () => void;
  onDeselect?: () => void;

  /** Handle a single SPI byte transfer. Return the MISO response byte. */
  transferByte: (mosi: number, isData: boolean) => number;
}

export function attachSPIRouter(params: { cpu: CPU; spi: AVRSPI; devices: SPIRoutedDevice[] }): void {
  const { cpu, spi, devices } = params;

  const readHigh = (pb: PortBit) => pb.port.pinState(pb.bit) === PinState.High;
  const readLow = (pb: PortBit) => pb.port.pinState(pb.bit) === PinState.Low;

  let selected: SPIRoutedDevice | null = null;

  // Track CS deassertions even when no SPI byte is in flight.
  // This is important for displays/libraries that toggle CS between bytes.
  const csPorts = Array.from(new Set(devices.map((d) => d.cs.port)));
  for (const port of csPorts) {
    port.addListener(() => {
      if (!selected) return;
      if (selected.cs.port !== port) return;
      if (readHigh(selected.cs)) {
        selected.onDeselect?.();
        selected = null;
      }
    });
  }

  spi.onByte = (mosiValue: number) => {
    const active = devices.find((d) => readLow(d.cs)) ?? null;

    if (active !== selected) {
      selected?.onDeselect?.();
      active?.onSelect?.();
      selected = active;
    }

    const isData = active?.dc ? readHigh(active.dc) : true;
    const resp = active ? active.transferByte(mosiValue & 0xff, isData) & 0xff : 0xff;

    cpu.addClockEvent(() => {
      spi.completeTransfer(resp);
    }, spi.transferCycles);
  };
}
