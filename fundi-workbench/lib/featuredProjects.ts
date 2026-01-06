'use client';

import smartFacilityGuardian from '../data/featured-projects/smart-facility-guardian.json';

/**
 * Featured Projects - Wokwi Project Loader
 * 
 * Load pre-made projects from Wokwi to test simulations.
 */

// Featured project metadata (embedded for static export support)
export interface FeaturedProject {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  estimatedTime: string;
  diagram: WokwiDiagram;
  code: string;
}

interface WokwiDiagram {
  version: number;
  author?: string;
  editor?: string;
  parts: WokwiPart[];
  connections: WokwiConnectionArray[];
}

interface WokwiPart {
  type: string;
  id: string;
  top?: number;
  left?: number;
  rotate?: number;
  attrs?: Record<string, string>;
}

// Wokwi uses array format for connections: [from, to, color, path]
type WokwiConnectionArray = [string, string, string, string[]];

// Static featured projects data
const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    id: "blink-led",
    name: "Blink LED",
    description: "Classic Arduino starter project - blink the built-in LED on pin 13",
    difficulty: "beginner",
    tags: ["led", "digital-output", "starter"],
    estimatedTime: "5 min",
    diagram: {
      version: 1,
      author: "FUNDI Featured",
      editor: "wokwi",
      parts: [
        { type: "wokwi-arduino-uno", id: "uno", top: 0, left: 0 },
        { type: "wokwi-led", id: "led1", top: -100, left: 150, attrs: { color: "red" } },
        { type: "wokwi-resistor", id: "r1", top: -60, left: 150, attrs: { value: "220" } }
      ],
      connections: [
        ["uno:13", "r1:1", "green", ["h0"]],
        ["r1:2", "led1:A", "green", ["v0"]],
        ["led1:C", "uno:GND.1", "black", ["v20", "h-50"]]
      ]
    },
    code: `// Blink LED - Classic Arduino Starter
// Turns on an LED for 1 second, then off for 1 second, repeatedly.

const int LED_PIN = 13;

void setup() {
  // Initialize the LED pin as output
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Blink LED started!");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);  // Turn LED on
  Serial.println("LED ON");
  delay(1000);                   // Wait 1 second
  
  digitalWrite(LED_PIN, LOW);   // Turn LED off
  Serial.println("LED OFF");
  delay(1000);                   // Wait 1 second
}`
  },
  {
    id: "traffic-light",
    name: "Traffic Light Controller",
    description: "Simulate a traffic light with red, yellow, and green LEDs cycling through states",
    difficulty: "beginner",
    tags: ["led", "digital-output", "timing", "state-machine"],
    estimatedTime: "10 min",
    diagram: {
      version: 1,
      author: "FUNDI Featured",
      editor: "wokwi",
      parts: [
        { type: "wokwi-arduino-uno", id: "uno", top: 0, left: 0 },
        { type: "wokwi-led", id: "led-red", top: -150, left: 150, attrs: { color: "red" } },
        { type: "wokwi-led", id: "led-yellow", top: -150, left: 200, attrs: { color: "yellow" } },
        { type: "wokwi-led", id: "led-green", top: -150, left: 250, attrs: { color: "green" } },
        { type: "wokwi-resistor", id: "r1", top: -100, left: 150, attrs: { value: "220" } },
        { type: "wokwi-resistor", id: "r2", top: -100, left: 200, attrs: { value: "220" } },
        { type: "wokwi-resistor", id: "r3", top: -100, left: 250, attrs: { value: "220" } }
      ],
      connections: [
        ["uno:11", "r1:1", "red", []],
        ["r1:2", "led-red:A", "red", []],
        ["led-red:C", "uno:GND.1", "black", []],
        ["uno:10", "r2:1", "orange", []],
        ["r2:2", "led-yellow:A", "orange", []],
        ["led-yellow:C", "uno:GND.2", "black", []],
        ["uno:9", "r3:1", "green", []],
        ["r3:2", "led-green:A", "green", []],
        ["led-green:C", "uno:GND.3", "black", []]
      ]
    },
    code: `// Traffic Light Controller
// Simulates a standard traffic light sequence

const int RED_PIN = 11;
const int YELLOW_PIN = 10;
const int GREEN_PIN = 9;

// Timing constants (in milliseconds)
const int RED_TIME = 5000;
const int YELLOW_TIME = 2000;
const int GREEN_TIME = 5000;

void setup() {
  pinMode(RED_PIN, OUTPUT);
  pinMode(YELLOW_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  
  Serial.begin(9600);
  Serial.println("Traffic Light Controller Started");
  
  // Start with all off
  allOff();
}

void allOff() {
  digitalWrite(RED_PIN, LOW);
  digitalWrite(YELLOW_PIN, LOW);
  digitalWrite(GREEN_PIN, LOW);
}

void loop() {
  // RED phase
  Serial.println("STOP - Red Light");
  allOff();
  digitalWrite(RED_PIN, HIGH);
  delay(RED_TIME);
  
  // GREEN phase
  Serial.println("GO - Green Light");
  allOff();
  digitalWrite(GREEN_PIN, HIGH);
  delay(GREEN_TIME);
  
  // YELLOW phase (caution)
  Serial.println("CAUTION - Yellow Light");
  allOff();
  digitalWrite(YELLOW_PIN, HIGH);
  delay(YELLOW_TIME);
}`
  },
  {
    id: "button-led",
    name: "Button & LED",
    description: "Read a pushbutton and control an LED - learn digital input/output",
    difficulty: "beginner",
    tags: ["button", "led", "digital-input", "digital-output"],
    estimatedTime: "10 min",
    diagram: {
      version: 1,
      author: "FUNDI Featured",
      editor: "wokwi",
      parts: [
        { type: "wokwi-arduino-uno", id: "uno", top: 0, left: 0 },
        { type: "wokwi-led", id: "led1", top: -120, left: 280, attrs: { color: "green" } },
        { type: "wokwi-resistor", id: "r1", top: -80, left: 280, attrs: { value: "220" } },
        { type: "wokwi-pushbutton", id: "btn1", top: -150, left: 50 }
      ],
      connections: [
        ["uno:12", "r1:1", "green", []],
        ["r1:2", "led1:A", "green", []],
        ["led1:C", "uno:GND.1", "black", []],
        ["btn1:1.l", "uno:2", "blue", []],
        ["btn1:2.l", "uno:GND.2", "black", []]
      ]
    },
    code: `// Button & LED - Digital Input/Output
// Press the button to turn on the LED

const int BUTTON_PIN = 2;
const int LED_PIN = 12;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);  // Use internal pull-up resistor
  pinMode(LED_PIN, OUTPUT);
  
  Serial.begin(9600);
  Serial.println("Button & LED Demo");
  Serial.println("Press the button to toggle LED");
}

void loop() {
  // Read button state (LOW when pressed due to pull-up)
  int buttonState = digitalRead(BUTTON_PIN);
  
  if (buttonState == LOW) {
    // Button is pressed
    digitalWrite(LED_PIN, HIGH);
    Serial.println("Button PRESSED - LED ON");
  } else {
    // Button is released
    digitalWrite(LED_PIN, LOW);
  }
  
  delay(50);  // Small debounce delay
}`
  },
  {
    id: "potentiometer-led",
    name: "Potentiometer LED Dimmer",
    description: "Control LED brightness with a potentiometer using analog input and PWM output",
    difficulty: "beginner",
    tags: ["potentiometer", "led", "analog-input", "pwm", "analog"],
    estimatedTime: "10 min",
    diagram: {
      version: 1,
      author: "FUNDI Featured",
      editor: "wokwi",
      parts: [
        { type: "wokwi-arduino-uno", id: "uno", top: 0, left: 0 },
        { type: "wokwi-led", id: "led1", top: -120, left: 220, attrs: { color: "blue" } },
        { type: "wokwi-resistor", id: "r1", top: -80, left: 220, attrs: { value: "220" } },
        { type: "wokwi-potentiometer", id: "pot1", top: -120, left: 80 }
      ],
      connections: [
        ["uno:9", "r1:1", "blue", []],
        ["r1:2", "led1:A", "blue", []],
        ["led1:C", "uno:GND.1", "black", []],
        ["pot1:VCC", "uno:5V", "red", []],
        ["pot1:GND", "uno:GND.2", "black", []],
        ["pot1:SIG", "uno:A0", "green", []]
      ]
    },
    code: `// Potentiometer LED Dimmer
// Read analog input from potentiometer and control LED brightness via PWM

const int POT_PIN = A0;    // Analog input
const int LED_PIN = 9;     // PWM output (pins 3, 5, 6, 9, 10, 11)

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Potentiometer LED Dimmer");
  Serial.println("Turn the potentiometer to adjust brightness");
}

void loop() {
  // Read potentiometer (0-1023)
  int potValue = analogRead(POT_PIN);
  
  // Map to PWM range (0-255)
  int brightness = map(potValue, 0, 1023, 0, 255);
  
  // Set LED brightness
  analogWrite(LED_PIN, brightness);
  
  // Print values for debugging
  Serial.print("Pot: ");
  Serial.print(potValue);
  Serial.print(" -> Brightness: ");
  Serial.println(brightness);
  
  delay(100);  // Update rate
}`
  },
  {
    id: "servo-sweep",
    name: "Servo Motor Sweep",
    description: "Control a servo motor to sweep back and forth from 0 to 180 degrees",
    difficulty: "beginner",
    tags: ["servo", "motor", "pwm", "movement"],
    estimatedTime: "10 min",
    diagram: {
      version: 1,
      author: "FUNDI Featured",
      editor: "wokwi",
      parts: [
        { type: "wokwi-arduino-uno", id: "uno", top: 0, left: 0 },
        { type: "wokwi-servo", id: "servo1", top: -150, left: 150 }
      ],
      connections: [
        ["servo1:V+", "uno:5V", "red", []],
        ["servo1:GND", "uno:GND.1", "black", []],
        ["servo1:PWM", "uno:9", "orange", []]
      ]
    },
    code: `// Servo Motor Sweep
// Sweeps the servo back and forth from 0 to 180 degrees

#include <Servo.h>

Servo myServo;

const int SERVO_PIN = 9;
int angle = 0;
int step = 1;

void setup() {
  myServo.attach(SERVO_PIN);
  
  Serial.begin(9600);
  Serial.println("Servo Sweep Demo");
  Serial.println("Sweeping 0-180 degrees");
  
  // Start at 0 degrees
  myServo.write(0);
  delay(500);
}

void loop() {
  // Move servo to current angle
  myServo.write(angle);
  
  // Print current angle
  Serial.print("Angle: ");
  Serial.print(angle);
  Serial.println(" degrees");
  
  // Update angle for next iteration
  angle += step;
  
  // Reverse direction at limits
  if (angle >= 180) {
    angle = 180;
    step = -1;
    Serial.println(">> Reversing direction (going back)");
  } else if (angle <= 0) {
    angle = 0;
    step = 1;
    Serial.println(">> Reversing direction (going forward)");
  }
  
  delay(15);  // Small delay for smooth movement
}`
  },
  {
    id: "buzzer-melody",
    name: "Buzzer Melody Player",
    description: "Play musical notes and melodies using a piezo buzzer",
    difficulty: "beginner",
    tags: ["buzzer", "music", "tone", "audio"],
    estimatedTime: "10 min",
    diagram: {
      version: 1,
      author: "FUNDI Featured",
      editor: "wokwi",
      parts: [
        { type: "wokwi-arduino-uno", id: "uno", top: 0, left: 0 },
        { type: "wokwi-buzzer", id: "buzzer1", top: -120, left: 150 }
      ],
      connections: [
        ["buzzer1:1", "uno:8", "orange", []],
        ["buzzer1:2", "uno:GND.1", "black", []]
      ]
    },
    code: `// Buzzer Melody Player
// Play musical notes using tone() function

const int BUZZER_PIN = 8;

// Musical note frequencies (Hz)
#define NOTE_C4  262
#define NOTE_D4  294
#define NOTE_E4  330
#define NOTE_F4  349
#define NOTE_G4  392
#define NOTE_A4  440
#define NOTE_B4  494
#define NOTE_C5  523
#define NOTE_REST 0

// "Twinkle Twinkle Little Star" melody
int melody[] = {
  NOTE_C4, NOTE_C4, NOTE_G4, NOTE_G4, NOTE_A4, NOTE_A4, NOTE_G4,
  NOTE_F4, NOTE_F4, NOTE_E4, NOTE_E4, NOTE_D4, NOTE_D4, NOTE_C4
};

// Note durations: 4 = quarter note
int noteDurations[] = {
  4, 4, 4, 4, 4, 4, 2,
  4, 4, 4, 4, 4, 4, 2
};

int numNotes = sizeof(melody) / sizeof(melody[0]);

void setup() {
  Serial.begin(9600);
  Serial.println("Buzzer Melody Player");
  Serial.println("Playing: Twinkle Twinkle Little Star");
}

void playMelody() {
  for (int i = 0; i < numNotes; i++) {
    int noteDuration = 1000 / noteDurations[i];
    
    if (melody[i] != NOTE_REST) {
      tone(BUZZER_PIN, melody[i], noteDuration);
      Serial.print("Note: ");
      Serial.print(melody[i]);
      Serial.println(" Hz");
    }
    
    int pauseBetweenNotes = noteDuration * 1.30;
    delay(pauseBetweenNotes);
    noTone(BUZZER_PIN);
  }
}

void loop() {
  Serial.println("\\n=== Starting melody ===");
  playMelody();
  Serial.println("=== Melody complete ===");
  delay(2000);
}`
  },
  {
    id: "lcd-hello-world",
    name: "LCD Hello World",
    description: "Display text on a 16x2 LCD screen using I2C communication",
    difficulty: "intermediate",
    tags: ["lcd", "i2c", "display", "text"],
    estimatedTime: "15 min",
    diagram: {
      version: 1,
      author: "FUNDI Featured",
      editor: "wokwi",
      parts: [
        { type: "wokwi-arduino-uno", id: "uno", top: 0, left: 0 },
        { type: "wokwi-lcd1602", id: "lcd1", top: -200, left: 50, attrs: { pins: "i2c" } }
      ],
      connections: [
        ["lcd1:VCC", "uno:5V", "red", []],
        ["lcd1:GND", "uno:GND.1", "black", []],
        ["lcd1:SDA", "uno:A4", "green", []],
        ["lcd1:SCL", "uno:A5", "blue", []]
      ]
    },
    code: `// LCD Hello World - I2C Display
// Display text on 16x2 LCD using Wire library

#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// LCD address is typically 0x27 or 0x3F
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  // Initialize LCD
  lcd.init();
  lcd.backlight();
  
  Serial.begin(9600);
  Serial.println("LCD Hello World Demo");
  
  // Display welcome message
  lcd.setCursor(0, 0);
  lcd.print("Hello, FUNDI!");
  lcd.setCursor(0, 1);
  lcd.print("LCD Working :)");
}

int counter = 0;

void loop() {
  // Update counter every second
  delay(1000);
  counter++;
  
  // Display on second line
  lcd.setCursor(0, 1);
  lcd.print("Count: ");
  lcd.print(counter);
  lcd.print("     ");  // Clear remaining chars
  
  Serial.print("Counter: ");
  Serial.println(counter);
}`
  },
  {
    id: "dht22-temperature",
    name: "DHT22 Temperature Sensor",
    description: "Read temperature and humidity from DHT22 sensor with serial output",
    difficulty: "intermediate",
    tags: ["dht22", "sensor", "temperature", "humidity", "serial"],
    estimatedTime: "15 min",
    diagram: {
      version: 1,
      author: "FUNDI Featured",
      editor: "wokwi",
      parts: [
        { type: "wokwi-arduino-uno", id: "uno", top: 0, left: 0 },
        { type: "wokwi-dht22", id: "dht1", top: -150, left: 150 }
      ],
      connections: [
        ["dht1:VCC", "uno:5V", "red", []],
        ["dht1:GND", "uno:GND.1", "black", []],
        ["dht1:SDA", "uno:2", "green", []]
      ]
    },
    code: `// DHT22 Temperature & Humidity Sensor
// Read sensor data and display via Serial Monitor

#include <DHT.h>

#define DHT_PIN 2
#define DHT_TYPE DHT22

DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(9600);
  Serial.println("DHT22 Temperature & Humidity Sensor");
  Serial.println("=====================================");
  
  dht.begin();
  delay(2000);  // Allow sensor to stabilize
}

void loop() {
  // Read humidity and temperature
  float humidity = dht.readHumidity();
  float tempC = dht.readTemperature();
  float tempF = dht.readTemperature(true);
  
  // Check for read errors
  if (isnan(humidity) || isnan(tempC)) {
    Serial.println("Error reading DHT sensor!");
    delay(2000);
    return;
  }
  
  // Print results
  Serial.println("--- Sensor Reading ---");
  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.println("%");
  
  Serial.print("Temperature: ");
  Serial.print(tempC);
  Serial.print("C / ");
  Serial.print(tempF);
  Serial.println("F");
  
  Serial.println();
  delay(2000);  // Wait 2 seconds between readings
}`
  },
  {
    id: "ultrasonic-distance",
    name: "Ultrasonic Distance Sensor",
    description: "Measure distance using HC-SR04 ultrasonic sensor with LED indicator",
    difficulty: "intermediate",
    tags: ["ultrasonic", "hc-sr04", "sensor", "distance", "measurement"],
    estimatedTime: "15 min",
    diagram: {
      version: 1,
      author: "FUNDI Featured",
      editor: "wokwi",
      parts: [
        { type: "wokwi-arduino-uno", id: "uno", top: 0, left: 0 },
        { type: "wokwi-hc-sr04", id: "ultrasonic1", top: -180, left: 100 },
        { type: "wokwi-led", id: "led1", top: -120, left: 250, attrs: { color: "red" } },
        { type: "wokwi-resistor", id: "r1", top: -80, left: 250, attrs: { value: "220" } }
      ],
      connections: [
        ["ultrasonic1:VCC", "uno:5V", "red", []],
        ["ultrasonic1:GND", "uno:GND.1", "black", []],
        ["ultrasonic1:TRIG", "uno:10", "blue", []],
        ["ultrasonic1:ECHO", "uno:11", "green", []],
        ["uno:13", "r1:1", "red", []],
        ["r1:2", "led1:A", "red", []],
        ["led1:C", "uno:GND.2", "black", []]
      ]
    },
    code: `// Ultrasonic Distance Sensor (HC-SR04)
// Measure distance and indicate when object is close

const int TRIG_PIN = 10;
const int ECHO_PIN = 11;
const int LED_PIN = 13;

// Distance threshold for LED warning (in cm)
const int WARNING_DISTANCE = 20;

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  
  Serial.begin(9600);
  Serial.println("HC-SR04 Ultrasonic Distance Sensor");
  Serial.println("==================================");
}

float measureDistance() {
  // Clear trigger pin
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  
  // Send 10us pulse to trigger
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Read echo pulse duration
  long duration = pulseIn(ECHO_PIN, HIGH);
  
  // Calculate distance
  float distance = duration * 0.0343 / 2.0;
  
  return distance;
}

void loop() {
  float distance = measureDistance();
  
  Serial.print("Distance: ");
  Serial.print(distance, 1);
  Serial.print(" cm");
  
  if (distance < WARNING_DISTANCE && distance > 0) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println(" [!] CLOSE");
  } else {
    digitalWrite(LED_PIN, LOW);
    Serial.println();
  }
  
  delay(200);
}`
  },
  {
    id: "keypad-password",
    name: "Keypad Password Lock",
    description: "4x4 membrane keypad for password entry with LED feedback",
    difficulty: "intermediate",
    tags: ["keypad", "input", "security", "password", "led"],
    estimatedTime: "20 min",
    diagram: {
      version: 1,
      author: "FUNDI Featured",
      editor: "wokwi",
      parts: [
        { type: "wokwi-arduino-uno", id: "uno", top: 0, left: 0 },
        { type: "wokwi-membrane-keypad", id: "keypad1", top: -250, left: 80 },
        { type: "wokwi-led", id: "led-green", top: -100, left: 280, attrs: { color: "green" } },
        { type: "wokwi-led", id: "led-red", top: -100, left: 320, attrs: { color: "red" } },
        { type: "wokwi-resistor", id: "r1", top: -60, left: 280, attrs: { value: "220" } },
        { type: "wokwi-resistor", id: "r2", top: -60, left: 320, attrs: { value: "220" } }
      ],
      connections: [
        ["keypad1:R1", "uno:9", "purple", []],
        ["keypad1:R2", "uno:8", "purple", []],
        ["keypad1:R3", "uno:7", "purple", []],
        ["keypad1:R4", "uno:6", "purple", []],
        ["keypad1:C1", "uno:5", "blue", []],
        ["keypad1:C2", "uno:4", "blue", []],
        ["keypad1:C3", "uno:3", "blue", []],
        ["keypad1:C4", "uno:2", "blue", []],
        ["uno:12", "r1:1", "green", []],
        ["r1:2", "led-green:A", "green", []],
        ["led-green:C", "uno:GND.1", "black", []],
        ["uno:11", "r2:1", "red", []],
        ["r2:2", "led-red:A", "red", []],
        ["led-red:C", "uno:GND.2", "black", []]
      ]
    },
    code: `// Keypad Password Lock
// Enter a 4-digit code to unlock

#include <Keypad.h>

const byte ROWS = 4;
const byte COLS = 4;

char keys[ROWS][COLS] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};

byte rowPins[ROWS] = {9, 8, 7, 6};
byte colPins[COLS] = {5, 4, 3, 2};

Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

const int GREEN_LED = 12;
const int RED_LED = 11;

const String PASSWORD = "1234";
String enteredCode = "";
const int CODE_LENGTH = 4;

void setup() {
  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  
  Serial.begin(9600);
  Serial.println("=== Keypad Password Lock ===");
  Serial.println("Enter 4-digit password:");
  Serial.println("Press * to clear, # to submit");
  
  digitalWrite(RED_LED, HIGH);
  delay(200);
  digitalWrite(RED_LED, LOW);
}

void showGranted() {
  Serial.println(">>> ACCESS GRANTED! <<<");
  for (int i = 0; i < 3; i++) {
    digitalWrite(GREEN_LED, HIGH);
    delay(200);
    digitalWrite(GREEN_LED, LOW);
    delay(200);
  }
}

void showDenied() {
  Serial.println(">>> ACCESS DENIED! <<<");
  for (int i = 0; i < 3; i++) {
    digitalWrite(RED_LED, HIGH);
    delay(200);
    digitalWrite(RED_LED, LOW);
    delay(200);
  }
}

void loop() {
  char key = keypad.getKey();
  
  if (key) {
    Serial.print("Key pressed: ");
    Serial.println(key);
    
    if (key == '*') {
      enteredCode = "";
      Serial.println("[Code cleared]");
    } else if (key == '#') {
      Serial.print("Checking code: ");
      Serial.println(enteredCode);
      
      if (enteredCode == PASSWORD) {
        showGranted();
      } else {
        showDenied();
      }
      enteredCode = "";
      Serial.println("\\nEnter password:");
    } else if (enteredCode.length() < CODE_LENGTH) {
      enteredCode += key;
      Serial.print("Code so far: ");
      for (int i = 0; i < enteredCode.length(); i++) {
        Serial.print("*");
      }
      Serial.println();
    }
  }
}`
  },
  smartFacilityGuardian as unknown as FeaturedProject
];

