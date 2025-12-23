'use client';

import '@wokwi/elements';
import { memo, useEffect, useRef, useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { WirePoint } from '@/types/wire';

interface PinData {
    id: string;
    x: number;
    y: number;
    row: 'top' | 'bottom';
}

interface ArduinoNodeData {
    onPinClick?: (nodeId: string, pinId: string, position: WirePoint) => void;
    getCanvasRect?: () => DOMRect | null;
}

interface ArduinoNodeProps {
    id: string; // React Flow node ID
    data: ArduinoNodeData;
}

// Wokwi approach: pinInfo coords are at 96 DPI
// Reference dimensions: 72.58mm x 53.34mm = 274.32px x 201.56px at 96 DPI
const REFERENCE_WIDTH = 72.58 * (96 / 25.4);  // ~274.32 px
const REFERENCE_HEIGHT = 53.34 * (96 / 25.4); // ~201.56 px

function ArduinoNode({ id: nodeId, data }: ArduinoNodeProps) {
    const onPinClick = data?.onPinClick;
    const getCanvasRect = data?.getCanvasRect;
    const [hoveredPin, setHoveredPin] = useState<string | null>(null);
    const [pins, setPins] = useState<PinData[]>([]);
    const [svgDimensions, setSvgDimensions] = useState({ width: 274, height: 201 });
    const containerRef = useRef<HTMLDivElement>(null);
    const elementRef = useRef<HTMLElement | null>(null);



    const calculatePins = useCallback(() => {
        const element = elementRef.current as HTMLElement & {
            pinInfo?: { name: string; x: number; y: number }[]
        };

        if (!element || !element.shadowRoot || !element.pinInfo) return;

        const svg = element.shadowRoot.querySelector('svg');
        if (!svg) return;

        const viewBoxAttr = svg.getAttribute('viewBox');
        if (!viewBoxAttr) return;

        // ViewBox: "-4 0 72.58 53.34" (mm)
        const [, , vbW_mm, vbH_mm] = viewBoxAttr.split(/[\s,]+/).map(parseFloat);
        if (vbW_mm === 0 || vbH_mm === 0) return;

        // Convert mm to px (96 DPI)
        const MM_TO_PX = 96 / 25.4;
        const vbW_px = vbW_mm * MM_TO_PX;
        const vbH_px = vbH_mm * MM_TO_PX;

        setSvgDimensions({ width: vbW_px, height: vbH_px });

        // Use pinInfo coordinates DIRECTLY - they're likely already in the right space
        const mappedPins: PinData[] = element.pinInfo.map((pin) => {
            const isTop = pin.y < vbH_px / 2;
            return {
                id: pin.name,
                x: pin.x,  // Use directly
                y: pin.y,  // Use directly
                row: isTop ? 'top' : 'bottom',
            };
        });

        setPins(mappedPins);
    }, []);

    useEffect(() => {
        const initElement = async () => {
            await customElements.whenDefined('wokwi-arduino-uno');

            const element = containerRef.current?.querySelector('wokwi-arduino-uno');
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
    }, [calculatePins]);

    const handlePinClick = useCallback(
        (e: React.MouseEvent, pin: PinData) => {
            e.stopPropagation();
            if (!onPinClick || !elementRef.current) return;

            const element = elementRef.current;
            const elementRect = element.getBoundingClientRect();

            // Calculate scale: how much the element is scaled from reference
            // Reference: 72.58mm x 53.34mm = 274.32px x 201.56px at 96 DPI
            const REFERENCE_WIDTH = 72.58 * (96 / 25.4);
            const REFERENCE_HEIGHT = 53.34 * (96 / 25.4);
            const scaleX = elementRect.width / REFERENCE_WIDTH;
            const scaleY = elementRect.height / REFERENCE_HEIGHT;

            // Transform pin coordinates (96 DPI) to screen coordinates
            const screenX = elementRect.left + pin.x * scaleX;
            const screenY = elementRect.top + pin.y * scaleY;

            const canvasRect = getCanvasRect?.();
            const canvasRelative = canvasRect
                ? { x: screenX - canvasRect.left, y: screenY - canvasRect.top }
                : { x: screenX, y: screenY };

            onPinClick(nodeId, pin.id, canvasRelative);
        },
        [onPinClick, nodeId, getCanvasRect]
    );

    return (
        <div
            ref={containerRef}
            className="relative"
            style={{
                display: 'inline-block',
                lineHeight: 0,
            }}
        >
            {/* The Arduino Board */}
            <wokwi-arduino-uno style={{ display: 'block' }} />

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

            {/* SVG Overlay (visual only) */}
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
                            <circle
                                cx={pin.x}
                                cy={pin.y}
                                r={isHovered ? 3 : 2}
                                fill={isHovered ? '#22c55e' : 'rgba(34, 197, 94, 0.5)'}
                                stroke={isHovered ? '#16a34a' : 'rgba(22, 163, 74, 0.7)'}
                                strokeWidth={0.5}
                                style={{ transition: 'all 0.1s ease' }}
                            />
                            {isHovered && (
                                <g>
                                    <rect
                                        x={pin.x - 15}
                                        y={pin.row === 'top' ? pin.y + 5 : pin.y - 15}
                                        width={30}
                                        height={10}
                                        rx={2}
                                        fill="rgba(15, 23, 42, 0.95)"
                                        stroke="rgba(34, 197, 94, 0.5)"
                                        strokeWidth={0.5}
                                    />
                                    <text
                                        x={pin.x}
                                        y={pin.row === 'top' ? pin.y + 12.5 : pin.y - 7.5}
                                        textAnchor="middle"
                                        fill="#4ade80"
                                        fontSize={5}
                                        fontFamily="monospace"
                                    >
                                        {pin.id}
                                    </text>
                                </g>
                            )}
                        </g>
                    );
                })}
            </svg>

            {pins.map((pin) => (
                <Handle
                    key={pin.id}
                    id={pin.id}
                    type="source"
                    position={pin.row === 'top' ? Position.Top : Position.Bottom}
                    style={{ opacity: 0, pointerEvents: 'none' }}
                />
            ))}
        </div>
    );
}

export default memo(ArduinoNode);
