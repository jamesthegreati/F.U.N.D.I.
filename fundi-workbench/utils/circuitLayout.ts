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
const HORIZONTAL_SPACING = 200; // Space between MCU and peripheral column
const VERTICAL_SPACING = 120; // Space between components in same column
const MAX_COMPONENTS_PER_COLUMN = 4;

// Microcontroller part types
const MCU_TYPES = new Set([
    'arduino-uno', 'wokwi-arduino-uno',
    'arduino-nano', 'wokwi-arduino-nano',
    'arduino-mega', 'wokwi-arduino-mega',
    'esp32-devkit-v1', 'wokwi-esp32-devkit-v1',
    'pi-pico', 'wokwi-pi-pico',
]);

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

    // Get connection counts for sorting
    const connectionCounts = getConnectionCounts(parts, connections);

    // Group parts by connection to MCU
    const { direct, indirect } = groupPartsByConnection(parts, connections, mcuId);

    // Sort by connection count (most connected first)
    const sortByConnections = (a: CircuitPart, b: CircuitPart) =>
        (connectionCounts.get(b.id) || 0) - (connectionCounts.get(a.id) || 0);

    direct.sort(sortByConnections);
    indirect.sort(sortByConnections);

    // Calculate positions
    const positioned: CircuitPart[] = [];

    // Position MCU at center-left
    if (mcu) {
        positioned.push({
            ...mcu,
            position: { x: snapToGrid(MCU_POSITION.x), y: snapToGrid(MCU_POSITION.y) },
        });
    }

    // Position directly connected parts in first column to the right of MCU
    let columnIndex = 0;
    let rowIndex = 0;

    for (const part of direct) {
        const x = snapToGrid(MCU_POSITION.x + HORIZONTAL_SPACING * (columnIndex + 1));
        const y = snapToGrid(MCU_POSITION.y - ((direct.length - 1) * VERTICAL_SPACING / 2) + (rowIndex * VERTICAL_SPACING));

        positioned.push({
            ...part,
            position: { x, y },
        });

        rowIndex++;
        if (rowIndex >= MAX_COMPONENTS_PER_COLUMN) {
            rowIndex = 0;
            columnIndex++;
        }
    }

    // Position indirectly connected parts in subsequent columns
    if (indirect.length > 0) {
        columnIndex++;
        rowIndex = 0;

        for (const part of indirect) {
            const x = snapToGrid(MCU_POSITION.x + HORIZONTAL_SPACING * (columnIndex + 1));
            const y = snapToGrid(MCU_POSITION.y - ((indirect.length - 1) * VERTICAL_SPACING / 2) + (rowIndex * VERTICAL_SPACING));

            positioned.push({
                ...part,
                position: { x, y },
            });

            rowIndex++;
            if (rowIndex >= MAX_COMPONENTS_PER_COLUMN) {
                rowIndex = 0;
                columnIndex++;
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
