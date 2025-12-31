import type { CollectionAfterChangeHook } from 'payload'
import { EmailService } from '../../../services/emailService'

export const manageProfiles: CollectionAfterChangeHook = async ({
    doc,
    req,
    operation,
}) => {
    const { payload } = req
    // Only handle create and update operations
    if (operation !== 'create' && operation !== 'update') {
        return doc
    }

    const { id: userId, role, email } = doc

    // 1. Send Welcome Email on Creation
    if (operation === 'create') {
        await EmailService.send(payload, {
            to: email,
            templateSlug: 'welcome-email',
            data: {
                email,
                role,
            },
        })
    }

    // derive default displayName from email
    const displayName = email ? email.split('@')[0] : 'User'

    if (role === 'subscriber') {
        const coachProfiles = await (payload.find as any)({
            collection: 'coach-profiles',
            where: { user: { equals: userId } },
            req,
        })

        if (coachProfiles.totalDocs > 0) {
            const coachDoc = coachProfiles.docs[0]
            await (payload.create as any)({
                collection: 'subscriber-profiles',
                data: {
                    user: userId,
                    displayName: coachDoc.displayName || displayName,
                    avatar: coachDoc.profilePhoto || null,
                    metadata: {
                        timezone: coachDoc.timezone || null,
                    },
                },
                req,
            })
            await (payload.delete as any)({
                collection: 'coach-profiles',
                id: coachDoc.id,
                req,
            })
        } else {
            const existing = await (payload.find as any)({
                collection: 'subscriber-profiles',
                where: { user: { equals: userId } },
                req,
            })
            if (existing.totalDocs === 0) {
                await (payload.create as any)({
                    collection: 'subscriber-profiles',
                    data: { user: userId, displayName },
                    req,
                })
            }
        }
    } else if (role === 'coach') {
        const subscriberProfiles = await (payload.find as any)({
            collection: 'subscriber-profiles',
            where: { user: { equals: userId } },
            req,
        })

        if (subscriberProfiles.totalDocs > 0) {
            const subDoc = subscriberProfiles.docs[0]
            await (payload.create as any)({
                collection: 'coach-profiles',
                data: {
                    user: userId,
                    displayName: subDoc.displayName || displayName,
                    profilePhoto: subDoc.avatar || null,
                    timezone: subDoc.metadata?.timezone || null,
                },
                req,
            })
            await (payload.delete as any)({
                collection: 'subscriber-profiles',
                id: subDoc.id,
                req,
            })
        } else {
            const existing = await (payload.find as any)({
                collection: 'coach-profiles',
                where: { user: { equals: userId } },
                req,
            })
            if (existing.totalDocs === 0) {
                await (payload.create as any)({
                    collection: 'coach-profiles',
                    data: { user: userId, displayName },
                    req,
                })
            }
        }
    }

    return doc
}
