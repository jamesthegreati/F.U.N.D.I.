"""
Conversation Memory System for FUNDI AI

Manages conversation history and circuit state snapshots for context-aware
AI responses across multiple turns of dialogue.
"""

import time
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field


@dataclass
class Message:
    """A single message in the conversation."""
    role: str  # "user" or "assistant"
    content: str
    timestamp: float = field(default_factory=time.time)
    circuit_state: Optional[Dict[str, Any]] = None


@dataclass
class CircuitSnapshot:
    """A snapshot of the circuit state at a point in time."""
    parts: List[Dict[str, Any]]
    connections: List[Dict[str, Any]]
    code: str
    timestamp: float = field(default_factory=time.time)


class ConversationMemory:
    """
    Manages conversation history and circuit state for AI context.
    
    Features:
    - Stores message history with timestamps
    - Tracks circuit evolution over conversation
    - Generates context summaries for AI prompts
    - Computes diffs between circuit versions
    """
    
    def __init__(self, max_messages: int = 20, max_snapshots: int = 10):
        """
        Initialize conversation memory.
        
        Args:
            max_messages: Maximum number of messages to retain
            max_snapshots: Maximum number of circuit snapshots to retain
        """
        self.messages: List[Message] = []
        self.circuit_snapshots: List[CircuitSnapshot] = []
        self.max_messages = max_messages
        self.max_snapshots = max_snapshots
    
    def add_message(
        self,
        role: str,
        content: str,
        circuit_state: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Add a message to the conversation history.
        
        Args:
            role: "user" or "assistant"
            content: Message content
            circuit_state: Optional current circuit state to snapshot
        """
        msg = Message(role=role, content=content, circuit_state=circuit_state)
        self.messages.append(msg)
        
        # Trim old messages if exceeding limit
        if len(self.messages) > self.max_messages:
            self.messages = self.messages[-self.max_messages:]
        
        # Take circuit snapshot if state provided
        if circuit_state:
            self._add_circuit_snapshot(circuit_state)
    
    def _add_circuit_snapshot(self, circuit_state: Dict[str, Any]) -> None:
        """Add a circuit snapshot to history."""
        snapshot = CircuitSnapshot(
            parts=circuit_state.get("parts", []),
            connections=circuit_state.get("connections", []),
            code=circuit_state.get("code", "")
        )
        self.circuit_snapshots.append(snapshot)
        
        # Trim old snapshots
        if len(self.circuit_snapshots) > self.max_snapshots:
            self.circuit_snapshots = self.circuit_snapshots[-self.max_snapshots:]
    
    def get_context(self, last_n: int = 10) -> str:
        """
        Generate a context summary for the AI.
        
        Args:
            last_n: Number of recent messages to include
        
        Returns:
            Formatted context string for AI prompt
        """
        if not self.messages:
            return ""
        
        recent = self.messages[-last_n:]
        lines = ["## Recent Conversation History"]
        
        for msg in recent:
            role_label = "User" if msg.role == "user" else "Assistant"
            # Truncate long messages
            content = msg.content[:500] + "..." if len(msg.content) > 500 else msg.content
            lines.append(f"\n**{role_label}**: {content}")
        
        return "\n".join(lines)
    
    def get_conversation_for_api(self, last_n: int = 10) -> List[Dict[str, str]]:
        """
        Get conversation history formatted for API calls.
        
        Args:
            last_n: Number of recent messages to include
        
        Returns:
            List of message dictionaries with "role" and "content"
        """
        recent = self.messages[-last_n:]
        return [{"role": msg.role, "content": msg.content} for msg in recent]
    
    def get_circuit_diff(self) -> str:
        """
        Describe what changed between the last two circuit versions.
        
        Returns:
            Human-readable description of circuit changes
        """
        if len(self.circuit_snapshots) < 2:
            return ""
        
        prev = self.circuit_snapshots[-2]
        curr = self.circuit_snapshots[-1]
        
        changes = []
        
        # Compare parts
        prev_parts = {p.get("id"): p for p in prev.parts}
        curr_parts = {p.get("id"): p for p in curr.parts}
        
        added_parts = set(curr_parts.keys()) - set(prev_parts.keys())
        removed_parts = set(prev_parts.keys()) - set(curr_parts.keys())
        
        if added_parts:
            changes.append(f"Added components: {', '.join(added_parts)}")
        if removed_parts:
            changes.append(f"Removed components: {', '.join(removed_parts)}")
        
        # Compare connections
        prev_conn_count = len(prev.connections)
        curr_conn_count = len(curr.connections)
        
        if curr_conn_count > prev_conn_count:
            changes.append(f"Added {curr_conn_count - prev_conn_count} connections")
        elif curr_conn_count < prev_conn_count:
            changes.append(f"Removed {prev_conn_count - curr_conn_count} connections")
        
        # Compare code (rough check)
        if prev.code != curr.code:
            prev_lines = len(prev.code.split('\n'))
            curr_lines = len(curr.code.split('\n'))
            if curr_lines > prev_lines:
                changes.append(f"Code expanded ({prev_lines} → {curr_lines} lines)")
            elif curr_lines < prev_lines:
                changes.append(f"Code reduced ({prev_lines} → {curr_lines} lines)")
            else:
                changes.append("Code modified")
        
        if not changes:
            return "No significant changes detected"
        
        return "Circuit changes: " + "; ".join(changes)
    
    def get_current_circuit_summary(self) -> str:
        """
        Get a summary of the current circuit state.
        
        Returns:
            Human-readable circuit summary
        """
        if not self.circuit_snapshots:
            return "No circuit state available"
        
        curr = self.circuit_snapshots[-1]
        
        # Count component types
        type_counts: Dict[str, int] = {}
        for part in curr.parts:
            part_type = part.get("type", "unknown")
            # Normalize type name
            if part_type.startswith("wokwi-"):
                part_type = part_type[6:]
            type_counts[part_type] = type_counts.get(part_type, 0) + 1
        
        components = ", ".join(f"{count}x {name}" for name, count in type_counts.items())
        
        return f"Current circuit: {components}; {len(curr.connections)} connections"

    def get_latest_circuit_state(self) -> Optional[Dict[str, Any]]:
        """Return the most recent circuit state snapshot, if any."""
        if not self.circuit_snapshots:
            return None

        curr = self.circuit_snapshots[-1]
        return {
            "parts": curr.parts,
            "connections": curr.connections,
            "code": curr.code,
        }
    
    def clear(self) -> None:
        """Clear all conversation history and snapshots."""
        self.messages.clear()
        self.circuit_snapshots.clear()
    
    def get_summary(self) -> str:
        """
        Get a brief summary of the conversation.
        
        Returns:
            Summary string for logging/debugging
        """
        return (
            f"ConversationMemory: {len(self.messages)} messages, "
            f"{len(self.circuit_snapshots)} circuit snapshots"
        )


# Session storage for multiple conversations
_sessions: Dict[str, ConversationMemory] = {}


def get_session(session_id: str) -> ConversationMemory:
    """
    Get or create a conversation memory session.
    
    Args:
        session_id: Unique identifier for the session
    
    Returns:
        ConversationMemory instance for this session
    """
    if session_id not in _sessions:
        _sessions[session_id] = ConversationMemory()
    return _sessions[session_id]


def clear_session(session_id: str) -> None:
    """
    Clear and remove a session.
    
    Args:
        session_id: Session to clear
    """
    if session_id in _sessions:
        _sessions[session_id].clear()
        del _sessions[session_id]


def cleanup_old_sessions(max_age_seconds: float = 3600) -> int:
    """
    Remove sessions older than max_age_seconds.
    
    Args:
        max_age_seconds: Maximum age in seconds (default: 1 hour)
    
    Returns:
        Number of sessions removed
    """
    current_time = time.time()
    to_remove = []
    
    for session_id, memory in _sessions.items():
        if memory.messages:
            last_activity = memory.messages[-1].timestamp
            if current_time - last_activity > max_age_seconds:
                to_remove.append(session_id)
        else:
            # Empty sessions are removed
            to_remove.append(session_id)
    
    for session_id in to_remove:
        del _sessions[session_id]
    
    return len(to_remove)
