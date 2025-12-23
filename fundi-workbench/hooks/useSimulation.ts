'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AVRIOPort,
  AVRClock,
  AVRTimer,
  CPU,
  avrInstruction,
  portBConfig,
  portDConfig,
  timer0Config,
  type GPIOListener,
} from 'avr8js';

type PinStates = Record<number, boolean>;

function decodeBase64ToString(base64: string): string {
  const normalized = base64.trim();
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder('utf-8').decode(bytes);
}

function parseIntelHex(hex: string): Uint16Array {
  // Minimal Intel HEX parser with support for:
  // - 00: Data records
  // - 01: End of file
  // - 04: Extended linear address
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
  readonly portD: AVRIOPort;
  readonly clock: AVRClock;
  readonly timer0: AVRTimer;

  constructor(hexText: string) {
    const program = parseIntelHex(hexText);
    this.cpu = new CPU(program);
    this.portB = new AVRIOPort(this.cpu, portBConfig);
    this.portD = new AVRIOPort(this.cpu, portDConfig);

    // Provide basic Arduino timing (millis/delay rely on timer0 on Uno).
    this.clock = new AVRClock(this.cpu, 16_000_000);
    this.timer0 = new AVRTimer(this.cpu, timer0Config);
  }
}

export type UseSimulationControls = {
  run: () => void;
  stop: () => void;
  pause: () => void;
  isRunning: boolean;
  pinStates: PinStates;
};

function isAvrPart(partType: string): boolean {
  return (
    partType === 'wokwi-arduino-uno' ||
    partType === 'wokwi-arduino-nano' ||
    partType === 'wokwi-arduino-mega'
  );
}

export function useSimulation(hexData: string | null | undefined, partType: string): UseSimulationControls {
  const [isRunning, setIsRunning] = useState(false);
  const [pinStates, setPinStates] = useState<PinStates>({});

  const runnerRef = useRef<AVRRunner | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  const cyclesPerFrame = useMemo(() => Math.floor(16_000_000 / 60), []);

  const updatePortPins = useCallback((port: 'B' | 'D', value: number) => {
    setPinStates((prev) => {
      const next: PinStates = { ...prev };
      if (port === 'D') {
        // PORTD bits 0-7 -> Digital 0-7
        for (let bit = 0; bit < 8; bit++) {
          const pin = bit;
          next[pin] = (value & (1 << bit)) !== 0;
        }
      } else {
        // PORTB bits 0-5 -> Digital 8-13
        for (let bit = 0; bit < 6; bit++) {
          const pin = 8 + bit;
          next[pin] = (value & (1 << bit)) !== 0;
        }
      }
      return next;
    });
  }, []);

  const stepFrame = useCallback(() => {
    if (!runningRef.current) return;
    const runner = runnerRef.current;
    if (!runner) return;

    // Run ~16MHz/60fps CPU cycles each frame.
    let remaining = cyclesPerFrame;
    while (remaining > 0) {
      const before = runner.cpu.cycles;
      avrInstruction(runner.cpu);
      const delta = runner.cpu.cycles - before;
      remaining -= delta > 0 ? delta : 1;
    }

    rafRef.current = requestAnimationFrame(stepFrame);
  }, [cyclesPerFrame]);

  const stop = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);

    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    runnerRef.current = null;
    setPinStates({});
  }, []);

  const pause = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);

    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const run = useCallback(() => {
    if (!hexData) return;
    if (!isAvrPart(partType)) {
      // avr8js only simulates AVR8 cores; ESP32 is not supported here.
      return;
    }

    if (!runnerRef.current) {
      const hexText = decodeBase64ToString(hexData);
      const runner = new AVRRunner(hexText);

      const onPortB: GPIOListener = (value) => updatePortPins('B', value);
      const onPortD: GPIOListener = (value) => updatePortPins('D', value);
      runner.portB.addListener(onPortB);
      runner.portD.addListener(onPortD);

      // Initialize state from current registers
      updatePortPins('B', runner.cpu.data[portBConfig.PORT]);
      updatePortPins('D', runner.cpu.data[portDConfig.PORT]);

      runnerRef.current = runner;
    }

    if (runningRef.current) return;
    runningRef.current = true;
    setIsRunning(true);
    rafRef.current = requestAnimationFrame(stepFrame);
  }, [hexData, partType, stepFrame, updatePortPins]);

  useEffect(() => {
    // Reset simulation when program/target changes.
    stop();
  }, [hexData, partType, stop]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { run, stop, pause, isRunning, pinStates };
}
