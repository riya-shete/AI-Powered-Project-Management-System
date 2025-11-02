import json
import re
import logging

logger = logging.getLogger(__name__)

def robust_json_parse(text: str):
    """
    Robust JSON parsing with multiple fallback strategies
    """
    if not text or not text.strip():
        return {"error": "Empty text provided"}
    
    cleaned = text.strip()
    
    # Strategy 1: Try direct JSON parsing
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
    
    # Strategy 2: Extract JSON using regex patterns
    json_patterns = [
        r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}',  # Nested objects
        r'\[[^\[\]]*(?:\[[^\[\]]*\][^\[\]]*)*\]',  # Nested arrays
    ]
    
    for pattern in json_patterns:
        matches = re.findall(pattern, cleaned, re.DOTALL)
        for match in matches:
            try:
                return json.loads(match)
            except json.JSONDecodeError:
                continue
    
    # Strategy 3: Find first { or [ and try to parse
    for start_char, end_char in [('{', '}'), ('[', ']')]:
        start_idx = cleaned.find(start_char)
        if start_idx != -1:
            end_idx = cleaned.rfind(end_char)
            if end_idx != -1 and end_idx > start_idx:
                try:
                    json_str = cleaned[start_idx:end_idx+1]
                    return json.loads(json_str)
                except json.JSONDecodeError:
                    pass
    
    # Strategy 4: Try to fix common JSON issues
    try:
        # Remove trailing commas before } or ]
        fixed_json = re.sub(r',\s*([}\]])', r'\1', cleaned)
        # Ensure proper string escaping
        fixed_json = fixed_json.replace('\\', '\\\\')
        return json.loads(fixed_json)
    except json.JSONDecodeError:
        pass
    
    # Final fallback
    logger.warning(f"All JSON parsing strategies failed for text: {cleaned[:200]}...")
    return {
        "error": "Could not parse response as JSON",
        "raw_text": cleaned[:500],
        "suggestion": "The AI model might not be following JSON format instructions"
    }