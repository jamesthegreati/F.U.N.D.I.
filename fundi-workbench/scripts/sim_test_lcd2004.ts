/*
  Headless test: LCD2004 (20x4, I2C)

  Verifies:
  - I2C traffic drives the LCD2004 emulator
  - All four rows update and retain expected text

  Usage:
    BACKEND_URL=http://localhost:8000 npm run sim:test:lcd2004
*/

import { getI2CBus } from '../utils/simulation/i2c';
import { getLCD2004, type LCD1602State } from '../utils/simulation/lcd1602';
import {
  AVRRunner,
  compileSketch,
  DEFAULT_BACKEND_URL,
  runForCycles,
  UNO_CPU_FREQUENCY_HZ,
} from './sim/harness';

function renderDisplay(state: LCD1602State): string[] {
  return state.display.map((row) => row.join(''));
}

const code = `
#include <Wire.h>

static const uint8_t LCD_ADDR = 0x27;
static const uint8_t BL = 0x08;
static const uint8_t EN = 0x04;
static const uint8_t RS = 0x01;

void expanderWrite(uint8_t data) {
  Wire.beginTransmission(LCD_ADDR);
  Wire.write(data | BL);
  Wire.endTransmission();
}

void pulseEnable(uint8_t data) {
  expanderWrite(data | EN);
  delayMicroseconds(1);
  expanderWrite(data & ~EN);
  delayMicroseconds(50);
}

void write4bits(uint8_t value, uint8_t mode) {
  uint8_t data = (value & 0xF0) | mode;
  expanderWrite(data);
  pulseEnable(data);
}

void sendByte(uint8_t value, uint8_t mode) {
  write4bits(value & 0xF0, mode);
  write4bits((value << 4) & 0xF0, mode);
}

void command(uint8_t value) {
  sendByte(value, 0x00);
}

void writeChar(uint8_t value) {
  sendByte(value, RS);
}

void printText(const char* s) {
  while (*s) {
    writeChar((uint8_t)*s++);
  }
}

void setup() {
  Wire.begin();
  delay(50);

  command(0x28); // 4-bit, 2-line mode command (commonly used, accepted by emulator)
  command(0x0C); // Display on
  command(0x06); // Entry mode set
  command(0x01); // Clear
  delay(2);

  command(0x80); // Row 0
  printText("Line1: FUNDI");

  command(0xC0); // Row 1
  printText("Line2: LCD2004");

  command(0x94); // Row 2 (20x4 DDRAM)
  printText("Line3: Sim OK");

  command(0xD4); // Row 3 (20x4 DDRAM)
  printText("Line4: Ready");
}

void loop() {}
`;

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const hexText = await compileSketch(backendUrl, code, 'wokwi-arduino-uno');
  const runner = new AVRRunner(hexText);

  const bus = getI2CBus();
  bus.resetAll();
  bus.clearLog();

  const lcd = getLCD2004(0x27);

  let lastState: LCD1602State | null = null;
  const unsub = lcd.subscribe((state: LCD1602State) => {
    lastState = state;
  });

  runForCycles(runner, () => {}, Math.floor(UNO_CPU_FREQUENCY_HZ * 0.7));
  unsub();

  if (lastState === null) {
    throw new Error('LCD2004 state never initialized');
  }

  const lines = renderDisplay(lastState);
  // eslint-disable-next-line no-console
  console.log('[LCD2004] Line0:', JSON.stringify(lines[0] ?? ''));
  // eslint-disable-next-line no-console
  console.log('[LCD2004] Line1:', JSON.stringify(lines[1] ?? ''));
  // eslint-disable-next-line no-console
  console.log('[LCD2004] Line2:', JSON.stringify(lines[2] ?? ''));
  // eslint-disable-next-line no-console
  console.log('[LCD2004] Line3:', JSON.stringify(lines[3] ?? ''));

  const checks = [
    (lines[0] ?? '').includes('Line1: FUNDI'),
    (lines[1] ?? '').includes('Line2: LCD2004'),
    (lines[2] ?? '').includes('Line3: Sim OK'),
    (lines[3] ?? '').includes('Line4: Ready'),
  ];

  if (checks.some((x) => !x)) {
    const i2cLog = bus.getTransactionLog(60);
    throw new Error(
      `LCD2004 test failed checks=${JSON.stringify(checks)} display=${JSON.stringify(
        lines
      )} i2c=${JSON.stringify(i2cLog)}`
    );
  }

  // eslint-disable-next-line no-console
  console.log('PASS: LCD2004 renders all four rows correctly.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
