/*
  Headless test: TM1637 4-digit display.

  Bit-bangs the TM1637 protocol and verifies the emulator captures
  the 4 segment bytes.

  Usage:
    BACKEND_URL=http://localhost:8000 npm run sim:test:tm1637
*/

import {
  AVRRunner,
  compileSketch,
  DEFAULT_BACKEND_URL,
  makeSerialCollector,
  runForCycles,
  UNO_CPU_FREQUENCY_HZ,
} from './sim/harness';

import { TM1637Device } from '../utils/simulation/tm1637';

const SKETCH = `
// TM1637 bit-bang test
const int PIN_CLK = 2;
const int PIN_DIO = 3;

void delayShort() { delayMicroseconds(5); }

void startCond() {
  pinMode(PIN_DIO, OUTPUT);
  digitalWrite(PIN_DIO, HIGH);
  digitalWrite(PIN_CLK, HIGH);
  delayShort();
  digitalWrite(PIN_DIO, LOW);
  delayShort();
  digitalWrite(PIN_CLK, LOW);
}

void stopCond() {
  pinMode(PIN_DIO, OUTPUT);
  digitalWrite(PIN_CLK, LOW);
  digitalWrite(PIN_DIO, LOW);
  delayShort();
  digitalWrite(PIN_CLK, HIGH);
  delayShort();
  digitalWrite(PIN_DIO, HIGH);
  delayShort();
}

bool writeByte(byte b) {
  for (int i = 0; i < 8; i++) {
    digitalWrite(PIN_CLK, LOW);
    delayShort();
    digitalWrite(PIN_DIO, (b >> i) & 1);
    delayShort();
    digitalWrite(PIN_CLK, HIGH);
    delayShort();
  }

  // ACK
  digitalWrite(PIN_CLK, LOW);
  pinMode(PIN_DIO, INPUT);
  delayShort();
  digitalWrite(PIN_CLK, HIGH);
  delayShort();
  bool ack = (digitalRead(PIN_DIO) == 0);
  digitalWrite(PIN_CLK, LOW);
  pinMode(PIN_DIO, OUTPUT);
  return ack;
}

void setup() {
  Serial.begin(9600);
  pinMode(PIN_CLK, OUTPUT);
  pinMode(PIN_DIO, OUTPUT);
  digitalWrite(PIN_CLK, HIGH);
  digitalWrite(PIN_DIO, HIGH);

  // Data command: auto-increment
  startCond();
  writeByte(0x40);
  stopCond();

  // Address command: start at 0
  startCond();
  writeByte(0xC0);
  // Write 4 bytes: '12 34' in typical segment encoding is library-specific.
  // We'll just write known raw bytes and assert emulator matches.
  writeByte(0x3F); // digit0
  writeByte(0x06); // digit1
  writeByte(0x5B); // digit2
  writeByte(0x4F); // digit3
  stopCond();

  // Display control: display on + brightness 7
  startCond();
  writeByte(0x8F);
  stopCond();

  Serial.println("TM1637 done");
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

  const clk = getUnoPortBitForDigitalPin(2);
  const dio = getUnoPortBitForDigitalPin(3);

  const clkPort = clk.port === 'B' ? runner.portB : clk.port === 'C' ? runner.portC : runner.portD;
  const dioPort = dio.port === 'B' ? runner.portB : dio.port === 'C' ? runner.portC : runner.portD;

  const dev = new TM1637Device({
    clkPort,
    clkBit: clk.bit,
    dioPort,
    dioBit: dio.bit,
  });

  const maxCycles = runner.cpu.cycles + Math.floor(UNO_CPU_FREQUENCY_HZ * 0.6);
  runForCycles(runner, () => dev.tick(), maxCycles);

  const state = dev.getState();
  const expected = [0x3f, 0x06, 0x5b, 0x4f];
  const got = state.segments.map((v) => v & 0xff);

  const ok = expected.every((v, i) => got[i] === v);
  if (!ok) {
    throw new Error(`TM1637 test failed: segments=${got.map((v) => '0x' + v.toString(16).padStart(2, '0')).join(', ')}`);
  }

  if (!serial.lines.some((l) => l.includes('TM1637 done'))) {
    throw new Error(`TM1637 test failed: missing serial marker. Lines: ${JSON.stringify(serial.lines)}`);
  }

  // eslint-disable-next-line no-console
  console.log('PASS: TM1637 emulator captured expected segment bytes.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
