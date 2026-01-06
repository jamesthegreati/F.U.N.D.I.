# FUNDI Workbench - Local Development Setup

## Prerequisites

- **Node.js** (v18+)
- **Python** (3.12+)
- **Arduino CLI** installed at `C:\arduino-cli` (with AVR core)

## Quick Start

Open **two terminals** and run:

### Terminal 1: Backend (FastAPI)

```powershell
cd fundi-workbench/backend

# First time setup (only once)
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt

# Run the backend (every time)
$env:PATH = "C:\arduino-cli;$env:PATH"
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

If you use **Git Bash** instead of PowerShell, use:

```bash
cd fundi-workbench/backend

# First time setup (only once)
python -m venv venv
source venv/Scripts/activate
python -m pip install -r requirements.txt

# Run the backend (every time)
export PATH="/c/arduino-cli:$PATH"
source venv/Scripts/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2: Frontend (Next.js)

```powershell
cd fundi-workbench

# First time setup (only once)
npm install

# Run the frontend (every time)
npm run dev
```

## Access the App

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Environment Variables

Make sure you have a `.env` file in `backend/` with:

```
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=models/gemini-flash-lite-latest
ENVIRONMENT=dev
```

## Verify Setup

Backend should show:
```
✅ Gemini API key configured
✅ Arduino CLI found at: C:\arduino-cli\arduino-cli.EXE
✅ Backend startup complete ✨
```

## Upload Code To A Physical Arduino

The backend already supports listing ports and uploading a compiled sketch via Arduino CLI.

### 1) List available ports

- API: `GET http://localhost:8000/api/v1/arduino/ports`

Example (Git Bash):

```bash
curl -sS http://localhost:8000/api/v1/arduino/ports | cat
```

### 2) Compile + Upload in one request

Use `POST /api/v1/compile` with `upload=true` and `upload_port`.

Supported `board` values:

- `wokwi-arduino-uno`
- `wokwi-arduino-nano`
- `wokwi-arduino-mega`
- `wokwi-esp32-devkit-v1`
- `wokwi-pi-pico`

Example (replace `COM3` and `board` as needed):

```bash
curl -sS http://localhost:8000/api/v1/compile \
	-H 'Content-Type: application/json' \
	-d '{
		"code": "void setup(){pinMode(13,OUTPUT);} void loop(){digitalWrite(13,HIGH);delay(500);digitalWrite(13,LOW);delay(500);}",
		"board": "wokwi-arduino-uno",
		"upload": true,
		"upload_port": "COM3"
	}' | cat
```

If the upload fails, the response includes `upload_error` and `upload_output` (Arduino CLI output).

## Troubleshooting

### Arduino CLI not found
Make sure to add it to PATH before starting the backend:
```powershell
$env:PATH = "C:\arduino-cli;$env:PATH"
```

### Port already in use
Kill existing processes:
```powershell
# Kill backend on port 8000
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force

# Kill frontend on port 3000
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
```
