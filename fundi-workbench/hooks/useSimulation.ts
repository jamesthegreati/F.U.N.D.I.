'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AVRIOPort,
  AVRClock,
  AVRTimer,
  AVRUSART,
  CPU,
  avrInstruction,
  portBConfig,
  portDConfig,
  timer0Config,
  usart0Config,
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
  readonly usart: AVRUSART;

  constructor(hexText: string) {
    const program = parseIntelHex(hexText);
    this.cpu = new CPU(program);
    this.portB = new AVRIOPort(this.cpu, portBConfig);
    this.portD = new AVRIOPort(this.cpu, portDConfig);

    // Provide basic Arduino timing (millis/delay rely on timer0 on Uno).
    this.clock = new AVRClock(this.cpu, 16_000_000);
    this.timer0 = new AVRTimer(this.cpu, timer0Config);

    // USART for Serial communication
    this.usart = new AVRUSART(this.cpu, usart0Config, 16_000_000);
  }
}

export type UseSimulationControls = {
  run: () => void;
  stop: () => void;
  pause: () => void;
  isRunning: boolean;
  pinStates: PinStates;
  serialOutput: string[];
  clearSerialOutput: () => void;
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
  const [serialOutput, setSerialOutput] = useState<string[]>([]);

  const runnerRef = useRef<AVRRunner | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const serialBufferRef = useRef<string>('');
  const stepFrameRef = useRef<() => void>(() => { });

  const cyclesPerFrame = useMemo(() => Math.floor(16_000_000 / 60), []);

  const clearSerialOutput = useCallback(() => {
    setSerialOutput([]);
    serialBufferRef.current = '';
  }, []);

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

  // Debug: Log pin state changes
  useEffect(() => {
    const activeStates = Object.entries(pinStates).filter(([, v]) => v);
    if (activeStates.length > 0) {
      console.log('[Simulation] Active pins (HIGH):', Object.fromEntries(activeStates));
    }
  }, [pinStates]);

  // Update the step function ref in an effect to avoid stale closure issues
  useEffect(() => {
    stepFrameRef.current = () => {
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

      rafRef.current = requestAnimationFrame(stepFrameRef.current);
    };
  }, [cyclesPerFrame]);

  const stepFrame = useCallback(() => {
    stepFrameRef.current();
  }, []);

  const stop = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);

    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    runnerRef.current = null;
    setPinStates({});
    setSerialOutput([]);
    serialBufferRef.current = '';
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
    console.log('[Simulation] Run requested', { hasHex: !!hexData, partType });
    if (!hexData) {
      console.warn('[Simulation] No HEX data available');
      return;
    }
    if (!isAvrPart(partType)) {
      console.warn('[Simulation] Unsupported part type for AVR simulation:', partType);
      // avr8js only simulates AVR8 cores; ESP32 is not supported here.
      return;
    }

    if (!runnerRef.current) {
      try {
        const hexText = decodeBase64ToString(hexData);
        const runner = new AVRRunner(hexText);

        const onPortB: GPIOListener = (value) => updatePortPins('B', value);
        const onPortD: GPIOListener = (value) => updatePortPins('D', value);
        runner.portB.addListener(onPortB);
        runner.portD.addListener(onPortD);

        // Listen for USART byte transmissions (Serial.print output)
        runner.usart.onByteTransmit = (byte: number) => {
          const char = String.fromCharCode(byte);
          serialBufferRef.current += char;

          // When we see a newline, flush the buffer as a new line
          if (char === '\n') {
            const line = serialBufferRef.current.trimEnd();
            if (line) {
              setSerialOutput((prev) => [...prev, line]);
            }
            serialBufferRef.current = '';
          }
        };

        // Initialize state from current registers
        updatePortPins('B', runner.cpu.data[portBConfig.PORT]);
        updatePortPins('D', runner.cpu.data[portDConfig.PORT]);

        runnerRef.current = runner;
        console.log('[Simulation] AVR Runner initialized successfully');
      } catch (err) {
        console.error('[Simulation] Failed to initialize AVR runner:', err);
        return;
      }
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

  return { run, stop, pause, isRunning, pinStates, serialOutput, clearSerialOutput };
}
