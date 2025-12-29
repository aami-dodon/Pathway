from fastapi import APIRouter
from pydantic import BaseModel
from pathlib import Path
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class SourceModel(BaseModel):
    type: str
    value: str

class RenderRequest(BaseModel):
    source: SourceModel
    text: str
    template: str

@router.post("/render")
async def render_stub(request: RenderRequest):
    """
    Stub endpoint for video rendering.
    Validates payload, logs it, creates a dummy file, and returns status.
    """
    # Log the received payload
    print(f"Received render payload: {request.dict()}")

    # Define output directory and file
    # Resolving relative to the project root (video-engine/)
    # unique to where this file is: video-engine/app/api/render.py
    base_dir = Path(__file__).resolve().parent.parent.parent
    output_dir = base_dir / "outputs"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    output_file = output_dir / "placeholder.txt"
    
    # Create a dummy file
    output_file.write_text(f"Stub output for request: {request.text}")

    return {
        "status": "accepted",
        "output_path": "outputs/placeholder.txt"
    }
