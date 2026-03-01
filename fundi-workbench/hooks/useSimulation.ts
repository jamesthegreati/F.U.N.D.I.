'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AVRIOPort,
  AVRTWI,
  twiConfig,
  type TWIEventHandler,
  AVRClock,
  AVRSPI,
  spiConfig,
  AVRTimer,
  AVRUSART,
  CPU,
  avrInstruction,
  portBConfig,
  portCConfig,
  portDConfig,
  timer0Config,
  timer1Config,
  timer2Config,
  usart0Config,
  type GPIOListener,
  AVRADC,
  adcConfig,
  ADCMuxInputType,
  PinState,
} from 'avr8js';

import { useAppStore } from '@/store/useAppStore';
import { getI2CBus } from '@/utils/simulation/i2c';
import { getLCD1602, getLCD2004, type LCD1602State } from '@/utils/simulation/lcd1602';
import { getSSD1306 } from '@/utils/simulation/ssd1306';
import { DHTDevice, type DHTType } from '@/utils/simulation/dht';
import { ServoDevice } from '@/utils/simulation/servo';
import { HCSR04Device } from '@/utils/simulation/hcsr04';
import { KeypadDevice } from '@/utils/simulation/keypad';
import { getInteractiveComponentManager } from '@/utils/simulation/interactiveComponents';
import { getAudioSimulation } from '@/utils/simulation/audio';
import { PIRDevice } from '@/utils/simulation/pir';
import { getDS1307, resetDS1307 } from '@/utils/simulation/ds1307';
import { getMPU6050, resetMPU6050 } from '@/utils/simulation/mpu6050';
import { ShiftRegister595 } from '@/utils/simulation/shift-register-595';
import { ShiftRegister165, type PortBit as ShiftRegisterPortBit } from '@/utils/simulation/shift-register-165';
import { adcFromNtcTemperatureC, adcFromPhotoresistorLux } from '@/utils/simulation/analogSensors';
import { PhotoresistorDigitalDevice } from '@/utils/simulation/photoresistor';
import { Max7219Device } from '@/utils/simulation/max7219';
import { TM1637Device } from '@/utils/simulation/tm1637';
import { RelayModuleDevice, type RelayTransistorMode } from '@/utils/simulation/relay';
import { ILI9341Device, registerILI9341, resetILI9341Registry } from '@/utils/simulation/ili9341';
import { attachSPIRouter, type SPIRoutedDevice } from '@/utils/simulation/spiBus';
import { WS2812Device } from '@/utils/simulation/ws2812';
import { MicroSDCardDevice } from '@/utils/simulation/microsd';
import { HX711Device } from '@/utils/simulation/hx711';
import { A4988StepperDevice, StepperMotorDevice } from '@/utils/simulation/stepper';
import { IRReceiverDevice } from '@/utils/simulation/ir';
import { DS18B20Device } from '@/utils/simulation/ds18b20';
import {
  DFlipFlopDevice,
  DSRFlipFlopDevice,
  LogicGateDevice,
  Mux2Device,
  type LogicDevice,
} from '@/utils/simulation/logic';
import { simFeatureFlags, boardFamily } from '@/utils/simulation/featureFlags';
import { Rp2040EngineAdapter } from '@/utils/simulation/engines/rp2040/Rp2040EngineAdapter';
import { Esp32EngineAdapter } from '@/utils/simulation/engines/esp32/Esp32EngineAdapter';
import { esp32PinToGpio } from '@/utils/simulation/engines/esp32/esp32PinMap';
import type { SimulationEngine, SimulationArtifact as EngineSimulationArtifact } from '@/utils/simulation/engines/SimulationEngine';
import { buildAdjacency as buildNetAdjacency, findConnectedBoardPinId } from '@/utils/simulation/net/NetGraph';

// --- Speaker Device Implementation ---
// Monitors a pin for rapid toggling (square wave) and plays audio via Web Audio API
class SpeakerDevice {
  private toggleCount = 0;
  private lastPinState = false;

  constructor(
    private readonly port: AVRIOPort,
    private readonly bit: number,
    private readonly partId: string
  ) {
    this.lastPinState = this.port.pinState(this.bit) === PinState.High;
  }

  tick(): void {
    const currentState = this.port.pinState(this.bit) === PinState.High;
    if (currentState !== this.lastPinState) {
      this.toggleCount++;
      this.lastPinState = currentState;
    }
  }

  // Called once per frame (approx 60Hz) to update audio
  flush(cpuFrequency: number, cyclesPerFrame: number): void {
    if (this.toggleCount > 0) {
      // Calculate frequency: F = (Toggles * CPU_Freq) / (2 * TotalCycles)
      const freq = (this.toggleCount * cpuFrequency) / (2 * cyclesPerFrame);

      // Basic noise filter (20Hz - 20kHz)
      if (freq > 20 && freq < 20000) {
        getAudioSimulation().playTone(this.partId, freq);
      } else {
        getAudioSimulation().stopTone(this.partId);
      }
      this.toggleCount = 0;
    } else {
      getAudioSimulation().stopTone(this.partId);
    }
  }
}

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
  readonly spi: AVRSPI;
  readonly timer0: AVRTimer;
  readonly timer1: AVRTimer;
  readonly timer2: AVRTimer;
  readonly usart: AVRUSART;
  readonly twi: AVRTWI;
  readonly adc: AVRADC;

  constructor(hexText: string) {
    const program = parseIntelHex(hexText);
    this.cpu = new CPU(program);
    this.portB = new AVRIOPort(this.cpu, portBConfig);
    this.portC = new AVRIOPort(this.cpu, portCConfig);
    this.portD = new AVRIOPort(this.cpu, portDConfig);
    this.clock = new AVRClock(this.cpu, 16_000_000);
    this.spi = new AVRSPI(this.cpu, spiConfig, 16_000_000);
    this.timer0 = new AVRTimer(this.cpu, timer0Config);
    this.timer1 = new AVRTimer(this.cpu, timer1Config);
    this.timer2 = new AVRTimer(this.cpu, timer2Config);
    this.adc = new AVRADC(this.cpu, adcConfig);
    this.usart = new AVRUSART(this.cpu, usart0Config, 16_000_000);
    this.twi = new AVRTWI(this.cpu, twiConfig, 16_000_000);
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
        if (/^\d+$/.test(pinId)) {
          const n = Number.parseInt(pinId, 10);
          return Number.isFinite(n) ? n : null;
        }
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
  if (pin >= 0 && pin <= 7) return { port: runner.portD, bit: pin };
  if (pin >= 8 && pin <= 13) return { port: runner.portB, bit: pin - 8 };
  if (pin >= 14 && pin <= 19) return { port: runner.portC, bit: pin - 14 };
  return null;
}

function normalizeBoardType(partType: string): string {
  if (partType.startsWith('wokwi-')) return partType;
  return `wokwi-${partType}`;
}

type LogicSignalSource = { kind: 'mcu'; pin: number } | { kind: 'logic'; key: string };

type LogicInputBinding = {
  name: string;
  source: LogicSignalSource | null;
};

type LogicOutputBinding = {
  name: string;
  key: string;
  sinks: Array<{ port: AVRIOPort; bit: number }>;
};

type LogicRuntimeDevice = {
  device: LogicDevice;
  inputs: LogicInputBinding[];
  outputs: LogicOutputBinding[];
};

const LOGIC_OUTPUT_PIN_CANDIDATES = new Set(['y', 'out', 'q', 'qbar', 'nq', 'qb', '!q']);

function isLogicPartType(typeLower: string): boolean {
  return (
    typeLower.includes('not-gate') ||
    typeLower.includes('and-gate') ||
    typeLower.includes('or-gate') ||
    typeLower.includes('xor-gate') ||
    typeLower.includes('nand-gate') ||
    typeLower.includes('nor-gate') ||
    typeLower.includes('mux') ||
    typeLower.includes('flip-flop-dsr') ||
    typeLower.includes('flip-flop-d')
  );
}

type PwmStates = Record<number, number>;
type PinStates = Record<number, boolean>;

const MAX_SERIAL_LINES = 500;

export type UseSimulationControls = {
  run: () => void;
  stop: () => void;
  pause: () => void;
  isRunning: boolean;
  hasRunner: boolean;
  isPaused: boolean;
  pinStates: PinStates;
  pwmStates: PwmStates;
  serialOutput: string[];
  clearSerialOutput: () => void;
  setButtonState: (partId: string, pressed: boolean) => void;
  setAnalogValue: (partId: string, value: number) => void;
  setSwitchState: (partId: string, isOn: boolean) => void;
  setDipSwitchState: (partId: string, values: number[]) => void;
  rotateEncoder: (partId: string, direction: 'cw' | 'ccw') => void;
};

export type SimulationArtifact = {
  artifactType: string;
  artifactPayload: string;
  simulationHints?: Record<string, unknown> | null;
} | null;

function isAvrPart(partType: string): boolean {
  return (
    partType === 'wokwi-arduino-uno' ||
    partType === 'wokwi-arduino-nano' ||
    partType === 'wokwi-arduino-mega'
  );
}

