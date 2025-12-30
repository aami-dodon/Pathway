from nicegui import ui, events
import json
import os
from pathlib import Path
from typing import Optional, List, Dict
from datetime import datetime
import re
import uuid

# 11-Step Production Wizard Configuration
STEP_CONFIG = {
    1: {"title": "Topic", "subtitle": "Enter your content topic", "icon": "topic", "field": "topic", "action": "CONTINUE"},
    2: {"title": "Blog", "subtitle": "Edit the blog article", "icon": "article", "field": "blog", "action": "CONTINUE"},
    3: {"title": "Excerpt", "subtitle": "Create social excerpt", "icon": "format_quote", "field": "excerpt", "action": "CONTINUE"},
    4: {"title": "Script", "subtitle": "Write narration script", "icon": "record_voice_over", "field": "speech", "action": "CONTINUE"},
    5: {"title": "Voice", "subtitle": "Select narrator voice", "icon": "mic", "field": None, "action": "CONTINUE"},
    6: {"title": "Audio", "subtitle": "Preview narration audio", "icon": "headphones", "field": None, "action": "CONTINUE"},
    7: {"title": "Transcript", "subtitle": "Review word transcription", "icon": "subtitles", "field": None, "action": "CONTINUE"},
    8: {"title": "Source", "subtitle": "Download source video", "icon": "download", "field": None, "action": "CONTINUE"},
    9: {"title": "Crop", "subtitle": "Process video length", "icon": "content_cut", "field": None, "action": "CONTINUE"},
    10: {"title": "Mix", "subtitle": "Add background music", "icon": "library_music", "field": None, "action": "CONTINUE"},
    11: {"title": "Render", "subtitle": "Final video with VFX", "icon": "movie", "field": None, "action": "DOWNLOAD"},
}

