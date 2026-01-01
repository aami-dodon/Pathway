# Pathway - Setup Guide

This guide walks you through setting up the entire Pathway application locally for development or self-hosting.

---

## Prerequisites

Before you begin, make sure you have the following installed:

| Requirement | Version | Installation |
|-------------|---------|--------------|
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org) |
| **pnpm** | 8+ | `npm install -g pnpm` |
| **Python** | 3.11+ | [python.org](https://python.org) |
| **Poetry** | Latest | `pip install poetry` |
| **FFmpeg** | Latest | See below |
| **Docker** | Latest | [docker.com](https://docker.com) *(optional)* |
| **PostgreSQL** | 14+ | Via Docker or local install |

### Installing FFmpeg

| Platform | Command |
|----------|---------|
| macOS | `brew install ffmpeg` |
| Windows | `winget install ffmpeg` |
| Ubuntu/Debian | `sudo apt install ffmpeg` |

---

## Quick Start with Docker (Recommended)

The easiest way to run everything is with Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd Pathway

# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
cp video-engine/.env.example video-engine/.env

# Start all services
docker compose up --build
```

This starts:
- **Backend** at `http://localhost:9006`
- **Frontend** at `http://localhost:3001`
- **PostgreSQL** database
- **MinIO** for file storage

### Seed Sample Data

Once the containers are running:

```bash
docker compose exec backend npm run seed
```

---

## Manual Setup (Without Docker)

### 1. Database Setup

Start PostgreSQL locally or use Docker:

```bash
docker run -d \
  --name pathway-db \
  -e POSTGRES_DB=pathway \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:14
```

### 2. MinIO Setup (File Storage)

```bash
docker run -d \
  --name pathway-minio \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  -p 9000:9000 \
  -p 9001:9001 \
  minio/minio server /data --console-address ":9001"
```

Create a bucket named `pathway-media-dev` via the MinIO console at `http://localhost:9001`.

---

## Backend Configuration

### Environment Variables

Create `backend/.env`:

```env
# Database
DATABASE_URI=postgresql://postgres:postgres@localhost:5432/pathway

# Security
PAYLOAD_SECRET=your-secret-key-at-least-32-chars

# S3/MinIO Storage
S3_BUCKET=pathway-media-dev
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_REGION=us-east-1

# Admin User (for seeding)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=securepassword123

# Email (optional)
RESEND_API_KEY=your-resend-api-key
```

### Running the Backend

```bash
cd backend
pnpm install
pnpm dev
```

Backend runs at `http://localhost:9006`.

### Seed Data

```bash
pnpm seed
```

---

## Frontend Configuration

### Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:9006
```

### Running the Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend runs at `http://localhost:3001`.

---

## Video Engine Configuration

The video engine is a Python service for AI-powered video generation.

### Environment Variables

Create `video-engine/.env`:

```env
# AI Services
GOOGLE_API_KEY=your-google-ai-studio-key
ELEVENLABS_API_KEY=your-elevenlabs-key

# CMS Integration (optional)
CMS_API_URL=http://localhost:9006
CMS_API_KEY=your-cms-api-key
```

### Running the Video Engine

```bash
cd video-engine

# Install dependencies
poetry install

# Initialize models and assets
poetry run init

# Start the application
poetry run python app/main.py
```

Video Engine UI runs at `http://localhost:8001`.

---

## Running All Services Together

### Option 1: Docker Compose (All-in-One)

```bash
docker compose up
```

### Option 2: Manual (Separate Terminals)

**Terminal 1 - Backend:**
```bash
cd backend && pnpm dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend && pnpm dev
```

**Terminal 3 - Video Engine:**
```bash
cd video-engine && poetry run python app/main.py
```

### Option 3: Using Root Scripts

```bash
# Start backend and frontend together
pnpm dev

# Start video engine (separate terminal)
./start-video-engine.sh
```

---

## Service URLs Summary

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3001 | Public website |
| Backend | http://localhost:9006 | API & Admin panel |
| Video Engine | http://localhost:8001 | Video generation UI |
| MinIO Console | http://localhost:9001 | File storage admin |

---

## Troubleshooting

### Database Connection Failed

- Ensure PostgreSQL is running
- Check `DATABASE_URI` in `backend/.env`
- Verify the database `pathway` exists

### MinIO Upload Errors

- Ensure MinIO is running on port 9000
- Verify the bucket `pathway-media-dev` exists
- Check S3 credentials in `backend/.env`

### Video Engine FFmpeg Error

Ensure FFmpeg is installed and in your PATH:

```bash
ffmpeg -version
```

### Port Already in Use

Change the port in the respective `.env` file or stop the conflicting service:

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

---

## Next Steps

- Access the admin panel at `http://localhost:9006/admin`
- Login with the admin credentials from your `.env`
- Create courses, blog posts, and coaching profiles
- Visit the frontend at `http://localhost:3001` to see your content
