# FUNDI Non-AVR Simulation Roadmap (ESP32, RP2040, Future Boards)

## 1) Objective

Deliver a production-ready multi-architecture simulation system so FUNDI can:

1. Compile and **simulate** AVR, ESP32, and RP2040 projects in a single UX.
2. Preserve current Arduino AVR behavior and component compatibility.
3. Add a scalable path for future boards (STM32, nRF, etc.) without rewriting core simulation logic.

Success means users can place supported MCU boards on canvas, compile, click run, and interact with connected components with stable timing, serial output, and expected behavior.

---

## 2) Current State (Verified)

### 2.1 What already works

- Backend compile supports multiple boards through Arduino CLI board mapping:
  - AVR: Uno/Nano/Mega
  - ESP32: `wokwi-esp32-devkit-v1`
  - RP2040: `wokwi-pi-pico`
- Frontend board discovery/normalization includes ESP32 and Pico board types.
- Existing component simulation ecosystem is rich (I2C/SPI/UART devices, displays, sensors, logic family, etc.).

### 2.2 Core gap

Simulation runtime is AVR-specific and tightly coupled to `avr8js` assumptions:

- Direct AVR CPU/port/timer/usart abstractions in one monolithic hook.
- Pin mapping logic assumes Arduino digital pin semantics and AVR port bit translation.
- Peripheral adapters often bind directly to AVR port bits.

Result: non-AVR boards can compile but cannot run equivalent in-app simulation behavior.

---

## 3) Architecture Decision

### 3.1 Recommended target architecture: Hybrid Multi-Engine Runtime

Use one engine per MCU family behind a unified interface:

- **AVR**: Keep current `avr8js` (in-browser)
- **RP2040**: Add `rp2040js` (in-browser Web Worker)
- **ESP32**: Add backend simulation service powered by Espressif QEMU, streamed to frontend via WebSocket

This is the best risk-adjusted path because:

1. Preserves proven AVR behavior and avoids regression-heavy rewrites.
2. RP2040 browser emulation is practical and aligns with ecosystem precedent.
3. ESP32 is significantly heavier; backend process model is more realistic for reliability and developer debugging.

### 3.2 Why not one single emulator for all boards?

No single option currently gives excellent coverage, performance, and integration simplicity for AVR + ESP32 + RP2040 in the browser. Forcing one backend causes either major fidelity loss or operational complexity. A pluggable engine layer is the correct long-term shape.

### 3.3 STM32 strategy

Treat STM32 as a later phase after ESP32/RP2040 are stable. Upstream QEMU STM32 support is board-limited and has major missing peripherals; adding STM32 now would expand scope too early. Prepare architecture for STM32 but gate implementation by board/peripheral compatibility matrix.

---

## 4) Design Principles

1. **Engine isolation**: CPU-specific logic must not leak into peripheral models.
2. **Net-level device model**: components interact through pin/net abstraction (not MCU register internals).
3. **Deterministic stepping**: standardized run-loop contract to avoid board-specific timing chaos.
4. **Progressive migration**: preserve current behavior while incrementally moving bindings.
5. **Observability-first**: standard traces, serial event logs, and health metrics from day one.

---

## 5) Target Runtime Model

### 5.1 Core interfaces

Define a simulation kernel contract (TypeScript) shared by all engines:

- `SimulationEngine`
  - `init(config)`
  - `loadFirmware(artifact)`
  - `start()` / `stop()` / `reset()`
  - `step(cyclesOrMs)`
  - `readPin(pinId)` / `writePin(pinId, level)`
  - `onSerial(cb)`
  - `onPinChange(cb)`
  - `getDiagnostics()`

- `BoardAdapter`
  - maps board-specific pin naming to canonical internal pin IDs
  - maps logical buses (I2C/SPI/UART/PWM/ADC) to engine-specific hooks

- `PeripheralBridge`
  - subscribes to net/pin events
  - feeds virtual device models (LCD, sensors, shift registers, logic chips, etc.)
  - emits updates to UI state

### 5.2 Engine implementations

- `AvrEngineAdapter` (current behavior extracted)
- `Rp2040EngineAdapter` (worker-based)
- `Esp32EngineAdapter` (websocket client to backend QEMU session)

