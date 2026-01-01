# Pathway Frontend

The public-facing web application for the Pathway learning platform.

## Prerequisites

- Node.js 18+
- pnpm
- Backend service running (for API access)

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Create a `.env.local` file with your configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:9006
```

### 3. Run Development Server

```bash
pnpm dev
```

The frontend starts at `http://localhost:3001`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

## Pages Overview

| Route | Description |
|-------|-------------|
| `/` | Homepage with features and CTAs |
| `/blog` | Blog posts and articles |
| `/courses` | Course catalog |
| `/coaches` | Coach directory and profiles |
| `/login` | User sign in |
| `/register` | New user registration |
| `/profile` | User profile management |
| `/my-courses` | Enrolled courses dashboard |

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── blog/           # Blog pages
│   ├── coaches/        # Coach directory
│   ├── courses/        # Course catalog
│   ├── login/          # Authentication
│   ├── register/       # Registration
│   ├── profile/        # User profile
│   └── my-courses/     # Learning dashboard
├── components/
│   ├── layout/         # Header, Footer
│   ├── providers/      # Auth, Theme providers
│   ├── ui/             # Reusable UI components
│   ├── blog/           # Blog-specific components
│   ├── courses/        # Course-specific components
│   └── home/           # Homepage components
├── hooks/              # Custom React hooks
└── lib/
    ├── api.ts          # Backend API client
    └── utils.ts        # Utility functions
```

## Development Workflow

1. **Start the backend** - Ensure the backend is running at the configured API URL
2. **Run the frontend** - Start with `pnpm dev`
3. **Make changes** - Edit files in `src/` with hot reload
4. **Test** - Preview changes at `http://localhost:3001`

## Features

- 🌙 **Dark/Light Mode** - Automatic theme switching
- 📱 **Responsive Design** - Mobile-first layouts
- 🔐 **Authentication** - Session-based auth
- 🎨 **Modern UI** - Sleek design with animations
- 📊 **Loading States** - Skeleton loaders for async content
- 🔗 **SEO Optimized** - Meta tags and Open Graph support

## Docker

Run using Docker Compose from the project root:

```bash
docker compose up frontend
```
