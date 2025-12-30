import os
import sys
import uuid
import asyncio
import logging
from pathlib import Path
from nicegui import ui, app
from app.ui_components import State, settings_drawer, generator_panel, log_terminal, content_editor_panel, job_history_panel
from app.workflow import VideoWorkflow
from app.services.llm import GeminiService
from app.services.tts import ElevenLabsService
from app.utils.slug import slugify
import yaml
import json

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
# Suppress watchfiles info noise
logging.getLogger('watchfiles').setLevel(logging.WARNING)

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
BRAND_ASSETS_DIR = BASE_DIR.parent / "packages" / "brand" / "assets"

# Serve brand assets
if BRAND_ASSETS_DIR.exists():
    app.add_static_files('/brand', str(BRAND_ASSETS_DIR))

# Serve outputs
OUTPUTS_DIR = DATA_DIR / "outputs"
if not OUTPUTS_DIR.exists():
    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
app.add_static_files('/outputs', str(OUTPUTS_DIR))

state = State(DATA_DIR)

class NiceGUIOutputWrapper:
    def __init__(self, state_obj):
        self.state = state_obj
        self.terminal = sys.stdout

    def write(self, message):
        self.terminal.write(message)
        self.state.logs += message
        # We don't need to force update here as ui.timer handles it

    def flush(self):
        self.terminal.flush()

async def start_content_generation(topic: str, template: str):
    if not topic:
        ui.notify('Please fill in the topic', type='warning')
        return

    if state.is_processing:
        ui.notify('Already processing a job!', type='warning')
        return

    # Create job entry (starts as 'draft')
    job_id = state.add_job(topic)
    state.update_job(job_id, status="draft", progress=10)
    
    state.is_processing = True
    state.logs = f"📝 Generating Plan for: {topic}...\n"
    
    try:
        state.update_job(job_id, progress=30)
        llm = GeminiService()
        content = await asyncio.to_thread(llm.generate_content, topic)
        state.update_job(job_id, progress=35)
        
        # Update state content with generated values
        slug = slugify(topic)
        state.content.update({
            "topic": topic,
            "slug": slug,
            "blog": content.get("blog"),
            "excerpt": content.get("excerpt"),
            "speech": content.get("speech"),
            "voice_file": f"{slug}.mp3",
            "subtitle_file": f"{slug}_words.json",
            "output_video": f"{slug}_final.mp4"
        })
        
        # Save content to job (status stays 'draft')
        state.update_job(job_id, status="draft", progress=35, content=state.content)
        
        # Move to step 2
        state.current_step = 2
        
        state.logs += "\n✅ Content generated successfully!\n"
    except Exception as e:
        logger.error(f"Generation failed: {e}")
        state.logs += f"\n❌ ERROR: {str(e)}\n"
        state.update_job(job_id, status="failed")
        ui.notify(f'Failed: {str(e)}', type='negative')
    finally:
        state.is_processing = False
    
    # Refresh UI to show editor
    ui.navigate.to('/')

async def regenerate_content():
    """Regenerate all content from the current topic."""
    topic = state.content.get('topic', '')
    if not topic:
        ui.notify('No topic to regenerate from', type='warning')
        return
    
    # Create job entry
    job_id = state.add_job(f"Regen: {topic}")
    state.update_job(job_id, status="processing", progress=10)
    
    state.is_processing = True
    state.logs = f"🔄 Regenerating content for: {topic}...\n"
    
    try:
        state.update_job(job_id, progress=30)
        llm = GeminiService()
        content = await asyncio.to_thread(llm.generate_content, topic)
        state.update_job(job_id, progress=80)
        state.content.update(content)
        state.current_step = 2  # Go back to blog step
        state.update_job(job_id, status="completed", progress=100)
        ui.notify('Content regenerated! Review and edit now.', type='positive')
    except Exception as e:
        logger.error(f"Regeneration failed: {e}")
        state.logs += f"\n❌ ERROR: {str(e)}\n"
        state.update_job(job_id, status="failed")
        ui.notify(f'Failed: {str(e)}', type='negative')
    finally:
        state.is_processing = False
    
    # Refresh UI
    ui.navigate.to('/')