class State:
    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
        self.settings_file = data_dir / "settings.json"
        self.secrets_file = data_dir / "secrets.json"
        self.task_file = data_dir / "tasks.json" # Changed from tasks_file
        
        self.settings = self._load_json(self.settings_file, {
            "llm_model": "gemini-flash-latest",
            "tts_model": "eleven_multilingual_v2",
            "tts_voice_id": "nPczCjzI2devNBz1zQrb",
            "tts_voice_name": "Sarah - Mature, Reassuring, Confident",
            "website_url": "preppathway.com"
        })
        
        # Load available voices and models
        voices_file = data_dir / "elevenlabs_voices.json"
        tts_models_file = data_dir / "elevenlabs_models.json"
        
        self.voices = self._load_json(voices_file, [])
        self.tts_models = self._load_json(tts_models_file, [])
        
        # Map voice/model names for UI: {value: label}
        self.voice_options = {v["voice_id"]: v["name"] for v in self.voices}
        self.tts_model_options = {m["model_id"]: m["name"] for m in self.tts_models}
        
        # Load Brand Identity
        self.brand_color = "#3b82f6" # Default primary
        self.brand_secondary = "#10b981"
        self.brand_accent = "#8b5cf6"
        self.brand_background = "#020617"
        self.brand_name = "Video Engine"
        self.font_url = None
        self.font_family = "Inter, sans-serif"
        
        self._load_brand_identity()
        # Load secrets with environment fallbacks
        self.secrets = self._load_json(self.secrets_file, {
            "google_api_key": os.getenv("GOOGLE_API_KEY", ""),
            "elevenlabs_api_key": os.getenv("ELEVENLABS_API_KEY", "")
        }) # Changed default to empty dict
        
        # Job History
        self.jobs_file = data_dir / "jobs.json"
        self.jobs = self._load_json(self.jobs_file, [])
        self.current_job_id = None
        
        self.tasks = self._load_json(self.task_file, []) # Changed from tasks_file
        self.logs = ""
        self.is_processing = False
        self.current_step = 1 # 1-11: 11-step wizard
        self.terminal_open = False # Track terminal drawer state
        self.content = {"topic": "", "blog": "", "excerpt": "", "speech": "", "steps": {}}
        
        # Load available music
        self.music_dir = self.data_dir.parent / "assets" / "music"
        self.music_options = [f.name for f in self.music_dir.glob("*.mp3")] if self.music_dir.exists() else []
        
        # Home page starts fresh - no auto-restore
        # User must click a job in sidebar to resume it

    def _infer_step(self):
        """Infers the current step (1-11) based on available content and files."""
        content = self.content
        slug = content.get("slug", "")
        outputs = self.data_dir / "outputs"
        
        # Check in reverse order (highest step first)
        if (outputs / f"{slug}_final.mp4").exists():
            self.current_step = 11
        elif (outputs / f"{slug}_mixed.mp4").exists():
            self.current_step = 10
        elif (outputs / f"{slug}_cropped.mp4").exists():
            self.current_step = 9
        elif (outputs / f"{slug}_source.mp4").exists() or any(outputs.glob(f"{slug}_source*")):
            self.current_step = 9 # Advance to next logic step after download
        elif (outputs / f"{slug}_words.json").exists():
            self.current_step = 7
        elif (outputs / f"{slug}.mp3").exists():
            self.current_step = 6
        elif content.get("speech"):
            self.current_step = 5
        elif content.get("excerpt"):
            self.current_step = 4
        elif content.get("blog"):
            self.current_step = 3
        elif content.get("topic"):
            self.current_step = 2
        else:
            self.current_step = 1
            
        print(f"📌 Job {self.current_job_id} resumed at Step {self.current_step}")

    def _load_brand_identity(self):
        try:
            # 1. Colors from theme.css
            from app.utils.theme_parser import get_theme_colors
            theme_css = self.data_dir.parent.parent / "packages" / "brand" / "theme.css"
            colors = get_theme_colors(theme_css)
            self.brand_color = colors["primary"]
            self.brand_secondary = colors["secondary"]
            self.brand_accent = colors["accent"]
            self.brand_background = colors.get("background", "#020617")
            
            # 2. Typography from metadata.ts
            metadata_ts = self.data_dir.parent.parent / "packages" / "brand" / "src" / "metadata.ts"
            if metadata_ts.exists():
                content = metadata_ts.read_text()
                
                name_match = re.search(r"name:\s*['\"]([^'\"]+)['\"]", content)
                if name_match:
                    self.brand_name = name_match.group(1).upper()
                
                font_url_match = re.search(r"googleFontsUrl:\s*['\"]([^'\"]+)['\"]", content)
                if font_url_match:
                    self.font_url = font_url_match.group(1)
                
                font_family_match = re.search(r"fontFamily:\s*['\"]([^'\"]+)['\"]", content)
                if font_family_match:
                    self.font_family = f"'{font_family_match.group(1)}', sans-serif"
                    
        except Exception as e:
            print(f"⚠️ Error loading brand identity: {e}")

    def _load_json(self, path: Path, default):
        if path.exists():
            try:
                with open(path, "r") as f:
                    return json.load(f)
            except:
                return default
        return default

    def save_settings(self):
        with open(self.settings_file, "w") as f:
            json.dump(self.settings, f, indent=4)

    def save_secrets(self):
        with open(self.secrets_file, "w") as f:
            json.dump(self.secrets, f, indent=4)

    def save_tasks(self):
        with open(self.task_file, "w") as f: # Changed from tasks_file
            json.dump(self.tasks, f, indent=4)

    def save_draft(self):
        """Saves current content to the current job."""
        if self.current_job_id:
            self.update_job(self.current_job_id, content=self.content)
            ui.notify('Progress saved!', type='positive')
        else:
             # If no job yet (Step 1), we don't save a draft anymore 
             # as the job is created on "GENERATE"
             pass

    def clear_draft(self):
        """Resets the editor state."""
        self.content = {"topic": "", "blog": "", "excerpt": "", "speech": ""}
        self.current_step = 1
        self.current_job_id = None

    def save_jobs(self):
        with open(self.jobs_file, "w") as f:
            json.dump(self.jobs, f, indent=4)

    def add_job(self, topic: str) -> str:
        """Create a new job and return its ID."""
        from app.utils.slug import slugify
        job_id = str(uuid.uuid4())[:8]
        slug = slugify(topic)
        
        job = {
            "id": job_id,
            "topic": topic,
            "topic_slug": slug,
            "status": "draft",
            "progress": 0,
            "started_at": datetime.now().isoformat(),
            "completed_at": None,
            "content": {
                "topic": topic,
                "slug": slug,
                "blog": None,
                "excerpt": None,
                "speech": None,
                "voice_id": None,
                "tts_model": None,
                "voice_file": f"{slug}.mp3",
                "youtube_URL": None,
                "video_file": None,
                "subtitle_file": f"{slug}_words.json",
                "output_video": f"{slug}_final.mp4"
            }
        }
        self.jobs.insert(0, job)
        self.jobs = self.jobs[:20]
        self.current_job_id = job_id
        self.save_jobs()
        return job_id

    def update_job(self, job_id: str, status: str = None, progress: int = None, content: Dict = None, current_step: int = None):
        """Update a job's status, progress, content, or current_step."""
        for job in self.jobs:
            if job["id"] == job_id:
                if status:
                    job["status"] = status
                    if status in ["completed", "failed"]:
                        job["completed_at"] = datetime.now().isoformat()
                if progress is not None:
                    job["progress"] = progress
                if content is not None:
                    job["content"] = content
                if current_step is not None:
                    job["current_step"] = current_step
                self.save_jobs()
                break

    def get_job(self, job_id: str) -> Optional[Dict]:
        """Get a job by ID."""
        for job in self.jobs:
            if job["id"] == job_id:
                return job
        return None

    def clear_all_data(self):
        """Clear all jobs, drafts, and stored output files."""
        # 1. Clear Jobs
        self.jobs = []
        self.current_job_id = None
        self.save_jobs()
        
        # 2. Clear Content State
        self.content = {"topic": "", "blog": "", "excerpt": "", "speech": ""}
        self.current_step = 1
        
        # 3. Clear Outputs
        outputs_dir = self.data_dir / "outputs"
        if outputs_dir.exists():
            for file in outputs_dir.glob("*"):
                if file.is_file():
                    try:
                        file.unlink()
                    except Exception as e:
                        print(f"Failed to delete {file}: {e}")
                        
        ui.notify("All history, drafts, and files cleared!", type='positive')
        ui.navigate.to('/') # Force reload to reset view

