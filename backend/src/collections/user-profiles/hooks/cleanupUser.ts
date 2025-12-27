import { APIError } from 'payload'
import { sql } from 'drizzle-orm'
import type { CollectionBeforeDeleteHook, CollectionAfterDeleteHook } from 'payload'

export const cleanupUserBeforeDelete: CollectionBeforeDeleteHook = async ({ id, req, collection }) => {
    const { payload } = req

    // 1. Prevent infinite loops
    if (req.context.internalCleanup) {
        console.log(`[BeforeDelete] Skipping cleanup for ${collection.slug} ${id} (Internal cleanup)`)
        return
    }

    // Fetch the doc since beforeDelete only provides id
    const doc = await payload.findByID({
        collection: collection.slug as any,
        id,
        req,
    }).catch(() => null)

    if (!doc) {
        console.log(`[BeforeDelete] Profile ${id} already gone, skipping.`)
        return
    }

    console.log(`[BeforeDelete] Starting comprehensive cleanup for ${collection.slug} profile ${id}`)

    const db = (payload.db as any).drizzle

    try {
        // --- COACH PROFILE DELETION LOGIC (Reassignment) ---
        if (collection.slug === 'coach-profiles') {
            // Check if this is the last coach
            const allCoaches = await (payload.find as any)({
                collection: 'coach-profiles',
                limit: 1,
                req,
            })

            if (allCoaches.totalDocs <= 1) {
                console.log(`[BeforeDelete] Blocked: Last coach deletion attempt.`)
                throw new APIError('You cannot delete the only coach. Please create another coach profile before deleting this one.', 400)
            }

            // Find the oldest OTHER coach profile for reassignment
            const otherCoaches = await (payload.find as any)({
                collection: 'coach-profiles',
                where: { id: { not_equals: id } },
                sort: 'createdAt',
                limit: 1,
                req,
            })

            if (otherCoaches.docs.length === 0) {
                throw new APIError('No other coach found for content reassignment.', 500)
            }

            const targetCoachId = otherCoaches.docs[0].id
            console.log(`[BeforeDelete] Dynamic SQL Reassignment: Moving ALL references from coach ${id} to coach ${targetCoachId}`)

            const discoveryQuery = sql`
                SELECT kcu.table_name, kcu.column_name
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'coach_profiles';
            `
            const refs = await db.execute(discoveryQuery)

            for (const row of (refs.rows || [])) {
                const tableName = row.table_name as string
                const columnName = row.column_name as string
                if (tableName.startsWith('coach_profiles_')) continue

                try {
                    console.log(`[BeforeDelete] Reassigning ${tableName}.${columnName} from ${id} to ${targetCoachId}`)

                    // IF it's a relationship table (_rels), we must check for duplicates first to avoid Unique Constraint errors
                    if (tableName.endsWith('_rels')) {
                        // Delete any existing entries for the target coach that would conflict with the reassignment
                        // Path and parent_id must match.
                        await db.execute(sql`
                            DELETE FROM ${sql.identifier(tableName)} 
                            WHERE ${sql.identifier(columnName)} = ${targetCoachId}
                            AND parent_id IN (
                                SELECT parent_id FROM ${sql.identifier(tableName)} WHERE ${sql.identifier(columnName)} = ${id}
                            )
                        `)
                    }

                    // Now safely update
                    await db.execute(sql`
                        UPDATE ${sql.identifier(tableName)} 
                        SET ${sql.identifier(columnName)} = ${targetCoachId} 
                        WHERE ${sql.identifier(columnName)} = ${id}
                    `)
                } catch (e: any) {
                    // Log the full error to help debug if it still fails
                    console.error(`[BeforeDelete] Error reassigning ${tableName}.${columnName}:`, e)
                }
            }
        }

        // --- SUBSCRIBER PROFILE DELETION LOGIC (Cascade Cleanup) ---
        if (collection.slug === 'subscriber-profiles') {
            console.log(`[BeforeDelete] Dynamic SQL Cleanup: Cleaning training data for subscriber ${id}`)

            const subRefQuery = sql`
                SELECT kcu.table_name, kcu.column_name
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'subscriber_profiles';
            `
            const subRefs = await db.execute(subRefQuery)

            for (const row of (subRefs.rows || [])) {
                const tableName = row.table_name as string
                const columnName = row.column_name as string

                try {
                    // Special Case: Enrollments has children (Progress, QuizAttempts)
                    if (tableName === 'enrollments') {
                        const enrollmentIdsResult = await db.execute(sql`SELECT id FROM "enrollments" WHERE ${sql.identifier(columnName)} = ${id}`)
                        const eIds = (enrollmentIdsResult.rows || []).map((r: any) => r.id)

                        if (eIds.length > 0) {
                            console.log(`[BeforeDelete] Cascading cleanup for ${eIds.length} enrollments`)

                            // Delete children using placeholders
                            await db.execute(sql`DELETE FROM "progress" WHERE "enrollment_id" = ANY(${eIds})`)
                            await db.execute(sql`DELETE FROM "quiz_attempts" WHERE "enrollment_id" = ANY(${eIds})`)
                            await db.execute(sql`DELETE FROM "payload_locked_documents_rels" WHERE "enrollments_id" = ANY(${eIds})`)
                        }
                    }

                    // Standard Delete for the reference
                    console.log(`[BeforeDelete] Deleting references in ${tableName}.${columnName}`)
                    await db.execute(sql`DELETE FROM ${sql.identifier(tableName)} WHERE ${sql.identifier(columnName)} = ${id}`)

                } catch (e: any) {
                    console.error(`[BeforeDelete] Warning: Cleanup failed for ${tableName}:`, e.message)
                }
            }

            // Explicit cleanup for coaching-sessions tied to USER ID (not profile ID)
            const userId = typeof doc.user === 'object' ? doc.user.id : doc.user
            if (userId) {
                console.log(`[BeforeDelete] Cleaning sessions for user ${userId}`)
                await db.execute(sql`DELETE FROM "coaching_sessions" WHERE "booked_by_user_id" = ${userId}`)
            }
        }
    } catch (error: any) {
        console.error(`[BeforeDelete] Critical cleanup error for profile ${id}:`, error)
        if (error instanceof APIError) throw error
        throw new APIError(`Account cleanup failed: ${error.message || 'Unknown error'}`, 500)
    }
}

export const cleanupUserAfterDelete: CollectionAfterDeleteHook = async ({ id, doc, req, collection }) => {
    const { payload } = req

    // 1. Prevent infinite loops
    if (req.context.internalCleanup) {
        return
    }

    const userId = typeof doc.user === 'object' ? doc.user.id : doc.user

    if (userId) {
        try {
            console.log(`[AfterDelete] ${collection.slug} ${id} triggering user deletion for ${userId}`)

            // Set context to prevent infinite loops before initiating cascade
            req.context.internalCleanup = true

            const userExists = await (payload.findByID as any)({
                collection: 'users',
                id: userId,
                req,
            }).catch(() => null)

            if (userExists) {
                console.log(`[AfterDelete] Deleting associated user ${userId}`)
                await (payload.delete as any)({
                    collection: 'users',
                    id: userId,
                    req,
                })
            }
        } catch (error: any) {
            console.error(`[AfterDelete] Failed to delete user ${userId} after profile deletion:`, error.message)
        }
    }
}
