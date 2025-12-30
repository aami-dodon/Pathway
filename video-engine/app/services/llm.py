import os
import google.generativeai as genai
import json
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

class GeminiService:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment")
        genai.configure(api_key=api_key)
        
        # Load dynamic settings
        base_dir = Path(__file__).resolve().parent.parent.parent
        settings_path = base_dir / "data" / "settings.json"
        model_name = 'gemini-flash-latest'
        
        if settings_path.exists():
            try:
                with open(settings_path, "r") as f:
                    settings = json.load(f)
                    model_name = settings.get("llm_model", model_name)
                    # genai.GenerativeModel expects 'gemini-flash-latest' without 'models/' prefix 
                    # if using the short name, but can take full path too.
                    if model_name.startswith("models/"):
                        model_name = model_name.replace("models/", "")
            except:
                pass
                
        self.model = genai.GenerativeModel(model_name)

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

    def generate_content(self, prompt: str) -> dict:
        """
        Generate comprehensive content package:
        - blog: Full blog post (minimum 150 words)
        - excerpt: Short summary for preview
        - speech: Concise script for 60-second voiceover
        """
        full_prompt = f"""Generate content based on this topic: "{prompt}"

Please provide THREE distinct outputs in your response:

1. BLOG POST: Write a comprehensive blog post of minimum 150 words. Make it informative and engaging.

2. EXCERPT: Write a brief 2-3 sentence summary that captures the essence of the blog.

3. SPEECH SCRIPT: Write a compelling 60-second video voiceover script.
   - Tone: Storytelling, engaging, personal, and authentic.
   - Content: Tell a VERY SHORT REAL LIFE STORY related to the topic.
   - Goal: Build intense CURIOSITY. Start with the story, and lead to a realization or question.
   - Constraint: Do NOT resolve the story fully. Leave a "Curiosity Gap" that implies the answer is in the written text.
   - Constraint: Do NOT explicitly say "Read the blog" or "Link in bio". It must be implied by the cliffhanger.
   - Length: ~150 words.
   - NO timestamps.


Format your response EXACTLY like this:
===BLOG===
[Your full blog post here]

===EXCERPT===
[Your 2-3 sentence summary here]

===SPEECH===
[Your 60-second voiceover script here]
"""
        
        response = self.model.generate_content(full_prompt)
        content_text = self._extract_text(response)
        
        # Parse the structured response
        result = {
            "blog": "",
            "excerpt": "",
            "speech": ""
        }
        
        # Split by delimiters
        if "===BLOG===" in content_text and "===EXCERPT===" in content_text and "===SPEECH===" in content_text:
            parts = content_text.split("===BLOG===")[1].split("===EXCERPT===")
            result["blog"] = parts[0].strip()
            
            excerpt_and_speech = parts[1].split("===SPEECH===")
            result["excerpt"] = excerpt_and_speech[0].strip()
            result["speech"] = excerpt_and_speech[1].strip()
        else:
            # Fallback if parsing fails
            result["blog"] = content_text
            result["excerpt"] = content_text[:200] + "..."
            result["speech"] = content_text[:400]
        
        return result