async def start_source_download():
    """Download the source video specified in state.content['youtube_URL']."""
    yt_url = state.content.get("youtube_URL")
    if not yt_url:
        ui.notify("No YouTube URL provided", type='warning')
        return
        
    state.is_processing = True
    state.logs += f"\n📥 Downloading source video from {yt_url}...\n"
    
    # Capture stdout/stderr
    original_stdout = sys.stdout
    original_stderr = sys.stderr
    sys.stdout = NiceGUIOutputWrapper(state)
    sys.stderr = sys.stdout

    try:
        workflow = VideoWorkflow(BASE_DIR)
        topic = state.content.get("topic", "source")
        prefix = slugify(topic)
        path, res = await asyncio.to_thread(workflow.download_video, yt_url, filename_prefix=prefix)
        # Standardized field name: video_file holds the source video
        state.content["video_file"] = path.name
        state.update_job(state.current_job_id, content=state.content)
        ui.notify(f"Source video downloaded: {path.name}", type='positive')
        state.logs += f"✅ Source video ready: {path.name} ({res})\n"
        ui.navigate.to('/')
    except Exception as e:
        logger.error(f"Download failed: {e}")
        state.logs += f"\n❌ DOWNLOAD ERROR: {str(e)}\n"
        ui.notify(f"Download failed: {str(e)}", type='negative')
    finally:
        state.is_processing = False
        sys.stdout = original_stdout
        sys.stderr = original_stderr

async def start_final_generation(topic: str, template: str, target_step: int = 11):
    """
    Orchestrates granular steps with checkpointing.
    target_step: 9 (Crop only), 10 (Mix only), 11 (Final Render)
    """
    job_id = state.current_job_id
    if not job_id:
        job_id = state.add_job(f"Video: {topic}")
    
    state.is_processing = True
    state.logs += f"\n🚀 Starting Production Phase (Target: Step {target_step}) for: {topic}...\n"
    
    slug = slugify(topic)
    outputs_dir = OUTPUTS_DIR
    
    # Capture stdout/stderr
    original_stdout = sys.stdout
    original_stderr = sys.stderr
    sys.stdout = NiceGUIOutputWrapper(state)
    sys.stderr = sys.stdout

    try:
        workflow = VideoWorkflow(BASE_DIR)
        yt_url = state.content.get("youtube_URL")
        if not yt_url:
             raise ValueError("Source video (YouTube URL) is mandatory")

        # Define file paths based on slug
        audio_path = outputs_dir / f"{slug}.mp3"
        subtitle_words = outputs_dir / f"{slug}_words.json"
        source_video = outputs_dir / f"{slug}_source.mp4"
        cropped_video = outputs_dir / f"{slug}_cropped.mp4"
        mixed_video = outputs_dir / f"{slug}_mixed.mp4"
        final_video = outputs_dir / f"{slug}_final.mp4"
        ass_path = outputs_dir / f"{slug}_captions.ass"

        # Step 2: Audio (Ensure it exists)
        if not audio_path.exists():
             state.logs += "📍 Preparing Audio Stage...\n"
             await asyncio.to_thread(workflow.step_audio_gen, state.content, audio_path)
        state.content["voice_file"] = audio_path.name

        # Step 3: Transcribe (Ensure it exists and is valid)
        if not subtitle_words.exists() or subtitle_words.stat().st_size == 0:
             state.logs += "📍 Preparing Transcription Stage...\n"
             words = await asyncio.to_thread(workflow.step_transcribe, audio_path, subtitle_words)
        else:
             import json
             try:
                 with open(subtitle_words) as f:
                      words = json.load(f)
             except Exception as e:
                 state.logs += "📍 Transcription file corrupted, regenerating...\n"
                 words = await asyncio.to_thread(workflow.step_transcribe, audio_path, subtitle_words)
        state.content["subtitle_file"] = subtitle_words.name

        # Step 4: Download (Ensure it exists)
        actual_source = None
        for f in outputs_dir.glob(f"{slug}_source*"):
             actual_source = f
             break
        
        if not actual_source:
             if not yt_url:
                  raise ValueError("Source video (YouTube URL) is mandatory")
             state.logs += "📍 Preparing Source Video Stage...\n"
             actual_source = await asyncio.to_thread(workflow.step_video_download, yt_url, slug)
        
        state.content["video_file"] = actual_source.name

        # --- GRANULAR PRODUCTION LOGIC ---

        # Step 9: Crop
        if target_step >= 9:
             state.logs += "📍 [Step 9] Video Crop & Loop Stage...\n"
             await asyncio.to_thread(workflow.step_video_crop, actual_source, audio_path, cropped_video, None)
             state.content["processed_video"] = cropped_video.name
             state.update_job(job_id, progress=60, content=state.content)
             if target_step == 9:
                  state.current_step = 9 # Stay for preview
                  ui.notify('Cropping complete!', type='positive')

        # Step 10: Music Mix
        if target_step >= 10:
             state.logs += "📍 [Step 10] Music & Voice Mix Stage...\n"
             # Load template
             template_path = BASE_DIR / "templates" / f"{template}.yaml"
             with open(template_path, "r") as f:
                 template_data = yaml.safe_load(f)
                 
             music_file = state.content.get("bg_music") or (template_data['music']['file'] if 'music' in template_data else "lofi.mp3")
             bg_music_path = BASE_DIR / "assets" / "music" / music_file
             
             await asyncio.to_thread(workflow.step_music_merge, cropped_video, audio_path, mixed_video, bg_music_path, None)
             state.content["merged_audio"] = mixed_video.name
             state.update_job(job_id, progress=80, content=state.content)
             if target_step == 10:
                  state.current_step = 10 # Stay for preview
                  ui.notify('Audio mix complete!', type='positive')

        # Step 11: Final Render
        if target_step >= 11:
             state.logs += "📍 [Step 11] Final VFX & Subtitles Stage...\n"
             template_path = BASE_DIR / "templates" / f"{template}.yaml"
             with open(template_path, "r") as f:
                 template_data = yaml.safe_load(f)
             
             # Ensure ASS is ready
             from app.services.stt import WhisperService
             stt = WhisperService()
             font_name = template_data['text']['typography']['font'].split('.')[0]
             font_size = template_data['text']['typography'].get('size', 110)
             stt.generate_ass(words, ass_path, font_name, font_size, time_offset=4.0)

             await asyncio.to_thread(workflow.step_final_render, mixed_video, final_video, ass_path, template_data, workflow.theme_color, None)
             
             state.content["output_video"] = final_video.name
             state.update_job(job_id, status="completed", progress=100, content=state.content)
             state.current_step = 11
             ui.notify('Final render complete!', type='positive')

        ui.navigate.to('/')

    except Exception as e:
        logger.error(f"Production failed: {e}")
        state.logs += f"\n❌ PRODUCTION ERROR: {str(e)}\n"
        state.update_job(job_id, status="failed")
        ui.notify(f'Failed: {str(e)}', type='negative')
    finally:
        sys.stdout = original_stdout
        sys.stderr = original_stderr
        state.is_processing = False

