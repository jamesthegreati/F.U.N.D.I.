'use client';

/**
 * Interactive component state management for simulation
 * Handles user-adjustable sensor values like potentiometers, temperature sensors, etc.
 */

export interface InteractiveComponentState {
    /** Component part ID */
    partId: string;
    /** Component type */
    partType: string;
    /** Current value (0-1023 for analog, varies for sensors) */
    value: number;
    /** Minimum value */
    min: number;
    /** Maximum value */
    max: number;
    /** Display unit (e.g., "°C", "cm", "%") */
    unit: string;
    /** Display label */
    label: string;
}

/**
 * Configuration for different interactive component types
 */
export const INTERACTIVE_COMPONENT_CONFIG: Record<string, {
    min: number;
    max: number;
    default: number;
    unit: string;
    label: string;
}> = {
    // Potentiometers - analog value 0-1023 (10-bit ADC)
    'potentiometer': { min: 0, max: 1023, default: 512, unit: '', label: 'Value' },
    'wokwi-potentiometer': { min: 0, max: 1023, default: 512, unit: '', label: 'Value' },
    'slide-potentiometer': { min: 0, max: 1023, default: 512, unit: '', label: 'Value' },
    'wokwi-slide-potentiometer': { min: 0, max: 1023, default: 512, unit: '', label: 'Value' },

    // Temperature sensors
    'dht22': { min: -40, max: 80, default: 25, unit: '°C', label: 'Temperature' },
    'wokwi-dht22': { min: -40, max: 80, default: 25, unit: '°C', label: 'Temperature' },
    'ds18b20': { min: -55, max: 125, default: 25, unit: '°C', label: 'Temperature' },
    'wokwi-ds18b20': { min: -55, max: 125, default: 25, unit: '°C', label: 'Temperature' },
    'ntc-temperature-sensor': { min: -40, max: 125, default: 25, unit: '°C', label: 'Temperature' },
    'wokwi-ntc-temperature-sensor': { min: -40, max: 125, default: 25, unit: '°C', label: 'Temperature' },

    // Distance sensors
    'hc-sr04': { min: 2, max: 400, default: 100, unit: 'cm', label: 'Distance' },
    'wokwi-hc-sr04': { min: 2, max: 400, default: 100, unit: 'cm', label: 'Distance' },

    // Light sensors
    'photoresistor-sensor': { min: 0, max: 1023, default: 512, unit: '', label: 'Light' },
    'wokwi-photoresistor-sensor': { min: 0, max: 1023, default: 512, unit: '', label: 'Light' },

    // Gas/Air quality
    'gas-sensor': { min: 0, max: 1023, default: 200, unit: 'ppm', label: 'Gas Level' },
    'wokwi-gas-sensor': { min: 0, max: 1023, default: 200, unit: 'ppm', label: 'Gas Level' },

    // PIR Motion sensor
    'pir-motion-sensor': { min: 0, max: 1, default: 0, unit: '', label: 'Motion' },
    'wokwi-pir-motion-sensor': { min: 0, max: 1, default: 0, unit: '', label: 'Motion' },

    // Tilt sensor
    'tilt-sensor': { min: 0, max: 1, default: 0, unit: '', label: 'Tilted' },
    'wokwi-tilt-sensor': { min: 0, max: 1, default: 0, unit: '', label: 'Tilted' },
};

/**
 * Manager for interactive component states
 */
class InteractiveComponentManager {
    private states: Map<string, InteractiveComponentState> = new Map();
    private listeners: Set<(states: Map<string, InteractiveComponentState>) => void> = new Set();

    /**
     * Register a component for interactive control
     */
    registerComponent(partId: string, partType: string): void {
        // Normalize part type
        const normalizedType = partType.toLowerCase().replace('wokwi-', '');

        // Check if this type is interactive
        const config = INTERACTIVE_COMPONENT_CONFIG[partType] ||
            INTERACTIVE_COMPONENT_CONFIG[normalizedType];

        if (!config) return; // Not an interactive component

        if (!this.states.has(partId)) {
            this.states.set(partId, {
                partId,
                partType,
                value: config.default,
                min: config.min,
                max: config.max,
                unit: config.unit,
                label: config.label,
            });
            this.notifyListeners();
        }
    }

    /**
     * Unregister a component
     */
    unregisterComponent(partId: string): void {
        if (this.states.delete(partId)) {
            this.notifyListeners();
        }
    }

    /**
     * Update a component's value
     */
    setValue(partId: string, value: number): void {
        const state = this.states.get(partId);
        if (!state) return;

        // Clamp value to valid range
        const clampedValue = Math.max(state.min, Math.min(state.max, value));

        if (state.value !== clampedValue) {
            state.value = clampedValue;
            this.states.set(partId, state);
            this.notifyListeners();
        }
    }

    /**
     * Get a component's current value
     */
    getValue(partId: string): number | undefined {
        return this.states.get(partId)?.value;
    }

    /**
     * Get a component's state
     */
    getState(partId: string): InteractiveComponentState | undefined {
        return this.states.get(partId);
    }

    /**
     * Get all registered interactive components
     */
    getAllStates(): Map<string, InteractiveComponentState> {
        return new Map(this.states);
    }

    /**
     * Check if a part type is interactive
     */
    isInteractive(partType: string): boolean {
        const normalizedType = partType.toLowerCase().replace('wokwi-', '');
        return (
            partType in INTERACTIVE_COMPONENT_CONFIG ||
            normalizedType in INTERACTIVE_COMPONENT_CONFIG
        );
    }

    /**
     * Subscribe to state changes
     */
    subscribe(listener: (states: Map<string, InteractiveComponentState>) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Notify all listeners of state changes
     */
    private notifyListeners(): void {
        for (const listener of this.listeners) {
            listener(this.states);
        }
    }

    /**
     * Reset all values to defaults
     */
    resetAll(): void {
        for (const [partId, state] of this.states) {
            const config = INTERACTIVE_COMPONENT_CONFIG[state.partType] ||
                INTERACTIVE_COMPONENT_CONFIG[state.partType.toLowerCase().replace('wokwi-', '')];
            if (config) {
                state.value = config.default;
                this.states.set(partId, state);
            }
        }
        this.notifyListeners();
    }

    /**
     * Clear all registered components
     */
    clear(): void {
        this.states.clear();
        this.notifyListeners();
    }
}

// Singleton instance
let interactiveManagerInstance: InteractiveComponentManager | null = null;

/**
 * Get the interactive component manager singleton
 */
export function getInteractiveComponentManager(): InteractiveComponentManager {
    if (!interactiveManagerInstance) {
        interactiveManagerInstance = new InteractiveComponentManager();
    }
    return interactiveManagerInstance;
}

export type { InteractiveComponentManager };
