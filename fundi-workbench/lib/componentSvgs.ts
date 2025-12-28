/**
 * SVG icons for Wokwi components - simplified representations for component library
 * These are compact, recognizable icons inspired by Wokwi's visual style
 */

// Arduino Uno - Blue board with pin headers
export const ARDUINO_UNO_SVG = `<svg viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="4" width="60" height="40" rx="3" fill="#008184"/>
  <rect x="4" y="6" width="56" height="36" rx="2" fill="#007072"/>
  <rect x="6" y="10" width="8" height="12" fill="#333" rx="1"/>
  <rect x="50" y="10" width="8" height="4" fill="#333"/>
  <circle cx="10" cy="8" r="2" fill="#ccc"/>
  <circle cx="54" cy="8" r="2" fill="#ccc"/>
  <rect x="20" y="14" width="24" height="6" fill="#222" rx="1"/>
  <rect x="8" y="36" width="48" height="4" fill="#444"/>
  <text x="32" y="35" font-size="5" fill="#fff" text-anchor="middle" font-family="monospace">UNO</text>
</svg>`;

// Arduino Nano - Smaller blue board
export const ARDUINO_NANO_SVG = `<svg viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="44" height="20" rx="2" fill="#008184"/>
  <rect x="4" y="4" width="40" height="16" rx="1" fill="#007072"/>
  <rect x="6" y="6" width="6" height="4" fill="#333"/>
  <rect x="36" y="6" width="6" height="4" fill="#333"/>
  <rect x="6" y="16" width="36" height="2" fill="#444"/>
  <text x="24" y="14" font-size="4" fill="#fff" text-anchor="middle" font-family="monospace">NANO</text>
</svg>`;

// Arduino Mega - Larger blue board
export const ARDUINO_MEGA_SVG = `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="4" width="76" height="40" rx="3" fill="#008184"/>
  <rect x="4" y="6" width="72" height="36" rx="2" fill="#007072"/>
  <rect x="6" y="10" width="8" height="12" fill="#333" rx="1"/>
  <rect x="66" y="10" width="8" height="4" fill="#333"/>
  <circle cx="10" cy="8" r="2" fill="#ccc"/>
  <circle cx="70" cy="8" r="2" fill="#ccc"/>
  <rect x="20" y="12" width="40" height="6" fill="#222" rx="1"/>
  <rect x="8" y="36" width="64" height="4" fill="#444"/>
  <text x="40" y="32" font-size="5" fill="#fff" text-anchor="middle" font-family="monospace">MEGA</text>
</svg>`;

// ESP32 DevKit - Black board with antenna
export const ESP32_SVG = `<svg viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="40" height="56" rx="3" fill="#1a1a1a"/>
  <rect x="6" y="6" width="36" height="52" rx="2" fill="#2a2a2a"/>
  <rect x="14" y="8" width="20" height="10" fill="#444" rx="2"/>
  <path d="M22 4 L26 4 L26 0 L22 0 Z" fill="#555"/>
  <rect x="10" y="22" width="28" height="8" fill="#333" rx="1"/>
  <rect x="8" y="48" width="32" height="8" fill="#444"/>
  <text x="24" y="43" font-size="5" fill="#3b82f6" text-anchor="middle" font-family="monospace">ESP32</text>
</svg>`;

// LED - Classic LED shape
export const LED_SVG = `<svg viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="12" cy="10" rx="8" ry="10" fill="#ef4444" opacity="0.8"/>
  <ellipse cx="12" cy="10" rx="6" ry="8" fill="#f87171"/>
  <ellipse cx="10" cy="8" rx="2" ry="3" fill="#fca5a5"/>
  <rect x="9" y="18" width="2" height="12" fill="#888"/>
  <rect x="13" y="18" width="2" height="14" fill="#888"/>
</svg>`;

