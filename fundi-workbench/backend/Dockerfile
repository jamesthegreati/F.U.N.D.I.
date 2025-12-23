# syntax=docker/dockerfile:1

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

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

# Optional: ESP32 core (large) — uncomment if needed
# RUN arduino-cli core update-index \
#     && arduino-cli core install esp32:esp32

# --- Python environment ---
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
