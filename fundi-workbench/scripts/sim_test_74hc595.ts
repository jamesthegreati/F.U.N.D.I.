/**
 * Headless Simulation Test: 74HC595 Shift Register
 * 
 * Tests the 74HC595 SIPO (Serial-In Parallel-Out) shift register emulator.
 * Shifts data through the register and latches to output pins.
 * 
 * Circuit:
 * - 74HC595 DS (data) -> Arduino D11
 * - 74HC595 SHCP (shift clock) -> Arduino D12
 * - 74HC595 STCP (latch clock) -> Arduino D8
 * - 74HC595 Q0-Q7 -> LEDs
 */

import {
  AVRRunner,
  compileSketch,
  DEFAULT_BACKEND_URL,
  makeSerialCollector,
  runForCycles,
  UNO_CPU_FREQUENCY_HZ,
} from './sim/harness';

import { ShiftRegister595 } from '../utils/simulation/shift-register-595';

const SKETCH = `
// 74HC595 Shift Register Test
const int DATA_PIN = 11;   // DS
const int CLOCK_PIN = 12;  // SHCP
const int LATCH_PIN = 8;   // STCP

void setup() {
  Serial.begin(9600);
  pinMode(DATA_PIN, OUTPUT);
  pinMode(CLOCK_PIN, OUTPUT);
  pinMode(LATCH_PIN, OUTPUT);
  
  Serial.println("74HC595 Shift Register Test");
  Serial.println("===========================");
}

void shiftOut595(byte data) {
  // Shift out 8 bits, MSB first
  for (int i = 7; i >= 0; i--) {
    // Set data bit
    digitalWrite(DATA_PIN, (data >> i) & 1);
    
    // Pulse clock
    digitalWrite(CLOCK_PIN, HIGH);
    delayMicroseconds(1);
    digitalWrite(CLOCK_PIN, LOW);
    delayMicroseconds(1);
  }
  
  // Latch the data
  digitalWrite(LATCH_PIN, HIGH);
  delayMicroseconds(1);
  digitalWrite(LATCH_PIN, LOW);
}

void loop() {
  // Test pattern 1: All on
  Serial.println("Pattern: 0xFF (all on)");
  shiftOut595(0xFF);
  delay(300);
  
  // Test pattern 2: Alternating
  Serial.println("Pattern: 0xAA (10101010)");
  shiftOut595(0xAA);
  delay(300);
  
  // Test pattern 3: Inverse alternating
  Serial.println("Pattern: 0x55 (01010101)");
  shiftOut595(0x55);
  delay(300);
  
  // Test pattern 4: Single bit
  Serial.println("Pattern: 0x01 (single bit)");
  shiftOut595(0x01);
  delay(300);
  
  // All off
  Serial.println("Pattern: 0x00 (all off)");
  shiftOut595(0x00);
  delay(500);
}
`;

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  
  const hexText = await compileSketch(backendUrl, SKETCH, 'wokwi-arduino-uno');
  const runner = new AVRRunner(hexText);
  const serial = makeSerialCollector(runner.usart);

  // Track output changes
  const outputValues: number[] = [];

  // Create 74HC595 device
  // D11 = PB3, D12 = PB4, D8 = PB0
  const sr = new ShiftRegister595({
    dsPort: runner.portB,
    dsBit: 3,      // D11 = PB3
    shcpPort: runner.portB,
    shcpBit: 4,    // D12 = PB4
    stcpPort: runner.portB,
    stcpBit: 0,    // D8 = PB0
    onOutputChange: (outputs) => {
      outputValues.push(outputs);
    },
  });

  // Run for ~3 seconds
  const maxCycles = Math.floor(UNO_CPU_FREQUENCY_HZ * 3);

  runForCycles(runner, () => {
    // Tick shift register
    sr.tick();
  }, maxCycles);

  // Output results
  console.log(serial.lines.join('\n'));
  console.log(`\n[SR] Total output changes: ${outputValues.length}`);
  console.log(`[SR] Output values: ${outputValues.slice(0, 20).map(v => '0x' + v.toString(16).padStart(2, '0')).join(', ')}`);
  console.log(`[SR] Unique patterns seen: ${new Set(outputValues).size}`);

  // Check for expected patterns
  const hasAllOn = outputValues.includes(0xFF);
  const hasAlternating = outputValues.includes(0xAA) || outputValues.includes(0x55);
  const hasMultiplePatterns = new Set(outputValues).size >= 3;

  if (hasAllOn && hasAlternating && hasMultiplePatterns) {
    console.log('PASS: 74HC595 shift register produces expected output patterns.');
    process.exit(0);
  } else {
    console.log('FAIL: 74HC595 shift register did not produce expected patterns.');
    console.log(`  hasAllOn=${hasAllOn}, hasAlternating=${hasAlternating}, hasMultiplePatterns=${hasMultiplePatterns}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
