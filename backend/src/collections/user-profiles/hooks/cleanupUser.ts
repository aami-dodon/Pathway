import { APIError } from 'payload'
import { sql } from 'drizzle-orm'
import type { CollectionBeforeDeleteHook, CollectionAfterDeleteHook } from 'payload'

export const cleanupUserBeforeDelete: CollectionBeforeDeleteHook = async ({ id, req, collection }) => {
    const { payload } = req

    // Support bulk deletes and prevent infinite loops
    if (req.context[`cleanup_${collection.slug}_${id}`]) {
        console.log(`[BeforeDelete] Skipping cleanup for ${collection.slug} ${id} (Already in process)`)
        return
    }

    // Mark as in-process
    req.context[`cleanup_${collection.slug}_${id}`] = true

    const doc = await payload.findByID({
        collection: collection.slug as any,
        id,
        req,
    }).catch(() => null)

    if (!doc) return

    console.log(`[BeforeDelete] Starting comprehensive cleanup for ${collection.slug} profile ${id}`)
    const db = (payload.db as any).drizzle

    try {
        // --- COACH PROFILE DELETION LOGIC ---
        if (collection.slug === 'coach-profiles') {
            const allCoaches = await (payload.find as any)({
                collection: 'coach-profiles',
                limit: 1,
                req,
            })

            if (allCoaches.totalDocs <= 1) {
                throw new APIError('You cannot delete the only coach. Please create another coach profile before deleting this one.', 400)
            }

            const otherCoaches = await (payload.find as any)({
                collection: 'coach-profiles',
                where: { id: { not_equals: id } },
                sort: 'createdAt',
                limit: 1,
                req,
            })

            const targetCoachId = otherCoaches.docs[0].id
            console.log(`[BeforeDelete] Reassigning all references from coach ${id} to coach ${targetCoachId}`)

            const discoveryQuery = sql`
                SELECT kcu.table_name, kcu.column_name
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'coach_profiles';`
            const refs = await db.execute(discoveryQuery)

            for (const row of (refs.rows || [])) {
                const tableName = row.table_name as string
                const columnName = row.column_name as string
                if (tableName.startsWith('coach_profiles_')) continue

                // Avoid unique constraint conflicts in relationship tables
                if (tableName.endsWith('_rels')) {
                    await db.execute(sql`
                        DELETE FROM ${sql.identifier(tableName)} 
                        WHERE ${sql.identifier(columnName)} = ${targetCoachId}
                        AND parent_id IN (
                            SELECT parent_id FROM ${sql.identifier(tableName)} WHERE ${sql.identifier(columnName)} = ${id}
                        )`)
                }
                await db.execute(sql`
                    UPDATE ${sql.identifier(tableName)} 
                    SET ${sql.identifier(columnName)} = ${targetCoachId} 
                    WHERE ${sql.identifier(columnName)} = ${id}`)
            }
        }

        // --- SUBSCRIBER PROFILE DELETION LOGIC ---
        if (collection.slug === 'subscriber-profiles') {
            // Find all enrollments first
            const enrollmentIdsResult = await db.execute(sql`SELECT id FROM "enrollments" WHERE "subscriber_id" = ${id}`)
            const eIds = (enrollmentIdsResult.rows || []).map((r: any) => r.id)

            if (eIds.length > 0) {
                console.log(`[BeforeDelete] Cascading cleanup for ${eIds.length} enrollments`)

                // 1. Clean up Locked Documents referring to Progress or QuizAttempts of these enrollments
                // We need to find the IDs of progress and quiz attempts first
                const progressIdsResult = await db.execute(sql`SELECT id FROM "progress" WHERE "enrollment_id" IN ${eIds}`)
                const pIds = (progressIdsResult.rows || []).map((r: any) => r.id)

                const quizAttemptIdsResult = await db.execute(sql`SELECT id FROM "quiz_attempts" WHERE "enrollment_id" IN ${eIds}`)
                const qIds = (quizAttemptIdsResult.rows || []).map((r: any) => r.id)

                if (pIds.length > 0) {
                    await db.execute(sql`DELETE FROM "payload_locked_documents_rels" WHERE "progress_id" IN ${pIds}`)
                    await db.execute(sql`DELETE FROM "progress" WHERE "id" IN ${pIds}`)
                }

                if (qIds.length > 0) {
                    await db.execute(sql`DELETE FROM "payload_locked_documents_rels" WHERE "quiz_attempts_id" IN ${qIds}`)
                    await db.execute(sql`DELETE FROM "quiz_attempts" WHERE "id" IN ${qIds}`)
                }

                // 2. Clean up Locked Documents referring to Enrollments themselves
                await db.execute(sql`DELETE FROM "payload_locked_documents_rels" WHERE "enrollments_id" IN ${eIds}`)

                // 3. Finally delete the enrollments
                await db.execute(sql`DELETE FROM "enrollments" WHERE "id" IN ${eIds}`)
            }

            // Clean up other references (interests, etc.)
            const subRefQuery = sql`
                SELECT kcu.table_name, kcu.column_name
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'subscriber_profiles';`
            const subRefs = await db.execute(subRefQuery)

            for (const row of (subRefs.rows || [])) {
                const tableName = row.table_name as string
                const columnName = row.column_name as string
                // Skip enrollments as we handled them with deep cascade above
                if (tableName === 'enrollments') continue

                // Delete locked documents for specific tables if they exist
                if (tableName === 'subscriber_profiles') {
                    await db.execute(sql`DELETE FROM "payload_locked_documents_rels" WHERE "subscriber_profiles_id" = ${id}`)
                }

                await db.execute(sql`DELETE FROM ${sql.identifier(tableName)} WHERE ${sql.identifier(columnName)} = ${id}`)
            }

            // Cleanup sessions tied to User ID
            const userId = typeof doc.user === 'object' ? doc.user.id : doc.user
            if (userId) {
                await db.execute(sql`DELETE FROM "payload_locked_documents_rels" WHERE "coaching_sessions_id" IN (SELECT id FROM "coaching_sessions" WHERE "booked_by_user_id" = ${userId})`)
                await db.execute(sql`DELETE FROM "coaching_sessions" WHERE "booked_by_user_id" = ${userId}`)
            }
        }
    } catch (error: any) {
        // We've removed inner try-catches so first error bubbles here and aborts transaction correctly
        console.error(`[BeforeDelete] CRITICAL ERROR during ${collection.slug} cleanup:`, error)
        throw error
    }
}

export const cleanupUserAfterDelete: CollectionAfterDeleteHook = async ({ id, doc, req, collection }) => {
    const { payload } = req
    const userId = typeof doc.user === 'object' ? doc.user.id : doc.user

    if (userId) {
        if (req.context[`cleanup_users_${userId}`]) return

        try {
            console.log(`[AfterDelete] Deleting associated user ${userId}`)
            // Prevent looping
            req.context[`cleanup_users_${userId}`] = true

            const userExists = await (payload.findByID as any)({
                collection: 'users',
                id: userId,
                req,
            }).catch(() => null)

            if (userExists) {
                await (payload.delete as any)({
                    collection: 'users',
                    id: userId,
                    req,
                })
            }
        } catch (error: any) {
            console.error(`[AfterDelete] Failed to delete user ${userId}:`, error.message)
        }
    }
}
