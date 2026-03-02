import type {
  ValidationIssue,
  ValidationResult,
  ValidationContext,
  ValidationOptions,
  PowerBudgetReport,
  ComponentPowerUsage,
} from './types';
import {
  getComponentSpec,
  getLEDSpec,
  is5VBoard,
  is5VTolerant,
  getTypicalVoltage,
  getMaxVoltage,
  getTypicalCurrent,
} from './componentSpecs';
import { buildAdjacency, findConnectedBoardPinId } from '../simulation/net/NetGraph';

/**
 * Main electrical circuit validation engine
 * Validates circuits for electrical safety and correctness
 */

let issueIdCounter = 0;

function generateIssueId(): string {
  return `issue-${Date.now()}-${issueIdCounter++}`;
}

export class ElectricalValidator {
  /**
   * Validate an entire circuit
   */
  validateCircuit(
    parts: Array<{ id: string; type: string; attrs?: Record<string, unknown>; position: { x: number; y: number } }>,
    connections: Array<{ source: string; target: string; color: string }>,
    options?: ValidationOptions
  ): ValidationResult {
    const startTime = Date.now();
    const issues: ValidationIssue[] = [];

    // Build adjacency graph for net analysis
    const connectionFormat = connections.map(c => ({
      from: this.parsePin(c.source),
      to: this.parsePin(c.target),
    }));
    const adjacency = buildAdjacency(connectionFormat);

    const context: ValidationContext = {
      parts,
      connections,
      adjacency,
      boardType: this.findBoardType(parts),
    };

    // Run validation rules
    if (!options?.skipWarnings || true) {
      issues.push(...this.validateLEDCurrentLimiting(context));
      issues.push(...this.validateVoltageLevels(context));
      issues.push(...this.validateShortCircuits(context));
      issues.push(...this.validateI2CPullups(context));
      issues.push(...this.validateReversePolarity(context));
      issues.push(...this.validateFloatingPins(context));
    }

    // Power budget analysis
    const powerConsumption = this.analyzePowerBudget(context);
    if (powerConsumption.exceeded) {
      issues.push({
        id: generateIssueId(),
        severity: 'error',
        category: 'power_budget',
        message: `Power budget exceeded: ${powerConsumption.total5V.toFixed(0)}mA / ${powerConsumption.budget5V}mA on 5V rail`,
        explanation: `The total current draw exceeds the power supply capacity. USB ports typically provide 500mA max. Exceeding this may cause brownouts, unexpected resets, or damage to the USB port.`,
        suggestion: `Reduce power consumption by using fewer high-power components, or use an external power supply (7-12V DC barrel jack, 2A+ recommended).`,
        affectedParts: powerConsumption.breakdown.map(b => b.partId),
      });
    }

    // Generate circuit hash for caching
    const circuitHash = this.hashCircuit(parts, connections);

    return {
      issues,
      timestamp: Date.now(),
      circuitHash,
      powerConsumption,
    };
  }

