/**
 * Custom wokwi-pi-pico element – registers the <wokwi-pi-pico> custom element
 * with an SVG rendering and pinInfo for the WokwiPartNode overlay system.
 *
 * The @wokwi/elements package does NOT ship a Pi Pico element (confirmed across
 * all versions 1.0.0–1.9.1 and the GitHub source). This custom element provides
 * a high-fidelity rendering based on the wokwi-docs reference SVG and follows
 * the same contract (shadow DOM SVG + pinInfo array) used by official elements
 * like wokwi-arduino-uno and wokwi-nano-rp2040-connect.
 *
 * Design reference: https://docs.wokwi.com/parts/wokwi-pi-pico
 * Element pattern: temp-wokwi-reference/wokwi-elements/src/nano-rp2040-connect-element.ts
 */

interface ElementPin {
    name: string;
    x: number;
    y: number;
    signals: { type: string; signal?: string; voltage?: number }[];
}

// ────────────────────── pin layout ──────────────────────
// The Pi Pico has 40 pins: 20 on each side.
// ViewBox: "0 0 170 440" – matches the ~21mm × 51mm real-world board proportions.
// Left column x = 9,  right column x = 161
// First pin y = 40, spacing = 20  →  last pin y = 40 + 19·20 = 420

const PIN_LEFT_X = 9;
const PIN_RIGHT_X = 161;
const PIN_Y_START = 40;
const PIN_SPACING = 20;

function py(index: number) {
    return PIN_Y_START + index * PIN_SPACING;
}

// Left-side pins (physical 1–20, top → bottom)
const LEFT_PINS: ElementPin[] = [
    { name: 'GP0', x: PIN_LEFT_X, y: py(0), signals: [{ type: 'pwm' }] },
    { name: 'GP1', x: PIN_LEFT_X, y: py(1), signals: [{ type: 'pwm' }] },
    { name: 'GND.1', x: PIN_LEFT_X, y: py(2), signals: [{ type: 'power', signal: 'GND' }] },
    { name: 'GP2', x: PIN_LEFT_X, y: py(3), signals: [{ type: 'pwm' }] },
    { name: 'GP3', x: PIN_LEFT_X, y: py(4), signals: [{ type: 'pwm' }] },
    { name: 'GP4', x: PIN_LEFT_X, y: py(5), signals: [{ type: 'pwm' }] },
    { name: 'GP5', x: PIN_LEFT_X, y: py(6), signals: [{ type: 'pwm' }] },
    { name: 'GND.2', x: PIN_LEFT_X, y: py(7), signals: [{ type: 'power', signal: 'GND' }] },
    { name: 'GP6', x: PIN_LEFT_X, y: py(8), signals: [{ type: 'pwm' }] },
    { name: 'GP7', x: PIN_LEFT_X, y: py(9), signals: [{ type: 'pwm' }] },
    { name: 'GP8', x: PIN_LEFT_X, y: py(10), signals: [{ type: 'pwm' }] },
    { name: 'GP9', x: PIN_LEFT_X, y: py(11), signals: [{ type: 'pwm' }] },
    { name: 'GND.3', x: PIN_LEFT_X, y: py(12), signals: [{ type: 'power', signal: 'GND' }] },
    { name: 'GP10', x: PIN_LEFT_X, y: py(13), signals: [{ type: 'pwm' }] },
    { name: 'GP11', x: PIN_LEFT_X, y: py(14), signals: [{ type: 'pwm' }] },
    { name: 'GP12', x: PIN_LEFT_X, y: py(15), signals: [{ type: 'pwm' }] },
    { name: 'GP13', x: PIN_LEFT_X, y: py(16), signals: [{ type: 'pwm' }] },
    { name: 'GND.4', x: PIN_LEFT_X, y: py(17), signals: [{ type: 'power', signal: 'GND' }] },
    { name: 'GP14', x: PIN_LEFT_X, y: py(18), signals: [{ type: 'pwm' }] },
    { name: 'GP15', x: PIN_LEFT_X, y: py(19), signals: [{ type: 'pwm' }] },
];

