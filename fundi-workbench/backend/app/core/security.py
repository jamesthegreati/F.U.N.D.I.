"""Security utilities for input validation and sanitization."""
from __future__ import annotations

import os
import re
from pathlib import Path


_SERIAL_PORT_RE = re.compile(
    r"^(?:COM\d{1,3}|\\\\\\.\\COM\d{1,3}|/dev/(?:tty|cu)\.[A-Za-z0-9._-]+|/dev/tty[A-Za-z0-9._-]+)$",
    re.IGNORECASE,
)


def is_safe_filename(filename: str, allowed_extensions: set[str] | None = None) -> bool:
    """
    Validate that a filename is safe and doesn't contain path traversal attempts.
    
    Args:
        filename: The filename to validate
        allowed_extensions: Optional set of allowed file extensions (e.g., {'.cpp', '.h'})
    
    Returns:
        True if the filename is safe, False otherwise
    """
    if not filename or not isinstance(filename, str):
        return False
    
    # Remove any whitespace
    filename = filename.strip()
    
    # Check for empty string after stripping
    if not filename:
        return False
    
    # Check for path separators (Unix and Windows)
    if "/" in filename or "\\" in filename:
        return False
    
    # Check for parent directory references
    if ".." in filename:
        return False
    
    # Check for absolute path indicators
    if filename.startswith(("/", "\\", "~")):
        return False
    
    # Check for Windows drive letters (C:, D:, etc.)
    if len(filename) > 1 and filename[1] == ":":
        return False
    
    # Check for null bytes
    if "\x00" in filename:
        return False
    
    # Validate extension if provided
    if allowed_extensions is not None:
        file_ext = os.path.splitext(filename)[1].lower()
        if file_ext not in allowed_extensions:
            return False
    
    return True


def validate_file_path(file_path: Path | str, base_dir: Path | str) -> bool:
    """
    Validate that a file path is within the allowed base directory.
    Protects against path traversal attacks.
    
    Args:
        file_path: The path to validate
        base_dir: The base directory that the path must be within
    
    Returns:
        True if the path is safe, False otherwise
    """
    try:
        # Convert to Path objects
        file_path = Path(file_path)
        base_dir = Path(base_dir)
        
        # Resolve to absolute paths (resolves .. and symlinks)
        resolved_file = file_path.resolve()
        resolved_base = base_dir.resolve()
        
        # Check if the resolved file path is within the base directory
        return resolved_file.is_relative_to(resolved_base)
    except (ValueError, OSError):
        # Handle errors in path resolution
        return False


def is_safe_serial_port(port: str) -> bool:
    """Validate that a serial port identifier looks like a real port, not a path.

    Allows common patterns:
    - Windows: COM3, COM10, \\\\.\\COM3
    - Linux: /dev/ttyUSB0, /dev/ttyACM0, /dev/ttyS0
    - macOS: /dev/cu.usbmodem1234, /dev/tty.usbserial-XXXX
    """
    if not port or not isinstance(port, str):
        return False
    port = port.strip()
    if not port:
        return False
    if "\x00" in port:
        return False
    if ".." in port:
        return False
    return _SERIAL_PORT_RE.match(port) is not None
