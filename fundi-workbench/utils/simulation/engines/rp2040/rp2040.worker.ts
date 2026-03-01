/**
 * rp2040.worker.ts – Web Worker that drives an RP2040 simulation via rp2040js.
 *
 * Communication protocol:
 *   Main → Worker: init, start, stop, reset, write-pin, set-adc, register-i2c-device, register-spi-device
 *   Worker → Main: ready, serial, pin-change, pwm-update, i2c-device-state, spi-device-state, error, stopped
 *
 * The firmware binary is received as a base64-encoded raw .bin (from Arduino CLI)
 * and loaded into flash at FLASH_START_ADDRESS (0x10000000).
 */

import { RP2040, GPIOPinState, ConsoleLogger, LogLevel } from 'rp2040js'

// FLASH_START_ADDRESS is 0x10000000 but not exported from the main module
const FLASH_START_ADDRESS = 0x10000000
const RP2040_DEFAULT_SP = 0x20041f00
const FLASH_END_ADDRESS = 0x11000000
// GPIOPinListener is (state: GPIOPinState, oldState: GPIOPinState) => void
type GPIOPinListener = (state: GPIOPinState, oldState: GPIOPinState) => void

// ---------------------------------------------------------------------------
// Message types
// ---------------------------------------------------------------------------
type SignalLevel = 0 | 1

type WorkerIn =
  | { type: 'init'; firmwareBase64: string; cpuHz?: number }
  | { type: 'start' }
  | { type: 'stop' }
  | { type: 'reset' }
  | { type: 'write-pin'; pinId: string; level: SignalLevel }
  | { type: 'set-adc'; channel: number; value: number }
  | { type: 'register-i2c-device'; bus: number; address: number; deviceType: string; config?: Record<string, unknown> }
  | { type: 'register-spi-device'; bus: number; deviceType: string; csPin?: number; config?: Record<string, unknown> }

type WorkerOut =
  | { type: 'ready' }
  | { type: 'serial'; line: string }
  | { type: 'pin-change'; pinId: string; level: SignalLevel }
  | { type: 'pwm-update'; pinId: string; duty: number; frequency: number }
  | { type: 'i2c-device-state'; address: number; deviceType: string; state: unknown }
  | { type: 'spi-device-state'; deviceType: string; state: unknown }
  | { type: 'error'; message: string }
  | { type: 'stopped' }

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let mcu: RP2040 | null = null
let running = false
let stepTimer: ReturnType<typeof setTimeout> | null = null
const pinListenerCleanups: Array<() => boolean> = []
// Track last-emitted pin state to avoid duplicate messages
const lastPinState = new Map<number, SignalLevel>()
// Track last-emitted PWM duty to avoid flooding
const lastPwmDuty = new Map<number, number>()

// Serial line buffer: accumulates bytes until newline
let serialBuffer = ''
let bootSp = RP2040_DEFAULT_SP
let bootPc = FLASH_START_ADDRESS

// ---------------------------------------------------------------------------
// I2C Device Simulation (worker-side, synchronous)
// ---------------------------------------------------------------------------
interface WorkerI2CDevice {
  address: number
  deviceType: string
  /** Handle address match. Return true=ACK, false=NACK */
  connect?: (mode: number /* 0=write, 1=read */) => boolean
  /** Write a byte to the device. Return true=ACK */
  writeByte?: (byte: number) => boolean
  /** Read a byte from the device */
  readByte?: () => number
  /** Called on I2C stop condition */
  stop?: () => void
  /** Get device state for UI rendering */
  getState?: () => unknown
  /** Reset device state */
  reset?: () => void
}

// I2C devices registered per bus (0 or 1)
const i2cDevices: Map<number, Map<number, WorkerI2CDevice>> = new Map([[0, new Map()], [1, new Map()]])

// ---------------------------------------------------------------------------
// SPI Device Simulation (worker-side, synchronous)
// ---------------------------------------------------------------------------
interface WorkerSPIDevice {
  deviceType: string
  csPin?: number
  /** Transfer one byte: MOSI in, MISO out */
  transfer?: (mosi: number) => number
  /** Called when CS goes low (device selected) */
  select?: () => void
  /** Called when CS goes high (device deselected) */
  deselect?: () => void
  /** Get device state for UI rendering */
  getState?: () => unknown
  /** Reset device state */
  reset?: () => void
}

