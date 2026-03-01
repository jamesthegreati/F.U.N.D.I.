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

function resolveBootVector(firmware: Uint8Array): { sp: number; pc: number } {
  const vectorSp = readLe32(firmware, 0);
  const vectorPc = readLe32(firmware, 4);

  const sp = vectorSp >= 0x20000000 && vectorSp <= 0x20042000 ? vectorSp : RP2040_DEFAULT_SP;
  const pc = vectorPc >= RP2040_FLASH_START && vectorPc < RP2040_FLASH_END ? vectorPc : RP2040_FLASH_START;

  return { sp, pc };
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
  maxSteps: number = 5_000_000
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
  const bootVector = resolveBootVector(firmware);
  mcu.core.VTOR = RP2040_FLASH_START;
  mcu.core.SP = bootVector.sp;
  mcu.core.PC = bootVector.pc;

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

  for (let i = 0; i < maxSteps; i++) {
    mcu.step();
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

  // eslint-disable-next-line no-console
  console.log(`\n[${name}] artifactType=${artifactType}, payloadBytes=${artifactBytes.length}, vecSP=0x${vecSp.toString(16)}, vecPC=0x${vecPc.toString(16)}`);

  const result = runPicoArtifact(artifactType, artifactPayload, hints, 6_000_000);

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

  const uartCase = await runCase(backendUrl, 'Serial1/UART', serial1Sketch);
  const usbCase = await runCase(backendUrl, 'Serial/USB', usbSerialSketch);

  const uartEngineLooksAlive = uartCase.ledTransitions > 0 || uartCase.uart1Lines.length > 0 || uartCase.uart0Lines.length > 0;
  if (!uartEngineLooksAlive) {
    throw new Error('Pico engine appears non-functional: no LED transitions and no UART output in Serial1 case.');
  }

  if (uartCase.uart1Lines.length === 0) {
    throw new Error('Serial1/UART case produced no UART1 output. This indicates RP2040 UART path is broken.');
  }

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
