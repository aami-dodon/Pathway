import type { Access } from 'payload'

/**
 * Checks if user is a subscriber (or higher role)
 * Use for: Subscriber-only content access
 */
export const isSubscriber: Access = ({ req: { user } }) => {
    if (!user) return false
    // All authenticated users are at least subscribers
    return true
}

/**
 * Content access based on accessLevel field
 * Returns: public content for all, subscribers-only for authenticated users
 */
export const contentAccess: Access = ({ req: { user } }) => {
    // If user is admin/coach/creator, they can see all
    if (user && ['admin', 'coach', 'creator'].includes(user.role as string)) {
        return true
    }

    // If user is authenticated (subscriber), they can see public + subscriber content
    if (user) {
        return {
            or: [
                { accessLevel: { equals: 'public' } },
                { accessLevel: { equals: 'subscribers' } },
            ],
        }
    }

    // Anonymous users only see public content
    return {
        accessLevel: { equals: 'public' },
    }
}

/**
 * Course access based on accessLevel and enrollment
 * Note: This is a simplified version. Full enrollment checking 
 * would require a hook or more complex query.
 */
export const courseContentAccess: Access = ({ req: { user } }) => {
    // Admins and coaches can see all
    if (user && ['admin', 'coach'].includes(user.role as string)) {
        return true
    }

    // For now, return based on accessLevel
    // Full enrollment validation should be done in API layer
    if (user) {
        return {
            or: [
                { accessLevel: { equals: 'public' } },
                { accessLevel: { equals: 'subscribers' } },
            ],
        }
    }

    return {
        accessLevel: { equals: 'public' },
    }
}