def go_back():
    """Pause current job (if any) and start fresh for NEW JOB."""
    # Mark current job as paused
    if state.current_job_id:
        state.update_job(state.current_job_id, status="paused", current_step=state.current_step)
    
    # Reset state for new job
    state.current_job_id = None
    state.content = {"topic": "", "blog": "", "excerpt": "", "speech": "", "steps": {}}
    state.current_step = 1
    ui.navigate.to('/')

async def start_audio_generation():
    """Generate audio for preview step."""
    topic = state.content.get('topic', 'Audio')
    
    # Reuse existing job from content generation step
    job_id = state.current_job_id
    if not job_id:
        # Fallback if starting direct (shouldn't happen in wizard)
        job_id = state.add_job(topic)
        
    state.update_job(job_id, status="draft", progress=40) 
    
    state.is_processing = True
    state.logs += f"\n🎤 Generating Audio for: {topic}...\n"
    
    # Switch output to terminal
    original_stdout = sys.stdout
    original_stderr = sys.stderr
    sys.stdout = NiceGUIOutputWrapper(state)
    sys.stderr = sys.stdout
    
    try:
        # Get selected voice/model or fallback
        voice_id = state.content.get("voice_id")
        model_id = state.content.get("tts_model")
        
        state.logs += f"Synthesizing speech with voice: {voice_id or 'Default'}...\n"
        
        # Unique Filename Logic
        slug = slugify(topic)
        audio_filename = f"{slug}.mp3"
        state.content.update({
            "voice_id": voice_id,
            "tts_model": model_id,
            "voice_file": audio_filename
        })
        
        # Save to data/outputs so it can be served correctly
        output_path = DATA_DIR / "outputs" / audio_filename
        
        tts = ElevenLabsService()
        audio_path_result = tts.text_to_speech(
            text=state.content.get('speech', ''), 
            output_path=output_path,
            voice_id=voice_id,
            model_id=model_id
        ) 
        
        state.update_job(job_id, status="draft", progress=60, content=state.content)
        state.logs += f"\n✅ AUDIO READY! Saved to {output_path.name}\n"
        
        # Add Transcription stage so it's ready for Step 7
        state.logs += "🎙️ Transcribing audio for subtitles...\n"
        from app.services.stt import WhisperService
        stt = WhisperService()
        words = await asyncio.to_thread(stt.transcribe, output_path)
        
        # Save words for later steps
        words_filename = f"{slug}_words.json"
        words_path = DATA_DIR / "outputs" / words_filename
        with open(words_path, 'w') as f:
            json.dump(words, f)
        
        state.content["subtitle_file"] = words_filename
        state.update_job(job_id, progress=80, content=state.content)
        state.logs += "✅ TRANSCRIPTION READY!\n"
        
        ui.notify('Audio & Transcript generated! Proceed to preview.', type='positive')
        
        # Advance to preview step
        state.current_step = 6
        ui.navigate.to('/')
        
    except Exception as e:
        logger.error(f"Audio generation failed: {e}")
        state.logs += f"\n❌ ERROR: {str(e)}\n"
        state.update_job(job_id, status="failed")
        ui.notify(f'Failed: {str(e)}', type='negative')
    finally:
        sys.stdout = original_stdout
        sys.stderr = original_stderr
        state.is_processing = False

