'use client';

/**
 * Input Component Test Projects
 *
 * A library of ready-made Arduino Uno test circuits for every common input
 * component supported by the FUNDI workbench.  Each entry follows the same
 * `FeaturedProject` interface used by `lib/featuredProjects.ts` so it can be
 * loaded directly into the circuit editor.
 *
 * Projects are grouped into `INPUT_TEST_CATEGORIES` for display in the
 * ComponentTestsPanel. Use `getInputTestProjects()` to retrieve the full list.
 */
import type { FeaturedProject } from '@/lib/featuredProjects';

const INPUT_TEST_PROJECTS: FeaturedProject[] = [
  // ── Switches & Buttons ────────────────────────────────────────────────────
  {
    id: 'pushbutton-test',
    name: 'Pushbutton Input Test',
    description: 'Read a pushbutton on D2 with internal pull-up; toggle LED on D13 on each press.',
    difficulty: 'beginner',
    tags: ['button', 'digital-input', 'led'],
    estimatedTime: '5 min',
    diagram: {
      version: 1,
      author: 'FUNDI Tests',
      editor: 'wokwi',
      parts: [
        { type: 'wokwi-arduino-uno', id: 'uno', top: 0, left: 0 },
        { type: 'wokwi-pushbutton', id: 'btn1', top: -120, left: 200, attrs: { color: 'green' } },
        { type: 'wokwi-led', id: 'led1', top: -120, left: 320, attrs: { color: 'red' } },
        { type: 'wokwi-resistor', id: 'r1', top: -80, left: 320, attrs: { value: '220' } },
      ],
      connections: [
        ['uno:2', 'btn1:1.l', 'orange', []],
        ['btn1:2.l', 'uno:GND.1', 'black', []],
        ['uno:13', 'r1:1', 'green', []],
        ['r1:2', 'led1:A', 'green', []],
        ['led1:C', 'uno:GND.2', 'black', []],
      ],
    },
    code: `// Pushbutton Input Test
// Button on D2 (INPUT_PULLUP), LED on D13

const int BTN_PIN = 2;
const int LED_PIN = 13;

bool ledState = false;
bool lastBtnState = HIGH;

void setup() {
  pinMode(BTN_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Pushbutton Test Ready");
}

void loop() {
  bool btnState = digitalRead(BTN_PIN);
  if (btnState == LOW && lastBtnState == HIGH) {
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState ? HIGH : LOW);
    Serial.print("Button pressed! LED: ");
    Serial.println(ledState ? "ON" : "OFF");
    delay(50); // debounce
  }
  lastBtnState = btnState;
}`,
  },

  {
    id: 'slide-switch-test',
    name: 'Slide Switch Test',
    description: 'Read a slide switch on D2 with pull-up; control LED on D13.',
    difficulty: 'beginner',
    tags: ['switch', 'digital-input', 'led'],
    estimatedTime: '5 min',
    diagram: {
      version: 1,
      author: 'FUNDI Tests',
      editor: 'wokwi',
      parts: [
        { type: 'wokwi-arduino-uno', id: 'uno', top: 0, left: 0 },
        { type: 'wokwi-slide-switch', id: 'sw1', top: -120, left: 200 },
        { type: 'wokwi-led', id: 'led1', top: -120, left: 320, attrs: { color: 'yellow' } },
        { type: 'wokwi-resistor', id: 'r1', top: -80, left: 320, attrs: { value: '220' } },
      ],
      connections: [
        ['uno:2', 'sw1:1', 'orange', []],
        ['sw1:2', 'uno:GND.1', 'black', []],
        ['uno:13', 'r1:1', 'green', []],
        ['r1:2', 'led1:A', 'green', []],
        ['led1:C', 'uno:GND.2', 'black', []],
      ],
    },
    code: `// Slide Switch Test
// Switch on D2 (INPUT_PULLUP), LED on D13

const int SW_PIN = 2;
const int LED_PIN = 13;

void setup() {
  pinMode(SW_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Slide Switch Test Ready");
}

void loop() {
  bool swState = digitalRead(SW_PIN);
  digitalWrite(LED_PIN, swState == LOW ? HIGH : LOW);
  Serial.print("Switch: ");
  Serial.println(swState == LOW ? "CLOSED (LED ON)" : "OPEN (LED OFF)");
  delay(200);
}`,
  },

  {
    id: 'dip-switch-test',
    name: 'DIP Switch (8) Test',
    description: 'Read an 8-position DIP switch on D2-D9; print the binary pattern to Serial.',
    difficulty: 'beginner',
    tags: ['dip-switch', 'digital-input', 'serial'],
    estimatedTime: '10 min',
    diagram: {
      version: 1,
      author: 'FUNDI Tests',
      editor: 'wokwi',
      parts: [
        { type: 'wokwi-arduino-uno', id: 'uno', top: 0, left: 0 },
        { type: 'wokwi-dip-switch-8', id: 'dip1', top: -140, left: 200 },
      ],
      connections: [
        ['uno:2', 'dip1:1A', 'blue', []],
        ['uno:3', 'dip1:2A', 'blue', []],
        ['uno:4', 'dip1:3A', 'blue', []],
        ['uno:5', 'dip1:4A', 'blue', []],
        ['uno:6', 'dip1:5A', 'blue', []],
        ['uno:7', 'dip1:6A', 'blue', []],
        ['uno:8', 'dip1:7A', 'blue', []],
        ['uno:9', 'dip1:8A', 'blue', []],
        ['dip1:1B', 'uno:GND.1', 'black', []],
        ['dip1:2B', 'uno:GND.2', 'black', []],
        ['dip1:3B', 'uno:GND.3', 'black', []],
        ['dip1:4B', 'uno:GND.4', 'black', []],
        ['dip1:5B', 'uno:GND.5', 'black', []],
        ['dip1:6B', 'uno:GND.6', 'black', []],
        ['dip1:7B', 'uno:GND.7', 'black', []],
        ['dip1:8B', 'uno:GND.8', 'black', []],
      ],
    },
    code: `// DIP Switch (8) Test
// 8-position DIP switch on D2-D9 (INPUT_PULLUP)

const int SW_PINS[] = {2, 3, 4, 5, 6, 7, 8, 9};
const int SW_COUNT = 8;

void setup() {
  for (int i = 0; i < SW_COUNT; i++) {
    pinMode(SW_PINS[i], INPUT_PULLUP);
  }
  Serial.begin(9600);
  Serial.println("DIP Switch Test Ready");
}

void loop() {
  uint8_t pattern = 0;
  Serial.print("Switches: ");
  for (int i = 0; i < SW_COUNT; i++) {
    bool sw = digitalRead(SW_PINS[i]) == LOW;
    if (sw) pattern |= (1 << i);
    Serial.print(sw ? '1' : '0');
  }
  Serial.print("  (0x");
  Serial.print(pattern, HEX);
  Serial.println(")");
  delay(500);
}`,
  },

  // ── Analog Inputs ────────────────────────────────────────────────────────
  {
    id: 'potentiometer-test',
    name: 'Potentiometer Test',
    description: 'Read a potentiometer on A0; map its value to LED brightness on D9 (PWM) and print to Serial.',
    difficulty: 'beginner',
    tags: ['potentiometer', 'analog-input', 'pwm', 'led'],
    estimatedTime: '5 min',
    diagram: {
      version: 1,
      author: 'FUNDI Tests',
      editor: 'wokwi',
      parts: [
        { type: 'wokwi-arduino-uno', id: 'uno', top: 0, left: 0 },
        { type: 'wokwi-potentiometer', id: 'pot1', top: -130, left: 180 },
        { type: 'wokwi-led', id: 'led1', top: -130, left: 320, attrs: { color: 'blue' } },
        { type: 'wokwi-resistor', id: 'r1', top: -90, left: 320, attrs: { value: '220' } },
      ],
      connections: [
        ['pot1:VCC', 'uno:5V', 'red', []],
        ['pot1:GND', 'uno:GND.1', 'black', []],
        ['pot1:SIG', 'uno:A0', 'orange', []],
        ['uno:9', 'r1:1', 'green', []],
        ['r1:2', 'led1:A', 'green', []],
        ['led1:C', 'uno:GND.2', 'black', []],
      ],
    },
    code: `// Potentiometer Test
// Pot on A0, LED brightness on D9 (PWM)

const int POT_PIN = A0;
const int LED_PIN = 9;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Potentiometer Test Ready");
}

void loop() {
  int adcVal = analogRead(POT_PIN);           // 0-1023
  int brightness = map(adcVal, 0, 1023, 0, 255);
  analogWrite(LED_PIN, brightness);
  Serial.print("ADC: ");
  Serial.print(adcVal);
  Serial.print("  Brightness: ");
  Serial.println(brightness);
  delay(100);
}`,
  },

  {
    id: 'slide-potentiometer-test',
    name: 'Slide Potentiometer Test',
    description: 'Read a slide potentiometer on A0; map its value to LED brightness on D9 (PWM).',
    difficulty: 'beginner',
    tags: ['slide-potentiometer', 'analog-input', 'pwm', 'led'],
    estimatedTime: '5 min',
    diagram: {
      version: 1,
      author: 'FUNDI Tests',
      editor: 'wokwi',
      parts: [
        { type: 'wokwi-arduino-uno', id: 'uno', top: 0, left: 0 },
        { type: 'wokwi-slide-potentiometer', id: 'spot1', top: -130, left: 180 },
        { type: 'wokwi-led', id: 'led1', top: -130, left: 340, attrs: { color: 'green' } },
        { type: 'wokwi-resistor', id: 'r1', top: -90, left: 340, attrs: { value: '220' } },
      ],
      connections: [
        ['spot1:VCC', 'uno:5V', 'red', []],
        ['spot1:GND', 'uno:GND.1', 'black', []],
        ['spot1:SIG', 'uno:A0', 'orange', []],
        ['uno:9', 'r1:1', 'green', []],
        ['r1:2', 'led1:A', 'green', []],
        ['led1:C', 'uno:GND.2', 'black', []],
      ],
    },
    code: `// Slide Potentiometer Test
// Slide pot on A0, LED brightness on D9 (PWM)

const int POT_PIN = A0;
const int LED_PIN = 9;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Slide Potentiometer Test Ready");
}

void loop() {
  int adcVal = analogRead(POT_PIN);
  int brightness = map(adcVal, 0, 1023, 0, 255);
  analogWrite(LED_PIN, brightness);
  Serial.print("ADC: ");
  Serial.print(adcVal);
  Serial.print("  Brightness: ");
  Serial.println(brightness);
  delay(100);
}`,
  },

  {
    id: 'photoresistor-test',
    name: 'Photoresistor (LDR) Test',
    description: 'Read a photoresistor on A0; print light level and drive LED brightness via PWM on D9.',
    difficulty: 'beginner',
    tags: ['photoresistor', 'ldr', 'analog-input', 'pwm'],
    estimatedTime: '5 min',
    diagram: {
      version: 1,
      author: 'FUNDI Tests',
      editor: 'wokwi',
      parts: [
        { type: 'wokwi-arduino-uno', id: 'uno', top: 0, left: 0 },
        { type: 'wokwi-photoresistor-sensor', id: 'ldr1', top: -130, left: 200 },
        { type: 'wokwi-led', id: 'led1', top: -130, left: 340, attrs: { color: 'yellow' } },
        { type: 'wokwi-resistor', id: 'r1', top: -90, left: 340, attrs: { value: '220' } },
      ],
      connections: [
        ['ldr1:VCC', 'uno:5V', 'red', []],
        ['ldr1:GND', 'uno:GND.1', 'black', []],
        ['ldr1:AO', 'uno:A0', 'orange', []],
        ['uno:9', 'r1:1', 'green', []],
        ['r1:2', 'led1:A', 'green', []],
        ['led1:C', 'uno:GND.2', 'black', []],
      ],
    },
    code: `// Photoresistor (LDR) Test
// LDR on A0, LED brightness on D9

const int LDR_PIN = A0;
const int LED_PIN = 9;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Photoresistor Test Ready");
}

void loop() {
  int lightVal = analogRead(LDR_PIN);
  // Invert so LED is bright when dark
  int brightness = map(lightVal, 0, 1023, 255, 0);
  analogWrite(LED_PIN, brightness);
  Serial.print("Light ADC: ");
  Serial.print(lightVal);
  Serial.print("  LED brightness: ");
  Serial.println(brightness);
  delay(200);
}`,
  },

  {
    id: 'ntc-thermistor-test',
    name: 'NTC Thermistor Test',
    description: 'Read an NTC thermistor on A0 and print temperature in °C via Steinhart-Hart equation.',
    difficulty: 'intermediate',
    tags: ['ntc', 'thermistor', 'analog-input', 'temperature'],
    estimatedTime: '10 min',
    diagram: {
      version: 1,
      author: 'FUNDI Tests',
      editor: 'wokwi',
      parts: [
        { type: 'wokwi-arduino-uno', id: 'uno', top: 0, left: 0 },
        { type: 'wokwi-ntc-temperature-sensor', id: 'ntc1', top: -120, left: 200 },
      ],
      connections: [
        ['ntc1:VCC', 'uno:5V', 'red', []],
        ['ntc1:GND', 'uno:GND.1', 'black', []],
        ['ntc1:OUT', 'uno:A0', 'orange', []],
      ],
    },
    code: `// NTC Thermistor Test
// NTC on A0 via voltage divider

#include <math.h>

const int NTC_PIN = A0;
const float SERIES_RESISTOR = 10000.0; // 10kΩ series resistor
const float NOMINAL_RESISTANCE = 10000.0; // NTC nominal at 25°C
const float NOMINAL_TEMPERATURE = 25.0;
const float B_COEFFICIENT = 3950.0;
const float SUPPLY_VOLTAGE = 5.0;

void setup() {
  Serial.begin(9600);
  Serial.println("NTC Thermistor Test Ready");
}

void loop() {
  int rawADC = analogRead(NTC_PIN);
  float voltage = rawADC * (SUPPLY_VOLTAGE / 1023.0);
  float resistance = SERIES_RESISTOR * (SUPPLY_VOLTAGE / voltage - 1.0);

  // Steinhart-Hart simplified (B parameter equation)
  float steinhart = resistance / NOMINAL_RESISTANCE;
  steinhart = log(steinhart);
  steinhart /= B_COEFFICIENT;
  steinhart += 1.0 / (NOMINAL_TEMPERATURE + 273.15);
  float tempC = (1.0 / steinhart) - 273.15;

  Serial.print("ADC: ");
  Serial.print(rawADC);
  Serial.print("  Resistance: ");
  Serial.print(resistance, 0);
  Serial.print(" Ω  Temp: ");
  Serial.print(tempC, 1);
  Serial.println(" °C");
  delay(1000);
}`,
  },

  {
    id: 'analog-joystick-test',
    name: 'Analog Joystick Test',
    description: 'Read a joystick HORZ on A0, VERT on A1, SW on D2; print X/Y/button to Serial.',
    difficulty: 'beginner',
    tags: ['joystick', 'analog-input', 'digital-input'],
    estimatedTime: '5 min',
    diagram: {
      version: 1,
      author: 'FUNDI Tests',
      editor: 'wokwi',
      parts: [
        { type: 'wokwi-arduino-uno', id: 'uno', top: 0, left: 0 },
        { type: 'wokwi-analog-joystick', id: 'joy1', top: -140, left: 200 },
      ],
      connections: [
        ['joy1:VCC', 'uno:5V', 'red', []],
        ['joy1:GND', 'uno:GND.1', 'black', []],
        ['joy1:HORZ', 'uno:A0', 'orange', []],
        ['joy1:VERT', 'uno:A1', 'yellow', []],
        ['joy1:SEL', 'uno:2', 'blue', []],
      ],
    },
    code: `// Analog Joystick Test
// HORZ on A0, VERT on A1, SW on D2

const int HORZ_PIN = A0;
const int VERT_PIN = A1;
const int SW_PIN   = 2;

void setup() {
  pinMode(SW_PIN, INPUT_PULLUP);
  Serial.begin(9600);
  Serial.println("Joystick Test Ready");
}

void loop() {
  int xVal = analogRead(HORZ_PIN);
  int yVal = analogRead(VERT_PIN);
  bool btn = digitalRead(SW_PIN) == LOW;

  Serial.print("X: ");
  Serial.print(xVal);
  Serial.print("  Y: ");
  Serial.print(yVal);
  Serial.print("  BTN: ");
  Serial.println(btn ? "PRESSED" : "released");
  delay(200);
}`,
  },

  // ── Environmental Sensors ────────────────────────────────────────────────
  {
    id: 'dht22-test',
    name: 'DHT22 Sensor Test',
    description: 'Read temperature and humidity from a DHT22 on D2; print both values to Serial every 2 s.',
    difficulty: 'beginner',
    tags: ['dht22', 'temperature', 'humidity', 'digital-input'],
    estimatedTime: '10 min',
    diagram: {
      version: 1,
      author: 'FUNDI Tests',
      editor: 'wokwi',
      parts: [
        { type: 'wokwi-arduino-uno', id: 'uno', top: 0, left: 0 },
        { type: 'wokwi-dht22', id: 'dht1', top: -120, left: 200 },
      ],
      connections: [
        ['dht1:VCC', 'uno:5V', 'red', []],
        ['dht1:SDA', 'uno:2', 'yellow', []],
        ['dht1:GND', 'uno:GND.1', 'black', []],
      ],
    },
    code: `// DHT22 Sensor Test
// Requires: DHT sensor library by Adafruit

#include <DHT.h>

#define DHT_PIN  2
#define DHT_TYPE DHT22

DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
  Serial.println("DHT22 Test Ready");
}

void loop() {
  delay(2000);
  float humidity = dht.readHumidity();
  float tempC    = dht.readTemperature();

  if (isnan(humidity) || isnan(tempC)) {
    Serial.println("ERROR: Failed to read from DHT22!");
    return;
  }

  Serial.print("Humidity: ");
  Serial.print(humidity, 1);
  Serial.print(" %  Temperature: ");
  Serial.print(tempC, 1);
  Serial.println(" °C");
}`,
  },

  {
    id: 'ds18b20-test',
    name: 'DS18B20 Temperature Test',
    description: 'Read temperature from a DS18B20 1-Wire sensor on D2; print to Serial every second.',
    difficulty: 'intermediate',
    tags: ['ds18b20', 'temperature', '1-wire'],
    estimatedTime: '10 min',
    diagram: {
      version: 1,
      author: 'FUNDI Tests',
      editor: 'wokwi',
      parts: [
        { type: 'wokwi-arduino-uno', id: 'uno', top: 0, left: 0 },
        { type: 'wokwi-ds18b20', id: 'ds1', top: -120, left: 200 },
        { type: 'wokwi-resistor', id: 'r1', top: -120, left: 290, attrs: { value: '4700' } },
      ],
      connections: [
        ['ds1:VDD', 'uno:5V', 'red', []],
        ['ds1:GND', 'uno:GND.1', 'black', []],
        ['ds1:DQ', 'r1:1', 'yellow', []],
        ['r1:2', 'uno:5V', 'red', []],
        ['ds1:DQ', 'uno:2', 'yellow', []],
      ],
    },
    code: `// DS18B20 Temperature Test
// Requires: OneWire + DallasTemperature libraries

#include <OneWire.h>
#include <DallasTemperature.h>

#define ONE_WIRE_BUS 2

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(9600);
  sensors.begin();
  Serial.println("DS18B20 Test Ready");
}

void loop() {
  sensors.requestTemperatures();
  float tempC = sensors.getTempCByIndex(0);

  if (tempC == DEVICE_DISCONNECTED_C) {
    Serial.println("ERROR: DS18B20 not found!");
  } else {
    Serial.print("Temperature: ");
    Serial.print(tempC, 2);
    Serial.println(" °C");
  }
  delay(1000);
}`,
  },

  {
    id: 'hc-sr04-test',
    name: 'HC-SR04 Distance Test',
    description: 'Measure distance with HC-SR04 (TRIG D10, ECHO D11); blink LED on D13 based on proximity.',
    difficulty: 'beginner',
    tags: ['hc-sr04', 'ultrasonic', 'distance', 'led'],
    estimatedTime: '10 min',
    diagram: {
      version: 1,
      author: 'FUNDI Tests',
      editor: 'wokwi',
      parts: [
        { type: 'wokwi-arduino-uno', id: 'uno', top: 0, left: 0 },
        { type: 'wokwi-hc-sr04', id: 'hcsr1', top: -130, left: 200 },
        { type: 'wokwi-led', id: 'led1', top: -130, left: 360, attrs: { color: 'red' } },
        { type: 'wokwi-resistor', id: 'r1', top: -90, left: 360, attrs: { value: '220' } },
      ],
      connections: [
        ['hcsr1:VCC', 'uno:5V', 'red', []],
        ['hcsr1:GND', 'uno:GND.1', 'black', []],
        ['hcsr1:TRIG', 'uno:10', 'orange', []],
        ['hcsr1:ECHO', 'uno:11', 'yellow', []],
        ['uno:13', 'r1:1', 'green', []],
        ['r1:2', 'led1:A', 'green', []],
        ['led1:C', 'uno:GND.2', 'black', []],
      ],
    },
    code: `// HC-SR04 Distance Test
// TRIG on D10, ECHO on D11, LED on D13

const int TRIG_PIN = 10;
const int ECHO_PIN = 11;
const int LED_PIN  = 13;
const float CLOSE_CM = 20.0; // LED on when closer than 20 cm

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("HC-SR04 Distance Test Ready");
}

float measureDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  return duration * 0.0343 / 2.0;
}

void loop() {
  float dist = measureDistance();
  Serial.print("Distance: ");
  Serial.print(dist, 1);
  Serial.println(" cm");
  digitalWrite(LED_PIN, dist > 0 && dist < CLOSE_CM ? HIGH : LOW);
  delay(200);
}`,
  },

  {
    id: 'pir-motion-test',
    name: 'PIR Motion Sensor Test',
    description: 'Detect motion with a PIR sensor on D2; illuminate LED on D13 when motion is detected.',
    difficulty: 'beginner',
    tags: ['pir', 'motion', 'digital-input', 'led'],
    estimatedTime: '5 min',
    diagram: {
      version: 1,
      author: 'FUNDI Tests',
      editor: 'wokwi',
      parts: [
        { type: 'wokwi-arduino-uno', id: 'uno', top: 0, left: 0 },
        { type: 'wokwi-pir-motion-sensor', id: 'pir1', top: -130, left: 200 },
        { type: 'wokwi-led', id: 'led1', top: -130, left: 340, attrs: { color: 'red' } },
        { type: 'wokwi-resistor', id: 'r1', top: -90, left: 340, attrs: { value: '220' } },
      ],
      connections: [
        ['pir1:VCC', 'uno:5V', 'red', []],
        ['pir1:GND', 'uno:GND.1', 'black', []],
        ['pir1:OUT', 'uno:2', 'yellow', []],
        ['uno:13', 'r1:1', 'green', []],
        ['r1:2', 'led1:A', 'green', []],
        ['led1:C', 'uno:GND.2', 'black', []],
      ],
    },
    code: `// PIR Motion Sensor Test
// PIR OUT on D2, LED on D13

const int PIR_PIN = 2;
const int LED_PIN = 13;

void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("PIR Motion Test Ready - waiting for motion...");
}

void loop() {
  int motion = digitalRead(PIR_PIN);
  digitalWrite(LED_PIN, motion);
  if (motion == HIGH) {
    Serial.println("Motion DETECTED!");
  }
  delay(100);
}`,
  },

  // ── Motion & IMU ─────────────────────────────────────────────────────────
  {
    id: 'mpu6050-test',
    name: 'MPU6050 IMU Test (Arduino Uno)',
    description: 'Read accelerometer and gyroscope from MPU6050 on I2C (SDA=A4, SCL=A5); print all 6 axes to Serial. Uses raw Wire.h — no external library needed.',
    difficulty: 'intermediate',
    tags: ['mpu6050', 'imu', 'i2c', 'accelerometer', 'gyroscope'],
    estimatedTime: '15 min',
    diagram: {
      version: 1,
      author: 'FUNDI Tests',
      editor: 'wokwi',
      parts: [
        { type: 'wokwi-arduino-uno', id: 'uno', top: 0, left: 0 },
        { type: 'wokwi-mpu6050', id: 'imu1', top: -140, left: 200 },
      ],
      connections: [
        ['imu1:VCC', 'uno:5V', 'red', []],
        ['imu1:GND', 'uno:GND.1', 'black', []],
        ['imu1:SCL', 'uno:A5', 'blue', []],
        ['imu1:SDA', 'uno:A4', 'yellow', []],
      ],
    },
    code: `// MPU6050 IMU Test (Arduino Uno)
// Raw Wire.h — no external library required.
// SDA → A4, SCL → A5 (Uno / Nano default I2C pins)
// Click the MPU6050 on the canvas to adjust simulated sensor values.

#include <Wire.h>

static const uint8_t MPU_ADDR = 0x68;

// Write one byte to a register
void writeReg(uint8_t reg, uint8_t val) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

// Read a signed 16-bit word from two consecutive registers (big-endian)
int16_t readWord(uint8_t reg) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.endTransmission(false);          // repeated-start (no STOP)
  Wire.requestFrom(MPU_ADDR, (uint8_t)2);
  int16_t hi = Wire.available() ? Wire.read() : 0;
  int16_t lo = Wire.available() ? Wire.read() : 0;
  return (int16_t)((hi << 8) | lo);
}

void setup() {
  Serial.begin(9600);
  Wire.begin();

  // Wake MPU6050: clear SLEEP bit in PWR_MGMT_1 (0x6B)
  writeReg(0x6B, 0x00);
  delay(100);

  // Verify WHO_AM_I register (0x75) — should be 0x68
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x75);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, (uint8_t)1);
  uint8_t whoAmI = Wire.available() ? Wire.read() : 0xFF;

  if (whoAmI != 0x68) {
    Serial.print("ERROR: MPU6050 not found! WHO_AM_I=0x");
    Serial.println(whoAmI, HEX);
    while (1) delay(10);
  }

  Serial.println("MPU6050 Test Ready");
  Serial.println("Adjust sensor values by clicking the MPU6050 on the canvas.");
}

void loop() {
  // Raw register addresses:
  //   0x3B-0x3C  ACCEL_XOUT  |  0x3D-0x3E  ACCEL_YOUT  |  0x3F-0x40  ACCEL_ZOUT
  //   0x43-0x44  GYRO_XOUT   |  0x45-0x46  GYRO_YOUT   |  0x47-0x48  GYRO_ZOUT
  // Sensitivity defaults (FS_SEL = 0):
  //   Accel: 16384 LSB/g   |   Gyro: 131 LSB/(°/s)
  int16_t ax = readWord(0x3B);
  int16_t ay = readWord(0x3D);
  int16_t az = readWord(0x3F);
  int16_t gx = readWord(0x43);
  int16_t gy = readWord(0x45);
  int16_t gz = readWord(0x47);

  float accelX = ax / 16384.0f;
  float accelY = ay / 16384.0f;
  float accelZ = az / 16384.0f;
  float gyroX  = gx / 131.0f;
  float gyroY  = gy / 131.0f;
  float gyroZ  = gz / 131.0f;

  Serial.print("Accel X: "); Serial.print(accelX, 2);
  Serial.print("  Y: ");     Serial.print(accelY, 2);
  Serial.print("  Z: ");     Serial.print(accelZ, 2);
  Serial.print(" g  |  Gyro X: "); Serial.print(gyroX, 2);
  Serial.print("  Y: ");     Serial.print(gyroY, 2);
  Serial.print("  Z: ");     Serial.print(gyroZ, 2);
  Serial.println(" deg/s");

  delay(500);
}`,
  },

  {
    id: 'mpu6050-esp32-test',
    name: 'MPU6050 IMU Test (ESP32)',
    description: 'Read accelerometer and gyroscope from MPU6050 on ESP32 I2C (SDA=GPIO21, SCL=GPIO22); print all 6 axes to Serial at 115200 baud. Uses raw Wire.h — no external library needed.',
    difficulty: 'intermediate',
    tags: ['mpu6050', 'imu', 'i2c', 'accelerometer', 'gyroscope', 'esp32', 'non-avr'],
    estimatedTime: '15 min',
    diagram: {
      version: 1,
      author: 'FUNDI Tests',
      editor: 'wokwi',
      parts: [
        { type: 'wokwi-esp32-devkit-v1', id: 'esp', top: 0, left: 0 },
        { type: 'wokwi-mpu6050', id: 'imu1', top: -140, left: 260 },
      ],
      connections: [
        ['imu1:VCC', 'esp:3V3', 'red', []],
        ['imu1:GND', 'esp:GND.1', 'black', []],
        ['imu1:SCL', 'esp:IO22', 'blue', []],
        ['imu1:SDA', 'esp:IO21', 'yellow', []],
      ],
    },
    code: `// MPU6050 IMU Test (ESP32)
// Raw Wire.h — no external library required.
// SDA → GPIO21, SCL → GPIO22 (ESP32 default I2C pins)
// Click the MPU6050 on the canvas to adjust simulated sensor values.

#include <Wire.h>

static const uint8_t MPU_ADDR = 0x68;

// Write one byte to a register
void writeReg(uint8_t reg, uint8_t val) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

// Read a signed 16-bit word from two consecutive registers (big-endian)
int16_t readWord(uint8_t reg) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.endTransmission(false);          // repeated-start (no STOP)
  Wire.requestFrom(MPU_ADDR, (uint8_t)2);
  int16_t hi = Wire.available() ? Wire.read() : 0;
  int16_t lo = Wire.available() ? Wire.read() : 0;
  return (int16_t)((hi << 8) | lo);
}

void setup() {
  Serial.begin(115200);
  // ESP32 default I2C: SDA = GPIO21, SCL = GPIO22
  Wire.begin(21, 22);

  // Wake MPU6050: clear SLEEP bit in PWR_MGMT_1 (0x6B)
  writeReg(0x6B, 0x00);
  delay(100);

  // Verify WHO_AM_I register (0x75) — should be 0x68
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x75);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, (uint8_t)1);
  uint8_t whoAmI = Wire.available() ? Wire.read() : 0xFF;

  if (whoAmI != 0x68) {
    Serial.print("ERROR: MPU6050 not found! WHO_AM_I=0x");
    Serial.println(whoAmI, HEX);
    while (1) delay(10);
  }

  Serial.println("MPU6050 Test Ready (ESP32)");
  Serial.println("Adjust sensor values by clicking the MPU6050 on the canvas.");
}

void loop() {
  // Raw register addresses:
  //   0x3B-0x3C  ACCEL_XOUT  |  0x3D-0x3E  ACCEL_YOUT  |  0x3F-0x40  ACCEL_ZOUT
  //   0x43-0x44  GYRO_XOUT   |  0x45-0x46  GYRO_YOUT   |  0x47-0x48  GYRO_ZOUT
  // Sensitivity defaults (FS_SEL = 0):
  //   Accel: 16384 LSB/g   |   Gyro: 131 LSB/(°/s)
  int16_t ax = readWord(0x3B);
  int16_t ay = readWord(0x3D);
  int16_t az = readWord(0x3F);
  int16_t gx = readWord(0x43);
  int16_t gy = readWord(0x45);
  int16_t gz = readWord(0x47);

  float accelX = ax / 16384.0f;
  float accelY = ay / 16384.0f;
  float accelZ = az / 16384.0f;
  float gyroX  = gx / 131.0f;
  float gyroY  = gy / 131.0f;
  float gyroZ  = gz / 131.0f;

  Serial.print("Accel X: "); Serial.print(accelX, 2);
  Serial.print("  Y: ");     Serial.print(accelY, 2);
  Serial.print("  Z: ");     Serial.print(accelZ, 2);
  Serial.print(" g  |  Gyro X: "); Serial.print(gyroX, 2);
  Serial.print("  Y: ");     Serial.print(gyroY, 2);
  Serial.print("  Z: ");     Serial.print(gyroZ, 2);
  Serial.println(" deg/s");

  delay(500);
}`,
  },

  {
    id: 'rotary-encoder-test',
    name: 'Rotary Encoder (KY-040) Test',
    description: 'Count rotations with a KY-040 rotary encoder (CLK D2, DT D3, SW D4); print count to Serial.',
    difficulty: 'intermediate',
    tags: ['rotary-encoder', 'digital-input', 'interrupt'],
    estimatedTime: '10 min',
    diagram: {
      version: 1,
      author: 'FUNDI Tests',
      editor: 'wokwi',
      parts: [
        { type: 'wokwi-arduino-uno', id: 'uno', top: 0, left: 0 },
        { type: 'wokwi-ky-040-encoder', id: 'enc1', top: -140, left: 200 },
      ],
      connections: [
        ['enc1:GND', 'uno:GND.1', 'black', []],
        ['enc1:+', 'uno:5V', 'red', []],
        ['enc1:CLK', 'uno:2', 'orange', []],
        ['enc1:DT', 'uno:3', 'yellow', []],
        ['enc1:SW', 'uno:4', 'blue', []],
      ],
    },
    code: `// Rotary Encoder (KY-040) Test
// CLK on D2 (interrupt), DT on D3, SW on D4

const int CLK_PIN = 2;
const int DT_PIN  = 3;
const int SW_PIN  = 4;

volatile int encoderCount = 0;
int lastClk = HIGH;

void setup() {
  pinMode(CLK_PIN, INPUT_PULLUP);
  pinMode(DT_PIN,  INPUT_PULLUP);
  pinMode(SW_PIN,  INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(CLK_PIN), onCLK, FALLING);
  Serial.begin(9600);
  Serial.println("Rotary Encoder Test Ready");
}

void onCLK() {
  int dtState = digitalRead(DT_PIN);
  if (dtState == HIGH) encoderCount++;
  else                 encoderCount--;
}

void loop() {
  Serial.print("Count: ");
  Serial.print(encoderCount);
  if (digitalRead(SW_PIN) == LOW) {
    Serial.print("  [BUTTON PRESSED]");
    encoderCount = 0;
  }
  Serial.println();
  delay(200);
}`,
  },

  // ── Communication & Control ───────────────────────────────────────────────
  {
    id: 'membrane-keypad-test',
    name: 'Membrane Keypad Test',
    description: 'Read key presses from a 4×4 membrane keypad on D2-D9; print each pressed key to Serial.',
    difficulty: 'intermediate',
    tags: ['keypad', 'membrane', 'digital-input'],
    estimatedTime: '10 min',
    diagram: {
      version: 1,
      author: 'FUNDI Tests',
      editor: 'wokwi',
      parts: [
        { type: 'wokwi-arduino-uno', id: 'uno', top: 0, left: 0 },
        { type: 'wokwi-membrane-keypad', id: 'kp1', top: -160, left: 220, attrs: { columns: '4' } },
      ],
      connections: [
        ['kp1:R1', 'uno:2', 'blue', []],
        ['kp1:R2', 'uno:3', 'blue', []],
        ['kp1:R3', 'uno:4', 'blue', []],
        ['kp1:R4', 'uno:5', 'blue', []],
        ['kp1:C1', 'uno:6', 'orange', []],
        ['kp1:C2', 'uno:7', 'orange', []],
        ['kp1:C3', 'uno:8', 'orange', []],
        ['kp1:C4', 'uno:9', 'orange', []],
      ],
    },
    code: `// Membrane Keypad (4x4) Test
// Requires: Keypad library by Mark Stanley

#include <Keypad.h>

const byte ROWS = 4;
const byte COLS = 4;
char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};
byte rowPins[ROWS] = {2, 3, 4, 5};
byte colPins[COLS] = {6, 7, 8, 9};
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

void setup() {
  Serial.begin(9600);
  Serial.println("Membrane Keypad Test Ready");
}

void loop() {
  char key = keypad.getKey();
  if (key != NO_KEY) {
    Serial.print("Key pressed: ");
    Serial.println(key);
  }
}`,
  },

  {
    id: 'hx711-test',
    name: 'HX711 Load Cell Test',
    description: 'Weigh objects using an HX711 load cell amplifier (DT D3, SCK D2); print weight in kg to Serial.',
    difficulty: 'intermediate',
    tags: ['hx711', 'load-cell', 'weight', 'scale'],
    estimatedTime: '15 min',
    diagram: {
      version: 1,
      author: 'FUNDI Tests',
      editor: 'wokwi',
      parts: [
        { type: 'wokwi-arduino-uno', id: 'uno', top: 0, left: 0 },
        { type: 'wokwi-hx711', id: 'hx1', top: -140, left: 200 },
      ],
      connections: [
        ['hx1:VCC', 'uno:5V', 'red', []],
        ['hx1:GND', 'uno:GND.1', 'black', []],
        ['hx1:DT', 'uno:3', 'yellow', []],
        ['hx1:SCK', 'uno:2', 'orange', []],
      ],
    },
    code: `// HX711 Load Cell Test
// Requires: HX711 library by bogde

#include <HX711.h>

const int DT_PIN  = 3;
const int SCK_PIN = 2;

HX711 scale;

// Calibration factor - adjust after taring with known weight
const float CALIBRATION_FACTOR = 420.0;

void setup() {
  Serial.begin(9600);
  scale.begin(DT_PIN, SCK_PIN);
  scale.set_scale(CALIBRATION_FACTOR);
  scale.tare(); // Reset to zero
  Serial.println("HX711 Load Cell Test Ready");
  Serial.println("Place weight on scale...");
}

void loop() {
  if (scale.is_ready()) {
    float weight = scale.get_units(5); // Average of 5 readings
    Serial.print("Weight: ");
    Serial.print(weight, 2);
    Serial.println(" kg");
  } else {
    Serial.println("HX711 not ready");
  }
  delay(500);
}`,
  },

  {
    id: 'ir-remote-test',
    name: 'IR Remote Test',
    description: 'Receive and decode IR remote signals on D11; print received hex codes to Serial.',
    difficulty: 'intermediate',
    tags: ['ir-remote', 'infrared', 'digital-input', 'serial'],
    estimatedTime: '10 min',
    diagram: {
      version: 1,
      author: 'FUNDI Tests',
      editor: 'wokwi',
      parts: [
        { type: 'wokwi-arduino-uno', id: 'uno', top: 0, left: 0 },
        { type: 'wokwi-ir-receiver', id: 'ir1', top: -130, left: 200 },
        { type: 'wokwi-ir-remote', id: 'remote1', top: -130, left: 320 },
      ],
      connections: [
        ['ir1:VCC', 'uno:5V', 'red', []],
        ['ir1:GND', 'uno:GND.1', 'black', []],
        ['ir1:SIG', 'uno:11', 'yellow', []],
      ],
    },
    code: `// IR Remote Test
// Requires: IRremote library by shirriff / z3t0

#include <IRremote.hpp>

const int IR_RECEIVE_PIN = 11;

void setup() {
  Serial.begin(9600);
  IrReceiver.begin(IR_RECEIVE_PIN, ENABLE_LED_FEEDBACK);
  Serial.println("IR Remote Test Ready - point remote at receiver and press a button");
}

void loop() {
  if (IrReceiver.decode()) {
    Serial.print("Protocol: ");
    Serial.print(IrReceiver.decodedIRData.protocol == UNKNOWN ? "UNKNOWN" : "NEC");
    Serial.print("  Address: 0x");
    Serial.print(IrReceiver.decodedIRData.address, HEX);
    Serial.print("  Command: 0x");
    Serial.println(IrReceiver.decodedIRData.command, HEX);
    IrReceiver.resume();
  }
}`,
  },

  {
    id: 'ds1307-test',
    name: 'DS1307 RTC Test',
    description: 'Read time and date from a DS1307 real-time clock on I2C (A4/A5); print to Serial every second.',
    difficulty: 'intermediate',
    tags: ['ds1307', 'rtc', 'i2c', 'time'],
    estimatedTime: '15 min',
    diagram: {
      version: 1,
      author: 'FUNDI Tests',
      editor: 'wokwi',
      parts: [
        { type: 'wokwi-arduino-uno', id: 'uno', top: 0, left: 0 },
        { type: 'wokwi-ds1307', id: 'rtc1', top: -140, left: 200 },
      ],
      connections: [
        ['rtc1:VCC', 'uno:5V', 'red', []],
        ['rtc1:GND', 'uno:GND.1', 'black', []],
        ['rtc1:SCL', 'uno:A5', 'blue', []],
        ['rtc1:SDA', 'uno:A4', 'yellow', []],
      ],
    },
    code: `// DS1307 RTC Test
// Requires: RTClib by Adafruit

#include <RTClib.h>

RTC_DS1307 rtc;

const char* DAYS[] = {"Sun","Mon","Tue","Wed","Thu","Fri","Sat"};

void setup() {
  Serial.begin(9600);
  if (!rtc.begin()) {
    Serial.println("ERROR: DS1307 not found!");
    while (1);
  }
  if (!rtc.isrunning()) {
    Serial.println("RTC not running - setting time to compile time");
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  }
  Serial.println("DS1307 RTC Test Ready");
}

void loop() {
  DateTime now = rtc.now();
  Serial.print(DAYS[now.dayOfTheWeek()]);
  Serial.print("  ");
  Serial.print(now.year(), DEC);
  Serial.print('/');
  Serial.print(now.month(), DEC);
  Serial.print('/');
  Serial.print(now.day(), DEC);
  Serial.print("  ");
  Serial.print(now.hour(), DEC);
  Serial.print(':');
  if (now.minute() < 10) Serial.print('0');
  Serial.print(now.minute(), DEC);
  Serial.print(':');
  if (now.second() < 10) Serial.print('0');
  Serial.println(now.second(), DEC);
  delay(1000);
}`,
  },
];

export interface InputTestCategory {
  name: string;
  ids: string[];
}

export const INPUT_TEST_CATEGORIES: InputTestCategory[] = [
  {
    name: 'Switches & Buttons',
    ids: ['pushbutton-test', 'slide-switch-test', 'dip-switch-test'],
  },
  {
    name: 'Analog Inputs',
    ids: ['potentiometer-test', 'slide-potentiometer-test', 'photoresistor-test', 'ntc-thermistor-test', 'analog-joystick-test'],
  },
  {
    name: 'Environmental Sensors',
    ids: ['dht22-test', 'ds18b20-test', 'hc-sr04-test', 'pir-motion-test'],
  },
  {
    name: 'Motion & IMU',
    ids: ['mpu6050-test', 'mpu6050-esp32-test', 'rotary-encoder-test'],
  },
  {
    name: 'Communication & Control',
    ids: ['membrane-keypad-test', 'hx711-test', 'ir-remote-test', 'ds1307-test'],
  },
];

export function getInputTestProjects(): FeaturedProject[] {
  return INPUT_TEST_PROJECTS;
}
