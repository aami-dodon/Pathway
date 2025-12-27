import { APIError } from 'payload'
import type { CollectionBeforeLoginHook } from 'payload'

export const checkUserStatus: CollectionBeforeLoginHook = async ({ user }) => {
    if (user && user.isActive === false) {
        throw new APIError('Your account is currently locked. Please contact support.', 401)
    }
    return user
}
