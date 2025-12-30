import yt_dlp
import subprocess
from pathlib import Path

class YTDownloader:
    def __init__(self, cookies_path: Path = None):
        self.cookies_path = cookies_path

    def get_info(self, url: str):
        with yt_dlp.YoutubeDL() as ydl:
            return ydl.extract_info(url, download=False)

    def download(self, url: str, output_dir: Path, filename_prefix: str = "source"):
        # First get info to find resolution
        info = self.get_info(url)
        # Select best format below 1080p for efficiency, or just best
        # The user wants "add a suffix to what resolution you downloaded"
        
        # We'll use subprocess for yt-dlp to match existing project style if needed, 
        # but yt_dlp library is more flexible here.
        # Let's try to find the resolution of the "best" format
        best_format = info.get('formats', [{}])[-1]
        height = best_format.get('height', 'unknown')
        resolution_suffix = f"{height}p"
        
        filename = f"{filename_prefix}_{resolution_suffix}.mp4"
        output_path = output_dir / filename
        
        ydl_opts = {
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            'outtmpl': str(output_path),
            'quiet': True,
        }
        if self.cookies_path and self.cookies_path.exists():
            ydl_opts['cookiefile'] = str(self.cookies_path)
            
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
            
        return output_path, resolution_suffix
