'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { X, ChevronUp, ChevronDown, Thermometer, Droplets, Ruler } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Props for the SensorValuePopup component
 */
interface SensorValuePopupProps {
    /** Part ID that this popup controls */
    partId: string;
    /** Part type for determining which controls to show */
    partType: string;
    /** Whether the popup is visible */
    isOpen: boolean;
    /** Callback to close the popup */
    onClose: () => void;
    /** Current values */
    values: Record<string, number>;
    /** Callback when a value changes */
    onValueChange: (partId: string, key: string, value: number) => void;
    /** Position of the popup (relative to viewport) */
    position?: { x: number; y: number };
}

/**
 * Configuration for sensor types
 */
const SENSOR_CONFIG: Record<string, {
    fields: Array<{
        key: string;
        label: string;
        icon: typeof Thermometer;
        min: number;
        max: number;
        step: number;
        unit: string;
        defaultValue: number;
    }>;
}> = {
    'dht22': {
        fields: [
            { key: 'temperature', label: 'Temperature', icon: Thermometer, min: -40, max: 80, step: 0.5, unit: '°C', defaultValue: 25 },
            { key: 'humidity', label: 'Humidity', icon: Droplets, min: 0, max: 100, step: 1, unit: '%', defaultValue: 50 },
        ],
    },
    'wokwi-dht22': {
        fields: [
            { key: 'temperature', label: 'Temperature', icon: Thermometer, min: -40, max: 80, step: 0.5, unit: '°C', defaultValue: 25 },
            { key: 'humidity', label: 'Humidity', icon: Droplets, min: 0, max: 100, step: 1, unit: '%', defaultValue: 50 },
        ],
    },
    'hc-sr04': {
        fields: [
            { key: 'distance', label: 'Distance', icon: Ruler, min: 2, max: 400, step: 1, unit: 'cm', defaultValue: 100 },
        ],
    },
    'wokwi-hc-sr04': {
        fields: [
            { key: 'distance', label: 'Distance', icon: Ruler, min: 2, max: 400, step: 1, unit: 'cm', defaultValue: 100 },
        ],
    },
    'ds18b20': {
        fields: [
            { key: 'temperature', label: 'Temperature', icon: Thermometer, min: -55, max: 125, step: 0.5, unit: '°C', defaultValue: 25 },
        ],
    },
    'wokwi-ds18b20': {
        fields: [
            { key: 'temperature', label: 'Temperature', icon: Thermometer, min: -55, max: 125, step: 0.5, unit: '°C', defaultValue: 25 },
        ],
    },
    'ntc-temperature-sensor': {
        fields: [
            { key: 'temperature', label: 'Temperature', icon: Thermometer, min: -40, max: 125, step: 1, unit: '°C', defaultValue: 25 },
        ],
    },
    'wokwi-ntc-temperature-sensor': {
        fields: [
            { key: 'temperature', label: 'Temperature', icon: Thermometer, min: -40, max: 125, step: 1, unit: '°C', defaultValue: 25 },
        ],
    },

    // Light sensors (ADC-style)
    'photoresistor-sensor': {
        fields: [
            { key: 'value', label: 'Light', icon: Ruler, min: 0, max: 1023, step: 1, unit: '', defaultValue: 512 },
        ],
    },
    'wokwi-photoresistor-sensor': {
        fields: [
            { key: 'value', label: 'Light', icon: Ruler, min: 0, max: 1023, step: 1, unit: '', defaultValue: 512 },
        ],
    },

    // Motion sensors
    'pir-motion-sensor': {
        fields: [
            { key: 'motion', label: 'Motion', icon: Ruler, min: 0, max: 1, step: 1, unit: '', defaultValue: 0 },
        ],
    },
    'wokwi-pir-motion-sensor': {
        fields: [
            { key: 'motion', label: 'Motion', icon: Ruler, min: 0, max: 1, step: 1, unit: '', defaultValue: 0 },
        ],
    },
};

/**
 * Popup for adjusting sensor values (DHT22, HC-SR04, etc.)
 */
