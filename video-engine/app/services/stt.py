import whisper
from pathlib import Path

class WhisperService:
    def __init__(self, model_name: str = "base"):
        self.model = whisper.load_model(model_name)

    def transcribe(self, audio_path: Path):
        result = self.model.transcribe(str(audio_path), word_timestamps=True)
        words = []
        for segment in result.get("segments", []):
            for word_data in segment.get("words", []):
                words.append({
                    "word": word_data["word"].strip(),
                    "start": word_data["start"],
                    "end": word_data["end"]
                })
        return words

    def generate_ass(self, words: list, output_path: Path, font_name: str = "Inter-Bold", font_size: int = 110, time_offset: float = 0.0):
        # Alignment: 5 = Center of the screen
        alignment = 5 
        margin_v = 50 
        
        events = []
        words_per_screen = 3 # Keep it punchy (3-4 words max)
        
        for i in range(0, len(words), words_per_screen):
            chunk = words[i:i + words_per_screen]
            if not chunk: continue
            
            # Highlight effect: Active word in GOLD + Larger, others in White/Gray
            for j, active_word in enumerate(chunk):
                word_start = active_word["start"] + time_offset
                word_end = active_word["end"] + time_offset
                
                styled_parts = []
                for k, w in enumerate(chunk):
                    text = w["word"].upper()
                    
                    if k == j:
                        # Highlighted: Brand Gold (#FCC01E -> BGR: 1E C0 FC -> &H1EC0FC&)
                        # Scale: 125%
                        prefix = r"{\c&H1EC0FC&}{\3c&H000000&}{\fscx125\fscy125}" 
                        suffix = r"{\fscx100\fscy100}" 
                        styled_parts.append(f"{prefix}{text}{suffix}")
                    else:
                        # Dimmed: White but slightly smaller/standard
                        # Keeping them white (&HFFFFFF&) ensures readability, gray might be too dull.
                        # Let's try pure White but normal size.
                        prefix = r"{\c&HFFFFFF&}{\3c&H000000&}{\fscx100\fscy100}"
                        styled_parts.append(f"{prefix}{text}")
                
                text_content = " ".join(styled_parts)
                
                def fmt_time(t):
                    h = int(t // 3600)
                    m = int((t % 3600) // 60)
                    s = t % 60
                    return f"{h}:{m:02d}:{s:05.2f}"
                
                events.append(f"Dialogue: 0,{fmt_time(word_start)},{fmt_time(word_end)},Default,,0,0,0,,{text_content}")

        # Note: Outline (Border) width
        ass_content = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{font_name},{font_size},&H00FFFFFF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,4,0,{alignment},50,50,{margin_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
        ass_content += "\n".join(events)
        output_path.write_text(ass_content, encoding="utf-8")
        return output_path
