import type {
  SignalLevel,
  SimulationEngine,
  SimulationEngineConfig,
  SimulationEventHandlers,
} from '../SimulationEngine'

export class Esp32EngineAdapter implements SimulationEngine {
  private handlers: SimulationEventHandlers = {}
  private pinStates = new Map<string, SignalLevel>()
  private sessionId: string | null = null
  private socket: WebSocket | null = null
  private baseUrl = ''
  private running = false

  async init(config: SimulationEngineConfig): Promise<void> {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
    this.baseUrl = baseUrl

    const res = await fetch(`${baseUrl}/api/v1/simulate/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        board: config.board,
        artifact_type: config.artifact.artifactType,
        artifact_payload: config.artifact.artifactPayload,
        simulation_hints: config.artifact.simulationHints ?? {},
      }),
    })

    const data = (await res.json()) as { id?: string }
    if (!res.ok || !data?.id) {
      throw new Error('Failed to create ESP32 simulation session')
    }

    this.sessionId = data.id
  }

  async start(): Promise<void> {
    if (!this.sessionId) return

    await fetch(`${this.baseUrl}/api/v1/simulate/session/${this.sessionId}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    const wsUrl = `${this.baseUrl.replace(/^http/, 'ws')}/api/v1/simulate/session/${this.sessionId}/events`
    this.socket?.close()
    this.socket = new WebSocket(wsUrl)
    this.socket.onmessage = (event) => {
      const payload = JSON.parse(event.data) as { type?: string; line?: string; pinId?: string; level?: SignalLevel }
      if (payload.type === 'serial' && payload.line) {
        this.handlers.onSerial?.(payload.line)
      }
      if (payload.type === 'pin-change' && payload.pinId && typeof payload.level === 'number') {
        this.pinStates.set(payload.pinId, payload.level)
        this.handlers.onPinChange?.(payload.pinId, payload.level)
      }
    }
    this.running = true
  }

  async stop(): Promise<void> {
    if (this.sessionId) {
      await fetch(`${this.baseUrl}/api/v1/simulate/session/${this.sessionId}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => undefined)
    }
    this.running = false
    this.socket?.close()
    this.socket = null
  }

  async reset(): Promise<void> {
    if (!this.sessionId) return
    await fetch(`${this.baseUrl}/api/v1/simulate/session/${this.sessionId}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
  }

  readPin(pinId: string): SignalLevel {
    return this.pinStates.get(pinId) ?? 0
  }

  writePin(pinId: string, level: SignalLevel): void {
    this.pinStates.set(pinId, level)
  }

  setHandlers(handlers: SimulationEventHandlers): void {
    this.handlers = handlers
  }

  getDiagnostics() {
    return {
      engine: 'esp32-backend-session',
      running: this.running,
    }
  }
}
