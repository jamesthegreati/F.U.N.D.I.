/*
  Headless ESP32 compile test: ESP32 WiFi Scanner

  Verifies:
  - Code compiles successfully for wokwi-esp32-devkit-v1
  - Uses WiFi.h, WiFi.scanNetworks() — ESP32-only APIs

  Usage:
    BACKEND_URL=http://localhost:8000 npm run sim:test:esp32-wifi-scanner
*/

import { compileEsp32, DEFAULT_BACKEND_URL, loadFeaturedProjectCode } from './sim/esp32CompileHarness';

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const code = loadFeaturedProjectCode('esp32-wifi-scanner');

  console.log('Compiling ESP32 WiFi Scanner...');
  const result = await compileEsp32(backendUrl, code);

  const hasArtifact = typeof result.artifact_payload === 'string' && (result.artifact_payload as string).length > 0;
  const artifactType = result.artifact_type || 'unknown';

  console.log(`Artifact type: ${artifactType}`);
  console.log(`Artifact size: ${hasArtifact ? (result.artifact_payload as string).length : 0} chars`);

  if (!hasArtifact) {
    throw new Error('ESP32 compile did not return an artifact payload');
  }

  console.log('PASS: ESP32 WiFi Scanner compiles successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
