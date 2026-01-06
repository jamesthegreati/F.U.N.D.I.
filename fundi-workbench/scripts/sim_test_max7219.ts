/*
  Headless test: MAX7219 8x8 matrix.

  Uses a bit-banged SPI write (DIN/CLK/CS) and verifies the emulator sees
  the correct register writes for row data.

  Usage:
    BACKEND_URL=http://localhost:8000 npm run sim:test:max7219
*/

import {
  AVRRunner,
  compileSketch,
  DEFAULT_BACKEND_URL,
  makeSerialCollector,
  runForCycles,
  UNO_CPU_FREQUENCY_HZ,
} from './sim/harness';

import { Max7219Device } from '../utils/simulation/max7219';

const SKETCH = `
// MAX7219 bit-bang test
const int PIN_DIN = 11; // MOSI
const int PIN_CLK = 13; // SCK
const int PIN_CS  = 10; // SS

void pulseClk() {
  digitalWrite(PIN_CLK, HIGH);
  delayMicroseconds(2);
  digitalWrite(PIN_CLK, LOW);
  delayMicroseconds(2);
}

void spiWrite16(byte reg, byte value) {
  digitalWrite(PIN_CS, LOW);
  // shift out reg then value, MSB first
  for (int i = 7; i >= 0; i--) {
    digitalWrite(PIN_DIN, (reg >> i) & 1);
    pulseClk();
  }
  for (int i = 7; i >= 0; i--) {
    digitalWrite(PIN_DIN, (value >> i) & 1);
    pulseClk();
  }
  digitalWrite(PIN_CS, HIGH);
  delayMicroseconds(10);
}

void setup() {
  Serial.begin(9600);
  pinMode(PIN_DIN, OUTPUT);
  pinMode(PIN_CLK, OUTPUT);
  pinMode(PIN_CS, OUTPUT);
  digitalWrite(PIN_CS, HIGH);
  digitalWrite(PIN_CLK, LOW);

  // init
  spiWrite16(0x0F, 0x00); // display test off
  spiWrite16(0x0C, 0x01); // shutdown=0 (normal operation)
  spiWrite16(0x09, 0x00); // decode mode off
  spiWrite16(0x0B, 0x07); // scan limit
  spiWrite16(0x0A, 0x08); // intensity

  // row pattern
  spiWrite16(0x01, 0x81);
  spiWrite16(0x02, 0x42);
  spiWrite16(0x03, 0x24);
  spiWrite16(0x04, 0x18);
  spiWrite16(0x05, 0x18);
  spiWrite16(0x06, 0x24);
  spiWrite16(0x07, 0x42);
  spiWrite16(0x08, 0x81);

  Serial.println("MAX7219 done");
}

void loop() { delay(1000); }
`;

function getUnoPortBitForDigitalPin(digitalPin: number): { port: 'B' | 'C' | 'D'; bit: number } {
  if (digitalPin >= 0 && digitalPin <= 7) return { port: 'D', bit: digitalPin };
  if (digitalPin >= 8 && digitalPin <= 13) return { port: 'B', bit: digitalPin - 8 };
  throw new Error(`Unsupported UNO digital pin: ${digitalPin}`);
}

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const hexText = await compileSketch(backendUrl, SKETCH, 'wokwi-arduino-uno');
  const runner = new AVRRunner(hexText);
  const serial = makeSerialCollector(runner.usart);

  const din = getUnoPortBitForDigitalPin(11);
  const clk = getUnoPortBitForDigitalPin(13);
  const cs = getUnoPortBitForDigitalPin(10);

  const dinPort = din.port === 'B' ? runner.portB : din.port === 'C' ? runner.portC : runner.portD;
  const clkPort = clk.port === 'B' ? runner.portB : clk.port === 'C' ? runner.portC : runner.portD;
  const csPort = cs.port === 'B' ? runner.portB : cs.port === 'C' ? runner.portC : runner.portD;

  const dev = new Max7219Device({
    dinPort,
    dinBit: din.bit,
    clkPort,
    clkBit: clk.bit,
    csPort,
    csBit: cs.bit,
  });

  const maxCycles = runner.cpu.cycles + Math.floor(UNO_CPU_FREQUENCY_HZ * 0.5);
  runForCycles(runner, () => dev.tick(), maxCycles);

  const state = dev.getState();

  const expected = [0x81, 0x42, 0x24, 0x18, 0x18, 0x24, 0x42, 0x81];
  const rows = state.rows.map((v) => v & 0xff);

  const ok = expected.every((v, i) => rows[i] === v);
  if (!ok) {
    throw new Error(`MAX7219 test failed: rows=${rows.map((v) => '0x' + v.toString(16).padStart(2, '0')).join(', ')}`);
  }

  if (!serial.lines.some((l) => l.includes('MAX7219 done'))) {
    throw new Error(`MAX7219 test failed: missing serial marker. Lines: ${JSON.stringify(serial.lines)}`);
  }

  // eslint-disable-next-line no-console
  console.log('PASS: MAX7219 emulator captured expected row writes.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
