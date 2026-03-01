# Project Guidelines

## Code Style
- Frontend is TypeScript strict with path alias `@/*`; keep code typed and follow existing store-driven patterns in `fundi-workbench/app/page.tsx` and `fundi-workbench/store/useAppStore.ts`.
- Keep frontend lint compatibility with `fundi-workbench/eslint.config.mjs` (Next core web vitals + TS + Prettier style).
- Backend uses typed FastAPI + Pydantic models; keep validators and field bounds explicit (see `fundi-workbench/backend/app/api/endpoints/compile.py` and `.../generate.py`).

## Architecture
- Frontend source of truth is Zustand (`fundi-workbench/store/useAppStore.ts`) for projects/files/circuit/compile/AI state.
- UI flow: editor/store actions -> `compileAndRun()` -> backend `/api/v1/compile` -> compiled artifact in store -> simulation hooks (`fundi-workbench/hooks/useSimulation.ts`).
- Diagram sync is two-way via `fundi-workbench/hooks/useDiagramSync.ts` and Wokwi-compatible JSON.
- Backend boundaries: routers in `fundi-workbench/backend/app/main.py`, endpoint handlers in `backend/app/api/endpoints/*`, heavy logic in `backend/app/services/*`.

## Build and Test
- Frontend install/dev: `cd fundi-workbench && npm install && npm run dev`
- Frontend checks: `cd fundi-workbench && npm run lint && npm run typecheck && npm run build`
- Full stack (default path): `cd fundi-workbench && docker compose up --build`
- Backend local dev: `cd fundi-workbench/backend && pip install -r requirements.txt && python validate_setup.py && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
- Backend tests: `cd fundi-workbench/backend && pytest`
- API smoke tests: `cd fundi-workbench && python test_api.py --compile`

## Project Conventions
- Keep canonical board IDs: `wokwi-arduino-uno`, `wokwi-arduino-nano`, `wokwi-arduino-mega`, `wokwi-esp32-devkit-v1`, `wokwi-pi-pico`.
- Do not bypass board/pin normalization in `useAppStore.ts` when applying AI-generated circuits and connections.
- Preserve default attribute injection for sensors/outputs when creating generated parts (existing behavior in `useAppStore.ts`).
- Treat simulation support as scoped: AVR is stable; ESP32/RP2040 simulation paths are feature-flagged/experimental (`fundi-workbench/docs/BOARD_SIMULATION_CAPABILITY_MATRIX.md`, `fundi-workbench/utils/simulation/featureFlags.ts`).

## Integration Points
- Frontend actively calls: `/api/v1/compile`, `/api/v1/compile/install-library`, `/api/v1/arduino/ports`, `/api/v1/arduino/upload`, `/api/v1/ai-tools/sync-state`, `/api/v1/generate`.
- Non-AVR simulation integrates through backend session endpoints in `fundi-workbench/backend/app/api/endpoints/simulate.py` and websocket events.
- Backend compile/upload behaviors are implemented in `fundi-workbench/backend/app/services/compiler.py`.

## Security
- Keep path and filename checks enforced with `backend/app/core/security.py` (`is_safe_filename`, `validate_file_path`) in compile flows.
- Keep serial upload safety checks (`is_safe_serial_port`) and existing upload board restrictions.
- Keep request payload constraints in Pydantic models for compile/generate endpoints.
- Keep CORS and API key validation logic in `backend/app/core/config.py` and startup checks in `backend/app/main.py`.
