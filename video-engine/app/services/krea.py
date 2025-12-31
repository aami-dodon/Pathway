import requests
import os
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

class KreaService:
    BASE_URL = "https://api.krea.ai"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("KREA_API_KEY")
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    @staticmethod
    def validate_api_key(api_key: str) -> bool:
        """Validate the Krea API key by trying to list models."""
        try:
            # Note: Checking a generic endpoint to validate key
            resp = requests.post(
                "https://api.krea.ai/generate/image/bfl/flux-1-dev",
                json={"prompt": "test", "width": 512, "height": 512},
                headers={"Authorization": f"Bearer {api_key}"},
                timeout=10
            )
            # 200 means success, or at least auth ok
            return resp.status_code == 200
        except Exception as e:
            logger.error(f"Krea API Key validation failed: {e}")
            return False

    def list_models(self) -> List[Dict]:
        """Fetch available models from Krea. Currently hardcoded due to API discovery limits."""
        return [
            {"model_id": "bfl/flux-1-dev", "name": "Flux 1 Dev", "description": "High quality development model"},
            {"model_id": "bfl/flux-1-pro", "name": "Flux 1 Pro", "description": "Professional grade flux model"}
        ]

    def generate_image(self, prompt: str, model_id: str = "bfl/flux-1-dev", variants: int = 1, resolution: str = "1440x810") -> List[str]:
        """
        Generate images using Krea API.
        Returns a list of image URLs.
        """
        import time
        if not self.api_key:
            raise ValueError("API Key is missing")

        if "x" in resolution:
            width, height = map(int, resolution.split("x"))
        else:
            width, height = 1440, 810

        # Krea image generation is async
        url = f"{self.BASE_URL}/generate/image/{model_id}"
        payload = {
            "prompt": prompt,
            "width": width,
            "height": height
        }

        try:
            logger.info(f"Submitting Krea job to {url}")
            resp = requests.post(url, json=payload, headers=self.headers)
            resp.raise_for_status()
            job_data = resp.json()
            job_id = job_data.get("job_id")
            
            if not job_id:
                raise ValueError(f"No job_id returned from Krea: {job_data}")

            # Polling
            logger.info(f"Krea job submitted: {job_id}. Polling for completion...")
            max_attempts = 60 # 2 minutes
            for _ in range(max_attempts):
                status_resp = requests.get(f"{self.BASE_URL}/jobs/{job_id}", headers=self.headers)
                status_resp.raise_for_status()
                status_data = status_resp.json()
                
                status = status_data.get("status")
                if status == "completed":
                    # Krea usually returns a 'result' dict with a list of 'urls'
                    result_data = status_data.get("result", {})
                    if isinstance(result_data, dict):
                        if "urls" in result_data and isinstance(result_data["urls"], list):
                            return result_data["urls"]
                        if "url" in result_data:
                            return [result_data["url"]]
                    
                    # Fallback for old/other formats
                    results = status_data.get("result", [])
                    if isinstance(results, list):
                        return [r.get("url") if isinstance(r, dict) else r for r in results]
                    return [str(results)] if results else []
                elif status == "failed":
                    raise Exception(f"Krea job failed: {status_data.get('error')}")
                
                time.sleep(2)
            
            raise Exception("Krea image generation timed out")
            
        except requests.exceptions.HTTPError as e:
            msg = str(e)
            try:
                error_data = e.response.json()
                msg = error_data.get("message", msg)
                error_type = error_data.get("error", "")
                if e.response.status_code == 402 or "limit" in msg.lower() or "credit" in msg.lower():
                    msg = f"Krea API Limit Reached: {msg}"
                elif e.response.status_code == 429:
                    msg = "Krea API Rate Limit Exceeded. Please wait a moment."
            except:
                pass
            logger.error(f"Krea HTTP Error: {msg}")
            raise Exception(msg)
        except Exception as e:
            logger.error(f"Krea image generation failed: {e}")
            raise
