# Access Control Documentation

This document outlines the access control rules, field-level security, and critical business constraints for all Payload CMS collections.

## Role Hierarchy

| Role | Description | Admin Panel Access |
|------|-------------|-------------------|
| `admin` | Full system access | ✅ Yes |
| `coach` | Content creators, instructors | ✅ Yes |
| `creator` | CMS content creators | ✅ Yes |
| `subscriber` | Learners, readers | ❌ No |

## Access Control Matrix

### Legend
- **Public**: Anyone (including anonymous)
- **Auth**: Any authenticated user
- **Self**: User can only access their own records
- **Owner**: User who created/owns the record
- **Creator+**: Admin, Coach, or Creator roles
- **Coach+**: Admin or Coach roles
- **Admin**: Admin role only

### Administration

| Collection | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| **Users** | Self + Admin | Public (registration)* | Self + Admin | Admin |
| **Media** | Public | Auth | Owner + Admin | Admin |

> *Users: Public creation allowed for registration, but `role` defaults to 'subscriber'.

### User Profiles

| Collection | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| **CoachProfile** | Public | Coach+ | Owner + Admin | Admin |
| **SubscriberProfile** | Owner + Admin | Auth (self only) | Owner + Admin | Admin |

### Content Management (CMS)

| Collection | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| **Categories** | Public | Creator+ | Creator+ | Admin |
| **Tags** | Public | Creator+ | Creator+ | Admin |
| **Posts** | Published + Access Level* | Creator+ | Creator+ | Admin |
| **Pages** | Published + Admin | Creator+ | Creator+ | Admin |

> *Posts: See "Access Level Content Gating" below.

### Learning Management (LMS)

| Collection | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| **Courses** | Published + Access Level* | Coach+ | Coach+ | Admin |
| **Modules** | Published | Coach+ | Coach+ | Admin |
| **Lessons** | Published/Free | Coach+ | Coach+ | Admin |
| **Quizzes** | ⚠️ **Coach+ ONLY** | Coach+ | Coach+ | Admin |
| **Enrollments** | Own + Admin | Auth (self only) | Coach+ | Admin |
| **Progress** | Own + Coach+ | Own | Own | Admin |
| **QuizAttempts** | Own + Coach+ | Own | Own* | Admin |

> *QuizAttempts: Users can update their answers, but scoring/grading fields are staff-only.
> *Courses: See "Access Level Content Gating" below.

### Booking

| Collection | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| **CoachingSessions** | Custom* | Public (anyone) | Coach+ (own) | Admin |

> *CoachingSessions Read Access:
> - **Admins**: All sessions
> - **Coaches**: Sessions where they are the assigned coach
> - **Users**: Sessions they booked (matched by `bookedByUser` ID or `bookerEmail`)
> - **Anonymous**: None

## Access Level Content Gating

Posts and Courses support specific visibility rules based on the `accessLevel` field and publication status:

| Access Level | Status | Anonymous User | Authenticated User | Admin/Creator/Coach |
|--------------|--------|----------------|--------------------|---------------------|
| `public` | `published` | ✅ View | ✅ View | ✅ View |
| `subscribers` | `published` | ❌ Hidden | ✅ View | ✅ View |
| Any | `draft` | ❌ Hidden | ❌ Hidden | ✅ View |

## Field-Level Security

Specific fields satisfy stricter access control than their parent collection.

### Users Collection
| Field | Access Rule | Rationale |
|-------|-------------|-----------|
| `role` | **Admin Only** (Create/Update) | Prevents privilege escalation attacks. |

### CoachingSessions Collection
| Field | Access Rule | Rationale |
|-------|-------------|-----------|
| `status` | **Coach+ Only** (Update) | Prevents users from confirming/cancelling their own sessions arbitrarily. |
| `meetingLink` | **Coach+ Only** (Update) | Prevents link injection tampering. |
| `coachNotes` | **Coach+ Only** (Read/Update) | Private notes for the coach, hidden from the booker. |
| `confirmedAt` | **Coach+ Only** (Update) | System managed timestamp for confirmation. |

## Business Logic Constraints (Validation & Hooks)

These constraints act as functional access controls, preventing invalid state transitions or data integrity issues.

### Coaching Session Constraints
1.  **Duration Limit**: Sessions cannot exceed 30 minutes.
2.  **Coach Availability**:
    *   Bookings must fall within the coach's defined weekly hours (converted to coach's timezone).
    *   Checks against specific days (Mon-Sun) and time slots.
3.  **Conflict Prevention (15-min Gap)**:
    *   New bookings must not overlap existing sessions.
    *   **Mandatory Gap**: There must be at least a 15-minute buffer between any two sessions for the same coach.
    *   Check logic: `NOT (NewStart >= OldEnd + 15m OR NewEnd <= OldStart - 15m)`.
4.  **Automatic Zoom Creation**:
    *   When status changes to `confirmed`, a Zoom meeting is automatically generated via backend service.
    *   Meeting details (`joinUrl`, `meetingId`, `password`) are saved to system-managed fields.

### User Profile Protection
1.  **Ownership Enforcement**:
    *   `SubscriberProfile` and `CoachProfile` have `user` fields that are forced to the current user's ID on creation.
    *   The `user` field is immutable (cannot be changed after creation).

## Security Features

### 1. Quiz Answer Protection ⚠️
- **Critical**: The `Quizzes` collection is **not accessible to learners via API** (`Coach+` only read access).
- Correct answers (`isCorrect`, `correctAnswer`, `acceptedAnswers`) are stored in the collection.
- **Requirement**: A custom API endpoint must be used to serve quizzes to learners with answers stripped.

### 2. Enrollment Verification
- Access to `Lessons` and `Modules` content should functionally depend on an active `Enrollment`.
- While basic read access is open to authenticated users for discovery, the actual content delivery (e.g., video URL) should be gated by an enrollment check.

## Centralized Access Functions

Located in `/src/access/`:

| Function | Description |
|----------|-------------|
| `anyone` | Always allows access |
| `noOne` | Always denies access |
| `isAuthenticated` | Requires logged-in user |
| `isAdmin` | Requires admin role |
| `isAdminOrCoach` | Requires admin or coach role |
| `isAdminOrCreator` | Requires admin, coach, or creator role |
| `isAdminOrSelf` | Admin or accessing own record (by ID) |
| `isAdminOrOwner(field)` | Admin or owns record (via specified field) |
| `isPublishedOrAdmin` | Published content or admin access |
| `isPublishedOrOwner(field)` | Published or authored by current user |
| `contentAccess` | Respects `accessLevel` field + auth status |
| `courseContentAccess` | LMS content gating |

### Field-Level Access Helpers
| Function | Description |
|----------|-------------|
| `fieldIsAdmin` | Admin role only |
| `fieldIsAdminOrCoach` | Admin or coach role |
| `fieldIsAdminOrCreator` | Admin, coach, or creator |
| `fieldIsAuthenticated` | Any logged-in user |

## Hooks Inventory

Located in `/src/hooks/`:

| Hook | Description |
|------|-------------|
| `populateCreatedBy` | Sets `createdBy` to current user on create |
| `setPublishedAt` | Sets `publishedAt` when status changes to published |
| `enforceUserOwnership` | Forces profile `user` field to current user |
| `preventUserChange` | Prevents modifying `user` field after creation |
| `setEnrolledAt` | Sets enrollment timestamp |
| `setJoinedAt` | Sets subscriber profile join date |

---

*Last updated: 2025-12-26*
