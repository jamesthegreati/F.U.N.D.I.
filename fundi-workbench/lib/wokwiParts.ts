/**
 * Registry of available Wokwi parts
 */
export interface WokwiPartConfig {
    name: string;
    element: string;
    description?: string;
    category?: 'mcu' | 'displays' | 'leds' | 'sensors';
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

    // Sensors
    'dht22': {
        name: 'DHT22',
        element: 'wokwi-dht22',
        description: 'Temperature & humidity sensor',
        category: 'sensors',
    },
    'hc-sr04': {
        name: 'HC-SR04',
        element: 'wokwi-hc-sr04',
        description: 'Ultrasonic distance sensor',
        category: 'sensors',
    },
    'pir-motion': {
        name: 'PIR Motion Sensor',
        element: 'wokwi-pir-motion-sensor',
        description: 'Passive infrared motion sensor',
        category: 'sensors',
    },
    'photoresistor': {
        name: 'Photoresistor (LDR)',
        element: 'wokwi-photoresistor-sensor',
        description: 'Light-dependent resistor sensor',
        category: 'sensors',
    },

    'mpu6050': {
        name: 'MPU6050',
        element: 'wokwi-mpu6050',
        description: 'Accelerometer + gyroscope (I2C)',
        category: 'sensors',
    },

    'ds1307': {
        name: 'DS1307 RTC',
        element: 'wokwi-ds1307',
        description: 'Real-time clock module (I2C)',
        category: 'sensors',
    },

    'ir-receiver': {
        name: 'IR Receiver',
        element: 'wokwi-ir-receiver',
        description: 'Infrared receiver',
        category: 'sensors',
    },

    'ir-remote': {
        name: 'IR Remote',
        element: 'wokwi-ir-remote',
        description: 'Infrared remote control',
        category: 'sensors',
    },

    'analog-joystick': {
        name: 'Analog Joystick',
        element: 'wokwi-analog-joystick',
        description: '2-axis analog joystick',
        category: 'sensors',
    },

    'rotary-encoder': {
        name: 'Rotary Encoder (KY-040)',
        element: 'wokwi-ky-040',
        description: 'Incremental rotary encoder',
        category: 'sensors',
    },

    'pushbutton': {
        name: 'Pushbutton',
        element: 'wokwi-pushbutton',
        description: 'Momentary pushbutton',
        category: 'sensors',
    },

    'pushbutton-6mm': {
        name: 'Pushbutton (6mm)',
        element: 'wokwi-pushbutton-6mm',
        description: 'Tactile 6mm pushbutton',
        category: 'sensors',
    },

    'resistor': {
        name: 'Resistor',
        element: 'wokwi-resistor',
        description: 'Generic resistor',
        category: 'sensors',
    },

    'potentiometer': {
        name: 'Potentiometer',
        element: 'wokwi-potentiometer',
        description: 'Rotary potentiometer',
        category: 'sensors',
    },

    'slide-potentiometer': {
        name: 'Slide Potentiometer',
        element: 'wokwi-slide-potentiometer',
        description: 'Linear slide potentiometer',
        category: 'sensors',
    },

    'slide-switch': {
        name: 'Slide Switch',
        element: 'wokwi-slide-switch',
        description: '2-position slide switch',
        category: 'sensors',
    },

    'dip-switch-8': {
        name: 'DIP Switch (8)',
        element: 'wokwi-dip-switch-8',
        description: '8-position DIP switch',
        category: 'sensors',
    },

    'buzzer': {
        name: 'Buzzer',
        element: 'wokwi-buzzer',
        description: 'Piezo buzzer',
        category: 'sensors',
    },

    'servo': {
        name: 'Servo',
        element: 'wokwi-servo',
        description: 'RC servo motor',
        category: 'sensors',
    },

    'membrane-keypad': {
        name: 'Membrane Keypad',
        element: 'wokwi-membrane-keypad',
        description: 'Matrix keypad',
        category: 'sensors',
    },

    'microsd-card': {
        name: 'MicroSD Card',
        element: 'wokwi-microsd-card',
        description: 'MicroSD card module',
        category: 'sensors',
    },
};

export type WokwiPartType = keyof typeof WOKWI_PARTS;