/**
 * Get all featured projects
 */
export function getFeaturedProjects(): FeaturedProject[] {
  return FEATURED_PROJECTS;
}

/**
 * Get a featured project by ID
 */
export function getFeaturedProject(id: string): FeaturedProject | undefined {
  return FEATURED_PROJECTS.find(p => p.id === id);
}

/**
 * Get projects filtered by difficulty
 */
export function getProjectsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): FeaturedProject[] {
  return FEATURED_PROJECTS.filter(p => p.difficulty === difficulty);
}

/**
 * Search projects by tag
 */
export function searchProjectsByTag(tag: string): FeaturedProject[] {
  const lowerTag = tag.toLowerCase();
  return FEATURED_PROJECTS.filter(p => 
    p.tags.some(t => t.toLowerCase().includes(lowerTag))
  );
}

/**
 * Convert Wokwi array-style connection to FUNDI format
 */
export function convertWokwiConnection(conn: WokwiConnectionArray): {
  from: { partId: string; pinId: string };
  to: { partId: string; pinId: string };
  color: string;
} {
  const [fromStr, toStr, color] = conn;
  const [fromPartId, fromPinId] = fromStr.split(':');
  const [toPartId, toPinId] = toStr.split(':');
  
  return {
    from: { partId: fromPartId, pinId: fromPinId },
    to: { partId: toPartId, pinId: toPinId },
    color
  };
}

