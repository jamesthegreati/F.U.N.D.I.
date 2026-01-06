/*
  Headless Featured Project test: Button & LED

  Verifies:
  - Pressing the button pulls D2 LOW (INPUT_PULLUP)
  - Serial prints "Button PRESSED" at least once

  Usage:
    BACKEND_URL=http://localhost:8000 npm run sim:test:button-led
*/

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  AVRRunner,
  compileSketch,
  DEFAULT_BACKEND_URL,
  makeSerialCollector,
  runForCycles,
  UNO_CPU_FREQUENCY_HZ,
} from './sim/harness';

type FeaturedProjectFile = { code: string };

function loadFeaturedProjectCode(id: string): string {
  const filePath = join(process.cwd(), 'data', 'featured-projects', `${id}.json`);
  const raw = readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(raw) as FeaturedProjectFile;
  if (!parsed?.code) throw new Error(`Missing code in ${filePath}`);
  return parsed.code;
}

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const code = loadFeaturedProjectCode('button-led');

  const hexText = await compileSketch(backendUrl, code, 'wokwi-arduino-uno');
  const runner = new AVRRunner(hexText);
  const serial = makeSerialCollector(runner.usart);

  // D2 is Port D bit 2 (button input, INPUT_PULLUP). Default: not pressed => HIGH.
  runner.portD.setPin(2, true);

  const runSeconds = (s: number) => {
    const target = runner.cpu.cycles + Math.floor(UNO_CPU_FREQUENCY_HZ * s);
    runForCycles(runner, () => {}, target);
  };

  // Let setup finish a bit.
  runSeconds(0.15);

  // Press button for a while.
  runner.portD.setPin(2, false);
  runSeconds(0.35);

  // Release.
  runner.portD.setPin(2, true);
  runSeconds(0.1);

  // eslint-disable-next-line no-console
  console.log(serial.lines.slice(0, 30).join('\n'));

  const sawPressed = serial.lines.some((l) => /Button\s+PRESSED/i.test(l));
  if (!sawPressed) {
    throw new Error(`Button & LED test failed: did not observe pressed message. Lines: ${JSON.stringify(serial.lines.slice(0, 40))}`);
  }

  // eslint-disable-next-line no-console
  console.log('PASS: Button press detected via serial.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