const spiDevices: Map<number, WorkerSPIDevice[]> = new Map([[0, []], [1, []]])

function emit(msg: WorkerOut) {
  postMessage(msg)
}

// ---------------------------------------------------------------------------
// Base64 → Uint8Array (works in Worker context without atob on all runtimes)
// ---------------------------------------------------------------------------
function base64ToUint8Array(b64: string): Uint8Array {
  // Use atob if available (most browsers), otherwise manual decode
  if (typeof atob === 'function') {
    const binaryStr = atob(b64)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i)
    }
    return bytes
  }
  // Fallback: decode manually (shouldn't be needed in modern browsers)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  const lookup = new Uint8Array(256)
  for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i
  const clean = b64.replace(/[^A-Za-z0-9+/]/g, '')
  const outLen = (clean.length * 3) >> 2
  const out = new Uint8Array(outLen)
  let j = 0
  for (let i = 0; i < clean.length; i += 4) {
    const a = lookup[clean.charCodeAt(i)]
    const b = lookup[clean.charCodeAt(i + 1)]
    const c = lookup[clean.charCodeAt(i + 2)]
    const d = lookup[clean.charCodeAt(i + 3)]
    out[j++] = (a << 2) | (b >> 4)
    if (j < outLen) out[j++] = ((b & 0xf) << 4) | (c >> 2)
    if (j < outLen) out[j++] = ((c & 3) << 6) | d
  }
  return out
}

function readLe32(bytes: Uint8Array, offset: number): number {
  if (offset + 3 >= bytes.length) return 0
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  ) >>> 0
}

function resolveBootVector(firmware: Uint8Array): { sp: number; pc: number } {
  const vectorSp = readLe32(firmware, 0)
  const vectorPc = readLe32(firmware, 4)

  const spIsValid = vectorSp >= 0x20000000 && vectorSp <= 0x20042000
  const pcIsValid = vectorPc >= FLASH_START_ADDRESS && vectorPc < FLASH_END_ADDRESS

  return {
    sp: spIsValid ? vectorSp : RP2040_DEFAULT_SP,
    pc: pcIsValid ? vectorPc : FLASH_START_ADDRESS,
  }
}

function applyBootVector(): void {
  if (!mcu) return
  mcu.core.VTOR = FLASH_START_ADDRESS
  mcu.core.SP = bootSp
  mcu.core.PC = bootPc
}

// ---------------------------------------------------------------------------
// Firmware loading
// ---------------------------------------------------------------------------
function loadFirmware(firmwareBase64: string, cpuHz?: number): void {
  // Cleanup any previous instance
  cleanup()

  mcu = new RP2040()
  // Keep RP2040 diagnostics available but avoid debug-level instruction spam.
  mcu.logger = new ConsoleLogger(LogLevel.Warn, false)

  // Set system clock (Arduino mbed_rp2040 core typically runs at 133 MHz)
  if (cpuHz && cpuHz > 0) {
    mcu.clkSys = cpuHz
  }

  // Decode base64 firmware into flash memory
  const firmware = base64ToUint8Array(firmwareBase64)
  mcu.flash.set(firmware)

  const bootVector = resolveBootVector(firmware)
  bootSp = bootVector.sp
  bootPc = bootVector.pc

  // Boot directly from flash image (similar to rp2040js demo startup path).
  // Our bundled rp2040js package does not include bootrom data by default, so relying on
  // reset vectors at address 0x00000000 can leave the CPU in invalid memory.
  applyBootVector()

  // Wire up UART0 for Serial output (Arduino Serial on Pico uses UART0: GP0=TX, GP1=RX)
  mcu.uart[0].onByte = (byte: number) => {
    const ch = String.fromCharCode(byte)
    if (ch === '\n') {
      emit({ type: 'serial', line: serialBuffer })
      serialBuffer = ''
    } else if (ch !== '\r') {
      serialBuffer += ch
    }
  }

  // Wire up UART1 as well (Serial1 on GP4=TX, GP5=RX)
  mcu.uart[1].onByte = (byte: number) => {
    const ch = String.fromCharCode(byte)
    if (ch === '\n') {
      emit({ type: 'serial', line: `[UART1] ${serialBuffer}` })
      serialBuffer = ''
    } else if (ch !== '\r') {
      serialBuffer += ch
    }
  }

  // Attach GPIO listeners for all 30 pins
  for (let i = 0; i < 30; i++) {
    const pin = mcu.gpio[i]
    const pinId = `GP${i}`
    const listener: GPIOPinListener = (state: GPIOPinState) => {
      const level: SignalLevel = (state === GPIOPinState.High) ? 1 : 0
      const prev = lastPinState.get(i)
      if (prev !== level) {
        lastPinState.set(i, level)
        emit({ type: 'pin-change', pinId, level })
      }
    }
    const unsub = pin.addListener(listener)
    pinListenerCleanups.push(unsub)
  }

  // Wire up I2C peripheral callbacks
  wireI2C(0)
  wireI2C(1)

  // Wire up SPI peripheral callbacks
  wireSPI(0)
  wireSPI(1)

  emit({ type: 'ready' })
}

