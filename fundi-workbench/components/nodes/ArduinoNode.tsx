'use client';

import '@wokwi/elements';
import { memo, useEffect, useRef, useState } from 'react';
import { Handle, Position } from '@xyflow/react';

interface PinData {
    id: string;
    x: number;
    y: number;
    row: 'top' | 'bottom';
}

interface WokwiPinInfo {
    name: string;
    x: number;
    y: number;
}

function ArduinoNode() {
    const [hoveredPin, setHoveredPin] = useState<string | null>(null);
    const [pins, setPins] = useState<PinData[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const elementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        // Standard CSS DPI: 1 inch = 96px = 25.4mm
        const MM_TO_PX = 96 / 25.4;

        const calculatePins = () => {
            const element = containerRef.current?.querySelector('wokwi-arduino-uno') as HTMLElement & { pinInfo?: WokwiPinInfo[] };
            if (!element || !element.shadowRoot) return;

            // Save ref for ResizeObserver
            elementRef.current = element;

            // 1. Get Pin Info (Coordinates are in CSS Pixels)
            const pinInfo = element.pinInfo;
            if (!pinInfo) return;

            // 2. Get SVG ViewBox (Coordinates are in Millimeters)
            const svg = element.shadowRoot.querySelector('svg');
            if (!svg) return;

            const viewBoxAttr = svg.getAttribute('viewBox');
            if (!viewBoxAttr) return;

            // Handle both space and comma separators (e.g., "-4 0 72 53" or "-4,0,72,53")
            const viewBox = viewBoxAttr.split(/[\s,]+/).map(parseFloat);
            if (viewBox.length !== 4) return;

            const [vbX_mm, vbY_mm, vbW_mm, vbH_mm] = viewBox;

            // 3. Convert ViewBox mm -> px
            const vbX_px = vbX_mm * MM_TO_PX;
            const vbY_px = vbY_mm * MM_TO_PX;
            const vbW_px = vbW_mm * MM_TO_PX;
            const vbH_px = vbH_mm * MM_TO_PX;

            // 4. Map to Percentages
            const mappedPins = pinInfo.map((pin: WokwiPinInfo) => {
                const isTop = pin.y < vbH_px / 2;

                return {
                    id: pin.name,
                    // Formula: (Pin_Px - ViewBox_Start_Px) / ViewBox_Width_Px
                    x: ((pin.x - vbX_px) / vbW_px) * 100,
                    y: ((pin.y - vbY_px) / vbH_px) * 100,
                    row: isTop ? 'top' : 'bottom',
                };
            });

            setPins(mappedPins);
        };

        // Initialize logic
        const attemptInit = () => {
            customElements.whenDefined('wokwi-arduino-uno').then(() => {
                // Retry a few times in case shadow DOM is sluggish
                calculatePins();
                setTimeout(calculatePins, 50);
                setTimeout(calculatePins, 200);
            });
        };

        attemptInit();

        // Re-calculate on resize
        const observer = new ResizeObserver(calculatePins);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            className="relative"
            ref={containerRef}
            // CRITICAL: prevents 'inline' whitespace issues affecting height
            style={{ display: 'flex' }}
        >
            {/* CRITICAL: 'display: block' ensures the element behaves like a box 
         and fills the container height correctly without text descender space. 
      */}
            <wokwi-arduino-uno style={{ display: 'block' }} />

            {pins.map((pin) => {
                const isHovered = hoveredPin === pin.id;
                const isTop = pin.row === 'top';

                return (
                    <div
                        key={pin.id}
                        className="absolute z-50"
                        style={{
                            left: `${pin.x}%`,
                            top: `${pin.y}%`,
                            transform: 'translate(-50%, -50%)',
                            width: '16px', // Slightly larger hit area
                            height: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'auto', // Capture mouse events
                        }}
                        onMouseEnter={() => setHoveredPin(pin.id)}
                        onMouseLeave={() => setHoveredPin(null)}
                    >
                        <Handle
                            id={pin.id}
                            type="source"
                            position={isTop ? Position.Top : Position.Bottom}
                            isConnectable={true}
                            style={{
                                width: 8,
                                height: 8,
                                background: isHovered ? '#22c55e' : 'transparent',
                                border: isHovered ? '1.5px solid #16a34a' : 'none',
                                borderRadius: '50%',
                                opacity: isHovered ? 1 : 0,
                                transition: 'opacity 0.1s ease',
                            }}
                        />
                        {isHovered && (
                            <div
                                className="absolute whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] text-green-400 shadow-md ring-1 ring-green-500/40"
                                style={{
                                    [isTop ? 'bottom' : 'top']: '100%',
                                    marginBottom: isTop ? '4px' : 0,
                                    marginTop: !isTop ? '4px' : 0,
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
