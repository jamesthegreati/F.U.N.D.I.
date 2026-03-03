import type {
  SignalLevel,
  SimulationEngine,
  SimulationEngineConfig,
  SimulationEngineDiagnostics,
  SimulationEventHandlers,
} from '../SimulationEngine'
import { esp32PinToGpio, gpioToEsp32PinLabel } from './esp32PinMap'
import { getBackendUrl } from '@/store/useAppStore'

/**
 * Esp32EngineAdapter – communicates with the backend QEMU-based ESP32
 * simulation service over REST + WebSocket.
 *
 * Lifecycle:
 *   init()   → POST /simulate/session          (creates session, uploads firmware)
 *   start()  → POST /simulate/session/:id/start (launches QEMU)
 *              WS   /simulate/session/:id/events (bidirectional event stream)
 *   stop()   → POST /simulate/session/:id/stop
 *   reset()  → POST /simulate/session/:id/reset
 *
 * Events from backend (server → client):
 *   { type: "serial",     line: string }
 *   { type: "pin-change", pinId: string, gpio: number, level: 0|1 }
 *   { type: "heartbeat",  sessionId: string, timestamp: number }
 *   { type: "error",      message: string }
 *
 * Commands to backend (client → server via WS):
 *   { type: "write-pin",    gpio: number, level: 0|1 }
 *   { type: "serial-input", data: string }
 */
export class Esp32EngineAdapter implements SimulationEngine {
  private handlers: SimulationEventHandlers = {}
  private pinStates = new Map<string, SignalLevel>()
  private pwmValues = new Map<string, { duty: number; frequency: number }>()
  private sessionId: string | null = null
  private socket: WebSocket | null = null
  private baseUrl = ''
  private running = false
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private config: SimulationEngineConfig | null = null

  async init(config: SimulationEngineConfig): Promise<void> {
    const baseUrl = getBackendUrl()
    this.baseUrl = baseUrl
    this.config = config

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

    const data = (await res.json()) as { id?: string; detail?: string }
    if (!res.ok || !data?.id) {
      const detail = data?.detail ?? 'unknown error'
      throw new Error(`Failed to create ESP32 simulation session: ${detail}`)
    }

    this.sessionId = data.id
  }

  async start(): Promise<void> {
    if (!this.sessionId) return

    const res = await fetch(
      `${this.baseUrl}/api/v1/simulate/session/${this.sessionId}/start`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    )

    if (!res.ok) {
      const body = await res.json().catch(() => null)
      const detail =
        (body as Record<string, unknown> | null)?.detail ??
        (body as Record<string, unknown> | null)?.error ??
        res.statusText
      throw new Error(`ESP32 simulation start failed: ${String(detail)}`)
    }

    this._connectWebSocket()
    this.running = true
  }

