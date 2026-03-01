import type {
  SignalLevel,
  SimulationEngine,
  SimulationEngineConfig,
  SimulationEventHandlers,
  SimulationEngineDiagnostics,
} from '../SimulationEngine'

/**
 * Rp2040EngineAdapter – bridges the main thread to the rp2040.worker.ts
 * Web Worker which runs a real RP2040 CPU emulation via rp2040js.
 *
 * Lifecycle: init (load firmware) → start → stop/reset
 *
 * Supports:
 * - GPIO pin state tracking (digital I/O)
 * - UART serial output
 * - I2C device registration and state forwarding
 * - SPI device registration and state forwarding
 * - PWM duty cycle reporting
 * - ADC channel value injection
 */
export class Rp2040EngineAdapter implements SimulationEngine {
  private worker: Worker | null = null
  private handlers: SimulationEventHandlers = {}
  private pinStates = new Map<string, SignalLevel>()
  private pwmValues = new Map<string, { duty: number; frequency: number }>()
  private running = false
  private firmwareLoaded = false
  private config: SimulationEngineConfig | null = null

  async init(config: SimulationEngineConfig): Promise<void> {
    // Terminate any previous worker
    this.worker?.terminate()
    this.running = false
    this.firmwareLoaded = false
    this.config = config

    return new Promise<void>((resolve, reject) => {
      this.worker = new Worker(new URL('./rp2040.worker.ts', import.meta.url))

      const initTimeout = setTimeout(() => {
        reject(new Error('[rp2040] worker init timed out after 10s'))
      }, 10_000)

      this.worker.onmessage = (event: MessageEvent) => {
        const msg = event.data
        if (!msg || typeof msg !== 'object') return

        switch (msg.type) {
          case 'ready':
            clearTimeout(initTimeout)
            this.firmwareLoaded = true
            resolve()
            break

          case 'serial':
            if (msg.line) {
              this.handlers.onSerial?.(msg.line)
            }
            break

          case 'pin-change':
            if (msg.pinId && typeof msg.level === 'number') {
              this.pinStates.set(msg.pinId, msg.level as SignalLevel)
              this.handlers.onPinChange?.(msg.pinId, msg.level as SignalLevel)
            }
            break

          case 'pwm-update':
            if (msg.pinId && typeof msg.duty === 'number') {
              this.pwmValues.set(msg.pinId, { duty: msg.duty, frequency: msg.frequency ?? 0 })
              // Forward PWM as a numeric pin-change so LED brightness etc. can use it
              this.handlers.onPinChange?.(msg.pinId, msg.duty > 0 ? 1 : 0)
              // Also notify dedicated PWM handler if available
              const pwmCb = (this.handlers as Record<string, unknown>).onPwmChange
              if (typeof pwmCb === 'function') (pwmCb as (p: string, d: number, f: number) => void)(msg.pinId, msg.duty, msg.frequency)
            }
            break

          case 'i2c-device-state': {
            // Forward I2C device state updates (LCD text, OLED buffer, etc.)
            const i2cCb = (this.handlers as Record<string, unknown>).onI2CDeviceState
            if (typeof i2cCb === 'function') (i2cCb as (a: number, t: string, s: unknown) => void)(msg.address, msg.deviceType, msg.state)
            break
          }

          case 'spi-device-state': {
            const spiCb = (this.handlers as Record<string, unknown>).onSPIDeviceState
            if (typeof spiCb === 'function') (spiCb as (t: string, s: unknown) => void)(msg.deviceType, msg.state)
            break
          }

          case 'error':
            if (msg.message) {
              // Surface errors as serial output so user sees them
              this.handlers.onSerial?.(msg.message)
            }
            break

          case 'stopped':
            this.running = false
            break
        }
      }

      this.worker.onerror = (err) => {
        clearTimeout(initTimeout)
        console.error('[Rp2040EngineAdapter] Worker error:', err)
        reject(new Error(`[rp2040] worker error: ${err.message}`))
      }

      // Extract simulation hints
      const hints = config.artifact.simulationHints as Record<string, unknown> | null
      const cpuHz = (hints?.cpuHz as number) || 133_000_000

      // Send firmware to worker
      this.worker.postMessage({
        type: 'init',
        firmwareBase64: config.artifact.artifactPayload,
        cpuHz,
      })
    })
  }

  async start(): Promise<void> {
    if (!this.worker || !this.firmwareLoaded) {
      throw new Error('[rp2040] cannot start: no firmware loaded')
    }
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
    this.pwmValues.clear()
    this.running = false
    this.worker.postMessage({ type: 'reset' })
  }

  readPin(pinId: string): SignalLevel {
    return this.pinStates.get(pinId) ?? 0
  }

  writePin(pinId: string, level: SignalLevel): void {
    this.pinStates.set(pinId, level)
    this.worker?.postMessage({ type: 'write-pin', pinId, level })
  }

  /** Set an ADC channel value (channels 0-3 → GP26-29, channel 4 → temp sensor) */
  setADC(channel: number, value: number): void {
    this.worker?.postMessage({ type: 'set-adc', channel, value })
  }

  /** Register an I2C device in the simulation (device emulation runs in the worker) */
  registerI2CDevice(bus: number, address: number, deviceType: string, config?: Record<string, unknown>): void {
    this.worker?.postMessage({ type: 'register-i2c-device', bus, address, deviceType, config })
  }

  /** Register an SPI device in the simulation */
  registerSPIDevice(bus: number, deviceType: string, csPin?: number, config?: Record<string, unknown>): void {
    this.worker?.postMessage({ type: 'register-spi-device', bus, deviceType, csPin, config })
  }

  /** Get current PWM value for a pin (0-255 duty cycle) */
  getPwmDuty(pinId: string): number {
    return this.pwmValues.get(pinId)?.duty ?? 0
  }

  setHandlers(handlers: SimulationEventHandlers): void {
    this.handlers = handlers
  }

  getDiagnostics(): SimulationEngineDiagnostics {
    return {
      engine: 'rp2040-worker',
      running: this.running,
    }
  }

  /** Terminate the worker and clean up resources */
  dispose(): void {
    this.worker?.terminate()
    this.worker = null
    this.running = false
    this.firmwareLoaded = false
    this.pinStates.clear()
    this.pwmValues.clear()
  }
}
