# Pathway Backend

The backend service for the Pathway learning platform.

## Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database
- MinIO or S3-compatible storage (for media files)

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Required environment variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URI` | PostgreSQL connection string |
| `PAYLOAD_SECRET` | Secret key for Payload CMS |
| `S3_BUCKET` | Public S3/MinIO bucket name |
| `S3_ENDPOINT` | S3/MinIO endpoint URL |
| `S3_ACCESS_KEY` | S3/MinIO access key |
| `S3_SECRET_KEY` | S3/MinIO secret key |
| `ADMIN_EMAIL` | Admin user email for seeding |
| `ADMIN_PASSWORD` | Admin user password for seeding |

### 3. Run Development Server

```bash
pnpm dev
```

The server starts at `http://localhost:9006`.

### 4. Seed Sample Data

Run the seed script to populate the database with sample data:

```bash
pnpm seed
```

> **Note:** Seeding is idempotent - you can run it multiple times safely.

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm seed` | Seed database with sample data |
| `pnpm test:api` | Run API test suite |

## Docker

You can run the backend using Docker Compose from the project root:

```bash
docker compose up backend
```

To seed data in Docker:

```bash
docker compose exec backend npm run seed
```

## Access Control

See [ACCESS_CONTROL.md](./ACCESS_CONTROL.md) for detailed documentation on roles and permissions.

**Roles:**
- `admin` - Full system access
- `coach` - Create courses, manage coaching sessions
- `creator` - Create blog content
- `subscriber` - Access courses and content

## Project Structure

```
src/
├── collections/     # Database collections/models
├── globals/         # Global configuration
├── access/          # Access control utilities
├── endpoints/       # Custom API endpoints
├── email/           # Email templates and service
└── seed/            # Database seeding scripts
```

## Learn More

- [API Documentation](#) - Explore the REST API
- [Access Control](./ACCESS_CONTROL.md) - Role-based permissions
