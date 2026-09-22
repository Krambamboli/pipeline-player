import os
from google import genai
import asyncio

api_key = os.environ.get("GEMINI_API_KEY", "")
gemini_client = genai.Client(api_key=api_key)

gemini_input = [
    {"type": "text", "text": "Explain how AI works in a few words"}
]

print("Calling API...")
stream = gemini_client.interactions.create(
    model="gemini-3.6-flash",
    input=gemini_input,
    stream=True
)

for event in stream:
    if event.event_type == "step.delta" and event.delta.type == "text":
        print(event.delta.text, end="", flush=True)
print("\nDone")