// ---------------------------------------------------------------------------
// I2C Bus hookup — connects rp2040js I2C to worker-side device emulators
// ---------------------------------------------------------------------------
function wireI2C(busIndex: number): void {
  if (!mcu) return
  const i2c = mcu.i2c[busIndex]
  const devices = i2cDevices.get(busIndex)!
  let currentDevice: WorkerI2CDevice | null = null

  i2c.onConnect = (address: number, mode: unknown /* I2CMode enum: 0=Write, 1=Read */) => {
    const dev = devices.get(address)
    if (dev) {
      currentDevice = dev
      const ack = dev.connect ? dev.connect(mode as number) : true
      i2c.completeConnect(ack)
    } else {
      currentDevice = null
      i2c.completeConnect(false) // NACK — no device at this address
    }
  }

  i2c.onWriteByte = (value: number) => {
    if (currentDevice?.writeByte) {
      const ack = currentDevice.writeByte(value)
      i2c.completeWrite(ack)
    } else {
      i2c.completeWrite(false)
    }
  }

  i2c.onReadByte = (_ack: boolean) => {
    if (currentDevice?.readByte) {
      const val = currentDevice.readByte()
      i2c.completeRead(val)
    } else {
      i2c.completeRead(0xff)
    }
  }

  i2c.onStop = () => {
    if (currentDevice?.stop) {
      currentDevice.stop()
    }
    // After a transaction completes, emit device state for UI update
    if (currentDevice?.getState) {
      emit({
        type: 'i2c-device-state',
        address: currentDevice.address,
        deviceType: currentDevice.deviceType,
        state: currentDevice.getState(),
      })
    }
    currentDevice = null
  }
}

// ---------------------------------------------------------------------------
// SPI Bus hookup — connects rp2040js SPI to worker-side device emulators
// ---------------------------------------------------------------------------
function wireSPI(busIndex: number): void {
  if (!mcu) return
  const spi = mcu.spi[busIndex]
  const devices = spiDevices.get(busIndex)!

  spi.onTransmit = (mosiValue: number) => {
    // Send to all active (selected) SPI devices; use first response
    let misoValue = 0xff
    for (const dev of devices) {
      if (dev.transfer) {
        misoValue = dev.transfer(mosiValue)
      }
    }
    spi.completeTransmit(misoValue)
  }
}

// ---------------------------------------------------------------------------
// PWM state polling — read duty cycle from PWM channels and emit updates
// ---------------------------------------------------------------------------
let pwmPollTimer: ReturnType<typeof setInterval> | null = null

