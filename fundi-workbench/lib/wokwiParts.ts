/**
 * Registry of available Wokwi parts
 */
export interface WokwiPartConfig {
    name: string;
    element: string;
    description?: string;
}

export const WOKWI_PARTS: Record<string, WokwiPartConfig> = {
    'arduino-uno': {
        name: 'Arduino Uno',
        element: 'wokwi-arduino-uno',
        description: 'ATmega328P-based microcontroller board',
    },
    'esp32-devkit-v1': {
        name: 'ESP32 DevKit V1',
        element: 'wokwi-esp32-devkit-v1',
        description: 'ESP32 development board with WiFi & Bluetooth',
    },
    'arduino-mega': {
        name: 'Arduino Mega',
        element: 'wokwi-arduino-mega',
        description: 'ATmega2560-based board with more pins',
    },
    'arduino-nano': {
        name: 'Arduino Nano',
        element: 'wokwi-arduino-nano',
        description: 'Compact ATmega328P board',
    },
};

export type WokwiPartType = keyof typeof WOKWI_PARTS;
