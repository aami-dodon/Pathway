import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Automatically sets the 'createdBy' field to the current user on create
 * Use on collections that track who created the record
 */
export const populateCreatedBy: CollectionBeforeChangeHook = ({
    req,
    operation,
    data,
}) => {
    if (operation === 'create' && req.user) {
        return {
            ...data,
            createdBy: req.user.id,
        }
    }
    return data
}
