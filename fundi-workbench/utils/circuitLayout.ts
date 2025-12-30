/**
 * Circuit Layout Utilities
 *
 * Provides bounding-box collision detection and non-overlapping position
 * finding for circuit components on the canvas.
 */

/**
 * Bounding box rectangle interface
 */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Component sizes for all Wokwi parts.
 * These dimensions are approximate and may need fine-tuning based on actual render sizes.
 */
export const COMPONENT_SIZES: Record<string, { width: number; height: number }> = {
  // Microcontrollers
  'wokwi-arduino-uno': { width: 280, height: 200 },
  'wokwi-arduino-nano': { width: 200, height: 80 },
  'wokwi-arduino-mega': { width: 400, height: 200 },
  'wokwi-esp32-devkit-v1': { width: 140, height: 300 },
  'wokwi-pi-pico': { width: 200, height: 100 },
  'wokwi-attiny85': { width: 50, height: 80 },
  
  // Basic components
  'wokwi-led': { width: 30, height: 50 },
  'wokwi-resistor': { width: 60, height: 20 },
  'wokwi-pushbutton': { width: 50, height: 50 },
  'wokwi-pushbutton-6mm': { width: 40, height: 40 },
  'wokwi-slide-switch': { width: 40, height: 30 },
  'wokwi-dip-switch-8': { width: 80, height: 40 },
  
  // Input/Output
  'wokwi-potentiometer': { width: 50, height: 50 },
  'wokwi-buzzer': { width: 50, height: 50 },
  'wokwi-photoresistor-sensor': { width: 40, height: 40 },
  'wokwi-pir-motion-sensor': { width: 60, height: 60 },
  'wokwi-servo': { width: 60, height: 50 },
  'wokwi-stepper-motor': { width: 80, height: 80 },
  
  // Displays
  'wokwi-lcd1602': { width: 180, height: 100 },
  'wokwi-lcd2004': { width: 200, height: 120 },
  'wokwi-ssd1306': { width: 80, height: 50 },
  'wokwi-max7219-matrix': { width: 100, height: 100 },
  'wokwi-7segment': { width: 60, height: 80 },
  'wokwi-tm1637-7segment': { width: 120, height: 80 },
  
  // Sensors
  'wokwi-dht22': { width: 50, height: 60 },
  'wokwi-ds1307': { width: 60, height: 50 },
  'wokwi-hc-sr04': { width: 80, height: 40 },
  'wokwi-ir-receiver': { width: 40, height: 50 },
  'wokwi-ir-remote': { width: 60, height: 120 },
  'wokwi-mpu6050': { width: 50, height: 50 },
  'wokwi-hx711': { width: 60, height: 50 },
  
  // Communication
  'wokwi-neopixel': { width: 30, height: 30 },
  'wokwi-led-ring': { width: 100, height: 100 },
  'wokwi-membrane-keypad': { width: 100, height: 120 },
  
  // Power
  'wokwi-vcc': { width: 30, height: 30 },
  'wokwi-gnd': { width: 30, height: 30 },
  
  // Misc
  'wokwi-breadboard': { width: 600, height: 200 },
  'wokwi-breadboard-mini': { width: 200, height: 100 },
  'wokwi-relay-module': { width: 80, height: 60 },
  'wokwi-rotary-encoder': { width: 50, height: 50 },
};

/**
 * Default component size for unknown component types
 */
const DEFAULT_COMPONENT_SIZE = { width: 60, height: 60 };

/**
 * Grid size for position snapping
 */
const GRID_SIZE = 10;

/**
 * Padding between components
 */
const COMPONENT_PADDING = 20;

/**
 * Get the size of a component by its type
 */
export function getComponentSize(partType: string): { width: number; height: number } {
  // Try exact match first
  if (COMPONENT_SIZES[partType]) {
    return COMPONENT_SIZES[partType];
  }
  
  // Try with wokwi- prefix
  const prefixedType = partType.startsWith('wokwi-') ? partType : `wokwi-${partType}`;
  if (COMPONENT_SIZES[prefixedType]) {
    return COMPONENT_SIZES[prefixedType];
  }
  
  // Return default size for unknown components
  return DEFAULT_COMPONENT_SIZE;
}

/**
 * Convert a component position and type to a bounding rectangle
 */
export function getComponentBounds(
  x: number,
  y: number,
  partType: string
): Rect {
  const size = getComponentSize(partType);
  return {
    x,
    y,
    width: size.width,
    height: size.height,
  };
}

/**
 * Check if two rectangles overlap
 */
export function rectsOverlap(a: Rect, b: Rect, padding: number = COMPONENT_PADDING): boolean {
  // Add padding to create a buffer zone between components
  return !(
    a.x + a.width + padding <= b.x ||
    b.x + b.width + padding <= a.x ||
    a.y + a.height + padding <= b.y ||
    b.y + b.height + padding <= a.y
  );
}

