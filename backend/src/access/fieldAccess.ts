import type { FieldAccess } from 'payload'

/**
 * Field-level access: Only admins can access this field
 */
export const fieldIsAdmin: FieldAccess = ({ req: { user } }) => {
    return user?.role === 'admin'
}

/**
 * Field-level access: Only admin or coach can access this field
 */
export const fieldIsAdminOrCoach: FieldAccess = ({ req: { user } }) => {
    if (!user) return false
    return ['admin', 'coach'].includes(user.role as string)
}

/**
 * Field-level access: Only admin, coach, or creator can access this field
 */
export const fieldIsAdminOrCreator: FieldAccess = ({ req: { user } }) => {
    if (!user) return false
    return ['admin', 'coach', 'creator'].includes(user.role as string)
}

/**
 * Field-level access: Any authenticated user
 */
export const fieldIsAuthenticated: FieldAccess = ({ req: { user } }) => {
    return Boolean(user)
}
