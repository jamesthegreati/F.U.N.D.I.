"""
Prompt Management System

Loads and composes prompts from the modular prompt architecture.
"""

import json
from pathlib import Path
from typing import Optional, List, Dict, Any

# Base directory for prompts
PROMPTS_DIR = Path(__file__).parent / "prompts"


def load_prompt(path: str) -> str:
    """Load a prompt file from the prompts directory."""
    full_path = PROMPTS_DIR / path
    if not full_path.exists():
        raise FileNotFoundError(f"Prompt file not found: {path}")
    return full_path.read_text(encoding="utf-8")


def load_json_prompt(path: str) -> Dict[str, Any]:
    """Load a JSON prompt file from the prompts directory."""
    full_path = PROMPTS_DIR / path
    if not full_path.exists():
        raise FileNotFoundError(f"Prompt file not found: {path}")
    return json.loads(full_path.read_text(encoding="utf-8"))


def get_component_catalog() -> Dict[str, Any]:
    """Load the component catalog."""
    return load_json_prompt("components/component_catalog.json")


def get_example_projects() -> List[Dict[str, Any]]:
    """Load all example projects."""
    examples_dir = PROMPTS_DIR / "examples"
    examples = []
    for file in examples_dir.glob("*.json"):
        try:
            examples.append(json.loads(file.read_text(encoding="utf-8")))
        except (json.JSONDecodeError, Exception):
            continue
    return examples


def select_relevant_examples(prompt: str, max_examples: int = 2) -> str:
    """Select examples relevant to the user's prompt based on keyword matching."""
    examples = get_example_projects()
    if not examples:
        return ""
    
    prompt_lower = prompt.lower()
    scored_examples = []
    
    for example in examples:
        score = 0
        name = example.get("name", "").lower()
        description = example.get("description", "").lower()
        
        # Simple keyword matching
        keywords = name.split() + description.split()
        for keyword in keywords:
            if len(keyword) > 3 and keyword in prompt_lower:
                score += 1
        
        # Complexity matching
        if "simple" in prompt_lower and example.get("complexity") == "simple":
            score += 2
        elif "advanced" in prompt_lower and example.get("complexity") == "advanced":
            score += 2
            
        scored_examples.append((score, example))
    
    # Sort by score and take top examples
    scored_examples.sort(key=lambda x: x[0], reverse=True)
    selected = [ex for score, ex in scored_examples[:max_examples] if score > 0]
    
    if not selected:
        # Return a simple example as fallback
        simple_examples = [ex for ex in examples if ex.get("complexity") == "simple"]
        selected = simple_examples[:1] if simple_examples else examples[:1]
    
    # Format examples for the prompt
    formatted = []
    for ex in selected:
        formatted.append(f"""
### Example: {ex.get('name', 'Unnamed')}
Description: {ex.get('description', '')}

Code:
```cpp
{ex.get('code', '')}
```

Circuit Parts: {json.dumps(ex.get('circuit_parts', []), indent=2)}

Connections: {json.dumps(ex.get('connections', []), indent=2)}
""")
    
    return "\n".join(formatted)


def build_system_prompt(
    mode: str = "builder",
    include_examples: bool = True,
    user_prompt: Optional[str] = None,
) -> str:
    """
    Build a complete system prompt from modular components.
    
    Args:
        mode: 'builder', 'teacher', or 'debug'
        include_examples: Whether to include example projects
        user_prompt: Optional user prompt for example selection
    """
    sections = []
    
    # Base prompts
    try:
        sections.append(load_prompt("base/system_role.md"))
    except FileNotFoundError:
        pass
    
    # Mode-specific prompt
    mode_file = f"modes/{mode}_mode.md"
    try:
        sections.append(load_prompt(mode_file))
    except FileNotFoundError:
        # Fall back to builder mode
        try:
            sections.append(load_prompt("modes/builder_mode.md"))
        except FileNotFoundError:
            pass
    
    # Output format
    try:
        sections.append(load_prompt("base/output_format.md"))
    except FileNotFoundError:
        pass
    
    # Safety rules
    try:
        sections.append(load_prompt("base/safety_rules.md"))
    except FileNotFoundError:
        pass
    
    # Component catalog (summarized)
    try:
        catalog = get_component_catalog()
        pin_summary = []
        for part_type, spec in catalog.items():
            pins = spec.get("pins", [])
            if isinstance(pins, dict):
                all_pins = []
                for category_pins in pins.values():
                    all_pins.extend(category_pins)
                pins = all_pins[:10]  # Limit for brevity
            pin_summary.append(f"- {part_type}: pins = {pins}")
        
        sections.append(f"""
## Component Pin Reference (USE EXACT PIN NAMES)

{chr(10).join(pin_summary[:20])}

Note: Always use exact pin names as shown above. For full catalog, reference component_catalog.json.
""")
    except FileNotFoundError:
        pass
    
    # Wiring rules
    try:
        sections.append(load_prompt("components/wiring_rules.md"))
    except FileNotFoundError:
        pass
    
    # Examples
    if include_examples and user_prompt:
        examples = select_relevant_examples(user_prompt)
        if examples:
            sections.append(f"""
## Reference Examples

Study these examples for correct formatting:
{examples}
""")
    
    return "\n\n---\n\n".join(sections)


def get_vision_prompt() -> str:
    """Get the system prompt for vision/image analysis mode."""
    base = """You are a Computer Vision expert specializing in electronic circuit analysis.

Your task is to analyze an image of a physical breadboard circuit and reconstruct it virtually.

ANALYSIS PROCESS:
1. Identify all components in the image (Arduino boards, LEDs, resistors, wires, etc.)
2. Determine the physical layout and positions
3. Trace wire connections between components
4. Generate a virtual circuit representation

OUTPUT REQUIREMENTS:
- Use STANDARD Wokwi part IDs for all components
- Calculate appropriate x/y coordinates based on the physical layout
- Map connections correctly between pins
- For each connection, specify color based on signal type:
  * Power (VCC, 5V): color="#ef4444" (red), signal_type="power"
  * Ground (GND): color="#000000" (black), signal_type="ground"
  * Digital: color="#3b82f6" (blue), signal_type="digital"
  * Analog: color="#22c55e" (green), signal_type="analog"
- Provide an explanation of what you identified
"""
    
    try:
        output_format = load_prompt("base/output_format.md")
        return base + "\n\n" + output_format
    except FileNotFoundError:
        return base
