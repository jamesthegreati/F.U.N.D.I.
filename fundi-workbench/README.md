# FUNDI - IoT Development Workbench

FUNDI is a professional IoT development platform that combines circuit simulation, code editing, and AI-powered assistance to help you build Arduino and ESP32 projects.

![FUNDI Screenshot](./docs/screenshot.png)

## Features

- 🎨 **Visual Circuit Designer** - Drag-and-drop components using Wokwi-compatible parts
- 📝 **Code Editor** - Multi-file support with syntax highlighting
- 🤖 **AI Assistant** - Get help building circuits from descriptions or images
- ⚡ **Real-time Simulation** - Test your code in the browser using AVR8js
- 📦 **Project Management** - Save and manage multiple projects
- 🎓 **Teacher Mode** - Learn electronics concepts with guided explanations

## Prerequisites

Before running FUNDI, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Docker** (for running the backend) - [Download](https://www.docker.com/get-started)
- **Google Gemini API Key** - [Get API Key](https://makersuite.google.com/app/apikey)

## Quickstart

### Option 1: Full Stack with Docker Compose

1. Clone the repository:
   ```bash
   git clone https://github.com/jamesthegreati/F.U.N.D.I..git
   cd F.U.N.D.I./fundi-workbench
   ```

2. Create an environment file for Docker Compose:
   - Copy [backend/.env.example](backend/.env.example) to `backend/.env` if you also want to run the backend outside of Compose.
   - For Compose, create a `.env` file in the `fundi-workbench` directory (same folder as `docker-compose.yml`) with:
     ```env
     GEMINI_API_KEY=your_api_key_here
     ```

3. Run with Docker Compose:
   ```bash
   docker compose up --build
   # or: docker-compose up --build
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Separate Frontend and Backend

#### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

3. Build and run Docker container:
   ```bash
   docker build -t fundi-backend .
   docker run -p 8000:8000 --env-file .env fundi-backend
   ```

#### Frontend Setup

1. In a new terminal, navigate to frontend:
   ```bash
   cd fundi-workbench
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### Frontend Environment Variables

Create a `.env.local` file in the `fundi-workbench` directory:

```env
# Backend API URL (optional - defaults to http://127.0.0.1:8000)
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Required: Google Gemini API Key for AI features
GEMINI_API_KEY=your_api_key_here

# Optional: Environment mode (dev | prod)
ENVIRONMENT=dev
```

## Architecture Overview

FUNDI uses a modern full-stack architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Next.js 16 (App Router)                  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │ React Flow  │  │   Zustand   │  │  AVR8js     │   │  │
│  │  │  (Canvas)   │  │   (State)   │  │(Simulation) │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            FastAPI (Python 3.12)                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │Arduino CLI  │  │ Gemini AI   │  │  Pydantic   │   │  │
│  │  │(Compiler)   │  │ (Generator) │  │ (Schemas)   │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│                    Docker Container                          │
└─────────────────────────────────────────────────────────────┘
```

### Key Technologies

- **Frontend**: Next.js 16, React 19, Tailwind CSS, React Flow, Zustand
- **Backend**: FastAPI, Python 3.12, Google Gemini AI
- **Simulation**: AVR8js (Arduino simulation in browser)
- **Compilation**: Arduino CLI (supports AVR, ESP32, RP2040)

## Troubleshooting

### Common Issues

#### "Failed to fetch" or CORS errors
- Ensure the backend is running on port 8000
- Check that `NEXT_PUBLIC_BACKEND_URL` is set correctly
- Verify Docker container is running: `docker ps`

#### "GEMINI_API_KEY is not set"
- Ensure your `.env` file contains a valid API key
- Verify the environment file is being loaded by Docker
- Try rebuilding: `docker-compose down && docker-compose up --build`

#### Docker permission errors
- On Linux, you may need to run Docker commands with `sudo`
- Or add your user to the docker group: `sudo usermod -aG docker $USER`

#### Arduino CLI compilation failures
- The Docker image includes pre-installed cores for:
  - Arduino AVR (Uno, Nano, Mega)
  - ESP32
  - Raspberry Pi Pico (RP2040)
- If you need additional libraries, modify the Dockerfile

#### Port already in use
- Frontend: `lsof -i :3000 | grep LISTEN` to find and kill the process
- Backend: `lsof -i :8000 | grep LISTEN` to find and kill the process

### Debug Mode

Enable debug logging for the backend:

```bash
docker run -p 8000:8000 --env-file .env -e LOG_LEVEL=DEBUG fundi-backend
```

## Development

### Project Structure

```
fundi-workbench/
├── app/                 # Next.js App Router pages
│   ├── page.tsx        # Main IDE page
│   ├── workspace/      # Project management
│   └── settings/       # User settings
├── components/         # React components
│   ├── nodes/         # React Flow node components
│   └── terminal/      # AI chat interface
├── store/             # Zustand state management
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
├── data/              # Static data (component specs)
├── backend/           # Python FastAPI backend
│   ├── app/
│   │   ├── api/       # REST endpoints
│   │   ├── services/  # Business logic
│   │   └── core/      # Configuration
│   └── Dockerfile
└── package.json
```

### Running Tests

```bash
# Frontend
npm run lint
npm run build

# Backend
cd backend
pip install pytest
pytest
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Wokwi](https://wokwi.com/) - Circuit simulation components
- [Arduino](https://www.arduino.cc/) - Arduino platform and CLI
- [Google Gemini](https://ai.google.dev/) - AI capabilities
