/**
 * Headless Simulation Test: DS18B20 OneWire Temperature Sensor
 *
 * Validates reset/presence and scratchpad read path for a fixed temperature.
 */

import {
  AVRRunner,
  compileSketch,
  DEFAULT_BACKEND_URL,
  makeSerialCollector,
  runForCycles,
  UNO_CPU_FREQUENCY_HZ,
} from './sim/harness';

import { DS18B20Device } from '../utils/simulation/ds18b20';

const TARGET_TEMP_C = 23.5;

const SKETCH = `
const int ONEWIRE_PIN = 2;

void owDriveLow() {
  pinMode(ONEWIRE_PIN, OUTPUT);
  digitalWrite(ONEWIRE_PIN, LOW);
}

void owRelease() {
  pinMode(ONEWIRE_PIN, INPUT_PULLUP);
}

bool owReset() {
  owDriveLow();
  delayMicroseconds(500);
  owRelease();
  delayMicroseconds(70);
  bool presence = (digitalRead(ONEWIRE_PIN) == LOW);
  delayMicroseconds(430);
  return presence;
}

void owWriteBit(uint8_t b) {
  if (b) {
    owDriveLow();
    delayMicroseconds(6);
    owRelease();
    delayMicroseconds(64);
  } else {
    owDriveLow();
    delayMicroseconds(60);
    owRelease();
    delayMicroseconds(10);
  }
}

uint8_t owReadBit() {
  owDriveLow();
  delayMicroseconds(6);
  owRelease();
  delayMicroseconds(9);
  uint8_t b = digitalRead(ONEWIRE_PIN) ? 1 : 0;
  delayMicroseconds(55);
  return b;
}

void owWriteByte(uint8_t v) {
  for (int i = 0; i < 8; i++) {
    owWriteBit(v & 1);
    v >>= 1;
  }
}

uint8_t owReadByte() {
  uint8_t v = 0;
  for (int i = 0; i < 8; i++) {
    v |= (owReadBit() << i);
  }
  return v;
}

void setup() {
  Serial.begin(115200);
  owRelease();

  if (!owReset()) {
    Serial.println("NO_PRESENCE");
    return;
  }

  owWriteByte(0xCC); // Skip ROM
  owWriteByte(0x44); // Convert T

  if (!owReset()) {
    Serial.println("NO_PRESENCE_2");
    return;
  }

  owWriteByte(0xCC); // Skip ROM
  owWriteByte(0xBE); // Read Scratchpad

  uint8_t lsb = owReadByte();
  uint8_t msb = owReadByte();
  int16_t raw = (int16_t)((msb << 8) | lsb);
  float tempC = raw / 16.0;

  Serial.print("TEMP=");
  Serial.println(tempC, 4);
}

void loop() {}
`;

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const hexText = await compileSketch(backendUrl, SKETCH, 'wokwi-arduino-uno');

  const runner = new AVRRunner(hexText);
  const serial = makeSerialCollector(runner.usart);

  const ds = new DS18B20Device({
    // D2 = PD2
    port: runner.portD,
    bit: 2,
    cpuFrequencyHz: UNO_CPU_FREQUENCY_HZ,
    readTemperatureC: () => TARGET_TEMP_C,
  });

  const maxCycles = Math.floor(UNO_CPU_FREQUENCY_HZ * 1.2);
  runForCycles(
    runner,
    (cycles) => {
      ds.tick(cycles);
    },
    maxCycles
  );

  console.log(serial.lines.join('\n'));

  const line = serial.lines.find((l) => l.startsWith('TEMP='));
  const value = line ? Number.parseFloat(line.slice(5)) : NaN;

  if (Number.isFinite(value) && Math.abs(value - TARGET_TEMP_C) < 0.5) {
    console.log(`PASS: DS18B20 read expected temperature (${value.toFixed(4)}C).`);
    process.exit(0);
  }

  console.log(`FAIL: DS18B20 mismatch. expected~${TARGET_TEMP_C} got=${Number.isFinite(value) ? value : 'NaN'}`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
