from nicegui import ui, events
import json
import os
from pathlib import Path
from typing import Optional, List, Dict
from datetime import datetime
import re
import uuid

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
        self.current_step = 1 # 1: Topic Input, 2: Blog Editor, 3: Excerpt Editor, 4: Story Editor
        self.terminal_open = False # Track terminal drawer state
        self.content = {"topic": "", "blog": "", "excerpt": "", "speech": ""}
        self.draft_file = data_dir / "draft.json"
        
        # Load draft if exists - go to blog step if draft has content
        draft = self._load_json(self.draft_file, None)
        if draft:
            self.content = draft
            if draft.get("blog"):
                self.current_step = 2

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
        with open(self.draft_file, "w") as f:
            json.dump(self.content, f, indent=4)
        ui.notify('Draft saved!', type='positive')

    def clear_draft(self):
        if self.draft_file.exists():
            self.draft_file.unlink()
        self.content = {"topic": "", "blog": "", "excerpt": "", "speech": ""}
        self.current_step = 1

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

    def update_job(self, job_id: str, status: str = None, progress: int = None, content: Dict = None):
        """Update a job's status, progress, or content."""
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
        
        # 2. Clear Draft
        if self.draft_file.exists():
             try:
                 self.draft_file.unlink()
             except Exception as e:
                 print(f"Failed to delete draft: {e}")
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
            
            # Infer step
            content = state.content
            if content.get("output_video") and (state.data_dir / "outputs" / content.get("output_video")).exists():
                 # Final video exists (though maybe not technically possible if restaging, but let's be safe)
                 state.current_step = 5 
            elif content.get("voice_id") and (state.data_dir / "outputs" / content.get("voice_file", "voice.mp3")).exists():
                 # Has audio -> Preview Step
                 state.current_step = 5
            elif content.get("speech"):
                 # Has script -> Director Script Step
                 state.current_step = 4
            elif content.get("excerpt"):
                 # Has excerpt -> Story Step (misnamed in logic? Step 4 is Director which uses speech/script)
                 # Flow: Topic(1) -> Blog(2) -> Excerpt(3) -> Script(4) -> Audio(5)
                 state.current_step = 3
            elif content.get("blog"):
                 state.current_step = 2
            else:
                 state.current_step = 1
            
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

def generator_panel(state: State, on_start):
    with ui.column().classes('w-full max-w-3xl mx-auto gap-4'):
        # Glassmorphic Main Card
        with ui.card().classes('w-full p-6 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl').style(f'background: {state.brand_background}cc;'):
            ui.label('Design your content').classes('text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 text-center')
            ui.label('What should we build today?').classes('text-2xl font-bold text-white text-center mb-4')
            
            topic = ui.input(placeholder='e.g. The Future of Smart Cities') \
                .classes(f'w-full text-lg font-medium p-3 bg-slate-800/30 border-0 rounded-xl transition-all focus:ring-2 focus:ring-[{state.brand_color}]') \
                .props('dark borderless autofocus').bind_value(state.content, 'topic')
            
            with ui.row().classes('w-full justify-center mt-4'):
                ui.button('START MANIPULATION', on_click=lambda: on_start(topic.value, 'default')) \
                    .classes(f'h-12 px-8 text-black font-black text-sm rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all transform hover:scale-105 active:scale-95') \
                    .style(f'background-color: {state.brand_color}') \
                    .bind_enabled_from(state, 'is_processing', backward=lambda x: not x)

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

