# Docker Deployment Guide

## Quick Start

### Local Development
```bash
docker compose up --build
```
Access at:
- Frontend: http://localhost:9007
- Backend: http://localhost:9006

### Production Deployment (VPS)

**IMPORTANT:** Docker Compose needs build-time variables in a `.env` file in the **root directory** (same level as `docker-compose.yml`), not in the `frontend/.env` file.

**1. Create `.env` file in the root directory:**

```bash
# In /path/to/Pathway/.env (root directory)
NEXT_PUBLIC_API_URL=https://pathway-api.dodon.in
```

**2. Update `frontend/.env`:**
```bash
PORT=9007
NEXT_PUBLIC_API_URL=https://pathway-api.dodon.in
INTERNAL_API_URL=http://backend:9006
```

**3. Update `backend/.env`:**
```bash
BASE_URL=https://pathway-api.dodon.in
PORT=9006
CORS_ORIGINS=https://pathway.dodon.in,https://pathway-api.dodon.in
# ... rest of your production variables
```

**4. Deploy:**
```bash
docker compose up --build -d
```

**3. Setup Nginx reverse proxy** to route:
- `https://pathway.dodon.in` → `localhost:9007` (frontend)
- `https://pathway-api.dodon.in` → `localhost:9006` (backend)

**4. Enable SSL:**
```bash
sudo certbot --nginx -d pathway.dodon.in -d pathway-api.dodon.in
```

## How It Works

**Three `.env` files are used:**

1. **Root `.env`** (same level as `docker-compose.yml`)
   - Used by Docker Compose for **build-time** variables
   - Must contain: `NEXT_PUBLIC_API_URL=https://pathway-api.dodon.in`
   - This is what gets baked into the frontend build

2. **`frontend/.env`**
   - Used by the frontend container at **runtime**
   - Contains: `INTERNAL_API_URL` for server-side API calls

3. **`backend/.env`**
   - Used by the backend container at **runtime**
   - Contains: Database, S3, CORS, and other backend config

**Why the root `.env` is needed:**
- `NEXT_PUBLIC_API_URL` is a build-time variable (baked into the JavaScript bundle)
- Docker Compose reads variables from the root `.env` for the `args:` section
- The `frontend/.env` is only available at runtime, not during build

## Common Commands

```bash
# View logs
docker compose logs -f

# Restart services
docker compose restart

# Stop services
docker compose down

# Rebuild specific service
docker compose up --build -d frontend
```
