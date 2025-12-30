# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

FUNDI is a full-stack IoT development workbench that combines visual circuit design, code editing, and AI-assisted development for Arduino/ESP32 projects. The application uses a Next.js frontend with a Python FastAPI backend.

## Common Commands

### Frontend (Next.js)
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run lint         # Run ESLint
```

### Backend (FastAPI/Python)
The backend runs in Docker by default:
```bash
docker compose up --build  # Start both frontend and backend
docker compose logs -f    # View all logs
docker compose down       # Stop services
```

For local backend development (without Docker):
```bash
cd fundi-workbench/backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Testing
```bash
# Backend tests
cd fundi-workbench/backend
pip install pytest
pytest

# API testing
python test_api.py  # Standalone API test script in root
```

## Architecture

### High-Level Structure
```
fundi-workbench/          # Next.js frontend
├── app/                  # App Router pages (route-based)
│   ├── page.tsx         # Main IDE page with 3-panel layout
│   └── workspace/       # Project management
├── components/          # React components
│   ├── nodes/          # React Flow node components (Wokwi parts)
│   ├── terminal/       # AI chat/serial monitor
│   └── ComponentLibrary.tsx  # Draggable component catalog
├── store/              # Zustand state management
│   └── useAppStore.ts  # Global app state (projects, files, circuits, compilation)
├── hooks/              # React hooks
│   ├── useSimulation.ts  # AVR8js in-browser simulation
│   ├── useDiagramSync.ts # Sync React Flow ↔ Zustand
│   └── useButtonKeyboardShortcuts.ts
├── utils/              # Utilities
│   ├── simulation/     # Simulation utilities (i2c, keypad, lcd, mqtt, etc.)
│   ├── wokwiDiagram.ts # Wokwi ↔ FUNDI diagram conversion
│   └── wireRouting.ts  # Wire path calculation
└── lib/                # Shared libraries
    └── wokwiParts.ts   # Wokwi part definitions

backend/                # Python FastAPI backend
├── app/
│   ├── api/endpoints/
│   │   ├── compile.py     # Arduino compilation endpoint
│   │   ├── generate.py    # AI generation endpoint
│   │   └── ai_tools.py    # Advanced AI tools (sync state, tool calls)
│   ├── services/
│   │   ├── compiler.py    # Arduino CLI wrapper
│   │   └── ai_generator.py # Gemini integration
│   ├── core/
│   │   └── config.py      # Settings and validation
│   └── main.py            # FastAPI app entry point
├── Dockerfile
└── requirements.txt

# Configuration & Build
tailwind.config.ts      # UI styling
next.config.ts          # Next.js config (static export for GitHub Pages)
tsconfig.json           # TypeScript config with path aliases (@/*)
docker-compose.yml      # Multi-container orchestration
```

### Key Technologies
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **State**: Zustand with persistence (localStorage)
- **Visual Flow**: React Flow / @xyflow/react (canvas-based circuit designer)
- **Simulation**: AVR8js (browser-based Arduino simulation)
- **Components**: Wokwi Elements (@wokwi/elements)
- **Backend**: FastAPI, Python 3.12
- **AI**: Google Gemini API
- **Compilation**: Arduino CLI (runs in Docker)
- **Orchestration**: Docker Compose

## Core Flow: Compilation & Simulation

### 1. User Workflow
```
Code Editor (page.tsx:628-720)
    ↓
Store updates (useAppStore.ts:501-508)
    ↓
Compile & Run (useAppStore.ts:525-582)
    ↓
POST /api/v1/compile (compile.py:68-88)
    ↓
CompilerService.compile() (compiler.py)
    ↓
arduino-cli build → hex output
    ↓
Store hex + board (useAppStore.ts:575)
    ↓
useSimulation hook (useSimulation.ts:130-344)
    ↓
AVR8js CPU execution
    ↓
Visual feedback on canvas
```

### 2. State Management (Zustand)
The `useAppStore` manages:
- **Projects**: Multi-project workspace with file persistence
- **Files**: Multi-file Arduino sketches (.cpp, .ino, .h)
- **Circuit**: Parts (components) and connections (wires)
- **Compilation**: Loading state, errors, hex output, board target
- **UI State**: Selected parts, open files, terminal history
- **Settings**: Editor preferences, API keys
- **AI Context**: Staged images, teacher mode toggle

### 3. Circuit Designer (React Flow)
- **Drag & Drop**: From ComponentLibrary to canvas
- **Nodes**: Wokwi part components (`WokwiPartNode`)
- **Edges**: Custom wiring layer (`WiringLayer.tsx`)
- **Group Drag**: Multi-select and drag with wire update
- **Pin State Mapping**: `componentPinStates` computed from simulation pin values