async def start_transcription():
    """Generates transcript for preview step if missing."""
    topic = state.content.get('topic', 'Audio')
    job_id = state.current_job_id
    if not job_id:
        return
        
    state.is_processing = True
    state.logs += f"\n🎙️ Transcribing audio for: {topic}...\n"
    
    slug = slugify(topic)
    audio_path = DATA_DIR / "outputs" / f"{slug}.mp3"
    
    if not audio_path.exists():
        state.logs += "❌ Error: Audio file not found. Please generate audio first.\n"
        ui.notify('Audio file missing!', type='negative')
        state.is_processing = False
        return

    try:
        from app.services.stt import WhisperService
        stt = WhisperService()
        words = await asyncio.to_thread(stt.transcribe, audio_path)
        
        # Save words
        words_filename = f"{slug}_words.json"
        words_path = DATA_DIR / "outputs" / words_filename
        with open(words_path, 'w') as f:
            json.dump(words, f)
        
        state.content["subtitle_file"] = words_filename
        state.update_job(job_id, progress=80, content=state.content)
        state.logs += "✅ TRANSCRIPTION READY!\n"
        ui.notify('Transcription complete!', type='positive')
        ui.navigate.to('/')
    except Exception as e:
        logger.error(f"❌ Transcription failed: {e}")
        state.logs += f"❌ Transcription failed: {str(e)}\n"
        ui.notify(f'Transcription failed: {str(e)}', type='negative')
    finally:
        state.is_processing = False

def go_next_step():
    """Advance to next step in the wizard."""
    if state.current_step < 11:
        state.current_step += 1
        # Save current step to job
        if state.current_job_id:
            state.update_job(state.current_job_id, current_step=state.current_step)
        ui.navigate.to('/')

