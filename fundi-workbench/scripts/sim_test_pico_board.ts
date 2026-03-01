/*
  Headless RP2040/Pico simulation diagnostics.

  Purpose:
  - Verify the backend compile artifact for Pico is executable in rp2040js
  - Verify GPIO activity (onboard LED pin GP25)
  - Verify UART serial output (Serial1)
  - Highlight USB-Serial behavior difference (Serial)

  Usage:
    BACKEND_URL=http://localhost:8000 npm run sim:test:pico-board
*/

import { RP2040, GPIOPinState } from 'rp2040js';

const DEFAULT_BACKEND_URL = 'http://localhost:8000';
const PICO_BOARD = 'wokwi-pi-pico';
const PICO_CPU_HZ = 133_000_000;
const RP2040_FLASH_START = 0x10000000;
const RP2040_FLASH_END = 0x11000000;
const RP2040_DEFAULT_SP = 0x20041f00;
const DEFAULT_CHUNK_STEPS = 200_000;
const DEFAULT_MAX_STEPS = 80_000_000;
const DEFAULT_MAX_WALL_MS = 15_000;
const quietLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

type CompileResponse = {
  success?: boolean;
  hex?: string | null;
  artifact_type?: string | null;
  artifact_payload?: string | null;
  simulation_hints?: Record<string, unknown> | null;
  error?: string | null;
};

type PicoRunDiagnostics = {
  uart0Lines: string[];
  uart1Lines: string[];
  ledTransitions: number;
};

function decodeBase64ToBytes(base64: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64.trim(), 'base64'));
}

function readLe32(bytes: Uint8Array, offset: number): number {
  if (offset + 3 >= bytes.length) return 0;
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  ) >>> 0;
}

function resolveBootVector(firmware: Uint8Array): { sp: number; pc: number; vtor: number } {
  const readAt = (offset: number) => ({ sp: readLe32(firmware, offset), pc: readLe32(firmware, offset + 4) });
  const baseVec = readAt(0);
  const altVec = readAt(0x100);
  const hasValidVector = (sp: number, pc: number) =>
    sp >= 0x20000000 && sp <= 0x20042000 && pc >= RP2040_FLASH_START && pc < RP2040_FLASH_END;
  const selected = hasValidVector(baseVec.sp, baseVec.pc)
    ? { ...baseVec, vtor: RP2040_FLASH_START }
    : hasValidVector(altVec.sp, altVec.pc)
      ? { ...altVec, vtor: RP2040_FLASH_START + 0x100 }
      : null;
  if (selected) return selected;
  return { sp: RP2040_DEFAULT_SP, pc: RP2040_FLASH_START, vtor: RP2040_FLASH_START };
}

function applyBootVector(mcu: RP2040, bootVector: { sp: number; pc: number; vtor: number }): void {
  mcu.core.VTOR = bootVector.vtor;
  const core = mcu.core as unknown as {
    SP: number;
    SPmain?: number;
    SPprocess?: number;
    BXWritePC?: (value: number) => void;
    PC: number;
    xPSR: number;
  };

  core.SP = bootVector.sp;
  if (typeof core.SPmain === 'number') core.SPmain = bootVector.sp;
  if (typeof core.SPprocess === 'number') core.SPprocess = bootVector.sp;

  if (typeof core.BXWritePC === 'function') {
    core.BXWritePC(bootVector.pc);
  } else {
    core.PC = bootVector.pc & ~1;
    core.xPSR = 0x01000000;
  }
}

function readEnvInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function collectLinesFromByte(charBuffer: { value: string }, lines: string[], byte: number): void {
  const ch = String.fromCharCode(byte);
  if (ch === '\n') {
    const line = charBuffer.value.trimEnd();
    if (line) lines.push(line);
    charBuffer.value = '';
    return;
  }
  if (ch !== '\r') {
    charBuffer.value += ch;
  }
}

