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
  portCConfig,
  portDConfig,
  timer0Config,
  usart0Config,
  type GPIOListener,
  AVRADC,
  adcConfig,
  ADCMuxInputType,
} from 'avr8js';

import { useAppStore } from '@/store/useAppStore';
import { getI2CBus } from '@/utils/simulation/i2c';
import { getLCD1602 } from '@/utils/simulation/lcd1602';
import { getSSD1306 } from '@/utils/simulation/ssd1306';
import { DHTDevice, type DHTType } from '@/utils/simulation/dht';
import { ServoDevice } from '@/utils/simulation/servo';
import { HCSR04Device } from '@/utils/simulation/hcsr04';
import { KeypadDevice } from '@/utils/simulation/keypad';
import { getInteractiveComponentManager } from '@/utils/simulation/interactiveComponents';

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
  readonly portC: AVRIOPort;
  readonly portD: AVRIOPort;
  readonly clock: AVRClock;
  readonly timer0: AVRTimer;
  readonly usart: AVRUSART;
  readonly twi: AVRTWI;
  readonly adc: AVRADC;

  constructor(hexText: string) {
    const program = parseIntelHex(hexText);
    this.cpu = new CPU(program);
    this.portB = new AVRIOPort(this.cpu, portBConfig);
    this.portC = new AVRIOPort(this.cpu, portCConfig);
    this.portD = new AVRIOPort(this.cpu, portDConfig);

    // Provide basic Arduino timing (millis/delay rely on timer0 on Uno).
    this.clock = new AVRClock(this.cpu, 16_000_000);
    this.timer0 = new AVRTimer(this.cpu, timer0Config);

    // ADC for analogRead() support
    this.adc = new AVRADC(this.cpu, adcConfig);

    // USART for Serial communication
    this.usart = new AVRUSART(this.cpu, usart0Config, 16_000_000);

    // TWI (I2C) for Wire library support
    this.twi = new AVRTWI(this.cpu, twiConfig, 16_000_000);

    // Bridge avr8js TWI transactions to our simulated I2C bus.
    this.twi.eventHandler = new I2CBusTwiEventHandler(this.twi);
  }
}

