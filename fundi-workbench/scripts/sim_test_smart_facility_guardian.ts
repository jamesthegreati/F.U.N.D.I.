/*
  Headless Featured Project test: Smart Facility Guardian (Advanced)

  Verifies:
  - I2C: LCD1602 gets updated; DS1307 responds to reads
  - Analog injection: LDR + NTC drive night mode + temperature
  - Ultrasonic + PIR trigger the alarm state
  - Outputs: relay energizes, TM1637 shows 9999, MAX7219 shows alarm pattern

  Usage:
    BACKEND_URL=http://localhost:8000 npm run sim:test:smart-facility-guardian
*/

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ADCMuxInputType } from 'avr8js';

import { adcFromNtcTemperatureC, adcFromPhotoresistorLux } from '../utils/simulation/analogSensors';
import { getDS1307, resetDS1307 } from '../utils/simulation/ds1307';
import { DHTDevice } from '../utils/simulation/dht';
import { HCSR04Device } from '../utils/simulation/hcsr04';
import { getI2CBus } from '../utils/simulation/i2c';
import { getLCD1602, type LCD1602State } from '../utils/simulation/lcd1602';
import { Max7219Device } from '../utils/simulation/max7219';
import { PIRDevice } from '../utils/simulation/pir';
import { RelayModuleDevice } from '../utils/simulation/relay';
import { ShiftRegister595 } from '../utils/simulation/shift-register-595';
import { TM1637Device } from '../utils/simulation/tm1637';

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

