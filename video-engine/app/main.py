from fastapi import FastAPI
from app.api import health
from pathlib import Path

# Base directory for the project
BASE_DIR = Path(__file__).resolve().parent.parent

app = FastAPI(title="Video Engine API")

# Include routers
app.include_router(health.router)

if __name__ == "__main__":
    import uvicorn
    # Local-only execution
    uvicorn.run("app.main:app", host="127.0.0.1", port=8001, reload=True)
