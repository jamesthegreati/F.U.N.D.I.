from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints.generate import router as generate_router
from app.core.config import settings

app = FastAPI(title="FUNDI Brain")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate_router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "version": "1.0.0"}
