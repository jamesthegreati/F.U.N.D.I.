'use client';

import '@wokwi/elements';
import { memo, useEffect, useRef, useState } from 'react';
import { Handle, Position } from '@xyflow/react';

// Define the Pin interface locally or import it if you have it
interface ArduinoPinData {
    id: string;
    x: number;
    y: number;
    type: 'source' | 'target';
    row: 'top' | 'bottom';
}

function ArduinoNode() {
    const [hoveredPin, setHoveredPin] = useState<string | null>(null);
    const [pins, setPins] = useState<ArduinoPinData[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Standard CSS PPI conversion: 96 pixels per inch / 25.4 mm per inch
    const MM_TO_PX = 3.779527559;

    useEffect(() => {
        const initPins = () => {
            if (!containerRef.current) return;

            const wokwiElement = containerRef.current.querySelector(
                'wokwi-arduino-uno'
            ) as (HTMLElement & { pinInfo?: { name: string; x: number; y: number }[] }) | null;
            if (!wokwiElement) return;

            // 1. Get the pin data directly from the element
            // The element might not be upgraded yet, so we check for pinInfo
            if (!wokwiElement.pinInfo) {
                // Retry if custom element hasn't initialized
                setTimeout(initPins, 50);
                return;
            }

            const rawPins = wokwiElement.pinInfo as {
                name: string;
                x: number;
                y: number;
            }[];

            // 2. Get the SVG viewBox to understand the board's coordinate system
            // We look into the Shadow DOM to find the SVG
            const svg = wokwiElement.shadowRoot?.querySelector('svg');
            if (!svg) {
                setTimeout(initPins, 50);
                return;
            }

            const viewBoxAttr = svg.getAttribute('viewBox'); // e.g., "-4 0 72.58 53.34"
            if (!viewBoxAttr) return;

            const [vbMinX_mm, vbMinY_mm, vbWidth_mm, vbHeight_mm] = viewBoxAttr
                .split(' ')
                .map(Number);

            // 3. Convert SVG ViewBox (mm) to Pin Coordinate System (pixels)
            const vbMinX_px = vbMinX_mm * MM_TO_PX;
            const vbMinY_px = vbMinY_mm * MM_TO_PX;
            const vbWidth_px = vbWidth_mm * MM_TO_PX;
            const vbHeight_px = vbHeight_mm * MM_TO_PX;

            // 4. Map the pins to percentages relative to the rendered element
            const mappedPins: ArduinoPinData[] = rawPins.map((pin) => {
                // Calculate position relative to the bounding box (0-100%)
                const xPercent = ((pin.x - vbMinX_px) / vbWidth_px) * 100;
                const yPercent = ((pin.y - vbMinY_px) / vbHeight_px) * 100;

                // Determine if it's a top or bottom row pin based on Y position
                // Top row is usually around y=9px, Bottom row around y=191px
                const isTop = pin.y < 100;

                return {
                    id: pin.name,
                    x: xPercent, // Store as percentage
                    y: yPercent, // Store as percentage
                    type: 'source', // Default to source, or map based on name
                    row: isTop ? 'top' : 'bottom',
                };
            });

            setPins(mappedPins);
        };

        // Initialize after a short delay to ensure Web Component upgrade
        // You can also use customElements.whenDefined('wokwi-arduino-uno')
        if (typeof customElements !== 'undefined') {
            customElements.whenDefined('wokwi-arduino-uno').then(initPins);
        } else {
            initPins();
        }
    }, []);

    return (
        <div
            className="relative"
            ref={containerRef}
            style={{ display: 'inline-block' }}
        >
            {/* The component renders its own SVG. 
        We rely on the container to size it naturally or via CSS. 
      */}
            <wokwi-arduino-uno />

            {pins.map((pin) => {
                const isHovered = hoveredPin === pin.id;
                const isTopRow = pin.row === 'top';

                return (
                    <div
                        key={pin.id}
                        className="absolute"
                        style={{
                            // Use the calculated percentages directly
                            left: `${pin.x}%`,
                            top: `${pin.y}%`,
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'all', // Ensure the div captures events
                        }}
                        onMouseEnter={() => setHoveredPin(pin.id)}
                        onMouseLeave={() => setHoveredPin(null)}
                    >
                        <Handle
                            key={pin.id}
                            id={pin.id}
                            type={pin.type}
                            position={isTopRow ? Position.Top : Position.Bottom}
                            style={{
                                position: 'relative',
                                width: 8,
                                height: 8,
                                background: isHovered
                                    ? 'rgba(34, 197, 94, 0.95)'
                                    : 'rgba(34, 197, 94, 0.0)', // Transparent when not hovered?
                                border: isHovered
                                    ? '1.5px solid rgb(22, 163, 74)'
                                    : '1px solid rgba(22, 163, 74, 0.0)', // Invisible target by default
                                borderRadius: '50%',
                                cursor: 'crosshair',
                                transition: 'all 0.1s ease',
                                zIndex: isHovered ? 100 : 10,
                            }}
                        />
                        {/* Tooltip */}
                        {isHovered && (
                            <div
                                className="pointer-events-none absolute z-50 whitespace-nowrap rounded bg-slate-900/95 px-1.5 py-0.5 text-[10px] font-medium text-green-400 shadow-md ring-1 ring-green-500/40"
                                style={{
                                    left: '50%',
                                    top: isTopRow ? 'calc(100% + 4px)' : 'auto',
                                    bottom: isTopRow ? 'auto' : 'calc(100% + 4px)',
                                    transform: 'translateX(-50%)',
                                }}
                            >
                                {pin.id}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default memo(ArduinoNode);