export function SensorValuePopup({
    partId,
    partType,
    isOpen,
    onClose,
    values,
    onValueChange,
    position,
}: SensorValuePopupProps) {
    const popupRef = useRef<HTMLDivElement>(null);

    // Get sensor configuration
    const normalizedType = partType.toLowerCase().replace('wokwi-', '');
    const config = SENSOR_CONFIG[partType] || SENSOR_CONFIG[normalizedType];

    // Close on escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        // Delay adding listener to avoid immediate close
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !config) return null;

    const handleIncrement = (key: string, step: number, max: number) => {
        const currentValue = values[key] ?? config.fields.find(f => f.key === key)?.defaultValue ?? 0;
        const newValue = Math.min(max, currentValue + step);
        onValueChange(partId, key, newValue);
    };

    const handleDecrement = (key: string, step: number, min: number) => {
        const currentValue = values[key] ?? config.fields.find(f => f.key === key)?.defaultValue ?? 0;
        const newValue = Math.max(min, currentValue - step);
        onValueChange(partId, key, newValue);
    };

    const handleSliderChange = (key: string, value: number) => {
        onValueChange(partId, key, value);
    };

    return (
        <div
            ref={popupRef}
            className="fixed z-[100] animate-fade-in"
            style={{
                left: position?.x ?? '50%',
                top: position?.y ?? '50%',
                transform: position ? 'translate(-50%, -50%)' : 'translate(-50%, -50%)',
            }}
        >
            <div className="glass-panel rounded-lg shadow-xl border border-ide-border min-w-[240px]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-ide-border px-3 py-2">
                    <span className="text-xs font-semibold text-ide-text">
                        {partType.replace('wokwi-', '').toUpperCase()} Settings
                    </span>
                    <button
                        onClick={onClose}
                        className="flex h-5 w-5 items-center justify-center rounded hover:bg-ide-panel-hover text-ide-text-muted hover:text-ide-text transition-colors"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>

                {/* Value controls */}
                <div className="p-3 space-y-3">
                    {config.fields.map((field) => {
                        const Icon = field.icon;
                        const currentValue = values[field.key] ?? field.defaultValue;

                        return (
                            <div key={field.key} className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Icon className="h-3.5 w-3.5 text-ide-accent" />
                                        <span className="text-xs font-medium text-ide-text-muted">{field.label}</span>
                                    </div>
                                    <span className="text-xs font-mono text-ide-text">
                                        {currentValue.toFixed(field.step < 1 ? 1 : 0)} {field.unit}
                                    </span>
                                </div>

                                {/* Slider + buttons */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDecrement(field.key, field.step * 10, field.min)}
                                        className="flex h-6 w-6 items-center justify-center rounded bg-ide-panel-hover text-ide-text-muted hover:bg-ide-error/20 hover:text-ide-error transition-colors"
                                    >
                                        <ChevronDown className="h-3.5 w-3.5" />
                                    </button>

                                    <input
                                        type="range"
                                        min={field.min}
                                        max={field.max}
                                        step={field.step}
                                        value={currentValue}
                                        onChange={(e) => handleSliderChange(field.key, parseFloat(e.target.value))}
                                        className="flex-1 h-1.5 bg-ide-panel-hover rounded-full appearance-none cursor-pointer accent-ide-accent"
                                    />

                                    <button
                                        onClick={() => handleIncrement(field.key, field.step * 10, field.max)}
                                        className="flex h-6 w-6 items-center justify-center rounded bg-ide-panel-hover text-ide-text-muted hover:bg-ide-success/20 hover:text-ide-success transition-colors"
                                    >
                                        <ChevronUp className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/**
 * Hook to manage sensor popup state
 */
export function useSensorPopup() {
    const [popupState, setPopupState] = useState<{
        isOpen: boolean;
        partId: string;
        partType: string;
        position?: { x: number; y: number };
    }>({
        isOpen: false,
        partId: '',
        partType: '',
    });

    const openPopup = useCallback((partId: string, partType: string, position?: { x: number; y: number }) => {
        setPopupState({ isOpen: true, partId, partType, position });
    }, []);

    const closePopup = useCallback(() => {
        setPopupState(prev => ({ ...prev, isOpen: false }));
    }, []);

    return { popupState, openPopup, closePopup };
}

/**
 * Check if a part type supports the sensor value popup
 */
export function isSensorWithPopup(partType: string): boolean {
    const normalizedType = partType.toLowerCase().replace('wokwi-', '');
    return (
        partType in SENSOR_CONFIG ||
        normalizedType in SENSOR_CONFIG
    );
}
