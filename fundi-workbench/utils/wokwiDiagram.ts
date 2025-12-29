'use client';

/**
 * Wokwi diagram.json Import/Export
 * 
 * Full compatibility with Wokwi's project file format.
 * Allows importing and exporting circuits to/from Wokwi simulator.
 */

// Wokwi diagram.json format types
export interface WokwiPart {
    type: string;
    id: string;
    top?: number;
    left?: number;
    rotate?: number;
    attrs?: Record<string, string>;
}

export interface WokwiConnection {
    from: string;  // "partId:pinId"
    to: string;    // "partId:pinId"
    color?: string;
}

export interface WokwiDiagram {
    version: 1;
    author?: string;
    editor?: string;
    parts: WokwiPart[];
    connections: WokwiConnection[];
    serialMonitor?: {
        display?: 'auto' | 'always' | 'never';
    };
}

// FUNDI internal format types (from your existing codebase)
export interface FundiPart {
    id: string;
    type: string;
    position?: { x: number; y: number };
    x?: number;
    y?: number;
    rotation?: number;
    attrs?: Record<string, unknown>;
}

export interface FundiConnection {
    id: string;
    from: {
        partId: string;
        pinId: string;
    };
    to: {
        partId: string;
        pinId: string;
    };
    color?: string;
    points?: Array<{ x: number; y: number }>;
}

export interface FundiCircuit {
    parts: FundiPart[];
    connections: FundiConnection[];
}

/**
 * Wokwi to FUNDI part type mapping
 */
const WOKWI_TO_FUNDI_TYPE: Record<string, string> = {
    'wokwi-arduino-uno': 'arduino-uno',
    'wokwi-arduino-nano': 'arduino-nano',
    'wokwi-arduino-mega': 'arduino-mega',
    'wokwi-esp32-devkit-v1': 'esp32-devkit-v1',
    'wokwi-led': 'led',
    'wokwi-led-ring': 'led-ring',
    'wokwi-rgb-led': 'rgb-led',
    'wokwi-resistor': 'resistor',
    'wokwi-pushbutton': 'pushbutton',
    'wokwi-slide-switch': 'slide-switch',
    'wokwi-servo': 'servo',
    'wokwi-potentiometer': 'potentiometer',
    'wokwi-dht22': 'dht22',
    'wokwi-hc-sr04': 'hc-sr04',
    'wokwi-buzzer': 'buzzer',
    'wokwi-lcd1602': 'lcd1602',
    'wokwi-lcd2004': 'lcd2004',
    'wokwi-ssd1306': 'ssd1306',
    'wokwi-membrane-keypad': 'membrane-keypad',
    'wokwi-7segment': '7segment',
    'wokwi-breadboard': 'breadboard',
    'wokwi-breadboard-mini': 'breadboard-mini',
    'wokwi-neopixel': 'neopixel',
    'wokwi-neopixel-matrix': 'neopixel-matrix',
    'wokwi-ir-receiver': 'ir-receiver',
    'wokwi-ir-remote': 'ir-remote',
    'wokwi-pir-motion-sensor': 'pir-motion-sensor',
    'wokwi-photoresistor-sensor': 'photoresistor-sensor',
    'wokwi-ds18b20': 'ds18b20',
    'wokwi-stepper-motor': 'stepper-motor',
    'wokwi-sd-card': 'sd-card',
    'wokwi-biaxial-stepper': 'biaxial-stepper',
    'wokwi-relay-module': 'relay-module',
    'wokwi-motor': 'motor',
    'wokwi-text': 'text',
    'wokwi-ntc-temperature-sensor': 'ntc-temperature-sensor',
    'wokwi-analog-joystick': 'analog-joystick',
    'wokwi-gas-sensor': 'gas-sensor',
    'wokwi-rotary-encoder': 'rotary-encoder',
    'wokwi-tilt-sensor': 'tilt-sensor',
    'wokwi-dip-switch-8': 'dip-switch-8',
    'wokwi-slide-potentiometer': 'slide-potentiometer',
    'wokwi-heart-beat-sensor': 'heart-beat-sensor',
};

/**
 * FUNDI to Wokwi part type mapping (reverse of above)
 */
const FUNDI_TO_WOKWI_TYPE: Record<string, string> = Object.fromEntries(
    Object.entries(WOKWI_TO_FUNDI_TYPE).map(([k, v]) => [v, k])
);

/**
 * Parse a Wokwi connection string "partId:pinId"
 */
function parseWokwiConnection(conn: string): { partId: string; pinId: string } {
    const [partId, pinId] = conn.split(':');
    return { partId: partId || '', pinId: pinId || '' };
}

/**
 * Format a FUNDI connection to Wokwi format
 */
function toWokwiConnection(partId: string, pinId: string): string {
    return `${partId}:${pinId}`;
}

/**
 * Import a Wokwi diagram.json into FUNDI format
 */
