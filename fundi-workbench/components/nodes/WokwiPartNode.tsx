'use client';

import '@wokwi/elements';
import { memo, useEffect, useRef, useState, useCallback } from 'react';
import { WOKWI_PARTS, WokwiPartType } from '@/lib/wokwiParts';
import type { WirePoint } from '@/types/wire';

interface PinData {
    id: string;
    x: number;
    y: number;
    row: 'top' | 'bottom' | 'left' | 'right';
}

interface WokwiPartNodeData {
    onPinClick?: (nodeId: string, pinId: string, position: WirePoint) => void;
    getCanvasRect?: () => DOMRect | null;
}

interface WokwiPartNodeProps {
    id?: string;
    data?: WokwiPartNodeData;
    partType?: WokwiPartType; // Can be passed directly or via data
}

/**
 * Generic Wokwi Part Node - renders any Wokwi element with pin overlays
 */
function WokwiPartNode({ id: nodeId = 'preview', data, partType: propPartType }: WokwiPartNodeProps) {
    const onPinClick = data?.onPinClick;
    const getCanvasRect = data?.getCanvasRect;
    const partType = propPartType || (data as any)?.partType || 'arduino-uno';

    const [hoveredPin, setHoveredPin] = useState<string | null>(null);
    const [pins, setPins] = useState<PinData[]>([]);
    const [svgDimensions, setSvgDimensions] = useState({ width: 100, height: 100 });
    const containerRef = useRef<HTMLDivElement>(null);
    const elementRef = useRef<HTMLElement | null>(null);

    const partConfig = WOKWI_PARTS[partType];

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

    return (
        <div
            ref={containerRef}
            className="relative"
            style={{
                display: 'inline-block',
                lineHeight: 0,
            }}
        >
            {/* Dynamically render the Wokwi element */}
            {partType === 'arduino-uno' && <wokwi-arduino-uno style={{ display: 'block' }} />}
            {partType === 'esp32-devkit-v1' && <wokwi-esp32-devkit-v1 style={{ display: 'block' }} />}
            {partType === 'arduino-mega' && <wokwi-arduino-mega style={{ display: 'block' }} />}
            {partType === 'arduino-nano' && <wokwi-arduino-nano style={{ display: 'block' }} />}

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
                            {/* Visual pin indicator */}
                            <circle
                                cx={pin.x}
                                cy={pin.y}
                                r={isHovered ? 3 : 2}
                                fill={isHovered ? '#22c55e' : 'rgba(34, 197, 94, 0.5)'}
                                stroke={isHovered ? '#16a34a' : 'rgba(22, 163, 74, 0.7)'}
                                strokeWidth={0.5}
                                style={{ transition: 'all 0.1s ease', pointerEvents: 'none' }}
                            />
                            {isHovered && (
                                <g>
                                    <rect
                                        x={pin.x - 15}
                                        y={pin.row === 'top' || pin.row === 'left' ? pin.y + 6 : pin.y - 18}
                                        width={30}
                                        height={12}
                                        rx={2}
                                        fill="rgba(15, 23, 42, 0.95)"
                                        stroke="rgba(34, 197, 94, 0.5)"
                                        strokeWidth={0.5}
                                    />
                                    <text
                                        x={pin.x}
                                        y={pin.row === 'top' || pin.row === 'left' ? pin.y + 15 : pin.y - 9}
                                        textAnchor="middle"
                                        fill="#4ade80"
                                        fontSize={6}
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
        </div>
    );
}

export default memo(WokwiPartNode);
