'use client';

/**
 * Smart Circuit Layout Algorithm
 * 
 * Positions AI-generated circuit components in a neat, organized layout.
 * Places microcontroller at center-left, peripherals arranged around it.
 */

import type { CircuitPart, Connection } from '@/store/useAppStore';

// Layout configuration constants
const GRID_SIZE = 20; // Match ReactFlow snap grid
const MCU_POSITION = { x: 0, y: 0 };
const COLUMN_SPACING = 300; // Increased space between columns
const VERTICAL_SPACING = 120; // Space between components in same column
const MAX_COMPONENTS_PER_COLUMN = 4;

// Component type categories for smart positioning
const COMPONENT_CATEGORIES = {
  mcu: new Set([
    'arduino-uno', 'wokwi-arduino-uno',
    'arduino-nano', 'wokwi-arduino-nano',
    'arduino-mega', 'wokwi-arduino-mega',
    'esp32-devkit-v1', 'wokwi-esp32-devkit-v1',
    'pi-pico', 'wokwi-pi-pico',
    'nano-rp2040-connect', 'wokwi-nano-rp2040-connect',
    'franzininho', 'wokwi-franzininho',
  ]),
  power: new Set([
    'resistor', 'wokwi-resistor',
    'potentiometer', 'wokwi-potentiometer',
    'slide-potentiometer', 'wokwi-slide-potentiometer',
  ]),
  outputs: new Set([
    'led', 'wokwi-led',
    'rgb-led', 'wokwi-rgb-led',
    'neopixel', 'wokwi-neopixel',
    'neopixel-matrix', 'wokwi-neopixel-matrix',
    'led-bar-graph', 'wokwi-led-bar-graph',
    'led-ring', 'wokwi-led-ring',
    'buzzer', 'wokwi-buzzer',
    'servo', 'wokwi-servo',
  ]),
  inputs: new Set([
    'pushbutton', 'wokwi-pushbutton',
    'pushbutton-6mm', 'wokwi-pushbutton-6mm',
    'slide-switch', 'wokwi-slide-switch',
    'dip-switch-8', 'wokwi-dip-switch-8',
    'membrane-keypad', 'wokwi-membrane-keypad',
    'analog-joystick', 'wokwi-analog-joystick',
    'rotary-encoder', 'wokwi-ky-040',
  ]),
  sensors: new Set([
    'dht22', 'wokwi-dht22',
    'hc-sr04', 'wokwi-hc-sr04',
    'pir-motion', 'wokwi-pir-motion-sensor',
    'photoresistor', 'wokwi-photoresistor-sensor',
    'mpu6050', 'wokwi-mpu6050',
    'ds1307', 'wokwi-ds1307',
    'ir-receiver', 'wokwi-ir-receiver',
    'ir-remote', 'wokwi-ir-remote',
  ]),
  displays: new Set([
    'oled-128x64-i2c', 'wokwi-ssd1306',
    'lcd1602', 'wokwi-lcd1602',
    'lcd2004', 'wokwi-lcd2004',
    'seven-segment', 'wokwi-7segment',
    'ili9341', 'wokwi-ili9341',
  ]),
};

// Microcontroller part types (keep for backward compatibility)
const MCU_TYPES = COMPONENT_CATEGORIES.mcu;

/**
 * Snap a coordinate to the grid
 */
