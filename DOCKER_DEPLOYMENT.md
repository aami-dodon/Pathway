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

**1. Update your `.env` files on the VPS:**

**Frontend `.env`:**
```bash
PORT=9007
NEXT_PUBLIC_API_URL=https://pathway-api.dodon.in
INTERNAL_API_URL=http://backend:9006
```

**Backend `.env`:**
```bash
BASE_URL=https://pathway-api.dodon.in
PORT=9006
CORS_ORIGINS=https://pathway.dodon.in,https://pathway-api.dodon.in
# ... rest of your production variables
```

**2. Deploy:**
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

- The `docker-compose.yml` reads `NEXT_PUBLIC_API_URL` from your `.env` file
- If not set, it defaults to `http://localhost:9006` for local development
- On production, set it to `https://pathway-api.dodon.in` in your `.env`
- No separate docker-compose file needed!

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
