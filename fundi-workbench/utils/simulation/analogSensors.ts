/**
 * Shared analog sensor helpers.
 *
 * These helpers let us convert higher-level sensor controls (lux, temperature)
 * into ADC values (0-1023) in a way that matches Wokwi part documentation.
 */

export function clampAdc(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1023, Math.round(value)));
}

export function voltageFromAdc(adc: number, vcc: number = 5): number {
  const a = clampAdc(adc);
  return (a / 1023) * vcc;
}

/**
 * Convert photoresistor lux value to ADC reading.
 *
 * Model: VCC -> 10K -> node(AO) -> LDR -> GND
 *   V(AO) = VCC * R_LDR / (R_LDR + 10K)
 *   R_LDR = RL10 * 1000 * (lux / 10)^(-gamma)
 */
export function adcFromPhotoresistorLux(
  lux: number,
  {
    vcc = 5,
    rl10KOhm = 50,
    gamma = 0.7,
    fixedResistorOhm = 10_000,
  }: {
    vcc?: number;
    rl10KOhm?: number;
    gamma?: number;
    fixedResistorOhm?: number;
  } = {}
): number {
  const safeLux = Math.max(0.0001, lux);
  const rLdrOhm = rl10KOhm * 1000 * Math.pow(safeLux / 10, -gamma);
  const voltage = vcc * (rLdrOhm / (rLdrOhm + fixedResistorOhm));
  return clampAdc((voltage / vcc) * 1023);
}

/**
 * Convert NTC thermistor temperature (C) to ADC reading.
 *
 * This inverts the Wokwi docs formula:
 *   celsius = 1 / (ln(1 / (1023/analog - 1)) / BETA + 1/298.15) - 273.15
 */
export function adcFromNtcTemperatureC(
  temperatureC: number,
  {
    beta = 3950,
  }: {
    beta?: number;
  } = {}
): number {
  const tK = temperatureC + 273.15;
  const t0 = 298.15;
  const exponent = beta * (1 / tK - 1 / t0);
  const x = Math.exp(exponent);
  const analog = 1023 * (x / (x + 1));

  // Avoid the singularities at 0 and 1023 for the log formula.
  return Math.max(1, Math.min(1022, clampAdc(analog)));
}
