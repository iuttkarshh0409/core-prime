import sys
import os
from pathlib import Path

# Add backend and app folders to sys.path so the api can find them
root = Path(__file__).resolve().parent.parent
backend_path = root / "backend"
app_path = backend_path / "app"

if str(backend_path) not in sys.path: sys.path.append(str(backend_path))
if str(app_path) not in sys.path: sys.path.append(str(app_path))

# NOW IMPORT THE APP
from app.main import app, handler

# This is the Vercel entry point
def index(request):
    return handler(request)

# Explicitly export app/handler for Mangum
app = app
handler = handler