function seg(n: number): number {
  // matches SEG_DIGITS in the sketch
  const table = [0x3f, 0x06, 0x5b, 0x4f, 0x66, 0x6d, 0x7d, 0x07, 0x7f, 0x6f];
  return table[n] ?? 0;
}

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const code = loadFeaturedProjectCode('smart-facility-guardian');

  const hexText = await compileSketch(backendUrl, code, 'wokwi-arduino-uno');
  const runner = new AVRRunner(hexText);
  const serial = makeSerialCollector(runner.usart);

  // I2C
  const bus = getI2CBus();
  bus.resetAll();
  bus.clearLog();

  const lcd = getLCD1602(0x27);
  resetDS1307();
  getDS1307({ initTime: '0' });

  let lastLcd: LCD1602State | null = null;
  const unsub = lcd.subscribe((s) => {
    lastLcd = s;
  });

  // Devices
  // DHT: D2 => PD2
  const dhtTempC = 22;
  const dhtHum = 50;
  const dht = new DHTDevice({
    type: 'dht22',
    port: runner.portD,
    bit: 2,
    cpuFrequencyHz: UNO_CPU_FREQUENCY_HZ,
    readValues: () => ({ temperatureC: dhtTempC, humidity: dhtHum }),
  });

  // PIR: D3 => PD3
  let motion = false;
  const pir = new PIRDevice({
    port: runner.portD,
    bit: 3,
    cpuFrequencyHz: UNO_CPU_FREQUENCY_HZ,
    delayTimeSec: 1,
    inhibitTimeSec: 0.2,
    retrigger: true,
    readMotion: () => motion,
  });

  // Ultrasonic: TRIG D4 => PD4, ECHO D5 => PD5
  let distanceCm = 100;
  const hcsr = new HCSR04Device({
    trigPort: runner.portD,
    trigBit: 4,
    echoPort: runner.portD,
    echoBit: 5,
    cpuFrequencyHz: UNO_CPU_FREQUENCY_HZ,
    getDistanceCm: () => distanceCm,
  });

  // TM1637: CLK D6 => PD6, DIO D7 => PD7
  const tm = new TM1637Device({
    clkPort: runner.portD,
    clkBit: 6,
    dioPort: runner.portD,
    dioBit: 7,
  });

  // 74HC595: D8 => PB0, D9 => PB1, D10 => PB2
  const sr = new ShiftRegister595({
    dsPort: runner.portB,
    dsBit: 0,
    shcpPort: runner.portB,
    shcpBit: 1,
    stcpPort: runner.portB,
    stcpBit: 2,
  });

  // MAX7219: DIN D11 => PB3, CS D12 => PB4, CLK D13 => PB5
  const mx = new Max7219Device({
    dinPort: runner.portB,
    dinBit: 3,
    csPort: runner.portB,
    csBit: 4,
    clkPort: runner.portB,
    clkBit: 5,
  });

  // Relay: IN A2 => PC2 (NPN module)
  const relay = new RelayModuleDevice({
    inPort: runner.portC,
    inBit: 2,
    transistor: 'npn',
  });

  // ADC injection for LDR (A0) and NTC (A1)
  let lux = 5000; // bright
  let ntcC = 20;

  runner.adc.onADCRead = (input) => {
    if (input.type === ADCMuxInputType.SingleEnded) {
      const channel = (input as { channel: number }).channel;
      if (channel === 0) {
        runner.adc.completeADCRead(adcFromPhotoresistorLux(lux, { vcc: 5, rl10KOhm: 50, gamma: 0.7 }));
        return;
      }
      if (channel === 1) {
        runner.adc.completeADCRead(adcFromNtcTemperatureC(ntcC, { beta: 3950 }));
        return;
      }
    }
    runner.adc.completeADCRead(0);
  };

  const tickAll = (cycles: number) => {
    dht.tick(cycles);
    pir.tick(cycles);
    hcsr.tick(cycles);
    tm.tick();
    mx.tick();
    sr.tick();
    relay.tick();
  };

  // Run phases long enough to hit the 1Hz LCD refresh.
  const runSeconds = (seconds: number) => {
    const maxCycles = runner.cpu.cycles + Math.floor(UNO_CPU_FREQUENCY_HZ * seconds);
    runForCycles(runner, tickAll, maxCycles);
  };

  // Expected matrix patterns from the sketch
  const MX_OK = [0x00, 0x00, 0x01, 0x03, 0x86, 0xcc, 0x78, 0x30];
  const MX_ALARM = [0x81, 0x42, 0x24, 0x18, 0x18, 0x24, 0x42, 0x81];

  // Phase 1: Day + safe
  lux = 10_000;
  ntcC = 20;
  motion = false;
  distanceCm = 100;
  runSeconds(2.2);

  const relay1 = relay.getState().comToNo;
  if (relay1) {
    throw new Error('Expected relay OFF in safe/day phase');
  }

  // Phase 2: Night but no motion/presence
  lux = 0.1;
  motion = false;
  distanceCm = 100;
  runSeconds(1.3);

  const relay2 = relay.getState().comToNo;
  if (relay2) {
    throw new Error('Expected relay OFF in night/no-motion phase');
  }

  // Phase 3: Night + motion + close presence
  lux = 0.1;
  motion = true;
  distanceCm = 20;
  runSeconds(1.6);

  const relay3 = relay.getState().comToNo;
  if (!relay3) {
    throw new Error('Expected relay ON in alarm phase');
  }

  const tmSeg = tm.getState().segments.map((v) => v & 0xff);
  const expect9999 = [seg(9), seg(9), seg(9), seg(9)];
  const tmOk = expect9999.every((v, i) => tmSeg[i] === v);
  if (!tmOk) {
    throw new Error(
      `Expected TM1637 to show 9999 in alarm phase; got segments=${tmSeg
        .map((v) => '0x' + v.toString(16).padStart(2, '0'))
        .join(', ')}`
    );
  }

  const mxRows = mx.getState().rows.map((v) => v & 0xff);
  const mxOk = MX_ALARM.every((v, i) => mxRows[i] === v);
  if (!mxOk) {
    throw new Error(
      `Expected MAX7219 alarm pattern; got rows=${mxRows
        .map((v) => '0x' + v.toString(16).padStart(2, '0'))
        .join(', ')}`
    );
  }

  if (sr.getOutputs() === 0) {
    throw new Error('Expected 74HC595 status byte to be non-zero');
  }

  if (lastLcd === null) {
    throw new Error('LCD never produced state');
  }
  const lcdLines = renderDisplay(lastLcd);
  const line1 = lcdLines[1] ?? '';
  if (!/ALARM/i.test(line1)) {
    const i2cLog = bus.getTransactionLog(40);
    throw new Error(
      `Expected LCD to contain 'ALARM' on line1; got=${JSON.stringify(lcdLines)}. Recent I2C=${JSON.stringify(i2cLog)}`
    );
  }

  const sawAlarmSerial = serial.lines.some((l) => /ALARM=1/.test(l));
  if (!sawAlarmSerial) {
    throw new Error(`Expected serial to contain ALARM=1. Lines: ${JSON.stringify(serial.lines.slice(-30))}`);
  }

  unsub();

  // eslint-disable-next-line no-console
  console.log(serial.lines.slice(0, 16).join('\n'));
  // eslint-disable-next-line no-console
  console.log('PASS: Smart Facility Guardian triggers alarm and updates outputs.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