// Right-side pins (physical 40–21, top → bottom)
const RIGHT_PINS: ElementPin[] = [
    { name: 'VBUS', x: PIN_RIGHT_X, y: py(0), signals: [{ type: 'power', signal: 'VCC', voltage: 5 }] },
    { name: 'VSYS', x: PIN_RIGHT_X, y: py(1), signals: [{ type: 'power', signal: 'VCC' }] },
    { name: 'GND.5', x: PIN_RIGHT_X, y: py(2), signals: [{ type: 'power', signal: 'GND' }] },
    { name: '3V3_EN', x: PIN_RIGHT_X, y: py(3), signals: [] },
    { name: '3V3', x: PIN_RIGHT_X, y: py(4), signals: [{ type: 'power', signal: 'VCC', voltage: 3.3 }] },
    { name: 'ADC_VREF', x: PIN_RIGHT_X, y: py(5), signals: [] },
    { name: 'GP28', x: PIN_RIGHT_X, y: py(6), signals: [{ type: 'pwm' }] },
    { name: 'GND.6', x: PIN_RIGHT_X, y: py(7), signals: [{ type: 'power', signal: 'GND' }] },
    { name: 'GP27', x: PIN_RIGHT_X, y: py(8), signals: [{ type: 'pwm' }] },
    { name: 'GP26', x: PIN_RIGHT_X, y: py(9), signals: [{ type: 'pwm' }] },
    { name: 'RUN', x: PIN_RIGHT_X, y: py(10), signals: [] },
    { name: 'GP22', x: PIN_RIGHT_X, y: py(11), signals: [{ type: 'pwm' }] },
    { name: 'GND.7', x: PIN_RIGHT_X, y: py(12), signals: [{ type: 'power', signal: 'GND' }] },
    { name: 'GP21', x: PIN_RIGHT_X, y: py(13), signals: [{ type: 'pwm' }] },
    { name: 'GP20', x: PIN_RIGHT_X, y: py(14), signals: [{ type: 'pwm' }] },
    { name: 'GP19', x: PIN_RIGHT_X, y: py(15), signals: [{ type: 'pwm' }] },
    { name: 'GP18', x: PIN_RIGHT_X, y: py(16), signals: [{ type: 'pwm' }] },
    { name: 'GND.8', x: PIN_RIGHT_X, y: py(17), signals: [{ type: 'power', signal: 'GND' }] },
    { name: 'GP17', x: PIN_RIGHT_X, y: py(18), signals: [{ type: 'pwm' }] },
    { name: 'GP16', x: PIN_RIGHT_X, y: py(19), signals: [{ type: 'pwm' }] },
];

const ALL_PINS: ElementPin[] = [...LEFT_PINS, ...RIGHT_PINS];

// ────────────────────── SVG helpers ──────────────────────
// Castellated half-circle pad (authentic wokwi style)
// These simulate the half-moon cutouts on the board edges
function castPadLeft(cy: number, isGnd: boolean): string {
    const r = 5.5;
    const fill = isGnd ? '#958863' : '#ffdc8e';
    const stroke = '#8B6914';
    // Half-circle pad on left edge: arc from top to bottom, flat on left
    return `<path d="M4,${cy - r} a${r},${r} 0 0,1 0,${r * 2}" fill="${fill}" stroke="${stroke}" stroke-width="0.6"/>` +
        `<circle cx="9" cy="${cy}" r="3.4" fill="${fill}" stroke="${stroke}" stroke-width="0.5"/>`;
}

