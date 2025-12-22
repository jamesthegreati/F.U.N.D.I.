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

function ArduinoNode() {
    const [hoveredPin, setHoveredPin] = useState<string | null>(null);
    const [pins, setPins] = useState<PinData[]>([]);
    // We track aspect ratio to force the container to match the board perfectly
    const [aspectRatio, setAspectRatio] = useState<string>('auto');

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Standard CSS DPI: 1 inch = 96px = 25.4mm
        const MM_TO_PX = 96 / 25.4;

        const calculatePins = () => {
            const element = containerRef.current?.querySelector('wokwi-arduino-uno') as HTMLElement & { pinInfo?: { name: string; x: number; y: number }[] };
            // Safety check for shadowRoot and pinInfo
            if (!element || !element.shadowRoot || !element.pinInfo) return;

            const svg = element.shadowRoot.querySelector('svg');
            if (!svg) return;

            const viewBoxAttr = svg.getAttribute('viewBox');
            if (!viewBoxAttr) return;

            // Parse ViewBox: "-4 0 72.58 53.34" -> [x, y, w, h]
            const viewBox = viewBoxAttr.split(/[\s,]+/).map(parseFloat);
            if (viewBox.length !== 4) return;

            const [vbX_mm, vbY_mm, vbW_mm, vbH_mm] = viewBox;

            // 1. Set Aspect Ratio on Container
            // This is CRITICAL. It ensures the div is exactly the same shape as the SVG.
            // If we don't do this, the SVG might center itself with whitespace, throwing off the pins.
            const ratio = `${vbW_mm} / ${vbH_mm}`;
            if (aspectRatio !== ratio) {
                setAspectRatio(ratio);
            }

            // 2. Convert to Pixels
            const vbX_px = vbX_mm * MM_TO_PX;
            const vbY_px = vbY_mm * MM_TO_PX;
            const vbW_px = vbW_mm * MM_TO_PX;
            const vbH_px = vbH_mm * MM_TO_PX;

            // 3. Map Pins
            const mappedPins: PinData[] = element.pinInfo.map((pin) => {
                // Determine row based on Y position (Top row is usually near 0, bottom near height)
                const isTop = pin.y < vbH_px / 2;

                return {
                    id: pin.name,
                    // Calculate percentage relative to the *visual* bounding box
                    x: ((pin.x - vbX_px) / vbW_px) * 100,
                    y: ((pin.y - vbY_px) / vbH_px) * 100,
                    row: isTop ? 'top' : 'bottom',
                };
            });

            setPins(mappedPins);
        };

        // Retry logic to wait for Wokwi element to fully render
        const attemptInit = () => {
            customElements.whenDefined('wokwi-arduino-uno').then(() => {
                calculatePins();
                // Check again after short delays to handle layout shifts
                setTimeout(calculatePins, 50);
                setTimeout(calculatePins, 500);
            });
        };

        attemptInit();

        // Re-calculate if the window resizes
        window.addEventListener('resize', calculatePins);
        return () => window.removeEventListener('resize', calculatePins);
    }, []); // Empty dependency array means this runs once on mount

    return (
        <div
            className="relative"
            ref={containerRef}
            style={{
                // Force the container to hug the SVG aspect ratio exactly
                aspectRatio: aspectRatio,
                // Ensure it doesn't collapse before loading
                minWidth: '200px',
                display: 'inline-block'
            }}
        >
            {/* display: block removes "inline" whitespace.
         width/height 100% ensures it fills the aspect-ratio container.
      */}
            <wokwi-arduino-uno style={{ display: 'block', width: '100%', height: '100%' }} />

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
                            width: '12px',
                            height: '12px',
                            // Flex center to ensure the Handle is exactly in the middle of the percentage point
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'auto',
                        }}
                        onMouseEnter={() => setHoveredPin(pin.id)}
                        onMouseLeave={() => setHoveredPin(null)}
                    >
                        <Handle
                            id={pin.id}
                            type="source"
                            position={isTop ? Position.Top : Position.Bottom}
                            style={{
                                width: 8,
                                height: 8,
                                background: isHovered ? '#22c55e' : 'transparent',
                                border: isHovered ? '1.5px solid #16a34a' : 'none',
                                borderRadius: '50%',
                                opacity: isHovered ? 1 : 0,
                                transition: 'all 0.1s ease',
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
