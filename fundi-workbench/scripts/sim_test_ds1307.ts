/**
 * Headless Simulation Test: DS1307 RTC (Real-Time Clock)
 * 
 * Tests the DS1307 I2C RTC emulator.
 * Reads time from the RTC via I2C and displays it.
 * 
 * Circuit:
 * - DS1307 SDA -> Arduino A4 (SDA)
 * - DS1307 SCL -> Arduino A5 (SCL)
 */

import {
  AVRRunner,
  compileSketch,
  DEFAULT_BACKEND_URL,
  makeSerialCollector,
  runForCycles,
  UNO_CPU_FREQUENCY_HZ,
} from './sim/harness';

import { getDS1307, resetDS1307 } from '../utils/simulation/ds1307';
import { getI2CBus } from '../utils/simulation/i2c';

const SKETCH = `
#include <Wire.h>

#define DS1307_ADDRESS 0x68

void setup() {
  Serial.begin(9600);
  Wire.begin();
  Serial.println("DS1307 RTC Test");
  Serial.println("===============");
}

void readTime() {
  Wire.beginTransmission(DS1307_ADDRESS);
  Wire.write(0); // Start at register 0
  Wire.endTransmission();
  
  Wire.requestFrom(DS1307_ADDRESS, 7);
  
  if (Wire.available() >= 7) {
    byte seconds = bcdToDec(Wire.read() & 0x7F);
    byte minutes = bcdToDec(Wire.read());
    byte hours = bcdToDec(Wire.read() & 0x3F);
    byte dayOfWeek = Wire.read();
    byte day = bcdToDec(Wire.read());
    byte month = bcdToDec(Wire.read());
    byte year = bcdToDec(Wire.read());
    
    Serial.print("Time: ");
    if (hours < 10) Serial.print("0");
    Serial.print(hours);
    Serial.print(":");
    if (minutes < 10) Serial.print("0");
    Serial.print(minutes);
    Serial.print(":");
    if (seconds < 10) Serial.print("0");
    Serial.println(seconds);
    
    Serial.print("Date: ");
    Serial.print(day);
    Serial.print("/");
    Serial.print(month);
    Serial.print("/20");
    Serial.println(year);
    
    Serial.println("RTC read successful!");
  } else {
    Serial.println("RTC read failed!");
  }
}

byte bcdToDec(byte val) {
  return ((val / 16) * 10) + (val % 16);
}

void loop() {
  readTime();
  delay(2000);
}
`;

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  
  // Reset I2C bus and DS1307 before test
  getI2CBus().resetAll();
  getI2CBus().clearLog();
  resetDS1307();
  
  const hexText = await compileSketch(backendUrl, SKETCH, 'wokwi-arduino-uno');
  const runner = new AVRRunner(hexText);
  const serial = makeSerialCollector(runner.usart);

  // Initialize DS1307 with a known time
  getDS1307({ initTime: '2025-01-04T14:30:45' });

  // Run for ~3 seconds
  const maxCycles = Math.floor(UNO_CPU_FREQUENCY_HZ * 3);

  runForCycles(runner, () => {
    // No custom peripherals to tick - I2C is handled by harness
  }, maxCycles);

  // Output results
  console.log(serial.lines.join('\n'));

  // Verify test results
  const hasTime = serial.lines.some(line => line.includes('Time:'));
  const hasDate = serial.lines.some(line => line.includes('Date:'));
  const hasSuccess = serial.lines.some(line => line.includes('RTC read successful'));

  // Expect the configured time/date to come back.
  const sawExpectedTime = serial.lines.some((line) => line.includes('Time: 14:30:45'));
  const sawExpectedDate = serial.lines.some((line) => line.includes('Date: 4/1/2025'));

  console.log(`\n[DS1307] Time line found: ${hasTime}`);
  console.log(`[DS1307] Date line found: ${hasDate}`);
  console.log(`[DS1307] Success message: ${hasSuccess}`);
  console.log(`[DS1307] Expected time seen: ${sawExpectedTime}`);
  console.log(`[DS1307] Expected date seen: ${sawExpectedDate}`);

  if (hasTime && hasDate && hasSuccess && sawExpectedTime && sawExpectedDate) {
    console.log('PASS: DS1307 RTC reads time correctly via I2C.');
    process.exit(0);
  } else {
    console.log('FAIL: DS1307 RTC did not read time correctly.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
