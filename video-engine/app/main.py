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

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

async def start_final_generation(topic: str, template: str):
    # Reuse existing job or create new if somehow missing
    job_id = state.current_job_id
    if not job_id:
        job_id = state.add_job(f"Video: {topic}")
    
    state.is_processing = True
    state.logs += f"\n🚀 Starting Final Production for: {topic}...\n"
    
    # Generate unique output filename
    slug = slugify(topic)
    video_filename = f"{slug}_final.mp4"
    state.content.update({
        "video_file": "source_1080p.mp4", # Assuming this is the source used in workflow
        "subtitle_file": f"{slug}_words.json",
        "output_video": video_filename
    })
    state.update_job(job_id, status="draft", progress=60, content=state.content) 
    
    # Capture stdout/stderr
    original_stdout = sys.stdout
    original_stderr = sys.stderr
    sys.stdout = NiceGUIOutputWrapper(state)
    sys.stderr = sys.stdout

    try:
        workflow = VideoWorkflow(BASE_DIR)
        result = await asyncio.to_thread(workflow.run, topic, None, template, content=state.content)
        
        # Update content with actual generated paths from workflow
        if isinstance(result, dict):
            state.content.update({
                "video_file": result.get("source").name if result.get("source") else "source_1080p.mp4",
                "subtitle_file": result.get("subtitles").name if result.get("subtitles") else state.content.get("subtitle_file"),
                "output_video": result.get("video").name if result.get("video") else state.content.get("output_video")
            })

        # Mark as 100% and completed
        state.update_job(job_id, status="completed", progress=100, content=state.content)
        state.logs += f"\n✅ VIDEO READY! Check outputs/{state.content.get('output_video')}\n"
        ui.notify('Video generation completed!', type='positive')
        # state.clear_draft() 
    except Exception as e:
        logger.error(f"Generation failed: {e}")
        state.logs += f"\n❌ ERROR: {str(e)}\n"
        state.update_job(job_id, status="failed")
        ui.notify(f'Failed: {str(e)}', type='negative')
    finally:
        sys.stdout = original_stdout
        sys.stderr = original_stderr
        state.is_processing = False

def go_back():
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
        ui.notify('Audio generated! Proceed to preview.', type='positive')
        
        # Advance to preview step
        state.current_step = 5
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

def go_next_step():
    """Advance to next step in the wizard."""
    if state.current_step < 5:
        state.current_step += 1
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
                generator_panel(state, start_content_generation)
            else:
                # Steps 2, 3, 4 - Wizard flow
                content_editor_panel(
                    state, 
                    on_back=go_back,
                    on_generate_audio=start_audio_generation,
                    on_generate_video=lambda: start_final_generation(
                        state.content.get('topic', 'Video'), 
                        'default'
                    ),
                    on_next_step=go_next_step,
                    on_regenerate=regenerate_content
                )

# Startup check
if not DATA_DIR.exists():
    DATA_DIR.mkdir(parents=True)

if __name__ in {"__main__", "__mp_main__"}:
    # NiceGUI app configuration
    favicon_path = str(BRAND_ASSETS_DIR / 'favicon.ico') if BRAND_ASSETS_DIR.exists() else None
    ui.run(
        title='Pathway Video Engine', 
        port=8001, 
        reload=True, 
        dark=True, 
        favicon=favicon_path,
        reload_dirs=[str(BASE_DIR / 'app')]
    )
