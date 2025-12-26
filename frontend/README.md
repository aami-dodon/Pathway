# Pathway Frontend

This is the public-facing frontend for the Pathway application, built with **Next.js 16**, **Tailwind CSS 4**, and **shadcn/ui** components.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) with Typography plugin
- **Components**: [shadcn/ui](https://ui.shadcn.com) with Lucide icons
- **Package Manager**: pnpm

## Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Setup Environment**:
   Create a `.env.local` file with:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Run Development Server**:
   ```bash
   pnpm dev --port 3001
   ```
   The frontend will start at `http://localhost:3001`.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, features, and CTA |
| `/blog` | Blog posts listing (fetches from CMS) |
| `/courses` | Courses catalog (fetches from LMS) |
| `/coaches` | Coach profiles directory |
| `/login` | User sign in |
| `/register` | User registration |
| `/profile` | User profile management |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── blog/              # Blog listing
│   ├── coaches/           # Coaches directory
│   ├── courses/           # Courses catalog
│   ├── login/             # Login page
│   ├── profile/           # User profile
│   ├── register/          # Registration
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/
│   ├── layout/            # Header, Footer
│   ├── providers/         # Auth, Theme providers
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
└── lib/
    ├── api.ts            # Backend API client
    └── utils.ts          # Utility functions
```

## API Integration

The frontend connects to the Payload CMS backend at the URL specified in `NEXT_PUBLIC_API_URL`. The API client in `src/lib/api.ts` provides typed methods for:

- **Authentication**: Login, logout, get current user
- **Users**: Fetch, update user profiles
- **Coach Profiles**: Public coach directory
- **Subscriber Profiles**: User profile management
- **Posts**: Blog content from CMS
- **Categories & Tags**: Content categorization

## Features

- 🌙 **Dark/Light Mode**: Automatic theme switching with system preference detection
- 📱 **Responsive Design**: Mobile-first approach with adaptive layouts
- 🔐 **Authentication**: Session-based auth with the backend
- 🎨 **Modern UI**: Glassmorphism, gradients, and micro-animations
- 📊 **Loading States**: Skeleton loaders for async content
- 🔗 **SEO Ready**: Meta tags, Open Graph support
