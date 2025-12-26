# Docker Setup Guide for FUNDI

This guide provides detailed instructions for setting up and running FUNDI using Docker.

## Prerequisites

- **Docker**: Version 20.10 or higher ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose**: Version 2.0 or higher (included with Docker Desktop)
- **Google Gemini API Key**: [Get your API key](https://makersuite.google.com/app/apikey)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/jamesthegreati/F.U.N.D.I..git
cd F.U.N.D.I./fundi-workbench
```

### 2. Configure Environment

Copy the example environment file and add your API key:

```bash
cp .env.example .env
```

Edit `.env` and replace `your_api_key_here` with your actual Gemini API key:

```env
GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

### 3. Start the Services

```bash
docker compose up --build
```

Or if you have an older version of Docker Compose:

```bash
docker-compose up --build
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Configuration Details

### Environment Variables

#### Root `.env` file (for Docker Compose)

```env
# Required: Your Google Gemini API Key
GEMINI_API_KEY=your_api_key_here

# Optional: Environment mode (dev | prod)
ENVIRONMENT=dev
```

#### Backend `.env` file (for local development)

If running the backend outside Docker, create `backend/.env`:

```env
# Required: Your Google Gemini API Key
GEMINI_API_KEY=your_api_key_here

# Optional: Environment mode
ENVIRONMENT=dev
```

## Docker Services

### Backend Service

- **Port**: 8000
- **Image**: Built from `backend/Dockerfile`
- **Features**:
  - FastAPI REST API
  - Arduino CLI pre-installed
  - AVR, ESP32, and RP2040 cores included
  - Popular Arduino libraries pre-installed
  - Health checks enabled
  - Auto-restart on failure

### Frontend Service

- **Port**: 3000
- **Image**: node:18-alpine
- **Features**:
  - Next.js development server
  - Hot module reloading
  - Auto-restart on failure
  - Waits for backend health check before starting

## Common Operations

### View Logs

```bash
# All services
docker compose logs -f

# Backend only
docker compose logs -f backend

# Frontend only
docker compose logs -f frontend
```

### Rebuild Services

```bash
# Rebuild and restart all services
docker compose up --build --force-recreate

# Rebuild backend only
docker compose up --build --force-recreate backend
```

### Stop Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
```

### Restart Services

```bash
# Restart all services
docker compose restart

# Restart backend only
docker compose restart backend
```

### Check Service Health

```bash
# Check if backend is healthy
docker compose ps

# Test backend health endpoint
curl http://localhost:8000/health
```

## Troubleshooting

### Issue: "Could not resolve host: downloads.arduino.cc"

**Cause**: Network restrictions or firewall blocking Arduino CLI download.

**Solutions**:
1. Check your internet connection
2. If behind a corporate proxy, configure Docker to use the proxy:
   ```bash
   # Create/edit ~/.docker/config.json
   {
     "proxies": {
       "default": {
         "httpProxy": "http://proxy.example.com:8080",
         "httpsProxy": "http://proxy.example.com:8080"
       }
     }
   }
   ```
3. The Dockerfile includes retry logic (3 attempts) - it may succeed on subsequent tries

### Issue: "GEMINI_API_KEY is not set"

**Cause**: Environment variable not configured.

**Solutions**:
1. Ensure `.env` file exists in `fundi-workbench` directory
2. Verify the file contains `GEMINI_API_KEY=your_actual_key`
3. Restart Docker Compose: `docker compose down && docker compose up`

### Issue: Port Already in Use

**Cause**: Another service is using port 3000 or 8000.

**Solutions**:
1. Find and stop the conflicting service:
   ```bash
   # On Linux/Mac
   lsof -i :3000
   lsof -i :8000
   
   # On Windows
   netstat -ano | findstr :3000
   netstat -ano | findstr :8000
   ```
2. Or change ports in `docker-compose.yml`:
   ```yaml
   ports:
     - "3001:3000"  # Frontend on 3001 instead
     - "8001:8000"  # Backend on 8001 instead
   ```

### Issue: "Frontend cannot connect to backend"

**Cause**: Network configuration or backend not healthy.

**Solutions**:
1. Check backend health: `curl http://localhost:8000/health`
2. View backend logs: `docker compose logs backend`
3. Ensure backend service is healthy: `docker compose ps`
4. Frontend uses service name `backend:8000` in Docker network

### Issue: Build Fails During Arduino Core Installation

**Cause**: Network timeout or temporary unavailability.

**Solutions**:
1. The build will continue with warnings - some cores can be installed later
2. Retry the build: `docker compose up --build`
3. Check network connectivity
4. View detailed logs: `docker compose build --no-cache --progress=plain`

### Issue: Permission Errors

**Cause**: File permissions or Docker permissions.

**Solutions**:
1. On Linux, add user to docker group:
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```
2. Ensure you have write permissions in the project directory
3. Check Docker daemon is running: `systemctl status docker`

### Issue: Container Exits Immediately

**Cause**: Configuration error or missing dependencies.

**Solutions**:
1. View logs: `docker compose logs backend`
2. Check health status: `docker compose ps`
3. Verify .env file exists and is valid
4. Ensure no syntax errors in code

## Performance Optimization

### Reduce Build Time

1. **Use BuildKit**:
   ```bash
   DOCKER_BUILDKIT=1 docker compose build
   ```

2. **Cache dependencies**:
   - The Dockerfile is optimized with layer caching
   - Python packages are cached
   - Arduino cores are installed in separate layers

3. **Use .dockerignore**:
   - Already configured in `backend/.dockerignore`
   - Excludes unnecessary files from build context

### Reduce Image Size

The backend image is already optimized:
- Uses `python:3.12-slim` (smaller base image)
- Cleans up apt cache after package installation
- Uses `--no-cache-dir` for pip
- Runs as non-root user

## Development Workflow

### Hot Reloading

Both services support hot reloading:
- **Frontend**: Next.js auto-reloads on file changes
- **Backend**: Uvicorn with `--reload` flag (in development mode)

### Making Changes

1. Edit files in your local directory
2. Changes are automatically reflected (volumes are mounted)
3. No need to rebuild unless changing dependencies

### Adding Python Dependencies

1. Update `backend/requirements.txt`
2. Rebuild backend: `docker compose up --build backend`

### Adding Node Dependencies

1. Update `fundi-workbench/package.json`
2. Restart frontend: `docker compose restart frontend`

## Production Deployment

### Security Checklist

- [ ] Change default ports if exposed publicly
- [ ] Use strong API keys
- [ ] Enable HTTPS/TLS
- [ ] Set `ENVIRONMENT=prod` in `.env`
- [ ] Review CORS settings in `backend/app/core/config.py`
- [ ] Use Docker secrets instead of environment variables
- [ ] Keep images updated with security patches

### Production Configuration

Update `docker-compose.yml` for production:

```yaml
services:
  backend:
    restart: always
    environment:
      - ENVIRONMENT=prod
    # Remove host port mapping if using reverse proxy
    
  frontend:
    command: sh -c "npm ci && npm run build && npm run start"
    environment:
      - NODE_ENV=production
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Backend API Documentation](backend/README.md)
- [Main README](README.md)
- [Arduino CLI Documentation](https://arduino.github.io/arduino-cli/)

## Support

If you encounter issues not covered in this guide:

1. Check the [main README](README.md) troubleshooting section
2. View Docker logs: `docker compose logs`
3. Check backend health: `curl http://localhost:8000/health`
4. Open an issue on GitHub with:
   - Docker version: `docker --version`
   - Docker Compose version: `docker compose version`
   - Operating system
   - Error logs
   - Steps to reproduce
