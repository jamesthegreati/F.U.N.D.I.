/*
  Headless Featured Project test: Buzzer Melody Player

  Verifies:
  - tone() produces pin toggles on the buzzer pin
  - We can estimate a non-zero audible frequency from those toggles

  Note:
  - This test cannot "play audio" in Node (no WebAudio).
  - It validates the simulated electrical behavior needed for the UI audio layer.

  Usage:
    BACKEND_URL=http://localhost:8000 npm run sim:test:buzzer-melody
*/

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { PinState } from 'avr8js';

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

class PinToggleDetector {
  private lastHigh: boolean;
  private toggleCount = 0;

  constructor(
    private readonly runner: AVRRunner,
    private readonly port: 'B' | 'C' | 'D',
    private readonly bit: number
  ) {
    this.lastHigh = this.readHigh();
  }

  private readHigh(): boolean {
    const p = this.port === 'B' ? this.runner.portB : this.port === 'C' ? this.runner.portC : this.runner.portD;
    return p.pinState(this.bit) === PinState.High;
  }

  tick(): void {
    const high = this.readHigh();
    if (high !== this.lastHigh) {
      this.toggleCount++;
      this.lastHigh = high;
    }
  }

  flush(cpuFrequencyHz: number, cyclesWindow: number): { freqHz: number; toggles: number } {
    const toggles = this.toggleCount;
    this.toggleCount = 0;
    // Each full square-wave cycle has 2 toggles.
    const freqHz = toggles > 0 ? (toggles * cpuFrequencyHz) / (2 * cyclesWindow) : 0;
    return { freqHz, toggles };
  }
}

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const code = loadFeaturedProjectCode('buzzer-melody');

  const hexText = await compileSketch(backendUrl, code, 'wokwi-arduino-uno');
  const runner = new AVRRunner(hexText);
  const serial = makeSerialCollector(runner.usart);

  // Buzzer pin is Arduino D8 => Port B bit 0
  const detector = new PinToggleDetector(runner, 'B', 0);

  const cyclesPerWindow = Math.floor(UNO_CPU_FREQUENCY_HZ / 60);
  const windows = 180; // ~3 seconds

  const freqs: number[] = [];
  for (let i = 0; i < windows; i++) {
    const target = runner.cpu.cycles + cyclesPerWindow;
    runForCycles(runner, () => detector.tick(), target);
    const { freqHz, toggles } = detector.flush(UNO_CPU_FREQUENCY_HZ, cyclesPerWindow);
    if (toggles > 0 && freqHz > 20 && freqHz < 10_000) freqs.push(freqHz);
  }

  // eslint-disable-next-line no-console
  console.log(serial.lines.slice(0, 20).join('\n'));

  const sawAudible = freqs.length > 0;
  const sample = freqs.slice(0, 12).map((f) => Math.round(f));

  // eslint-disable-next-line no-console
  console.log('[BUZZ] audibleFrames=', freqs.length, 'sampleHz=', sample);

  if (!sawAudible) {
    throw new Error(`Buzzer test failed: no audible toggles detected. Serial: ${JSON.stringify(serial.lines.slice(0, 20))}`);
  }

  // eslint-disable-next-line no-console
  console.log('PASS: Buzzer pin toggles produce audible frequencies.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
