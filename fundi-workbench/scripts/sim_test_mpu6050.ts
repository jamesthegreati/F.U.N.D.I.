/**
 * Headless Simulation Test: MPU6050 (I2C)
 *
 * Verifies a minimal MPU6050 emulator:
 * - WHO_AM_I returns 0x68
 * - Data registers (ACCEL_XOUT..GYRO_ZOUT) return deterministic bytes
 */

import {
  AVRRunner,
  compileSketch,
  DEFAULT_BACKEND_URL,
  makeSerialCollector,
  runForCycles,
  UNO_CPU_FREQUENCY_HZ,
} from './sim/harness';

import { getMPU6050 } from '../utils/simulation/mpu6050';

const SKETCH = `
#include <Wire.h>

static const uint8_t MPU_ADDR = 0x68;

void writeReg(uint8_t reg, uint8_t val) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

uint8_t readReg(uint8_t reg) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, (uint8_t)1);
  if (Wire.available()) return Wire.read();
  return 0xFF;
}

void readBlock(uint8_t reg, uint8_t *buf, uint8_t len) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, len);
  for (uint8_t i = 0; i < len; i++) {
    buf[i] = Wire.available() ? Wire.read() : 0xFF;
  }
}

void setup() {
  Serial.begin(9600);
  Wire.begin();

  // Wake up (clear sleep bit)
  writeReg(0x6B, 0x00);

  uint8_t who = readReg(0x75);
  Serial.print("WHO_AM_I=0x");
  Serial.println(who, HEX);

  uint8_t data[14];
  readBlock(0x3B, data, 14);

  Serial.print("DATA=");
  for (int i = 0; i < 14; i++) {
    if (data[i] < 16) Serial.print('0');
    Serial.print(data[i], HEX);
    Serial.print(i == 13 ? "\\n" : " ");
  }
}

void loop() {}
`;

function parseHexByte(s: string): number {
  const t = s.trim();
  const v = Number.parseInt(t.startsWith('0x') ? t.slice(2) : t, 16);
  return Number.isFinite(v) ? (v & 0xff) : 0;
}

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const hexText = await compileSketch(backendUrl, SKETCH, 'wokwi-arduino-uno');
  const runner = new AVRRunner(hexText);
  const serial = makeSerialCollector(runner.usart);

  // Deterministic values:
  // ax=+0.5g => 0.5*16384=8192 => 0x2000
  // ay=-0.25g => -4096 => 0xF000
  // az=+1g => 16384 => 0x4000
  // tempC=25 => raw=(25-36.53)*340=-3920 => 0xF0B0 (approx)
  // gx=+10dps => 1310 => 0x051E
  // gy=0 => 0x0000
  // gz=-5dps => -655 => 0xFD71
  getMPU6050({
    address: 0x68,
    readValues: () => ({ ax: 0.5, ay: -0.25, az: 1, gx: 10, gy: 0, gz: -5, tempC: 25 }),
  });

  const maxCycles = Math.floor(UNO_CPU_FREQUENCY_HZ * 0.4);
  runForCycles(runner, () => {}, maxCycles);

  const out = serial.lines.join('\n');
  console.log(out);

  const whoLine = serial.lines.find((l) => l.startsWith('WHO_AM_I='));
  if (!whoLine) throw new Error('No WHO_AM_I output');
  const who = parseHexByte(whoLine.split('=')[1] ?? '00');
  if (who !== 0x68) {
    console.log(`FAIL: Expected WHO_AM_I=0x68, got 0x${who.toString(16).padStart(2, '0')}`);
    process.exit(1);
  }

  const dataLine = serial.lines.find((l) => l.startsWith('DATA='));
  if (!dataLine) throw new Error('No DATA output');
  const parts = dataLine
    .slice('DATA='.length)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length < 14) {
    console.log(`FAIL: Expected 14 data bytes, got ${parts.length}`);
    process.exit(1);
  }

  const bytes = parts.slice(0, 14).map(parseHexByte);

  const expect = [
    0x20,
    0x00, // AX = 0x2000
    0xf0,
    0x00, // AY = 0xF000
    0x40,
    0x00, // AZ = 0x4000
  ];

  for (let i = 0; i < expect.length; i++) {
    if (bytes[i] !== expect[i]) {
      console.log(
        `FAIL: Byte[${i}] expected 0x${expect[i].toString(16).padStart(2, '0')}, got 0x${bytes[i]
          .toString(16)
          .padStart(2, '0')}`
      );
      process.exit(1);
    }
  }

  console.log('PASS: MPU6050 WHO_AM_I and data registers are deterministic.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