### 4. Simulation Engine (hooks/useSimulation.ts)
- **AVR8js Integration**: CPU + AVRIOPort + AVRTimer + AVRUSART
- **Hex Parsing**: Intel HEX format with Base64 decoding
- **Step Frame**: 16MHz / 60fps cycle execution
- **Pin Listeners**: Track PORTB/PORTD for visual LED updates
- **Serial Output**: USART byte transmit → console lines

## Important Files & Patterns

### Frontend Patterns
- **`app/page.tsx`**: Single-page IDE with 3-panel layout
  - Left: Component Library / Files Panel
  - Center: Canvas + Code Editor (resizable)
  - Right: Terminal/AI Chat + Serial Monitor
- **`store/useAppStore.ts`**: 1000+ line Zustand store with persistence
  - Actions for files, parts, connections, compilation, AI
- **`components/WiringLayer.tsx`**: SVG overlay for wires on canvas
- **`hooks/useDiagramSync.ts`**: Two-way sync between React Flow ↔ Zustand

### Backend Patterns
- **`app/main.py`**: FastAPI with lifespan validation (Arduino CLI, API key)
- **`app/services/compiler.py`**: Arduino CLI wrapper with temp file handling
- **`app/services/ai_generator.py`**: Gemini prompt engineering for code/circuit generation
- **`app/api/endpoints/ai_tools.py`**: Advanced AI with state sync and file change actions

### Security & Validation
- **Path Traversal Protection**: `is_safe_filename()` in `core/security.py`
- **Input Validation**: Pydantic models with field validators
- **CORS**: Configured origins (`http://localhost:3000`)
- **API Key Validation**: Placeholder detection in `config.py`

## Testing the Backend API

Use `test_api.py` in the project root:
```bash
# Ensure backend is running on port 8000
./test_api.py --compile  # Test compilation endpoint
./test_api.py --generate "blink an LED"  # Test AI generation
```

## Environment Configuration

### Required
```bash
# Frontend (optional - defaults to http://localhost:8000)
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > fundi-workbench/.env.local

# Backend (required for AI features)
cd fundi-workbench
cp .env.example .env
# Edit .env and add: GEMINI_API_KEY=your_key_here
```

### Docker Setup
```bash
# Single command to start everything
docker compose up --build

# Access:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000
# - Docs: http://localhost:8000/docs
```

## Key Dependency Notes

- **@wokwi/elements**: Browser custom elements for circuit components (LEDs, buttons, etc.)
- **avr8js**: JavaScript AVR simulator (Uno/Nano/Mega only - no ESP32 support)
- **@xyflow/react**: Canvas library for circuit designer (React Flow v12)
- **google-genai**: Python SDK for Gemini (not `google-generativeai`)
- **arduino-cli**: Pre-installed in Docker, handles actual compilation

## Development Tips

### Adding New Wokwi Parts
1. Update `lib/wokwiParts.ts` with part definition
2. Add to `ComponentLibrary.tsx` category
3. Ensure pin normalization in `store/useAppStore.ts:applyGeneratedCircuit()`

### Debugging Simulation
```typescript
// In useSimulation.ts, these are already logged:
// [Simulation] Run requested
// [Simulation] AVR Runner initialized
// [Simulation] Active pins (HIGH)
```

### Debugging AI Circuit Generation
```typescript
// In useAppStore.ts:submitCommand(), watch logs:
// [AI Circuit Debug] Raw parts
// [AI Circuit Debug] Raw connections
// [AI Circuit] Creating connection (pin normalization)
```

### Backend Hot Reload
The Docker Compose already mounts volumes, so backend changes are reflected immediately without rebuild.

## Unsupported Features
- **ESP32/ESP8266 Simulation**: avr8js only supports AVR8 architecture
- **ESP32 Compilation**: Works via Arduino CLI but cannot simulate in browser
- **Pin Multiplexing**: Basic pin mapping only (no advanced GPIO simulation)
- **Analog Simulation**: Digital pin states only (HIGH/LOW)

## Common Issues & Solutions

### "Failed to fetch" (Frontend)
- Backend not running: `docker compose up backend` or check port 8000
- CORS issue: Check `ALLOWED_ORIGINS` in `backend/app/core/config.py`

### "GEMINI_API_KEY is not set"
- Copy `.env.example` to `.env`
- Add valid API key: `GEMINI_API_KEY=AIzaSy...`
- Restart Docker: `docker compose down && docker compose up`

### "No supported microcontroller found"
- Add an Arduino Uno/Nano/Mega to the canvas
- Drag from Components → MCU tab
- Ensure board type is normalized (wokwi-arduino-uno)

### Compilation Errors
- Check backend logs: `docker compose logs backend`
- Validate Arduino CLI: `docker compose exec backend arduino-cli version`
- Test API: `curl -X POST http://localhost:8000/api/v1/compile -H "Content-Type: application/json" -d '{"code":"void setup(){} void loop(){}","board":"wokwi-arduino-uno"}'`