  async stop(): Promise<void> {
    this.running = false
    this._cleanupSocket()

    if (this.sessionId) {
      await fetch(`${this.baseUrl}/api/v1/simulate/session/${this.sessionId}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => undefined)
    }
  }

  async reset(): Promise<void> {
    if (!this.sessionId) return
    this.pinStates.clear()
    this.pwmValues.clear()
    this._cleanupSocket()

    await fetch(`${this.baseUrl}/api/v1/simulate/session/${this.sessionId}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    // Reconnect WebSocket after reset
    if (this.running) {
      this._connectWebSocket()
    }
  }

  readPin(pinId: string): SignalLevel {
    return this.pinStates.get(pinId) ?? 0
  }

  writePin(pinId: string, level: SignalLevel): void {
    this.pinStates.set(pinId, level)

    // Resolve pin label to GPIO number and send to backend
    const gpio = esp32PinToGpio(pinId)
    if (gpio !== null && gpio >= 0) {
      // Send via WebSocket if connected (fastest path)
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: 'write-pin',
          gpio,
          level,
        }))
      } else {
        // Fallback to REST
        this._writePinRest(gpio, level)
      }
    }
  }

  /** Set an ADC channel value (future: QEMU ADC injection) */
  setADC(channel: number, value: number): void {
    // ADC injection via QEMU requires register-level access
    // For now, store locally and surface in diagnostics
    // GPIO36=ADC1_CH0, GPIO39=ADC1_CH3, etc.
    void channel
    void value
  }

  /** Register an I2C device for the ESP32 simulation */
  registerI2CDevice(bus: number, address: number, deviceType: string, config?: Record<string, unknown>): void {
    // Send device registration to backend via WebSocket
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'register-i2c-device',
        bus,
        address,
        deviceType,
        config,
      }))
    }
  }

  /** Register an SPI device for the ESP32 simulation */
  registerSPIDevice(bus: number, deviceType: string, csPin?: number, config?: Record<string, unknown>): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'register-spi-device',
        bus,
        deviceType,
        csPin,
        config,
      }))
    }
  }

  /** Get current PWM duty for a pin */
  getPwmDuty(pinId: string): number {
    return this.pwmValues.get(pinId)?.duty ?? 0
  }

  setHandlers(handlers: SimulationEventHandlers): void {
    this.handlers = handlers
  }

  getDiagnostics(): SimulationEngineDiagnostics {
    return {
      engine: 'esp32-qemu-backend',
      running: this.running,
    }
  }

  /** Clean up all resources */
  dispose(): void {
    this.running = false
    this._cleanupSocket()
    this.sessionId = null
    this.pinStates.clear()
    this.pwmValues.clear()
    this.config = null
  }

  // ─── Private helpers ──────────────────────────────────────────────

  private _connectWebSocket(): void {
    if (!this.sessionId) return

    const wsUrl = `${this.baseUrl.replace(/^http/, 'ws')}/api/v1/simulate/session/${this.sessionId}/events`
    this._cleanupSocket()
    this.socket = new WebSocket(wsUrl)

    this.socket.onopen = () => {
      console.log('[ESP32] WebSocket connected to QEMU session')
    }

    this.socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as Record<string, unknown>
        this._handleEvent(payload)
      } catch {
        // Ignore malformed messages
      }
    }

    this.socket.onclose = () => {
      if (this.running) {
        // Auto-reconnect after a brief delay
        this.reconnectTimer = setTimeout(() => {
          if (this.running) this._connectWebSocket()
        }, 2000)
      }
    }

    this.socket.onerror = (err) => {
      console.warn('[ESP32] WebSocket error:', err)
    }
  }

  private _cleanupSocket(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.socket) {
      this.socket.onclose = null // prevent reconnect
      this.socket.close()
      this.socket = null
    }
  }

  private _handleEvent(payload: Record<string, unknown>): void {
    const eventType = payload.type as string

    switch (eventType) {
      case 'serial': {
        const line = payload.line as string
        if (line) {
          this.handlers.onSerial?.(line)
        }
        break
      }

      case 'pin-change': {
        const pinId = payload.pinId as string
        const gpio = payload.gpio as number | undefined
        const level = payload.level as SignalLevel

        if (pinId && typeof level === 'number') {
          this.pinStates.set(pinId, level)
          this.handlers.onPinChange?.(pinId, level)

          // Also emit with GPIO-based label for compatibility
          if (typeof gpio === 'number') {
            const label = gpioToEsp32PinLabel(gpio)
            if (label !== pinId) {
              this.pinStates.set(label, level)
            }
          }
        }
        break
      }

      case 'pwm-update': {
        const pinId = payload.pinId as string
        const duty = payload.duty as number
        const frequency = payload.frequency as number
        if (pinId && typeof duty === 'number') {
          this.pwmValues.set(pinId, { duty, frequency: frequency ?? 0 })
          this.handlers.onPinChange?.(pinId, duty > 0 ? 1 : 0)
        }
        break
      }

      case 'i2c-device-state': {
        const cb = (this.handlers as Record<string, unknown>).onI2CDeviceState
        if (typeof cb === 'function') {
          (cb as (a: number, t: string, s: unknown) => void)(
            payload.address as number,
            payload.deviceType as string,
            payload.state,
          )
        }
        break
      }

      case 'spi-device-state': {
        const cb = (this.handlers as Record<string, unknown>).onSPIDeviceState
        if (typeof cb === 'function') {
          (cb as (t: string, s: unknown) => void)(
            payload.deviceType as string,
            payload.state,
          )
        }
        break
      }

      case 'error': {
        const msg = payload.message as string
        if (msg) {
          this.handlers.onSerial?.(`[error] ${msg}`)
        }
        break
      }

      case 'heartbeat':
        // Heartbeat – no action needed, keeps connection alive
        break

      case 'session-created':
        break

      case 'session-stopped':
      case 'session-closed':
        // Backend session ended – mark adapter as not running so the
        // frontend stops its RAF loop and updates the UI.
        if (this.running) {
          this.running = false
          this.handlers.onSerial?.('[sim] ESP32 simulation session ended.')
        }
        break

      case 'session-reset':

      default:
        // Unknown event type
        break
    }
  }

  private async _writePinRest(gpio: number, level: SignalLevel): Promise<void> {
    if (!this.sessionId) return
    try {
      await fetch(
        `${this.baseUrl}/api/v1/simulate/session/${this.sessionId}/write-pin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gpio, level }),
        },
      )
    } catch {
      // Silently fail – best effort
    }
  }
}