// RGB LED - Multi-color LED
export const RGB_LED_SVG = `<svg viewBox="0 0 28 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="14" cy="10" rx="10" ry="10" fill="url(#rgbGrad)" opacity="0.9"/>
  <ellipse cx="12" cy="8" rx="2" ry="3" fill="#fff" opacity="0.5"/>
  <rect x="7" y="18" width="2" height="12" fill="#ef4444"/>
  <rect x="11" y="18" width="2" height="14" fill="#888"/>
  <rect x="15" y="18" width="2" height="12" fill="#22c55e"/>
  <rect x="19" y="18" width="2" height="12" fill="#3b82f6"/>
  <defs>
    <radialGradient id="rgbGrad" cx="50%" cy="50%">
      <stop offset="0%" stop-color="#fff"/>
      <stop offset="30%" stop-color="#f0abfc"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </radialGradient>
  </defs>
</svg>`;

// NeoPixel - Addressable LED
export const NEOPIXEL_SVG = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="20" height="20" rx="3" fill="#333"/>
  <circle cx="12" cy="12" r="7" fill="url(#neoGrad)"/>
  <circle cx="10" cy="10" r="2" fill="#fff" opacity="0.6"/>
  <defs>
    <radialGradient id="neoGrad" cx="50%" cy="50%">
      <stop offset="0%" stop-color="#fff"/>
      <stop offset="50%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#15803d"/>
    </radialGradient>
  </defs>
</svg>`;

// Pushbutton - Tactile button
export const PUSHBUTTON_SVG = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="6" width="20" height="12" fill="#333"/>
  <circle cx="12" cy="12" r="5" fill="#ef4444"/>
  <circle cx="12" cy="12" r="4" fill="#dc2626"/>
  <rect x="4" y="0" width="2" height="6" fill="#888"/>
  <rect x="10" y="0" width="2" height="6" fill="#888"/>
  <rect x="4" y="18" width="2" height="6" fill="#888"/>
  <rect x="10" y="18" width="2" height="6" fill="#888"/>
</svg>`;

// Resistor - Color bands
export const RESISTOR_SVG = `<svg viewBox="0 0 48 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="7" width="10" height="2" fill="#888"/>
  <rect x="38" y="7" width="10" height="2" fill="#888"/>
  <rect x="10" y="3" width="28" height="10" rx="2" fill="#d4a574"/>
  <rect x="14" y="3" width="3" height="10" fill="#8b4513"/>
  <rect x="19" y="3" width="3" height="10" fill="#000"/>
  <rect x="24" y="3" width="3" height="10" fill="#ef4444"/>
  <rect x="32" y="3" width="2" height="10" fill="#ffd700"/>
</svg>`;

// Potentiometer - Rotary knob
export const POTENTIOMETER_SVG = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16" cy="16" r="12" fill="#444"/>
  <circle cx="16" cy="16" r="10" fill="#555"/>
  <circle cx="16" cy="16" r="6" fill="#666"/>
  <line x1="16" y1="16" x2="16" y2="6" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
  <rect x="6" y="28" width="2" height="4" fill="#888"/>
  <rect x="15" y="28" width="2" height="4" fill="#888"/>
  <rect x="24" y="28" width="2" height="4" fill="#888"/>
</svg>`;

// Servo motor
export const SERVO_SVG = `<svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="6" width="32" height="20" rx="2" fill="#2563eb"/>
  <rect x="36" y="8" width="8" height="16" rx="1" fill="#1d4ed8"/>
  <circle cx="20" cy="16" r="4" fill="#333"/>
  <rect x="28" y="13" width="12" height="6" fill="#444"/>
  <rect x="6" y="26" width="4" height="6" fill="#ef4444"/>
  <rect x="12" y="26" width="4" height="6" fill="#eab308"/>
  <rect x="18" y="26" width="4" height="6" fill="#f97316"/>
</svg>`;

// DHT22 Sensor
export const DHT22_SVG = `<svg viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="28" height="28" rx="2" fill="#fff"/>
  <rect x="4" y="4" width="24" height="24" rx="1" fill="#e5e7eb"/>
  <rect x="8" y="8" width="16" height="16" fill="#1e40af"/>
  <rect x="10" y="10" width="12" height="12" rx="1" fill="#3b82f6"/>
  <rect x="6" y="30" width="2" height="8" fill="#888"/>
  <rect x="12" y="30" width="2" height="8" fill="#888"/>
  <rect x="18" y="30" width="2" height="8" fill="#888"/>
  <rect x="24" y="30" width="2" height="8" fill="#888"/>
