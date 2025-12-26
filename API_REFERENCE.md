# API Reference

Base URL (dev): `http://localhost:3000`. Override via `BASE_URL` (or `PORT`) in `.env`. All routes are served under `/api` (the `(payload)` route group is not part of the URL). Authenticated calls use `Authorization: Bearer <JWT>` issued by `POST /api/users/login`.

## Core Endpoints

| Path | Method | Description | Auth |
| --- | --- | --- | --- |
| `/api/graphql` | POST | GraphQL endpoint for all collections; enforces the same access rules as REST. | Bearer token when querying protected data |
| `/api/graphql-playground` | GET | GraphQL Playground UI. | Optional |
| `/api/availability` | GET | Public slot lookup for a coach between `from` and `to` dates. Query params: `coach` (coach profile id), `from` and `to` (ISO date strings). Excludes existing sessions and enforces 15-minute gaps. | Public |

## Auth (Users collection)

| Path | Method | Description | Access |
| --- | --- | --- | --- |
| `/api/users/login` | POST | Exchange `email` + `password` for a JWT (sent as cookie + bearer token). | Public |
| `/api/users/logout` | POST | Clear the current auth session. | Authenticated |
| `/api/users/refresh-token` | POST | Refresh JWT using the existing session. | Authenticated |
| `/api/users/forgot-password` | POST | Request a password reset email. | Public |
| `/api/users/reset-password` | POST | Reset password using the emailed token. | Public |
| `/api/users` | POST | Register a new user; role defaults to `subscriber` unless an admin sets it. | Public |

## Collection REST endpoints

Payload exposes standard REST routes for each collection: `GET /api/<slug>` (list), `GET /api/<slug>/:id`, `POST /api/<slug>`, `PATCH|PUT /api/<slug>/:id`, `DELETE /api/<slug>/:id`.

| Collection (slug) | Base path | Methods | Access highlights | Notes |
| --- | --- | --- | --- | --- |
| Users (`auth`) | `/api/users` | GET, POST, PATCH/PUT, DELETE | Read/update self; admins see/manage all; create is public; delete admin-only. | Auth collection; auth-specific endpoints listed above. |
| Media | `/api/media` | GET, POST, PATCH/PUT, DELETE | Read public; create requires auth; update owner (`createdBy`) or admin; delete admin-only. | File uploads (`multipart/form-data`); `createdBy` auto-set. |
| Coach Profiles | `/api/coach-profiles` | GET, POST, PATCH/PUT, DELETE | Read public; create admin/coach; update owner (`user`) or admin; delete admin-only. | Holds timezone + availability used by booking. |
| Subscriber Profiles | `/api/subscriber-profiles` | GET, POST, PATCH/PUT, DELETE | Read/update own profile or admin; create any authenticated user; delete admin-only. | One-to-one with users; `joinedAt` auto-set. |
| Categories | `/api/categories` | GET, POST, PATCH/PUT, DELETE | Read public; create/update admin or creator; delete admin-only. | — |
| Tags | `/api/tags` | GET, POST, PATCH/PUT, DELETE | Read public; create/update admin or creator; delete admin-only. | — |
| Posts | `/api/posts` | GET, POST, PATCH/PUT, DELETE | Public sees published + `accessLevel=public`; authenticated sees published public/subscribers; staff (admin/coach/creator) see all including drafts; create/update staff; delete admin-only. | Drafts enabled; `publishedAt` auto-set when status becomes published. |
| Pages | `/api/pages` | GET, POST, PATCH/PUT, DELETE | Public sees published; staff (admin/creator) see drafts; create/update staff; delete admin-only. | Drafts enabled. |
| Courses | `/api/courses` | GET, POST, PATCH/PUT, DELETE | Public sees published + `accessLevel=public`; authenticated sees published public/subscribers; staff (admin/coach) see all; create/update staff; delete admin-only. | Drafts enabled. |
| Modules | `/api/modules` | GET, POST, PATCH/PUT, DELETE | Admin/coach see all; others see `isPublished=true`; create/update admin/coach; delete admin-only. | — |
| Lessons | `/api/lessons` | GET, POST, PATCH/PUT, DELETE | Admin/coach see all; others see published or `isFree=true`; create/update admin/coach; delete admin-only. | Drafts enabled; custom content endpoint described below. |
| Quizzes | `/api/quizzes` | GET, POST, PATCH/PUT, DELETE | Only admin/coach can read/create/update; delete admin-only. | Learners fetch sanitized quiz via `GET /api/quizzes/:id/take`. |
| Enrollments | `/api/enrollments` | GET, POST, PATCH/PUT, DELETE | Admin/coach see all; subscribers see their own enrollments; create any authenticated user (forced to self); update admin/coach; delete admin-only. | `enrolledAt` auto-set; subscriber forced from current user. |
| Progress | `/api/progress` | GET, POST, PATCH/PUT, DELETE | Admin/coach see all; subscribers see/create/update progress tied to their enrollments; delete admin-only. | Tracks lesson progress. |
| Quiz Attempts | `/api/quiz-attempts` | GET, POST, PATCH/PUT, DELETE | Admin/coach see all; subscribers see/create/update attempts tied to their enrollments; delete admin-only. | Instructor-only scoring fields (`score`, grading) restricted to staff. |
| Coaching Sessions | `/api/coaching-sessions` | GET, POST, PATCH/PUT, DELETE | Admin sees all; coaches see their sessions; authenticated users see their own by user/email; create is public; update admin/coach; delete admin-only. | Validates coach availability, enforces 15-min gaps, and can auto-create Zoom links on confirmation. |

## Custom collection endpoints

| Path | Method | Description | Access |
| --- | --- | --- | --- |
| `/api/lessons/:id/content` | GET | Returns lesson content after enforcing enrollment: staff bypass; otherwise must be published/free or have an active enrollment in the parent course. | Authenticated |
| `/api/quizzes/:id/take` | GET | Returns a sanitized quiz (no correct answers) if published; staff bypass publish check. | Authenticated |
