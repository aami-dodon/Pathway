import type { Access } from 'payload'

/**
 * Checks if user is admin or accessing their own record
 * Use for: User profile operations, self-management
 * Note: This returns a query constraint for non-admins
 */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
    if (!user) return false

    // Admins can access all
    if (user.role === 'admin') return true

    // Others can only access their own record
    return {
        id: { equals: user.id },
    }
}

/**
 * Factory function to check ownership via a specific field
 * @param userField - The field name containing the user reference (default: 'user')
 */
export const isAdminOrOwner = (userField = 'user'): Access => {
    return ({ req: { user } }) => {
        if (!user) return false

        // Admins can access all
        if (user.role === 'admin') return true

        // Others can only access records where they are the owner
        return {
            [userField]: { equals: user.id },
        }
    }
}