function snapToGrid(value: number): number {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

/**
 * Check if a part is a microcontroller
 */
function isMicrocontroller(partType: string): boolean {
    const normalized = partType.toLowerCase().replace('wokwi-', '');
    return MCU_TYPES.has(partType) || MCU_TYPES.has(`wokwi-${normalized}`) || MCU_TYPES.has(normalized);
}

/**
 * Categorize a part by its type
 */
function categorizeComponent(partType: string): 'mcu' | 'power' | 'outputs' | 'inputs' | 'sensors' | 'displays' | 'other' {
    const normalized = partType.toLowerCase().replace('wokwi-', '');
    
    for (const [category, types] of Object.entries(COMPONENT_CATEGORIES)) {
        if (types.has(partType) || types.has(`wokwi-${normalized}`) || types.has(normalized)) {
            return category as 'mcu' | 'power' | 'outputs' | 'inputs' | 'sensors' | 'displays';
        }
    }
    
    return 'other';
}

/**
 * Calculate connection count for each part to determine layout priority
 */
function getConnectionCounts(
    parts: CircuitPart[],
    connections: Connection[]
): Map<string, number> {
    const counts = new Map<string, number>();

    for (const part of parts) {
        counts.set(part.id, 0);
    }

    for (const conn of connections) {
        counts.set(conn.from.partId, (counts.get(conn.from.partId) || 0) + 1);
        counts.set(conn.to.partId, (counts.get(conn.to.partId) || 0) + 1);
    }

    return counts;
}

/**
 * Group parts by their connections to the MCU
 */
function groupPartsByConnection(
    parts: CircuitPart[],
    connections: Connection[],
    mcuId: string | null
): { direct: CircuitPart[]; indirect: CircuitPart[] } {
    if (!mcuId) {
        return { direct: parts, indirect: [] };
    }

    const directlyConnected = new Set<string>();

    for (const conn of connections) {
        if (conn.from.partId === mcuId) {
            directlyConnected.add(conn.to.partId);
        }
        if (conn.to.partId === mcuId) {
            directlyConnected.add(conn.from.partId);
        }
    }

    const direct: CircuitPart[] = [];
    const indirect: CircuitPart[] = [];

    for (const part of parts) {
        if (part.id === mcuId) continue;
        if (directlyConnected.has(part.id)) {
            direct.push(part);
        } else {
            indirect.push(part);
        }
    }

    return { direct, indirect };
}

/**
 * Main layout function - calculates optimal positions for all circuit parts
 */
export function calculateCircuitLayout(
    parts: CircuitPart[],
    connections: Connection[]
): CircuitPart[] {
    if (parts.length === 0) return parts;

    // Find the microcontroller
    const mcu = parts.find(p => isMicrocontroller(p.type));
    const mcuId = mcu?.id || null;

    // Get connection counts for sorting within categories
    const connectionCounts = getConnectionCounts(parts, connections);

    // Categorize all non-MCU parts
    const categorized: Record<string, CircuitPart[]> = {
        power: [],
        outputs: [],
        inputs: [],
        sensors: [],
        displays: [],
        other: [],
    };

    for (const part of parts) {
        if (part.id === mcuId) continue;
        const category = categorizeComponent(part.type);
        if (category !== 'mcu') {
            categorized[category].push(part);
        }
    }

    // Sort each category by connection count
    const sortByConnections = (a: CircuitPart, b: CircuitPart) =>
        (connectionCounts.get(b.id) || 0) - (connectionCounts.get(a.id) || 0);

    for (const category of Object.keys(categorized)) {
        categorized[category].sort(sortByConnections);
    }

    // Calculate positions
    const positioned: CircuitPart[] = [];

    // Position MCU at center-left
    if (mcu) {
        positioned.push({
            ...mcu,
            position: { x: snapToGrid(MCU_POSITION.x), y: snapToGrid(MCU_POSITION.y) },
        });
    }

    // Column assignments for different categories
    // Column 1 (x=300): Power components & resistors
    // Column 2 (x=500): LEDs & outputs  
    // Column 3 (x=650): Buttons & inputs
    // Column 4 (x=800): Sensors
    // Row below MCU (y=400): Displays

    const columnAssignments = {
        power: 1,
        outputs: 2,
        inputs: 3,
        sensors: 4,
        displays: 0, // Special: placed below MCU
        other: 5,
    };

    // Position components by category
    for (const [category, parts] of Object.entries(categorized)) {
        if (parts.length === 0) continue;

        const columnIndex = columnAssignments[category as keyof typeof columnAssignments];

        if (category === 'displays') {
            // Special positioning for displays - below MCU in a row
            for (let i = 0; i < parts.length; i++) {
                const x = snapToGrid(MCU_POSITION.x + (i * COLUMN_SPACING));
                const y = snapToGrid(MCU_POSITION.y + 400);

                positioned.push({
                    ...parts[i],
                    position: { x, y },
                });
            }
        } else {
            // Standard column positioning
            const numInColumn = Math.min(parts.length, MAX_COMPONENTS_PER_COLUMN);
            const startY = MCU_POSITION.y - ((numInColumn - 1) * VERTICAL_SPACING / 2);

            for (let i = 0; i < parts.length; i++) {
                const col = columnIndex + Math.floor(i / MAX_COMPONENTS_PER_COLUMN);
                const row = i % MAX_COMPONENTS_PER_COLUMN;
                const rowOffset = row - (Math.min(parts.length, MAX_COMPONENTS_PER_COLUMN) - 1) / 2;

                const x = snapToGrid(MCU_POSITION.x + COLUMN_SPACING * col);
                const y = snapToGrid(MCU_POSITION.y + rowOffset * VERTICAL_SPACING);

                positioned.push({
                    ...parts[i],
                    position: { x, y },
                });
            }
        }
    }

    return positioned;
}

/**
 * Calculate bounding box of all parts for viewport fitting
 */
export function getCircuitBounds(parts: CircuitPart[]): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
} {
    if (parts.length === 0) {
        return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const part of parts) {
        minX = Math.min(minX, part.position.x);
        minY = Math.min(minY, part.position.y);
        // Estimate component size (varies by type, using reasonable defaults)
        maxX = Math.max(maxX, part.position.x + 150);
        maxY = Math.max(maxY, part.position.y + 100);
    }

    return {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY,
    };
}
