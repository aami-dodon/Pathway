import type { Access, FieldAccess } from 'payload'

/**
 * Access Control Utilities for Payload CMS
 * Implements Role-Based Access Control (RBAC) across collections
 */

// =============================================================================
// Type Definitions
// =============================================================================

type User = {
    id: string | number
    email: string
    role: 'admin' | 'coach' | 'creator' | 'subscriber'
}

type AccessArgs = {
    req: { user?: User | null }
    id?: string | number
    data?: Record<string, unknown>
}

type FieldAccessArgs = AccessArgs & {
    doc?: Record<string, unknown>
    siblingData?: Record<string, unknown>
}

// =============================================================================
// Core Access Functions
// =============================================================================

/**
 * Only admin users have access
 */
export const isAdmin: Access = ({ req: { user } }) => {
    return user?.role === 'admin'
}

/**
 * Any authenticated user has access
 */
export const isAuthenticated: Access = ({ req: { user } }) => {
    return Boolean(user)
}

/**
 * Admin users or content creators (coach/creator roles)
 */
export const isAdminOrCreator: Access = ({ req: { user } }) => {
    if (!user) return false
    return ['admin', 'coach', 'creator'].includes(user.role)
}

/**
 * Admin OR the user is accessing their own record
 * Returns a query filter for non-admins to only see their own data
 */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'admin') return true
    // Return a query constraint to limit to own records
    return {
        id: { equals: user.id }
    }
}

// =============================================================================
// Document Owner Access Functions
// =============================================================================

/**
 * Admin OR the owner of a profile document (via 'user' field)
 */
export const isAdminOrOwner: Access = ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'admin') return true
    return {
        user: { equals: user.id }
    }
}

/**
 * Admin OR the uploader of media (via 'createdBy' field)
 */
export const isAdminOrUploader: Access = ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'admin') return true
    return {
        createdBy: { equals: user.id }
    }
}

/**
 * Admin OR the author of content (via 'author' field - references coach-profiles)
 * For Posts where author is a coach-profile relationship
 */
export const isAdminOrAuthor: Access = async ({ req }) => {
    const { user, payload } = req
    if (!user) return false
    if (user.role === 'admin') return true

    // Find the coach profile for this user
    try {
        const profiles = await payload.find({
            collection: 'coach-profiles',
            where: { user: { equals: user.id } },
            limit: 1,
        })
        if (profiles.docs.length > 0) {
            return {
                author: { equals: profiles.docs[0].id }
            }
        }
    } catch {
        // If lookup fails, deny access
    }
    return false
}

/**
 * Admin OR the instructor of a course (via 'instructor' field)
 */
export const isAdminOrInstructor: Access = async ({ req }) => {
    const { user, payload } = req
    if (!user) return false
    if (user.role === 'admin') return true

    // Find the coach profile for this user
    try {
        const profiles = await payload.find({
            collection: 'coach-profiles',
            where: { user: { equals: user.id } },
            limit: 1,
        })
        if (profiles.docs.length > 0) {
            return {
                instructor: { equals: profiles.docs[0].id }
            }
        }
    } catch {
        // If lookup fails, deny access
    }
    return false
}

// =============================================================================
// Enrollment/Progress Access Functions
// =============================================================================

/**
 * Admin OR the subscriber who owns the enrollment (via 'subscriber' field)
 */
export const isAdminOrEnrollee: Access = async ({ req }) => {
    const { user, payload } = req
    if (!user) return false
    if (user.role === 'admin') return true

    // Find the subscriber profile for this user
    try {
        const profiles = await payload.find({
            collection: 'subscriber-profiles',
            where: { user: { equals: user.id } },
            limit: 1,
        })
        if (profiles.docs.length > 0) {
            return {
                subscriber: { equals: profiles.docs[0].id }
            }
        }
    } catch {
        // If lookup fails, deny access
    }
    return false
}

/**
 * Admin OR owner of progress record (via enrollment -> subscriber chain)
 */
export const isAdminOrProgressOwner: Access = async ({ req }) => {
    const { user, payload } = req
    if (!user) return false
    if (user.role === 'admin') return true

    // Find subscriber profile, then find enrollments, then valid progress
    try {
        const profiles = await payload.find({
            collection: 'subscriber-profiles',
            where: { user: { equals: user.id } },
            limit: 1,
        })
        if (profiles.docs.length > 0) {
            // Get all enrollments for this subscriber
            const enrollments = await payload.find({
                collection: 'enrollments',
                where: { subscriber: { equals: profiles.docs[0].id } },
                limit: 1000,
            })
            if (enrollments.docs.length > 0) {
                return {
                    enrollment: { in: enrollments.docs.map(e => e.id) }
                }
            }
        }
    } catch {
        // If lookup fails, deny access
    }
    return false
}

// =============================================================================
// Published Content Access
// =============================================================================

/**
 * Published content is public, drafts require admin access
 * Uses 'isPublished' field
 */
export const isPublishedOrAdmin: Access = ({ req: { user } }) => {
    if (user?.role === 'admin') return true
    // For non-admins (including unauthenticated), only show published
    return {
        isPublished: { equals: true }
    }
}

// =============================================================================
// Coaching Sessions Access
// =============================================================================

/**
 * Admin OR the assigned coach OR the booker (via email match)
 */
export const isAdminOrSessionParticipant: Access = async ({ req }) => {
    const { user, payload } = req
    if (!user) return false
    if (user.role === 'admin') return true

    // Build OR conditions
    const conditions: any[] = []

    // If user is a coach, they can see sessions assigned to them
    try {
        const profiles = await payload.find({
            collection: 'coach-profiles',
            where: { user: { equals: user.id } },
            limit: 1,
        })
        if (profiles.docs.length > 0) {
            conditions.push({ coach: { equals: profiles.docs[0].id } })
        }
    } catch {
        // Ignore errors
    }

    // Users can see sessions they booked (by email)
    conditions.push({ bookerEmail: { equals: user.email } })

    if (conditions.length === 1) {
        return conditions[0]
    }
    return { or: conditions }
}

/**
 * Admin OR the assigned coach for session updates
 */
export const isAdminOrCoach: Access = async ({ req }) => {
    const { user, payload } = req
    if (!user) return false
    if (user.role === 'admin') return true

    try {
        const profiles = await payload.find({
            collection: 'coach-profiles',
            where: { user: { equals: user.id } },
            limit: 1,
        })
        if (profiles.docs.length > 0) {
            return {
                coach: { equals: profiles.docs[0].id }
            }
        }
    } catch {
        // If lookup fails, deny access
    }
    return false
}

// =============================================================================
// Field-Level Access
// =============================================================================

/**
 * Only admins can modify this field
 */
export const adminOnlyField: FieldAccess = ({ req: { user } }) => {
    return user?.role === 'admin'
}

/**
 * Field is readable by all but only editable by admins
 */
export const readonlyExceptAdmin = {
    read: () => true,
    create: adminOnlyField,
    update: adminOnlyField,
}
