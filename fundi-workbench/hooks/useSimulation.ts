'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AVRIOPort,
  AVRTWI,
  twiConfig,
  type TWIEventHandler,
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

import { useAppStore } from '@/store/useAppStore';
import { getI2CBus } from '@/utils/simulation/i2c';
import { getLCD1602 } from '@/utils/simulation/lcd1602';
import { getSSD1306 } from '@/utils/simulation/ssd1306';
import { DHTDevice, type DHTType } from '@/utils/simulation/dht';

type PinStates = Record<number, boolean>;

function decodeBase64ToBytes(base64: string): Uint8Array {
  const normalized = base64.trim();
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function decodeBase64ToString(base64: string): string {
  return new TextDecoder('utf-8').decode(decodeBase64ToBytes(base64));
}

function looksLikeIntelHex(text: string): boolean {
  // Intel HEX files are text lines starting with ':'
  const t = text.trimStart();
  return t.startsWith(':');
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
  readonly twi: AVRTWI;

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

    // TWI (I2C) for Wire library support
    this.twi = new AVRTWI(this.cpu, twiConfig, 16_000_000);

    // Bridge avr8js TWI transactions to our simulated I2C bus.
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
    // In I2C, R/W bit: 0=write, 1=read
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

type CircuitPart = { id: string; type: string; attrs?: Record<string, unknown> };
type CircuitConnection = { from: { partId: string; pinId: string }; to: { partId: string; pinId: string } };

function parseI2CAddress(attr: unknown, fallback: number): number {
  if (typeof attr === 'number' && Number.isFinite(attr)) return attr;
  if (typeof attr !== 'string') return fallback;
  const t = attr.trim();
  // supports "0x27" and "39"
  const parsed = t.startsWith('0x') ? Number.parseInt(t.slice(2), 16) : Number.parseInt(t, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildAdjacency(connections: CircuitConnection[]): Map<string, Set<string>> {
  const adjacency = new Map<string, Set<string>>();
  const keyOf = (partId: string, pinId: string) => `${partId}:${pinId}`;
  for (const conn of connections) {
    const a = keyOf(conn.from.partId, conn.from.pinId);
    const b = keyOf(conn.to.partId, conn.to.pinId);
    if (!adjacency.has(a)) adjacency.set(a, new Set());
    if (!adjacency.has(b)) adjacency.set(b, new Set());
    adjacency.get(a)!.add(b);
    adjacency.get(b)!.add(a);
  }
  return adjacency;
}

function findConnectedMcuDigitalPin(
  adjacency: Map<string, Set<string>>,
  startKey: string,
  mcuId: string
): number | null {
  const queue: string[] = [startKey];
  const seen = new Set<string>(queue);
  while (queue.length) {
    const cur = queue.shift()!;
    const idx = cur.indexOf(':');
    if (idx > 0) {
      const partId = cur.slice(0, idx);
      const pinId = cur.slice(idx + 1);
      if (partId === mcuId && /^\d+$/.test(pinId)) {
        const n = Number.parseInt(pinId, 10);
        return Number.isFinite(n) ? n : null;
      }
    }

    const neighbors = adjacency.get(cur);
    if (!neighbors) continue;
    for (const n of neighbors) {
      if (!seen.has(n)) {
        seen.add(n);
        queue.push(n);
      }
    }
  }
  return null;
}

function getPortBitForArduinoDigitalPin(runner: AVRRunner, pin: number): { port: AVRIOPort; bit: number } | null {
  if (pin >= 0 && pin <= 7) return { port: runner.portD, bit: pin };
  if (pin >= 8 && pin <= 13) return { port: runner.portB, bit: pin - 8 };
  return null;
}

// PWM state for analog output (0-255 duty cycle)
type PwmStates = Record<number, number>;

export type UseSimulationControls = {
  run: () => void;
  stop: () => void;
  pause: () => void;
  isRunning: boolean;
  pinStates: PinStates;
  pwmStates: PwmStates;
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

// Arduino Uno PWM pins and their timer/OCR register mappings
const PWM_PIN_CONFIGS: Record<number, { timer: string; ocrOffset: number }> = {
  3: { timer: 'timer2', ocrOffset: 0xB4 },  // OC2B - OCR2B
  5: { timer: 'timer0', ocrOffset: 0x47 },  // OC0B - OCR0B
  6: { timer: 'timer0', ocrOffset: 0x47 },  // OC0A - OCR0A (note: shares with 5)
  9: { timer: 'timer1', ocrOffset: 0x88 },  // OC1A - OCR1AL
  10: { timer: 'timer1', ocrOffset: 0x8A }, // OC1B - OCR1BL
  11: { timer: 'timer2', ocrOffset: 0xB3 }, // OC2A - OCR2A
};

export function useSimulation(hexData: string | null | undefined, partType: string): UseSimulationControls {
  const circuitParts = useAppStore((s) => s.circuitParts) as unknown as CircuitPart[];
  const connections = useAppStore((s) => s.connections) as unknown as CircuitConnection[];

  const [isRunning, setIsRunning] = useState(false);
  const [pinStates, setPinStates] = useState<PinStates>({});
  const [pwmStates, setPwmStates] = useState<PwmStates>({});
  const [serialOutput, setSerialOutput] = useState<string[]>([]);

  const runnerRef = useRef<AVRRunner | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const serialBufferRef = useRef<string>('');
  const stepFrameRef = useRef<() => void>(() => { });

  const dhtDevicesRef = useRef<DHTDevice[]>([]);

  const cyclesPerFrame = useMemo(() => Math.floor(16_000_000 / 60), []);

  const clearSerialOutput = useCallback(() => {
    setSerialOutput([]);
    serialBufferRef.current = '';
  }, []);

  const appendSerialLine = useCallback((line: string) => {
    if (!line) return;
    setSerialOutput((prev) => [...prev, line]);
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

  // Read PWM duty cycle values from timer OCR registers
  const updatePwmStates = useCallback((runner: AVRRunner) => {
    setPwmStates((prev) => {
      const next: PwmStates = { ...prev };
      // Read OCR values for PWM pins
      // Pin 3: OC2B - OCR2B at 0xB4
      // Pin 5: OC0B - OCR0B at 0x48
      // Pin 6: OC0A - OCR0A at 0x47
      // Pin 9: OC1A - OCR1AL at 0x88
      // Pin 10: OC1B - OCR1BL at 0x8A
      // Pin 11: OC2A - OCR2A at 0xB3
      try {
        const data = runner.cpu.data;
        next[3] = data[0xB4] ?? 0;   // OCR2B
        next[5] = data[0x48] ?? 0;   // OCR0B
        next[6] = data[0x47] ?? 0;   // OCR0A
        next[9] = data[0x88] ?? 0;   // OCR1AL (low byte)
        next[10] = data[0x8A] ?? 0;  // OCR1BL (low byte)
        next[11] = data[0xB3] ?? 0;  // OCR2A
      } catch {
        // Ignore errors reading CPU data
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

        // Tick protocol-level input devices that depend on tight timing.
        for (const dht of dhtDevicesRef.current) {
          dht.tick(runner.cpu.cycles);
        }

        // Process timers/USART clock events and interrupts.
        // Without ticking, Arduino time functions (millis/delay) and Serial output won't work.
        const cpuAny = runner.cpu as unknown as {
          cycles: number;
          tick: () => void;
          nextClockEvent: { cycles: number } | null;
          nextInterrupt: number;
          interruptsEnabled: boolean;
        };

        // Drain due clock events/interrupts for the current cycle.
        // Safety cap avoids infinite loops if a peripheral misbehaves.
        for (let i = 0; i < 32; i++) {
          const dueEvent = cpuAny.nextClockEvent && cpuAny.nextClockEvent.cycles <= cpuAny.cycles;
          const dueInterrupt = cpuAny.interruptsEnabled && cpuAny.nextInterrupt >= 0;
          if (!dueEvent && !dueInterrupt) break;
          cpuAny.tick();
        }

        const delta = runner.cpu.cycles - before;
        remaining -= delta > 0 ? delta : 1;
      }

      // Update PWM states once per frame (not every instruction)
      updatePwmStates(runner);

      rafRef.current = requestAnimationFrame(stepFrameRef.current);
    };
  }, [cyclesPerFrame, updatePwmStates]);

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
    dhtDevicesRef.current = [];
    // Reset I2C devices/bus state between runs.
    try {
      const bus = getI2CBus();
      bus.resetAll();
      bus.clearLog();
    } catch {
      // Ignore reset errors
    }
    setPinStates({});
    setPwmStates({});
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
      appendSerialLine('[Simulation] No compiled program available. Click Run to compile first.');
      return;
    }
    if (!isAvrPart(partType)) {
      console.warn('[Simulation] Unsupported part type for AVR simulation:', partType);
      // avr8js only simulates AVR8 cores; ESP32 is not supported here.
      appendSerialLine(
        `[Simulation] Board '${partType}' is not supported by the in-browser simulator (AVR only: Uno/Nano/Mega).`
      );
      return;
    }

    if (!runnerRef.current) {
      try {
        let decodedText: string;
        try {
          decodedText = decodeBase64ToString(hexData);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.error('[Simulation] Base64 decode failed:', msg);
          appendSerialLine(`[Simulation] Failed to decode compiled artifact: ${msg}`);
          return;
        }

        if (!looksLikeIntelHex(decodedText)) {
          // When compiling for non-AVR targets, the backend returns a binary (.bin) artifact.
          // Even if the board string is AVR, this provides a clear signal to the user.
          console.warn('[Simulation] Decoded artifact is not Intel HEX.');
          appendSerialLine(
            '[Simulation] Compiled output is not an Intel HEX file. Browser simulation currently supports AVR boards only.'
          );
          return;
        }

        const hexText = decodedText;
        const runner = new AVRRunner(hexText);

        // Initialize simulated peripherals for the current circuit.
        try {
          const bus = getI2CBus();
          bus.resetAll();
          bus.clearLog();

          // Instantiate I2C output devices so they can receive Wire traffic.
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            const attrs = part.attrs ?? {};

            if (typeLower.includes('lcd1602')) {
              const addr = parseI2CAddress((attrs as any).i2cAddress ?? (attrs as any).address, 0x27);
              getLCD1602(addr);
            }

            if (typeLower.includes('ssd1306') || typeLower.includes('oled')) {
              const addr = parseI2CAddress((attrs as any).i2cAddress ?? (attrs as any).address, 0x3c);
              getSSD1306(addr);
            }
          }

          // Instantiate DHT input devices and bind them to the MCU pin they are wired to.
          dhtDevicesRef.current = [];
          const mcuPart = circuitParts.find((p) => p.type === partType);
          if (mcuPart) {
            const adjacency = buildAdjacency(connections);

            for (const part of circuitParts) {
              const typeLower = part.type.toLowerCase();
              if (!typeLower.includes('dht')) continue;

              const dhtType: DHTType = typeLower.includes('dht11') ? 'dht11' : 'dht22';
              const startKey = `${part.id}:SDA`;
              const pin = findConnectedMcuDigitalPin(adjacency, startKey, mcuPart.id);
              if (pin == null) continue;

              const portBit = getPortBitForArduinoDigitalPin(runner, pin);
              if (!portBit) continue;

              const partId = part.id;
              dhtDevicesRef.current.push(
                new DHTDevice({
                  type: dhtType,
                  port: portBit.port,
                  bit: portBit.bit,
                  cpuFrequencyHz: 16_000_000,
                  readValues: () => {
                    const state = useAppStore.getState() as unknown as { circuitParts: CircuitPart[] };
                    const pNow = state.circuitParts.find((p) => p.id === partId);
                    const attrs = pNow?.attrs ?? {};
                    const tRaw = (attrs as any).temperature;
                    const hRaw = (attrs as any).humidity;
                    const t = typeof tRaw === 'number' ? tRaw : Number.parseFloat(String(tRaw ?? '25'));
                    const h = typeof hRaw === 'number' ? hRaw : Number.parseFloat(String(hRaw ?? '50'));
                    return {
                      temperatureC: Number.isFinite(t) ? t : 25,
                      humidity: Number.isFinite(h) ? h : 50,
                    };
                  },
                })
              );
            }
          }
        } catch (e) {
          console.warn('[Simulation] Peripheral initialization failed:', e);
        }

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
        appendSerialLine('[Simulation] Started (AVR8js)');
      } catch (err) {
        console.error('[Simulation] Failed to initialize AVR runner:', err);
        const msg = err instanceof Error ? err.message : String(err);
        appendSerialLine(`[Simulation] Failed to start: ${msg}`);
        return;
      }
    }

    if (runningRef.current) return;
    runningRef.current = true;
    setIsRunning(true);
    rafRef.current = requestAnimationFrame(stepFrame);
  }, [appendSerialLine, circuitParts, connections, hexData, partType, stepFrame, updatePortPins]);

  useEffect(() => {
    // Reset simulation when program/target changes.
    stop();
  }, [hexData, partType, stop]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { run, stop, pause, isRunning, pinStates, pwmStates, serialOutput, clearSerialOutput };
}