export function importWokwiDiagram(json: string | WokwiDiagram): FundiCircuit {
    const diagram: WokwiDiagram = typeof json === 'string' ? JSON.parse(json) : json;

    // Convert parts
    const parts: FundiPart[] = diagram.parts.map(wPart => {
        const fundiType = WOKWI_TO_FUNDI_TYPE[wPart.type] || wPart.type.replace('wokwi-', '');

        return {
            id: wPart.id,
            type: fundiType,
            position: {
                x: wPart.left ?? 0,
                y: wPart.top ?? 0,
            },
            rotation: wPart.rotate ?? 0,
            attrs: wPart.attrs as Record<string, unknown>,
        };
    });

    // Convert connections
    const connections: FundiConnection[] = diagram.connections.map((wConn, index) => {
        const from = parseWokwiConnection(wConn.from);
        const to = parseWokwiConnection(wConn.to);

        return {
            id: `wire_${index + 1}`,
            from,
            to,
            color: wConn.color || '#22c55e',
        };
    });

    console.log(`[WokwiImport] Imported ${parts.length} parts and ${connections.length} connections`);

    return { parts, connections };
}

/**
 * Export a FUNDI circuit to Wokwi diagram.json format
 */
export function exportWokwiDiagram(circuit: FundiCircuit): WokwiDiagram {
    // Convert parts
    const parts: WokwiPart[] = circuit.parts.map(fPart => {
        const wokwiType = FUNDI_TO_WOKWI_TYPE[fPart.type] || `wokwi-${fPart.type}`;
        const x = fPart.position?.x ?? fPart.x ?? 0;
        const y = fPart.position?.y ?? fPart.y ?? 0;

        const wPart: WokwiPart = {
            type: wokwiType,
            id: fPart.id,
            left: x,
            top: y,
        };

        if (fPart.rotation && fPart.rotation !== 0) {
            wPart.rotate = fPart.rotation;
        }

        if (fPart.attrs && Object.keys(fPart.attrs).length > 0) {
            // Convert attrs to strings (Wokwi format)
            wPart.attrs = Object.fromEntries(
                Object.entries(fPart.attrs).map(([k, v]) => [k, String(v)])
            );
        }

        return wPart;
    });

    // Convert connections
    const connections: WokwiConnection[] = circuit.connections.map(fConn => {
        const wConn: WokwiConnection = {
            from: toWokwiConnection(fConn.from.partId, fConn.from.pinId),
            to: toWokwiConnection(fConn.to.partId, fConn.to.pinId),
        };

        if (fConn.color) {
            wConn.color = fConn.color;
        }

        return wConn;
    });

    console.log(`[WokwiExport] Exported ${parts.length} parts and ${connections.length} connections`);

    return {
        version: 1,
        author: 'FUNDI Workbench',
        editor: 'fundi',
        parts,
        connections,
    };
}

/**
 * Validate a Wokwi diagram before import
 */
export function validateWokwiDiagram(json: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Handle empty input
    if (!json || !json.trim()) {
        return { valid: false, errors: ['Empty input'] };
    }

    try {
        const diagram = JSON.parse(json);

        // Check version (allow number 1 or string "1")
        const version = Number(diagram.version);
        if (version !== 1) {
            errors.push(`Unsupported version: ${diagram.version}. Expected version 1.`);
        }

        // Check parts
        if (!Array.isArray(diagram.parts)) {
            errors.push('Missing or invalid "parts" array.');
        } else {
            for (let i = 0; i < diagram.parts.length; i++) {
                const part = diagram.parts[i];
                if (!part.type) {
                    errors.push(`Part at index ${i} is missing "type".`);
                }
                if (!part.id) {
                    errors.push(`Part at index ${i} is missing "id".`);
                }
            }
        }

        // Check connections - allow missing or empty array
        if (diagram.connections !== undefined && !Array.isArray(diagram.connections)) {
            errors.push('Invalid "connections" - must be an array if present.');
        } else if (Array.isArray(diagram.connections)) {
            for (let i = 0; i < diagram.connections.length; i++) {
                const conn = diagram.connections[i];
                if (!conn.from || (typeof conn.from === 'string' && !conn.from.includes(':'))) {
                    errors.push(`Connection at index ${i} has invalid "from": ${conn.from}`);
                }
                if (!conn.to || (typeof conn.to === 'string' && !conn.to.includes(':'))) {
                    errors.push(`Connection at index ${i} has invalid "to": ${conn.to}`);
                }
            }
        }

    } catch (e) {
        errors.push(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`);
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Download a Wokwi diagram as a file
 */
export function downloadWokwiDiagram(diagram: WokwiDiagram, filename: string = 'diagram.json'): void {
    const json = JSON.stringify(diagram, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('[WokwiExport] Downloaded diagram.json');
}

/**
 * Get list of supported Wokwi part types
 */
export function getSupportedPartTypes(): string[] {
    return Object.keys(WOKWI_TO_FUNDI_TYPE);
}
