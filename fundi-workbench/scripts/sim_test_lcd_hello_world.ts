/*
  Headless Featured Project test: LCD Hello World (I2C)

  Verifies:
  - I2C traffic drives the LCD1602 emulator
  - The LCD display buffer contains expected text

  Usage:
    BACKEND_URL=http://localhost:8000 npm run sim:test:lcd-hello-world
*/

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getI2CBus } from '../utils/simulation/i2c';
import { getLCD1602, type LCD1602State } from '../utils/simulation/lcd1602';

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

function renderDisplay(state: LCD1602State): string[] {
  return state.display.map((row) => row.join(''));
}

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const code = loadFeaturedProjectCode('lcd-hello-world');

  const hexText = await compileSketch(backendUrl, code, 'wokwi-arduino-uno');
  const runner = new AVRRunner(hexText);

  const bus = getI2CBus();
  bus.resetAll();
  bus.clearLog();

  const lcd = getLCD1602(0x27);

  let lastState: LCD1602State | null = null;
  const unsub = lcd.subscribe((s: LCD1602State) => {
    lastState = s;
  });

  const serial = makeSerialCollector(runner.usart);

  // Run for ~3.2 seconds to allow setup + a couple counter updates.
  const maxCycles = Math.floor(UNO_CPU_FREQUENCY_HZ * 3.2);
  runForCycles(runner, () => {}, maxCycles);

  unsub();

  // Print serial (first few lines)
  for (const line of serial.lines.slice(0, 12)) {
    // eslint-disable-next-line no-console
    console.log(line);
  }

  if (lastState === null) {
    throw new Error('LCD state never initialized');
  }

  const lines = renderDisplay(lastState);
  // eslint-disable-next-line no-console
  console.log('[LCD] Line0:', JSON.stringify(lines[0]));
  // eslint-disable-next-line no-console
  console.log('[LCD] Line1:', JSON.stringify(lines[1]));

  const line0 = lines[0] ?? '';
  const line1 = lines[1] ?? '';

  const hasHello = /Hello/i.test(line0) && /FUNDI/i.test(line0);
  const hasCount = /Count:/i.test(line1);

  if (!hasHello || !hasCount) {
    const i2cLog = bus.getTransactionLog(40);
    throw new Error(
      `LCD test failed (hasHello=${hasHello}, hasCount=${hasCount}). Display: ${JSON.stringify(
        lines
      )}. Recent I2C tx: ${JSON.stringify(i2cLog)}`
    );
  }

  // eslint-disable-next-line no-console
  console.log('PASS: LCD display updated with expected text.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