/**
 * Convert a featured project to FUNDI circuit format
 */
export function convertToFundiCircuit(project: FeaturedProject): {
  parts: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    rotation?: number;
    attrs?: Record<string, unknown>;
  }>;
  connections: Array<{
    id: string;
    from: { partId: string; pinId: string };
    to: { partId: string; pinId: string };
    color: string;
  }>;
} {
  const rawParts = project.diagram.parts.map(part => ({
    id: part.id,
    type: part.type.replace('wokwi-', ''),
    position: {
      x: part.left ?? 0,
      y: part.top ?? 0
    },
    rotation: part.rotate,
    attrs: part.attrs as Record<string, unknown>
  }));

  // Some Wokwi projects use negative top/left coordinates. If we keep them as-is,
  // the circuit can render off-screen and look like it didn't load.
  const minX = Math.min(0, ...rawParts.map(p => p.position.x));
  const minY = Math.min(0, ...rawParts.map(p => p.position.y));
  const shiftX = minX < 0 ? -minX : 0;
  const shiftY = minY < 0 ? -minY : 0;

  const parts = (shiftX || shiftY)
    ? rawParts.map(p => ({
        ...p,
        position: { x: p.position.x + shiftX, y: p.position.y + shiftY },
      }))
    : rawParts;

  const connections = project.diagram.connections.map((conn, index) => ({
    id: `wire_${index + 1}`,
    ...convertWokwiConnection(conn)
  }));

  return { parts, connections };
}
