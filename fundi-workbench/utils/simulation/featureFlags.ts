export const simFeatureFlags = {
  avrV2: process.env.NEXT_PUBLIC_SIM_ENGINE_AVR_V2 === '1',
  rp2040: process.env.NEXT_PUBLIC_SIM_ENGINE_RP2040 !== '0', // enabled by default
  esp32: process.env.NEXT_PUBLIC_SIM_ENGINE_ESP32 !== '0', // enabled by default
} as const

export function boardFamily(board: string): 'avr' | 'rp2040' | 'esp32' | 'unknown' {
  const normalized = String(board || '').toLowerCase()
  if (normalized.includes('arduino-uno') || normalized.includes('arduino-nano') || normalized.includes('arduino-mega')) return 'avr'
  if (normalized.includes('pi-pico') || normalized.includes('rp2040')) return 'rp2040'
  if (normalized.includes('esp32')) return 'esp32'
  return 'unknown'
}
