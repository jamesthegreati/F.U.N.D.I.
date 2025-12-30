# FUNDI Workbench - Local Development Setup

## Prerequisites

- **Node.js** (v18+)
- **Python** (3.10+)
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
ENVIRONMENT=dev
```

## Verify Setup

Backend should show:
```
✅ Gemini API key configured
✅ Arduino CLI found at: C:\arduino-cli\arduino-cli.EXE
✅ Backend startup complete ✨
```

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