  /**
   * Validate LED current limiting resistors
   */
  private validateLEDCurrentLimiting(context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const { parts, adjacency, boardType } = context;

    if (!boardType) return issues;

    const leds = parts.filter(p => p.type === 'wokwi-led' || p.type === 'wokwi-rgb-led');
    const boardSpec = getComponentSpec(boardType);
    if (!boardSpec) return issues;

    for (const led of leds) {
      // Find LED anode and cathode connections
      const anodeKey = `${led.id}:A`;
      const cathodeKey = `${led.id}:C`;

      // Check if LED is connected to GPIO pin
      const anodeGPIO = this.findConnectedGPIOPin(anodeKey, adjacency, boardType);
      const cathodeGPIO = this.findConnectedGPIOPin(cathodeKey, adjacency, boardType);

      if (!anodeGPIO && !cathodeGPIO) continue; // Not GPIO-driven

      // Check for resistor in series
      const resistorsInPath = this.findResistorsInNet(anodeKey, adjacency);

      if (resistorsInPath.length === 0) {
        const ledSpec = getLEDSpec(led.attrs?.color as string);

        issues.push({
          id: generateIssueId(),
          severity: 'error',
          category: 'missing_current_limiting',
          message: `LED "${led.id}" missing current-limiting resistor`,
          explanation: `This LED is connected directly to a GPIO pin without a resistor. Without current limiting, the LED will draw excessive current (potentially hundreds of mA), exceeding the GPIO pin's ${boardSpec.ioCurrentSource?.max}mA limit. This will likely damage the microcontroller pin and may destroy the LED.`,
          suggestion: `Add a 220Ω to 1kΩ resistor in series with the LED to limit current to 20mA or less. For a typical setup, 220Ω is recommended.`,
          calculation: `R = (Vcc - Vf) / I_target = (${boardSpec.vccOperating?.typical}V - ${ledSpec.forwardVoltage}V) / 0.020A ≈ ${Math.ceil((boardSpec.vccOperating!.typical - ledSpec.forwardVoltage!) / 0.020)}Ω`,
          affectedParts: [led.id],
          learnMoreUrl: 'https://learn.sparkfun.com/tutorials/resistors/example-applications',
        });
      } else {
        // Validate resistor value
        const resistor = resistorsInPath[0];
        const resistance = parseFloat(resistor.attrs?.value as string || '0');

        if (resistance === 0) {
          issues.push({
            id: generateIssueId(),
            severity: 'warning',
            category: 'missing_current_limiting',
            message: `LED "${led.id}" resistor has no value specified`,
            suggestion: `Set the resistor value to 220Ω or 330Ω for typical LED operation.`,
            affectedParts: [led.id, resistor.id],
          });
          continue;
        }

        const ledSpec = getLEDSpec(led.attrs?.color as string);
        const current = (boardSpec.vccOperating!.typical - ledSpec.forwardVoltage!) / resistance;
        const currentMA = current * 1000;

        if (currentMA > boardSpec.ioCurrentSource!.max) {
          issues.push({
            id: generateIssueId(),
            severity: 'error',
            category: 'overcurrent',
            message: `LED "${led.id}" current (${currentMA.toFixed(1)}mA) exceeds GPIO limit (${boardSpec.ioCurrentSource!.max}mA)`,
            explanation: `The current-limiting resistor value is too low, allowing ${currentMA.toFixed(1)}mA to flow through the GPIO pin, which exceeds its ${boardSpec.ioCurrentSource!.max}mA maximum rating.`,
            suggestion: `Increase resistor value to at least ${Math.ceil((boardSpec.vccOperating!.typical - ledSpec.forwardVoltage!) / (boardSpec.ioCurrentSource!.max / 1000))}Ω to stay within safe limits.`,
            calculation: `I = (Vcc - Vf) / R = (${boardSpec.vccOperating!.typical}V - ${ledSpec.forwardVoltage}V) / ${resistance}Ω = ${currentMA.toFixed(1)}mA`,
            affectedParts: [led.id, resistor.id],
          });
        } else if (currentMA < (ledSpec.forwardCurrent?.min || 2)) {
          issues.push({
            id: generateIssueId(),
            severity: 'warning',
            category: 'overcurrent',
            message: `LED "${led.id}" current (${currentMA.toFixed(1)}mA) is very low`,
            explanation: `The LED will be extremely dim or may not light up at all. Typical LEDs need 10-20mA for normal brightness.`,
            suggestion: `Reduce resistor value to ${Math.floor((boardSpec.vccOperating!.typical - ledSpec.forwardVoltage!) / 0.015)}Ω for better brightness (15mA).`,
            affectedParts: [led.id, resistor.id],
          });
        }
      }
    }

    return issues;
  }