function startPwmPolling(): void {
  if (pwmPollTimer !== null) return
  pwmPollTimer = setInterval(() => {
    if (!mcu) return
    // RP2040 has 8 PWM slices, each with channels A and B (16 outputs total)
    // PWM GPIO mapping: GP0 → slice 0 ch A, GP1 → slice 0 ch B, GP2 → slice 1 ch A, ...
    for (let slice = 0; slice < 8; slice++) {
      const ch = mcu.pwm.channels[slice]
      if (!ch) continue
      const top = ch.top || 65535
      const ccVal = ch.cc
      // Channel A duty (bits 15:0 of cc)
      const dutyA = (ccVal & 0xffff) / (top + 1)
      const pinA = slice * 2
      // Channel B duty (bits 31:16 of cc)
      const dutyB = ((ccVal >>> 16) & 0xffff) / (top + 1)
      const pinB = slice * 2 + 1

      if (pinA < 30) {
        const prevA = lastPwmDuty.get(pinA) ?? -1
        const roundedA = Math.round(dutyA * 255)
        if (roundedA !== prevA) {
          lastPwmDuty.set(pinA, roundedA)
          const freq = mcu.clkSys / ((ch.div >> 4) || 1) / (top + 1)
          emit({ type: 'pwm-update', pinId: `GP${pinA}`, duty: roundedA, frequency: freq })
        }
      }
      if (pinB < 30) {
        const prevB = lastPwmDuty.get(pinB) ?? -1
        const roundedB = Math.round(dutyB * 255)
        if (roundedB !== prevB) {
          lastPwmDuty.set(pinB, roundedB)
          const freq = mcu.clkSys / ((ch.div >> 4) || 1) / (top + 1)
          emit({ type: 'pwm-update', pinId: `GP${pinB}`, duty: roundedB, frequency: freq })
        }
      }
    }
  }, 50) // Poll PWM at 20Hz — fast enough for visual updates
}

function stopPwmPolling(): void {
  if (pwmPollTimer !== null) {
    clearInterval(pwmPollTimer)
    pwmPollTimer = null
  }
}

// ---------------------------------------------------------------------------
// I2C Device Factory — creates worker-side device emulators
// ---------------------------------------------------------------------------
function createI2CDevice(address: number, deviceType: string, config?: Record<string, unknown>): WorkerI2CDevice | null {
  switch (deviceType) {
    case 'lcd1602':
    case 'lcd2004':
      return createLCDDevice(address, deviceType, config)
    case 'ssd1306':
      return createSSD1306Device(address, config)
    case 'ds1307':
      return createDS1307Device(address, config)
    default:
      // Generic ACK-all device (allows firmware to detect the address)
      return {
        address,
        deviceType,
        connect: () => true,
        writeByte: () => true,
        readByte: () => 0xff,
        getState: () => ({}),
      }
  }
}

// ---------------------------------------------------------------------------
// LCD1602/2004 I2C Device (PCF8574 backpack)
// ---------------------------------------------------------------------------
function createLCDDevice(address: number, deviceType: string, config?: Record<string, unknown>): WorkerI2CDevice {
  const rows = deviceType === 'lcd2004' ? 4 : 2
  const cols = deviceType === 'lcd2004' ? 20 : 16
  const display: string[][] = Array.from({ length: rows }, () => Array(cols).fill(' '))
  let cursorRow = 0
  let cursorCol = 0
  let displayOn = true
  let backlightOn = true
  const lastNibbleHigh = false
  let lastByteRS = false
  let dataByte = 0 // accumulated 4-bit nibbles → 8-bit byte
  let nibbleCount = 0

  // PCF8574 bit mapping
  const RS = 0x01
  const EN = 0x04
  const BL = 0x08

  let prevEN = false

  function processCommand(cmd: number) {
    if (cmd & 0x80) {
      // Set DDRAM address
      const addr = cmd & 0x7f
      if (rows === 4) {
        if (addr < 0x14) { cursorRow = 0; cursorCol = addr }
        else if (addr >= 0x40 && addr < 0x54) { cursorRow = 1; cursorCol = addr - 0x40 }
        else if (addr >= 0x14 && addr < 0x28) { cursorRow = 2; cursorCol = addr - 0x14 }
        else if (addr >= 0x54 && addr < 0x68) { cursorRow = 3; cursorCol = addr - 0x54 }
      } else {
        if (addr < 0x40) { cursorRow = 0; cursorCol = addr }
        else { cursorRow = 1; cursorCol = addr - 0x40 }
      }
    } else if (cmd === 0x01) {
      // Clear display
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) display[r][c] = ' '
      cursorRow = 0; cursorCol = 0
    } else if (cmd === 0x02) {
      // Return home
      cursorRow = 0; cursorCol = 0
    } else if ((cmd & 0x08) === 0x08) {
      // Display on/off control
      displayOn = !!(cmd & 0x04)
    }
  }

  function processData(data: number) {
    if (cursorRow >= 0 && cursorRow < rows && cursorCol >= 0 && cursorCol < cols) {
      display[cursorRow][cursorCol] = String.fromCharCode(data)
      cursorCol++
      if (cursorCol >= cols) { cursorCol = 0 }
    }
  }

  return {
    address,
    deviceType,
    connect: () => true,
    writeByte: (byte: number) => {
      // PCF8574 expander byte — detect EN falling edge to latch nibble
      const isRS = !!(byte & RS)
      const isEN = !!(byte & EN)
      backlightOn = !!(byte & BL)

      if (prevEN && !isEN) {
        // Falling edge of EN — latch high nibble
        const nibble = (byte >> 4) & 0x0f
        if (nibbleCount === 0) {
          dataByte = nibble << 4
          lastByteRS = isRS
          nibbleCount = 1
        } else {
          dataByte |= nibble
          nibbleCount = 0
          if (lastByteRS) {
            processData(dataByte)
          } else {
            processCommand(dataByte)
          }
        }
      }
      prevEN = isEN
      return true
    },
    readByte: () => 0xff,
    getState: () => ({
      display: display.map(r => r.join('')),
      cursorRow,
      cursorCol,
      displayOn,
      backlightOn,
      rows,
      cols,
    }),
    reset: () => {
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) display[r][c] = ' '
      cursorRow = 0; cursorCol = 0; nibbleCount = 0; displayOn = true; backlightOn = true
    },
  }
}