### 5.3 Artifact loading

Normalize compile outputs and handoff metadata:

- AVR: Intel HEX
- RP2040: ELF/UF2 handling strategy (based on compiler output)
- ESP32: binary + partition/flash map requirements for emulator launch

Introduce a backend response envelope that clearly states:

- `board`
- `artifactType`
- `artifactPayload`
- `simulationHints` (clock, memory map, boot args, etc.)

---

## 6) Implementation Plan (Phased)

### Phase 0 — Baseline and Safeguards

#### Goals

- Lock current AVR behavior to prevent regressions during refactor.

#### Tasks

1. Add/expand simulation parity tests for key AVR workflows:
   - LED blink
   - Serial output
   - I2C LCD
   - SPI display/basic transfer
   - Existing logic devices
2. Capture baseline timing and UI update metrics.
3. Add feature flags:
   - `SIM_ENGINE_AVR_V2`
   - `SIM_ENGINE_RP2040`
   - `SIM_ENGINE_ESP32`

#### Exit criteria

- Baseline tests pass consistently.
- Metrics dashboard/logs available for comparison.

---

### Phase 1 — Extract Engine Abstraction (No behavior change)

#### Goals

- Convert monolithic simulation hook into orchestrator + adapters while preserving AVR output.

#### Tasks

1. Create engine interfaces and adapter folders under `utils/simulation/engines`.
2. Move AVR-specific boot/step/port hooks from `hooks/useSimulation.ts` into `AvrEngineAdapter`.
3. Keep existing peripheral behavior through temporary AVR compatibility bridge.
4. Refactor `useSimulation` to:
   - resolve board family
   - instantiate engine adapter
   - route serial/pin/pwm updates through common events

#### Exit criteria

- All Phase 0 tests pass with adapter architecture enabled.
- No user-visible regression for AVR projects.

---

### Phase 2 — Net/Pin Graph Bridge (Decouple peripherals from AVR bits)

#### Goals

- Make component simulation board-agnostic.

#### Tasks

1. Introduce canonical pin identity model:
   - `boardPinId`
   - `netId`
   - `signalType` (digital/analog/pwm/protocol)
2. Build net resolver from circuit connections (reusable across engines).
3. Update peripheral bindings to read/write via net bridge (not AVR ports).
4. Migrate high-impact components first:
   - LEDs/buttons/switches
   - UART console
   - I2C bus devices
   - SPI router devices
5. Keep compatibility layer for any not-yet-migrated devices.

#### Exit criteria

- AVR still works.
- At least 70% of active component categories are net-bridge driven.

---

### Phase 3 — RP2040 Simulation Enablement

#### Goals

- Enable in-browser simulation for `wokwi-pi-pico` with core peripherals.

#### Tasks

1. Implement `Rp2040EngineAdapter` in a worker:
   - firmware load
   - clock stepping
   - GPIO read/write eventing
   - UART forwarding
2. Add RP2040 board adapter pin map.
3. Wire compile artifact normalization for RP2040 expected format.
4. Ensure existing UI controls (run/stop/reset, serial, sensor controls) remain unchanged.
5. Add targeted RP2040 simulation tests:
   - blink
   - button input
   - UART echo

#### Exit criteria

- Pico projects compile and simulate in-app reliably.
- Serial monitor and basic pin interactions function.

---

### Phase 4 — ESP32 Simulation Service (Backend QEMU)

#### Goals

- Enable ESP32 simulation using backend process model with frontend event bridge.

#### Tasks

1. Backend: add simulation session manager service
   - create/start/stop session
   - allocate ports/resources
   - enforce timeout/quotas
2. Backend: QEMU launch adapter
   - transform compile artifacts to launchable image format
   - stream UART and GPIO-related events
   - expose debug logs
3. Backend API/WebSocket contracts
   - `POST /simulate/session`
   - `POST /simulate/session/{id}/start|stop|reset`
   - `WS /simulate/session/{id}/events`
4. Frontend `Esp32EngineAdapter`
   - connect session lifecycle
   - consume event stream and emit normalized engine events
5. Security hardening
   - command allowlist
   - resource constraints
   - per-session sandboxing strategy

