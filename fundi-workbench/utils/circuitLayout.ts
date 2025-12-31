'use client';

/**
 * Smart Circuit Layout Algorithm
 * 
 * Positions AI-generated circuit components in a neat, organized layout.
 * Places microcontroller at center-left, peripherals arranged around it by type.
 */

import type { CircuitPart, Connection } from '@/store/useAppStore';

// Layout configuration constants
const GRID_SIZE = 20; // Match ReactFlow snap grid
const MCU_POSITION = { x: 0, y: 0 };
const COLUMN_WIDTH = 160; // Horizontal spacing between columns
const VERTICAL_SPACING = 100; // Vertical spacing between components
const MIN_VERTICAL_SPACING = 80; // Minimum spacing for densely packed columns
const MAX_COMPONENTS_PER_COLUMN = 5;

// Microcontroller part types
const MCU_TYPES = new Set([
    'arduino-uno', 'wokwi-arduino-uno',
    'arduino-nano', 'wokwi-arduino-nano',
    'arduino-mega', 'wokwi-arduino-mega',
    'esp32-devkit-v1', 'wokwi-esp32-devkit-v1',
    'pi-pico', 'wokwi-pi-pico',
    'attiny85', 'wokwi-attiny85',
    'franzininho', 'wokwi-franzininho',
    'nano-rp2040-connect', 'wokwi-nano-rp2040-connect',
]);

// Component categories for layout grouping
type ComponentLayoutCategory = 'mcu' | 'power' | 'output' | 'input' | 'display' | 'other';

const CATEGORY_PATTERNS: Record<ComponentLayoutCategory, RegExp> = {
    mcu: /arduino|esp32|pi-pico|attiny|franzininho|rp2040/i,
    power: /resistor|capacitor|vcc|gnd|power|breadboard/i,
    output: /led|buzzer|relay|speaker|rgb|neopixel|servo|motor|stepper/i,
    input: /button|pushbutton|switch|potentiometer|sensor|dht|hc-sr|pir|ldr|joystick|encoder|keypad|ir-receiver|ir-remote/i,
    display: /lcd|oled|ssd1306|segment|ili9341|max7219|tm1637|matrix/i,
    other: /.*/,
};

// Column X positions for each category (relative to MCU)
const CATEGORY_COLUMNS: Record<ComponentLayoutCategory, number> = {
    mcu: 0,
    power: 1,      // Column 1: Power/Passive (x = 160)
    output: 2,     // Column 2: LEDs/Outputs (x = 320)
    input: 3,      // Column 3: Buttons/Inputs (x = 480)
    display: 4,    // Column 4: Displays (x = 640)
    other: 5,      // Column 5: Other (x = 800)
};

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
 * Categorize a component based on its type
 */
function categorizeComponent(partType: string): ComponentLayoutCategory {
    const normalized = partType.toLowerCase();
    
    if (CATEGORY_PATTERNS.mcu.test(normalized)) return 'mcu';
    if (CATEGORY_PATTERNS.display.test(normalized)) return 'display';
    if (CATEGORY_PATTERNS.input.test(normalized)) return 'input';
    if (CATEGORY_PATTERNS.output.test(normalized)) return 'output';
    if (CATEGORY_PATTERNS.power.test(normalized)) return 'power';
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
 * Group parts by their layout category
 */
function groupPartsByCategory(
    parts: CircuitPart[]
): Map<ComponentLayoutCategory, CircuitPart[]> {
    const groups = new Map<ComponentLayoutCategory, CircuitPart[]>();
    
    for (const category of Object.keys(CATEGORY_COLUMNS) as ComponentLayoutCategory[]) {
        groups.set(category, []);
    }
    
    for (const part of parts) {
        const category = categorizeComponent(part.type);
        const group = groups.get(category) || [];
        group.push(part);
        groups.set(category, group);
    }
    
    return groups;
}

/**
 * Main layout function - calculates optimal positions for all circuit parts
 */
export function calculateCircuitLayout(
    parts: CircuitPart[],
    connections: Connection[]
): CircuitPart[] {
    if (parts.length === 0) return parts;

    // Get connection counts for sorting within categories
    const connectionCounts = getConnectionCounts(parts, connections);
    
    // Group parts by category
    const categoryGroups = groupPartsByCategory(parts);
    
    // Calculate positions
    const positioned: CircuitPart[] = [];
    
    // Position MCUs first at center-left
    const mcus = categoryGroups.get('mcu') || [];
    let mcuYOffset = 0;
    for (const mcu of mcus) {
        positioned.push({
            ...mcu,
            position: { 
                x: snapToGrid(MCU_POSITION.x), 
                y: snapToGrid(MCU_POSITION.y + mcuYOffset) 
            },
        });
        mcuYOffset += VERTICAL_SPACING * 2; // MCUs are taller
    }

    // Position other categories in their designated columns
    const categories: ComponentLayoutCategory[] = ['power', 'output', 'input', 'display', 'other'];
    
    for (const category of categories) {
        const partsInCategory = categoryGroups.get(category) || [];
        if (partsInCategory.length === 0) continue;
        
        // Sort by connection count (most connected first)
        partsInCategory.sort((a, b) => 
            (connectionCounts.get(b.id) || 0) - (connectionCounts.get(a.id) || 0)
        );
        
        const columnIndex = CATEGORY_COLUMNS[category];
        const baseX = MCU_POSITION.x + COLUMN_WIDTH * columnIndex;
        
        // Center the column vertically around MCU
        const totalHeight = (partsInCategory.length - 1) * VERTICAL_SPACING;
        const startY = MCU_POSITION.y - totalHeight / 2;
        
        let columnCount = 0;
        let subColumnIndex = 0;
        
        for (let i = 0; i < partsInCategory.length; i++) {
            const part = partsInCategory[i];
            const rowInColumn = columnCount % MAX_COMPONENTS_PER_COLUMN;
            
            const x = snapToGrid(baseX + subColumnIndex * COLUMN_WIDTH);
            const y = snapToGrid(startY + rowInColumn * VERTICAL_SPACING);
            
            positioned.push({
                ...part,
                position: { x, y },
            });
            
            columnCount++;
            if (columnCount % MAX_COMPONENTS_PER_COLUMN === 0) {
                subColumnIndex++;
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