/**
 * Check if a position overlaps with any occupied rectangles
 */
export function positionOverlaps(
  x: number,
  y: number,
  partType: string,
  occupied: Rect[],
  padding: number = COMPONENT_PADDING
): boolean {
  const newBounds = getComponentBounds(x, y, partType);
  
  for (const rect of occupied) {
    if (rectsOverlap(newBounds, rect, padding)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Snap a position to the grid
 */
export function snapToGrid(value: number, gridSize: number = GRID_SIZE): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Find a non-overlapping position for a new component.
 * Uses a spiral search pattern starting from the preferred position.
 *
 * @param preferredX - Preferred X position
 * @param preferredY - Preferred Y position
 * @param partType - The type of component being placed
 * @param occupied - Array of already occupied rectangles
 * @param maxSearchRadius - Maximum search radius (default: 2000)
 * @returns The found position { x, y }
 */
export function findNonOverlappingPosition(
  preferredX: number,
  preferredY: number,
  partType: string,
  occupied: Rect[],
  maxSearchRadius: number = 2000
): { x: number; y: number } {
  // Snap preferred position to grid
  let x = snapToGrid(preferredX);
  let y = snapToGrid(preferredY);
  
  // If no overlaps, return the preferred position
  if (!positionOverlaps(x, y, partType, occupied)) {
    return { x, y };
  }
  
  const size = getComponentSize(partType);
  const stepX = snapToGrid(size.width + COMPONENT_PADDING);
  const stepY = snapToGrid(size.height + COMPONENT_PADDING);
  
  // Spiral search pattern
  // Direction order: right, down, left, up
  const directions = [
    { dx: stepX, dy: 0 },      // right
    { dx: 0, dy: stepY },      // down
    { dx: -stepX, dy: 0 },     // left
    { dx: 0, dy: -stepY },     // up
  ];
  
  let dirIndex = 0;
  let stepsInDirection = 1;
  let stepsRemaining = 1;
  let turnCount = 0;
  
  let currentX = x;
  let currentY = y;
  let totalSteps = 0;
  const maxSteps = Math.ceil((maxSearchRadius * 2) / Math.min(stepX, stepY));
  
  while (totalSteps < maxSteps) {
    // Move in current direction
    currentX += directions[dirIndex].dx;
    currentY += directions[dirIndex].dy;
    totalSteps++;
    
    // Keep position reasonable (not negative for canvas)
    const testX = Math.max(0, currentX);
    const testY = Math.max(0, currentY);
    
    // Check if this position is free
    if (!positionOverlaps(testX, testY, partType, occupied)) {
      return { x: testX, y: testY };
    }
    
    stepsRemaining--;
    
    // Change direction when steps exhausted
    if (stepsRemaining === 0) {
      dirIndex = (dirIndex + 1) % 4;
      turnCount++;
      
      // Increase steps every 2 turns (completing a full side of spiral)
      if (turnCount % 2 === 0) {
        stepsInDirection++;
      }
      
      stepsRemaining = stepsInDirection;
    }
  }
  
  // Fallback: place at a far position if spiral search fails
  const fallbackX = snapToGrid(preferredX + maxSearchRadius);
  const fallbackY = snapToGrid(preferredY);
  return { x: fallbackX, y: fallbackY };
}

/**
 * Calculate positions for multiple components to avoid overlaps.
 * Useful for batch placement of AI-generated circuits.
 *
 * @param components - Array of { type, preferredX, preferredY }
 * @param existingOccupied - Already occupied rectangles on canvas
 * @returns Array of positioned components with { type, x, y }
 */
export function layoutComponents(
  components: Array<{ type: string; preferredX: number; preferredY: number }>,
  existingOccupied: Rect[] = []
): Array<{ type: string; x: number; y: number }> {
  const occupied = [...existingOccupied];
  const result: Array<{ type: string; x: number; y: number }> = [];
  
  for (const component of components) {
    const position = findNonOverlappingPosition(
      component.preferredX,
      component.preferredY,
      component.type,
      occupied
    );
    
    // Add new component bounds to occupied list
    const bounds = getComponentBounds(position.x, position.y, component.type);
    occupied.push(bounds);
    
    result.push({
      type: component.type,
      x: position.x,
      y: position.y,
    });
  }
  
  return result;
}

/**
 * Convert existing circuit parts to occupied rectangles for collision detection.
 */
export function partsToOccupiedRects(
  parts: Array<{ type: string; position: { x: number; y: number } }>
): Rect[] {
  return parts.map((part) => getComponentBounds(part.position.x, part.position.y, part.type));
}
