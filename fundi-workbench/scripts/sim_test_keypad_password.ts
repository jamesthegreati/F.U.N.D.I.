/*
  Headless Featured Project test: Keypad Password Lock

  Verifies:
  - Simulated key presses "1","2","3","4","#" are detected
  - Serial prints ACCESS GRANTED

  Usage:
    BACKEND_URL=http://localhost:8000 npm run sim:test:keypad-password
*/

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { KeypadDevice, findKeyPosition } from '../utils/simulation/keypad';

import {
  AVRRunner,
  compileSketch,
  DEFAULT_BACKEND_URL,
  makeSerialCollector,
  runForCycles,
  UNO_CPU_FREQUENCY_HZ,
} from './sim/harness';

type FeaturedProjectFile = { code: string };

type PressEvent = {
  label: string;
  startCycle: number;
  endCycle: number;
};

function loadFeaturedProjectCode(id: string): string {
  const filePath = join(process.cwd(), 'data', 'featured-projects', `${id}.json`);
  const raw = readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(raw) as FeaturedProjectFile;
  if (!parsed?.code) throw new Error(`Missing code in ${filePath}`);
  return parsed.code;
}

function secondsToCycles(seconds: number): number {
  return Math.floor(UNO_CPU_FREQUENCY_HZ * seconds);
}

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const code = loadFeaturedProjectCode('keypad-password');

  const hexText = await compileSketch(backendUrl, code, 'wokwi-arduino-uno');
  const runner = new AVRRunner(hexText);
  const serial = makeSerialCollector(runner.usart);

  // Wiring from featured project diagram:
  // Rows: 9,8,7,6 => (PB1, PB0, PD7, PD6)
  // Cols: 5,4,3,2 => (PD5, PD4, PD3, PD2)
  const keypad = new KeypadDevice({
    rowPorts: [
      { port: runner.portB, bit: 1 },
      { port: runner.portB, bit: 0 },
      { port: runner.portD, bit: 7 },
      { port: runner.portD, bit: 6 },
    ],
    colPorts: [
      { port: runner.portD, bit: 5 },
      { port: runner.portD, bit: 4 },
      { port: runner.portD, bit: 3 },
      { port: runner.portD, bit: 2 },
    ],
    getButtonState: (row, col) => {
      const now = runner.cpu.cycles;
      const active = pressSchedule.some((e) => now >= e.startCycle && now < e.endCycle && isKeyAt(row, col, e.label));
      return active;
    },
  });

  const isKeyAt = (row: number, col: number, label: string): boolean => {
    const pos = findKeyPosition(label);
    return !!pos && pos.row === row && pos.col === col;
  };

  const pressSchedule: PressEvent[] = [];

  // Build a schedule with presses spaced out enough for Keypad library debounce
  // and for the sketch's setup() to complete.
  // Each press: 250ms, gap: 250ms. Start after 600ms.
  const sequence = ['1', '2', '3', '4', '#'];
  const pressSeconds = 0.25;
  const gapSeconds = 0.25;
  let t = 0.6;
  for (const label of sequence) {
    const start = secondsToCycles(t);
    const end = secondsToCycles(t + pressSeconds);
    pressSchedule.push({ label, startCycle: start, endCycle: end });
    t += pressSeconds + gapSeconds;
  }

  // Run long enough to cover all presses + processing.
  const maxCycles = Math.floor(UNO_CPU_FREQUENCY_HZ * 4.0);
  runForCycles(runner, () => keypad.tick(), maxCycles);

  // eslint-disable-next-line no-console
  console.log(serial.lines.slice(0, 60).join('\n'));

  const sawGranted = serial.lines.some((l) => /ACCESS\s+GRANTED/i.test(l));
  if (!sawGranted) {
    throw new Error(`Keypad password test failed: did not observe ACCESS GRANTED. Lines: ${JSON.stringify(serial.lines.slice(0, 80))}`);
  }

  // eslint-disable-next-line no-console
  console.log('PASS: Keypad accepts password and grants access.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
