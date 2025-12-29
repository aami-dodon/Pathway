import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class GeminiService:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-flash-latest')

    def _extract_text(self, response):
        try:
            return response.text
        except ValueError:
            # Handle cases where response might be blocked or have multiple parts
            if response.candidates:
                candidate = response.candidates[0]
                if candidate.content.parts:
                    return "".join(part.text for part in candidate.content.parts)
            return "Content generation failed due to safety filters or empty response."

    def generate_blog(self, prompt: str) -> str:
        full_prompt = f"Generate a blog post of minimum 150 words from this: {prompt}"
        response = self.model.generate_content(full_prompt)
        return self._extract_text(response)

    def generate_video_script(self, prompt: str) -> str:
        full_prompt = f"Generate an impactful text for a 60 second video from this: {prompt}. The text should be engaging and suitable for a video script."
        response = self.model.generate_content(full_prompt)
        return self._extract_text(response)
