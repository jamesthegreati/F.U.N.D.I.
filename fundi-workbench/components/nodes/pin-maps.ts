// Pin coordinates from official wokwi-elements source (arduino-uno-element.ts)
// These are SVG viewBox coordinates that scale with the element
// viewBox: "-4 0 72.58 53.34" (mm units, but renders proportionally)

export interface ArduinoPin {
  id: string
  x: number // SVG x coordinate
  y: number // SVG y coordinate
  type: 'source' | 'target'
  row: 'top' | 'bottom'
}

// Exact coordinates from wokwi-elements pinInfo
// Top row: y = 9 (digital pins)
// Bottom row: y = 191.5 (power + analog pins)
// Note: Wokwi uses a scaled coordinate system where the SVG viewBox
// maps to approximately 274x200 rendered pixels

export const ARDUINO_UNO_PINS: ArduinoPin[] = [
  // Top row - Digital pins (right to left as viewed)
  { id: '0', x: 255.5, y: 9, type: 'source', row: 'top' },
  { id: '1', x: 246, y: 9, type: 'source', row: 'top' },
  { id: '2', x: 236.5, y: 9, type: 'source', row: 'top' },
  { id: '3', x: 227, y: 9, type: 'source', row: 'top' },
  { id: '4', x: 217.5, y: 9, type: 'source', row: 'top' },
  { id: '5', x: 208, y: 9, type: 'source', row: 'top' },
  { id: '6', x: 198.5, y: 9, type: 'source', row: 'top' },
  { id: '7', x: 189, y: 9, type: 'source', row: 'top' },
  { id: '8', x: 173, y: 9, type: 'source', row: 'top' },
  { id: '9', x: 163, y: 9, type: 'source', row: 'top' },
  { id: '10', x: 153.5, y: 9, type: 'source', row: 'top' },
  { id: '11', x: 144, y: 9, type: 'source', row: 'top' },
  { id: '12', x: 134.5, y: 9, type: 'source', row: 'top' },
  { id: '13', x: 125, y: 9, type: 'source', row: 'top' },
  { id: 'GND.1', x: 115.5, y: 9, type: 'source', row: 'top' },
  { id: 'AREF', x: 106, y: 9, type: 'source', row: 'top' },
  { id: 'A4.2', x: 97, y: 9, type: 'source', row: 'top' },  // SDA
  { id: 'A5.2', x: 87, y: 9, type: 'source', row: 'top' },  // SCL

  // Bottom row - Power and Analog pins (left to right as viewed)
  { id: 'IOREF', x: 131, y: 191.5, type: 'source', row: 'bottom' },
  { id: 'RESET', x: 140.5, y: 191.5, type: 'source', row: 'bottom' },
  { id: '3.3V', x: 150, y: 191.5, type: 'source', row: 'bottom' },
  { id: '5V', x: 160, y: 191.5, type: 'source', row: 'bottom' },
  { id: 'GND.2', x: 169.5, y: 191.5, type: 'source', row: 'bottom' },
  { id: 'GND.3', x: 179, y: 191.5, type: 'source', row: 'bottom' },
  { id: 'VIN', x: 188.5, y: 191.5, type: 'source', row: 'bottom' },
  { id: 'A0', x: 208, y: 191.5, type: 'source', row: 'bottom' },
  { id: 'A1', x: 217.5, y: 191.5, type: 'source', row: 'bottom' },
  { id: 'A2', x: 227, y: 191.5, type: 'source', row: 'bottom' },
  { id: 'A3', x: 236.5, y: 191.5, type: 'source', row: 'bottom' },
  { id: 'A4', x: 246, y: 191.5, type: 'source', row: 'bottom' },
  { id: 'A5', x: 255.5, y: 191.5, type: 'source', row: 'bottom' },
]

// The wokwi-arduino-uno element renders with these base dimensions
// The SVG viewBox is "-4 0 72.58 53.34" which maps to pixel coords
// To convert pinInfo coords to percentage of element:
// - Element width ≈ 274px (72.58mm at ~3.77px/mm)
// - Element height ≈ 200px (53.34mm at ~3.77px/mm)
// - But pinInfo uses a different scale internally

// Scale factors to convert pinInfo coordinates to element percentages
export const WOKWI_SCALE = {
  // The pinInfo x values range from ~87 to ~255.5
  // These map to approximately the right 2/3 of the board
  xOffset: 4, // viewBox starts at -4
  yOffset: 0,
  // The element renders at approximately 274x200 pixels
  elementWidth: 274,
  elementHeight: 200,
  // pinInfo coordinates are in a scaled system
  // where x goes from ~87-255 and y is either 9 or 191.5
  pinInfoMaxX: 259.5,
  pinInfoMaxY: 200,
}
