/*
  Headless DHT22 simulation smoke test.

  - Compiles a small Arduino sketch via the FUNDI backend compile endpoint
  - Runs the compiled hex on avr8js
  - Attaches the DHTDevice to Arduino Uno D2 (PD2)
  - Verifies we get non-error serial output

  Usage:
    npm run stack:backend
    npm run sim:test:dht22

  Env:
    BACKEND_URL=http://localhost:8000
*/

import {
  AVRIOPort,
  AVRClock,
  AVRTimer,
  AVRUSART,
  CPU,
  avrInstruction,
  portBConfig,
  portCConfig,
  portDConfig,
  timer0Config,
  usart0Config,
} from 'avr8js';

import { DHTDevice } from '../utils/simulation/dht';

const DEFAULT_BACKEND_URL = 'http://localhost:8000';
const CPU_FREQUENCY_HZ = 16_000_000;

function decodeBase64ToString(base64: string): string {
  const normalized = base64.trim();
  const binary = Buffer.from(normalized, 'base64');
  return new TextDecoder('utf-8').decode(binary);
}

function looksLikeIntelHex(text: string): boolean {
  const t = text.trimStart();
  return t.startsWith(':');
}

function parseIntelHex(hex: string): Uint16Array {
  let upper = 0;
  const mem = new Map<number, number>();
  let maxAddr = 0;

  const lines = hex.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || !line.startsWith(':')) continue;

    const byteCount = Number.parseInt(line.slice(1, 3), 16);
    const addr16 = Number.parseInt(line.slice(3, 7), 16);
    const recordType = Number.parseInt(line.slice(7, 9), 16);
    const data = line.slice(9, 9 + byteCount * 2);

    if (recordType === 0x00) {
      const base = (upper << 16) + addr16;
      for (let i = 0; i < byteCount; i++) {
        const b = Number.parseInt(data.slice(i * 2, i * 2 + 2), 16);
        const addr = base + i;
        mem.set(addr, b);
        if (addr + 1 > maxAddr) maxAddr = addr + 1;
      }
    } else if (recordType === 0x01) {
      break;
    } else if (recordType === 0x04) {
      upper = Number.parseInt(data, 16);
    }
  }

  const byteLength = maxAddr % 2 === 0 ? maxAddr : maxAddr + 1;
  const progBytes = new Uint8Array(byteLength);
  for (const [addr, value] of mem.entries()) {
    if (addr >= 0 && addr < progBytes.length) progBytes[addr] = value;
  }

  const words = new Uint16Array(progBytes.length / 2);
  for (let i = 0; i < words.length; i++) {
    const lo = progBytes[i * 2];
    const hi = progBytes[i * 2 + 1];
    words[i] = lo | (hi << 8);
  }
  return words;
}

class AVRRunner {
  readonly cpu: CPU;
  readonly portB: AVRIOPort;
  readonly portC: AVRIOPort;
  readonly portD: AVRIOPort;
  readonly clock: AVRClock;
  readonly timer0: AVRTimer;
  readonly usart: AVRUSART;

  constructor(hexText: string) {
    const program = parseIntelHex(hexText);
    this.cpu = new CPU(program);
    this.portB = new AVRIOPort(this.cpu, portBConfig);
    this.portC = new AVRIOPort(this.cpu, portCConfig);
    this.portD = new AVRIOPort(this.cpu, portDConfig);
    this.clock = new AVRClock(this.cpu, CPU_FREQUENCY_HZ);
    this.timer0 = new AVRTimer(this.cpu, timer0Config);
    this.usart = new AVRUSART(this.cpu, usart0Config, CPU_FREQUENCY_HZ);
  }
}

