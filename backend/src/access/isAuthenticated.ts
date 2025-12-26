import type { Access } from 'payload'

/**
 * Checks if the user is authenticated (logged in)
 * Use for: Any action requiring a logged-in user
 */
export const isAuthenticated: Access = ({ req: { user } }) => {
    return Boolean(user)
}