def job_history_panel(state: State):
    """Left sidebar showing job history."""
    with ui.column().classes('w-full h-full'):
        with ui.row().classes('w-full p-4 items-center border-b border-slate-800 justify-between').style(f'background: {state.brand_background}cc;'):
            with ui.row().classes('items-center'):
                ui.icon('history').classes('text-lg').style(f'color: {state.brand_color}')
                ui.label('JOB HISTORY').classes('text-xs font-bold tracking-widest text-slate-400 ml-2')
            
            # Clear History Button
            ui.button(icon='delete_sweep', on_click=state.clear_all_data).props('flat round dense').classes('text-slate-500 hover:text-red-500')
        
        with ui.scroll_area().classes('flex-1 w-full'):
            with ui.column().classes('w-full p-2 gap-1') as job_list:
                def render_jobs():
                    job_list.clear()
                    with job_list:
                        if not state.jobs:
                            with ui.column().classes('w-full p-4 items-center'):
                                ui.icon('inbox').classes('text-4xl text-slate-700')
                                ui.label('No jobs yet').classes('text-xs text-slate-600')
                        else:
                            for job in state.jobs:
                                render_job_item(state, job)
                
                render_jobs()
                ui.timer(2.0, render_jobs)  # Refresh every 2 seconds

def render_job_item(state: State, job: Dict):
    """Render a single job item."""
    status_colors = {
        "draft": "#94a3b8",
        "queued": "#64748b",
        "processing": state.brand_color,
        "completed": "#22c55e",
        "failed": "#ef4444"
    }
    status_icons = {
        "draft": "edit_note",
        "queued": "schedule",
        "processing": "sync",
        "completed": "check_circle",
        "failed": "error"
    }
    
    is_current = job["id"] == state.current_job_id
    border_style = f'border-left: 3px solid {status_colors.get(job["status"], "#64748b")};'
    
    def on_job_click():
        # Restore content if saved
        if "content" in job and job["content"]:
            state.content = job["content"]
            state.current_job_id = job["id"]
            state._infer_step()
            ui.navigate.to('/')
            ui.notify(f"Restored job: {job['topic'][:20]}...", type='positive')
        else:
            ui.notify("No content saved for this job", type='warning')

    with ui.card().classes('w-full p-3 cursor-pointer hover:bg-slate-800/50 transition-all') \
        .style(f'background: {"rgba(255,255,255,0.03)" if is_current else "transparent"}; {border_style}') \
        .on('click', on_job_click):
        
        with ui.row().classes('w-full items-start justify-between'):
            with ui.column().classes('flex-1 gap-1'):
                ui.label(job["topic"]).classes('text-xs font-medium text-white truncate')
                
                # Progress bar for history
                ui.linear_progress(value=job["progress"]/100).classes('w-full h-[1px] mt-1 opacity-30').props('color=white')

                # Format timestamp
                try:
                    dt = datetime.fromisoformat(job["started_at"])
                    time_str = dt.strftime("%I:%M %p").lstrip("0")
                    if dt.date() == datetime.now().date():
                        date_str = f"Today at {time_str}"
                    else:
                        date_str = dt.strftime("%b %d, %I:%M %p")
                except:
                    date_str = job["started_at"]
                
                ui.label(date_str).classes('text-[10px] text-slate-500')
            
            ui.icon(status_icons.get(job["status"], "help")).classes('text-sm').style(f'color: {status_colors.get(job["status"], "#64748b")}')
        
        # Progress bar for processing jobs
        if job["status"] == "processing":
            with ui.row().classes('w-full mt-2'):
                ui.linear_progress(value=job["progress"]/100, show_value=False).classes('w-full').props('color=primary')