async function compileSketch(backendUrl: string, code: string): Promise<string> {
  const res = await fetch(`${backendUrl}/api/v1/compile`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ code, board: 'wokwi-arduino-uno' }),
  });

  const data = (await res.json()) as {
    success?: boolean;
    hex?: string;
    [key: string]: unknown;
  };
  if (!res.ok) {
    throw new Error(`Compile failed (${res.status}): ${JSON.stringify(data)}`);
  }
  if (!data?.success || typeof data?.hex !== 'string') {
    throw new Error(`Compile did not return hex: ${JSON.stringify(data)}`);
  }
  return data.hex as string;
}

function runForCycles(runner: AVRRunner, tickPeripherals: (cycles: number) => void, maxCycles: number): void {
  const cpuAny = runner.cpu as unknown as {
    cycles: number;
    tick: () => void;
    nextClockEvent: { cycles: number } | null;
    nextInterrupt: number;
    interruptsEnabled: boolean;
  };

  while (runner.cpu.cycles < maxCycles) {
    const before = runner.cpu.cycles;
    avrInstruction(runner.cpu);

    tickPeripherals(runner.cpu.cycles);

    for (let i = 0; i < 32; i++) {
      const dueEvent = cpuAny.nextClockEvent && cpuAny.nextClockEvent.cycles <= cpuAny.cycles;
      const dueInterrupt = cpuAny.interruptsEnabled && cpuAny.nextInterrupt >= 0;
      if (!dueEvent && !dueInterrupt) break;
      cpuAny.tick();
    }

    const delta = runner.cpu.cycles - before;
    if (delta <= 0) runner.cpu.cycles++;
  }
}

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;

  const code = `
#include <DHT.h>

#define DHT_PIN 2
#define DHT_TYPE DHT22

DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(9600);
  Serial.println("DHT22 test");
  dht.begin();
}

void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (isnan(h) || isnan(t)) {
    Serial.println("ERR");
  } else {
    Serial.print("H=");
    Serial.print(h);
    Serial.print(" T=");
    Serial.println(t);
  }
  delay(200);
}
`;

  const hexBase64 = await compileSketch(backendUrl, code);
  const hexText = decodeBase64ToString(hexBase64);

  if (!looksLikeIntelHex(hexText)) {
    throw new Error('Backend returned non-IntelHex output');
  }

  const runner = new AVRRunner(hexText);

  const serialLines: string[] = [];
  let serialBuf = '';
  runner.usart.onByteTransmit = (byte: number) => {
    const char = String.fromCharCode(byte);
    serialBuf += char;
    if (char === '\n') {
      const line = serialBuf.trimEnd();
      serialBuf = '';
      if (line) serialLines.push(line);
    }
  };

  // DHT22 on Arduino Uno D2 => Port D, bit 2
  const dht = new DHTDevice({
    type: 'dht22',
    port: runner.portD,
    bit: 2,
    cpuFrequencyHz: CPU_FREQUENCY_HZ,
    readValues: () => ({ temperatureC: 25, humidity: 50 }),
  });

  // Run up to ~1.2s of simulated time, stop early once we see a valid reading.
  const maxCycles = Math.floor(CPU_FREQUENCY_HZ * 1.2);

  for (let chunk = 0; chunk < 12; chunk++) {
    const target = Math.min(maxCycles, runner.cpu.cycles + Math.floor(CPU_FREQUENCY_HZ * 0.1));
    runForCycles(runner, (cycles) => dht.tick(cycles), target);

    if (serialLines.some((l) => l.startsWith('H='))) break;
  }

  // Print what we got
  for (const line of serialLines.slice(0, 20)) {
    // eslint-disable-next-line no-console
    console.log(line);
  }

  const hasReading = serialLines.some((l) => l.startsWith('H='));
  const hasErr = serialLines.some((l) => l === 'ERR');

  if (!hasReading || hasErr) {
    throw new Error(`DHT22 sim test failed (hasReading=${hasReading}, hasErr=${hasErr}). Lines: ${JSON.stringify(serialLines.slice(0, 20))}`);
  }

  // eslint-disable-next-line no-console
  console.log('PASS: DHT22 produced valid readings.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
