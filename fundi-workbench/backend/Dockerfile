# syntax=docker/dockerfile:1

FROM python:3.12-slim

# Python environment settings
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /backend

# --- Arduino CLI toolchain ---
# Install minimal tools required for HTTPS downloads and extracting the Arduino CLI tarball.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates tar gzip \
    && rm -rf /var/lib/apt/lists/*

# Download and install arduino-cli to /usr/local/bin.
# Note: the upstream install.sh has occasionally broken due to release lookup changes,
# so we download the official prebuilt tarball from downloads.arduino.cc.
# Added retry logic and error handling for network issues.
ARG ARDUINO_CLI_VERSION=latest
RUN set -eux; \
    if [ "$ARDUINO_CLI_VERSION" = "latest" ]; then \
        url="https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Linux_64bit.tar.gz"; \
    else \
        url="https://downloads.arduino.cc/arduino-cli/arduino-cli_${ARDUINO_CLI_VERSION}_Linux_64bit.tar.gz"; \
    fi; \
    max_retries=3; \
    retry_count=0; \
    while [ $retry_count -lt $max_retries ]; do \
        if curl -fsSL --connect-timeout 30 --max-time 300 "$url" -o /tmp/arduino-cli.tar.gz; then \
            echo "Arduino CLI downloaded successfully"; \
            break; \
        else \
            retry_count=$((retry_count + 1)); \
            echo "Download attempt $retry_count failed. Retrying..."; \
            sleep 5; \
        fi; \
    done; \
    if [ ! -f /tmp/arduino-cli.tar.gz ]; then \
        echo "ERROR: Failed to download Arduino CLI after $max_retries attempts"; \
        echo "This might be due to network restrictions or temporary unavailability"; \
        exit 1; \
    fi; \
    tar -xzf /tmp/arduino-cli.tar.gz -C /usr/local/bin arduino-cli; \
    chmod +x /usr/local/bin/arduino-cli; \
    rm -f /tmp/arduino-cli.tar.gz; \
    arduino-cli version || (echo "ERROR: Arduino CLI installation verification failed" && exit 1)

# Initialize Arduino CLI config and update core index
RUN arduino-cli config init && \
    arduino-cli core update-index || (echo "WARNING: Failed to update core index on first try, retrying..." && sleep 5 && arduino-cli core update-index)

# Install the AVR core (Uno, Nano, Mega) with error handling
RUN arduino-cli core install arduino:avr || \
    (echo "WARNING: AVR core installation failed, retrying..." && sleep 5 && arduino-cli core install arduino:avr)

# Install ESP32 core with error handling
RUN arduino-cli core update-index --additional-urls https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json && \
    (arduino-cli core install esp32:esp32 --additional-urls https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json || \
     echo "WARNING: ESP32 core installation failed. Will be available for manual installation.")

# Install RP2040 core (Raspberry Pi Pico) with error handling
RUN arduino-cli core update-index && \
    (arduino-cli core install arduino:mbed_rp2040 || \
     echo "WARNING: RP2040 core installation failed. Will be available for manual installation.")

# Install popular Arduino libraries with error handling
RUN arduino-cli lib install "Servo" || echo "WARNING: Servo library installation failed"; \
    arduino-cli lib install "Adafruit NeoPixel" || echo "WARNING: Adafruit NeoPixel library installation failed"; \
    arduino-cli lib install "LiquidCrystal I2C" || echo "WARNING: LiquidCrystal I2C library installation failed"; \
    arduino-cli lib install "DHT sensor library" || echo "WARNING: DHT sensor library installation failed"

# --- Create non-root user for security ---
RUN useradd --create-home --shell /bin/bash fundi \
    && mkdir -p /home/fundi/.arduino15 \
    && cp -r /root/.arduino15/. /home/fundi/.arduino15/ \
    && chown -R fundi:fundi /home/fundi/.arduino15 \
    && chown -R fundi:fundi /backend

# --- Python environment ---
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=fundi:fundi app ./app

# Switch to non-root user
USER fundi

EXPOSE 8000

# Health check to ensure the service is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health').read()" || exit 1

# Pass environment variables at runtime via docker run -e or docker-compose
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "info"]
