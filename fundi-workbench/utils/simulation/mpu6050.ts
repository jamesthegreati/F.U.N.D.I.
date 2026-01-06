import { type I2CDevice, getI2CBus } from './i2c';

export interface MPU6050Reading {
  /** Acceleration in g */
  ax: number;
  ay: number;
  az: number;
  /** Angular velocity in deg/s */
  gx: number;
  gy: number;
  gz: number;
  /** Temperature in °C */
  tempC?: number;
}

export interface MPU6050Config {
  /** 7-bit I2C address; typical is 0x68 (AD0 low) */
  address?: number;
  /** Provide current sensor values (used to populate the data registers) */
  readValues?: () => MPU6050Reading;
}

const DEFAULT_ADDRESS = 0x68;

// Register addresses used by most Arduino MPU6050 sketches/libraries
const REG_SMPLRT_DIV = 0x19;
const REG_CONFIG = 0x1a;
const REG_GYRO_CONFIG = 0x1b;
const REG_ACCEL_CONFIG = 0x1c;
const REG_INT_ENABLE = 0x38;
const REG_ACCEL_XOUT_H = 0x3b;
const REG_TEMP_OUT_H = 0x41;
const REG_GYRO_XOUT_H = 0x43;
const REG_PWR_MGMT_1 = 0x6b;
const REG_WHO_AM_I = 0x75;

function clampInt16(n: number): number {
  if (n > 32767) return 32767;
  if (n < -32768) return -32768;
  return n | 0;
}

function toHiLo16(n: number): [number, number] {
  const v = clampInt16(n);
  const u = (v & 0xffff) >>> 0;
  return [(u >> 8) & 0xff, u & 0xff];
}

// MPU6050 temperature register formula: Temp(°C) = raw/340 + 36.53
function tempCToRaw(tempC: number): number {
  return clampInt16(Math.round((tempC - 36.53) * 340));
}

class MPU6050Device implements I2CDevice {
  readonly address: number;
  readonly name = 'MPU6050';

  private registers = new Uint8Array(128);
  private registerPointer = 0;

  private readonly readValues: () => MPU6050Reading;

  constructor(config?: MPU6050Config) {
    this.address = config?.address ?? DEFAULT_ADDRESS;
    this.readValues =
      config?.readValues ??
      (() => ({ ax: 0, ay: 0, az: 1, gx: 0, gy: 0, gz: 0, tempC: 25 }));

    // Power on reset defaults (approximate)
    this.registers[REG_PWR_MGMT_1] = 0x40; // sleep
    this.registers[REG_SMPLRT_DIV] = 0x07;
    this.registers[REG_CONFIG] = 0x00;
    this.registers[REG_GYRO_CONFIG] = 0x00;
    this.registers[REG_ACCEL_CONFIG] = 0x00;
    this.registers[REG_INT_ENABLE] = 0x00;

    // WHO_AM_I returns 0x68 for MPU6050
    this.registers[REG_WHO_AM_I] = 0x68;
  }

  write(data: number[]): void {
    if (data.length === 0) return;

    // First byte is register pointer
    this.registerPointer = data[0] & 0x7f;

    // Remaining bytes are data starting at pointer
    for (let i = 1; i < data.length; i++) {
      const addr = this.registerPointer;
      const value = data[i] & 0xff;

      // Allow writes to a minimal subset of registers used by common libs
      switch (addr) {
        case REG_PWR_MGMT_1:
        case REG_SMPLRT_DIV:
        case REG_CONFIG:
        case REG_GYRO_CONFIG:
        case REG_ACCEL_CONFIG:
        case REG_INT_ENABLE:
          this.registers[addr] = value;
          break;
        default:
          // Ignore unknown writes but keep behavior predictable
          this.registers[addr] = value;
          break;
      }

      this.registerPointer = (this.registerPointer + 1) & 0x7f;
    }
  }

  read(): number[] {
    const addr = this.registerPointer & 0x7f;

    // If sleeping, return 0 for sensor output regs (simple model)
    const sleeping = (this.registers[REG_PWR_MGMT_1] & 0x40) !== 0;

    // Data registers: synthesize values on demand
    if (!sleeping && addr >= REG_ACCEL_XOUT_H && addr <= REG_GYRO_XOUT_H + 5) {
      const r = this.readValues();

      // Use fixed default scales:
      // accel FS_SEL=0 => 16384 LSB/g
      // gyro FS_SEL=0  => 131 LSB/(deg/s)
      const axRaw = clampInt16(Math.round(r.ax * 16384));
      const ayRaw = clampInt16(Math.round(r.ay * 16384));
      const azRaw = clampInt16(Math.round(r.az * 16384));

      const tempRaw = tempCToRaw(typeof r.tempC === 'number' ? r.tempC : 25);

      const gxRaw = clampInt16(Math.round(r.gx * 131));
      const gyRaw = clampInt16(Math.round(r.gy * 131));
      const gzRaw = clampInt16(Math.round(r.gz * 131));

      const block: number[] = [];
      block.push(...toHiLo16(axRaw));
      block.push(...toHiLo16(ayRaw));
      block.push(...toHiLo16(azRaw));
      block.push(...toHiLo16(tempRaw));
      block.push(...toHiLo16(gxRaw));
      block.push(...toHiLo16(gyRaw));
      block.push(...toHiLo16(gzRaw));

      const offset = addr - REG_ACCEL_XOUT_H;
      const b = block[offset] ?? 0x00;
      this.registerPointer = (this.registerPointer + 1) & 0x7f;
      return [b & 0xff];
    }

    // If sleeping and we're reading output regs, return 0
    if (sleeping && addr >= REG_ACCEL_XOUT_H && addr <= REG_GYRO_XOUT_H + 5) {
      this.registerPointer = (this.registerPointer + 1) & 0x7f;
      return [0x00];
    }

    const value = this.registers[addr] ?? 0xff;
    this.registerPointer = (this.registerPointer + 1) & 0x7f;
    return [value & 0xff];
  }

  reset(): void {
    this.registerPointer = 0;
  }
}

let mpuInstance: MPU6050Device | null = null;
let mpuRegistered = false;

export function getMPU6050(config?: MPU6050Config): MPU6050Device {
  if (!mpuInstance) {
    mpuInstance = new MPU6050Device(config);

    if (!mpuRegistered) {
      getI2CBus().registerDevice(mpuInstance);
      mpuRegistered = true;
    }
  }
  return mpuInstance;
}

export function resetMPU6050(): void {
  mpuInstance = null;
  mpuRegistered = false;
}

export { MPU6050Device };