def content_editor_panel(state: State, on_back, on_generate_audio, on_generate_video, on_next_step, on_regenerate):
    """Step-based content editor wizard with audio-first workflow."""
    
    # Step configuration - Audio generation before video
    step_config = {
        2: {"title": "The Article", "subtitle": "Write your blog content", "field": "blog", "icon": "description", "next_label": "NEXT: EXCERPT"},
        3: {"title": "Social Blurb", "subtitle": "Create a catchy excerpt", "field": "excerpt", "icon": "campaign", "next_label": "NEXT: STORY"},
        4: {"title": "Director Script", "subtitle": "Write the narration script", "field": "speech", "icon": "record_voice_over", "next_label": "GENERATE AUDIO"},
        5: {"title": "Audio Preview", "subtitle": "Review audio before video generation", "field": None, "icon": "headphones", "next_label": "GENERATE VIDEO"}
    }
    
    config = step_config.get(state.current_step, step_config[2])
    
    with ui.column().classes('w-full h-full max-w-4xl mx-auto gap-3'):
        # Progress indicator - clickable navigation
        with ui.row().classes('w-full justify-center gap-2'):
            for step_num in [2, 3, 4, 5]:
                step_info = step_config[step_num]
                is_active = state.current_step == step_num
                is_completed = state.current_step > step_num
                is_accessible = state.current_step >= step_num  # Can click on current or completed steps
                
                color = state.brand_color if is_active else ("#22c55e" if is_completed else "#334155")
                cursor = "cursor-pointer" if is_accessible else "cursor-not-allowed"
                
                def make_nav_handler(target_step):
                    def go_to_step():
                        if state.current_step >= target_step:
                            state.current_step = target_step
                            ui.navigate.to('/')
                    return go_to_step
                
                with ui.row().classes(f'items-center gap-1 {cursor}').on('click', make_nav_handler(step_num)):
                    ui.icon(step_info["icon"]).classes('text-lg').style(f'color: {color}')
                    if step_num < 5: # Hide title for Step 5 to save space, or keep it short
                        ui.label(step_info["title"]).classes(f'text-xs {"font-bold" if is_active else ""} hover:opacity-80 hidden sm:block').style(f'color: {color}')
                    else:
                        ui.label("Audio").classes(f'text-xs {"font-bold" if is_active else ""} hover:opacity-80 hidden sm:block').style(f'color: {color}')
                    
                    if step_num < 5:
                        ui.icon('chevron_right').classes('text-slate-600')
        
        # Header
        with ui.row().classes('w-full items-center justify-between'):
            with ui.column().classes('gap-0'):
                with ui.row().classes('items-center gap-2'):
                    ui.icon(config["icon"]).classes('text-xl').style(f'color: {state.brand_color}')
                    ui.label(config["title"]).classes('text-xl font-black')
                ui.label(config["subtitle"]).classes('text-slate-400 text-xs')
            
            ui.button(icon='close', on_click=on_back).classes('rounded-full bg-slate-800 hover:bg-slate-700 p-2')
        
        # Editor Card / Audio Preview
        with ui.card().classes('w-full border border-slate-800 rounded-2xl overflow-hidden p-0').style(f'background: {state.brand_background}cc; height: calc(100vh - 280px);'):
            if state.current_step == 5:
                # Audio Preview Step
                with ui.column().classes('w-full h-full justify-center items-center gap-6 p-8'):
                    ui.icon('headphones').classes('text-6xl text-slate-600')
                    
                    # Audio Player
                    audio_filename = state.content.get("voice_file") or "voice.mp3"
                    # Fallback for old jobs with typo
                    if not (state.data_dir / "outputs" / audio_filename).exists() and (state.data_dir / "outputs" / "narration.mp3").exists():
                        audio_filename = "narration.mp3"
                    if not (state.data_dir / "outputs" / audio_filename).exists() and (state.data_dir / "outputs" / "narrartion.mp3").exists():
                        audio_filename = "narrartion.mp3"
                        
                    audio_url = f"/outputs/{audio_filename}" 
                    audio = ui.audio(audio_url).classes('w-full max-w-md')
                    
                    ui.label('Listen to the generated narration before creating the video.').classes('text-slate-400')
                    
            else:
                # Text Editor Steps
                with ui.scroll_area().classes('w-full h-full'):
                    # Voice Selection for Step 4
                    if state.current_step == 4:
                        with ui.row().classes('w-full items-center gap-4 mb-2 p-4'): 
                            # Determine bg color (can use darker shade for contrast if needed, or same as brand)
                            bg_style = f'background-color: {state.brand_background};'
                            text_style = f'color: {state.brand_color};'
                            
                            ui.select(
                                options=state.voice_options, 
                                label="Select Narrator Voice",
                                value=state.content.get("voice_id")
                            ).classes('w-64') \
                             .props(f'dark filled dense behavior=menu popup-content-style="{bg_style} {text_style}"') \
                             .style(bg_style + text_style) \
                             .bind_value(state.content, "voice_id")
                            
                            ui.select(
                                options=state.tts_model_options, 
                                label="Select TTS Model",
                                value=state.content.get("tts_model")
                            ).classes('w-64') \
                             .props(f'dark filled dense behavior=menu popup-content-style="{bg_style} {text_style}"') \
                             .style(bg_style + text_style) \
                             .bind_value(state.content, "tts_model")
                            
                    ui.textarea(placeholder=f"Enter your {config['field']} here...") \
                        .classes('w-full text-base bg-transparent border-0 p-4') \
                        .style('min-height: calc(100vh - 300px); padding-bottom: 60px;') \
                        .props('dark borderless autofocus autogrow') \
                        .bind_value(state.content, config["field"])
        
        # Navigation buttons
        with ui.row().classes('w-full justify-between items-center'):
            # Back button - ghost style
            if state.current_step > 2:
                ui.button('BACK', icon='arrow_back', on_click=lambda: go_prev_step(state)) \
                    .props('outline') \
                    .classes('px-6 py-3 rounded-xl text-sm text-slate-400')
            else:
                ui.button('CANCEL', icon='close', on_click=on_back) \
                    .props('outline') \
                    .classes('px-6 py-3 rounded-xl text-sm text-slate-400')
            
            with ui.row().classes('gap-2'):
                if state.current_step < 5:
                    ui.button('REGENERATE', icon='refresh', on_click=on_regenerate) \
                        .props('flat') \
                        .classes('px-4 py-3 rounded-xl text-xs text-slate-400') \
                        .bind_enabled_from(state, 'is_processing', backward=lambda x: not x)
                    
                    ui.button('SAVE', icon='save', on_click=state.save_draft) \
                        .props('flat') \
                        .classes('px-4 py-3 rounded-xl text-xs text-slate-400')
                
                # Next/Generate button logic
                if state.current_step < 4:
                    # Steps 2 & 3: Just Next
                    ui.button(config["next_label"], icon='arrow_forward', on_click=on_next_step) \
                        .classes('px-8 py-3 text-black font-bold rounded-xl') \
                        .style(f'background-color: {state.brand_color}')
                elif state.current_step == 4:
                     # Step 4: Generate Audio
                    ui.button(config["next_label"], icon='mic', on_click=on_generate_audio) \
                        .classes('px-8 py-3 text-black font-bold rounded-xl') \
                        .style(f'background-color: {state.brand_color}') \
                        .bind_enabled_from(state, 'is_processing', backward=lambda x: not x)
                else:
                    # Step 5: Generate Video
                    ui.button(config["next_label"], icon='movie', on_click=on_generate_video) \
                        .classes('px-8 py-3 text-black font-bold rounded-xl') \
                        .style(f'background-color: {state.brand_color}') \
                        .bind_enabled_from(state, 'is_processing', backward=lambda x: not x)

def go_prev_step(state: State):
    """Go to previous step."""
    if state.current_step > 2:
        state.current_step -= 1
        ui.navigate.to('/')

