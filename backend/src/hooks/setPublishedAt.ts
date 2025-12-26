import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Automatically sets publishedAt timestamp when status changes to 'published'
 * Only sets it once (doesn't update on re-publish)
 */
export const setPublishedAt: CollectionBeforeChangeHook = ({
    data,
    originalDoc,
}) => {
    // If changing to published and not already published before
    if (data.status === 'published' && !originalDoc?.publishedAt) {
        return {
            ...data,
            publishedAt: new Date().toISOString(),
        }
    }
    return data
}
