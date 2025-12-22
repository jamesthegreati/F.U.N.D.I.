'use client';

import '@wokwi/elements';
import { memo, useEffect, useRef, useState, useCallback } from 'react';
import { WOKWI_PARTS, WokwiPartType } from '@/lib/wokwiParts';

interface PinData {
    id: string;
    x: number;
    y: number;
    row: 'top' | 'bottom' | 'left' | 'right';
}

interface WokwiPartNodeProps {
    partType: WokwiPartType;
}

/**
 * Generic Wokwi Part Node - renders any Wokwi element with pin overlays
 * 
 * Different Wokwi elements use different coordinate systems:
 * - Arduino (Uno, Mega, Nano): viewBox in mm, pinInfo in CSS pixels (96 DPI)
 * - ESP32: viewBox in pixels (not matching mm dimensions), pinInfo in same pixels
 * 
 * We detect the coordinate system by comparing viewBox dimensions to mm dimensions.
 * If they match, the viewBox is in mm and we need to convert to pixels.
 */
function WokwiPartNode({ partType }: WokwiPartNodeProps) {
    const [hoveredPin, setHoveredPin] = useState<string | null>(null);
    const [pins, setPins] = useState<PinData[]>([]);
    const [svgDimensions, setSvgDimensions] = useState({ width: 100, height: 100 });
    const containerRef = useRef<HTMLDivElement>(null);
    const elementRef = useRef<HTMLElement | null>(null);

    const partConfig = WOKWI_PARTS[partType];

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
        const viewBoxMatchesMM = widthMM !== null && heightMM !== null &&
            Math.abs(vbW - widthMM) < 1 && Math.abs(vbH - heightMM) < 1;

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
                                r={6}
                                fill="transparent"
                                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                                onMouseEnter={() => setHoveredPin(pin.id)}
                                onMouseLeave={() => setHoveredPin(null)}
                            />
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
