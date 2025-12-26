import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Ensures a profile's 'user' field can only be set to the current user on create
 * Prevents users from creating profiles for other users
 */
export const enforceUserOwnership: CollectionBeforeChangeHook = ({
    req,
    operation,
    data,
}) => {
    if (operation === 'create' && req.user) {
        // Force the user field to be the current user (unless admin)
        if (req.user.role !== 'admin') {
            return {
                ...data,
                user: req.user.id,
            }
        }
    }
    return data
}

/**
 * Prevents changing the 'user' field after creation (for profiles)
 * The one-to-one relationship should be immutable
 */
export const preventUserChange: CollectionBeforeChangeHook = ({
    operation,
    data,
    originalDoc,
}) => {
    if (operation === 'update' && originalDoc?.user) {
        // Preserve the original user field, ignore any attempt to change it
        return {
            ...data,
            user: originalDoc.user,
        }
    }
    return data
}
