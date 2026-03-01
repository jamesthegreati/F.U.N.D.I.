/*
  Headless ESP32 compile test: ESP32 Blink LED

  Verifies:
  - Code compiles successfully for wokwi-esp32-devkit-v1
  - Backend returns a valid artifact payload

  Usage:
    BACKEND_URL=http://localhost:8000 npm run sim:test:esp32-blink-led
*/

import { compileEsp32, DEFAULT_BACKEND_URL, loadFeaturedProjectCode } from './sim/esp32CompileHarness';

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const code = loadFeaturedProjectCode('esp32-blink-led');

  console.log('Compiling ESP32 Blink LED...');
  const result = await compileEsp32(backendUrl, code);

  // Verify we got an artifact
  const hasArtifact = typeof result.artifact_payload === 'string' && (result.artifact_payload as string).length > 0;
  const artifactType = result.artifact_type || 'unknown';

  console.log(`Artifact type: ${artifactType}`);
  console.log(`Artifact size: ${hasArtifact ? (result.artifact_payload as string).length : 0} chars`);

  if (!hasArtifact) {
    throw new Error('ESP32 compile did not return an artifact payload');
  }

  console.log('PASS: ESP32 Blink LED compiles successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