#### Exit criteria

- `wokwi-esp32-devkit-v1` runs selected reference sketches in simulation.
- Stable serial output and predictable lifecycle controls.

---

### Phase 5 — Device Coverage Expansion + Developer UX

#### Goals

- Improve fidelity and breadth after multi-engine core is stable.

#### Tasks

1. Add protocol compliance test suites (I2C/SPI/UART edge cases).
2. Introduce simulation diagnostics panel:
   - active engine
   - tick rate
   - dropped events
   - session health
3. Add capability matrix by board:
   - supported peripherals
   - known limitations
   - sample projects
4. Add plugin model (WASM-friendly) for complex custom chips/peripherals.

#### Exit criteria

- Users have clear board capability expectations.
- Regression risk is controlled as new devices are added.

---

## 7) Concrete Code Touchpoints

### 7.1 Frontend

- `hooks/useSimulation.ts`
  - split into orchestration and engine-independent state updates
  - move AVR internals into dedicated adapter

- `utils/simulation/` (new/expanded)
  - `engines/SimulationEngine.ts`
  - `engines/avr/AvrEngineAdapter.ts`
  - `engines/rp2040/Rp2040EngineAdapter.ts`
  - `engines/esp32/Esp32EngineAdapter.ts`
  - `net/NetGraph.ts`
  - `bridges/PeripheralBridge.ts`

- `store/useAppStore.ts`
  - store simulation capability metadata by board
  - consume normalized compile artifact metadata

### 7.2 Backend

- `backend/app/services/compiler.py`
  - augment compile response with simulation artifact metadata

- `backend/app/api/endpoints/compile.py`
  - include simulation hints in API response schema

- `backend/app/services/` (new)
  - `sim_session_manager.py`
  - `esp32_qemu_runner.py`

- `backend/app/api/endpoints/` (new)
  - `simulate.py` for session lifecycle + event transport bootstrapping

---

## 8) Testing Strategy

### 8.1 Automated

1. Unit tests:
   - pin normalization
   - net graph connectivity
   - adapter contract conformance
2. Integration tests:
   - compile -> load -> run -> serial capture
   - interactive input (button/sensor) -> firmware reaction
3. Golden tests:
   - baseline expected traces for representative examples per board

### 8.2 Manual validation matrix

Per board (Uno/Nano/Mega, ESP32, Pico):

- digital output
- digital input
- serial monitor
- I2C device
- SPI device
- one timing-sensitive scenario

---

## 9) Risks and Mitigations

1. **Performance jitter in browser**
   - Mitigation: worker isolation, throttled UI flush, backpressure-aware event queues.
2. **ESP32 emulator operational complexity**
   - Mitigation: strict session manager + timeout + observability + guarded rollout.
3. **Peripheral regressions during decoupling**
   - Mitigation: phased migration with compatibility bridge and baseline golden tests.
4. **Board capability confusion**
   - Mitigation: explicit capability matrix surfaced in UI and docs.

---

## 10) Definition of Done (Program-Level)

All items below must be true:

1. AVR simulations remain stable and parity-tested.
2. Pico simulations run in-browser with serial + GPIO interaction.
3. ESP32 simulations run through backend session model with serial and core interaction.
4. Peripheral system is net-driven and not hardcoded to AVR ports.
5. Public docs include board capability matrix and known limitations.
6. CI includes multi-board simulation checks.

---

## 11) MVP Scope Recommendation

If minimizing time-to-value, ship in this order:

1. Phase 1 + partial Phase 2 (core abstraction + net bridge skeleton)
2. Phase 3 (RP2040 first win in browser)
3. Phase 4 (ESP32 backend sessions with serial + basic GPIO)

Defer advanced peripherals, deep timing fidelity, and STM32 until post-MVP stabilization.

---

## 12) Execution Checklist (Next Session Ready)

1. Create engine interfaces and AVR adapter extraction PR.
2. Introduce net graph bridge and migrate first peripheral set.
3. Add RP2040 adapter worker + initial tests.
4. Implement ESP32 backend simulation sessions + frontend adapter.
5. Publish board capability matrix and end-to-end validation report.

This checklist should be used as the implementation backbone for the next coding session.
