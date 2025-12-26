import type { Access } from 'payload'

/**
 * Checks if the user has admin role
 * Use for: Admin-only operations like delete, managing users
 */
export const isAdmin: Access = ({ req: { user } }) => {
    return user?.role === 'admin'
}
