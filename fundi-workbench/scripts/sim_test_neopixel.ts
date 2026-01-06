/**
 * Headless Simulation Test: NeoPixel / WS2812
 *
 * Bit-bangs a WS2812 signal on an AVR pin and verifies the decoder produces
 * the expected RGB values (GRB wire order).
 */

import {
  AVRRunner,
  compileSketch,
  DEFAULT_BACKEND_URL,
  runForCycles,
  UNO_CPU_FREQUENCY_HZ,
} from './sim/harness';

import { WS2812Device } from '../utils/simulation/ws2812';

const SKETCH = `
#include <Arduino.h>
#include <util/delay_basic.h>

// Use D6 (PD6) for deterministic port writes
#define PIXEL_BIT 6

static inline void sendBit0() {
  PORTD |= _BV(PIXEL_BIT);
  _delay_loop_1(1); // short high
  PORTD &= ~_BV(PIXEL_BIT);
  _delay_loop_1(6); // longer low
}

static inline void sendBit1() {
  PORTD |= _BV(PIXEL_BIT);
  _delay_loop_1(3); // longer high
  PORTD &= ~_BV(PIXEL_BIT);
  _delay_loop_1(2); // short low
}

static inline void sendByte(uint8_t b) {
  for (int i = 7; i >= 0; i--) {
    if (b & (1 << i)) sendBit1();
    else sendBit0();
  }
}

static inline void sendPixel(uint8_t r, uint8_t g, uint8_t b) {
  // WS2812 wire order: GRB
  sendByte(g);
  sendByte(r);
  sendByte(b);
}

void setup() {
  DDRD |= _BV(PIXEL_BIT);
  PORTD &= ~_BV(PIXEL_BIT);

  // Send two pixels:
  // P0 = (r=0x12,g=0x34,b=0x56)
  // P1 = (r=0x9A,g=0xBC,b=0xDE)
  noInterrupts();
  sendPixel(0x12, 0x34, 0x56);
  sendPixel(0x9A, 0xBC, 0xDE);
  interrupts();

  // Latch
  delayMicroseconds(80);
}

void loop() {
  delay(1000);
}
`;

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const hexText = await compileSketch(backendUrl, SKETCH, 'wokwi-arduino-uno');

  const runner = new AVRRunner(hexText);

  const frames: Array<Array<{ r: number; g: number; b: number }>> = [];

  const dev = new WS2812Device({
    port: runner.portD,
    bit: 6, // Arduino D6 = PD6
    cpuFrequencyHz: UNO_CPU_FREQUENCY_HZ,
    pixels: 2,
    onFrame: (pixels) => {
      frames.push(pixels.map((p) => ({ ...p })));
    },
  });

  // Run long enough for setup() to execute and for latch low period to be observed.
  const maxCycles = Math.floor(UNO_CPU_FREQUENCY_HZ * 0.05);

  runForCycles(runner, (cycles) => {
    dev.tick(cycles);
  }, maxCycles);

  const frame = frames[0];
  if (!frame) {
    console.log('FAIL: No WS2812 frame decoded.');
    process.exit(1);
  }

  const expected = [
    { r: 0x12, g: 0x34, b: 0x56 },
    { r: 0x9a, g: 0xbc, b: 0xde },
  ];

  const pass =
    frame.length >= 2 &&
    expected.every((e, i) => frame[i].r === e.r && frame[i].g === e.g && frame[i].b === e.b);

  console.log('[WS2812] Decoded frame:', frame);

  if (pass) {
    console.log('PASS: WS2812 decoder produced expected RGB values.');
    process.exit(0);
  }

  console.log('FAIL: WS2812 decoded colors mismatch.');
  console.log('Expected:', expected);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
