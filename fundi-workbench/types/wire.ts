/**
 * Wire data types for the wiring system
 */

export interface WirePoint {
    x: number;
    y: number;
}

export interface PinReference {
    nodeId: string;
    pinId: string;
}

export interface Wire {
    id: string;
    sourcePin: PinReference;
    targetPin: PinReference | null; // null while creating
    waypoints: WirePoint[]; // intermediate bend points
    color: string;
}

export type WiringMode = 'idle' | 'creating' | 'editing';

export interface WiringState {
    mode: WiringMode;
    wires: Wire[];
    activeWireId: string | null;
    selectedWireId: string | null;
    previewPoint: WirePoint | null; // current mouse position during creation
}

// Default wire colors matching Wokwi palette
export const WIRE_COLORS = [
    '#22c55e', // green (default)
    '#ef4444', // red
    '#000000', // black
    '#eab308', // yellow
    '#3b82f6', // blue
    '#a855f7', // purple
    '#f97316', // orange
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#ffffff', // white
] as const;

export const DEFAULT_WIRE_COLOR = WIRE_COLORS[0];
