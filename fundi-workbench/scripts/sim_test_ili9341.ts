/**
 * Headless Simulation Test: ILI9341 SPI TFT
 *
 * Sends a tiny RAMWR sequence (CASET/PASET/RAMWR) and verifies the emulator
 * wrote the expected RGB565 pixel into its framebuffer.
 */

import {
  AVRRunner,
  compileSketch,
  DEFAULT_BACKEND_URL,
  runForCycles,
  UNO_CPU_FREQUENCY_HZ,
} from './sim/harness';

import { ILI9341Device } from '../utils/simulation/ili9341';
import { attachSPIRouter } from '../utils/simulation/spiBus';

const SKETCH = `
#include <SPI.h>

static const int TFT_CS = 10;   // PB2
static const int TFT_DC = 9;    // PB1

void tftCmd(uint8_t c) {
  digitalWrite(TFT_DC, LOW);
  digitalWrite(TFT_CS, LOW);
  SPI.transfer(c);
  digitalWrite(TFT_CS, HIGH);
}

void tftData(uint8_t d) {
  digitalWrite(TFT_DC, HIGH);
  digitalWrite(TFT_CS, LOW);
  SPI.transfer(d);
  digitalWrite(TFT_CS, HIGH);
}

void setup() {
  pinMode(TFT_CS, OUTPUT);
  pinMode(TFT_DC, OUTPUT);
  digitalWrite(TFT_CS, HIGH);

  SPI.begin();
  SPI.beginTransaction(SPISettings(8000000, MSBFIRST, SPI_MODE0));

  // Set a 1x1 address window at x=2,y=3
  tftCmd(0x2A);
  tftData(0x00); tftData(0x02);
  tftData(0x00); tftData(0x02);

  tftCmd(0x2B);
  tftData(0x00); tftData(0x03);
  tftData(0x00); tftData(0x03);

  // RAMWR
  tftCmd(0x2C);

  // Write one pixel RGB565 = 0xF800 (red)
  digitalWrite(TFT_DC, HIGH);
  digitalWrite(TFT_CS, LOW);
  SPI.transfer(0xF8);
  SPI.transfer(0x00);
  digitalWrite(TFT_CS, HIGH);
}

void loop() {
  // idle
}
`;

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const hexText = await compileSketch(backendUrl, SKETCH, 'wokwi-arduino-uno');
  const runner = new AVRRunner(hexText);

  // SPI pins on Uno:
  // SCK  = D13 = PB5
  // MOSI = D11 = PB3
  // MISO = D12 = PB4 (unused)
  // CS   = D10 = PB2
  // DC   = D9  = PB1
  const tft = new ILI9341Device({
    cs: { port: runner.portB, bit: 2 },
    dc: { port: runner.portB, bit: 1 },
  });

  attachSPIRouter({ cpu: runner.cpu, spi: runner.spi, devices: [tft] });

  const maxCycles = Math.floor(UNO_CPU_FREQUENCY_HZ * 0.3);
  runForCycles(runner, () => {}, maxCycles);

  const frame = tft.getFrame();
  const idx = 3 * frame.width + 2;
  const pixel = frame.pixels[idx];

  if (pixel === 0xF800) {
    console.log('PASS: ILI9341 wrote expected pixel (0xF800) at (2,3).');
    process.exit(0);
  }

  console.log(`FAIL: Expected 0xF800 at (2,3), got 0x${pixel.toString(16).padStart(4, '0')}`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