</svg>`;

// Ultrasonic Sensor HC-SR04
export const HCSR04_SVG = `<svg viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="4" width="44" height="16" rx="2" fill="#2563eb"/>
  <circle cx="13" cy="12" r="6" fill="#1e40af"/>
  <circle cx="13" cy="12" r="4" fill="#333"/>
  <circle cx="35" cy="12" r="6" fill="#1e40af"/>
  <circle cx="35" cy="12" r="4" fill="#333"/>
  <rect x="8" y="20" width="2" height="4" fill="#888"/>
  <rect x="16" y="20" width="2" height="4" fill="#888"/>
  <rect x="30" y="20" width="2" height="4" fill="#888"/>
  <rect x="38" y="20" width="2" height="4" fill="#888"/>
</svg>`;

// LCD1602 Display
export const LCD1602_SVG = `<svg viewBox="0 0 64 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="60" height="28" rx="2" fill="#1e3a5f"/>
  <rect x="6" y="6" width="52" height="20" rx="1" fill="#0f172a"/>
  <rect x="8" y="8" width="48" height="16" fill="#22c55e" opacity="0.8"/>
  <text x="32" y="18" font-size="6" fill="#166534" text-anchor="middle" font-family="monospace">Hello!</text>
</svg>`;

// OLED Display
export const OLED_SVG = `<svg viewBox="0 0 48 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="44" height="36" rx="2" fill="#1a1a2e"/>
  <rect x="6" y="6" width="36" height="24" rx="1" fill="#000"/>
  <rect x="8" y="8" width="32" height="20" fill="#0f0f23"/>
  <circle cx="24" cy="18" r="6" fill="#3b82f6" opacity="0.8"/>
  <rect x="10" y="32" width="2" height="6" fill="#888"/>
  <rect x="18" y="32" width="2" height="6" fill="#888"/>
  <rect x="26" y="32" width="2" height="6" fill="#888"/>
  <rect x="34" y="32" width="2" height="6" fill="#888"/>
</svg>`;

// 7-Segment Display
export const SEVEN_SEGMENT_SVG = `<svg viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="20" height="28" rx="1" fill="#1a1a1a"/>
  <path d="M6 6 L18 6" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
  <path d="M5 7 L5 14" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
  <path d="M19 7 L19 14" stroke="#333" stroke-width="2" stroke-linecap="round"/>
  <path d="M6 15 L18 15" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
  <path d="M5 16 L5 23" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
  <path d="M19 16 L19 23" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
  <path d="M6 24 L18 24" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
</svg>`;

// Buzzer
export const BUZZER_SVG = `<svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="14" cy="14" r="12" fill="#333"/>
  <circle cx="14" cy="14" r="10" fill="#444"/>
  <circle cx="14" cy="14" r="5" fill="#222"/>
  <text x="14" y="16" font-size="4" fill="#888" text-anchor="middle" font-family="monospace">♪</text>
  <rect x="8" y="26" width="2" height="4" fill="#888"/>
  <rect x="18" y="26" width="2" height="4" fill="#888"/>
</svg>`;

// Component SVG map for easy lookup
export const COMPONENT_SVGS: Record<string, string> = {
    'arduino-uno': ARDUINO_UNO_SVG,
    'arduino-nano': ARDUINO_NANO_SVG,
    'arduino-mega': ARDUINO_MEGA_SVG,
    'esp32-devkit-v1': ESP32_SVG,
    'led': LED_SVG,
    'rgb-led': RGB_LED_SVG,
    'neopixel': NEOPIXEL_SVG,
    'pushbutton': PUSHBUTTON_SVG,
    'pushbutton-6mm': PUSHBUTTON_SVG,
    'resistor': RESISTOR_SVG,
    'potentiometer': POTENTIOMETER_SVG,
    'slide-potentiometer': POTENTIOMETER_SVG,
    'servo': SERVO_SVG,
    'dht22': DHT22_SVG,
    'hc-sr04': HCSR04_SVG,
    'lcd1602': LCD1602_SVG,
    'lcd2004': LCD1602_SVG,
    'oled-128x64-i2c': OLED_SVG,
    'seven-segment': SEVEN_SEGMENT_SVG,
    'buzzer': BUZZER_SVG,
};