// ---------------------------------------------------------------------------
// SSD1306 OLED I2C Device (128x64 / 128x32)
// ---------------------------------------------------------------------------
function createSSD1306Device(address: number, config?: Record<string, unknown>): WorkerI2CDevice {
  const width = (config?.width as number) || 128
  const height = (config?.height as number) || 64
  const pages = height / 8
  const buffer = new Uint8Array(width * pages)
  let col = 0
  let page = 0
  let colStart = 0
  let colEnd = width - 1
  let pageStart = 0
  let pageEnd = pages - 1
  let displayOn = false
  let isData = false // control byte determines if subsequent bytes are command or data
  let controlByteExpected = true
  let multiByteCmd: number | null = null
  let multiByteArgs: number[] = []
  let multiByteRemaining = 0

  function processCommand(cmd: number) {
    if (multiByteRemaining > 0) {
      multiByteArgs.push(cmd)
      multiByteRemaining--
      if (multiByteRemaining === 0) {
        // Process multi-byte commands
        switch (multiByteCmd) {
          case 0x21: // Set column address
            colStart = multiByteArgs[0] ?? 0
            colEnd = multiByteArgs[1] ?? (width - 1)
            col = colStart
            break
          case 0x22: // Set page address
            pageStart = multiByteArgs[0] ?? 0
            pageEnd = multiByteArgs[1] ?? (pages - 1)
            page = pageStart
            break
        }
        multiByteCmd = null
        multiByteArgs = []
      }
      return
    }
    // Single-byte commands
    if (cmd === 0xae) displayOn = false
    else if (cmd === 0xaf) displayOn = true
    else if (cmd === 0x21) { multiByteCmd = 0x21; multiByteRemaining = 2; multiByteArgs = [] }
    else if (cmd === 0x22) { multiByteCmd = 0x22; multiByteRemaining = 2; multiByteArgs = [] }
    else if ((cmd & 0xf0) === 0x00) colStart = (colStart & 0xf0) | (cmd & 0x0f)
    else if ((cmd & 0xf0) === 0x10) colStart = (cmd & 0x0f) << 4 | (colStart & 0x0f)
    else if ((cmd & 0xf0) === 0xb0) { page = cmd & 0x07; }
  }

  function writeData(data: number) {
    if (page >= 0 && page < pages && col >= 0 && col < width) {
      buffer[page * width + col] = data
    }
    col++
    if (col > colEnd) {
      col = colStart
      page++
      if (page > pageEnd) page = pageStart
    }
  }

  return {
    address,
    deviceType: 'ssd1306',
    connect: () => { controlByteExpected = true; return true },
    writeByte: (byte: number) => {
      if (controlByteExpected) {
        // Control byte: bit 6 = Co (continuation), bit 5 = D/C#
        isData = !!(byte & 0x40)
        controlByteExpected = !!(byte & 0x80) // Co bit: if set, next byte is also a control byte
        return true
      }
      if (isData) {
        writeData(byte)
      } else {
        processCommand(byte)
      }
      return true
    },
    readByte: () => 0xff,
    stop: () => { controlByteExpected = true },
    getState: () => ({
      width,
      height,
      displayOn,
      buffer: Array.from(buffer),
    }),
    reset: () => {
      buffer.fill(0); col = 0; page = 0; displayOn = false
    },
  }
}

