"""
Answer Generator Service
--------------------------
Generates grounded answers from retrieved chunks using OpenAI's GPT-4o.

WHY: After hybrid retrieval returns the most relevant chunks, users want
a synthesised answer rather than reading through individual chunks.
GPT-4o excels at this because it can follow instructions to cite sources
and stay grounded in the provided context.

HOW: We build a RAG prompt with the chunk texts as context, send it to
the OpenAI API with streaming enabled, and yield tokens one-by-one for
real-time display in the UI via SSE.

The API key is read from the OPENAI_API_KEY environment variable.
"""

from __future__ import annotations

import logging
import os
from typing import Generator

logger = logging.getLogger(__name__)


def generate_answer_stream(
    query: str,
    chunks: list[str],
    model: str = "gpt-4o",
    image_references: list[dict] | None = None,
) -> Generator[str, None, None]:
    """
    Stream tokens from GPT-4o given a query, context chunks, and optional images.

    Yields individual tokens as strings. The caller (router) wraps
    these into SSE `data:` frames for the frontend EventSource.

    Raises:
        RuntimeError: If OPENAI_API_KEY is not set.
        Exception: If the OpenAI API call fails.
    """
    # Import here to avoid import errors when openai is not installed
    from openai import OpenAI
    import base64

    if model.startswith("ollama/"):
        # Use local Ollama via its OpenAI-compatible endpoint
        client = OpenAI(
            base_url="http://localhost:11434/v1",
            api_key="ollama"
        )
        model = model[len("ollama/"):]
    elif model.startswith("gemini"):
        # We handle Gemini separately below because it uses a different SDK
        pass
    else:
        api_key = os.environ.get("OPENAI_API_KEY", "")
        if not api_key:
            raise RuntimeError(
                "OPENAI_API_KEY environment variable is not set. "
                "Export it before starting the backend, or select a local Ollama model instead."
            )
        client = OpenAI(api_key=api_key)

    # Build the RAG prompt — numbered chunks for easy citation
    numbered_chunks = []
    for i, chunk in enumerate(chunks, 1):
        if image_references:
            # If we have images, the chunk text usually contains the page metadata.
            numbered_chunks.append(f"[Page {i}]\n{chunk}")
        else:
            numbered_chunks.append(f"[Chunk {i}]\n{chunk}")
    context_text = "\n\n---\n\n".join(numbered_chunks)

    system_prompt = (
        "You are a helpful research assistant. Answer the user's question "
        "based ONLY on the provided context chunks or images. "
        "When you use information, cite it (e.g. [Chunk N] or [Page N]). "
        "If the answer cannot be found in the context, say so clearly. "
        "Answer in the same language as the question."
    )

    user_prompt = f"Context:\n{context_text}\n\nQuestion: {query}"

    # Build the message content array
    content_list = [{"type": "text", "text": user_prompt}]

    if image_references:
        # Load the images from the PDFs using PyMuPDF
        import fitz
        from pathlib import Path
        
        REPO_ROOT = Path(__file__).resolve().parent.parent.parent
        TEST_DATA_DIR = REPO_ROOT / "test_data"
        
        for ref in image_references:
            try:
                pdf_path = TEST_DATA_DIR / ref["source"]
                if not pdf_path.exists():
                    logger.warning(f"PDF not found for image rendering: {pdf_path}")
                    continue
                    
                doc = fitz.open(str(pdf_path))
                page_idx = ref["page"] - 1 # 1-indexed to 0-indexed
                if 0 <= page_idx < len(doc):
                    page = doc.load_page(page_idx)
                    # Render at 150 DPI to keep token usage reasonable while remaining legible
                    pix = page.get_pixmap(dpi=150)
                    img_bytes = pix.tobytes("jpeg")
                    b64_str = base64.b64encode(img_bytes).decode('utf-8')
                    
                    content_list.append({
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{b64_str}"}
                    })
                doc.close()
            except Exception as e:
                logger.warning(f"Failed to render image for {ref}: {e}")

    logger.info("Generating answer with model=%s, chunks=%d, images=%d", model, len(chunks), len(image_references) if image_references else 0)

    if model.startswith("gemini"):
        from google import genai
        
        api_key = os.environ.get("GEMINI_API_KEY", "")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY environment variable is not set. Please export it to use Gemini models.")
        
        gemini_client = genai.Client(api_key=api_key)
        
        # Prepare input for Gemini Interactions API
        gemini_input = [{"type": "text", "text": user_prompt}]
        if image_references:
            for item in content_list:
                if item.get("type") == "image_url":
                    # Extract base64 and mime type
                    data_url = item["image_url"]["url"]
                    if data_url.startswith("data:"):
                        mime_type = data_url.split(";")[0][5:]
                        b64_data = data_url.split(",")[1]
                        gemini_input.append({
                            "type": "image",
                            "data": b64_data,
                            "mime_type": mime_type
                        })

        stream = gemini_client.interactions.create(
            model=model,
            input=gemini_input,
            stream=True
        )
        
        for event in stream:
            if event.event_type == "step.delta" and event.delta.type == "text":
                yield event.delta.text
    else:
        # Stream the response token-by-token for OpenAI/Ollama
        stream = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": content_list},
            ],
            stream=True,
            temperature=0.3,  # Low temperature for grounded, factual answers
        )

        for chunk in stream:
            delta = chunk.choices[0].delta
            if delta.content:
                yield delta.content
