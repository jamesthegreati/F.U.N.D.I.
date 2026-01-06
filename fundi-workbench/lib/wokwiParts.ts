/**
 * Registry of available Wokwi parts
 */
export type ComponentCategory = 'mcu' | 'displays' | 'leds' | 'input' | 'output' | 'passive' | 'logic' | 'motors';

export interface WokwiPartConfig {
    name: string;
    element: string;
    description?: string;
    category?: ComponentCategory;
    /** Optional inline SVG for component preview in the library */
    svg?: string;
}


export const WOKWI_PARTS: Record<string, WokwiPartConfig> = {
    'arduino-uno': {
        name: 'Arduino Uno',
        element: 'wokwi-arduino-uno',
        description: 'ATmega328P-based microcontroller board',
        category: 'mcu',
    },
    'esp32-devkit-v1': {
        name: 'ESP32 DevKit V1',
        element: 'wokwi-esp32-devkit-v1',
        description: 'ESP32 development board with WiFi & Bluetooth',
        category: 'mcu',
    },
    'arduino-mega': {
        name: 'Arduino Mega',
        element: 'wokwi-arduino-mega',
        description: 'ATmega2560-based board with more pins',
        category: 'mcu',
    },
    'arduino-nano': {
        name: 'Arduino Nano',
        element: 'wokwi-arduino-nano',
        description: 'Compact ATmega328P board',
        category: 'mcu',
    },

    'nano-rp2040-connect': {
        name: 'Nano RP2040 Connect',
        element: 'wokwi-nano-rp2040-connect',
        description: 'RP2040-based Arduino Nano form factor',
        category: 'mcu',
    },

    'franzininho': {
        name: 'Franzininho',
        element: 'wokwi-franzininho',
        description: 'ATtiny85-based development board',
        category: 'mcu',
    },

    // Displays
    'oled-128x64-i2c': {
        name: 'OLED 128x64 (I2C)',
        element: 'wokwi-ssd1306',
        description: 'SSD1306 monochrome OLED display',
        category: 'displays',
    },
    'lcd1602': {
        name: 'LCD 1602',
        element: 'wokwi-lcd1602',
        description: '16x2 character LCD',
        category: 'displays',
    },
    'seven-segment': {
        name: '7-Segment Display',
        element: 'wokwi-7segment',
        description: 'Single-digit 7-segment display',
        category: 'displays',
    },

    'lcd2004': {
        name: 'LCD 2004',
        element: 'wokwi-lcd2004',
        description: '20x4 character LCD',
        category: 'displays',
    },

    'ili9341': {
        name: 'ILI9341 TFT',
        element: 'wokwi-ili9341',
        description: 'SPI TFT display (ILI9341)',
        category: 'displays',
    },

    // LEDs
    'led': {
        name: 'LED',
        element: 'wokwi-led',
        description: 'Basic single-color LED',
        category: 'leds',
    },
    'rgb-led': {
        name: 'RGB LED',
        element: 'wokwi-rgb-led',
        description: 'Common-cathode RGB LED',
        category: 'leds',
    },
    'neopixel': {
        name: 'NeoPixel (WS2812)',
        element: 'wokwi-neopixel',
        description: 'Addressable RGB LED (single)',
        category: 'leds',
    },

    'neopixel-matrix': {
        name: 'NeoPixel Matrix',
        element: 'wokwi-neopixel-matrix',
        description: 'Addressable RGB LED matrix',
        category: 'leds',
    },

    'led-bar-graph': {
        name: 'LED Bar Graph',
        element: 'wokwi-led-bar-graph',
        description: '10-segment LED bar graph',
        category: 'leds',
    },

    'led-ring': {
        name: 'LED Ring',
        element: 'wokwi-led-ring',
        description: 'Addressable LED ring',
        category: 'leds',
    },

    // Alias: some diagrams use wokwi-neopixel-ring for the same element
    'neopixel-ring': {
        name: 'NeoPixel Ring',
        element: 'wokwi-led-ring',
        description: 'Addressable NeoPixel ring (WS2812)',
        category: 'leds',
    },

    // Sensors
    'dht22': {
        name: 'DHT22',
        element: 'wokwi-dht22',
        description: 'Temperature & humidity sensor',
        category: 'input',
    },
    'hc-sr04': {
        name: 'HC-SR04',
        element: 'wokwi-hc-sr04',
        description: 'Ultrasonic distance sensor',
        category: 'input',
    },
    'pir-motion': {
        name: 'PIR Motion Sensor',
        element: 'wokwi-pir-motion-sensor',
        description: 'Passive infrared motion sensor',
        category: 'input',
    },
    // Alias: some pipelines strip the `wokwi-` prefix and keep the `-sensor` suffix
    'pir-motion-sensor': {
        name: 'PIR Motion Sensor',
        element: 'wokwi-pir-motion-sensor',
        description: 'Passive infrared motion sensor',
        category: 'input',
    },
    'photoresistor': {
        name: 'Photoresistor (LDR)',
        element: 'wokwi-photoresistor-sensor',
        description: 'Light-dependent resistor sensor',
        category: 'input',
    },
    // Alias: some pipelines strip the `wokwi-` prefix and keep the `-sensor` suffix
    'photoresistor-sensor': {
        name: 'Photoresistor (LDR)',
        element: 'wokwi-photoresistor-sensor',
        description: 'Light-dependent resistor sensor',
        category: 'input',
    },

    'mpu6050': {
        name: 'MPU6050',
        element: 'wokwi-mpu6050',
        description: 'Accelerometer + gyroscope (I2C)',
        category: 'input',
    },

    'ds1307': {
        name: 'DS1307 RTC',
        element: 'wokwi-ds1307',
        description: 'Real-time clock module (I2C)',
        category: 'input',
    },

    'ir-receiver': {
        name: 'IR Receiver',
        element: 'wokwi-ir-receiver',
        description: 'Infrared receiver',
        category: 'input',
    },

    'ir-remote': {
        name: 'IR Remote',
        element: 'wokwi-ir-remote',
        description: 'Infrared remote control',
        category: 'input',
    },

    'analog-joystick': {
        name: 'Analog Joystick',
        element: 'wokwi-analog-joystick',
        description: '2-axis analog joystick',
        category: 'input',
    },

    'rotary-encoder': {
        name: 'Rotary Encoder (KY-040)',
        element: 'wokwi-ky-040',
        description: 'Incremental rotary encoder',
        category: 'input',
    },

    'pushbutton': {
        name: 'Pushbutton',
        element: 'wokwi-pushbutton',
        description: 'Momentary pushbutton',
        category: 'input',
    },

    'pushbutton-6mm': {
        name: 'Pushbutton (6mm)',
        element: 'wokwi-pushbutton-6mm',
        description: 'Tactile 6mm pushbutton',
        category: 'input',
    },

    'resistor': {
        name: 'Resistor',
        element: 'wokwi-resistor',
        description: 'Generic resistor',
        category: 'passive',
    },

    'potentiometer': {
        name: 'Potentiometer',
        element: 'wokwi-potentiometer',
        description: 'Rotary potentiometer',
        category: 'input',
    },

    'slide-potentiometer': {
        name: 'Slide Potentiometer',
        element: 'wokwi-slide-potentiometer',
        description: 'Linear slide potentiometer',
        category: 'input',
    },

    'slide-switch': {
        name: 'Slide Switch',
        element: 'wokwi-slide-switch',
        description: '2-position slide switch',
        category: 'input',
    },

    'dip-switch-8': {
        name: 'DIP Switch (8)',
        element: 'wokwi-dip-switch-8',
        description: '8-position DIP switch',
        category: 'input',
    },

    'buzzer': {
        name: 'Buzzer',
        element: 'wokwi-buzzer',
        description: 'Piezo buzzer',
        category: 'output',
    },

    'servo': {
        name: 'Servo',
        element: 'wokwi-servo',
        description: 'RC servo motor',
        category: 'motors',
    },

    'membrane-keypad': {
        name: 'Membrane Keypad',
        element: 'wokwi-membrane-keypad',
        description: 'Matrix keypad',
        category: 'input',
    },

    'microsd-card': {
        name: 'MicroSD Card',
        element: 'wokwi-microsd-card',
        description: 'MicroSD card module',
        category: 'passive',
    },

    // ==========================================
    // BREADBOARDS (Critical - was missing!)
    // ==========================================
    'breadboard': {
        name: 'Breadboard',
        element: 'wokwi-breadboard',
        description: 'Full-size breadboard (830 tie points)',
        category: 'passive',
    },
    'breadboard-mini': {
        name: 'Mini Breadboard',
        element: 'wokwi-breadboard-mini',
        description: 'Mini breadboard (170 tie points)',
        category: 'passive',
    },

    // ==========================================
    // LOGIC ICs
    // ==========================================
    '74hc595': {
        name: '74HC595 Shift Register',
        element: 'wokwi-74hc595',
        description: '8-bit serial-in, parallel-out shift register',
        category: 'logic',
    },
    '74hc165': {
        name: '74HC165 Shift Register',
        element: 'wokwi-74hc165',
        description: '8-bit parallel-in, serial-out shift register',
        category: 'logic',
    },

    // ==========================================
    // MOTORS & DRIVERS
    // ==========================================
    'stepper-motor': {
        name: 'Stepper Motor',
        element: 'wokwi-stepper-motor',
        description: 'Bipolar stepper motor',
        category: 'motors',
    },
    'a4988': {
        name: 'A4988 Driver',
        element: 'wokwi-a4988',
        description: 'Stepper motor driver',
        category: 'motors',
    },
    'biaxial-stepper': {
        name: 'Biaxial Stepper',
        element: 'wokwi-biaxial-stepper',
        description: 'Biaxial stepper motor',
        category: 'motors',
    },

    // ==========================================
    // ADDITIONAL SENSORS
    // ==========================================
    'hx711': {
        name: 'HX711 Load Cell',
        element: 'wokwi-hx711',
        description: 'Load cell amplifier',
        category: 'input',
    },
    'ds18b20': {
        name: 'DS18B20',
        element: 'wokwi-ds18b20',
        description: 'Digital temperature sensor (1-Wire)',
        category: 'input',
    },
    'ntc-temperature-sensor': {
        name: 'NTC Thermistor',
        element: 'wokwi-ntc-temperature-sensor',
        description: 'Analog temperature sensor',
        category: 'input',
    },

    // ==========================================
    // ADDITIONAL DISPLAYS
    // ==========================================
    'max7219-matrix': {
        name: 'MAX7219 Matrix',
        element: 'wokwi-max7219-matrix',
        description: '8x8 LED dot matrix display',
        category: 'displays',
    },
    'tm1637-7segment': {
        name: 'TM1637 Display',
        element: 'wokwi-tm1637-7segment',
        description: '4-digit 7-segment display with driver',
        category: 'displays',
    },

    // ==========================================
    // OUTPUT DEVICES
    // ==========================================
    'relay-module': {
        name: 'Relay Module',
        element: 'wokwi-relay-module',
        description: 'Single channel relay module',
        category: 'output',
    },
    'nlsf595': {
        name: 'NLSF595 LED Driver',
        element: 'wokwi-nlsf595',
        description: 'LED driver with shift register',
        category: 'leds',
    },

    // ==========================================
    // ADDITIONAL MICROCONTROLLERS
    // ==========================================
    'attiny85': {
        name: 'ATtiny85',
        element: 'wokwi-attiny85',
        description: 'Small 8-pin microcontroller',
        category: 'mcu',
    },
    'pi-pico': {
        name: 'Raspberry Pi Pico',
        element: 'wokwi-pi-pico',
        description: 'RP2040-based microcontroller',
        category: 'mcu',
    },
};

export type WokwiPartType = keyof typeof WOKWI_PARTS;

