# Access Control Documentation

This document outlines the access control rules for all Payload CMS collections.

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
| **Users** | Self + Admin | Public (registration) | Self + Admin | Admin |
| **Media** | Public | Auth | Owner + Admin | Admin |

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
| **Posts** | Published + Access Level | Creator+ | Creator+ | Admin |
| **Pages** | Published + Admin | Creator+ | Creator+ | Admin |

### Learning Management (LMS)

| Collection | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| **Courses** | Published + Access Level | Coach+ | Coach+ | Admin |
| **Modules** | Published | Coach+ | Coach+ | Admin |
| **Lessons** | Published/Free | Coach+ | Coach+ | Admin |
| **Quizzes** | ⚠️ **Coach+ ONLY** | Coach+ | Coach+ | Admin |
| **Enrollments** | Own + Admin | Auth (self only) | Coach+ | Admin |
| **Progress** | Own + Coach+ | Own | Own | Admin |
| **QuizAttempts** | Own + Coach+ | Own | Own* | Admin |

> *QuizAttempts: Users can update their answers, but scoring/grading fields are staff-only.

### Booking

| Collection | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| **CoachingSessions** | Own + Coach (their sessions) + Admin | Public (anyone) | Coach+ | Admin |

> *CoachingSessions: Anyone can book a 1:1 session. Bookers see their own sessions, coaches see sessions booked with them.

## Access Level Content Gating

Posts and Courses support two access levels:

| Access Level | Anonymous | Authenticated |
|--------------|-----------|---------------|
| `public` | ✅ Can view | ✅ Can view |
| `subscribers` | ❌ Cannot view | ✅ Can view |

## Security Features

### 1. Profile Ownership Protection
- Users can only create profiles for themselves (enforced via hooks)
- The `user` field cannot be changed after creation
- Prevents profile hijacking attacks

### 2. Quiz Answer Protection ⚠️
- **Critical**: The Quizzes collection is **not accessible to learners via API**
- Correct answers (`isCorrect`, `correctAnswer`, `acceptedAnswers`) are stored in the collection
- A custom API endpoint must be created to serve quizzes with answers stripped

### 3. Self-Enrollment Protection
- Users can only enroll themselves, not others
- The `subscriber` field is forced to the current user's profile

### 4. Progress & Score Protection
- Users can only access progress for their own enrollments
- Grading fields have field-level access control:
  - `score`, `passed`, `pointsAwarded`, `feedback` → Staff only
  - `answers` (submitted) → User can update while in-progress

### 5. Ownership Tracking
- Media tracks `createdBy` for ownership-based updates
- Profiles link to `user` for ownership verification

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

### Field-Level Access Functions

**Important**: Payload CMS requires different types for collection-level vs field-level access.
Use these `field*` prefixed functions for `field.access` properties:

| Function | Description |
|----------|-------------|
| `fieldIsAdmin` | Admin role only (for field-level) |
| `fieldIsAdminOrCoach` | Admin or coach role (for field-level) |
| `fieldIsAdminOrCreator` | Admin, coach, or creator (for field-level) |
| `fieldIsAuthenticated` | Any logged-in user (for field-level) |

## Hooks

Located in `/src/hooks/`:

| Hook | Description |
|------|-------------|
| `populateCreatedBy` | Sets `createdBy` to current user on create |
| `setPublishedAt` | Sets `publishedAt` when status changes to published |
| `enforceUserOwnership` | Forces profile `user` field to current user |
| `preventUserChange` | Prevents modifying `user` field after creation |
| `setEnrolledAt` | Sets enrollment timestamp |
| `setJoinedAt` | Sets subscriber profile join date |

## Reusable Fields

Located in `/src/fields/`:

| Field | Description |
|-------|-------------|
| `slugField` | Standard unique, indexed slug |
| `seoFields` | SEO group (metaTitle, metaDescription, ogImage) |
| `publishStatusField` | Draft/Published/Archived status |
| `publishedAtField` | Publication timestamp |
| `accessLevelField` | Public/Subscribers access selector |

## TODO: Required API Endpoints

### Quiz Delivery Endpoint
Since quizzes are staff-only readable, create an endpoint that:
1. Fetches the quiz by ID
2. Strips sensitive answer data (`isCorrect`, `correctAnswer`, `acceptedAnswers`)
3. Returns sanitized quiz for learner consumption

```typescript
// Example: GET /api/quizzes/:id/take
// Returns quiz without correct answers for learners
```

### Enrollment Verification
For full LMS security, lesson/module access should verify:
1. User has an active enrollment in the parent course
2. The lesson/module is published
3. Any prerequisites are completed

---

*Last updated: 2025-12-26*
