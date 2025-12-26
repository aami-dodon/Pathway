import type { Access } from 'payload'

/**
 * Checks if the user has admin, coach, or creator role
 * Use for: CMS content creation (posts, pages)
 */
export const isAdminOrCreator: Access = ({ req: { user } }) => {
    if (!user) return false
    return ['admin', 'coach', 'creator'].includes(user.role as string)
}