// ---------------------------------------------------------------------------
// DS1307 RTC I2C Device
// ---------------------------------------------------------------------------
function createDS1307Device(address: number, config?: Record<string, unknown>): WorkerI2CDevice {
  const registers = new Uint8Array(64) // 8 time regs + 56 bytes SRAM
  let pointer = 0
  let writePhase = true // first byte after connect(write) = register pointer

  function toBCD(v: number): number { return ((Math.floor(v / 10)) << 4) | (v % 10) }

  // Initialize from real time
  const now = new Date()
  registers[0] = toBCD(now.getSeconds())
  registers[1] = toBCD(now.getMinutes())
  registers[2] = toBCD(now.getHours())
  registers[3] = toBCD(now.getDay() + 1)
  registers[4] = toBCD(now.getDate())
  registers[5] = toBCD(now.getMonth() + 1)
  registers[6] = toBCD(now.getFullYear() % 100)

  return {
    address,
    deviceType: 'ds1307',
    connect: (mode: number) => { writePhase = (mode === 0); return true },
    writeByte: (byte: number) => {
      if (writePhase) {
        pointer = byte & 0x3f
        writePhase = false
      } else {
        registers[pointer & 0x3f] = byte
        pointer = (pointer + 1) & 0x3f
      }
      return true
    },
    readByte: () => {
      const val = registers[pointer & 0x3f]
      pointer = (pointer + 1) & 0x3f
      return val
    },
    getState: () => ({
      registers: Array.from(registers.slice(0, 8)),
    }),
    reset: () => {
      registers.fill(0); pointer = 0
    },
  }
}

// ---------------------------------------------------------------------------
// Simulation stepping
// ---------------------------------------------------------------------------
// The RP2040 runs at 133 MHz. We step in batches to keep the UI responsive.
// Each "tick" we run CYCLES_PER_TICK instructions, then yield to the event loop.
const CYCLES_PER_TICK = 133_000 // ~1ms of simulated time at 133 MHz
const TICK_INTERVAL_MS = 1       // Real-world ms between ticks

