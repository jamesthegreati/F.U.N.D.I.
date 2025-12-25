# syntax=docker/dockerfile:1

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    # Environment variable placeholder for Gemini API key
    GEMINI_API_KEY=""

WORKDIR /backend

# --- Arduino CLI toolchain ---
# Install curl (required) plus minimal CA certs for HTTPS downloads.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Download and install arduino-cli to /usr/local/bin
RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh \
    | sh -s -- -b /usr/local/bin

# Initialize Arduino CLI config and update core index
RUN arduino-cli config init \
    && arduino-cli core update-index

# Install the AVR core (Uno, Nano, Mega)
RUN arduino-cli core install arduino:avr

# Install ESP32 core
RUN arduino-cli core update-index --additional-urls https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json \
    && arduino-cli core install esp32:esp32 --additional-urls https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json

# Install RP2040 core (Raspberry Pi Pico)
RUN arduino-cli core update-index \
    && arduino-cli core install arduino:mbed_rp2040

# Install popular Arduino libraries
RUN arduino-cli lib install "Servo" \
    && arduino-cli lib install "Adafruit NeoPixel" \
    && arduino-cli lib install "LiquidCrystal I2C" \
    && arduino-cli lib install "DHT sensor library"

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

# Pass environment variables at runtime via docker run -e or docker-compose
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
