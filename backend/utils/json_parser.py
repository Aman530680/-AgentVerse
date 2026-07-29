import json
import re


def parse_json(text: str):
    """
    Safely extract JSON from LLM response.
    """

    text = text.strip()

    # Remove markdown if present
    text = re.sub(r"^```json", "", text, flags=re.IGNORECASE)
    text = re.sub(r"^```", "", text)
    text = re.sub(r"```$", "", text)

    text = text.strip()

    # Extract first JSON object
    match = re.search(r"\{.*\}", text, re.DOTALL)

    if not match:
        raise ValueError("No JSON object found.")

    return json.loads(match.group())