  /**
   * Validate voltage level compatibility between components
   */
  private validateVoltageLevels(context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const { parts, adjacency, boardType } = context;

    if (!boardType) return issues;

    // Check for 3.3V devices connected to 5V boards
    for (const part of parts) {
      const spec = getComponentSpec(part.type);
      if (!spec || !spec.vccOperating) continue;

      // Check if component requires 3.3V but board provides 5V
      if (spec.vccOperating.max < 5.0 && is5VBoard(boardType)) {
        const vccKey = `${part.id}:VCC`;
        const powerNet = this.inferNetVoltage(vccKey, adjacency, boardType);

        if (powerNet && powerNet > spec.vccOperating.max) {
          issues.push({
            id: generateIssueId(),
            severity: 'critical',
            category: 'overvoltage',
            message: `Component "${part.id}" (${part.type}) will be damaged by ${powerNet}V`,
            explanation: `This component is rated for maximum ${spec.vccOperating.max}V but is connected to a ${powerNet}V power rail. This WILL damage or destroy the component immediately when powered on.`,
            suggestion: spec.vccOperating.typical === 3.3
              ? `Connect VCC to the board's 3.3V pin instead of 5V, or use a voltage regulator (AMS1117-3.3 or LD1117V33) to step down to 3.3V.`
              : `Use a voltage regulator appropriate for this component's voltage requirement.`,
            affectedParts: [part.id],
          });
        }
      }

      // Check for 5V-only devices (like HC-SR04)
      if (spec.requires5V && !is5VBoard(boardType)) {
        issues.push({
          id: generateIssueId(),
          severity: 'error',
          category: 'voltage_mismatch',
          message: `Component "${part.id}" (${part.type}) requires 5V but board provides 3.3V`,
          explanation: `This component will not function properly at 3.3V. It specifically requires 5V power to operate.`,
          suggestion: `Use a 5V boost converter or switch to a 5V-compatible microcontroller board.`,
          affectedParts: [part.id],
        });
      }
    }

    // Check GPIO voltage level mismatches
    if (!is5VTolerant(boardType)) {
      // Board is 3.3V and NOT 5V tolerant (e.g., ESP32, Pico)
      const boardSpec = getComponentSpec(boardType);

      // Find connections where 5V components connect to 3.3V GPIO
      for (const part of parts) {
        if (is5VBoard(part.type)) continue; // Skip checking against itself

        const partSpec = getComponentSpec(part.type);
        if (!partSpec) continue;

        // Check if this part outputs 5V signals
        if (partSpec.vccOperating?.typical === 5.0) {
          // Check all connections from this part to board GPIO
          const partPins = this.getPartPinKeys(part.id, adjacency);

          for (const pinKey of partPins) {
            const connectedBoardPin = this.findConnectedGPIOPin(pinKey, adjacency, boardType);
            if (connectedBoardPin) {
              issues.push({
                id: generateIssueId(),
                severity: 'critical',
                category: 'overvoltage',
                message: `5V signal from "${part.id}" connected to 3.3V GPIO pin ${connectedBoardPin}`,
                explanation: `The ${boardType} GPIO pins can only tolerate ${boardSpec?.ioVoltageMax}V maximum. A 5V signal will damage the GPIO pin immediately.`,
                suggestion: `Use a logic level converter (BSS138 bidirectional or TXB0104 for multiple signals) to safely interface between 5V and 3.3V devices.`,
                affectedParts: [part.id],
              });
            }
          }
        }
      }
    }

    return issues;
  }