def settings_drawer(state: State):
    with ui.column().classes('w-full p-6 gap-6'):
        ui.label('Configuration').classes('text-xs font-bold text-slate-500 uppercase tracking-widest')
        
        with ui.column().classes('w-full gap-4'):
            ui.label('API Credentials').classes('text-sm font-semibold text-slate-300')
            ui.input('Google API Key', password=True, value=state.secrets['google_api_key'], 
                     on_change=lambda e: state.secrets.update({'google_api_key': e.value})) \
                .classes('w-full').props('dark filled dense')
            
            ui.input('ElevenLabs API Key', password=True, value=state.secrets['elevenlabs_api_key'],
                     on_change=lambda e: state.secrets.update({'elevenlabs_api_key': e.value})) \
                .classes('w-full').props('dark filled dense')
            
            ui.button('Update Keys', on_click=state.save_secrets) \
                .classes('w-full bg-slate-800 hover:bg-slate-700 text-xs py-2')

        ui.separator().classes('bg-slate-800')

        with ui.column().classes('w-full gap-4'):
            ui.label('Model Preferences').classes('text-sm font-semibold text-slate-300')
            ui.input('LLM Model', value=state.settings['llm_model'],
                     on_change=lambda e: state.settings.update({'llm_model': e.value})) \
                .classes('w-full').props('dark filled dense')
            
            ui.input('Voice ID', value=state.settings['tts_voice_id'],
                     on_change=lambda e: state.settings.update({'tts_voice_id': e.value})) \
                .classes('w-full').props('dark filled dense')
            
            ui.button('Save Preferences', on_click=state.save_settings) \
                .classes('w-full bg-slate-800 hover:bg-slate-700 text-xs py-2')

        ui.space()
        
        with ui.card().classes('p-4').style(f'background: {state.brand_color}10; border: 1px solid {state.brand_color}30;'):
            ui.label('System Health').classes('text-xs font-bold uppercase').style(f'color: {state.brand_color}')
            with ui.row().classes('items-center gap-2 mt-2'):
                ui.html(f'<div class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>', sanitize=False)
                ui.label('All Services Online').classes('text-[10px] text-slate-400')

def wizard_navigation(state: State, on_new_job):
    """Unified navigation header for all 11 steps."""
    with ui.column().classes('w-full gap-2 mb-4'):
        # Top Bar: NEW JOB and Step Counter
        with ui.row().classes('w-full justify-between items-center'):
            ui.button('NEW JOB', icon='add', on_click=on_new_job) \
                .props('flat color=amber') \
                .classes('text-xs font-bold px-2 py-1 rounded-lg hover:bg-amber-500/10 transition-all')
            ui.label(f'Step {state.current_step} of 11').classes('text-[10px] font-bold text-slate-500 uppercase tracking-tighter')
        
        # Progress Navigation - 11 Steps with Badges
        with ui.row().classes('w-full justify-center gap-1 flex-wrap bg-slate-900/40 p-2 rounded-2xl border border-slate-800/30'):
            for step_num in range(1, 12):
                step_info = STEP_CONFIG[step_num]
                is_active = state.current_step == step_num
                is_completed = state.current_step > step_num
                
                color = state.brand_color if is_active else ("#22c55e" if is_completed else "#334155")
                
                def make_nav_handler(target_step):
                    def go_to_step():
                        if target_step <= state.current_step or is_completed:
                            state.current_step = target_step
                            ui.navigate.to('/')
                    return go_to_step
                
                with ui.column().classes('items-center gap-0.5 px-2 py-1 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-all') \
                    .on('click', make_nav_handler(step_num)):
                    ui.label(str(step_num)).classes('w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold') \
                        .style(f'background: {color}; color: white;')
                    ui.icon(step_info["icon"]).classes('text-sm').style(f'color: {color}')

