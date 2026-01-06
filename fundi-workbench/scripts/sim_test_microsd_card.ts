/**
 * Headless Simulation Test: MicroSD Card (SPI)
 *
 * Exercises basic SD SPI init (CMD0/CMD8/CMD55/ACMD41/CMD58) and a single
 * block write/read (CMD24/CMD17).
 */

import {
  AVRRunner,
  compileSketch,
  DEFAULT_BACKEND_URL,
  makeSerialCollector,
  runForCycles,
  UNO_CPU_FREQUENCY_HZ,
} from './sim/harness';

import { MicroSDCardDevice } from '../utils/simulation/microsd';
import { attachSPIRouter } from '../utils/simulation/spiBus';

const SKETCH = `
#include <SPI.h>

static const int SD_CS = 10;

static uint8_t sdCommand(uint8_t cmd, uint32_t arg, uint8_t crc) {
  SPI.transfer(0xFF);
  SPI.transfer(0x40 | cmd);
  SPI.transfer((arg >> 24) & 0xFF);
  SPI.transfer((arg >> 16) & 0xFF);
  SPI.transfer((arg >> 8) & 0xFF);
  SPI.transfer(arg & 0xFF);
  SPI.transfer(crc);

  // wait for response (R1 not 0xFF)
  for (int i = 0; i < 50; i++) {
    uint8_t r = SPI.transfer(0xFF);
    if (r != 0xFF) return r;
  }
  return 0xFF;
}

void setup() {
  Serial.begin(9600);
  pinMode(SD_CS, OUTPUT);
  digitalWrite(SD_CS, HIGH);

  SPI.begin();
  SPI.beginTransaction(SPISettings(400000, MSBFIRST, SPI_MODE0));

  // 80 clocks with CS high
  for (int i = 0; i < 10; i++) SPI.transfer(0xFF);

  digitalWrite(SD_CS, LOW);

  uint8_t r0 = sdCommand(0, 0, 0x95);
  Serial.print("CMD0 R1=0x"); Serial.println(r0, HEX);

  uint8_t r8 = sdCommand(8, 0x000001AA, 0x87);
  Serial.print("CMD8 R1=0x"); Serial.println(r8, HEX);
  // read R7 tail
  uint8_t r7b0 = SPI.transfer(0xFF);
  uint8_t r7b1 = SPI.transfer(0xFF);
  uint8_t r7b2 = SPI.transfer(0xFF);
  uint8_t r7b3 = SPI.transfer(0xFF);
  Serial.print("R7=");
  Serial.print(r7b0, HEX); Serial.print(" ");
  Serial.print(r7b1, HEX); Serial.print(" ");
  Serial.print(r7b2, HEX); Serial.print(" ");
  Serial.println(r7b3, HEX);

  uint8_t r55 = sdCommand(55, 0, 0x65);
  Serial.print("CMD55 R1=0x"); Serial.println(r55, HEX);
  uint8_t r41 = sdCommand(41, 0x40000000, 0x77);
  Serial.print("ACMD41 R1=0x"); Serial.println(r41, HEX);

  uint8_t r58 = sdCommand(58, 0, 0xFD);
  Serial.print("CMD58 R1=0x"); Serial.println(r58, HEX);
  // read OCR
  uint8_t o0 = SPI.transfer(0xFF);
  uint8_t o1 = SPI.transfer(0xFF);
  uint8_t o2 = SPI.transfer(0xFF);
  uint8_t o3 = SPI.transfer(0xFF);
  Serial.print("OCR=");
  Serial.print(o0, HEX); Serial.print(" ");
  Serial.print(o1, HEX); Serial.print(" ");
  Serial.print(o2, HEX); Serial.print(" ");
  Serial.println(o3, HEX);

  // Write block 0 with 0..255 repeating
  uint8_t r24 = sdCommand(24, 0, 0xFF);
  Serial.print("CMD24 R1=0x"); Serial.println(r24, HEX);
  SPI.transfer(0xFF);
  SPI.transfer(0xFE);
  for (int i = 0; i < 512; i++) SPI.transfer(i & 0xFF);
  SPI.transfer(0x12);
  SPI.transfer(0x34);
  uint8_t dr = SPI.transfer(0xFF);
  Serial.print("DATA_RESP=0x"); Serial.println(dr, HEX);

  // Read block 0
  uint8_t r17 = sdCommand(17, 0, 0xFF);
  Serial.print("CMD17 R1=0x"); Serial.println(r17, HEX);

  // wait for data token 0xFE
  for (int i = 0; i < 1000; i++) {
    uint8_t t = SPI.transfer(0xFF);
    if (t == 0xFE) {
      Serial.println("TOKEN=0xFE");
      break;
    }
  }

  // read first 16 bytes
  for (int i = 0; i < 16; i++) {
    uint8_t b = SPI.transfer(0xFF);
    Serial.print(b, HEX);
    Serial.print(i == 15 ? "\\n" : " ");
  }

  digitalWrite(SD_CS, HIGH);
}

void loop() {}
`;

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const hexText = await compileSketch(backendUrl, SKETCH, 'wokwi-arduino-uno');
  const runner = new AVRRunner(hexText);
  const serial = makeSerialCollector(runner.usart);

  const sd = new MicroSDCardDevice({
    cs: { port: runner.portB, bit: 2 },
  });

  attachSPIRouter({ cpu: runner.cpu, spi: runner.spi, devices: [sd] });

  const maxCycles = Math.floor(UNO_CPU_FREQUENCY_HZ * 1.2);
  runForCycles(runner, () => {}, maxCycles);

  console.log(serial.lines.join('\n'));

  const block0 = sd.getBlock(0);
  const ok =
    block0[0] === 0x00 &&
    block0[1] === 0x01 &&
    block0[2] === 0x02 &&
    block0[3] === 0x03 &&
    block0[4] === 0x04;

  if (ok) {
    console.log('PASS: MicroSD wrote/retained expected block[0..4] pattern.');
    process.exit(0);
  }

  console.log(
    `FAIL: MicroSD block 0 mismatch: ${Array.from(block0.slice(0, 8))
      .map((b) => '0x' + b.toString(16).padStart(2, '0'))
      .join(' ')}`
  );
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
