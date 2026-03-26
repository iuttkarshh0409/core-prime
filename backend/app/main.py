import sys
import os
from pathlib import Path

# Add backend directory to path
backend_path = str(Path(__file__).resolve().parent.parent)
if backend_path not in sys.path:
    sys.path.append(backend_path)

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router

app = FastAPI(
    title="Habit Tracker API",
    description="A production-grade habit-tracking backend with explainable analytics.",
    version="1.0.0"
)

# Standard CORS setup
# In real production, this SHOULD NOT be "*".
# Ideally load from .env: [http://localhost:3000, http://localhost:5173]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from mangum import Mangum

from fastapi.responses import JSONResponse
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    headers = {"X-Error": str(exc).replace("\n", " ")}
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": traceback.format_exc()},
        headers=headers
    )

# Root router inclusion (v1)
app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "The Habit Tracker API is live."}

# Vercel handler
handler = Mangum(app)