def generator_panel(state: State, on_start, on_new_job):
    with ui.column().classes('w-full h-full max-w-4xl mx-auto gap-4'):
        # Glassmorphic Navigation
        wizard_navigation(state, on_new_job)
        
        # Glassmorphic Main Card
        with ui.card().classes('w-full p-6 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl').style(f'background: {state.brand_background}cc;'):
            ui.label('Design your content').classes('text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 text-center')
            ui.label('What should we build today?').classes('text-2xl font-bold text-white text-center mb-4')
            
            topic = ui.input(placeholder='e.g. The Future of Smart Cities') \
                .classes(f'w-full text-lg font-medium p-3 bg-slate-800/30 border-0 rounded-xl transition-all focus:ring-2 focus:ring-[{state.brand_color}]') \
                .props('dark borderless autofocus').bind_value(state.content, 'topic')
            
            ui.button('GENERATE BRANDED CONTENT', on_click=lambda: on_start(state.content["topic"], "default")) \
                .classes('w-full py-4 text-black font-bold rounded-xl shadow-lg hover:scale-105 transition-all') \
                .style(f'background-color: {state.brand_color};') \
                .bind_enabled_from(state, 'is_processing', backward=lambda x: not x) \
                .bind_text_from(state, 'is_processing', backward=lambda x: 'COMMUNICATING WITH GEMINI...' if x else 'GENERATE BRANDED CONTENT')

        # Add the global sticky indicator
        global_progress_indicator(state)

        with ui.row().classes('w-full gap-3 justify-center'):
            with ui.card().classes('border border-slate-800 p-3 flex-1 items-center').style(f'background: {state.brand_background}cc;'):
                ui.icon('bolt').classes('text-xl mb-1').style(f'color: {state.brand_color}')
                ui.label('Flash Mode').classes('text-[10px] text-slate-500 uppercase')
                ui.label('Ultra Fast').classes('text-xs font-bold')
            
            with ui.card().classes('border border-slate-800 p-3 flex-1 items-center').style(f'background: {state.brand_background}cc;'):
                ui.icon('auto_awesome').classes('text-xl mb-1').style(f'color: {state.brand_color}')
                ui.label('AI Engine').classes('text-[10px] text-slate-500 uppercase')
                ui.label('Gemini 2.0').classes('text-xs font-bold')

            with ui.card().classes('border border-slate-800 p-3 flex-1 items-center').style(f'background: {state.brand_background}cc;'):
                ui.icon('high_quality').classes('text-xl mb-1').style(f'color: {state.brand_color}')
                ui.label('Rendering').classes('text-[10px] text-slate-500 uppercase')
                ui.label('4K Ultra').classes('text-xs font-bold')

def log_terminal(state: State):
    with ui.card().classes('w-full max-w-4xl mx-auto p-4 border border-slate-800 mt-6 font-mono text-sm').style(f'background: {state.brand_background};'):
        with ui.row().classes('w-full justify-between items-center mb-2'):
            ui.label('Pipeline Terminal').classes('text-slate-400 uppercase text-xs tracking-widest')
            with ui.row().classes('gap-2'):
                ui.html('<div class="w-3 h-3 rounded-full bg-red-500"></div>', sanitize=False)
                ui.html('<div class="w-3 h-3 rounded-full bg-yellow-500"></div>', sanitize=False)
                ui.html('<div class="w-3 h-3 rounded-full bg-green-500"></div>', sanitize=False)
        
        log_scroll = ui.scroll_area().classes('h-64 text-green-500')
        with log_scroll:
            state.log_container = ui.markdown('').classes('whitespace-pre-wrap')
            
        def update_logs():
            # Minimal escape for markdown
            safe_logs = state.logs.replace('`', '\\`')
            state.log_container.set_content(f"```\n{safe_logs}\n```")
            log_scroll.scroll_to(percent=1)
            
        ui.timer(0.5, update_logs)

def global_progress_indicator(state: State):
    """A floating/fixed progress indicator shown when processing."""
    with ui.column().classes('fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-50 pointer-events-none transition-all duration-500') \
        .bind_visibility_from(state, 'is_processing'):
        
        with ui.card().classes('w-full border border-slate-700/50 p-4 shadow-2xl backdrop-blur-xl').style(f'background: {state.brand_background}dd;'):
            with ui.row().classes('w-full items-center gap-4'):
                ui.spinner('audio', size='lg', color=state.brand_color)
                with ui.column().classes('flex-1 gap-1'):
                    ui.label('PROCESSING STAGE...').classes('text-[10px] font-bold text-slate-500 tracking-widest')
                    # Find progress
                    job = next((j for j in state.jobs if j["id"] == state.current_job_id), None)
                    p_val = job["progress"] if job else 10
                    
                    with ui.row().classes('w-full justify-between items-end'):
                        ui.label(f'{p_val}%').classes('text-xs font-mono text-white')
                        ui.label('PLEASE WAIT').classes('text-[8px] text-slate-500')
                    
                    ui.linear_progress(value=p_val/100).classes('w-full h-1.5 rounded-full').props(f'color="{state.brand_color}"')

