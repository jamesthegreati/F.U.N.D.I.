/*
  Shared headless simulation harness for FUNDI featured-project tests.

  - Compiles Arduino sketches via the FUNDI backend compile endpoint
  - Runs the compiled hex on avr8js
  - Provides helpers for serial capture and peripheral ticking
*/

import {
  AVRIOPort,
  AVRClock,
  AVRSPI,
  AVRTimer,
  AVRUSART,
  AVRTWI,
  AVRADC,
  CPU,
  avrInstruction,
  portBConfig,
  portCConfig,
  portDConfig,
  spiConfig,
  timer0Config,
  timer1Config,
  timer2Config,
  usart0Config,
  twiConfig,
  adcConfig,
  type TWIEventHandler,
} from 'avr8js';

import { getI2CBus } from '../../utils/simulation/i2c';

export const DEFAULT_BACKEND_URL = 'http://localhost:8000';
export const UNO_CPU_FREQUENCY_HZ = 16_000_000;

export function decodeBase64ToString(base64: string): string {
  const normalized = base64.trim();
  const binary = Buffer.from(normalized, 'base64');
  return new TextDecoder('utf-8').decode(binary);
}

export function looksLikeIntelHex(text: string): boolean {
  const t = text.trimStart();
  return t.startsWith(':');
}

export function parseIntelHex(hex: string): Uint16Array {
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

export class AVRRunner {
  readonly cpu: CPU;
  readonly portB: AVRIOPort;
  readonly portC: AVRIOPort;
  readonly portD: AVRIOPort;
  readonly clock: AVRClock;
  readonly spi: AVRSPI;
  readonly timer0: AVRTimer;
  readonly timer1: AVRTimer;
  readonly timer2: AVRTimer;
  readonly usart: AVRUSART;
  readonly twi: AVRTWI;
  readonly adc: AVRADC;

  constructor(hexText: string, cpuFrequencyHz: number = UNO_CPU_FREQUENCY_HZ) {
    const program = parseIntelHex(hexText);
    this.cpu = new CPU(program);
    this.portB = new AVRIOPort(this.cpu, portBConfig);
    this.portC = new AVRIOPort(this.cpu, portCConfig);
    this.portD = new AVRIOPort(this.cpu, portDConfig);
    this.clock = new AVRClock(this.cpu, cpuFrequencyHz);
    this.spi = new AVRSPI(this.cpu, spiConfig, cpuFrequencyHz);
    this.timer0 = new AVRTimer(this.cpu, timer0Config);
    this.timer1 = new AVRTimer(this.cpu, timer1Config);
    this.timer2 = new AVRTimer(this.cpu, timer2Config);
    this.usart = new AVRUSART(this.cpu, usart0Config, cpuFrequencyHz);
    this.twi = new AVRTWI(this.cpu, twiConfig, cpuFrequencyHz);
    this.adc = new AVRADC(this.cpu, adcConfig);

    this.twi.eventHandler = new I2CBusTwiEventHandler(this.twi);
  }
}

class I2CBusTwiEventHandler implements TWIEventHandler {
  constructor(private readonly twi: AVRTWI) {}

  start(): void {
    getI2CBus().start();
    this.twi.completeStart();
  }

  stop(): void {
    getI2CBus().stop();
    this.twi.completeStop();
  }

  connectToSlave(addr: number, write: boolean): void {
    const addressByte = ((addr & 0x7f) << 1) | (write ? 0 : 1);
    const ack = getI2CBus().writeByte(addressByte);
    this.twi.completeConnect(ack);
  }

  writeByte(value: number): void {
    const ack = getI2CBus().writeByte(value & 0xff);
    this.twi.completeWrite(ack);
  }

  readByte(ack: boolean): void {
    const value = getI2CBus().readByte(ack);
    this.twi.completeRead(value & 0xff);
  }
}

export async function compileSketch(
  backendUrl: string,
  code: string,
  board: string = 'wokwi-arduino-uno'
): Promise<string> {
  const res = await fetch(`${backendUrl}/api/v1/compile`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ code, board }),
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
  const hexText = decodeBase64ToString(data.hex);
  if (!looksLikeIntelHex(hexText)) {
    throw new Error('Backend returned non-IntelHex output');
  }
  return hexText;
}

export function makeSerialCollector(usart: AVRUSART): { lines: string[] } {
  const lines: string[] = [];
  let buf = '';
  usart.onByteTransmit = (byte: number) => {
    const char = String.fromCharCode(byte);
    buf += char;
    if (char === '\n') {
      const line = buf.trimEnd();
      buf = '';
      if (line) lines.push(line);
    }
  };
  return { lines };
}

export function runForCycles(
  runner: AVRRunner,
  tickPeripherals: (cycles: number) => void,
  maxCycles: number
): void {
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
