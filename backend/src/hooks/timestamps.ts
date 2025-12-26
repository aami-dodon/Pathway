import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Sets enrolledAt timestamp on creation if not provided
 */
export const setEnrolledAt: CollectionBeforeChangeHook = ({
    operation,
    data,
}) => {
    if (operation === 'create' && !data.enrolledAt) {
        return {
            ...data,
            enrolledAt: new Date().toISOString(),
        }
    }
    return data
}

/**
 * Sets metadata.joinedAt for subscriber profiles on creation
 */
export const setJoinedAt: CollectionBeforeChangeHook = ({
    operation,
    data,
}) => {
    if (operation === 'create') {
        return {
            ...data,
            metadata: {
                ...data.metadata,
                joinedAt: new Date().toISOString(),
            },
        }
    }
    return data
}
