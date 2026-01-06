# Local Wokwi Reference Sources (in this repo)

This workspace includes a local copy of the upstream Wokwi documentation and Wokwi Web Component implementations. These are the most useful sources when adding support for new parts.

## 1) Official Wokwi Part Docs (pins + attrs + examples)

- Part reference pages (one file per part):
  - [temp-wokwi-reference/wokwi-docs/docs/parts](../../temp-wokwi-reference/wokwi-docs/docs/parts)
  - Examples:
    - [wokwi-ili9341.md](../../temp-wokwi-reference/wokwi-docs/docs/parts/wokwi-ili9341.md)
    - [wokwi-ir-receiver.md](../../temp-wokwi-reference/wokwi-docs/docs/parts/wokwi-ir-receiver.md)

These docs usually contain:
- Pin names (what appears in `diagram.json` connections)
- Supported attributes in `attrs` (e.g. orientation flags)
- Arduino library suggestions + example projects

## 2) Wokwi “Chips API” Docs (protocol behavior)

- Protocol and simulator APIs:
  - [temp-wokwi-reference/wokwi-docs/docs/chips-api](../../temp-wokwi-reference/wokwi-docs/docs/chips-api)
  - Especially useful:
    - [gpio.md](../../temp-wokwi-reference/wokwi-docs/docs/chips-api/gpio.md)
    - [i2c.md](../../temp-wokwi-reference/wokwi-docs/docs/chips-api/i2c.md)
    - [spi.md](../../temp-wokwi-reference/wokwi-docs/docs/chips-api/spi.md)
    - [attributes.md](../../temp-wokwi-reference/wokwi-docs/docs/chips-api/attributes.md)

Use these when implementing emulators for I2C/SPI/1-Wire-like interactions or when deciding how to represent attributes/controls.

## 3) Wokwi Elements Source (UI pins geometry + properties + events)

- Component custom elements source:
  - [temp-wokwi-reference/wokwi-elements/src](../../temp-wokwi-reference/wokwi-elements/src)

These files are the source of truth for:
- `pinInfo` (pin names and their rendered positions)
- Element properties (e.g. `.text`, `.angle`, `.imageData`)
- UI events (e.g. `button-press`, `button-release`, `input`)

Examples:
- [led-element.ts](../../temp-wokwi-reference/wokwi-elements/src/led-element.ts)
- [lcd1602-element.ts](../../temp-wokwi-reference/wokwi-elements/src/lcd1602-element.ts)
- [ili9341-element.ts](../../temp-wokwi-reference/wokwi-elements/src/ili9341-element.ts)

## 4) FUNDI’s internal “catalog” and integration points

These are the files you typically touch when adding a new supported component:

- Our component specs/pins metadata (used for UX + pin overlays):
  - [fundi-workbench/data/component-specs.json](../data/component-specs.json)

- The part registry shown in the UI library:
  - [fundi-workbench/lib/wokwiParts.ts](../lib/wokwiParts.ts)

- The simulation orchestrator and device attachment logic:
  - [fundi-workbench/hooks/useSimulation.ts](../hooks/useSimulation.ts)

- UI binding for simulation-driven attributes + interaction event routing:
  - [fundi-workbench/components/nodes/WokwiPartNode.tsx](../components/nodes/WokwiPartNode.tsx)

- Implemented device emulators (expand here one component at a time):
  - [fundi-workbench/utils/simulation](../utils/simulation)

- Curated implementation notes for the already-featured components:
  - [fundi-workbench/docs/WOKWI_COMPONENT_REFERENCE.md](WOKWI_COMPONENT_REFERENCE.md)

## Recommended workflow (simulation-first)

1. Start with the relevant part doc in [temp-wokwi-reference/wokwi-docs/docs/parts](../../temp-wokwi-reference/wokwi-docs/docs/parts).
2. Check the matching element source in [temp-wokwi-reference/wokwi-elements/src](../../temp-wokwi-reference/wokwi-elements/src) for `pinInfo`, properties, and events.
3. Implement or extend an emulator under [fundi-workbench/utils/simulation](../utils/simulation) and attach it in [fundi-workbench/hooks/useSimulation.ts](../hooks/useSimulation.ts).
4. Ensure simulation-driven state is written into part attrs (store) so the UI can re-render reliably.
5. Add a deterministic headless test under [fundi-workbench/scripts](../scripts) following the existing `sim_test_*.ts` patterns.