function castPadRight(cy: number, isGnd: boolean): string {
    const r = 5.5;
    const fill = isGnd ? '#958863' : '#ffdc8e';
    const stroke = '#8B6914';
    // Half-circle pad on right edge: arc from bottom to top, flat on right
    return `<path d="M166,${cy + r} a${r},${r} 0 0,1 0,${-r * 2}" fill="${fill}" stroke="${stroke}" stroke-width="0.6"/>` +
        `<circle cx="161" cy="${cy}" r="3.4" fill="${fill}" stroke="${stroke}" stroke-width="0.5"/>`;
}

// ────────────────────── SVG template ──────────────────────
function buildSvg(): string {
    // Pin labels for left side
    const leftLabels = LEFT_PINS.map(
        (p) =>
            `<text x="18" y="${p.y + 3}" font-size="6.5" fill="#c8e6c9" font-family="'Droid Sans',sans-serif">${p.name}</text>`
    ).join('\n    ');

    // Pin labels for right side
    const rightLabels = RIGHT_PINS.map(
        (p) =>
            `<text x="152" y="${p.y + 3}" font-size="6.5" fill="#c8e6c9" font-family="'Droid Sans',sans-serif" text-anchor="end">${p.name}</text>`
    ).join('\n    ');

    // Castellated pads – left
    const leftPads = LEFT_PINS.map(
        (p) => castPadLeft(p.y, p.name.startsWith('GND'))
    ).join('\n    ');

    // Castellated pads – right
    const rightPads = RIGHT_PINS.map(
        (p) => castPadRight(p.y, p.name.startsWith('GND'))
    ).join('\n    ');

    return `<svg viewBox="0 0 170 440" width="56.67mm" height="146.67mm" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Castellated pad pattern (reference: wokwi nano-rp2040-connect) -->
    <linearGradient id="pcb-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#006837"/>
      <stop offset="100%" stop-color="#004e29"/>
    </linearGradient>
    <radialGradient id="led-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#4cff4c" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#1a3a1a" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- PCB board with authentic green color from wokwi-docs -->
  <rect x="4" y="3" width="162" height="434" rx="4" fill="#33865f"/>
  <rect x="5" y="4" width="160" height="432" rx="3.5" fill="#006837"/>
  <rect x="6" y="5" width="158" height="430" rx="3" fill="#004e29"/>

  <!-- Edge highlight (left/right) -->
  <rect x="4" y="3" width="1.5" height="434" fill="#33865f" opacity="0.6"/>
  <rect x="164.5" y="3" width="1.5" height="434" fill="#33865f" opacity="0.6"/>

  <!-- Mounting holes with gold annular rings (from wokwi-docs reference) -->
  <circle cx="30" cy="28" r="7.2" fill="none" stroke="#fcee21" stroke-width="3.2"/>
  <circle cx="30" cy="28" r="4" fill="#004e29"/>
  <circle cx="140" cy="28" r="7.2" fill="none" stroke="#fcee21" stroke-width="3.2"/>
  <circle cx="140" cy="28" r="4" fill="#004e29"/>
  <circle cx="30" cy="412" r="7.2" fill="none" stroke="#fcee21" stroke-width="3.2"/>
  <circle cx="30" cy="412" r="4" fill="#004e29"/>
  <circle cx="140" cy="412" r="7.2" fill="none" stroke="#fcee21" stroke-width="3.2"/>
  <circle cx="140" cy="412" r="4" fill="#004e29"/>

  <!-- USB Micro-B connector (from wokwi-docs: gray metallic) -->
  <rect x="52" y="0" width="66" height="20" rx="2" fill="#ccc"/>
  <rect x="54" y="1" width="62" height="18" rx="1.5" fill="#363a44"/>
  <rect x="58" y="4" width="54" height="12" rx="1" fill="#ccc"/>
  <rect x="60" y="5.5" width="50" height="9" rx="0.8" fill="#aaa"/>
  <!-- USB opening -->
  <rect x="68" y="6.5" width="34" height="7" rx="1.5" fill="#555"/>
  <!-- USB tongue / tab ears from reference -->
  <path d="M56 2 L56 18" stroke="#aaa" stroke-width="0.5" fill="none"/>
  <path d="M114 2 L114 18" stroke="#aaa" stroke-width="0.5" fill="none"/>

  <!-- BOOTSEL button (white tactile switch) -->
  <rect x="60" y="122" width="20" height="12" rx="2" fill="#ccc" stroke="#aaa" stroke-width="0.5"/>
  <rect x="62.5" y="124.5" width="15" height="7" rx="2" fill="#f0f0f0"/>
  <circle cx="70" cy="128" r="2.5" fill="#ddd" stroke="#bbb" stroke-width="0.4"/>
  <text x="70" y="144" font-size="5.5" fill="#c8e6c9" text-anchor="middle" font-family="'Droid Sans',sans-serif" letter-spacing="0.8">BOOTSEL</text>

  <!-- LED (GP25) with subtle glow -->
  <circle cx="106" cy="57" r="5.5" fill="#2a2d2e" stroke="#444" stroke-width="0.4"/>
  <circle cx="106" cy="57" r="3.5" fill="#1a3a1a"/>
  <circle cx="106" cy="57" r="6" fill="url(#led-glow)" opacity="0.3"/>
  <text x="106" y="69" font-size="5" fill="#c8e6c9" text-anchor="middle" font-family="'Droid Sans',sans-serif">LED</text>

  <!-- RP2040 chip (from wokwi-docs: #30312e square with QFP pads) -->
  <rect x="48" y="178" width="74" height="74" rx="2" fill="#30312e"/>
  <rect x="50" y="180" width="70" height="70" rx="1.5" fill="#1e1e1e"/>
  <!-- QFP pin leads on all 4 sides -->
  <g fill="#555" stroke="#444" stroke-width="0.2">
    <!-- Left side leads -->
    <rect x="46" y="188" width="6" height="2.5" rx="0.4"/>
    <rect x="46" y="195" width="6" height="2.5" rx="0.4"/>
    <rect x="46" y="202" width="6" height="2.5" rx="0.4"/>
    <rect x="46" y="209" width="6" height="2.5" rx="0.4"/>
    <rect x="46" y="216" width="6" height="2.5" rx="0.4"/>
    <rect x="46" y="223" width="6" height="2.5" rx="0.4"/>
    <rect x="46" y="230" width="6" height="2.5" rx="0.4"/>
    <rect x="46" y="237" width="6" height="2.5" rx="0.4"/>
    <!-- Right side leads -->
    <rect x="118" y="188" width="6" height="2.5" rx="0.4"/>
    <rect x="118" y="195" width="6" height="2.5" rx="0.4"/>
    <rect x="118" y="202" width="6" height="2.5" rx="0.4"/>
    <rect x="118" y="209" width="6" height="2.5" rx="0.4"/>
    <rect x="118" y="216" width="6" height="2.5" rx="0.4"/>
    <rect x="118" y="223" width="6" height="2.5" rx="0.4"/>
    <rect x="118" y="230" width="6" height="2.5" rx="0.4"/>
    <rect x="118" y="237" width="6" height="2.5" rx="0.4"/>
    <!-- Top side leads -->
    <rect x="57" y="175" width="2.5" height="6" rx="0.4"/>
    <rect x="64" y="175" width="2.5" height="6" rx="0.4"/>
    <rect x="71" y="175" width="2.5" height="6" rx="0.4"/>
    <rect x="78" y="175" width="2.5" height="6" rx="0.4"/>
    <rect x="85" y="175" width="2.5" height="6" rx="0.4"/>
    <rect x="92" y="175" width="2.5" height="6" rx="0.4"/>
    <rect x="99" y="175" width="2.5" height="6" rx="0.4"/>
    <rect x="106" y="175" width="2.5" height="6" rx="0.4"/>
    <!-- Bottom side leads -->
    <rect x="57" y="249" width="2.5" height="6" rx="0.4"/>
    <rect x="64" y="249" width="2.5" height="6" rx="0.4"/>
    <rect x="71" y="249" width="2.5" height="6" rx="0.4"/>
    <rect x="78" y="249" width="2.5" height="6" rx="0.4"/>
    <rect x="85" y="249" width="2.5" height="6" rx="0.4"/>
    <rect x="92" y="249" width="2.5" height="6" rx="0.4"/>
    <rect x="99" y="249" width="2.5" height="6" rx="0.4"/>
    <rect x="106" y="249" width="2.5" height="6" rx="0.4"/>
  </g>
  <!-- Orientation dot (pin 1 indicator) -->
  <circle cx="56" cy="186" r="2.2" fill="#444"/>
  <!-- Chip label -->
  <text x="85" y="210" font-size="6" fill="#3d3f38" text-anchor="middle" font-family="'Droid Sans',sans-serif" font-weight="bold">RP2-B0</text>
  <text x="85" y="220" font-size="5" fill="#3d3f38" text-anchor="middle" font-family="'Droid Sans',sans-serif">2020/21</text>
  <text x="85" y="230" font-size="4.5" fill="#3d3f38" text-anchor="middle" font-family="'Droid Sans',sans-serif">P64M15.00</text>

  <!-- Crystal oscillator (silver can) -->
  <rect x="55" y="268" width="18" height="8" rx="1.5" fill="#c0c0c0" stroke="#999" stroke-width="0.4"/>
  <line x1="57" y1="272" x2="71" y2="272" stroke="#aaa" stroke-width="0.3"/>

  <!-- Flash memory chip (small SOIC package) -->
  <rect x="97" y="262" width="16" height="10" rx="0.8" fill="#2a2d2e" stroke="#444" stroke-width="0.3"/>
  <circle cx="100" cy="265" r="1" fill="#444"/>
  <!-- Flash chip leads -->
  <g fill="#888">
    <rect x="96" y="264" width="2" height="1.2" rx="0.2"/>
    <rect x="96" y="267" width="2" height="1.2" rx="0.2"/>
    <rect x="96" y="270" width="2" height="1.2" rx="0.2"/>
    <rect x="114" y="264" width="-2" height="1.2" rx="0.2"/>
    <rect x="114" y="267" width="-2" height="1.2" rx="0.2"/>
    <rect x="114" y="270" width="-2" height="1.2" rx="0.2"/>
  </g>

  <!-- Small voltage regulator near top -->
  <rect x="115" y="85" width="10" height="12" rx="0.5" fill="#2a2d2e"/>

  <!-- Board branding text (rotated, matching wokwi-docs reference) -->
  <text transform="rotate(-90 24 340)" x="24" y="340" font-size="7" fill="#fff" font-family="'Droid Sans',sans-serif" letter-spacing="1">Raspberry Pi Pico</text>
  <!-- Small copyright -->
  <text transform="rotate(-90 34 310)" x="34" y="310" font-size="4.5" fill="#fff" font-family="'Droid Sans',sans-serif" opacity="0.7">© 2020</text>

  <!-- Pin number labels (matching wokwi-docs: "1" near pin 1, etc.) -->
  <text x="16" y="33" font-size="5" fill="#fff" font-family="'Droid Sans',sans-serif">1</text>
  <text x="152" y="33" font-size="5" fill="#fff" font-family="'Droid Sans',sans-serif" text-anchor="end">40</text>

  <!-- Castellated half-circle pads (left side) -->
  ${leftPads}

  <!-- Castellated half-circle pads (right side) -->
  ${rightPads}

  <!-- Pin labels (left side) -->
  ${leftLabels}

  <!-- Pin labels (right side) -->
  ${rightLabels}

  <!-- Debug header (SWD) at bottom center -->
  <g>
    <text x="75" y="394" font-size="4" fill="#c8e6c9" text-anchor="middle" font-family="'Droid Sans',sans-serif">DEBUG</text>
    <circle cx="62" cy="400" r="3.2" fill="#ffdc8e" stroke="#8B6914" stroke-width="0.5"/>
    <circle cx="72" cy="400" r="3.2" fill="#333" stroke="#8B6914" stroke-width="0.5"/>
    <circle cx="82" cy="400" r="3.2" fill="#ffdc8e" stroke="#8B6914" stroke-width="0.5"/>
    <!-- SWD labels -->
    <text x="62" y="408" font-size="3.5" fill="#c8e6c9" text-anchor="middle" font-family="'Droid Sans',sans-serif">CLK</text>
    <text x="72" y="408" font-size="3.5" fill="#c8e6c9" text-anchor="middle" font-family="'Droid Sans',sans-serif">GND</text>
    <text x="82" y="408" font-size="3.5" fill="#c8e6c9" text-anchor="middle" font-family="'Droid Sans',sans-serif">DIO</text>
  </g>

  <!-- Capacitors / discrete components (small gold rectangles) -->
  <rect x="42" y="94" width="6" height="3" rx="0.5" fill="#9a916c"/>
  <rect x="42" y="102" width="6" height="3" rx="0.5" fill="#9a916c"/>
  <rect x="122" y="380" width="6" height="3" rx="0.5" fill="#9a916c"/>
</svg>`;
}