@ui.page('/')
def index():
    # Global Styling & Fonts
    ui.add_head_html(f'''
        <style>
            @import url('{state.font_url}');
            body {{ font-family: {state.font_family}; }}
            .glass {{
                background: rgba(15, 23, 42, 0.6);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.05);
            }}
            ::-webkit-scrollbar {{ width: 8px; }}
            ::-webkit-scrollbar-track {{ background: {state.brand_background}; }}
            ::-webkit-scrollbar-thumb {{ background: #1e293b; border-radius: 10px; }}
            ::-webkit-scrollbar-thumb:hover {{ background: #334155; }}
        </style>
    ''')
    
    ui.colors(primary=state.brand_color, secondary=state.brand_secondary, accent=state.brand_accent, dark='#0f172a')
    ui.query('body').style(f"background-color: {state.brand_background}; color: #f8fafc;")

    # 1. Settings Drawer (Right side, triggered by gear icon)
    with ui.right_drawer(value=False).classes('border-l border-slate-800 p-0 w-80 shadow-2xl').style(f'background: {state.brand_background};') as settings_drawer_panel:
        with ui.column().classes('w-full h-full'):
            with ui.row().classes('w-full p-4 items-center border-b border-slate-800 justify-between').style(f'background: {state.brand_background}cc;'):
                with ui.row().classes('items-center gap-2'):
                    ui.icon('settings').classes('text-lg').style(f'color: {state.brand_color}')
                    ui.label('SETTINGS').classes('text-xs font-bold tracking-widest text-slate-400')
                ui.button(icon='close', on_click=lambda: settings_drawer_panel.toggle()).props('flat round dense').classes('text-slate-500')
            
            settings_drawer(state)
            
            ui.space()
            
            with ui.row().classes('w-full p-4 border-t border-slate-800 items-center justify-between'):
                ui.label('v2.5.0-stable').classes('text-[10px] text-slate-600 font-mono')

    # 2. Left Drawer - Job History
    with ui.left_drawer(value=True).classes('border-r border-slate-800 p-0 w-64 shadow-2xl').style(f'background: {state.brand_background};') as jobs_drawer:
        job_history_panel(state)

    # 3. Right Drawer - Terminal
    with ui.right_drawer(value=False).classes('border-l border-slate-800 p-0 w-96').style(f'background: {state.brand_background};') as terminal_drawer:
        with ui.column().classes('w-full h-full'):
            with ui.row().classes('w-full p-4 items-center border-b border-slate-800 justify-between').style(f'background: {state.brand_background}cc;'):
                with ui.row().classes('items-center gap-2'):
                    ui.icon('terminal').classes('text-lg').style(f'color: {state.brand_color}')
                    ui.label('PIPELINE TERMINAL').classes('text-xs font-bold tracking-widest text-slate-400')
                with ui.row().classes('gap-1'):
                    ui.html('<div class="w-3 h-3 rounded-full bg-red-500"></div>', sanitize=False)
                    ui.html('<div class="w-3 h-3 rounded-full bg-yellow-500"></div>', sanitize=False)
                    ui.html('<div class="w-3 h-3 rounded-full bg-green-500"></div>', sanitize=False)
            
            with ui.scroll_area().classes('flex-1 w-full p-4 font-mono text-sm text-green-500'):
                state.log_container = ui.markdown('').classes('whitespace-pre-wrap')
                
                def update_logs():
                    safe_logs = state.logs.replace('`', '\\`')
                    state.log_container.set_content(f"```\n{safe_logs}\n```")
                    
                ui.timer(0.5, update_logs)
    
    # Add terminal toggle to header
    state.terminal_drawer = terminal_drawer

    # 4. Footer
    with ui.footer().classes('border-t border-slate-800 p-3 items-center px-8').style(f'background: {state.brand_background};'):
        ui.label('© 2025 Pathway AI Technologies').classes('text-[10px] text-slate-600')
        ui.space()
        with ui.row().classes('gap-2 items-center'):
            ui.button(icon='terminal', on_click=lambda: terminal_drawer.toggle()).props('flat dense').classes('text-slate-500 hover:text-white')
            ui.button(icon='settings', on_click=lambda: settings_drawer_panel.toggle()).props('flat dense').classes('text-slate-500 hover:text-white')

    # 5. Main Content Area
    with ui.column().classes('w-full h-full p-4 lg:p-6'):
        # Dynamic View Switching
        with ui.column().classes('w-full h-full transition-all duration-500 justify-center items-center'):
            if state.current_step == 1:
                generator_panel(state, start_content_generation, on_new_job=go_back)
            else:
                # Steps 2, 3, 4 - Wizard flow
                content_editor_panel(
                    state, 
                    on_back=go_back,
                    on_generate_audio=start_audio_generation,
                    on_download_source=start_source_download,
                    on_generate_video=lambda: start_final_generation(
                        state.content.get('topic', 'Video'), 
                        'default',
                        target_step=state.current_step
                    ),
                    on_next_step=go_next_step,
                    on_regenerate=regenerate_content,
                    on_generate_transcript=start_transcription
                )

# Startup check
if not DATA_DIR.exists():
    DATA_DIR.mkdir(parents=True)

if __name__ in {"__main__", "__mp_main__"}:
    # NiceGUI app configuration
    favicon_path = str(BRAND_ASSETS_DIR / 'favicon.ico') if BRAND_ASSETS_DIR.exists() else None
    
    # Get absolute paths for exclusions
    data_dir = DATA_DIR
    
    ui.run(
        title='Pathway Video Engine', 
        port=8001, 
        reload=True, 
        dark=True, 
        favicon=favicon_path,
        uvicorn_reload_dirs=['app'], 
        uvicorn_reload_excludes='data/*,outputs/*,*.json,*.mp3,*.mp4,*.ass,*/data/*,*/outputs/*'
    )

