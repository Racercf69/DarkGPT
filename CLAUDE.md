# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DarkGPT is a Flask-based AI backend that exposes REST endpoints for LLM-powered chat and document ingestion. It uses Groq-hosted Llama/Mixtral models for inference, OpenAI embeddings for vectorization, and ChromaDB as the vector store. The `website/` directory is an unrelated static HTML site (a local business page) that coexists in the repo.

## Running the Backend

```bash
cd backend
pip install -r requirements.txt
python app/app.py          # starts Flask on http://localhost:5000
```

Required environment variables (not yet loaded via dotenv — set in shell or add python-dotenv):
- `GROQ_API_KEY` — used by `langchain-groq` for Llama/Mixtral inference
- `OPENAI_API_KEY` — used by `OpenAIEmbeddings` and the Whisper transcription services

The `temp/` directory must exist at the repo root (relative to where the server runs) before uploading files, as `upload.py` writes to it without creating it.

## Architecture

### Request Flow

```
POST /api/chat   →  endpoints.py  →  llm_pipeline.process_query()  →  ChatGroq
POST /api/upload →  upload.py     →  CustomVectorStore.add_document()  →  OpenAIEmbeddings
```

### Key Module Responsibilities

| Module | Role |
|---|---|
| `app/app.py` | Flask app factory; registers both blueprints under `/api` |
| `app/api/endpoints.py` | `POST /api/chat` — validates `query` field, delegates to `process_query()` |
| `app/api/upload.py` | `POST /api/upload` — saves multipart file to `temp/`, indexes it, deletes it |
| `app/core/llm_pipeline.py` | Instantiates `ChatGroq` and runs inference |
| `app/core/vector_store.py` | `CustomVectorStore` extends LangChain's abstract `VectorStore`; holds documents in memory |
| `app/core/text_pipeline.py` | Helper that wraps vector store embedding generation |
| `app/models/document.py` | SQLAlchemy ORM model (`documents` table: id, title, content, embedding) |
| `app/services/text_to_speech.py` | Transcribes audio via `openai.Audio.transcribe("whisper-1", ...)` |
| `app/services/video_handler.py` | Same Whisper transcription path, applied to video bytes |

### Known Incomplete Wiring

- `llm_pipeline.py` calls `model.generate(query)` — the correct LangChain v0.1+ call is `model.invoke(query).content`.
- `CustomVectorStore` does not implement the required abstract methods (`similarity_search`, `add_texts`, `from_texts`) from LangChain's `VectorStore` base class; instantiating it will raise `TypeError` at runtime.
- `text_pipeline.py` calls `vector_store.store_embedding(text)` — that method doesn't exist on `CustomVectorStore`.
- `app/models/document.py` imports from `app.database` (a `Base` object) — that module does not exist yet; SQLAlchemy sessions/engine setup is missing.
- The Dockerfile references a `frontend/` directory that does not exist in the repo.

## Static Website

`website/` is a standalone static site (HTML/CSS/JS, no build step). Serve it with:

```bash
python -m http.server 8000 --directory website
```

It has no connection to the Flask backend.

## Dependencies

Pinned to avoid conflicts:
- `protobuf==3.20.3`
- `typing-extensions==4.5.0`
- `tokenizers==0.13.3`

When adding packages, verify compatibility with these pinned versions before upgrading them.

## No Tests or Linter Configured

There are currently no test files, no pytest configuration, and no linter setup. If adding tests, use `pytest` from the `backend/` directory:

```bash
cd backend
pytest
```