// ────────────────────── Custom Element ──────────────────────
const PI_PICO_SVG = buildSvg();

const PiPicoElementBase =
    typeof globalThis !== 'undefined' && 'HTMLElement' in globalThis
        ? (globalThis.HTMLElement as typeof HTMLElement)
        : (class {} as typeof HTMLElement);

class PiPicoElement extends PiPicoElementBase {
    readonly pinInfo: ElementPin[] = ALL_PINS;
    private _ledBuiltIn = false;
    private _ledBody: SVGCircleElement | null = null;
    private _ledGlow: SVGCircleElement | null = null;

    static get observedAttributes() { return ['led']; }

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = `<style>:host{display:inline-block;line-height:0}</style>${PI_PICO_SVG}`;
        // Cache references to the LED SVG circles for fast updates
        const svg = shadow.querySelector('svg');
        if (svg) {
            const circles = svg.querySelectorAll('circle');
            // The LED body circle (fill="#1a3a1a") at cx=106, cy=57, r=3.5
            // The LED glow circle (fill="url(#led-glow)") at cx=106, cy=57, r=6
            for (const c of circles) {
                if (c.getAttribute('r') === '3.5' && c.getAttribute('cx') === '106' && c.getAttribute('cy') === '57') {
                    this._ledBody = c;
                }
                if (c.getAttribute('r') === '6' && c.getAttribute('cx') === '106' && c.getAttribute('cy') === '57') {
                    this._ledGlow = c;
                }
            }
        }
    }

    get ledBuiltIn() { return this._ledBuiltIn; }
    set ledBuiltIn(v: boolean) {
        const on = Boolean(v);
        if (on === this._ledBuiltIn) return;
        this._ledBuiltIn = on;
        this._updateLed();
    }

    attributeChangedCallback(name: string, _oldVal: string | null, newVal: string | null) {
        if (name === 'led') {
            this.ledBuiltIn = newVal === 'true' || newVal === '1';
        }
    }

    private _updateLed() {
        if (this._ledBody) {
            this._ledBody.setAttribute('fill', this._ledBuiltIn ? '#4cff4c' : '#1a3a1a');
        }
        if (this._ledGlow) {
            this._ledGlow.setAttribute('opacity', this._ledBuiltIn ? '0.9' : '0.3');
        }
    }
}

// Only register if not already defined (SSR safety)
if (typeof window !== 'undefined' && typeof customElements !== 'undefined' && !customElements.get('wokwi-pi-pico')) {
    customElements.define('wokwi-pi-pico', PiPicoElement);
}

export { PiPicoElement };