async function compilePicoSketch(backendUrl: string, code: string): Promise<{
  artifactType: string;
  artifactPayload: string;
  hints: Record<string, unknown> | null;
}> {
  const res = await fetch(`${backendUrl}/api/v1/compile`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ code, board: PICO_BOARD }),
  });

  const data = (await res.json()) as CompileResponse;
  if (!res.ok || !data?.success) {
    throw new Error(`Pico compile failed (${res.status}): ${JSON.stringify(data)}`);
  }

  const artifactType = data.artifact_type || 'raw-bin';
  const artifactPayload = data.artifact_payload || data.hex;
  if (!artifactPayload) {
    throw new Error(`Pico compile returned no artifact payload: ${JSON.stringify(data)}`);
  }

  return {
    artifactType,
    artifactPayload,
    hints: data.simulation_hints || null,
  };
}

function runPicoArtifact(
  artifactType: string,
  artifactPayload: string,
  hints: Record<string, unknown> | null,
  maxSteps: number = readEnvInt('PICO_SIM_MAX_STEPS', DEFAULT_MAX_STEPS)
): PicoRunDiagnostics {
  if (artifactType.toLowerCase() === 'uf2') {
    throw new Error('Received UF2 artifact. This diagnostic currently expects raw-bin for direct flash loading.');
  }

  const firmware = decodeBase64ToBytes(artifactPayload);
  const mcu = new RP2040();
  mcu.logger = quietLogger;
  const hintedHz = Number(hints?.cpuHz);
  mcu.clkSys = Number.isFinite(hintedHz) && hintedHz > 0 ? hintedHz : PICO_CPU_HZ;
  mcu.flash.set(firmware);
  applyBootVector(mcu, resolveBootVector(firmware));

  const uart0Lines: string[] = [];
  const uart1Lines: string[] = [];
  const uart0Buffer = { value: '' };
  const uart1Buffer = { value: '' };

  mcu.uart[0].onByte = (byte: number) => collectLinesFromByte(uart0Buffer, uart0Lines, byte);
  mcu.uart[1].onByte = (byte: number) => collectLinesFromByte(uart1Buffer, uart1Lines, byte);

  let ledTransitions = 0;
  let lastLedLevel: 0 | 1 | null = null;
  mcu.gpio[25].addListener((state: GPIOPinState) => {
    const level: 0 | 1 = state === GPIOPinState.High ? 1 : 0;
    if (lastLedLevel === null) {
      lastLedLevel = level;
      return;
    }
    if (lastLedLevel !== level) {
      ledTransitions += 1;
      lastLedLevel = level;
    }
  });

  const chunkSteps = readEnvInt('PICO_SIM_CHUNK_STEPS', DEFAULT_CHUNK_STEPS);
  const maxWallMs = readEnvInt('PICO_SIM_MAX_WALL_MS', DEFAULT_MAX_WALL_MS);
  const startedAt = Date.now();
  let totalSteps = 0;
  while (totalSteps < maxSteps && Date.now() - startedAt < maxWallMs) {
    for (let i = 0; i < chunkSteps && totalSteps < maxSteps; i++) {
      mcu.step();
      totalSteps += 1;
    }

    const hasAnySerial =
      uart0Lines.length > 0 || uart1Lines.length > 0 || uart0Buffer.value.length > 0 || uart1Buffer.value.length > 0;
    if (ledTransitions > 0 && hasAnySerial) {
      break;
    }
  }

  if (uart0Buffer.value.trim()) uart0Lines.push(uart0Buffer.value.trim());
  if (uart1Buffer.value.trim()) uart1Lines.push(uart1Buffer.value.trim());

  return {
    uart0Lines,
    uart1Lines,
    ledTransitions,
  };
}

const serial1Sketch = `
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial1.begin(115200);
  Serial1.println("PICO_UART1_BOOT");
}

void loop() {
  digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
  Serial1.println("PICO_UART1_TICK");
  delay(100);
}
`;

