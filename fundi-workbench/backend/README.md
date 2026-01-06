# FUNDI Backend

FastAPI backend service for the FUNDI IoT Development Workbench.

## Features

- **AI-Powered Circuit Generation**: Generate Arduino circuits from text descriptions or images using Google Gemini AI
- **Code Compilation**: Compile Arduino sketches for multiple boards (AVR, ESP32, RP2040)
- **Multi-file Projects**: Support for complex projects with multiple source files
- **RESTful API**: Clean REST endpoints for frontend integration

## Prerequisites

- Python 3.12 or higher
- Docker (for containerized deployment)
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

## Quick Start with Docker

1. **Build the Docker image**:
   ```bash
   docker build -t fundi-backend .
   ```

2. **Run the container**:
   ```bash
   docker run -p 8000:8000 -e GEMINI_API_KEY=your_api_key_here fundi-backend
   ```

3. **Verify it's running**:
   ```bash
   curl http://localhost:8000/health
   ```

## Local Development Setup

1. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

4. **Validate setup**:
   ```bash
   python validate_setup.py
   ```

5. **Run the development server**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Required: Google Gemini API Key
GEMINI_API_KEY=your_api_key_here

# Optional: Environment mode (dev | prod)
ENVIRONMENT=dev
```

### Arduino CLI

The backend requires Arduino CLI for code compilation. In Docker, it's pre-installed. For local development:

- **Download**: https://arduino.github.io/arduino-cli/
- **Install**: Follow platform-specific instructions
- **Verify**: `arduino-cli version`

The Docker image includes pre-installed cores for:
- Arduino AVR (Uno, Nano, Mega)
- ESP32 (ESP32 DevKit)
- Raspberry Pi Pico (RP2040)

## API Endpoints

### Health Check
```http
GET /health
```
Returns backend status and configuration info.

### Generate Circuit
```http
POST /api/v1/generate
Content-Type: application/json

{
  "prompt": "Create a blinking LED circuit on pin 13",
  "teacher_mode": false,
  "image_data": null,
  "current_circuit": null
}
```

### Compile Code
```http
POST /api/v1/compile
Content-Type: application/json

{
  "code": "void setup() { pinMode(13, OUTPUT); } void loop() { digitalWrite(13, HIGH); delay(1000); digitalWrite(13, LOW); delay(1000); }",
  "board": "wokwi-arduino-uno",
  "files": null
}
```

#### Compile + Upload (optional)

You can also request an upload immediately after a successful compile by setting `upload=true` and providing `upload_port`.

```http
POST /api/v1/compile
Content-Type: application/json

{
   "code": "void setup() { pinMode(13, OUTPUT); } void loop() { digitalWrite(13, HIGH); delay(1000); digitalWrite(13, LOW); delay(1000); }",
   "board": "wokwi-arduino-uno",
   "files": null,
   "upload": true,
   "upload_port": "COM3"
}
```

### List Connected Boards / Ports

```http
GET /api/v1/arduino/ports
```

### Upload Pre-compiled Artifact

If you already compiled and have the returned base64 `hex`/`bin` artifact, you can upload it directly:

```http
POST /api/v1/arduino/upload
Content-Type: application/json

{
   "artifact": "<base64>",
   "board": "wokwi-arduino-uno",
   "port": "COM3"
}
```

## Error Handling

The backend implements comprehensive error handling:

- **400 Bad Request**: Invalid input or unsupported board
- **503 Service Unavailable**: API key not configured or invalid
- **500 Internal Server Error**: Unexpected errors with detailed messages

All errors include descriptive messages to help diagnose issues.

## Docker Configuration

### Build Arguments

```bash
docker build --build-arg ARDUINO_CLI_VERSION=latest -t fundi-backend .
```

### Health Checks

The container includes built-in health checks:
- Interval: 30 seconds
- Timeout: 10 seconds
- Start period: 40 seconds
- Retries: 3

### Security

- Runs as non-root user `fundi`
- Minimal base image (Python 3.12 slim)
- No API keys in image layers
- Input validation and sanitization

## Troubleshooting

### "GEMINI_API_KEY is not set"

**Solution**: 
- Ensure `.env` file exists with valid API key
- For Docker: Use `-e GEMINI_API_KEY=your_key` or `--env-file`
- Get API key from: https://makersuite.google.com/app/apikey

### "arduino-cli not found"

**Solution**:
- In Docker: Rebuild the image
- Locally: Install Arduino CLI and add to PATH
- Set `ARDUINO_CLI_PATH` environment variable to full path

### Uploading from Docker

Uploading to physical hardware from inside Docker requires passing the serial device into the container.

- Linux example: run with `--device=/dev/ttyACM0` (or `/dev/ttyUSB0`) and ensure permissions allow access.
- Windows/macOS: device passthrough depends on Docker Desktop configuration; if this is hard, run the backend locally (non-Docker) for uploads.

### Compilation failures

**Solution**:
- Check board identifier is supported (see `SUPPORTED_BOARDS`)
- Verify code syntax is valid Arduino C++
- Check Docker logs for detailed error messages

### Network issues during Docker build

**Solution**:
- The Dockerfile includes retry logic for downloads
- Check internet connectivity
- If behind proxy, configure Docker proxy settings
- Consider downloading Arduino CLI manually and modifying Dockerfile

## Development

### Project Structure

```
backend/
├── app/
│   ├── api/          # API endpoints
│   ├── core/         # Configuration
│   ├── schemas/      # Pydantic models
│   ├── services/     # Business logic
│   └── main.py       # FastAPI application
├── Dockerfile
├── requirements.txt
├── .env.example
└── validate_setup.py
```

### Code Style

- Python 3.12+ with type hints
- Pydantic for validation
- FastAPI best practices
- Comprehensive error handling

## License

MIT License - See root LICENSE file for details.
