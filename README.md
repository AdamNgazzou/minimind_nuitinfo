# NuitInfo Chatbot — Project README

## Project overview

This repository implements a web-based chatbot and brain-tumor detector. It combines:

- A FastAPI backend (backend/) that handles chat, conversation storage, summary generation, and a brain-tumor image detection endpoint.
- A Next.js frontend (frontend/) with UI components for chatting and uploading MRI images.

## How the application works

- Frontend: user interacts with the chat UI or uploads an MRI image. The frontend calls backend REST endpoints.
- Backend API (FastAPI): exposes endpoints under `/chat`:

  - POST `/chat/` — send a message; the app processes the message and returns a reply and an optional conversation summary.
  - GET `/chat/conversations/list` — returns a list of stored conversations.
  - GET `/chat/conversations/with-summary` — returns conversations with generated summaries for prompt context.
  - POST `/chat/summary/generate` — triggers generation and storage of a conversation summary (uses Gemini client in services).
  - GET `/chat/summary/retrieve` — retrieves the last stored summary.
  - POST `/chat/braintumor/detect` — accepts an uploaded image file; preprocesses the image, runs a PyTorch model, and returns predicted class + confidence.

- Database: async SQLAlchemy sessions are used to persist conversations, messages and summaries.
- LLM & Summaries: a Gemini client (located in `app/services/gemini_client.py`) is used to create summaries and to power conversational replies.
- Brain-tumor model: a PyTorch model file (`app/models/braintumor/brain_tumor_model.pth`) is loaded once at router startup and used by the `predict` function with `preprocess_image`.

## AI model(s) and data sources

- Brain tumor detector

  - Implementation: PyTorch model located at `app/models/braintumor/brain_tumor_model.pth`.
  - Input: MRI image (preprocessed to a tensor in `app/utils/image.py`).
  - Output: discrete class (tumor / no_tumor) and confidence score.
  - Notes: model file is loaded on app startup. The repository includes example images in `frontend/public/` (`brain-mri-scan-healthy.jpg`, `brain-mri-scan-tumor.jpg`). The README does not assume any particular training dataset — verify provenance before clinical use.

- Conversational LLM (Gemini)
  - Implementation: LLM client integration lives in `app/services/gemini_client.py` and is used by chat and summary services.
  - Data: conversation history is stored in the app database (see `app/core/database.py`). Summaries are created from the stored conversation history.

## Implementation steps (high level)

1. Project scaffolding: create FastAPI backend and Next.js frontend folders.
2. Build data models and DB layer using SQLAlchemy Async; create schemas in `app/schemas`.
3. Implement chat flow and storage in `app/services/chat_service.py` and conversation helpers in `conversation_service.py`.
4. Integrate LLM client (`gemini_client.py`) and craft prompts for replies and summaries. Add `prompts/summary_prompt.txt` for prompt engineering.
5. Add brain-tumor model: write `loader.py` to load the PyTorch `.pth` file and `predictor.py` to perform inference.
6. Implement image preprocessing (`app/utils/image.py`) to accept uploaded files/bytes and produce a tensor.
7. Wire endpoints in `app/routers/chat_router.py` and ensure proper dependency injection for Async DB sessions.
8. Build the Next.js UI components and wire API calls from the frontend components.

## Difficulties encountered & notes

- Async patterns and DB sessions: converting SQLAlchemy to fully async with correct session lifecycle (using `async_session` and `Depends`) required careful handling to avoid connection leaks.
- Model loading and inference:
  - Loading the PyTorch model once at startup required ensuring CPU/GPU device handling and thread-safety for async endpoints.
  - Image preprocessing needed robust handling of different image formats and byte streams.
- LLM integration & prompt engineering:
  - Designing prompts for consistent summaries and response tone took iterative tuning.
  - Rate limiting and error handling around external LLM API calls were necessary to avoid throttling.
- Testing & reproducibility:
  - Reproducible model inference depends on environment (CUDA vs CPU) and exact dependency versions.
  - No clinical validation: the brain tumor detector is for demonstration and should not be used for diagnosis without rigorous validation and appropriate datasets.

## Local setup

1. Backend: create a Python virtual environment and install dependencies
   - cd backend; python -m venv .venv; .\.venv\Scripts\Activate; pip install -r requirements.txt
2. Frontend: install Node dependencies and run dev server
   - cd frontend; npm install (or pnpm install); npm run dev
3. Start backend: from `backend/` run `uvicorn main:app --reload --port 8000`
4. Visit the frontend (usually http://localhost:3000) or call backend APIs directly (http://localhost:8000/docs for OpenAPI UI).

## Security & deployment notes

- Secure secrets (LLM API keys, DB credentials) via environment variables and a secrets manager; do not commit them.
- Validate and limit file upload sizes in production.
- Run model inference on appropriate hardware and containerize for production (Docker).

## Next steps / Improvements

- Add automated tests for endpoints and model inference.
- Add model provenance and dataset documentation, plus evaluation metrics.
- Add streaming responses for long chat replies and improved UI for summary display.

---

Generated README for the NuitInfo chatbot project.
