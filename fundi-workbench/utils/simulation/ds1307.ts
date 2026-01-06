/**
 * DS1307 Real-Time Clock I2C Device Emulator
 * 
 * Emulates a DS1307 RTC module communicating over I2C at address 0x68.
 * Provides real-time clock functionality with seconds, minutes, hours,
 * day, date, month, and year registers.
 * 
 * Register Map:
 * 0x00: Seconds (0-59, BCD) + CH bit (bit 7, clock halt)
 * 0x01: Minutes (0-59, BCD)
 * 0x02: Hours (0-23 or 1-12, BCD) + 12/24 mode (bit 6)
 * 0x03: Day of week (1-7)
 * 0x04: Date (1-31, BCD)
 * 0x05: Month (1-12, BCD)
 * 0x06: Year (0-99, BCD)
 * 0x07: Control register
 * 0x08-0x3F: 56 bytes of battery-backed SRAM
 */

import { I2CDevice, getI2CBus } from './i2c';

const DS1307_ADDRESS = 0x68;

function toBCD(value: number): number {
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  return (tens << 4) | ones;
}

function fromBCD(bcd: number): number {
  const tens = (bcd >> 4) & 0x0F;
  const ones = bcd & 0x0F;
  return tens * 10 + ones;
}

export interface DS1307Config {
  /** Initial time - 'now', '0', or ISO 8601 string */
  initTime?: string;
}

class DS1307Device implements I2CDevice {
  readonly address = DS1307_ADDRESS;
  readonly name = 'DS1307';
  
  private registers = new Uint8Array(64); // 8 time registers + 56 bytes SRAM
  private registerPointer = 0;
  private clockHalted = false;
  private baseTime: Date;

  constructor(config?: DS1307Config) {
    const initTime = config?.initTime ?? 'now';
    
    if (initTime === '0') {
      this.baseTime = new Date('2000-01-01T00:00:00Z');
    } else if (initTime === 'now') {
      this.baseTime = new Date();
    } else {
      this.baseTime = new Date(initTime);
      if (isNaN(this.baseTime.getTime())) {
        this.baseTime = new Date();
      }
    }

    // Initialize control register
    this.registers[0x07] = 0x00;
    
    // Initialize SRAM to 0
    for (let i = 8; i < 64; i++) {
      this.registers[i] = 0x00;
    }

    this.updateTimeRegisters();
  }

  private getCurrentTime(): Date {
    if (this.clockHalted) {
      return this.baseTime;
    }
    // In simulation, we just use the base time directly
    // Real implementation would add elapsed cycles
    return this.baseTime;
  }

  private updateTimeRegisters(): void {
    const now = this.getCurrentTime();
    
    // Seconds (with CH bit preserved)
    this.registers[0x00] = toBCD(now.getSeconds()) | (this.clockHalted ? 0x80 : 0x00);
    // Minutes
    this.registers[0x01] = toBCD(now.getMinutes());
    // Hours (24-hour mode)
    this.registers[0x02] = toBCD(now.getHours());
    // Day of week (1-7, Sunday = 1)
    this.registers[0x03] = now.getDay() + 1;
    // Date
    this.registers[0x04] = toBCD(now.getDate());
    // Month
    this.registers[0x05] = toBCD(now.getMonth() + 1);
    // Year (last 2 digits)
    this.registers[0x06] = toBCD(now.getFullYear() % 100);
  }

  private setTimeFromRegisters(): void {
    const seconds = fromBCD(this.registers[0x00] & 0x7F);
    const minutes = fromBCD(this.registers[0x01]);
    const hours = fromBCD(this.registers[0x02] & 0x3F);
    const date = fromBCD(this.registers[0x04]);
    const month = fromBCD(this.registers[0x05]) - 1;
    const year = 2000 + fromBCD(this.registers[0x06]);

    this.baseTime = new Date(year, month, date, hours, minutes, seconds);
    this.clockHalted = (this.registers[0x00] & 0x80) !== 0;
  }

  // I2CDevice interface - write method
  write(data: number[]): void {
    if (data.length === 0) return;
    
    // First byte is always the register pointer
    this.registerPointer = data[0] & 0x3F;
    
    // Subsequent bytes are data to write starting at that register
    for (let i = 1; i < data.length; i++) {
      this.registers[this.registerPointer] = data[i];
      
      // If writing to time registers, update the internal time
      if (this.registerPointer <= 0x06) {
        this.setTimeFromRegisters();
      }
      
      // Auto-increment pointer
      this.registerPointer = (this.registerPointer + 1) & 0x3F;
    }
  }

  // I2CDevice interface - read method
  read(): number[] {
    // Keep time registers fresh
    if (this.registerPointer <= 0x06) {
      this.updateTimeRegisters();
    }

    const value = this.registers[this.registerPointer];
    this.registerPointer = (this.registerPointer + 1) & 0x3f;
    return [value];
  }

  // I2CDevice interface - reset method
  reset(): void {
    this.registerPointer = 0;
  }
}

// Singleton instance management
let ds1307Instance: DS1307Device | null = null;
let ds1307Registered = false;

export function getDS1307(config?: DS1307Config): DS1307Device {
  if (!ds1307Instance) {
    ds1307Instance = new DS1307Device(config);
    
    if (!ds1307Registered) {
      const bus = getI2CBus();
      bus.registerDevice(ds1307Instance);
      ds1307Registered = true;
    }
  }
  return ds1307Instance;
}

export function resetDS1307(): void {
  ds1307Instance = null;
  ds1307Registered = false;
}