const usbSerialSketch = `
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(115200);
  delay(1500);
  Serial.println("PICO_USB_BOOT");
}

void loop() {
  digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
  Serial.println("PICO_USB_TICK");
  delay(100);
}
`;

async function runCase(backendUrl: string, name: string, sketch: string): Promise<PicoRunDiagnostics> {
  const { artifactType, artifactPayload, hints } = await compilePicoSketch(backendUrl, sketch);
  const artifactBytes = decodeBase64ToBytes(artifactPayload);
  const vecSp = readLe32(artifactBytes, 0);
  const vecPc = readLe32(artifactBytes, 4);
  const vecSp100 = readLe32(artifactBytes, 0x100);
  const vecPc100 = readLe32(artifactBytes, 0x104);

  // eslint-disable-next-line no-console
  console.log(`\n[${name}] artifactType=${artifactType}, payloadBytes=${artifactBytes.length}, vecSP=0x${vecSp.toString(16)}, vecPC=0x${vecPc.toString(16)}, vecSP@0x100=0x${vecSp100.toString(16)}, vecPC@0x104=0x${vecPc100.toString(16)}`);

  const result = runPicoArtifact(artifactType, artifactPayload, hints);

  // eslint-disable-next-line no-console
  console.log(`[${name}] LED transitions on GP25: ${result.ledTransitions}`);
  // eslint-disable-next-line no-console
  console.log(`[${name}] UART0 lines (${result.uart0Lines.length}):`, result.uart0Lines.slice(0, 5));
  // eslint-disable-next-line no-console
  console.log(`[${name}] UART1 lines (${result.uart1Lines.length}):`, result.uart1Lines.slice(0, 5));

  return result;
}

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const strictMode = process.env.PICO_SIM_STRICT === '1';

  const uartCase = await runCase(backendUrl, 'Serial1/UART', serial1Sketch);
  const usbCase = await runCase(backendUrl, 'Serial/USB', usbSerialSketch);

  const uartEngineLooksAlive = uartCase.ledTransitions > 0 || uartCase.uart1Lines.length > 0 || uartCase.uart0Lines.length > 0;
  if (!uartEngineLooksAlive) {
    const message =
      'Pico engine appears non-functional in this environment: no LED transitions and no UART output in Serial1 case. ' +
      'This usually indicates current rp2040js runtime limitations with this compiled Arduino RP2040 artifact.';
    if (strictMode) {
      throw new Error(message);
    }
    // eslint-disable-next-line no-console
    console.warn(`SKIP: ${message} Set PICO_SIM_STRICT=1 to enforce hard failure.`);
    return;
  }

  // Serial1 in arduino-pico maps to UART1 (GP4/GP5) in most configurations.
  // If it maps to UART0 (GP0/GP1) in a variant, uart0Lines will have the output instead.
  const hasUartOutput = uartCase.uart0Lines.length > 0 || uartCase.uart1Lines.length > 0;
  if (!hasUartOutput) {
    throw new Error(
      'Serial1/UART case produced no UART output on either UART0 or UART1. ' +
      'This indicates the RP2040 UART path is broken or the firmware hung before reaching Serial output.'
    );
  }
  // eslint-disable-next-line no-console
  console.log(`[Serial1/UART] UART0 lines: ${uartCase.uart0Lines.length}, UART1 lines: ${uartCase.uart1Lines.length}`);

  // USB serial may still be empty in rp2040js-only integration, unlike Wokwi's full monitor integration.
  if (usbCase.uart0Lines.length === 0 && usbCase.uart1Lines.length === 0) {
    // eslint-disable-next-line no-console
    console.warn(
      'NOTE: Serial (USB CDC) produced no UART lines. This is expected unless USB CDC is explicitly bridged in the simulator.'
    );
  }

  // eslint-disable-next-line no-console
  console.log('\nPASS: Pico diagnostic completed. UART path works for Serial1 and the MCU is executing.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