export function useSimulation(
  hexData: string | null | undefined,
  partType: string,
  simulationArtifact?: SimulationArtifact
): UseSimulationControls {
  const circuitParts = useAppStore((s) => s.circuitParts) as unknown as CircuitPart[];
  const connections = useAppStore((s) => s.connections) as unknown as CircuitConnection[];
  const setCircuitPartAttr = useAppStore((s) => s.setCircuitPartAttr);

  const [isRunning, setIsRunning] = useState(false);
  const [hasRunner, setHasRunner] = useState(false);
  const [pinStates, setPinStates] = useState<PinStates>({});
  const [pwmStates, setPwmStates] = useState<PwmStates>({});
  const [serialOutput, setSerialOutput] = useState<string[]>([]);

  const runnerRef = useRef<AVRRunner | null>(null);
  const engineRef = useRef<SimulationEngine | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const serialBufferRef = useRef<string>('');
  const stepFrameRef = useRef<() => void>(() => { });
  const nonAvrControlPinMapRef = useRef<Map<string, string>>(new Map());

  // Reduce UI churn: keep fast-changing signals in refs and flush to React state at a controlled rate.
  const pinStatesRef = useRef<PinStates>({});
  const pwmStatesRef = useRef<PwmStates>({});
  const uiDirtyRef = useRef({ pins: false, pwm: false });
  const lastUiFlushMsRef = useRef(0);
  const UI_FLUSH_INTERVAL_MS = 50; // ~20fps is plenty for UI; simulation still runs at full speed.

  // Refs for peripheral devices
  const dhtDevicesRef = useRef<DHTDevice[]>([]);
  const servoDevicesRef = useRef<ServoDevice[]>([]);
  const hcsr04DevicesRef = useRef<HCSR04Device[]>([]);
  const keypadDevicesRef = useRef<KeypadDevice[]>([]);
  const speakerDevicesRef = useRef<SpeakerDevice[]>([]);
  const pirDevicesRef = useRef<PIRDevice[]>([]);
  const shiftRegister595Ref = useRef<ShiftRegister595[]>([]);
  const shiftRegister165Ref = useRef<ShiftRegister165[]>([]);
  const photoresistorDevicesRef = useRef<PhotoresistorDigitalDevice[]>([]);
  const max7219DevicesRef = useRef<Max7219Device[]>([]);
  const tm1637DevicesRef = useRef<TM1637Device[]>([]);
  const relayDevicesRef = useRef<RelayModuleDevice[]>([]);
  const ili9341DevicesRef = useRef<ILI9341Device[]>([]);
  const ws2812DevicesRef = useRef<WS2812Device[]>([]);
  const hx711DevicesRef = useRef<HX711Device[]>([]);
  const stepperDevicesRef = useRef<StepperMotorDevice[]>([]);
  const a4988DevicesRef = useRef<A4988StepperDevice[]>([]);
  const irDevicesRef = useRef<Array<{ partId: string; device: IRReceiverDevice }>>([]);
  const irRemoteSeenRef = useRef<Map<string, number>>(new Map());
  const ds18b20DevicesRef = useRef<DS18B20Device[]>([]);
  const logicDevicesRef = useRef<LogicRuntimeDevice[]>([]);
  const logicStateRef = useRef<Map<string, boolean>>(new Map());

  const buttonPinMapRef = useRef<Map<string, { port: AVRIOPort; bit: number }>>(new Map());
  const switchPinMapRef = useRef<Map<string, { port: AVRIOPort; bit: number }>>(new Map());
  const dipPinMapRef = useRef<Map<string, { port: AVRIOPort; bit: number }>>(new Map());
  const encoderPinMapRef = useRef<Map<string, { clk: { port: AVRIOPort; bit: number }; dt: { port: AVRIOPort; bit: number } }>>(new Map());
  const encoderQueueRef = useRef<Map<string, Array<{ clk: boolean; dt: boolean }>>>(new Map());

  type AnalogSourceKind = 'default' | 'joystick-horz' | 'joystick-vert';
  const analogChannelMapRef = useRef<Map<number, { partId: string; kind: AnalogSourceKind }>>(new Map());

  const cyclesPerFrame = useMemo(() => Math.floor(16_000_000 / 60), []);

  const clearSerialOutput = useCallback(() => {
    setSerialOutput([]);
    serialBufferRef.current = '';
  }, []);

  const appendSerialLine = useCallback((line: string) => {
    if (!line) return;
    setSerialOutput((prev) => {
      const next = [...prev, line];
      return next.length > MAX_SERIAL_LINES ? next.slice(-MAX_SERIAL_LINES) : next;
    });
  }, []);

  const updatePortPins = useCallback((port: 'B' | 'C' | 'D', value: number) => {
    const next = pinStatesRef.current;
    if (port === 'D') {
      for (let bit = 0; bit < 8; bit++) next[bit] = (value & (1 << bit)) !== 0;
    } else if (port === 'B') {
      for (let bit = 0; bit < 6; bit++) next[8 + bit] = (value & (1 << bit)) !== 0;
    } else {
      for (let bit = 0; bit < 6; bit++) next[14 + bit] = (value & (1 << bit)) !== 0;
    }
    uiDirtyRef.current.pins = true;
  }, []);

  const updatePwmStates = useCallback((runner: AVRRunner) => {
    const next = pwmStatesRef.current;
    try {
      const data = runner.cpu.data;
      next[3] = data[0xB4] ?? 0;
      next[5] = data[0x48] ?? 0;
      next[6] = data[0x47] ?? 0;
      next[9] = data[0x88] ?? 0;
      next[10] = data[0x8A] ?? 0;
      next[11] = data[0xB3] ?? 0;
    } catch {
      // ignore
    }
    uiDirtyRef.current.pwm = true;
  }, []);

  const flushUiSignalsIfNeeded = useCallback(() => {
    const now = Date.now();
    if (now - lastUiFlushMsRef.current < UI_FLUSH_INTERVAL_MS) return;

    lastUiFlushMsRef.current = now;
    const dirty = uiDirtyRef.current;
    if (dirty.pins) {
      dirty.pins = false;
      // Clone to ensure React sees a new object
      setPinStates({ ...pinStatesRef.current });
    }
    if (dirty.pwm) {
      dirty.pwm = false;
      setPwmStates({ ...pwmStatesRef.current });
    }
  }, []);

  useEffect(() => {
    stepFrameRef.current = () => {
      if (!runningRef.current) return;
      const runner = runnerRef.current;
      if (!runner) return;

      // Apply one queued rotary-encoder transition per frame (per encoder).
      // This slows down the quadrature edges enough for sketches to observe.
      for (const [partId, queue] of encoderQueueRef.current) {
        if (!queue.length) continue;
        const pins = encoderPinMapRef.current.get(partId);
        if (!pins) continue;
        const next = queue.shift()!;
        pins.clk.port.setPin(pins.clk.bit, next.clk);
        pins.dt.port.setPin(pins.dt.bit, next.dt);
      }

      let remaining = cyclesPerFrame;
      while (remaining > 0) {
        const before = runner.cpu.cycles;
        avrInstruction(runner.cpu);

        // Tick Peripherals
        for (const dht of dhtDevicesRef.current) dht.tick(runner.cpu.cycles);
        for (const servo of servoDevicesRef.current) servo.tick(runner.cpu.cycles);
        for (const hcsr04 of hcsr04DevicesRef.current) hcsr04.tick(runner.cpu.cycles);
        for (const keypad of keypadDevicesRef.current) keypad.tick();
        for (const speaker of speakerDevicesRef.current) speaker.tick();
        for (const pir of pirDevicesRef.current) pir.tick(runner.cpu.cycles);
        for (const sr of shiftRegister595Ref.current) sr.tick();
        for (const sr of shiftRegister165Ref.current) sr.tick();
        for (const ldr of photoresistorDevicesRef.current) ldr.tick();
        for (const m of max7219DevicesRef.current) m.tick();
        for (const t of tm1637DevicesRef.current) t.tick();
        for (const r of relayDevicesRef.current) r.tick();
        for (const n of ws2812DevicesRef.current) n.tick(runner.cpu.cycles);
        for (const h of hx711DevicesRef.current) h.tick();
        for (const s of stepperDevicesRef.current) s.tick();
        for (const d of a4988DevicesRef.current) d.tick();
        for (const ir of irDevicesRef.current) ir.device.tick(runner.cpu.cycles);
        for (const ds of ds18b20DevicesRef.current) ds.tick(runner.cpu.cycles);
        for (const logic of logicDevicesRef.current) {
          const inputValues: Record<string, boolean> = {};
          for (const binding of logic.inputs) {
            let value = false;
            const source = binding.source;
            if (source?.kind === 'mcu') {
              const pb = getPortBitForArduinoDigitalPin(runner, source.pin);
              value = pb != null ? pb.port.pinState(pb.bit) === PinState.High : false;
            } else if (source?.kind === 'logic') {
              value = logicStateRef.current.get(source.key) ?? false;
            }
            inputValues[binding.name] = value;
          }

          const outputs = logic.device.evaluate(inputValues);
          for (const output of logic.outputs) {
            const value = !!outputs[output.name];
            logicStateRef.current.set(output.key, value);
            for (const sink of output.sinks) {
              sink.port.setPin(sink.bit, value);
            }
          }
        }

        // Route IR remote button presses to all registered IR receivers.
        if (irDevicesRef.current.length > 0) {
          const state = useAppStore.getState() as unknown as { circuitParts: CircuitPart[] };
          for (const part of state.circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('ir-remote')) continue;

            const attrs = (part.attrs ?? {}) as Record<string, unknown>;
            const seqRaw = attrs.irSeq;
            const seq = typeof seqRaw === 'number' ? seqRaw : Number.parseInt(String(seqRaw ?? '0'), 10);
            if (!Number.isFinite(seq) || seq <= 0) continue;

            const prev = irRemoteSeenRef.current.get(part.id) ?? 0;
            if (seq <= prev) continue;

            const irCodeRaw = attrs.irCode;
            const irCode = typeof irCodeRaw === 'number' ? irCodeRaw : Number.parseInt(String(irCodeRaw ?? ''), 10);
            if (!Number.isFinite(irCode)) continue;

            irRemoteSeenRef.current.set(part.id, seq);
            for (const recv of irDevicesRef.current) {
              recv.device.sendNec(0x00, irCode & 0xff);
            }
          }
        }

        const cpuAny = runner.cpu as unknown as {
          cycles: number;
          tick: () => void;
          nextClockEvent: { cycles: number } | null;
          nextInterrupt: number;
          interruptsEnabled: boolean;
        };

        for (let i = 0; i < 32; i++) {
          const dueEvent = cpuAny.nextClockEvent && cpuAny.nextClockEvent.cycles <= cpuAny.cycles;
          const dueInterrupt = cpuAny.interruptsEnabled && cpuAny.nextInterrupt >= 0;
          if (!dueEvent && !dueInterrupt) break;
          cpuAny.tick();
        }

        const delta = runner.cpu.cycles - before;
        remaining -= delta > 0 ? delta : 1;
      }

      // Flush Speaker Audio (once per frame)
      for (const speaker of speakerDevicesRef.current) {
        speaker.flush(16_000_000, cyclesPerFrame);
      }

      updatePwmStates(runner);
      flushUiSignalsIfNeeded();
      rafRef.current = requestAnimationFrame(stepFrameRef.current);
    };
  }, [cyclesPerFrame, flushUiSignalsIfNeeded, updatePwmStates]);

  const stepFrame = useCallback(() => {
    stepFrameRef.current();
  }, []);

  const stop = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
    setHasRunner(false);
    if (engineRef.current) {
      void engineRef.current.stop();
      if ('dispose' in engineRef.current && typeof (engineRef.current as { dispose: () => void }).dispose === 'function') {
        (engineRef.current as { dispose: () => void }).dispose();
      }
      engineRef.current = null;
    }
    nonAvrControlPinMapRef.current = new Map();
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    runnerRef.current = null;
    dhtDevicesRef.current = [];
    servoDevicesRef.current = [];
    hcsr04DevicesRef.current = [];
    keypadDevicesRef.current = [];
    speakerDevicesRef.current = []; // Clear speakers
    pirDevicesRef.current = [];
    shiftRegister595Ref.current = [];
    shiftRegister165Ref.current = [];
    photoresistorDevicesRef.current = [];
    max7219DevicesRef.current = [];
    tm1637DevicesRef.current = [];
    relayDevicesRef.current = [];
    ws2812DevicesRef.current = [];
    hx711DevicesRef.current = [];
    stepperDevicesRef.current = [];
    a4988DevicesRef.current = [];
    irDevicesRef.current = [];
    irRemoteSeenRef.current = new Map();
    ds18b20DevicesRef.current = [];
    logicDevicesRef.current = [];
    logicStateRef.current = new Map();
    resetDS1307();
    resetMPU6050();
    ili9341DevicesRef.current = [];
    resetILI9341Registry();

    getAudioSimulation().stopAll(); // Stop all audio

    try {
      getI2CBus().resetAll();
      getI2CBus().clearLog();
    } catch { }
    pinStatesRef.current = {};
    pwmStatesRef.current = {};
    uiDirtyRef.current = { pins: false, pwm: false };
    setPinStates({});
    setPwmStates({});
    setSerialOutput([]);
    serialBufferRef.current = '';
  }, []);

  const pause = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
    if (engineRef.current) {
      void engineRef.current.stop();
    }
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    getAudioSimulation().setMuted(true); // Mute when paused
  }, []);

  const run = useCallback(() => {
    if (!hexData) return;

    const family = boardFamily(partType);
    if (family !== 'avr') {
      const enabled =
        (family === 'rp2040' && simFeatureFlags.rp2040) ||
        (family === 'esp32' && simFeatureFlags.esp32);
      if (!enabled) return;

      const artifact: EngineSimulationArtifact = {
        artifactType: simulationArtifact?.artifactType ?? 'raw-bin',
        artifactPayload: simulationArtifact?.artifactPayload ?? hexData,
        simulationHints: simulationArtifact?.simulationHints ?? null,
      };

      const mcuPart = circuitParts.find((p) => normalizeBoardType(p.type) === partType);
      const adjacency = buildNetAdjacency(connections as unknown as Array<{ from: { partId: string; pinId: string }; to: { partId: string; pinId: string } }>);
      const controlMap = new Map<string, string>();

      if (mcuPart) {
        const bindControl = (partId: string, pinCandidates: string[]) => {
          for (const pinName of pinCandidates) {
            const boardPin = findConnectedBoardPinId(adjacency, `${partId}:${pinName}`, mcuPart.id);
            if (boardPin) {
              controlMap.set(partId, boardPin);
              return;
            }
          }
        };

        for (const part of circuitParts) {
          const typeLower = part.type.toLowerCase();
          if ((typeLower.includes('pushbutton') || typeLower.includes('button')) && !typeLower.includes('keypad')) {
            bindControl(part.id, ['1.l', '1.r', '2.l', '2.r', '1', '2', 'OUT', 'SIG']);
          }
          if (typeLower.includes('slide-switch')) {
            bindControl(part.id, ['2', '1', '3']);
          }
          if (typeLower.includes('analog-joystick')) {
            bindControl(part.id, ['SEL']);
          }
        }
      }

      nonAvrControlPinMapRef.current = controlMap;

      const startEngine = async () => {
        try {
          if (engineRef.current) {
            await engineRef.current.stop();
            if ('dispose' in engineRef.current && typeof (engineRef.current as { dispose: () => void }).dispose === 'function') {
              (engineRef.current as { dispose: () => void }).dispose();
            }
            engineRef.current = null;
          }

          if (!engineRef.current) {
            engineRef.current = family === 'rp2040' ? new Rp2040EngineAdapter() : new Esp32EngineAdapter();
            engineRef.current.setHandlers({
              onSerial: (line) => appendSerialLine(line),
              onPinChange: (pinId, level) => {
                let pin: number | null = null;

                if (family === 'esp32') {
                  // ESP32 pins: D2, GPIO23, 23, A0, TX0, etc.
                  pin = esp32PinToGpio(pinId);
                  if (pin === null || pin < 0 || pin > 39) return;
                } else {
                  // RP2040 pins come as GP0..GP29; also support D0..D29 and A0..A2
                  const gpMatch = pinId.match(/^GP(\d+)$/i);
                  const dMatch = pinId.match(/^(?:D)?(\d+)$/i);
                  const aMatch = pinId.match(/^A(\d+)$/i);
                  const m = gpMatch ?? dMatch ?? aMatch;
                  if (!m) return;
                  if (gpMatch) {
                    pin = Number.parseInt(gpMatch[1], 10);
                  } else if (aMatch) {
                    // A0..A2 → GP26..GP28
                    pin = 26 + Number.parseInt(aMatch[1], 10);
                  } else {
                    pin = Number.parseInt(m[1], 10);
                  }
                  if (!Number.isFinite(pin) || pin < 0 || pin >= 30) return;
                }

                pinStatesRef.current[pin] = level === 1;
                uiDirtyRef.current.pins = true;
                flushUiSignalsIfNeeded();
              },
            });
            await engineRef.current.init({ board: partType, artifact });

            // Register I2C/SPI devices found in the circuit on the RP2040 worker
            if (family === 'rp2040' && engineRef.current instanceof Rp2040EngineAdapter) {
              const rp2040 = engineRef.current as Rp2040EngineAdapter;
              for (const part of circuitParts) {
                const t = part.type.toLowerCase();
                if (t.includes('lcd1602') || t.includes('lcd-1602')) {
                  const addr = (part.attrs?.address as number) || 0x27;
                  rp2040.registerI2CDevice(0, addr, 'lcd1602');
                } else if (t.includes('lcd2004') || t.includes('lcd-2004')) {
                  const addr = (part.attrs?.address as number) || 0x27;
                  rp2040.registerI2CDevice(0, addr, 'lcd2004');
                } else if (t.includes('ssd1306')) {
                  const addr = (part.attrs?.address as number) || 0x3c;
                  const w = (part.attrs?.width as number) || 128;
                  const h = (part.attrs?.height as number) || 64;
                  rp2040.registerI2CDevice(0, addr, 'ssd1306', { width: w, height: h });
                } else if (t.includes('ds1307')) {
                  rp2040.registerI2CDevice(0, 0x68, 'ds1307');
                } else if (t.includes('mpu6050')) {
                  const addr = (part.attrs?.address as number) || 0x68;
                  rp2040.registerI2CDevice(0, addr, 'mpu6050');
                }
              }
            }

            // Register I2C/SPI devices found in the circuit on the ESP32 QEMU session
            if (family === 'esp32' && engineRef.current instanceof Esp32EngineAdapter) {
              const esp32 = engineRef.current as Esp32EngineAdapter;
              for (const part of circuitParts) {
                const t = part.type.toLowerCase();
                if (t.includes('lcd1602') || t.includes('lcd-1602')) {
                  const addr = (part.attrs?.address as number) || 0x27;
                  esp32.registerI2CDevice(0, addr, 'lcd1602');
                } else if (t.includes('lcd2004') || t.includes('lcd-2004')) {
                  const addr = (part.attrs?.address as number) || 0x27;
                  esp32.registerI2CDevice(0, addr, 'lcd2004');
                } else if (t.includes('ssd1306')) {
                  const addr = (part.attrs?.address as number) || 0x3c;
                  const w = (part.attrs?.width as number) || 128;
                  const h = (part.attrs?.height as number) || 64;
                  esp32.registerI2CDevice(0, addr, 'ssd1306', { width: w, height: h });
                } else if (t.includes('ds1307')) {
                  esp32.registerI2CDevice(0, 0x68, 'ds1307');
                } else if (t.includes('mpu6050')) {
                  const addr = (part.attrs?.address as number) || 0x68;
                  esp32.registerI2CDevice(0, addr, 'mpu6050');
                } else if (t.includes('ili9341')) {
                  esp32.registerSPIDevice(0, 'ili9341', 5);
                } else if (t.includes('max7219')) {
                  esp32.registerSPIDevice(0, 'max7219', 5);
                } else if (t.includes('neopixel') || t.includes('ws2812')) {
                  // WS2812 uses single-wire protocol, registered as SPI device for data relay
                  const pinAttr = (part.attrs?.pin as number) ?? 16;
                  esp32.registerSPIDevice(0, 'ws2812', pinAttr);
                }
              }
            }
          }

          await engineRef.current.start();
          runningRef.current = true;
          setIsRunning(true);
          setHasRunner(true);

          // Start a RAF loop to flush UI signals at ~60fps for non-AVR engines.
          // (AVR engines have their own RAF step-loop started below after this early return.)
          // Without this, pin-state updates only flush when onPinChange fires,
          // meaning a throttled pin-change with no follow-up never reaches React state.
          const scheduleFlush = () => {
            if (!runningRef.current) return;
            flushUiSignalsIfNeeded();
            rafRef.current = requestAnimationFrame(scheduleFlush);
          };
          rafRef.current = requestAnimationFrame(scheduleFlush);
        } catch (err) {
          console.error(err);
        }
      };

      void startEngine();
      return;
    }

    if (!isAvrPart(partType)) return;

    // Initialize Audio
    getAudioSimulation().initialize();
    getAudioSimulation().setMuted(false);
    getAudioSimulation().resume();

    if (!runnerRef.current) {
      try {
        const decodedText = decodeBase64ToString(hexData);
        if (!looksLikeIntelHex(decodedText)) return;

        const runner = new AVRRunner(decodedText);
        const bus = getI2CBus();
        bus.resetAll();
        bus.clearLog();

        // --- I2C / LCD Setup ---
        for (const part of circuitParts) {
          const typeLower = part.type.toLowerCase();
          const attrs = part.attrs ?? {};

          if (typeLower.includes('lcd1602') || typeLower.includes('lcd2004')) {
            const attrsRecord = attrs as Record<string, unknown>;
            const addr = parseI2CAddress(attrsRecord.i2cAddress ?? attrsRecord.address, 0x27);
            const lcd = typeLower.includes('lcd2004') ? getLCD2004(addr) : getLCD1602(addr);
            // FIX: Wire LCD state back to Store for UI update
            const partId = part.id;
            lcd.subscribe((state: LCD1602State) => {
              // Convert 2D array of chars to a single string for display
              const text = state.display.map(row => row.join('')).join('\n');
              setCircuitPartAttr(partId, 'text', text);
              setCircuitPartAttr(partId, 'backlight', state.backlightOn);
            });
          }

          if (typeLower.includes('ssd1306') || typeLower.includes('oled')) {
            const attrsRecord = attrs as Record<string, unknown>;
            const addr = parseI2CAddress(attrsRecord.i2cAddress ?? attrsRecord.address, 0x3c);
            getSSD1306(addr);
          }

          if (typeLower.includes('mpu6050')) {
            const attrsRecord = attrs as Record<string, unknown>;
            const addr = parseI2CAddress(attrsRecord.i2cAddress ?? attrsRecord.address, 0x68);
            const partId = part.id;
            getMPU6050({
              address: addr,
              readValues: () => {
                const state = useAppStore.getState() as unknown as { circuitParts: CircuitPart[] };
                const pNow = state.circuitParts.find((p) => p.id === partId);
                const a = (pNow?.attrs ?? {}) as Record<string, unknown>;

                const ax = Number.parseFloat(String(a.accelX ?? a.ax ?? 0));
                const ay = Number.parseFloat(String(a.accelY ?? a.ay ?? 0));
                const az = Number.parseFloat(String(a.accelZ ?? a.az ?? 1));
                const gx = Number.parseFloat(String(a.gyroX ?? a.gx ?? 0));
                const gy = Number.parseFloat(String(a.gyroY ?? a.gy ?? 0));
                const gz = Number.parseFloat(String(a.gyroZ ?? a.gz ?? 0));
                const tempC = Number.parseFloat(String(a.temperature ?? a.tempC ?? 25));

                return {
                  ax: Number.isFinite(ax) ? ax : 0,
                  ay: Number.isFinite(ay) ? ay : 0,
                  az: Number.isFinite(az) ? az : 1,
                  gx: Number.isFinite(gx) ? gx : 0,
                  gy: Number.isFinite(gy) ? gy : 0,
                  gz: Number.isFinite(gz) ? gz : 0,
                  tempC: Number.isFinite(tempC) ? tempC : 25,
                };
              },
            });
          }
        }

        dhtDevicesRef.current = [];
        buttonPinMapRef.current = new Map();
        switchPinMapRef.current = new Map();
        dipPinMapRef.current = new Map();
        encoderPinMapRef.current = new Map();
        encoderQueueRef.current = new Map();
        servoDevicesRef.current = [];
        hcsr04DevicesRef.current = [];
        keypadDevicesRef.current = [];
        speakerDevicesRef.current = []; // Init speaker list
        ili9341DevicesRef.current = [];
        resetILI9341Registry();
        resetMPU6050();
        hx711DevicesRef.current = [];
        stepperDevicesRef.current = [];
        a4988DevicesRef.current = [];
        irDevicesRef.current = [];
        irRemoteSeenRef.current = new Map();
        ds18b20DevicesRef.current = [];
        logicDevicesRef.current = [];
        logicStateRef.current = new Map();

        // Circuit parts often store MCU type without the `wokwi-` prefix (e.g. `arduino-uno`).
        // `partType` here comes from `compiledBoard`, which is normalized (e.g. `wokwi-arduino-uno`).
        // If we don't normalize, peripherals (DHT, servo, etc.) never attach.
        const mcuPart = circuitParts.find((p) => normalizeBoardType(p.type) === partType);

        if (mcuPart) {
          const adjacency = buildAdjacency(connections);
          const partById = new Map<string, CircuitPart>();
          for (const p of circuitParts) partById.set(p.id, p);

          const findConnectedKey = (
            startKey: string,
            predicate: (key: string) => boolean
          ): string | null => {
            const queue: string[] = [startKey];
            const seen = new Set<string>(queue);
            while (queue.length) {
              const cur = queue.shift()!;
              if (predicate(cur)) return cur;
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
          };

          const partPinsByLower = new Map<string, Map<string, string>>();
          for (const conn of connections) {
            const endpoints = [conn.from, conn.to];
            for (const endpoint of endpoints) {
              const partPinMap = partPinsByLower.get(endpoint.partId) ?? new Map<string, string>();
              if (!partPinMap.has(endpoint.pinId.toLowerCase())) {
                partPinMap.set(endpoint.pinId.toLowerCase(), endpoint.pinId);
              }
              partPinsByLower.set(endpoint.partId, partPinMap);
            }
          }

          const getPartPinId = (partId: string, aliases: string[]): string | null => {
            const pinMap = partPinsByLower.get(partId);
            if (!pinMap) return null;
            for (const alias of aliases) {
              const id = pinMap.get(alias.toLowerCase());
              if (id) return id;
            }
            return null;
          };

          const logicPartById = new Map<string, CircuitPart>();
          for (const p of circuitParts) {
            if (isLogicPartType(p.type.toLowerCase())) {
              logicPartById.set(p.id, p);
            }
          }

          const findInputSource = (ownerPartId: string, pinAliases: string[]): LogicSignalSource | null => {
            const actualPinId = getPartPinId(ownerPartId, pinAliases);
            if (!actualPinId) return null;
            const startKey = `${ownerPartId}:${actualPinId}`;

            const found = findConnectedKey(startKey, (key) => {
              if (key === startKey) return false;
              const idx = key.indexOf(':');
              if (idx <= 0) return false;
              const partId = key.slice(0, idx);
              const pinId = key.slice(idx + 1);

              if (partId === ownerPartId) return false;

              if (partId === mcuPart.id) {
                return findConnectedMcuDigitalPin(adjacency, key, mcuPart.id) != null;
              }

              if (logicPartById.has(partId)) {
                return LOGIC_OUTPUT_PIN_CANDIDATES.has(pinId.toLowerCase());
              }

              return false;
            });

            if (!found) return null;

            const idx = found.indexOf(':');
            const partId = found.slice(0, idx);
            const pinId = found.slice(idx + 1);

            if (partId === mcuPart.id) {
              const pin = findConnectedMcuDigitalPin(adjacency, found, mcuPart.id);
              if (pin == null) return null;
              return { kind: 'mcu', pin };
            }

            return { kind: 'logic', key: `${partId}:${pinId}` };
          };

          const findOutputSinks = (partId: string, pinAliases: string[]): LogicOutputBinding | null => {
            const actualPinId = getPartPinId(partId, pinAliases);
            if (!actualPinId) return null;

            const startKey = `${partId}:${actualPinId}`;
            const queue: string[] = [startKey];
            const seen = new Set<string>(queue);
            const mcuPins = new Set<number>();

            while (queue.length) {
              const cur = queue.shift()!;
              const idx = cur.indexOf(':');
              if (idx > 0) {
                const curPartId = cur.slice(0, idx);
                if (curPartId === mcuPart.id) {
                  const pin = findConnectedMcuDigitalPin(adjacency, cur, mcuPart.id);
                  if (pin != null) mcuPins.add(pin);
                }
              }

              const neighbors = adjacency.get(cur);
              if (!neighbors) continue;
              for (const next of neighbors) {
                if (!seen.has(next)) {
                  seen.add(next);
                  queue.push(next);
                }
              }
            }

            const sinks: Array<{ port: AVRIOPort; bit: number }> = [];
            for (const pin of mcuPins) {
              const pb = getPortBitForArduinoDigitalPin(runner, pin);
              if (pb) sinks.push(pb);
            }

            return {
              name: pinAliases[0]!,
              key: `${partId}:${actualPinId}`,
              sinks,
            };
          };

          const spiDevices: SPIRoutedDevice[] = [];
          // --- ILI9341 (SPI) Setup ---
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('ili9341')) continue;

            const csPin =
              findConnectedMcuDigitalPin(adjacency, `${part.id}:CS`, mcuPart.id) ??
              findConnectedMcuDigitalPin(adjacency, `${part.id}:SS`, mcuPart.id);
            const dcPin =
              findConnectedMcuDigitalPin(adjacency, `${part.id}:D/C`, mcuPart.id) ??
              findConnectedMcuDigitalPin(adjacency, `${part.id}:DC`, mcuPart.id);

            if (csPin == null || dcPin == null) continue;

            const cs = getPortBitForArduinoDigitalPin(runner, csPin);
            const dc = getPortBitForArduinoDigitalPin(runner, dcPin);

            if (!cs || !dc) continue;

            const dev = new ILI9341Device({
              cs,
              dc,
            });
            ili9341DevicesRef.current.push(dev);
            registerILI9341(part.id, dev);
            spiDevices.push(dev);
          }

          // --- MicroSD (SPI) Setup ---
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('microsd')) continue;

            const csPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:CS`, mcuPart.id);
            if (csPin == null) continue;

            const cs = getPortBitForArduinoDigitalPin(runner, csPin);
            if (!cs) continue;

            spiDevices.push(new MicroSDCardDevice({ cs }));
          }

          if (spiDevices.length > 0) {
            attachSPIRouter({ cpu: runner.cpu, spi: runner.spi, devices: spiDevices });
          }

          // --- DHT Setup ---
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('dht')) continue;

            const dhtType: DHTType = typeLower.includes('dht11') ? 'dht11' : 'dht22';
            const possiblePinNames = ['SDA', 'DATA', 'OUT', 'SIGNAL', 'DQ'];
            let foundPin: number | null = null;

            for (const pinName of possiblePinNames) {
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
                  const attrsRecord = attrs as Record<string, unknown>;
                  const tRaw = attrsRecord.temperature;
                  const hRaw = attrsRecord.humidity;
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

          // --- Pushbutton Setup ---
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('pushbutton') && !typeLower.includes('button')) continue;
            if (typeLower.includes('keypad') || typeLower.includes('membrane')) continue;

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

            if (foundPin == null) continue;
            const portBit = getPortBitForArduinoDigitalPin(runner, foundPin);
            if (portBit) buttonPinMapRef.current.set(part.id, portBit);
          }

          // --- Rotary Encoder (KY-040) Setup ---
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('ky-040') && !typeLower.includes('rotary-encoder') && !typeLower.includes('encoder')) continue;

            const clkPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:CLK`, mcuPart.id);
            const dtPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:DT`, mcuPart.id);
            if (clkPin == null || dtPin == null) continue;

            const clkPortBit = getPortBitForArduinoDigitalPin(runner, clkPin);
            const dtPortBit = getPortBitForArduinoDigitalPin(runner, dtPin);
            if (!clkPortBit || !dtPortBit) continue;

            encoderPinMapRef.current.set(part.id, { clk: clkPortBit, dt: dtPortBit });
            encoderQueueRef.current.set(part.id, []);

            // Default to pull-up (HIGH)
            clkPortBit.port.setPin(clkPortBit.bit, true);
            dtPortBit.port.setPin(dtPortBit.bit, true);

            // Optional push button on SW
            const swPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:SW`, mcuPart.id);
            if (swPin != null) {
              const swPortBit = getPortBitForArduinoDigitalPin(runner, swPin);
              if (swPortBit) buttonPinMapRef.current.set(part.id, swPortBit);
            }
          }

          // --- Slide Switch Setup (Simplified Digital Source) ---
          // NOTE: This does not simulate SPDT connectivity; it drives a single MCU pin based on switch state.
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('slide-switch')) continue;

            const preferredPins = ['2', '1', '3'];
            let foundPin: number | null = null;
            for (const pinName of preferredPins) {
              const mcuPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:${pinName}`, mcuPart.id);
              if (mcuPin != null) {
                foundPin = mcuPin;
                break;
              }
            }
            if (foundPin == null) continue;
            const portBit = getPortBitForArduinoDigitalPin(runner, foundPin);
            if (!portBit) continue;
            switchPinMapRef.current.set(part.id, portBit);

            const attrsRecord = (part.attrs ?? {}) as Record<string, unknown>;
            const vRaw = attrsRecord.value;
            const isOn = (typeof vRaw === 'number' ? vRaw : Number.parseInt(String(vRaw ?? '0'), 10)) === 1;
            // Active-low (matches pushbutton semantics with INPUT_PULLUP sketches)
            portBit.port.setPin(portBit.bit, !isOn);
          }

          // --- DIP Switch (8) Setup (Simplified Digital Sources) ---
          // NOTE: This does not simulate per-switch connectivity; it drives any MCU pins connected to the DIP pins.
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('dip-switch')) continue;

            const attrsRecord = (part.attrs ?? {}) as Record<string, unknown>;
            const valuesRaw = attrsRecord.values;
            const values = Array.isArray(valuesRaw) ? valuesRaw : [];

            for (let i = 1; i <= 8; i++) {
              const aPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:${i}a`, mcuPart.id);
              const bPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:${i}b`, mcuPart.id);
              const mcuPin = aPin ?? bPin;
              if (mcuPin == null) continue;
              const portBit = getPortBitForArduinoDigitalPin(runner, mcuPin);
              if (!portBit) continue;
              dipPinMapRef.current.set(`${part.id}:${i - 1}`, portBit);

              const valRaw = values[i - 1];
              const isOn = (typeof valRaw === 'number' ? valRaw : Number.parseInt(String(valRaw ?? '0'), 10)) === 1;
              portBit.port.setPin(portBit.bit, !isOn);
            }
          }

          // --- Analog Joystick Setup (ADC mapping only) ---
          // Joystick exposes two analog outputs: HORZ (X) and VERT (Y)
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('analog-joystick')) continue;

            const horzPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:HORZ`, mcuPart.id);
            const vertPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:VERT`, mcuPart.id);

            if (horzPin != null && horzPin >= 14 && horzPin <= 19) {
              analogChannelMapRef.current.set(horzPin - 14, { partId: part.id, kind: 'joystick-horz' });
            }
            if (vertPin != null && vertPin >= 14 && vertPin <= 19) {
              analogChannelMapRef.current.set(vertPin - 14, { partId: part.id, kind: 'joystick-vert' });
            }

            // Optional push button on SEL
            const selPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:SEL`, mcuPart.id);
            if (selPin != null) {
              const selPortBit = getPortBitForArduinoDigitalPin(runner, selPin);
              if (selPortBit) buttonPinMapRef.current.set(part.id, selPortBit);
            }
          }

          // --- Servo Setup ---
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('servo')) continue;

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
            servoDevicesRef.current.push(
              new ServoDevice({
                port: portBit.port,
                bit: portBit.bit,
                cpuFrequencyHz: 16_000_000,
                onAngleChange: (angle: number) => {
                  setCircuitPartAttr(partId, 'angle', angle);
                },
              })
            );
          }

          // --- Buzzer / Speaker Setup ---
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('buzzer') && !typeLower.includes('speaker') && !typeLower.includes('piezo')) continue;

            const pinNames = ['1', 'POS', 'POSITIVE', 'IN'];
            let foundPin: number | null = null;
            for (const pinName of pinNames) {
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

            speakerDevicesRef.current.push(
              new SpeakerDevice(portBit.port, portBit.bit, part.id)
            );
          }

          // --- HC-SR04 Setup (Unified Data Source Fix) ---
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('hc-sr04') && !typeLower.includes('hcsr04')) continue;

            const trigPinNames = ['TRIG', 'TRIGGER'];
            const echoPinNames = ['ECHO'];
            let trigPin: number | null = null;
            let echoPin: number | null = null;

            for (const pinName of trigPinNames) {
              const startKey = `${part.id}:${pinName}`;
              const pin = findConnectedMcuDigitalPin(adjacency, startKey, mcuPart.id);
              if (pin != null) { trigPin = pin; break; }
            }
            for (const pinName of echoPinNames) {
              const startKey = `${part.id}:${pinName}`;
              const pin = findConnectedMcuDigitalPin(adjacency, startKey, mcuPart.id);
              if (pin != null) { echoPin = pin; break; }
            }

            if (trigPin == null || echoPin == null) continue;

            const trigPortBit = getPortBitForArduinoDigitalPin(runner, trigPin);
            const echoPortBit = getPortBitForArduinoDigitalPin(runner, echoPin);
            if (!trigPortBit || !echoPortBit) continue;

            const partId = part.id;
            const interactiveManager = getInteractiveComponentManager();
            interactiveManager.registerComponent(partId, part.type);

            hcsr04DevicesRef.current.push(
              new HCSR04Device({
                trigPort: trigPortBit.port,
                trigBit: trigPortBit.bit,
                echoPort: echoPortBit.port,
                echoBit: echoPortBit.bit,
                cpuFrequencyHz: 16_000_000,
                // FIX: Check InteractiveManager first, fall back to Store
                getDistanceCm: () => {
                  const managerVal = interactiveManager.getValue(partId);
                  if (managerVal !== undefined) return managerVal;

                  const state = useAppStore.getState() as unknown as { circuitParts: CircuitPart[] };
                  const pNow = state.circuitParts.find((p) => p.id === partId);
                  const attrs = pNow?.attrs ?? {};
                  const attrsRecord = attrs as Record<string, unknown>;
                  const distRaw = attrsRecord.distance;
                  const dist = typeof distRaw === 'number' ? distRaw : Number.parseFloat(String(distRaw ?? '100'));
                  return Number.isFinite(dist) ? dist : 100;
                },
              })
            );
          }

          // --- Keypad Setup ---
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('keypad') && !typeLower.includes('membrane')) continue;

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

            if (rowPins.length === 0 || colPins.length === 0) continue;
            const partId = part.id;

            keypadDevicesRef.current.push(
              new KeypadDevice({
                rowPorts: rowPins,
                colPorts: colPins,
                getButtonState: (row: number, col: number) => {
                  const state = useAppStore.getState() as unknown as { circuitParts: CircuitPart[] };
                  const pNow = state.circuitParts.find((p) => p.id === partId);
                  const attrs = pNow?.attrs ?? {};
                  const attrsRecord = attrs as Record<string, unknown>;
                  const pressedKeys = attrsRecord.pressedKeys as string[] | undefined;
                  if (pressedKeys) {
                    const keyLayout = [['1', '2', '3', 'A'], ['4', '5', '6', 'B'], ['7', '8', '9', 'C'], ['*', '0', '#', 'D']];
                    if (row < keyLayout.length && col < keyLayout[row].length) {
                      return pressedKeys.includes(keyLayout[row][col]);
                    }
                  }
                  return false;
                },
              })
            );
          }

          // --- PIR Motion Sensor Setup ---
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('pir')) continue;

            const pirPinNames = ['OUT', 'SIG', 'SIGNAL', 'DATA'];
            let foundPin: number | null = null;

            for (const pinName of pirPinNames) {
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
            pirDevicesRef.current.push(
              new PIRDevice({
                port: portBit.port,
                bit: portBit.bit,
                cpuFrequencyHz: 16_000_000,
                readMotion: () => {
                  const state = useAppStore.getState() as unknown as { circuitParts: CircuitPart[] };
                  const pNow = state.circuitParts.find((p) => p.id === partId);
                  const attrs = pNow?.attrs ?? {};
                  const attrsRecord = attrs as Record<string, unknown>;
                  return !!attrsRecord.motion;
                },
              })
            );
          }

          // --- Photoresistor (LDR) Digital Threshold Setup ---
          // AO is handled via ADC reads; DO is HIGH when dark (AO voltage > threshold).
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('photoresistor')) continue;

            const startKey = `${part.id}:DO`;
            const pin = findConnectedMcuDigitalPin(adjacency, startKey, mcuPart.id);
            if (pin == null) continue;

            const portBit = getPortBitForArduinoDigitalPin(runner, pin);
            if (!portBit) continue;

            const partId = part.id;
            const interactiveManager = getInteractiveComponentManager();

            photoresistorDevicesRef.current.push(
              new PhotoresistorDigitalDevice({
                port: portBit.port,
                bit: portBit.bit,
                vccVolts: 5,
                readAdc: () => {
                  const managerVal = interactiveManager.getValue(partId);
                  if (managerVal !== undefined) {
                    return Math.max(0, Math.min(1023, Math.round(managerVal)));
                  }

                  const state = useAppStore.getState() as unknown as { circuitParts: CircuitPart[] };
                  const pNow = state.circuitParts.find((p) => p.id === partId);
                  const attrsRecord = (pNow?.attrs ?? {}) as Record<string, unknown>;

                  const luxRaw = attrsRecord.lux;
                  const lux = typeof luxRaw === 'number' ? luxRaw : Number.parseFloat(String(luxRaw ?? ''));
                  if (Number.isFinite(lux)) {
                    const rl10Raw = attrsRecord.rl10;
                    const gammaRaw = attrsRecord.gamma;
                    const rl10 = typeof rl10Raw === 'number' ? rl10Raw : Number.parseFloat(String(rl10Raw ?? '50'));
                    const gamma = typeof gammaRaw === 'number' ? gammaRaw : Number.parseFloat(String(gammaRaw ?? '0.7'));
                    return adcFromPhotoresistorLux(lux, {
                      vcc: 5,
                      rl10KOhm: Number.isFinite(rl10) ? rl10 : 50,
                      gamma: Number.isFinite(gamma) ? gamma : 0.7,
                    });
                  }

                  const raw = (attrsRecord.value ?? 512) as unknown;
                  const parsed = typeof raw === 'number' ? raw : Number.parseFloat(String(raw));
                  return Number.isFinite(parsed) ? Math.max(0, Math.min(1023, Math.round(parsed))) : 512;
                },
                readThresholdVolts: () => {
                  const state = useAppStore.getState() as unknown as { circuitParts: CircuitPart[] };
                  const pNow = state.circuitParts.find((p) => p.id === partId);
                  const attrsRecord = (pNow?.attrs ?? {}) as Record<string, unknown>;
                  const thrRaw = attrsRecord.threshold;
                  const thr = typeof thrRaw === 'number' ? thrRaw : Number.parseFloat(String(thrRaw ?? '2.5'));
                  return Number.isFinite(thr) ? thr : 2.5;
                },
              })
            );
          }

          // --- DS1307 RTC Setup ---
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('ds1307') && !typeLower.includes('rtc')) continue;

            // DS1307 uses I2C - just register it with the I2C bus
            // The I2C bus is automatically connected to SDA/SCL (A4/A5)
            getDS1307();
          }

          // --- DS18B20 (OneWire) Setup ---
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('ds18b20')) continue;

            const pinNames = ['DQ', 'DATA', 'OUT', 'SIG', 'SIGNAL'];
            let foundPin: number | null = null;
            for (const pinName of pinNames) {
              const pin = findConnectedMcuDigitalPin(adjacency, `${part.id}:${pinName}`, mcuPart.id);
              if (pin != null) {
                foundPin = pin;
                break;
              }
            }
            if (foundPin == null) continue;

            const portBit = getPortBitForArduinoDigitalPin(runner, foundPin);
            if (!portBit) continue;

            const partId = part.id;
            const interactiveManager = getInteractiveComponentManager();
            interactiveManager.registerComponent(partId, part.type);

            ds18b20DevicesRef.current.push(
              new DS18B20Device({
                port: portBit.port,
                bit: portBit.bit,
                cpuFrequencyHz: 16_000_000,
                readTemperatureC: () => {
                  const managerVal = interactiveManager.getValue(partId);
                  if (managerVal !== undefined) return managerVal;

                  const state = useAppStore.getState() as unknown as { circuitParts: CircuitPart[] };
                  const pNow = state.circuitParts.find((p) => p.id === partId);
                  const attrsRecord = (pNow?.attrs ?? {}) as Record<string, unknown>;
                  const tRaw = attrsRecord.temperature;
                  const t = typeof tRaw === 'number' ? tRaw : Number.parseFloat(String(tRaw ?? '25'));
                  return Number.isFinite(t) ? t : 25;
                },
              })
            );
          }

          // --- 74HC595 Shift Register Setup ---
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('74hc595') && !typeLower.includes('nlsf595')) continue;

            const dsPin =
              findConnectedMcuDigitalPin(adjacency, `${part.id}:DS`, mcuPart.id) ??
              findConnectedMcuDigitalPin(adjacency, `${part.id}:SI`, mcuPart.id);
            const shcpPin =
              findConnectedMcuDigitalPin(adjacency, `${part.id}:SHCP`, mcuPart.id) ??
              findConnectedMcuDigitalPin(adjacency, `${part.id}:SCK`, mcuPart.id);
            const stcpPin =
              findConnectedMcuDigitalPin(adjacency, `${part.id}:STCP`, mcuPart.id) ??
              findConnectedMcuDigitalPin(adjacency, `${part.id}:RCK`, mcuPart.id);

            if (dsPin == null || shcpPin == null || stcpPin == null) continue;

            const dsPortBit = getPortBitForArduinoDigitalPin(runner, dsPin);
            const shcpPortBit = getPortBitForArduinoDigitalPin(runner, shcpPin);
            const stcpPortBit = getPortBitForArduinoDigitalPin(runner, stcpPin);
            const oePin =
              findConnectedMcuDigitalPin(adjacency, `${part.id}:OE`, mcuPart.id) ??
              findConnectedMcuDigitalPin(adjacency, `${part.id}:G`, mcuPart.id);
            const mrPin =
              findConnectedMcuDigitalPin(adjacency, `${part.id}:MR`, mcuPart.id) ??
              findConnectedMcuDigitalPin(adjacency, `${part.id}:SCLR`, mcuPart.id);
            const oePortBit = oePin != null ? getPortBitForArduinoDigitalPin(runner, oePin) : null;
            const mrPortBit = mrPin != null ? getPortBitForArduinoDigitalPin(runner, mrPin) : null;

            if (!dsPortBit || !shcpPortBit || !stcpPortBit) continue;

            const partId = part.id;
            shiftRegister595Ref.current.push(
              new ShiftRegister595({
                dsPort: dsPortBit.port,
                dsBit: dsPortBit.bit,
                shcpPort: shcpPortBit.port,
                shcpBit: shcpPortBit.bit,
                stcpPort: stcpPortBit.port,
                stcpBit: stcpPortBit.bit,
                oePort: oePortBit?.port,
                oeBit: oePortBit?.bit,
                mrPort: mrPortBit?.port,
                mrBit: mrPortBit?.bit,
                onOutputChange: (outputs: number) => {
                  useAppStore.getState().updatePartAttrs(partId, { outputs });
                },
              })
            );
          }

          // --- HX711 Setup ---
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('hx711')) continue;

            const dtPin =
              findConnectedMcuDigitalPin(adjacency, `${part.id}:DT`, mcuPart.id) ??
              findConnectedMcuDigitalPin(adjacency, `${part.id}:DAT`, mcuPart.id) ??
              findConnectedMcuDigitalPin(adjacency, `${part.id}:DOUT`, mcuPart.id);
            const sckPin =
              findConnectedMcuDigitalPin(adjacency, `${part.id}:SCK`, mcuPart.id) ??
              findConnectedMcuDigitalPin(adjacency, `${part.id}:CLK`, mcuPart.id);

            if (dtPin == null || sckPin == null) continue;
            const dtPortBit = getPortBitForArduinoDigitalPin(runner, dtPin);
            const sckPortBit = getPortBitForArduinoDigitalPin(runner, sckPin);
            if (!dtPortBit || !sckPortBit) continue;

            const partId = part.id;
            hx711DevicesRef.current.push(
              new HX711Device({
                dtPort: dtPortBit.port,
                dtBit: dtPortBit.bit,
                sckPort: sckPortBit.port,
                sckBit: sckPortBit.bit,
                readRawValue: () => {
                  const state = useAppStore.getState() as unknown as { circuitParts: CircuitPart[] };
                  const pNow = state.circuitParts.find((p) => p.id === partId);
                  const attrs = (pNow?.attrs ?? {}) as Record<string, unknown>;

                  const loadRaw = attrs.load ?? attrs.value ?? 0;
                  const load = typeof loadRaw === 'number' ? loadRaw : Number.parseFloat(String(loadRaw));
                  const type = String(attrs.type ?? '50kg').toLowerCase();
                  const span = type === '5kg' ? 2100 : 21000;
                  const clampedLoad = Number.isFinite(load) ? Math.max(0, Math.min(type === '5kg' ? 5 : 50, load)) : 0;
                  const raw = Math.round((clampedLoad / (type === '5kg' ? 5 : 50)) * span);
                  return raw;
                },
              })
            );
          }

          // --- Direct Stepper Motor Setup ---
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('stepper-motor')) continue;

            const aMinusPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:A-`, mcuPart.id);
            const aPlusPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:A+`, mcuPart.id);
            const bPlusPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:B+`, mcuPart.id);
            const bMinusPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:B-`, mcuPart.id);
            if (aMinusPin == null || aPlusPin == null || bPlusPin == null || bMinusPin == null) continue;

            const aMinus = getPortBitForArduinoDigitalPin(runner, aMinusPin);
            const aPlus = getPortBitForArduinoDigitalPin(runner, aPlusPin);
            const bPlus = getPortBitForArduinoDigitalPin(runner, bPlusPin);
            const bMinus = getPortBitForArduinoDigitalPin(runner, bMinusPin);
            if (!aMinus || !aPlus || !bPlus || !bMinus) continue;

            const partId = part.id;
            stepperDevicesRef.current.push(
              new StepperMotorDevice({
                aMinus,
                aPlus,
                bPlus,
                bMinus,
                onChange: (state) => {
                  useAppStore.getState().updatePartAttrs(partId, {
                    angle: state.angle,
                    value: Math.round(state.steps),
                    units: 'Steps',
                  });
                },
              })
            );
          }

          // --- A4988 Driver Setup ---
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('a4988')) continue;

            const stepPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:STEP`, mcuPart.id);
            const dirPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:DIR`, mcuPart.id);
            if (stepPin == null || dirPin == null) continue;

            const stepPortBit = getPortBitForArduinoDigitalPin(runner, stepPin);
            const dirPortBit = getPortBitForArduinoDigitalPin(runner, dirPin);
            if (!stepPortBit || !dirPortBit) continue;

            const enablePin = findConnectedMcuDigitalPin(adjacency, `${part.id}:ENABLE`, mcuPart.id);
            const sleepPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:SLEEP`, mcuPart.id);
            const resetPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:RESET`, mcuPart.id);
            const ms1Pin = findConnectedMcuDigitalPin(adjacency, `${part.id}:MS1`, mcuPart.id);
            const ms2Pin = findConnectedMcuDigitalPin(adjacency, `${part.id}:MS2`, mcuPart.id);
            const ms3Pin = findConnectedMcuDigitalPin(adjacency, `${part.id}:MS3`, mcuPart.id);

            const targetKey = findConnectedKey(`${part.id}:1A`, (key) => {
              const idx = key.indexOf(':');
              if (idx <= 0) return false;
              const connectedPartId = key.slice(0, idx);
              const connectedPinId = key.slice(idx + 1);
              const p = partById.get(connectedPartId);
              if (!p) return false;
              const t = p.type.toLowerCase();
              if (t.includes('stepper-motor')) return connectedPinId === 'A+' || connectedPinId === 'A-' || connectedPinId === 'B+' || connectedPinId === 'B-';
              if (t.includes('biaxial-stepper')) return connectedPinId.startsWith('A1') || connectedPinId.startsWith('B1') || connectedPinId.startsWith('A2') || connectedPinId.startsWith('B2');
              return false;
            });

            const targetPartId = targetKey ? targetKey.slice(0, targetKey.indexOf(':')) : null;
            const targetPinId = targetKey ? targetKey.slice(targetKey.indexOf(':') + 1) : null;
            const targetTypeLower = targetPartId ? (partById.get(targetPartId)?.type.toLowerCase() ?? '') : '';

            const partId = part.id;
            a4988DevicesRef.current.push(
              new A4988StepperDevice({
                step: stepPortBit,
                dir: dirPortBit,
                enable: enablePin != null ? getPortBitForArduinoDigitalPin(runner, enablePin) ?? undefined : undefined,
                sleep: sleepPin != null ? getPortBitForArduinoDigitalPin(runner, sleepPin) ?? undefined : undefined,
                reset: resetPin != null ? getPortBitForArduinoDigitalPin(runner, resetPin) ?? undefined : undefined,
                ms1: ms1Pin != null ? getPortBitForArduinoDigitalPin(runner, ms1Pin) ?? undefined : undefined,
                ms2: ms2Pin != null ? getPortBitForArduinoDigitalPin(runner, ms2Pin) ?? undefined : undefined,
                ms3: ms3Pin != null ? getPortBitForArduinoDigitalPin(runner, ms3Pin) ?? undefined : undefined,
                onChange: (state) => {
                  useAppStore.getState().updatePartAttrs(partId, {
                    angle: state.angle,
                    value: Math.round(state.steps),
                    units: 'Steps',
                  });

                  if (!targetPartId) return;
                  if (targetTypeLower.includes('stepper-motor')) {
                    useAppStore.getState().updatePartAttrs(targetPartId, {
                      angle: state.angle,
                      value: Math.round(state.steps),
                      units: 'Steps',
                    });
                    return;
                  }

                  if (targetTypeLower.includes('biaxial-stepper')) {
                    const isInner = targetPinId?.startsWith('A1') || targetPinId?.startsWith('B1');
                    const attrs = isInner
                      ? { innerHandAngle: state.angle }
                      : { outerHandAngle: state.angle };
                    useAppStore.getState().updatePartAttrs(targetPartId, attrs);
                  }
                },
              })
            );
          }

          // --- 74HC165 Shift Register Setup ---
          // Note: This models the common case where D0..D7 are driven by MCU output pins.
          // Optional chaining via DS<-Q7 of another 74HC165 is supported.
          {
            const sr165DevicesByPartId = new Map<string, ShiftRegister165>();
            const pendingChainLinks: Array<{ partId: string; dsFromPartId: string }> = [];

            for (const part of circuitParts) {
              const typeLower = part.type.toLowerCase();
              if (!typeLower.includes('74hc165')) continue;

              const q7Pin = findConnectedMcuDigitalPin(adjacency, `${part.id}:Q7`, mcuPart.id);
              const cpPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:CP`, mcuPart.id);
              const plPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:PL`, mcuPart.id);
              const cePin = findConnectedMcuDigitalPin(adjacency, `${part.id}:CE`, mcuPart.id);

              if (q7Pin == null || cpPin == null || plPin == null) continue;

              const q7PortBit = getPortBitForArduinoDigitalPin(runner, q7Pin);
              const cpPortBit = getPortBitForArduinoDigitalPin(runner, cpPin);
              const plPortBit = getPortBitForArduinoDigitalPin(runner, plPin);
              const cePortBit = cePin != null ? getPortBitForArduinoDigitalPin(runner, cePin) : null;

              if (!q7PortBit || !cpPortBit || !plPortBit) continue;

              const q7nPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:Q7_N`, mcuPart.id);
              const q7nPortBit = q7nPin != null ? getPortBitForArduinoDigitalPin(runner, q7nPin) : null;

              const d: Array<ShiftRegisterPortBit | null> = [];
              for (let i = 0; i < 8; i++) {
                const dpin = findConnectedMcuDigitalPin(adjacency, `${part.id}:D${i}`, mcuPart.id);
                const dpb = dpin != null ? getPortBitForArduinoDigitalPin(runner, dpin) : null;
                d.push(dpb ? { port: dpb.port, bit: dpb.bit } : null);
              }

              // Prefer DS connected to MCU, otherwise attempt DS<-Q7 chaining.
              const dsMcuPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:DS`, mcuPart.id);
              let dsSource: ShiftRegisterPortBit | (() => boolean) | undefined;
              if (dsMcuPin != null) {
                const dsPortBit = getPortBitForArduinoDigitalPin(runner, dsMcuPin);
                if (dsPortBit) dsSource = { port: dsPortBit.port, bit: dsPortBit.bit };
              } else {
                const otherQ7Key = findConnectedKey(`${part.id}:DS`, (key) => {
                  const idx = key.indexOf(':');
                  if (idx <= 0) return false;
                  const partId = key.slice(0, idx);
                  const pinId = key.slice(idx + 1);
                  if (pinId !== 'Q7') return false;
                  const other = partById.get(partId);
                  return !!other && other.type.toLowerCase().includes('74hc165');
                });
                if (otherQ7Key) {
                  const idx = otherQ7Key.indexOf(':');
                  const fromPartId = otherQ7Key.slice(0, idx);
                  pendingChainLinks.push({ partId: part.id, dsFromPartId: fromPartId });
                }
              }

              const device = new ShiftRegister165({
                pl: { port: plPortBit.port, bit: plPortBit.bit },
                cp: { port: cpPortBit.port, bit: cpPortBit.bit },
                ce: cePortBit ? { port: cePortBit.port, bit: cePortBit.bit } : undefined,
                d,
                ds: dsSource,
                q7: { port: q7PortBit.port, bit: q7PortBit.bit },
                q7n: q7nPortBit ? { port: q7nPortBit.port, bit: q7nPortBit.bit } : undefined,
              });

              sr165DevicesByPartId.set(part.id, device);
              shiftRegister165Ref.current.push(device);
            }

            // Resolve DS chain links now that all devices exist.
            for (const link of pendingChainLinks) {
              const target = sr165DevicesByPartId.get(link.partId);
              const source = sr165DevicesByPartId.get(link.dsFromPartId);
              if (!target || !source) continue;
              target.setDsSource(() => source.getQ7());
            }
          }

          // --- MAX7219 LED Matrix Setup ---
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('max7219')) continue;

            const dinPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:DIN`, mcuPart.id);
            const clkPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:CLK`, mcuPart.id);
            const csPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:CS`, mcuPart.id);
            if (dinPin == null || clkPin == null || csPin == null) continue;

            const dinPortBit = getPortBitForArduinoDigitalPin(runner, dinPin);
            const clkPortBit = getPortBitForArduinoDigitalPin(runner, clkPin);
            const csPortBit = getPortBitForArduinoDigitalPin(runner, csPin);
            if (!dinPortBit || !clkPortBit || !csPortBit) continue;

            const partId = part.id;
            max7219DevicesRef.current.push(
              new Max7219Device({
                dinPort: dinPortBit.port,
                dinBit: dinPortBit.bit,
                clkPort: clkPortBit.port,
                clkBit: clkPortBit.bit,
                csPort: csPortBit.port,
                csBit: csPortBit.bit,
                onFrameChange: (state) => {
                  useAppStore.getState().updatePartAttrs(partId, {
                    rows: state.rows,
                    intensity: state.intensity,
                    shutdown: state.shutdown,
                    displayTest: state.displayTest,
                  });
                },
              })
            );
          }

          // --- NeoPixel / WS2812 Setup ---
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('neopixel') && !typeLower.includes('ws2812') && !typeLower.includes('led-ring')) continue;

            const dinPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:DIN`, mcuPart.id);
            if (dinPin == null) continue;
            const dinPortBit = getPortBitForArduinoDigitalPin(runner, dinPin);
            if (!dinPortBit) continue;

            const attrs = (part.attrs ?? {}) as Record<string, unknown>;
            const pixelsRaw = attrs.pixels;
            const rowsRaw = attrs.rows;
            const colsRaw = attrs.cols;

            const pixelsFromAttr = typeof pixelsRaw === 'number' ? pixelsRaw : Number.parseInt(String(pixelsRaw ?? ''), 10);
            const rows = typeof rowsRaw === 'number' ? rowsRaw : Number.parseInt(String(rowsRaw ?? ''), 10);
            const cols = typeof colsRaw === 'number' ? colsRaw : Number.parseInt(String(colsRaw ?? ''), 10);

            const pixelCount = Number.isFinite(rows) && Number.isFinite(cols) && rows > 0 && cols > 0
              ? rows * cols
              : (Number.isFinite(pixelsFromAttr) && pixelsFromAttr > 0 ? pixelsFromAttr : 1);

            const partId = part.id;
            ws2812DevicesRef.current.push(
              new WS2812Device({
                port: dinPortBit.port,
                bit: dinPortBit.bit,
                cpuFrequencyHz: 16_000_000,
                pixels: pixelCount,
                onFrame: (pixels) => {
                  // For single NeoPixel element, update r/g/b.
                  if (typeLower.includes('wokwi-neopixel') || typeLower === 'neopixel' || typeLower.includes('neopixel') && pixelCount === 1) {
                    const p0 = pixels[0] ?? { r: 0, g: 0, b: 0 };
                    useAppStore.getState().updatePartAttrs(partId, { r: p0.r, g: p0.g, b: p0.b });
                    return;
                  }

                  // For rings/matrices/strips, store a compact pixelColors array (0xRRGGBB).
                  const pixelColors = pixels.map((p) => ((p.r & 0xff) << 16) | ((p.g & 0xff) << 8) | (p.b & 0xff));
                  useAppStore.getState().updatePartAttrs(partId, { pixelColors });
                },
              })
            );
          }

          // --- TM1637 4-digit 7-segment Setup ---
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('tm1637')) continue;

            const clkPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:CLK`, mcuPart.id);
            const dioPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:DIO`, mcuPart.id);
            if (clkPin == null || dioPin == null) continue;

            const clkPortBit = getPortBitForArduinoDigitalPin(runner, clkPin);
            const dioPortBit = getPortBitForArduinoDigitalPin(runner, dioPin);
            if (!clkPortBit || !dioPortBit) continue;

            const partId = part.id;
            tm1637DevicesRef.current.push(
              new TM1637Device({
                clkPort: clkPortBit.port,
                clkBit: clkPortBit.bit,
                dioPort: dioPortBit.port,
                dioBit: dioPortBit.bit,
                onChange: (state) => {
                  useAppStore.getState().updatePartAttrs(partId, {
                    segments: state.segments,
                    brightness: state.brightness,
                    displayOn: state.displayOn,
                  });
                },
              })
            );
          }

          // --- Relay Module Setup ---
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('relay-module')) continue;

            const inPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:IN`, mcuPart.id);
            if (inPin == null) continue;
            const inPortBit = getPortBitForArduinoDigitalPin(runner, inPin);
            if (!inPortBit) continue;

            const partId = part.id;
            relayDevicesRef.current.push(
              new RelayModuleDevice({
                inPort: inPortBit.port,
                inBit: inPortBit.bit,
                transistor: ((part.attrs?.transistor as string | undefined) ?? 'npn') as RelayTransistorMode,
                onChange: (state) => {
                  useAppStore.getState().updatePartAttrs(partId, { comToNo: state.comToNo });
                },
              })
            );
          }

          // --- IR Receiver Setup ---
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!typeLower.includes('ir-receiver')) continue;

            const datPin =
              findConnectedMcuDigitalPin(adjacency, `${part.id}:DAT`, mcuPart.id) ??
              findConnectedMcuDigitalPin(adjacency, `${part.id}:OUT`, mcuPart.id) ??
              findConnectedMcuDigitalPin(adjacency, `${part.id}:SIG`, mcuPart.id);
            if (datPin == null) continue;

            const datPortBit = getPortBitForArduinoDigitalPin(runner, datPin);
            if (!datPortBit) continue;

            irDevicesRef.current.push({
              partId: part.id,
              device: new IRReceiverDevice({
                datPort: datPortBit.port,
                datBit: datPortBit.bit,
                cpuFrequencyHz: 16_000_000,
              }),
            });
          }

          // --- Logic Gates / MUX / Flip-Flops Setup ---
          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (!isLogicPartType(typeLower)) continue;

            let device: LogicDevice | null = null;
            let inputs: LogicInputBinding[] = [];
            const outputs: LogicOutputBinding[] = [];

            if (typeLower.includes('not-gate')) {
              device = new LogicGateDevice('not');
              inputs = [{ name: 'A', source: findInputSource(part.id, ['A', 'IN', 'I']) }];
              const y = findOutputSinks(part.id, ['Y', 'OUT', 'Q']);
              if (y) outputs.push(y);
            } else if (typeLower.includes('and-gate')) {
              device = new LogicGateDevice('and');
              inputs = [
                { name: 'A', source: findInputSource(part.id, ['A', 'IN1', 'I0']) },
                { name: 'B', source: findInputSource(part.id, ['B', 'IN2', 'I1']) },
              ];
              const y = findOutputSinks(part.id, ['Y', 'OUT', 'Q']);
              if (y) outputs.push(y);
            } else if (typeLower.includes('or-gate')) {
              device = new LogicGateDevice('or');
              inputs = [
                { name: 'A', source: findInputSource(part.id, ['A', 'IN1', 'I0']) },
                { name: 'B', source: findInputSource(part.id, ['B', 'IN2', 'I1']) },
              ];
              const y = findOutputSinks(part.id, ['Y', 'OUT', 'Q']);
              if (y) outputs.push(y);
            } else if (typeLower.includes('xor-gate')) {
              device = new LogicGateDevice('xor');
              inputs = [
                { name: 'A', source: findInputSource(part.id, ['A', 'IN1', 'I0']) },
                { name: 'B', source: findInputSource(part.id, ['B', 'IN2', 'I1']) },
              ];
              const y = findOutputSinks(part.id, ['Y', 'OUT', 'Q']);
              if (y) outputs.push(y);
            } else if (typeLower.includes('nand-gate')) {
              device = new LogicGateDevice('nand');
              inputs = [
                { name: 'A', source: findInputSource(part.id, ['A', 'IN1', 'I0']) },
                { name: 'B', source: findInputSource(part.id, ['B', 'IN2', 'I1']) },
              ];
              const y = findOutputSinks(part.id, ['Y', 'OUT', 'Q']);
              if (y) outputs.push(y);
            } else if (typeLower.includes('nor-gate')) {
              device = new LogicGateDevice('nor');
              inputs = [
                { name: 'A', source: findInputSource(part.id, ['A', 'IN1', 'I0']) },
                { name: 'B', source: findInputSource(part.id, ['B', 'IN2', 'I1']) },
              ];
              const y = findOutputSinks(part.id, ['Y', 'OUT', 'Q']);
              if (y) outputs.push(y);
            } else if (typeLower.includes('mux')) {
              device = new Mux2Device();
              inputs = [
                { name: 'I0', source: findInputSource(part.id, ['I0', 'A', 'IN0']) },
                { name: 'I1', source: findInputSource(part.id, ['I1', 'B', 'IN1']) },
                { name: 'S', source: findInputSource(part.id, ['S', 'SEL']) },
              ];
              const y = findOutputSinks(part.id, ['Y', 'OUT', 'Q']);
              if (y) outputs.push(y);
            } else if (typeLower.includes('flip-flop-dsr')) {
              device = new DSRFlipFlopDevice();
              inputs = [
                { name: 'D', source: findInputSource(part.id, ['D']) },
                { name: 'CLK', source: findInputSource(part.id, ['CLK', 'C']) },
                { name: 'S', source: findInputSource(part.id, ['S', 'SET']) },
                { name: 'R', source: findInputSource(part.id, ['R', 'RST', 'RESET']) },
              ];
              const q = findOutputSinks(part.id, ['Q', 'OUT']);
              const nq = findOutputSinks(part.id, ['QBAR', 'NQ', 'QB', '!Q']);
              if (q) {
                q.name = 'Q';
                outputs.push(q);
              }
              if (nq) {
                nq.name = 'NQ';
                outputs.push(nq);
              }
            } else if (typeLower.includes('flip-flop-d')) {
              device = new DFlipFlopDevice();
              inputs = [
                { name: 'D', source: findInputSource(part.id, ['D']) },
                { name: 'CLK', source: findInputSource(part.id, ['CLK', 'C']) },
              ];
              const q = findOutputSinks(part.id, ['Q', 'OUT']);
              const nq = findOutputSinks(part.id, ['QBAR', 'NQ', 'QB', '!Q']);
              if (q) {
                q.name = 'Q';
                outputs.push(q);
              }
              if (nq) {
                nq.name = 'NQ';
                outputs.push(nq);
              }
            }

            if (device && outputs.length > 0) {
              logicDevicesRef.current.push({ device, inputs, outputs });
            }
          }
        } // End mcuPart check

          // --- ADC Fix (Potentiometer / Sensors / Joystick) ---
        if (mcuPart) {
          const adjacency = buildAdjacency(connections);
          analogChannelMapRef.current = new Map();

          for (const part of circuitParts) {
            const typeLower = part.type.toLowerCase();
            if (typeLower.includes('potentiometer') || typeLower.includes('photoresistor') || typeLower.includes('temp')) {
              const signalPins = ['SIG', 'SIGNAL', 'OUT', 'WIPER', 'AO'];
              for (const pinName of signalPins) {
                const startKey = `${part.id}:${pinName}`;
                const mcuPin = findConnectedMcuDigitalPin(adjacency, startKey, mcuPart.id);
                if (mcuPin != null && mcuPin >= 14 && mcuPin <= 19) {
                  analogChannelMapRef.current.set(mcuPin - 14, { partId: part.id, kind: 'default' });
                  break;
                }
              }
            }

            if (typeLower.includes('analog-joystick')) {
              const horzPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:HORZ`, mcuPart.id);
              const vertPin = findConnectedMcuDigitalPin(adjacency, `${part.id}:VERT`, mcuPart.id);
              if (horzPin != null && horzPin >= 14 && horzPin <= 19) {
                analogChannelMapRef.current.set(horzPin - 14, { partId: part.id, kind: 'joystick-horz' });
              }
              if (vertPin != null && vertPin >= 14 && vertPin <= 19) {
                analogChannelMapRef.current.set(vertPin - 14, { partId: part.id, kind: 'joystick-vert' });
              }
            }
          }

          runner.adc.onADCRead = (input) => {
            if (input.type === ADCMuxInputType.SingleEnded) {
              const channel = (input as { channel: number }).channel;
              const source = analogChannelMapRef.current.get(channel);
              if (source) {
                // Prefer InteractiveManager (UI updates this on knob/slider interaction),
                // fall back to store attrs for persistence.
                const interactiveManager = getInteractiveComponentManager();
                const managerVal = interactiveManager.getValue(source.partId);
                const state = useAppStore.getState() as unknown as { circuitParts: CircuitPart[] };
                const part = state.circuitParts.find((p) => p.id === source.partId);
                const attrsRecord = (part?.attrs ?? {}) as Record<string, unknown>;

                const typeLower = (part?.type ?? '').toLowerCase();

                // NTC thermistor: UI value is temperature (°C), convert to ADC
                if (typeLower.includes('ntc-temperature-sensor') || typeLower.includes('thermistor') || typeLower.includes('ntc')) {
                  const tempRaw = managerVal !== undefined ? managerVal : attrsRecord.temperature;
                  const temp = typeof tempRaw === 'number' ? tempRaw : Number.parseFloat(String(tempRaw ?? '25'));
                  const betaRaw = attrsRecord.beta;
                  const beta = typeof betaRaw === 'number' ? betaRaw : Number.parseFloat(String(betaRaw ?? '3950'));

                  const adc = adcFromNtcTemperatureC(Number.isFinite(temp) ? temp : 25, {
                    beta: Number.isFinite(beta) ? beta : 3950,
                  });
                  runner.adc.completeADCRead(adc);
                  return;
                }

                // Photoresistor: UI value is already ADC; optionally support lux attr if no UI value.
                if (typeLower.includes('photoresistor')) {
                  if (managerVal !== undefined) {
                    runner.adc.completeADCRead(Math.max(0, Math.min(1023, Math.round(managerVal))));
                    return;
                  }

                  const luxRaw = attrsRecord.lux;
                  const lux = typeof luxRaw === 'number' ? luxRaw : Number.parseFloat(String(luxRaw ?? ''));
                  if (Number.isFinite(lux)) {
                    const rl10Raw = attrsRecord.rl10;
                    const gammaRaw = attrsRecord.gamma;
                    const rl10 = typeof rl10Raw === 'number' ? rl10Raw : Number.parseFloat(String(rl10Raw ?? '50'));
                    const gamma = typeof gammaRaw === 'number' ? gammaRaw : Number.parseFloat(String(gammaRaw ?? '0.7'));
                    const adc = adcFromPhotoresistorLux(lux, {
                      vcc: 5,
                      rl10KOhm: Number.isFinite(rl10) ? rl10 : 50,
                      gamma: Number.isFinite(gamma) ? gamma : 0.7,
                    });
                    runner.adc.completeADCRead(adc);
                    return;
                  }
                }

                // Default: treat as ADC (potentiometer, photoresistor slider, etc.)
                if (source.kind === 'joystick-horz' || source.kind === 'joystick-vert') {
                  const key = source.kind === 'joystick-horz' ? 'horz' : 'vert';
                  const raw = (attrsRecord[key] ?? 512) as unknown;
                  const parsed = typeof raw === 'number' ? raw : Number.parseFloat(String(raw));
                  const adc = Number.isFinite(parsed) ? parsed : 512;
                  runner.adc.completeADCRead(Math.max(0, Math.min(1023, Math.round(adc))));
                  return;
                }

                const raw = (managerVal ?? attrsRecord.value ?? attrsRecord.angle ?? 512) as unknown;
                const parsed = typeof raw === 'number' ? raw : Number.parseFloat(String(raw));
                const adc = Number.isFinite(parsed) ? parsed : 512;
                runner.adc.completeADCRead(Math.max(0, Math.min(1023, Math.round(adc))));
                return;
              }
            }
            runner.adc.completeADCRead(0);
          };
        }

        const onPortB: GPIOListener = (value) => updatePortPins('B', value);
        const onPortC: GPIOListener = (value) => updatePortPins('C', value);
        const onPortD: GPIOListener = (value) => updatePortPins('D', value);
        runner.portB.addListener(onPortB);
        runner.portC.addListener(onPortC);
        runner.portD.addListener(onPortD);

        runner.usart.onByteTransmit = (byte: number) => {
          const char = String.fromCharCode(byte);
          serialBufferRef.current += char;
          if (char === '\n') {
            const line = serialBufferRef.current.trimEnd();
            if (line) appendSerialLine(line);
            serialBufferRef.current = '';
          }
        };

        runnerRef.current = runner;
        setHasRunner(true);
      } catch (err) {
        console.error(err);
      }
    }

    if (runningRef.current) return;
    runningRef.current = true;
    setIsRunning(true);
    setHasRunner(true);
    rafRef.current = requestAnimationFrame(stepFrame);
  }, [
    hexData,
    partType,
    simulationArtifact,
    circuitParts,
    connections,
    appendSerialLine,
    flushUiSignalsIfNeeded,
    setCircuitPartAttr,
    stepFrame,
    updatePortPins,
  ]);

  const setButtonState = useCallback((partId: string, pressed: boolean) => {
    const engine = engineRef.current;
    if (engine) {
      const pinId = nonAvrControlPinMapRef.current.get(partId);
      if (!pinId) return;
      engine.writePin(pinId, pressed ? 0 : 1);
      return;
    }

    const portBit = buttonPinMapRef.current.get(partId);
    if (!portBit) return;
    portBit.port.setPin(portBit.bit, !pressed);
  }, []);

  const setSwitchState = useCallback((partId: string, isOn: boolean) => {
    const engine = engineRef.current;
    if (engine) {
      const pinId = nonAvrControlPinMapRef.current.get(partId);
      if (!pinId) return;
      engine.writePin(pinId, isOn ? 0 : 1);
      return;
    }

    const portBit = switchPinMapRef.current.get(partId);
    if (!portBit) return;
    // Active-low (consistent with button semantics)
    portBit.port.setPin(portBit.bit, !isOn);
  }, []);

  const setDipSwitchState = useCallback((partId: string, values: number[]) => {
    const engine = engineRef.current;
    if (engine) {
      for (let i = 0; i < 8; i++) {
        const pinId = nonAvrControlPinMapRef.current.get(`${partId}:${i}`) ?? nonAvrControlPinMapRef.current.get(partId);
        if (!pinId) continue;
        const valRaw = values[i];
        const isOn = (typeof valRaw === 'number' ? valRaw : Number.parseInt(String(valRaw ?? '0'), 10)) === 1;
        engine.writePin(pinId, isOn ? 0 : 1);
      }
      return;
    }

    for (let i = 0; i < 8; i++) {
      const portBit = dipPinMapRef.current.get(`${partId}:${i}`);
      if (!portBit) continue;
      const valRaw = values[i];
      const isOn = (typeof valRaw === 'number' ? valRaw : Number.parseInt(String(valRaw ?? '0'), 10)) === 1;
      portBit.port.setPin(portBit.bit, !isOn);
    }
  }, []);

  const rotateEncoder = useCallback((partId: string, direction: 'cw' | 'ccw') => {
    if (engineRef.current) {
      appendSerialLine(`[sim] encoder ${partId} ${direction}`);
      return;
    }

    const queue = encoderQueueRef.current.get(partId);
    if (!queue) return;

    // Quadrature sequence (active-low with pull-ups assumed; idle HIGH/HIGH)
    // We'll drive a few states that sketches can sample.
    const seq = direction === 'cw'
      ? [
        { clk: true, dt: true },
        { clk: false, dt: true },
        { clk: false, dt: false },
        { clk: true, dt: false },
        { clk: true, dt: true },
      ]
      : [
        { clk: true, dt: true },
        { clk: true, dt: false },
        { clk: false, dt: false },
        { clk: false, dt: true },
        { clk: true, dt: true },
      ];

    queue.push(...seq);
  }, [appendSerialLine]);

  const setAnalogValue = useCallback((partId: string, value: number) => {
    const manager = getInteractiveComponentManager();
    manager.setValue(partId, value);
    // Also update Store for persistence if needed, though ADCLoop reads store.
    setCircuitPartAttr(partId, 'value', value);
  }, [setCircuitPartAttr]);

  const isPaused = hasRunner && !isRunning;

  return { run, stop, pause, isRunning, hasRunner, isPaused, pinStates, pwmStates, serialOutput, clearSerialOutput, setButtonState, setAnalogValue, setSwitchState, setDipSwitchState, rotateEncoder };
}
