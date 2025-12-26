import type { Access } from 'payload'

/**
 * Checks if the user has admin or coach role
 * Use for: Creating/managing content, courses, etc.
 */
export const isAdminOrCoach: Access = ({ req: { user } }) => {
    if (!user) return false
    return ['admin', 'coach'].includes(user.role as string)
}
