'use client';

import '@wokwi/elements';
import '@wokwi/elements/dist/esm/pir-motion-sensor-element';
import '@wokwi/elements/dist/esm/photoresistor-sensor-element';
import { memo, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { ElementType } from 'react';
import { Trash2 } from 'lucide-react';
import { WOKWI_PARTS, WokwiPartType } from '@/lib/wokwiParts';
import { useAppStore, type CircuitPart } from '@/store/useAppStore';
import type { WirePoint } from '@/types/wire';
import { getAudioSimulation, pwmToFrequency } from '@/utils/simulation/audio';
import { getLCD1602 } from '@/utils/simulation/lcd1602';
import { getSSD1306 } from '@/utils/simulation/ssd1306';
import { getILI9341 } from '@/utils/simulation/ili9341';
import { SensorValuePopup, isSensorWithPopup } from '@/components/SensorValuePopup';
import { getInteractiveComponentManager } from '@/utils/simulation/interactiveComponents';

interface PinData {
    id: string;
    x: number;
    y: number;
    row: 'top' | 'bottom' | 'left' | 'right';
}

interface WokwiPartNodeData {
    onPinClick?: (nodeId: string, pinId: string, position: WirePoint) => void;
    getCanvasRect?: () => DOMRect | null;
    onDeletePart?: (nodeId: string) => void;
    /** 
     * Pin states from simulation - maps pin ID to:
     * - boolean: HIGH/LOW digital state
     * - number (0-255): PWM duty cycle for brightness control
     */
    simulationPinStates?: Record<string, boolean | number>;
    /** PWM duty cycle value for the component (0-255) - for LED brightness */
    pwmValue?: number;
    /** Part type for this component */
    partType?: WokwiPartType;

    /** Element attributes for Wokwi custom elements (e.g., { color: 'green' }, { value: '220' }) */
    attrs?: Record<string, string>;
    /** Button interaction handlers */
    onButtonPress?: (partId: string) => void;
    onButtonRelease?: (partId: string) => void;
    /** Interactive component value change (potentiometers, sensors, etc.) */
    onValueChange?: (partId: string, value: number) => void;
    /** Current interactive component value (for display) */
    interactiveValue?: number;
    /** Slide switch toggle callback */
    onSwitchToggle?: (partId: string, isOn: boolean) => void;
    /** Current switch state (for display) */
    switchState?: boolean;

    /** DIP switch (8) values change callback */
    onDipSwitchChange?: (partId: string, values: number[]) => void;

    /** Rotary encoder (KY-040) rotation callback */
    onEncoderRotate?: (partId: string, direction: 'cw' | 'ccw') => void;

    /** Analog joystick move callback (ADC values 0-1023) */
    onJoystickMove?: (partId: string, horz: number, vert: number) => void;
}

interface WokwiPartNodeProps {
    id?: string;
    data?: WokwiPartNodeData;
    partType?: WokwiPartType; // Can be passed directly or via data
}

function getPartTypeFromData(data: WokwiPartNodeData | undefined): WokwiPartType | null {
    const maybe = (data as unknown as { partType?: unknown } | undefined)?.partType;
    return typeof maybe === 'string' ? (maybe as WokwiPartType) : null;
}

function parseI2CAddress(attr: unknown, fallback: number): number {
    if (typeof attr === 'number' && Number.isFinite(attr)) return attr;
    if (typeof attr !== 'string') return fallback;
    const t = attr.trim();
    const parsed = t.startsWith('0x') ? Number.parseInt(t.slice(2), 16) : Number.parseInt(t, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Generic Wokwi Part Node - renders any Wokwi element with pin overlays
 */
function WokwiPartNode({ id: nodeId = 'preview', data, partType: propPartType }: WokwiPartNodeProps) {
    const onPinClick = data?.onPinClick;
    const getCanvasRect = data?.getCanvasRect;
    const onDeletePart = data?.onDeletePart;
    const simulationPinStates = data?.simulationPinStates;
    const pwmValue = data?.pwmValue;
    const partType = propPartType ?? getPartTypeFromData(data) ?? 'arduino-uno';

    const [hoveredPin, setHoveredPin] = useState<string | null>(null);
    const [pins, setPins] = useState<PinData[]>([]);
    const [svgDimensions, setSvgDimensions] = useState({ width: 100, height: 100 });
    const [isSelected, setIsSelected] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const elementRef = useRef<HTMLElement | null>(null);

    // elementRef is initialized asynchronously after customElements.whenDefined.
    // Use a state tick so effects can re-run once the element is available.
    const [elementReadyTick, setElementReadyTick] = useState(0);

    const [sensorPopupOpen, setSensorPopupOpen] = useState(false);
    const [sensorPopupPos, setSensorPopupPos] = useState<{ x: number; y: number } | undefined>(undefined);

    const partConfig = WOKWI_PARTS[partType];
    const partElementTag = partConfig?.element;
    const PartElement = (partElementTag ?? null) as ElementType | null;
    const isUnknownPart = !partConfig || !partElementTag || !PartElement;

    const applyStaticAttrs = useCallback(() => {
        const element = elementRef.current;
        if (!element) return;

        const attrs = data?.attrs;
        if (!attrs) return;

        for (const [key, value] of Object.entries(attrs)) {
            // Avoid clobbering simulation-driven runtime properties.
            if ((partType === 'led' || partType === 'wokwi-led') && (key === 'value' || key === 'brightness')) {
                continue;
            }

            // NeoPixel frames are applied via element APIs, not attributes.
            if ((partType.toLowerCase().includes('neopixel') || partType.toLowerCase().includes('ws2812') || partType.toLowerCase().includes('led-ring')) && key === 'pixelColors') {
                continue;
            }

            try {
                element.setAttribute(key, String(value));
            } catch {
                // Ignore invalid attributes
            }
        }

        const maybeLit = element as unknown as { requestUpdate?: () => void };
        if (typeof maybeLit.requestUpdate === 'function') {
            maybeLit.requestUpdate();
        }
    }, [data?.attrs, partType]);

    const isHcsr04 = useMemo(() => {
        const t = partType.toLowerCase();
        return t.includes('hc-sr04') || t.includes('hcsr04');
    }, [partType]);

    const supportsSensorPopup = useMemo(() => isSensorWithPopup(partType), [partType]);

    const openSensorPopup = useCallback(() => {
        if (!containerRef.current) {
            setSensorPopupPos(undefined);
            setSensorPopupOpen(true);
            return;
        }
        const r = containerRef.current.getBoundingClientRect();
        setSensorPopupPos({ x: r.left + r.width / 2, y: r.top - 8 });
        setSensorPopupOpen(true);
    }, []);

    // Handle click to select/deselect component
    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            // Don't select if clicking on a pin
            const target = e.target as HTMLElement;
            if (target.hasAttribute('data-fundi-pin')) return;

            e.stopPropagation();
            if (nodeId === 'preview') return;

            // Sensor UX: clicking the sensor opens its value popup.
            if (supportsSensorPopup) {
                setIsSelected(true);
                openSensorPopup();
                return;
            }

            setIsSelected((prev) => !prev);
        },
        [nodeId, openSensorPopup, supportsSensorPopup]
    );

    const sensorValues = useMemo(() => {
        const attrs = (data?.attrs ?? {}) as Record<string, unknown>;
        const parseNum = (v: unknown, fallback: number) => {
            const n = typeof v === 'number' ? v : Number.parseFloat(String(v ?? ''));
            return Number.isFinite(n) ? n : fallback;
        };

        // Provide a superset of common sensor keys; the popup will only render fields
        // for the current partType config.
        return {
            distance: parseNum(attrs.distance, 100),
            temperature: parseNum(attrs.temperature, 25),
            humidity: parseNum(attrs.humidity, 50),
            value: parseNum(attrs.value, 512),
            motion: parseNum(attrs.motion, 0),
        };
    }, [data?.attrs]);

    const handleSensorValueChange = useCallback((partId: string, key: string, value: number) => {
        if (partId !== nodeId) return;

        // Persist on the part attrs so it survives reload / project switches.
        const state = useAppStore.getState();
        const parts = state.circuitParts || [];
        const partIndex = parts.findIndex((p: CircuitPart) => p.id === nodeId);
        if (partIndex !== -1) {
            const part = parts[partIndex];

            // PIR expects boolean-ish; store a real boolean for clarity.
            const persistedValue = key === 'motion' ? value >= 0.5 : value;
            state.updatePartAttrs(nodeId, { ...part.attrs, [key]: persistedValue });
        }

        // Also update the interactive simulation value when relevant.
        // HC-SR04 uses onValueChange to push into InteractiveComponentManager.
        if (key === 'distance' && typeof data?.onValueChange === 'function') {
            data.onValueChange(nodeId, value);
            return;
        }

        // Photoresistor (and other analog-style interactive sensors) read from InteractiveComponentManager.
        if (key === 'value' || key === 'temperature') {
            const interactiveManager = getInteractiveComponentManager();
            interactiveManager.setValue(nodeId, value);
        }
    }, [data, nodeId]);

    // Handle delete button click
    const handleDelete = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!onDeletePart || nodeId === 'preview') return;
            onDeletePart(nodeId);
        },
        [onDeletePart, nodeId]
    );

    // Click outside to deselect
    useEffect(() => {
        if (!isSelected) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsSelected(false);
            }
        };

        // Delay adding listener to avoid immediate deselection
        const timer = setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isSelected]);

    const handlePinClick = useCallback(
        (e: React.MouseEvent, pin: PinData) => {
            e.stopPropagation();
            if (!onPinClick || !elementRef.current) return;

            const element = elementRef.current;
            const elementRect = element.getBoundingClientRect();

            // Calculate scale: how much the element is scaled from its internal coordinate space
            const scaleX = elementRect.width / svgDimensions.width;
            const scaleY = elementRect.height / svgDimensions.height;

            // Transform pin coordinates to screen coordinates
            const screenX = elementRect.left + pin.x * scaleX;
            const screenY = elementRect.top + pin.y * scaleY;

            const canvasRect = getCanvasRect?.();
            const canvasRelative = canvasRect
                ? { x: screenX - canvasRect.left, y: screenY - canvasRect.top }
                : { x: screenX, y: screenY };

            onPinClick(nodeId, pin.id, canvasRelative);
        },
        [onPinClick, nodeId, getCanvasRect, svgDimensions]
    );

    const calculatePins = useCallback(() => {
        const element = elementRef.current as HTMLElement & {
            pinInfo?: { name: string; x: number; y: number }[]
        };

        if (!element || !element.shadowRoot || !element.pinInfo) return;

        const svg = element.shadowRoot.querySelector('svg');
        if (!svg) return;

        const viewBoxAttr = svg.getAttribute('viewBox');
        const widthAttr = svg.getAttribute('width') || '';
        const heightAttr = svg.getAttribute('height') || '';

        if (!viewBoxAttr) return;

        // Parse viewBox: "minX minY width height"
        const [, , vbW, vbH] = viewBoxAttr.split(/[\s,]+/).map(parseFloat);
        if (!vbW || !vbH) return;

        // Parse mm dimensions if present
        const widthMM = widthAttr.includes('mm') ? parseFloat(widthAttr) : null;
        const heightMM = heightAttr.includes('mm') ? parseFloat(heightAttr) : null;

        // Detect if viewBox is in mm by checking if it matches the mm dimensions
        // Arduino: viewBox="-4 0 72.58 53.34" with width="72.58mm" height="53.34mm" -> viewBox IS in mm
        // ESP32: viewBox="0 0 107 201" with width="28.2mm" height="54.053mm" -> viewBox is NOT in mm
        const viewBoxMatchesMM =
            widthMM !== null &&
            heightMM !== null &&
            Math.abs(vbW - widthMM) < 1 &&
            Math.abs(vbH - heightMM) < 1;

        const MM_TO_PX = 96 / 25.4;

        let overlayWidth: number;
        let overlayHeight: number;

        if (viewBoxMatchesMM) {
            // ViewBox is in mm, convert to pixels to match pinInfo coordinates
            overlayWidth = vbW * MM_TO_PX;
            overlayHeight = vbH * MM_TO_PX;
        } else {
            // ViewBox is already in the correct coordinate space (like ESP32)
            overlayWidth = vbW;
            overlayHeight = vbH;
        }

        setSvgDimensions({ width: overlayWidth, height: overlayHeight });

        // Map pins - pinInfo coordinates work directly in the overlay's space
        const mappedPins: PinData[] = element.pinInfo.map((pin) => {
            // Determine which edge the pin is closest to
            const relX = pin.x / overlayWidth;
            const relY = pin.y / overlayHeight;

            let row: 'top' | 'bottom' | 'left' | 'right';
            if (relX < 0.15) row = 'left';
            else if (relX > 0.85) row = 'right';
            else if (relY < 0.5) row = 'top';
            else row = 'bottom';

            return {
                id: pin.name,
                x: pin.x,
                y: pin.y,
                row,
            };
        });

        setPins(mappedPins);
    }, []);

    useEffect(() => {
        const initElement = async () => {
            if (!partElementTag) return;
            await customElements.whenDefined(partElementTag);

            const element = containerRef.current?.querySelector(partElementTag);
            if (!element) return;

            elementRef.current = element as HTMLElement;
            setElementReadyTick((t) => t + 1);
            applyStaticAttrs();

            requestAnimationFrame(() => {
                calculatePins();
                setTimeout(calculatePins, 100);
                setTimeout(calculatePins, 300);
            });
        };

        initElement();

        const observer = new ResizeObserver(calculatePins);
        if (containerRef.current) observer.observe(containerRef.current);

        window.addEventListener('resize', calculatePins);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', calculatePins);
        };
    }, [applyStaticAttrs, calculatePins, partElementTag]);

    // Apply static Wokwi element attributes from circuit state (colors, values, labels, etc.)
    useEffect(() => {
        applyStaticAttrs();
    }, [applyStaticAttrs]);

    // Update element properties based on simulation pin states and PWM values
    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        // Debug log when simulation states or PWM values are received
        const hasSimStates = simulationPinStates && Object.keys(simulationPinStates).length > 0;
        const hasPwm = typeof pwmValue === 'number' && pwmValue > 0;

        if (hasSimStates || hasPwm) {
            console.log('[WokwiPartNode] Applying states:', { partType, nodeId, simulationPinStates, pwmValue });
        }

        // For LED elements: if anode (A) is HIGH and cathode (C) is LOW or ground, turn ON
        // LED element has a 'value' property (boolean) to control on/off state
        // For PWM: use 'brightness' property (0-1) with gamma correction
        // Wokwi LED: value=boolean (on/off), brightness=0-1 (intensity)
        if (partType === 'led' || partType === 'wokwi-led') {
            const anodeState = simulationPinStates?.['A'];
            const ledEl = element as HTMLElement & {
                value?: boolean;
                brightness?: number;
                requestUpdate?: () => void
            };

            // Apply gamma correction for realistic LED brightness
            // Wokwi uses gamma=2.8 by default
            const GAMMA = 2.8;

            console.log('[LED] Processing LED update:', {
                nodeId,
                pwmValue,
                anodeState,
                currentValue: ledEl.value,
                currentBrightness: ledEl.brightness
            });

            // Check for PWM value first (from componentPwmStates), then fall back to pin state
            if (typeof pwmValue === 'number' && pwmValue > 0) {
                // PWM mode from componentPwmStates
                const normalized = pwmValue / 255;
                const gammaCorrected = Math.pow(normalized, 1 / GAMMA);
                console.log('[LED] Setting PWM brightness:', pwmValue, '-> normalized:', normalized.toFixed(3), '-> gamma:', gammaCorrected.toFixed(3));
                ledEl.value = true;
                ledEl.brightness = gammaCorrected; // Use native Wokwi brightness property
            } else if (typeof anodeState === 'number') {
                // PWM mode: anodeState is 0-255
                const normalized = anodeState / 255;
                const gammaCorrected = Math.pow(normalized, 1 / GAMMA);
                console.log('[LED] PWM brightness from pin:', anodeState, '-> gamma:', gammaCorrected.toFixed(2));
                ledEl.value = anodeState > 0;
                ledEl.brightness = gammaCorrected; // Use native Wokwi brightness property
            } else {
                // Boolean mode: simple on/off
                const anodeHigh = anodeState === true;
                console.log('[LED] Setting value:', anodeHigh, 'current:', ledEl.value);
                ledEl.value = anodeHigh;
                ledEl.brightness = anodeHigh ? 1.0 : 0; // Full brightness when on
            }

            // Force Lit element to re-render
            if (typeof ledEl.requestUpdate === 'function') {
                ledEl.requestUpdate();
            }
        }

        // For RGB LED elements
        if (partType === 'rgb-led' || partType === 'wokwi-rgb-led') {
            // RGB LED has pins: R.A, R.C, G.A, G.C, B.A, B.C (common anode/cathode)
            // For common cathode: individual anodes HIGH = that color on
            // Supports both boolean and PWM values
            const element_rgb = element as HTMLElement & {
                redValue?: boolean;
                greenValue?: boolean;
                blueValue?: boolean;
                requestUpdate?: () => void;
            };

            // Handle each color channel
            for (const [pin, prop] of [['R.A', 'redValue'], ['G.A', 'greenValue'], ['B.A', 'blueValue']] as const) {
                const state = simulationPinStates?.[pin];
                if (state !== undefined) {
                    if (typeof state === 'number') {
                        // PWM mode
                        const normalized = state / 255;
                        (element_rgb as unknown as Record<string, boolean>)[prop] = normalized > 0.5;
                    } else {
                        // Boolean mode
                        (element_rgb as unknown as Record<string, boolean>)[prop] = state;
                    }
                }
            }

            if (typeof element_rgb.requestUpdate === 'function') {
                element_rgb.requestUpdate();
            }
        }

        // For 7-segment display elements
        if (partType === '7segment' || partType === 'wokwi-7segment') {
            const segmentEl = element as HTMLElement & {
                a?: boolean;
                b?: boolean;
                c?: boolean;
                d?: boolean;
                e?: boolean;
                f?: boolean;
                g?: boolean;
                dp?: boolean;
                requestUpdate?: () => void;
            };

            // Map pin states to segments (a-g and dp)
            const segmentPins = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'];
            for (const seg of segmentPins) {
                const pinState = simulationPinStates?.[seg.toUpperCase()] ?? simulationPinStates?.[seg];
                if (pinState !== undefined) {
                    (segmentEl as unknown as Record<string, boolean>)[seg] =
                        typeof pinState === 'boolean' ? pinState : pinState > 0;
                }
            }

            if (typeof segmentEl.requestUpdate === 'function') {
                segmentEl.requestUpdate();
            }
        }

        // For servo elements - update angle from simulation or attrs
        if (partType === 'servo' || partType === 'wokwi-servo') {
            const servoEl = element as HTMLElement & {
                angle?: number;
                requestUpdate?: () => void
            };

            // First check if angle is set via ServoDevice simulation (stored in attrs)
            const attrs = (data?.attrs ?? {}) as Record<string, unknown>;
            const angleFromAttrs = attrs.angle;
            if (typeof angleFromAttrs === 'number') {
                servoEl.angle = angleFromAttrs;
            } else {
                // Fallback: convert PWM value to angle (0-180°)
                const pwmValue = simulationPinStates?.['PWM'];
                if (typeof pwmValue === 'number') {
                    // PWM value (0-255) maps to servo angle (0-180°)
                    const angle = (pwmValue / 255) * 180;
                    console.log('[Servo] PWM value:', pwmValue, '-> angle:', angle.toFixed(1));
                    servoEl.angle = angle;
                } else if (pwmValue === true) {
                    // Digital HIGH might mean 90° (center position)
                    servoEl.angle = 90;
                }
            }

            if (typeof servoEl.requestUpdate === 'function') {
                servoEl.requestUpdate();
            }
        }

        // For buzzer elements - both visual and audio feedback
        if (partType === 'buzzer' || partType === 'wokwi-buzzer') {
            const signalState = simulationPinStates?.['1'];
            const buzzerEl = element as HTMLElement & { hasSignal?: boolean; requestUpdate?: () => void };
            const audioSimulation = getAudioSimulation();
            const buzzerId = `buzzer-${nodeId}`;

            if (typeof signalState === 'boolean') {
                buzzerEl.hasSignal = signalState;

                // Play/stop audio based on boolean state
                if (signalState) {
                    audioSimulation.initialize();
                    audioSimulation.resume().then(() => {
                        audioSimulation.playTone(buzzerId, 1000, 'square'); // 1kHz square wave
                    });
                } else {
                    audioSimulation.stopTone(buzzerId);
                }
            } else if (typeof signalState === 'number') {
                // PWM on buzzer - indicates tone is playing with variable frequency
                const isActive = signalState > 0;
                buzzerEl.hasSignal = isActive;

                if (isActive) {
                    audioSimulation.initialize();
                    audioSimulation.resume().then(() => {
                        // Map PWM value to frequency (100Hz - 4000Hz range)
                        const frequency = pwmToFrequency(signalState, 100, 4000);
                        audioSimulation.playTone(buzzerId, frequency, 'square');
                    });
                } else {
                    audioSimulation.stopTone(buzzerId);
                }
            } else {
                // No signal - stop audio
                audioSimulation.stopTone(buzzerId);
            }

            if (typeof buzzerEl.requestUpdate === 'function') {
                buzzerEl.requestUpdate();
            }
        }

        // NeoPixel / WS2812 visual updates (driven by decoded frames stored in attrs)
        {
            const typeLower = partType.toLowerCase();
            const attrs = (data?.attrs ?? {}) as Record<string, unknown>;

            // Single NeoPixel element supports r/g/b properties
            if (typeLower.includes('neopixel') && !typeLower.includes('matrix') && !typeLower.includes('ring') && !typeLower.includes('led-ring')) {
                const r = attrs.r;
                const g = attrs.g;
                const b = attrs.b;
                if (typeof r === 'number' && typeof g === 'number' && typeof b === 'number') {
                    const neoEl = element as unknown as { r?: number; g?: number; b?: number; requestUpdate?: () => void };
                    neoEl.r = r;
                    neoEl.g = g;
                    neoEl.b = b;
                    if (typeof neoEl.requestUpdate === 'function') neoEl.requestUpdate();
                }
            }

            const pixelColors = attrs.pixelColors;
            if (Array.isArray(pixelColors) && pixelColors.length) {
                // NeoPixel matrix
                if (typeLower.includes('matrix')) {
                    const rows = typeof attrs.rows === 'number' ? attrs.rows : Number.parseInt(String(attrs.rows ?? ''), 10);
                    const cols = typeof attrs.cols === 'number' ? attrs.cols : Number.parseInt(String(attrs.cols ?? ''), 10);
                    if (Number.isFinite(rows) && Number.isFinite(cols) && rows > 0 && cols > 0) {
                        const matrixEl = element as unknown as { setPixel?: (row: number, col: number, rgb: { r: number; g: number; b: number }) => unknown; reset?: () => void; requestUpdate?: () => void };
                        if (typeof matrixEl.reset === 'function') matrixEl.reset();
                        if (typeof matrixEl.setPixel === 'function') {
                            for (let i = 0; i < pixelColors.length; i++) {
                                const v = Number(pixelColors[i]) >>> 0;
                                const r = (v >> 16) & 0xff;
                                const g = (v >> 8) & 0xff;
                                const b = v & 0xff;
                                const row = Math.floor(i / cols);
                                const col = i % cols;
                                if (row >= rows) break;
                                matrixEl.setPixel(row, col, { r, g, b });
                            }
                        }
                        if (typeof matrixEl.requestUpdate === 'function') matrixEl.requestUpdate();
                    }
                }

                // LED ring (wokwi-led-ring)
                if (typeLower.includes('ring') || typeLower.includes('led-ring')) {
                    const ringEl = element as unknown as { setPixel?: (pixel: number, rgb: { r: number; g: number; b: number }) => void; reset?: () => void; requestUpdate?: () => void };
                    if (typeof ringEl.reset === 'function') ringEl.reset();
                    if (typeof ringEl.setPixel === 'function') {
                        for (let i = 0; i < pixelColors.length; i++) {
                            const v = Number(pixelColors[i]) >>> 0;
                            const r = (v >> 16) & 0xff;
                            const g = (v >> 8) & 0xff;
                            const b = v & 0xff;
                            ringEl.setPixel(i, { r, g, b });
                        }
                    }
                    if (typeof ringEl.requestUpdate === 'function') ringEl.requestUpdate();
                }
            }
        }

    }, [simulationPinStates, pwmValue, partType, nodeId, data?.attrs]);

    // Bind simulated LCD devices to their Wokwi visual elements (text/cursor/backlight).
    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        // Match both 'lcd1602' and 'wokwi-lcd1602' variants
        const partTypeLower = partType.toLowerCase();
        if (!partTypeLower.includes('lcd1602') && !partTypeLower.includes('lcd2004')) return;

        const attrs = data?.attrs ?? {};
        const attrsRecord = attrs as Record<string, unknown>;
        const addr = parseI2CAddress(attrsRecord.i2cAddress ?? attrsRecord.address, 0x27);
        const lcdDevice = getLCD1602(addr);

        const lcdEl = element as unknown as {
            text?: string;
            cursor?: boolean;
            blink?: boolean;
            cursorX?: number;
            cursorY?: number;
            backlight?: boolean;
            requestUpdate?: () => void;
        };

        const unsubscribe = lcdDevice.subscribe((state) => {
            try {
                // Wokwi lcd1602 element supports a simple text setter.
                const text = state.display.map((row) => row.join('')).join('\n');
                lcdEl.text = text;
                lcdEl.backlight = state.backlightOn;
                lcdEl.cursor = state.cursorOn;
                lcdEl.blink = state.blinkOn;
                lcdEl.cursorX = state.cursorCol;
                lcdEl.cursorY = state.cursorRow;
                if (typeof lcdEl.requestUpdate === 'function') {
                    lcdEl.requestUpdate();
                }
            } catch {
                // Ignore UI binding errors
            }
        });

        return () => {
            unsubscribe?.();
        };
    }, [data?.attrs, partType, elementReadyTick]);

    // Bind simulated SSD1306 OLED displays to their Wokwi visual elements
    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        // Match SSD1306 / OLED variants
        const partTypeLower = partType.toLowerCase();
        if (!partTypeLower.includes('ssd1306') && !partTypeLower.includes('oled')) return;

        const attrs = data?.attrs ?? {};
        const attrsRecord = attrs as Record<string, unknown>;
        const addr = parseI2CAddress(attrsRecord.i2cAddress ?? attrsRecord.address, 0x3c);
        const oledDevice = getSSD1306(addr);

        // SSD1306 Wokwi element expects pixel data
        const unsubscribe = oledDevice.subscribe((state) => {
            try {
                // The Wokwi ssd1306 element uses a Uint8Array buffer for pixels
                // Format: each byte represents 8 vertical pixels in a column (page-based)
                const oledEl = element as unknown as {
                    imageData?: Uint8Array | number[];
                    width?: number;
                    height?: number;
                    requestUpdate?: () => void;
                };

                // Convert boolean pixel array to page-based format
                const pages = Math.ceil(state.height / 8);
                const buffer = new Uint8Array(state.width * pages);

                for (let page = 0; page < pages; page++) {
                    for (let x = 0; x < state.width; x++) {
                        let byte = 0;
                        for (let bit = 0; bit < 8; bit++) {
                            const y = page * 8 + bit;
                            if (y < state.height && state.pixels[y]?.[x]) {
                                byte |= (1 << bit);
                            }
                        }
                        buffer[page * state.width + x] = byte;
                    }
                }

                oledEl.imageData = buffer;
                if (typeof oledEl.requestUpdate === 'function') {
                    oledEl.requestUpdate();
                }
            } catch {
                // Ignore UI binding errors
            }
        });

        return () => {
            unsubscribe?.();
        };
    }, [data?.attrs, partType, elementReadyTick]);

    // Bind simulated ILI9341 framebuffer to the Wokwi canvas
    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const typeLower = partType.toLowerCase();
        if (!typeLower.includes('ili9341')) return;

        let canvas: HTMLCanvasElement | null = null;

        const resolveCanvas = () => {
            const anyEl = element as unknown as { canvas?: HTMLCanvasElement | null; shadowRoot?: ShadowRoot | null };
            canvas = anyEl.canvas ?? anyEl.shadowRoot?.querySelector('canvas') ?? null;
        };

        const onReady = () => {
            resolveCanvas();
        };

        element.addEventListener('canvas-ready', onReady);
        resolveCanvas();

        const dev = getILI9341(nodeId);
        if (!dev) {
            return () => {
                element.removeEventListener('canvas-ready', onReady);
            };
        }

        const unsubscribe = dev.subscribe((frame) => {
            try {
                if (!canvas) resolveCanvas();
                if (!canvas) return;

                if (canvas.width !== frame.width) canvas.width = frame.width;
                if (canvas.height !== frame.height) canvas.height = frame.height;

                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                const img = ctx.createImageData(frame.width, frame.height);
                const out = img.data;
                const pix = frame.pixels;
                for (let i = 0; i < pix.length; i++) {
                    const v = pix[i];
                    const r5 = (v >> 11) & 0x1f;
                    const g6 = (v >> 5) & 0x3f;
                    const b5 = v & 0x1f;
                    const r = (r5 * 255) / 31;
                    const g = (g6 * 255) / 63;
                    const b = (b5 * 255) / 31;
                    const o = i * 4;
                    out[o] = r;
                    out[o + 1] = g;
                    out[o + 2] = b;
                    out[o + 3] = 255;
                }
                ctx.putImageData(img, 0, 0);
            } catch {
                // Ignore UI binding errors
            }
        });

        return () => {
            element.removeEventListener('canvas-ready', onReady);
            unsubscribe?.();
        };
    }, [partType, elementReadyTick, nodeId]);

    // Listen for button press/release events
    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const onButtonPress = data?.onButtonPress;
        const onButtonRelease = data?.onButtonRelease;

        if (!onButtonPress || !onButtonRelease) return;

        const typeLower = partType.toLowerCase();
        const isKeypad = typeLower.includes('keypad') || typeLower.includes('membrane');

        // Only attach listeners if this is a pressable component (and not the keypad which handles keys separately)
        const isPressable =
            !isKeypad &&
            (typeLower.includes('pushbutton') ||
                typeLower.includes('button') ||
                typeLower.includes('ky-040') ||
                typeLower.includes('rotary-encoder') ||
                typeLower.includes('encoder') ||
                typeLower.includes('analog-joystick') ||
                typeLower.includes('joystick'));

        if (isPressable) {
            const handlePress = () => {
                console.log('[WokwiPartNode] Button press detected:', nodeId);
                onButtonPress(nodeId);
            };

            const handleRelease = () => {
                console.log('[WokwiPartNode] Button release detected:', nodeId);
                onButtonRelease(nodeId);
            };

            element.addEventListener('button-press', handlePress);
            element.addEventListener('button-release', handleRelease);

            return () => {
                element.removeEventListener('button-press', handlePress);
                element.removeEventListener('button-release', handleRelease);
            };
        }
    }, [data, nodeId, partType, elementReadyTick]);

    // Handle slide switch changes via native Wokwi element events
    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const onSwitchToggle = data?.onSwitchToggle;
        if (!onSwitchToggle) return;

        const typeLower = partType.toLowerCase();
        const isSlideSwitch = typeLower.includes('slide-switch');
        if (!isSlideSwitch) return;

        const handleInput = () => {
            const switchEl = element as unknown as { value?: number };
            const newState = (switchEl.value ?? 0) === 1;
            console.log('[WokwiPartNode] Slide switch input:', nodeId, '->', newState);
            onSwitchToggle(nodeId, newState);
        };

        element.addEventListener('input', handleInput, { capture: true });
        const shadowRoot = element.shadowRoot;
        if (shadowRoot) shadowRoot.addEventListener('input', handleInput, { capture: true });

        return () => {
            element.removeEventListener('input', handleInput, { capture: true });
            if (shadowRoot) shadowRoot.removeEventListener('input', handleInput, { capture: true });
        };
    }, [data?.onSwitchToggle, nodeId, partType, elementReadyTick]);

    // Handle DIP switch (8) changes via native Wokwi element events
    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const onDipSwitchChange = data?.onDipSwitchChange;
        if (!onDipSwitchChange) return;

        const typeLower = partType.toLowerCase();
        const isDipSwitch = typeLower.includes('dip-switch');
        if (!isDipSwitch) return;

        const handleSwitchChange = () => {
            const dipEl = element as unknown as { values?: number[] };
            const values = Array.isArray(dipEl.values) ? dipEl.values.slice(0, 8) : [0, 0, 0, 0, 0, 0, 0, 0];
            console.log('[WokwiPartNode] DIP switch change:', nodeId, values);
            onDipSwitchChange(nodeId, values);
        };

        element.addEventListener('switch-change', handleSwitchChange, { capture: true });
        return () => {
            element.removeEventListener('switch-change', handleSwitchChange, { capture: true });
        };
    }, [data?.onDipSwitchChange, nodeId, partType, elementReadyTick]);

    // Handle rotary encoder rotation via native Wokwi element events
    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const onEncoderRotate = data?.onEncoderRotate;
        if (!onEncoderRotate) return;

        const typeLower = partType.toLowerCase();
        const isEncoder = typeLower.includes('ky-040') || typeLower.includes('rotary-encoder') || typeLower.includes('encoder');
        if (!isEncoder) return;

        const handleCw = () => onEncoderRotate(nodeId, 'cw');
        const handleCcw = () => onEncoderRotate(nodeId, 'ccw');

        element.addEventListener('rotate-cw', handleCw);
        element.addEventListener('rotate-ccw', handleCcw);

        return () => {
            element.removeEventListener('rotate-cw', handleCw);
            element.removeEventListener('rotate-ccw', handleCcw);
        };
    }, [data?.onEncoderRotate, nodeId, partType, elementReadyTick]);

    // Handle analog joystick movement via native Wokwi element events
    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const onJoystickMove = data?.onJoystickMove;
        if (!onJoystickMove) return;

        const typeLower = partType.toLowerCase();
        const isJoystick = typeLower.includes('analog-joystick') || typeLower.includes('joystick');
        if (!isJoystick) return;

        const handleInput = () => {
            const joyEl = element as unknown as { xValue?: number; yValue?: number };
            const x = typeof joyEl.xValue === 'number' ? joyEl.xValue : 0;
            const y = typeof joyEl.yValue === 'number' ? joyEl.yValue : 0;
            // Wokwi joystick uses -1..1 range; map to 0..1023 with center ~512
            const horz = Math.max(0, Math.min(1023, Math.round(((x + 1) / 2) * 1023)));
            const vert = Math.max(0, Math.min(1023, Math.round(((y + 1) / 2) * 1023)));
            onJoystickMove(nodeId, horz, vert);
        };

        element.addEventListener('input', handleInput, { capture: true });
        return () => {
            element.removeEventListener('input', handleInput, { capture: true });
        };
    }, [data?.onJoystickMove, nodeId, partType, elementReadyTick]);

    // Listen for keypad button press/release events
    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const isKeypad = partType.toLowerCase().includes('keypad') || partType.toLowerCase().includes('membrane');
        if (!isKeypad) return;

        const handleKeypadPress = (e: Event) => {
            const detail = (e as CustomEvent).detail as { key: string; row: number; column: number };
            console.log('[WokwiPartNode] Keypad press:', nodeId, detail);
            
            // Update the pressedKeys array in the component attrs
            const state = useAppStore.getState();
            const parts = state.circuitParts || [];
            const partIndex = parts.findIndex((p: CircuitPart) => p.id === nodeId);
            if (partIndex !== -1) {
                const part = parts[partIndex];
                const currentKeys = ((part.attrs as Record<string, unknown>)?.pressedKeys as string[]) || [];
                if (!currentKeys.includes(detail.key)) {
                    const newKeys = [...currentKeys, detail.key];
                    state.updatePartAttrs(nodeId, { ...part.attrs, pressedKeys: newKeys });
                }
            }
        };

        const handleKeypadRelease = (e: Event) => {
            const detail = (e as CustomEvent).detail as { key: string; row: number; column: number };
            console.log('[WokwiPartNode] Keypad release:', nodeId, detail);
            
            // Remove the key from pressedKeys array
            const state = useAppStore.getState();
            const parts = state.circuitParts || [];
            const partIndex = parts.findIndex((p: CircuitPart) => p.id === nodeId);
            if (partIndex !== -1) {
                const part = parts[partIndex];
                const currentKeys = ((part.attrs as Record<string, unknown>)?.pressedKeys as string[]) || [];
                const newKeys = currentKeys.filter((k: string) => k !== detail.key);
                state.updatePartAttrs(nodeId, { ...part.attrs, pressedKeys: newKeys });
            }
        };

        element.addEventListener('button-press', handleKeypadPress);
        element.addEventListener('button-release', handleKeypadRelease);

        return () => {
            element.removeEventListener('button-press', handleKeypadPress);
            element.removeEventListener('button-release', handleKeypadRelease);
        };
    }, [nodeId, partType, elementReadyTick]);

    // Handle potentiometer/slider value changes via native Wokwi element events
    useEffect(() => {
        const element = elementRef.current;
        if (!element) {
            console.log('[WokwiPartNode] No element ref for potentiometer check:', nodeId);
            return;
        }

        const onValueChange = data?.onValueChange;
        if (!onValueChange) {
            console.log('[WokwiPartNode] No onValueChange handler for:', nodeId, partType);
            return;
        }

        const isPotentiometer = partType.toLowerCase().includes('potentiometer') ||
            partType.toLowerCase().includes('slide-potentiometer');

        if (!isPotentiometer) {
            return;
        }

        console.log('[WokwiPartNode] Setting up potentiometer listener for:', nodeId, 'element:', element.tagName);

        // Listen for the native 'input' event from Wokwi potentiometer element
        // Wokwi potentiometer default: min=0, max=1023, value=0
        // The element dispatches InputEvent with detail containing the value
        const handleInput = () => {
            const potElement = element as HTMLElement & { value?: number; min?: number; max?: number };
            // Wokwi potentiometer defaults: min=0, max=1023
            const min = potElement.min ?? 0;
            const max = potElement.max ?? 1023;
            const rawValue = potElement.value ?? 0;

            // Clamp value to valid range
            const clampedValue = Math.max(min, Math.min(max, rawValue));

            // If the range is already 0-1023 (default), use directly
            // Otherwise normalize to 0-1023 for Arduino ADC
            let adcValue: number;
            if (min === 0 && max === 1023) {
                adcValue = Math.round(clampedValue);
            } else {
                // Normalize to 0-1, then scale to 0-1023
                const normalized = (clampedValue - min) / (max - min);
                adcValue = Math.round(normalized * 1023);
            }

            console.log('[WokwiPartNode] Potentiometer input:', { nodeId, rawValue, min, max, adcValue });
            onValueChange(nodeId, adcValue);
        };

        // Use capture phase to ensure we get the event even if it doesn't bubble
        element.addEventListener('input', handleInput, { capture: true });

        // Also try listening on the shadow root if present
        const shadowRoot = element.shadowRoot;
        if (shadowRoot) {
            console.log('[WokwiPartNode] Also adding listener to shadow root');
            shadowRoot.addEventListener('input', handleInput, { capture: true });
        }

        return () => {
            element.removeEventListener('input', handleInput, { capture: true });
            if (shadowRoot) {
                shadowRoot.removeEventListener('input', handleInput, { capture: true });
            }
        };
    }, [data?.onValueChange, nodeId, partType, elementReadyTick]);

    // NOTE: slide-switch interaction is handled via native `input` event above.

    if (isUnknownPart) {
        console.warn(`[WokwiPartNode] Unknown part type: ${partType}`);
        return (
            <div className="relative glass-panel border-alchemist rounded-md p-4 text-amber-500 text-sm">
                Unknown component: {partType}
            </div>
        );
    }

    // Determine if this is an interactive component that needs higher z-index
    const isInteractiveComponent =
        partType.toLowerCase().includes('pushbutton') ||
        partType.toLowerCase().includes('button') ||
        partType.toLowerCase().includes('potentiometer') ||
        partType.toLowerCase().includes('switch') ||
        partType.toLowerCase().includes('keypad') ||
        partType.toLowerCase().includes('encoder');

    return (
        <div
            ref={containerRef}
            className={`relative rounded-md transition-all duration-200 ${isSelected
                ? 'ring-2 ring-cyan-500/70 ring-offset-2 ring-offset-transparent shadow-lg shadow-cyan-500/20'
                : 'glass-panel border-alchemist hover:ring-1 hover:ring-amber-500/30'
                }`}
            style={{
                display: 'inline-block',
                lineHeight: 0,
                // Interactive components get higher z-index to be above wires
                zIndex: isInteractiveComponent ? 10 : undefined,
                position: 'relative',
            }}
            onClick={handleClick}
        >
            {/* Delete button - appears when selected */}
            {isSelected && nodeId !== 'preview' && onDeletePart && (
                <button
                    onClick={handleDelete}
                    className="absolute -top-3 -right-3 z-50 p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-150 hover:scale-110"
                    title="Delete component"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            )}

            {/* HC-SR04 distance control (minimal) */}
            {isSelected && isHcsr04 && nodeId !== 'preview' && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        openSensorPopup();
                    }}
                    className="absolute -top-3 left-0 z-50 px-2 py-1 bg-ide-panel-hover text-ide-text text-[10px] rounded shadow-lg border border-ide-border hover:bg-ide-panel-surface transition-colors"
                    title="Adjust distance"
                >
                    Distance
                </button>
            )}

            {/* Selection indicator label */}
            {isSelected && (
                <div className="absolute -top-6 left-0 right-0 flex justify-center pointer-events-none z-40">
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-cyan-500/90 text-white rounded shadow-sm">
                        {partConfig?.name || partType}
                    </span>
                </div>
            )}

            <SensorValuePopup
                partId={nodeId}
                partType={partType}
                isOpen={sensorPopupOpen}
                onClose={() => setSensorPopupOpen(false)}
                values={sensorValues}
                onValueChange={handleSensorValueChange}
                position={sensorPopupPos}
            />

            {/* Render the Wokwi custom element */}
            {PartElement ? (
                <PartElement
                    style={{
                        display: 'block',
                        // Interactive components need pointer-events to receive input
                        pointerEvents: isInteractiveComponent ? 'auto' : undefined,
                    }}
                />
            ) : null}

            {/* Pin hitboxes (Wokwi-style): big invisible clickable targets */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 20,
                }}
            >
                {pins.map((pin) => {
                    const leftPct = svgDimensions.width
                        ? (pin.x / svgDimensions.width) * 100
                        : 0;
                    const topPct = svgDimensions.height
                        ? (pin.y / svgDimensions.height) * 100
                        : 0;

                    return (
                        <div
                            key={pin.id}
                            className="nodrag"
                            data-fundi-pin="true"
                            data-node-id={nodeId}
                            data-pin-id={pin.id}
                            style={{
                                position: 'absolute',
                                left: `${leftPct}%`,
                                top: `${topPct}%`,
                                width: 14,
                                height: 14,
                                transform: 'translate(-50%, -50%)',
                                borderRadius: 9999,
                                pointerEvents: 'auto',
                                cursor: 'pointer',
                                background: 'transparent',
                                touchAction: 'none',
                                zIndex: 30,
                            }}
                            onPointerDown={(e) => {
                                // Prevent ReactFlow node dragging from stealing the interaction
                                e.stopPropagation();
                            }}
                            onMouseEnter={() => setHoveredPin(pin.id)}
                            onMouseLeave={() => setHoveredPin(null)}
                            onClick={(e) => handlePinClick(e, pin)}
                            aria-label={`Pin ${pin.id}`}
                        />
                    );
                })}
            </div>

            {/* SVG Overlay - viewBox matches the pinInfo coordinate space */}
            <svg
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    overflow: 'visible',
                    zIndex: 10,
                }}
                viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
            >
                {pins.map((pin) => {
                    const isHovered = hoveredPin === pin.id;

                    return (
                        <g key={pin.id}>
                            {/* Visual pin indicator - Copper Pad style */}
                            <circle
                                cx={pin.x}
                                cy={pin.y}
                                r={isHovered ? 3.5 : 2.5}
                                fill={isHovered ? '#D4AF37' : '#B87333'}
                                stroke={isHovered ? '#00F0FF' : '#8B4513'}
                                strokeWidth={isHovered ? 1 : 0.75}
                                style={{
                                    transition: 'all 0.1s ease',
                                    pointerEvents: 'none',
                                    filter: isHovered ? 'drop-shadow(0 0 3px #00F0FF)' : 'none'
                                }}
                            />
                            {isHovered && (
                                <g>
                                    <rect
                                        x={pin.x - 15}
                                        y={pin.row === 'top' || pin.row === 'left' ? pin.y + 6 : pin.y - 18}
                                        width={30}
                                        height={12}
                                        rx={2}
                                        fill="rgba(21, 27, 43, 0.95)"
                                        stroke="rgba(212, 175, 55, 0.5)"
                                        strokeWidth={0.5}
                                    />
                                    <text
                                        x={pin.x}
                                        y={pin.row === 'top' || pin.row === 'left' ? pin.y + 15 : pin.y - 9}
                                        textAnchor="middle"
                                        fill="#D4AF37"
                                        fontSize={6}
                                        fontFamily="monospace"
                                        fontWeight="bold"
                                    >
                                        {pin.id}
                                    </text>
                                </g>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

// Custom memo comparison to ensure simulationPinStates and pwmValue changes trigger re-renders
export default memo(WokwiPartNode, (prevProps, nextProps) => {
    const prevStates = prevProps.data?.simulationPinStates;
    const nextStates = nextProps.data?.simulationPinStates;
    const prevPwm = prevProps.data?.pwmValue;
    const nextPwm = nextProps.data?.pwmValue;

    // Always re-render if simulationPinStates changed
    if (JSON.stringify(prevStates) !== JSON.stringify(nextStates)) {
        return false; // Should re-render
    }

    // Always re-render if pwmValue changed
    if (prevPwm !== nextPwm) {
        return false; // Should re-render
    }

    // Default comparison for other props
    const prevPartType = prevProps.partType ?? (prevProps.data as Record<string, unknown> | undefined)?.partType;
    const nextPartType = nextProps.partType ?? (nextProps.data as Record<string, unknown> | undefined)?.partType;

    return prevProps.id === nextProps.id && prevPartType === nextPartType;
});
