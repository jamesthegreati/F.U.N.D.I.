"""
Thread-safe session manager for multi-user state management.

This module provides a SessionManager class that stores user state
keyed by UUID session IDs with automatic TTL cleanup.
"""

from __future__ import annotations

import threading
import time
import uuid
from typing import Any, Dict, Optional


class SessionManager:
    """
    Thread-safe session manager with TTL (Time-To-Live) support.
    
    Stores session state in a dictionary keyed by UUID.
    Automatically cleans up expired sessions.
    """
    
    DEFAULT_TTL_SECONDS = 3600  # 1 hour default TTL
    
    def __init__(self, ttl_seconds: int = DEFAULT_TTL_SECONDS):
        """
        Initialize the session manager.
        
        Args:
            ttl_seconds: Time-to-live for sessions in seconds (default: 1 hour)
        """
        self._sessions: Dict[str, Dict[str, Any]] = {}
        self._timestamps: Dict[str, float] = {}
        self._lock = threading.Lock()
        self._ttl_seconds = ttl_seconds
    
    def create_session(self) -> str:
        """
        Create a new session with a unique UUID.
        
        Returns:
            The generated session ID (UUID string)
        """
        session_id = str(uuid.uuid4())
        with self._lock:
            self._sessions[session_id] = self._default_state()
            self._timestamps[session_id] = time.time()
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the state for a session.
        
        Args:
            session_id: The session UUID
            
        Returns:
            The session state dictionary, or None if session doesn't exist or is expired
        """
        with self._lock:
            if session_id not in self._sessions:
                return None
            
            # Check if session has expired
            if self._is_expired(session_id):
                self._remove_session_unsafe(session_id)
                return None
            
            # Update timestamp on access (sliding expiration)
            self._timestamps[session_id] = time.time()
            return self._sessions[session_id]
    
    def get_or_create_session(self, session_id: Optional[str]) -> tuple[str, Dict[str, Any]]:
        """
        Get an existing session or create a new one.
        
        Args:
            session_id: The session UUID (or None to create new)
            
        Returns:
            Tuple of (session_id, session_state)
        """
        if session_id:
            state = self.get_session(session_id)
            if state is not None:
                return session_id, state
        
        # Create new session
        new_id = self.create_session()
        return new_id, self._sessions[new_id]
    
    def update_session(self, session_id: str, updates: Dict[str, Any]) -> bool:
        """
        Update the state for a session.
        
        Args:
            session_id: The session UUID
            updates: Dictionary of key-value pairs to update
            
        Returns:
            True if session was updated, False if session doesn't exist
        """
        with self._lock:
            if session_id not in self._sessions:
                return False
            
            if self._is_expired(session_id):
                self._remove_session_unsafe(session_id)
                return False
            
            self._sessions[session_id].update(updates)
            self._timestamps[session_id] = time.time()
            return True
    
    def set_session_value(self, session_id: str, key: str, value: Any) -> bool:
        """
        Set a specific value in a session.
        
        Args:
            session_id: The session UUID
            key: The key to set
            value: The value to set
            
        Returns:
            True if successful, False if session doesn't exist
        """
        with self._lock:
            if session_id not in self._sessions:
                return False
            
            if self._is_expired(session_id):
                self._remove_session_unsafe(session_id)
                return False
            
            self._sessions[session_id][key] = value
            self._timestamps[session_id] = time.time()
            return True
    
    def remove_session(self, session_id: str) -> bool:
        """
        Remove a session.
        
        Args:
            session_id: The session UUID
            
        Returns:
            True if session was removed, False if it didn't exist
        """
        with self._lock:
            return self._remove_session_unsafe(session_id)
    
    def cleanup_expired_sessions(self) -> int:
        """
        Clean up all expired sessions.
        
        Returns:
            Number of sessions removed
        """
        removed_count = 0
        with self._lock:
            expired_ids = [
                sid for sid in self._sessions.keys()
                if self._is_expired(sid)
            ]
            for sid in expired_ids:
                self._remove_session_unsafe(sid)
                removed_count += 1
        return removed_count
    
    def _is_expired(self, session_id: str) -> bool:
        """Check if a session has expired (must be called with lock held)."""
        if session_id not in self._timestamps:
            return True
        age = time.time() - self._timestamps[session_id]
        return age > self._ttl_seconds
    
    def _remove_session_unsafe(self, session_id: str) -> bool:
        """Remove a session without acquiring lock (must be called with lock held)."""
        if session_id in self._sessions:
            del self._sessions[session_id]
            self._timestamps.pop(session_id, None)
            return True
        return False
    
    @staticmethod
    def _default_state() -> Dict[str, Any]:
        """Return the default state for a new session."""
        return {
            "files": [],
            "components": [],
            "connections": [],
            "compilation": {
                "is_compiling": False,
                "error": None,
                "hex": None,
                "board": None,
            },
            "serial_output": [],
        }


# Global singleton instance
_session_manager: Optional[SessionManager] = None


def get_session_manager() -> SessionManager:
    """Get the global session manager instance."""
    global _session_manager
    if _session_manager is None:
        _session_manager = SessionManager()
    return _session_manager
