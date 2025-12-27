import type { CollectionAfterDeleteHook } from 'payload'

export const cleanupProfiles: CollectionAfterDeleteHook = async ({ id: userId, req }) => {
    const { payload } = req

    if (req.context.internalCleanup) {
        console.log(`[cleanupProfiles] Skipping cleanup for User ${userId} (Already processed)`)
        return
    }

    try {
        // Set context to signify this is a cascade from User deletion
        req.context.internalCleanup = true

        // Find and delete any associated subscriber profiles
        const subscriberProfiles = await (payload.find as any)({
            collection: 'subscriber-profiles',
            where: { user: { equals: userId } },
            req,
        })

        for (const profile of subscriberProfiles.docs) {
            await (payload.delete as any)({
                collection: 'subscriber-profiles',
                id: profile.id,
                req,
            })
        }

        // Find and delete any associated coach profiles
        const coachProfiles = await (payload.find as any)({
            collection: 'coach-profiles',
            where: { user: { equals: userId } },
            req,
        })

        for (const profile of coachProfiles.docs) {
            await (payload.delete as any)({
                collection: 'coach-profiles',
                id: profile.id,
                req,
            })
        }
    } catch (error) {
        console.error(`Failed to cleanup profiles for user ${userId}:`, error)
        // We don't throw here to avoid blocking the main user deletion, 
        // but we log the error for diagnostics.
    }
}