function startStepping(): void {
  if (!mcu || running) return
  running = true

  startPwmPolling()

  const step = () => {
    if (!running || !mcu) return
    try {
      for (let i = 0; i < CYCLES_PER_TICK; i++) {
        mcu.step()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      // Don't stop on breakpoints or common simulation artifacts
      if (!msg.includes('Breakpoint')) {
        emit({ type: 'error', message: `[rp2040] CPU error: ${msg}` })
      }
    }
    stepTimer = setTimeout(step, TICK_INTERVAL_MS)
  }

  step()
}

function stopStepping(): void {
  running = false
  stopPwmPolling()
  if (stepTimer !== null) {
    clearTimeout(stepTimer)
    stepTimer = null
  }
}

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------
function cleanup(): void {
  stopStepping()
  // Remove GPIO listeners
  for (const unsub of pinListenerCleanups) {
    try { unsub() } catch { /* ignore */ }
  }
  pinListenerCleanups.length = 0
  lastPinState.clear()
  lastPwmDuty.clear()
  serialBuffer = ''
  // Reset all I2C devices
  for (const [, devMap] of i2cDevices) {
    for (const [, dev] of devMap) dev.reset?.()
  }
  // Reset all SPI devices
  for (const [, devs] of spiDevices) {
    for (const dev of devs) dev.reset?.()
  }
  mcu = null
}

// ---------------------------------------------------------------------------
// Pin name → GPIO index mapping
// ---------------------------------------------------------------------------
function parsePinIndex(pinId: string): number | null {
  // GP0..GP29
  const gpMatch = pinId.match(/^GP(\d+)$/i)
  if (gpMatch) {
    const idx = parseInt(gpMatch[1], 10)
    if (idx >= 0 && idx < 30) return idx
  }
  // D0..D29 (digital pin alias)
  const dMatch = pinId.match(/^D?(\d+)$/i)
  if (dMatch) {
    const idx = parseInt(dMatch[1], 10)
    if (idx >= 0 && idx < 30) return idx
  }
  // A0..A2 → GP26..GP28
  const aMatch = pinId.match(/^A(\d+)$/i)
  if (aMatch) {
    const idx = parseInt(aMatch[1], 10)
    if (idx >= 0 && idx <= 2) return 26 + idx
  }
  return null
}

// ---------------------------------------------------------------------------
// Message handler
// ---------------------------------------------------------------------------
onmessage = (event: MessageEvent<WorkerIn>) => {
  const msg = event.data
  if (!msg) return

  switch (msg.type) {
    case 'init': {
      try {
        loadFirmware(msg.firmwareBase64, msg.cpuHz)
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err)
        emit({ type: 'error', message: `[rp2040] init failed: ${errMsg}` })
      }
      break
    }

    case 'start': {
      if (!mcu) {
        emit({ type: 'error', message: '[rp2040] cannot start: no firmware loaded' })
        return
      }
      emit({ type: 'serial', line: '[rp2040] simulation started' })
      startStepping()
      break
    }

    case 'stop': {
      stopStepping()
      // Flush any remaining serial buffer
      if (serialBuffer.length > 0) {
        emit({ type: 'serial', line: serialBuffer })
        serialBuffer = ''
      }
      emit({ type: 'stopped' })
      emit({ type: 'serial', line: '[rp2040] simulation stopped' })
      break
    }

    case 'reset': {
      if (mcu) {
        stopStepping()
        // Preserve flash firmware and restart execution from flash image.
        applyBootVector()
        lastPinState.clear()
        lastPwmDuty.clear()
        serialBuffer = ''
        emit({ type: 'serial', line: '[rp2040] reset' })
      }
      break
    }

    case 'write-pin': {
      if (!mcu) return
      const idx = parsePinIndex(msg.pinId)
      if (idx === null) return
      const pin = mcu.gpio[idx]
      // Set external input value (from virtual button/sensor)
      pin.setInputValue(msg.level === 1)
      break
    }

    case 'set-adc': {
      if (!mcu) return
      const { channel, value } = msg
      if (channel >= 0 && channel < 5) {
        // Set ADC channel value (0-4095 for 12-bit ADC, or 0.0-3.3V)
        // channelValues expects raw 12-bit ADC values
        mcu.adc.channelValues[channel] = typeof value === 'number' ? value : 0
      }
      break
    }

    case 'register-i2c-device': {
      const { bus, address, deviceType, config } = msg
      const devMap = i2cDevices.get(bus)
      if (!devMap) break
      const dev = createI2CDevice(address, deviceType, config)
      if (dev) {
        devMap.set(address, dev)
        emit({ type: 'serial', line: `[rp2040] I2C${bus}: registered ${deviceType} at 0x${address.toString(16)}` })
      }
      break
    }

    case 'register-spi-device': {
      const { bus: spiBus, deviceType: spiDevType, config: spiConfig } = msg
      const devList = spiDevices.get(spiBus)
      if (!devList) break
      // For now, create a generic SPI device that ACKs everything
      const spiDev: WorkerSPIDevice = {
        deviceType: spiDevType,
        csPin: msg.csPin,
        transfer: () => 0xff,
        getState: () => ({}),
      }
      devList.push(spiDev)
      emit({ type: 'serial', line: `[rp2040] SPI${spiBus}: registered ${spiDevType}` })
      break
    }
  }
}
