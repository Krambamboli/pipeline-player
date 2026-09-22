"""
Answer Generation Schema
--------------------------
Pydantic models for the GPT-4o RAG answer generation endpoint.
The user sends ranked chunks + query, and receives a grounded answer.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class AnswerRequest(BaseModel):
    """Request body for generating an answer from ranked chunks via GPT-4o."""
    query: str = Field(..., description="The original user query.")
    chunks: List[str] = Field(..., description="The ranked chunk texts to use as context.")
    model: str = Field(default="gpt-4o", description="OpenAI model to use (e.g. 'gpt-4o', 'gpt-4o-mini').")
    image_references: Optional[List[dict]] = Field(
        default=None, 
        description="List of dicts with 'source' (pdf filename) and 'page' (1-indexed) to inject images into the prompt."
    )


class AnswerResponse(BaseModel):
    """Non-streaming response (used for documentation; actual endpoint streams SSE)."""
    answer: str = Field(..., description="The generated answer text.")