class I2CBusTwiEventHandler implements TWIEventHandler {
  constructor(private readonly twi: AVRTWI) { }

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
      if (partId === mcuId) {
        // Match purely numeric pins (0, 1, 2, ..., 13)
        if (/^\d+$/.test(pinId)) {
          const n = Number.parseInt(pinId, 10);
          return Number.isFinite(n) ? n : null;
        }
        // Match analog pins (A0-A5) - these are digital pins 14-19 on Arduino Uno
        const analogMatch = pinId.match(/^A(\d)$/i);
        if (analogMatch) {
          const analogNum = Number.parseInt(analogMatch[1], 10);
          if (analogNum >= 0 && analogNum <= 5) {
            return 14 + analogNum;
          }
        }
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
  // Arduino Uno pin mapping:
  // D0-D7: PORTD bits 0-7
  // D8-D13: PORTB bits 0-5
  // A0-A5 (D14-D19): PORTC bits 0-5
  if (pin >= 0 && pin <= 7) return { port: runner.portD, bit: pin };
  if (pin >= 8 && pin <= 13) return { port: runner.portB, bit: pin - 8 };
  if (pin >= 14 && pin <= 19) return { port: runner.portC, bit: pin - 14 };
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
  setButtonState: (partId: string, pressed: boolean) => void;
  setAnalogValue: (partId: string, value: number) => void;
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
  const setCircuitPartAttr = useAppStore((s) => s.setCircuitPartAttr);

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
  const servoDevicesRef = useRef<ServoDevice[]>([]);
  const hcsr04DevicesRef = useRef<HCSR04Device[]>([]);
  const keypadDevicesRef = useRef<KeypadDevice[]>([]);

  // Mappings for button part IDs to GPIO port/bit
  const buttonPinMapRef = useRef<Map<string, { port: AVRIOPort; bit: number }>>(new Map());
  // Mappings for analog part IDs to ADC channel
  const analogChannelMapRef = useRef<Map<string, number>>(new Map());
  // Current analog values per channel (0-1023)
  const analogValuesRef = useRef<Map<number, number>>(new Map());

  const cyclesPerFrame = useMemo(() => Math.floor(16_000_000 / 60), []);

  const clearSerialOutput = useCallback(() => {
    setSerialOutput([]);
    serialBufferRef.current = '';
  }, []);

  const appendSerialLine = useCallback((line: string) => {
    if (!line) return;
    setSerialOutput((prev) => [...prev, line]);
  }, []);

  const updatePortPins = useCallback((port: 'B' | 'C' | 'D', value: number) => {
    setPinStates((prev) => {
      const next: PinStates = { ...prev };
      if (port === 'D') {
        // PORTD bits 0-7 -> Digital 0-7
        for (let bit = 0; bit < 8; bit++) {
          const pin = bit;
          next[pin] = (value & (1 << bit)) !== 0;
        }
      } else if (port === 'B') {
        // PORTB bits 0-5 -> Digital 8-13
        for (let bit = 0; bit < 6; bit++) {
          const pin = 8 + bit;
          next[pin] = (value & (1 << bit)) !== 0;
        }
      } else {
        // PORTC bits 0-5 -> Analog A0-A5 (Digital 14-19)
        for (let bit = 0; bit < 6; bit++) {
          const pin = 14 + bit;
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

        // Debug: Log PWM values when they change significantly
        const hasChanges = Object.entries(next).some(([pin, val]) =>
          prev[parseInt(pin)] !== val && val > 0
        );
        if (hasChanges) {
          const activePwm = Object.entries(next).filter(([, v]) => v > 0);
          if (activePwm.length > 0) {
            console.log('[PWM] OCR register values:', Object.fromEntries(activePwm));
          }
        }
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
        for (const servo of servoDevicesRef.current) {
          servo.tick(runner.cpu.cycles);
        }
        for (const hcsr04 of hcsr04DevicesRef.current) {
          hcsr04.tick(runner.cpu.cycles);
        }
        for (const keypad of keypadDevicesRef.current) {
          keypad.tick();
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
    servoDevicesRef.current = [];
    hcsr04DevicesRef.current = [];
    keypadDevicesRef.current = [];
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
          // Instantiate button-to-pin mappings for pushbuttons
          buttonPinMapRef.current = new Map();
          // Instantiate Servo devices
          servoDevicesRef.current = [];
          // Instantiate HC-SR04 ultrasonic sensors
          hcsr04DevicesRef.current = [];
          // Instantiate keypad matrix devices
          keypadDevicesRef.current = [];

          const mcuPart = circuitParts.find((p) => p.type === partType);
          if (mcuPart) {
            const adjacency = buildAdjacency(connections);

            // DHT sensors
            for (const part of circuitParts) {
              const typeLower = part.type.toLowerCase();
              if (!typeLower.includes('dht')) continue;

              const dhtType: DHTType = typeLower.includes('dht11') ? 'dht11' : 'dht22';
              // Try multiple possible pin names that DHT sensors use
              const possiblePinNames = ['SDA', 'DATA', 'OUT', 'SIGNAL', 'DQ'];
              let foundPin: number | null = null;
              let usedPinName: string | null = null;

              for (const pinName of possiblePinNames) {
                const startKey = `${part.id}:${pinName}`;
                const pin = findConnectedMcuDigitalPin(adjacency, startKey, mcuPart.id);
                if (pin != null) {
                  foundPin = pin;
                  usedPinName = pinName;
                  break;
                }
              }

              if (foundPin == null) {
                // Only log detailed debug info in development mode
                if (process.env.NODE_ENV === 'development') {
                  console.log(`[DHT] No connection found for ${part.id} (${dhtType}):`, {
                    triedPins: possiblePinNames,
                    adjacencyKeys: [...adjacency.keys()].filter(k => k.startsWith(part.id)),
                  });
                }
                continue;
              }

              const portBit = getPortBitForArduinoDigitalPin(runner, foundPin);
              if (!portBit) {
                console.warn(`[DHT] Pin ${foundPin} not supported for DHT simulation`);
                continue;
              }

              const partId = part.id;
              const portName = portBit.port === runner.portD ? 'D' :
                portBit.port === runner.portB ? 'B' : 'C';
              console.log(`[DHT] Binding ${partId} to port${portName}${portBit.bit} (Arduino pin ${foundPin})`);

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

            // Pushbuttons
            for (const part of circuitParts) {
              const typeLower = part.type.toLowerCase();
              if (!typeLower.includes('pushbutton') && !typeLower.includes('button')) continue;
              // Skip membrane keypads
              if (typeLower.includes('keypad') || typeLower.includes('membrane')) continue;

              // Find which MCU pin the button is connected to
              // Wokwi pushbutton has pins: 1.l, 1.r, 2.l, 2.r
              const buttonPinNames = ['1.l', '1.r', '2.l', '2.r', '1', '2', 'OUT', 'SIG'];
              let foundPin: number | null = null;

              for (const pinName of buttonPinNames) {
                const startKey = `${part.id}:${pinName}`;
                const pin = findConnectedMcuDigitalPin(adjacency, startKey, mcuPart.id);
                if (pin != null) {
                  foundPin = pin;
                  break;
                }
              }

              if (foundPin == null) {
                console.log(`[Button] No MCU connection found for ${part.id}`);
                continue;
              }

              const portBit = getPortBitForArduinoDigitalPin(runner, foundPin);
              if (!portBit) continue;

              console.log(`[Button] Binding ${part.id} to Arduino pin ${foundPin}`);
              buttonPinMapRef.current.set(part.id, portBit);
            }

            // Servo devices
            for (const part of circuitParts) {
              const typeLower = part.type.toLowerCase();
              if (!typeLower.includes('servo')) continue;

              // Find which MCU pin the servo's PWM pin is connected to
              const servoPinNames = ['PWM', 'SIGNAL', 'SIG', 'IN'];
              let foundPin: number | null = null;

              for (const pinName of servoPinNames) {
                const startKey = `${part.id}:${pinName}`;
                const pin = findConnectedMcuDigitalPin(adjacency, startKey, mcuPart.id);
                if (pin != null) {
                  foundPin = pin;
                  break;
                }
              }

              if (foundPin == null) continue;

              const portBit = getPortBitForArduinoDigitalPin(runner, foundPin);
              if (!portBit) continue;

              const partId = part.id;
              console.log(`[Servo] Binding ${partId} to Arduino pin ${foundPin}`);

              servoDevicesRef.current.push(
                new ServoDevice({
                  port: portBit.port,
                  bit: portBit.bit,
                  cpuFrequencyHz: 16_000_000,
                  onAngleChange: (angle: number) => {
                    // Update the servo's angle attribute in the store
                    setCircuitPartAttr(partId, 'angle', angle);
                  },
                })
              );
            }

            // HC-SR04 ultrasonic sensors
            for (const part of circuitParts) {
              const typeLower = part.type.toLowerCase();
              if (!typeLower.includes('hc-sr04') && !typeLower.includes('hcsr04') && !typeLower.includes('ultrasonic')) continue;

              // Find TRIG and ECHO pins
              const trigPinNames = ['TRIG', 'TRIGGER'];
              const echoPinNames = ['ECHO'];
              let trigPin: number | null = null;
              let echoPin: number | null = null;

              for (const pinName of trigPinNames) {
                const startKey = `${part.id}:${pinName}`;
                const pin = findConnectedMcuDigitalPin(adjacency, startKey, mcuPart.id);
                if (pin != null) {
                  trigPin = pin;
                  break;
                }
              }

              for (const pinName of echoPinNames) {
                const startKey = `${part.id}:${pinName}`;
                const pin = findConnectedMcuDigitalPin(adjacency, startKey, mcuPart.id);
                if (pin != null) {
                  echoPin = pin;
                  break;
                }
              }

              if (trigPin == null || echoPin == null) {
                console.log(`[HC-SR04] Incomplete wiring for ${part.id}: TRIG=${trigPin}, ECHO=${echoPin}`);
                continue;
              }

              const trigPortBit = getPortBitForArduinoDigitalPin(runner, trigPin);
              const echoPortBit = getPortBitForArduinoDigitalPin(runner, echoPin);
              if (!trigPortBit || !echoPortBit) continue;

              const partId = part.id;
              console.log(`[HC-SR04] Binding ${partId}: TRIG=pin${trigPin}, ECHO=pin${echoPin}`);

              // Register with interactive manager for distance control
              const interactiveManager = getInteractiveComponentManager();
              interactiveManager.registerComponent(partId, part.type);

              hcsr04DevicesRef.current.push(
                new HCSR04Device({
                  trigPort: trigPortBit.port,
                  trigBit: trigPortBit.bit,
                  echoPort: echoPortBit.port,
                  echoBit: echoPortBit.bit,
                  cpuFrequencyHz: 16_000_000,
                  getDistanceCm: () => {
                    const state = useAppStore.getState() as unknown as { circuitParts: CircuitPart[] };
                    const pNow = state.circuitParts.find((p) => p.id === partId);
                    const attrs = pNow?.attrs ?? {};
                    const distRaw = (attrs as any).distance;
                    const dist = typeof distRaw === 'number' ? distRaw : Number.parseFloat(String(distRaw ?? '100'));
                    return Number.isFinite(dist) ? dist : 100;
                  },
                })
              );
            }

            // Keypad matrix devices
            for (const part of circuitParts) {
              const typeLower = part.type.toLowerCase();
              if (!typeLower.includes('keypad') && !typeLower.includes('membrane')) continue;

              // Find row and column pins (R1-R4, C1-C4)
              const rowPins: { port: AVRIOPort; bit: number }[] = [];
              const colPins: { port: AVRIOPort; bit: number }[] = [];

              for (let r = 1; r <= 4; r++) {
                const startKey = `${part.id}:R${r}`;
                const pin = findConnectedMcuDigitalPin(adjacency, startKey, mcuPart.id);
                if (pin != null) {
                  const portBit = getPortBitForArduinoDigitalPin(runner, pin);
                  if (portBit) rowPins.push(portBit);
                }
              }

              for (let c = 1; c <= 4; c++) {
                const startKey = `${part.id}:C${c}`;
                const pin = findConnectedMcuDigitalPin(adjacency, startKey, mcuPart.id);
                if (pin != null) {
                  const portBit = getPortBitForArduinoDigitalPin(runner, pin);
                  if (portBit) colPins.push(portBit);
                }
              }

              if (rowPins.length === 0 || colPins.length === 0) {
                console.log(`[Keypad] Incomplete wiring for ${part.id}: rows=${rowPins.length}, cols=${colPins.length}`);
                continue;
              }

              const partId = part.id;
              console.log(`[Keypad] Binding ${partId}: ${rowPins.length} rows, ${colPins.length} cols`);

              keypadDevicesRef.current.push(
                new KeypadDevice({
                  rowPorts: rowPins,
                  colPorts: colPins,
                  getButtonState: (row: number, col: number) => {
                    const state = useAppStore.getState() as unknown as { circuitParts: CircuitPart[] };
                    const pNow = state.circuitParts.find((p) => p.id === partId);
                    const attrs = pNow?.attrs ?? {};
                    // Check if this button is pressed (stored as pressedKeys array or individual button states)
                    const pressedKeys = (attrs as any).pressedKeys as string[] | undefined;
                    if (pressedKeys) {
                      // Default key layout
                      const keyLayout = [
                        ['1', '2', '3', 'A'],
                        ['4', '5', '6', 'B'],
                        ['7', '8', '9', 'C'],
                        ['*', '0', '#', 'D'],
                      ];
                      if (row < keyLayout.length && col < keyLayout[row].length) {
                        return pressedKeys.includes(keyLayout[row][col]);
                      }
                    }
                    return false;
                  },
                })
              );
            }
          } // End of if (mcuPart)
        } catch (e) {
          console.warn('[Simulation] Peripheral initialization failed:', e);
        }

        const onPortB: GPIOListener = (value) => updatePortPins('B', value);
        const onPortC: GPIOListener = (value) => updatePortPins('C', value);
        const onPortD: GPIOListener = (value) => updatePortPins('D', value);
        runner.portB.addListener(onPortB);
        runner.portC.addListener(onPortC);
        runner.portD.addListener(onPortD);

        // Set up ADC channel value provider for analogRead() support
        // This allows potentiometers and other analog sensors to provide values
        // Normalize partType for comparison (handle both "wokwi-" prefixed and non-prefixed)
        const normalizedPartType = partType.replace('wokwi-', '');
        const mcuPart = circuitParts.find((p) => {
          const normalizedPType = p.type.replace('wokwi-', '');
          return normalizedPType === normalizedPartType;
        });

        console.log('[ADC Setup] Looking for MCU:', partType, 'normalized:', normalizedPartType);
        console.log('[ADC Setup] Circuit parts:', circuitParts.map(p => ({ id: p.id, type: p.type })));
        console.log('[ADC Setup] Found MCU:', mcuPart?.id, mcuPart?.type);

        if (mcuPart) {
          const adjacency = buildAdjacency(connections);

          // Map analog channels to the components connected to them
          const analogChannelMap = new Map<number, string>(); // channel -> partId

          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            // Check for analog input components
            if (typeLower.includes('potentiometer') ||
              typeLower.includes('photoresistor') ||
              typeLower.includes('ntc') ||
              typeLower.includes('temp') ||
              typeLower.includes('ldr')) {
              // Find which analog pin this component's signal pin is connected to
              const signalPins = ['SIG', 'SIGNAL', 'OUT', 'WIPER', 'AO'];
              for (const pinName of signalPins) {
                const startKey = `${part.id}:${pinName}`;
                const mcuPin = findConnectedMcuDigitalPin(adjacency, startKey, mcuPart.id);
                if (mcuPin != null && mcuPin >= 14 && mcuPin <= 19) {
                  // Analog pins A0-A5 are digital pins 14-19
                  const channel = mcuPin - 14;
                  analogChannelMap.set(channel, part.id);
                  console.log(`[ADC] Mapped ${part.id} (${pinName}) to analog channel ${channel} (A${channel})`);
                  break;
                }
              }
            }
          }

          // Set up ADC channel value callback
          // The callback receives an ADCMuxInput object with type and channel info
          runner.adc.onADCRead = (input) => {
            // Only handle single-ended ADC reads (normal analogRead)
            if (input.type === ADCMuxInputType.SingleEnded) {
              const channel = (input as { type: ADCMuxInputType.SingleEnded; channel: number }).channel;
              const partId = analogChannelMap.get(channel);
              if (partId) {
                // Fetch the latest state directly from the store
                const state = useAppStore.getState() as unknown as { circuitParts: CircuitPart[] };
                const part = state.circuitParts.find((p) => p.id === partId);

                if (part && part.attrs) {
                  // Check common attribute names for values
                  const val = (part.attrs as any).value ?? (part.attrs as any).angle ?? (part.attrs as any).position;

                  // Map raw attributes to 0-1023 range if necessary
                  let adcValue = Number(val);

                  // Simple normalization if value is missing or NaN
                  if (!Number.isFinite(adcValue)) adcValue = 512;

                  // Clamp to 10-bit range
                  adcValue = Math.max(0, Math.min(1023, Math.round(adcValue)));

                  runner.adc.completeADCRead(adcValue);
                  return;
                }
              }
            }
            // Default open/floating input
            runner.adc.completeADCRead(0);
          };
        }

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
        updatePortPins('C', runner.cpu.data[portCConfig.PORT]);
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
  }, [appendSerialLine, circuitParts, connections, hexData, partType, setCircuitPartAttr, stepFrame, updatePortPins]);

  useEffect(() => {
    // Reset simulation when program/target changes.
    stop();
  }, [hexData, partType, stop]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  // Set button state (pressed = true pulls pin LOW for INPUT_PULLUP)
  const setButtonState = useCallback((partId: string, pressed: boolean) => {
    const portBit = buttonPinMapRef.current.get(partId);
    if (!portBit) {
      console.log(`[Button] No mapping found for ${partId}`);
      return;
    }

    // For INPUT_PULLUP, button pressed = pin LOW, button released = pin HIGH (pulled up)
    // setPin(bit, value) - value true = HIGH, false = LOW
    portBit.port.setPin(portBit.bit, !pressed);
    console.log(`[Button] ${partId} ${pressed ? 'pressed (LOW)' : 'released (HIGH)'}`);
  }, []);

  // Set analog value for a component (e.g., potentiometer)
  const setAnalogValue = useCallback((partId: string, value: number) => {
    // Keep store as the single source of truth for simulation inputs.
    setCircuitPartAttr(partId, 'value', value);

    // Back-compat: also update the interactive component manager (if other UI paths still use it)
    const manager = getInteractiveComponentManager();
    manager.setValue(partId, value);

    console.log(`[Analog] ${partId} set to ${value}`);
  }, [setCircuitPartAttr]);

  return { run, stop, pause, isRunning, pinStates, pwmStates, serialOutput, clearSerialOutput, setButtonState, setAnalogValue };
}
