/**
 * Type definitions for electrical circuit validation
 */

export type ValidationSeverity = 'critical' | 'error' | 'warning' | 'info';

export type ValidationCategory =
  | 'overvoltage'
  | 'overcurrent'
  | 'short_circuit'
  | 'open_circuit'
  | 'power_budget'
  | 'missing_component'
  | 'voltage_mismatch'
  | 'reverse_polarity'
  | 'missing_pullup'
  | 'missing_current_limiting';

export interface ValidationIssue {
  id: string;                          // Unique ID for React keys
  severity: ValidationSeverity;
  category: ValidationCategory;
  message: string;                     // Short summary (1 line)
  explanation?: string;                // Detailed explanation (2-3 sentences)
  suggestion?: string;                 // Actionable fix
  calculation?: string;                // Math behind the issue
  affectedParts: string[];             // Part IDs with issues
  affectedConnections?: string[];      // Connection IDs with issues
  learnMoreUrl?: string;               // Link to docs/tutorial
}

export interface ValidationResult {
  issues: ValidationIssue[];
  timestamp: number;
  circuitHash: string;                 // Cache key for validation
  powerConsumption?: PowerBudgetReport;
}

export interface PowerBudgetReport {
  total5V: number;                     // mA
  total3V3: number;                    // mA
  budget5V: number;                    // mA (supply capacity)
  budget3V3: number;                   // mA (supply capacity)
  breakdown: ComponentPowerUsage[];
  exceeded: boolean;
}

export interface ComponentPowerUsage {
  partId: string;
  partType: string;
  voltage: number;                     // V
  current: number;                     // mA
  power: number;                       // mW
}

export interface ValidationOptions {
  enableAutoFix?: boolean;
  educationalMode?: boolean;           // Show detailed explanations
  skipWarnings?: boolean;              // Only show errors/critical
  customRules?: ValidationRule[];
}

export interface ValidationRule {
  id: string;
  name: string;
  category: ValidationCategory;
  enabled: boolean;
  validate: (context: ValidationContext) => ValidationIssue[];
}

export interface ValidationContext {
  parts: Array<{ id: string; type: string; attrs?: Record<string, unknown>; position: { x: number; y: number } }>;
  connections: Array<{ source: string; target: string; color: string }>;
  adjacency: Map<string, Set<string>>;
  boardType?: string;
  /** The nanoid part ID of the board (needed because adjacency keys use part IDs, not types) */
  boardPartId?: string;
  /** Map from nanoid part ID → Wokwi part type (e.g. 'wokwi-resistor') */
  partTypeMap: Map<string, string>;
}

// Component electrical specifications
export interface ComponentElectricalSpec {
  // Operating voltage range
  vccOperating?: {
    min: number;                       // V
    typical: number;                   // V
    max: number;                       // V
  };

  // I/O voltage specifications
  ioVoltageMax?: number;               // V (absolute maximum)
  ioVoltageTolerant5V?: boolean;       // Can handle 5V inputs

  // Current specifications
  ioCurrentSource?: {
    typical?: number;                  // mA
    max: number;                       // mA per pin
  };
  ioCurrentSink?: {
    typical?: number;                  // mA
    max: number;                       // mA per pin
  };
  ioCurrentTotal?: {
    max: number;                       // mA all pins combined
  };

  // Current draw from power supply
  currentDraw?: {
    idle?: number;                     // mA
    typical: number;                   // mA
    max: number;                       // mA
    stall?: number;                    // mA (for motors)
  };

  // LED-specific
  forwardVoltage?: number;             // V (typical Vf)
  forwardCurrent?: {
    min?: number;                      // mA
    typical: number;                   // mA
    max: number;                       // mA
  };
  reverseVoltageMax?: number;          // V

  // Resistor-specific
  resistance?: number;                 // Ohms
  powerRating?: {
    typical: number;                   // W
    max: number;                       // W
  };

  // Capacitor-specific
  capacitance?: number;                // F
  voltageRating?: number;              // V DC
  polarized?: boolean;

  // Pull-up/pull-down
  internalPullup?: {
    min?: number;                      // Ohms
    typical: number;                   // Ohms
    max?: number;                      // Ohms
  };

  // Protocol requirements
  requiresPullup?: {
    pins: string[];                    // Which pins need pull-ups
    resistance: { min: number; max: number }; // Ohms
  };

  // Special requirements
  requires5V?: boolean;                // Must be powered by 5V (e.g., HC-SR04)
  requiresCurrentLimiting?: boolean;   // Needs series resistor (e.g., LED)
}

export interface PinElectricalSpec {
  pinId: string;
  type: 'power' | 'ground' | 'gpio' | 'analog' | 'pwm' | 'i2c' | 'spi' | 'uart';
  voltage?: number;                    // V (for power pins)
  maxCurrent?: number;                 // mA (for power pins)
}
