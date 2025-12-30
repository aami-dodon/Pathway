#!/bin/bash

# start-video-engine.sh
# One-click script to install dependencies, set up, and start the Pathway Video Engine.

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting Pathway Video Engine Setup...${NC}"

# 1. Environment & Path Setup
export PATH="$HOME/.local/bin:$PATH"

# 2. Check for Python 3.10+
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3.10 or higher.${NC}"
    exit 1
fi

PY_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
PY_MAJOR=$(echo $PY_VERSION | cut -d. -f1)
PY_MINOR=$(echo $PY_VERSION | cut -d. -f2)

if [ "$PY_MAJOR" -lt 3 ] || ([ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -lt 10 ]); then
    echo -e "${RED}❌ Python version 3.10+ is required. Found $PY_VERSION${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Found Python $PY_VERSION${NC}"

# 3. Check for Poetry
if ! command -v poetry &> /dev/null; then
    echo -e "${YELLOW}⚠️ Poetry not found. Attempting to install Poetry...${NC}"
    curl -sSL https://install.python-poetry.org | python3 -
    if [ -f "$HOME/.zshrc" ]; then
        grep -q "export PATH=\"\$HOME/.local/bin:\$PATH\"" "$HOME/.zshrc" || echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.zshrc"
    fi
    if [ -f "$HOME/.bash_profile" ]; then
        grep -q "export PATH=\"\$HOME/.local/bin:\$PATH\"" "$HOME/.bash_profile" || echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bash_profile"
    fi
fi
echo -e "${GREEN}✅ Poetry is ready.${NC}"

# 4. Check for System Dependencies (Mac Specific)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${BLUE}🔍 Checking system dependencies (FFmpeg, Cairo)...${NC}"
    
    if ! command -v brew &> /dev/null; then
        echo -e "${YELLOW}⚠️ Homebrew not found. Homebrew is required for automatic FFmpeg/Cairo installation.${NC}"
    else
        # Install FFmpeg
        if ! command -v ffmpeg &> /dev/null; then
            echo -e "${YELLOW}⚠️ FFmpeg missing. Installing...${NC}"
            brew install ffmpeg
        fi
        
        # Install Cairo dependencies (required for cairosvg/Pillow-SVG)
        if ! brew list cairo &>/dev/null; then
            echo -e "${YELLOW}⚠️ SVG Rendering libraries missing. Installing Cairo/Pango...${NC}"
            brew install cairo pango gdk-pixbuf libxml2 libffi
        fi
    fi
fi

# 5. Navigate and Install Python Dependencies
echo -e "${BLUE}📦 Navigating to video-engine and installing dependencies...${NC}"
cd video-engine || { echo -e "${RED}❌ video-engine directory not found!${NC}"; exit 1; }

poetry install

# 6. Setup .env if missing
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️ .env file missing. Creating template...${NC}"
    cat <<EOF > .env
GOOGLE_API_KEY=
ELEVENLABS_API_KEY=
CMS_API_URL=https://core.preppathway.com/api
CMS_EMAIL=sayantan.kumar.basu@gmail.com
CMS_PASSWORD=!1Dilbert
EOF
    echo -e "${BLUE}📝 Created .env template with production defaults.${NC}"
fi

# 7. Initialize Engine (Branding Assets, Model Discovery)
echo -e "${BLUE}🛠️ Running initialization (VFX generation & Model discovery)...${NC}"
poetry run init

# 8. Start the Engine
echo -e "${GREEN}✨ Setup complete! Launching Pathway Video Engine UI...${NC}"
poetry run python app/main.py
