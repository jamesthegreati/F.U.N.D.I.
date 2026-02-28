export type SignalLevel = 0 | 1

export type SimulationArtifact = {
  artifactType: string
  artifactPayload: string
  simulationHints?: Record<string, unknown> | null
}

export type SimulationEngineConfig = {
  board: string
  artifact: SimulationArtifact
}

export type SimulationEngineDiagnostics = {
  engine: string
  running: boolean
  droppedEvents?: number
}

export type SimulationEventHandlers = {
  onSerial?: (line: string) => void
  onPinChange?: (pinId: string, level: SignalLevel) => void
}

export interface SimulationEngine {
  init(config: SimulationEngineConfig): Promise<void>
  start(): Promise<void>
  stop(): Promise<void>
  reset(): Promise<void>
  readPin(pinId: string): SignalLevel
  writePin(pinId: string, level: SignalLevel): void
  setHandlers(handlers: SimulationEventHandlers): void
  getDiagnostics(): SimulationEngineDiagnostics
}