  /**
   * Detect short circuits (direct VCC to GND connections)
   */
  private validateShortCircuits(context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const { adjacency, boardType } = context;

    if (!boardType) return issues;

    // Find all power and ground nets
    const powerPins = ['5V', 'VCC', '3.3V', '3V3', 'VIN'];
    const groundPins = ['GND', 'GROUND'];

    for (const powerPin of powerPins) {
      const powerKey = `${boardType}:${powerPin}`;

      for (const groundPin of groundPins) {
        const groundKey = `${boardType}:${groundPin}`;

        // Check if power and ground are in the same net
        if (this.areConnected(powerKey, groundKey, adjacency)) {
          // Find components in the path
          const pathComponents = this.findComponentsInPath(powerKey, groundKey, adjacency);

          // Check if there's meaningful resistance in the path
          const hasResistor = pathComponents.some(c => c.type === 'wokwi-resistor');
          const hasSensor = pathComponents.some(c =>
            !c.type.includes('led') &&
            !c.type.includes('breadboard') &&
            c.type !== 'wokwi-resistor'
          );

          if (!hasResistor && !hasSensor) {
            issues.push({
              id: generateIssueId(),
              severity: 'critical',
              category: 'short_circuit',
              message: `SHORT CIRCUIT: ${powerPin} directly connected to ${groundPin}`,
              explanation: `Power and ground are directly connected without any load or current-limiting component. This creates a short circuit that will draw unlimited current, potentially damaging the power supply, USB port, battery, or microcontroller. The circuit will not function and poses a safety hazard.`,
              suggestion: `Carefully review all connections. Ensure power rails (VCC/5V) are not accidentally connected to ground rails (GND). Check for wiring errors on breadboard or loose wires.`,
              affectedParts: pathComponents.map(c => c.id),
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * Validate I2C pull-up resistors
   */
  private validateI2CPullups(context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const { parts, adjacency } = context;

    // Find I2C devices
    const i2cDevices = parts.filter(p => {
      const spec = getComponentSpec(p.type);
      return spec?.requiresPullup?.pins.includes('SDA') || spec?.requiresPullup?.pins.includes('SCL');
    });

    if (i2cDevices.length === 0) return issues;

    // Check for pull-up resistors on SDA and SCL
    const sdaMissing = !this.hasI2CPullup('SDA', adjacency, parts);
    const sclMissing = !this.hasI2CPullup('SCL', adjacency, parts);

    if (sdaMissing || sclMissing) {
      const missingPins = [sdaMissing && 'SDA', sclMissing && 'SCL'].filter(Boolean);

      issues.push({
        id: generateIssueId(),
        severity: 'warning',
        category: 'missing_pullup',
        message: `I2C bus missing pull-up resistors on ${missingPins.join(' and ')}`,
        explanation: `I2C is an open-drain bus protocol that requires pull-up resistors (typically 4.7kΩ) on both SDA and SCL lines to VCC. Without these resistors, I2C communication will be unreliable or completely non-functional. The bus lines will float and fail to reach logic HIGH levels.`,
        suggestion: `Add 4.7kΩ resistors from ${missingPins.join(' and ')} to VCC (or 3.3V for 3.3V devices). Some I2C modules include built-in pull-ups, but it's safer to add external ones.`,
        affectedParts: i2cDevices.map(d => d.id),
        learnMoreUrl: 'https://learn.sparkfun.com/tutorials/i2c',
      });
    }

    return issues;
  }

  /**
   * Detect reverse polarity on polarized components
   */
  private validateReversePolarity(context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    // TODO: Implement polarity checking for electrolytic capacitors, diodes, etc.
    return issues;
  }

  /**
   * Detect floating/unconnected inputs
   */
  private validateFloatingPins(context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    // TODO: Implement floating pin detection for important inputs
    return issues;
  }

  /**
   * Analyze total power consumption
   */
  private analyzePowerBudget(context: ValidationContext): PowerBudgetReport {
    const { parts, boardType } = context;

    let total5V = 0;
    let total3V3 = 0;
    const breakdown: ComponentPowerUsage[] = [];

    for (const part of parts) {
      if (part.type === boardType) continue; // Skip the board itself

      const current = getTypicalCurrent(part.type);
      if (current === 0) continue;

      const voltage = getTypicalVoltage(part.type);
      const power = voltage * current;

      breakdown.push({
        partId: part.id,
        partType: part.type,
        voltage,
        current,
        power,
      });

      if (voltage === 5.0) {
        total5V += current;
      } else if (voltage === 3.3) {
        total3V3 += current;
      }
    }

    const budget5V = 500; // USB 2.0 limit
    const budget3V3 = 50;  // Typical onboard regulator

    return {
      total5V,
      total3V3,
      budget5V,
      budget3V3,
      breakdown,
      exceeded: total5V > budget5V || total3V3 > budget3V3,
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private parsePin(pinStr: string): { partId: string; pinId: string } {
    const [partId, pinId] = pinStr.split(':');
    return { partId, pinId };
  }

  private findBoardType(parts: Array<{ type: string }>): string | undefined {
    return parts.find(p =>
      p.type.includes('arduino') ||
      p.type.includes('esp32') ||
      p.type.includes('pico')
    )?.type;
  }

  private findConnectedGPIOPin(
    pinKey: string,
    adjacency: Map<string, Set<string>>,
    boardType: string
  ): string | null {
    const queue = [pinKey];
    const visited = new Set([pinKey]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const [partId, pinId] = current.split(':');

      // Check if this is a board GPIO pin
      if (partId === boardType && pinId && !['GND', '5V', 'VCC', '3.3V', '3V3', 'VIN', 'AREF'].includes(pinId)) {
        return pinId;
      }

      const neighbors = adjacency.get(current);
      if (!neighbors) continue;

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    return null;
  }

  private findResistorsInNet(
    pinKey: string,
    adjacency: Map<string, Set<string>>
  ): Array<{ id: string; attrs?: Record<string, unknown> }> {
    const resistors: Array<{ id: string; attrs?: Record<string, unknown> }> = [];
    const queue = [pinKey];
    const visited = new Set([pinKey]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const [partId] = current.split(':');

      if (partId.includes('resistor') || partId.includes('wokwi-resistor')) {
        resistors.push({ id: partId });
      }

      const neighbors = adjacency.get(current);
      if (!neighbors) continue;

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    return resistors;
  }

  private inferNetVoltage(
    pinKey: string,
    adjacency: Map<string, Set<string>>,
    boardType: string
  ): number | null {
    const queue = [pinKey];
    const visited = new Set([pinKey]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const [partId, pinId] = current.split(':');

      // Check for power pins
      if (pinId === '5V' || pinId === 'VCC') return 5.0;
      if (pinId === '3.3V' || pinId === '3V3') return 3.3;
      if (pinId === 'VIN') return 7.0;

      const neighbors = adjacency.get(current);
      if (!neighbors) continue;

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    return null;
  }

  private areConnected(
    pin1: string,
    pin2: string,
    adjacency: Map<string, Set<string>>
  ): boolean {
    const queue = [pin1];
    const visited = new Set([pin1]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === pin2) return true;

      const neighbors = adjacency.get(current);
      if (!neighbors) continue;

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    return false;
  }

  private findComponentsInPath(
    start: string,
    end: string,
    adjacency: Map<string, Set<string>>
  ): Array<{ id: string; type: string }> {
    const components: Array<{ id: string; type: string }> = [];
    const queue = [start];
    const visited = new Set([start]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const [partId] = current.split(':');

      if (partId && partId !== start.split(':')[0] && partId !== end.split(':')[0]) {
        components.push({ id: partId, type: 'unknown' });
      }

      if (current === end) break;

      const neighbors = adjacency.get(current);
      if (!neighbors) continue;

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    return components;
  }

  private getPartPinKeys(partId: string, adjacency: Map<string, Set<string>>): string[] {
    const keys: string[] = [];
    for (const key of adjacency.keys()) {
      if (key.startsWith(`${partId}:`)) {
        keys.push(key);
      }
    }
    return keys;
  }

  private hasI2CPullup(
    signal: 'SDA' | 'SCL',
    adjacency: Map<string, Set<string>>,
    parts: Array<{ id: string; type: string }>
  ): boolean {
    // Look for resistor connected between signal line and VCC
    // This is a simplified check - in reality would need more sophisticated net analysis
    for (const part of parts) {
      if (part.type === 'wokwi-resistor') {
        // Check if resistor is in the path
        // TODO: Implement proper pull-up detection
      }
    }
    return false; // Conservative: assume missing
  }

  private hashCircuit(
    parts: Array<{ id: string; type: string }>,
    connections: Array<{ source: string; target: string }>
  ): string {
    const sortedParts = [...parts].sort((a, b) => a.id.localeCompare(b.id));
    const sortedConns = [...connections].sort((a, b) => a.source.localeCompare(b.source));
    const str = JSON.stringify({ parts: sortedParts, connections: sortedConns });

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }
}

// Export singleton instance
export const electricalValidator = new ElectricalValidator();
