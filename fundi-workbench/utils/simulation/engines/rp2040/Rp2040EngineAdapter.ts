import type {
  SignalLevel,
  SimulationEngine,
  SimulationEngineConfig,
  SimulationEventHandlers,
} from '../SimulationEngine'

export class Rp2040EngineAdapter implements SimulationEngine {
  private worker: Worker | null = null
  private handlers: SimulationEventHandlers = {}
  private pinStates = new Map<string, SignalLevel>()
  private running = false

  async init(_config: SimulationEngineConfig): Promise<void> {
    this.worker?.terminate()
    this.worker = new Worker(new URL('./rp2040.worker.ts', import.meta.url))
    this.worker.onmessage = (event: MessageEvent<{ type: string; line?: string; pinId?: string; level?: SignalLevel }>) => {
      const msg = event.data
      if (msg?.type === 'serial' && msg.line) {
        this.handlers.onSerial?.(msg.line)
      }
      if (msg?.type === 'pin-change' && msg.pinId && typeof msg.level === 'number') {
        this.pinStates.set(msg.pinId, msg.level)
        this.handlers.onPinChange?.(msg.pinId, msg.level)
      }
    }
  }

  async start(): Promise<void> {
    if (!this.worker) return
    this.running = true
    this.worker.postMessage({ type: 'start' })
  }

  async stop(): Promise<void> {
    if (!this.worker) return
    this.running = false
    this.worker.postMessage({ type: 'stop' })
  }

  async reset(): Promise<void> {
    if (!this.worker) return
    this.pinStates.clear()
    this.worker.postMessage({ type: 'reset' })
  }

  readPin(pinId: string): SignalLevel {
    return this.pinStates.get(pinId) ?? 0
  }

  writePin(pinId: string, level: SignalLevel): void {
    this.pinStates.set(pinId, level)
    this.worker?.postMessage({ type: 'write-pin', pinId, level })
  }

  setHandlers(handlers: SimulationEventHandlers): void {
    this.handlers = handlers
  }

  getDiagnostics() {
    return {
      engine: 'rp2040-worker',
      running: this.running,
    }
  }
}
