'use client';

import '@wokwi/elements';
import { memo, useEffect, useRef, useState, useCallback } from 'react';
import type { ElementType } from 'react';
import { Trash2 } from 'lucide-react';
import { WOKWI_PARTS, WokwiPartType } from '@/lib/wokwiParts';
import type { WirePoint } from '@/types/wire';
import { getAudioSimulation, pwmToFrequency } from '@/utils/simulation/audio';

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

    const partConfig = WOKWI_PARTS[partType];

    // Early return if partConfig is undefined (invalid part type)
    if (!partConfig) {
        console.warn(`[WokwiPartNode] Unknown part type: ${partType}`);
        return (
            <div className="relative glass-panel border-alchemist rounded-md p-4 text-amber-500 text-sm">
                Unknown component: {partType}
            </div>
        );
    }

    const PartElement = (partConfig.element ?? null) as ElementType | null;

    // Handle click to select/deselect component
    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            // Don't select if clicking on a pin
            const target = e.target as HTMLElement;
            if (target.hasAttribute('data-fundi-pin')) return;

            e.stopPropagation();
            if (nodeId === 'preview') return;

            setIsSelected(prev => !prev);
        },
        [nodeId]
    );

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
            await customElements.whenDefined(partConfig.element);

            const element = containerRef.current?.querySelector(partConfig.element);
            if (!element) return;

            elementRef.current = element as HTMLElement;

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
    }, [calculatePins, partConfig.element]);

    // Update element properties based on simulation pin states
    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        // Debug log when simulation states are received
        if (simulationPinStates && Object.keys(simulationPinStates).length > 0) {
            console.log('[WokwiPartNode] Applying simulation states:', { partType, simulationPinStates, pwmValue });
        }

        // For LED elements: if anode (A) is HIGH and cathode (C) is LOW or ground, turn ON
        // LED element has a 'value' property (boolean) to control on/off state
        // For PWM: use 'brightness' property (0-1) with gamma correction
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

            // Check for PWM value first (from componentPwmStates), then fall back to pin state
            if (typeof pwmValue === 'number' && pwmValue > 0) {
                // PWM mode from componentPwmStates
                const normalized = pwmValue / 255;
                const gammaCorrected = Math.pow(normalized, 1 / GAMMA);
                console.log('[LED] PWM brightness from pwmValue:', pwmValue, '-> gamma:', gammaCorrected.toFixed(2));
                ledEl.value = true;
                element.style.setProperty('--led-brightness', gammaCorrected.toString());
                element.style.opacity = (0.3 + gammaCorrected * 0.7).toString();
            } else if (typeof anodeState === 'number') {
                // PWM mode: anodeState is 0-255
                const normalized = anodeState / 255;
                const gammaCorrected = Math.pow(normalized, 1 / GAMMA);
                console.log('[LED] PWM brightness from pin:', anodeState, '-> gamma:', gammaCorrected.toFixed(2));
                ledEl.value = anodeState > 0;
                element.style.setProperty('--led-brightness', gammaCorrected.toString());
                element.style.opacity = (0.3 + gammaCorrected * 0.7).toString();
            } else {
                // Boolean mode: simple on/off
                const anodeHigh = anodeState === true;
                console.log('[LED] Setting value:', anodeHigh, 'current:', ledEl.value);
                ledEl.value = anodeHigh;
                element.style.removeProperty('--led-brightness');
                element.style.opacity = anodeHigh ? '1' : '0.3';
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
            const GAMMA = 2.8;
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

        // For servo elements - convert PWM value to angle (0-180°)
        if (partType === 'servo' || partType === 'wokwi-servo') {
            const pwmValue = simulationPinStates?.['PWM'];
            const servoEl = element as HTMLElement & {
                angle?: number;
                requestUpdate?: () => void
            };

            if (typeof pwmValue === 'number') {
                // PWM value (0-255) maps to servo angle (0-180°)
                // In real servos, pulse width 1000-2000µs = 0-180°
                // For simulation, we use direct mapping from PWM duty cycle
                const angle = (pwmValue / 255) * 180;
                console.log('[Servo] PWM value:', pwmValue, '-> angle:', angle.toFixed(1));
                servoEl.angle = angle;
            } else if (pwmValue === true) {
                // Digital HIGH might mean 90° (center position)
                servoEl.angle = 90;
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

    }, [simulationPinStates, pwmValue, partType, nodeId]);

    // Listen for button press/release events
    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const onButtonPress = data?.onButtonPress;
        const onButtonRelease = data?.onButtonRelease;

        if (!onButtonPress || !onButtonRelease) return;

        // Only attach listeners if this is a button component
        if (partType.toLowerCase().includes('pushbutton') || partType.toLowerCase().includes('button')) {
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
    }, [data, nodeId, partType]);

    // Handle potentiometer/slider drag interaction
    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const onValueChange = data?.onValueChange;
        if (!onValueChange) return;

        const isPotentiometer = partType.toLowerCase().includes('potentiometer') ||
            partType.toLowerCase().includes('slide-potentiometer');

        if (!isPotentiometer) return;

        let isDragging = false;
        let startY = 0;
        let startValue = data?.interactiveValue ?? 512;

        const handleMouseDown = (e: MouseEvent) => {
            isDragging = true;
            startY = e.clientY;
            startValue = data?.interactiveValue ?? 512;
            e.preventDefault();
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;

            // Calculate delta and new value
            const deltaY = startY - e.clientY; // Inverted so dragging up increases value
            const sensitivity = 5; // Pixels per value change
            const deltaValue = Math.round(deltaY * sensitivity);
            const newValue = Math.max(0, Math.min(1023, startValue + deltaValue));

            onValueChange(nodeId, newValue);
        };

        const handleMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        // For rotary potentiometer - also handle wheel events
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const currentValue = data?.interactiveValue ?? 512;
            const delta = e.deltaY > 0 ? -50 : 50;
            const newValue = Math.max(0, Math.min(1023, currentValue + delta));
            onValueChange(nodeId, newValue);
        };

        element.addEventListener('mousedown', handleMouseDown);
        element.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            element.removeEventListener('mousedown', handleMouseDown);
            element.removeEventListener('wheel', handleWheel);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [data, nodeId, partType]);

    // Handle slide switch click-to-toggle
    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const onSwitchToggle = data?.onSwitchToggle;
        if (!onSwitchToggle) return;

        const isSwitch = partType.toLowerCase().includes('slide-switch') ||
            partType.toLowerCase().includes('switch') &&
            !partType.toLowerCase().includes('push');

        if (!isSwitch) return;

        const handleClick = () => {
            const currentState = data?.switchState ?? false;
            const newState = !currentState;
            console.log('[WokwiPartNode] Switch toggle:', nodeId, '-> ', newState);
            onSwitchToggle(nodeId, newState);
        };

        element.addEventListener('click', handleClick);

        return () => {
            element.removeEventListener('click', handleClick);
        };
    }, [data, nodeId, partType]);

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

            {/* Selection indicator label */}
            {isSelected && (
                <div className="absolute -top-6 left-0 right-0 flex justify-center pointer-events-none z-40">
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-cyan-500/90 text-white rounded shadow-sm">
                        {partConfig?.name || partType}
                    </span>
                </div>
            )}

            {/* Render the Wokwi custom element */}
            {PartElement ? <PartElement style={{ display: 'block' }} /> : null}

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

// Custom memo comparison to ensure simulationPinStates changes trigger re-renders
export default memo(WokwiPartNode, (prevProps, nextProps) => {
    const prevStates = prevProps.data?.simulationPinStates;
    const nextStates = nextProps.data?.simulationPinStates;

    // Always re-render if simulationPinStates changed
    if (JSON.stringify(prevStates) !== JSON.stringify(nextStates)) {
        return false; // Should re-render
    }

    // Default comparison for other props
    const prevPartType = prevProps.partType ?? (prevProps.data as Record<string, unknown> | undefined)?.partType;
    const nextPartType = nextProps.partType ?? (nextProps.data as Record<string, unknown> | undefined)?.partType;

    return prevProps.id === nextProps.id && prevPartType === nextPartType;
});