def content_editor_panel(state: State, on_back, on_generate_audio, on_generate_video, on_next_step, on_regenerate, on_download_source=None, on_generate_transcript=None):
    """11-step content production wizard."""
    config = STEP_CONFIG.get(state.current_step, STEP_CONFIG[1])
    slug = state.content.get("slug", "")
    outputs_dir = state.data_dir / "outputs"
    
    with ui.column().classes('w-full h-full max-w-5xl mx-auto gap-3'):
        # Unified Wizard Navigation
        wizard_navigation(state, on_back)
        
        # Header
        with ui.row().classes('w-full items-center justify-between'):
            with ui.column().classes('gap-0'):
                with ui.row().classes('items-center gap-2'):
                    ui.icon(config["icon"]).classes('text-xl').style(f'color: {state.brand_color}')
                    ui.label(config["title"]).classes('text-xl font-black')
                ui.label(config["subtitle"]).classes('text-slate-400 text-xs')
            
            ui.button(icon='close', on_click=on_back).classes('rounded-full bg-slate-800 hover:bg-slate-700 p-2')
        
        # Main Content Area - Step-specific rendering
        with ui.card().classes('w-full border border-slate-800 rounded-2xl overflow-hidden p-0').style(f'background: {state.brand_background}cc; min-height: 400px; flex-grow: 1;'):
            with ui.scroll_area().classes('w-full p-4').style('height: calc(100vh - 300px);'):
                
                # STEPS 1-4: Text Editors
                if state.current_step in [1, 2, 3, 4]:
                    field = config.get("field")
                    if field:
                        ui.textarea(placeholder=f"Enter your {field} here...") \
                            .classes('w-full text-base bg-transparent border-0') \
                            .style('min-height: 350px;') \
                            .props('dark borderless autofocus autogrow') \
                            .bind_value(state.content, field)
                
                # STEP 5: Voice Selection
                elif state.current_step == 5:
                    with ui.column().classes('w-full items-center gap-6 py-8'):
                        ui.icon('mic').classes('text-6xl').style(f'color: {state.brand_color}')
                        ui.label('Select Narrator Voice').classes('text-slate-400 text-sm')
                        
                        with ui.row().classes('gap-4'):
                            ui.select(options=state.voice_options, label="Voice", value=state.content.get("voice_id")) \
                                .classes('w-64').props('dark filled dense').bind_value(state.content, "voice_id")
                            ui.select(options=state.tts_model_options, label="TTS Model", value=state.content.get("tts_model")) \
                                .classes('w-64').props('dark filled dense').bind_value(state.content, "tts_model")
                
                # STEP 6: Audio Preview
                elif state.current_step == 6:
                    audio_file = outputs_dir / f"{slug}.mp3"
                    with ui.column().classes('w-full items-center gap-6 py-8'):
                        ui.icon('headphones').classes('text-6xl').style(f'color: {state.brand_color}')
                        if audio_file.exists():
                            ui.audio(f"/outputs/{slug}.mp3").classes('w-full max-w-md')
                            ui.label('Listen to your generated narration').classes('text-slate-400 text-xs')
                        else:
                            ui.label('Audio not yet generated').classes('text-amber-500')
                
                # STEP 7: Transcription Review
                elif state.current_step == 7:
                    words_file = outputs_dir / f"{slug}_words.json"
                    with ui.column().classes('w-full gap-4'):
                        with ui.row().classes('w-full justify-between items-center'):
                            ui.label('Word-Level Transcription').classes('text-sm font-bold text-slate-400')
                        
                        if words_file.exists():
                            import json
                            try:
                                if words_file.stat().st_size == 0:
                                    raise ValueError("File is empty")
                                with open(words_file) as f:
                                    words = json.load(f)
                                with ui.row().classes('flex-wrap gap-1'):
                                    for w in words[:100]:  # Limit display
                                        ui.label(w.get("word", "")).classes('px-1 py-0.5 bg-slate-800 rounded text-xs')
                            except (json.JSONDecodeError, ValueError, Exception) as e:
                                with ui.column().classes('w-full items-center p-8 bg-red-900/10 rounded-2xl border border-red-900/30'):
                                    ui.icon('error', color='red').classes('text-3xl mb-2')
                                    ui.label(f'Corrupt Transcription File').classes('text-red-500 font-bold')
                                    ui.label('The transcription file is empty or invalid. Please regenerate.').classes('text-slate-400 text-xs text-center mb-4')
                                    ui.button('REGENERATE TRANSCRIPT', icon='bolt', on_click=on_generate_transcript) \
                                        .classes('px-6 py-2').style(f'background: {state.brand_color}') \
                                        .bind_enabled_from(state, 'is_processing', backward=lambda x: not x)
                        else:
                            with ui.column().classes('w-full items-center p-12 bg-slate-900/30 rounded-2xl border border-dashed border-slate-700'):
                                ui.icon('subtitles_off', size='48px').classes('text-slate-600 mb-2')
                                ui.label('Transcription not yet generated').classes('text-amber-500 mb-4')
                                ui.button('GENERATE TRANSCRIPT', icon='bolt', on_click=on_generate_transcript) \
                                    .classes('px-6 py-2').style(f'background: {state.brand_color}') \
                                    .bind_enabled_from(state, 'is_processing', backward=lambda x: not x)
                
                # STEP 8: Source Video Download
                elif state.current_step == 8:
                    source_file = list(outputs_dir.glob(f"{slug}_source*"))
                    with ui.column().classes('w-full items-center gap-6 py-8'):
                        ui.icon('download').classes('text-6xl').style(f'color: {state.brand_color}')
                        
                        # YouTube URL input
                        with ui.row().classes('w-full max-w-md items-center gap-2'):
                            ui.input('YouTube URL', value=state.content.get("youtube_URL")) \
                                .classes('flex-1').props('dark dense').bind_value(state.content, "youtube_URL")
                            if not source_file:
                                ui.button('DOWNLOAD', icon='download', on_click=on_download_source) \
                                    .classes('px-4 py-2').style(f'background: {state.brand_color}') \
                                    .bind_enabled_from(state, 'is_processing', backward=lambda x: not x)
                        
                        if source_file:
                            ui.video(f"/outputs/{source_file[0].name}").classes('w-full max-w-md rounded-xl')
                            ui.label('Source video ready').classes('text-green-500 text-xs')
                
                # STEP 9: Video Crop Preview
                elif state.current_step == 9:
                    cropped_file = outputs_dir / f"{slug}_cropped.mp4"
                    with ui.column().classes('w-full items-center gap-6 py-8'):
                        ui.icon('content_cut').classes('text-6xl').style(f'color: {state.brand_color}')
                        if cropped_file.exists():
                            ui.video(f"/outputs/{slug}_cropped.mp4").classes('w-full max-w-md rounded-xl')
                            ui.label('Video cropped and looped').classes('text-green-500 text-xs')
                        else:
                            ui.label('Processing...').classes('text-amber-500')
                
                # STEP 10: Audio Mixing Preview
                elif state.current_step == 10:
                    mixed_file = outputs_dir / f"{slug}_mixed.mp4"
                    with ui.column().classes('w-full items-center gap-6 py-8'):
                        ui.icon('library_music').classes('text-6xl').style(f'color: {state.brand_color}')
                        
                        # Music selector
                        ui.select(state.music_options, label="Background Music", value=state.content.get("bg_music") or (state.music_options[0] if state.music_options else None)) \
                            .classes('w-64').props('dark dense').bind_value(state.content, "bg_music")
                        
                        if mixed_file.exists():
                            ui.video(f"/outputs/{slug}_mixed.mp4").classes('w-full max-w-md rounded-xl')
                            ui.label('Audio mixed successfully').classes('text-green-500 text-xs')
                        else:
                            ui.label('Click CONTINUE to mix audio').classes('text-slate-500 text-xs')
                
                # STEP 11: Final Render
                elif state.current_step == 11:
                    final_file = outputs_dir / f"{slug}_final.mp4"
                    with ui.column().classes('w-full items-center gap-6 py-8'):
                        if final_file.exists():
                            ui.video(f"/outputs/{slug}_final.mp4").classes('w-full max-w-lg rounded-xl shadow-2xl')
                            ui.label('🎬 Final video ready!').classes('text-green-500 font-bold')
                            # Download link
                            ui.link('DOWNLOAD VIDEO', f"/outputs/{slug}_final.mp4").classes('px-6 py-3 rounded-xl font-bold').style(f'background: {state.brand_color}; color: black;')
                        else:
                            ui.icon('movie').classes('text-6xl').style(f'color: {state.brand_color}')
                            ui.label('Rendering in progress...').classes('text-amber-500')
        
        # Navigation Buttons
        with ui.row().classes('w-full justify-between items-center mt-2'):
            # Back button
            if state.current_step > 1:
                ui.button('BACK', icon='arrow_back', on_click=lambda: go_prev_step(state)).props('flat').classes('text-slate-400')
            else:
                ui.label('')  # Spacer
            
            with ui.row().classes('gap-2'):
                # Regenerate button for content steps
                if state.current_step in [2, 3, 4]:
                    ui.button('REGENERATE', icon='refresh', on_click=on_regenerate).props('flat').classes('text-slate-400') \
                        .bind_enabled_from(state, 'is_processing', backward=lambda x: not x)
                
                # Dynamic Action Button logic
                if state.current_step < 11:
                    action_label = config["action"]
                    
                    if state.current_step == 5:
                        # Logic for Step 5: Voice
                        audio_file = outputs_dir / f"{slug}.mp3"
                        if audio_file.exists():
                            ui.button('CONTINUE', icon='arrow_forward', on_click=on_next_step) \
                                .classes('px-6 py-3 font-bold rounded-xl').style(f'background: {state.brand_color}; color: black;')
                        else:
                            ui.button('GENERATE AUDIO', icon='mic', on_click=on_generate_audio) \
                                .classes('px-6 py-3 font-bold rounded-xl').style(f'background: {state.brand_color}; color: black;') \
                                .bind_enabled_from(state, 'is_processing', backward=lambda x: not x)
                    
                    elif state.current_step == 7:
                        # Logic for Step 7: Transcript
                        words_file = outputs_dir / f"{slug}_words.json"
                        if words_file.exists():
                            ui.button('CONTINUE', icon='arrow_forward', on_click=on_next_step) \
                                .classes('px-6 py-3 font-bold rounded-xl').style(f'background: {state.brand_color}; color: black;')
                        else:
                            ui.button('GENERATE TRANSCRIPT', icon='bolt', on_click=on_generate_transcript) \
                                .classes('px-6 py-3 font-bold rounded-xl').style(f'background: {state.brand_color}; color: black;') \
                                .bind_enabled_from(state, 'is_processing', backward=lambda x: not x)
                    
                    elif state.current_step == 9:
                        # Logic for Step 9: Crop Preview
                        cropped_file = outputs_dir / f"{slug}_cropped.mp4"
                        if cropped_file.exists():
                            ui.button('CONTINUE', icon='arrow_forward', on_click=on_next_step) \
                                .classes('px-6 py-3 font-bold rounded-xl').style(f'background: {state.brand_color}; color: black;')
                        else:
                            ui.button('PROCESS VIDEO', icon='content_cut', on_click=on_generate_video) \
                                .classes('px-6 py-3 font-bold rounded-xl').style(f'background: {state.brand_color}; color: black;') \
                                .bind_enabled_from(state, 'is_processing', backward=lambda x: not x)
                                
                    elif state.current_step == 10:
                        # Logic for Step 10: Mix Preview
                        mixed_file = outputs_dir / f"{slug}_mixed.mp4"
                        if mixed_file.exists():
                            ui.button('CONTINUE', icon='arrow_forward', on_click=on_next_step) \
                                .classes('px-6 py-3 font-bold rounded-xl').style(f'background: {state.brand_color}; color: black;')
                        else:
                            ui.button('MIX AUDIO', icon='library_music', on_click=on_generate_video) \
                                .classes('px-6 py-3 font-bold rounded-xl').style(f'background: {state.brand_color}; color: black;') \
                                .bind_enabled_from(state, 'is_processing', backward=lambda x: not x)
                    
                    else:
                        # Default simple next
                        ui.button(action_label, icon='arrow_forward', on_click=on_next_step) \
                            .classes('px-6 py-3 font-bold rounded-xl').style(f'background: {state.brand_color}; color: black;')
                else:
                    # Step 11: Render or New Job
                    final_file = outputs_dir / f"{slug}_final.mp4"
                    if final_file.exists():
                        ui.button('NEW JOB', icon='add', on_click=on_back) \
                            .classes('px-6 py-3 font-bold rounded-xl').style(f'background: {state.brand_color}; color: black;')
                    else:
                        ui.button('FINAL RENDER', icon='movie', on_click=on_generate_video) \
                            .classes('px-6 py-3 font-bold rounded-xl').style(f'background: {state.brand_color}; color: black;') \
                            .bind_enabled_from(state, 'is_processing', backward=lambda x: not x)
        
        # Global progress indicator
        global_progress_indicator(state)
                

def go_prev_step(state: State):
    """Go to previous step."""
    if state.current_step > 1:
        state.current_step -= 1
        ui.navigate.to('/')

