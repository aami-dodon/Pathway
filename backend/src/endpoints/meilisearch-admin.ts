import { Endpoint } from 'payload'
import { MeiliSearch } from 'meilisearch'
import { INDEXES } from '../services/meilisearch'

// Helper to get Meilisearch client
const getClient = () => {
    if (!process.env.MEILISEARCH_HOST || !process.env.MEILISEARCH_API_KEY) {
        return null
    }
    return new MeiliSearch({
        host: process.env.MEILISEARCH_HOST,
        apiKey: process.env.MEILISEARCH_API_KEY,
    })
}

// Check if user is admin
const isAdmin = (req: any): boolean => {
    return req.user?.role === 'admin'
}

// GET /api/admin/meilisearch/status
export const meilisearchStatusEndpoint: Endpoint = {
    path: '/admin/meilisearch/status',
    method: 'get',
    handler: async (req) => {
        if (!isAdmin(req)) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const client = getClient()
        if (!client) {
            return Response.json({
                connected: false,
                error: 'Meilisearch not configured',
            })
        }

        try {
            const health = await client.health()
            const stats = await client.getStats()

            // Get individual index stats
            const indexStats: Record<string, any> = {}
            for (const indexName of Object.values(INDEXES)) {
                try {
                    const index = client.index(indexName)
                    const indexInfo = await index.getStats()
                    indexStats[indexName] = {
                        numberOfDocuments: indexInfo.numberOfDocuments,
                        isIndexing: indexInfo.isIndexing,
                    }
                } catch (e) {
                    indexStats[indexName] = { error: 'Index not found' }
                }
            }

            return Response.json({
                connected: true,
                status: health.status,
                databaseSize: stats.databaseSize,
                lastUpdate: stats.lastUpdate,
                indexes: indexStats,
            })
        } catch (error: any) {
            return Response.json({
                connected: false,
                error: error.message,
            })
        }
    },
}

// POST /api/admin/meilisearch/reindex
export const meilisearchReindexEndpoint: Endpoint = {
    path: '/admin/meilisearch/reindex',
    method: 'post',
    handler: async (req) => {
        if (!isAdmin(req)) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const client = getClient()
        if (!client) {
            return Response.json({ error: 'Meilisearch not configured' }, { status: 500 })
        }

        try {
            const payload = req.payload

            // Get index to reindex from body (optional)
            let indexToReindex: string | null = null
            try {
                const body = await req.json?.()
                indexToReindex = body?.index || null
            } catch {
                // No body, reindex all
            }

            const results: Record<string, any> = {}

            // Reindex Posts
            if (!indexToReindex || indexToReindex === INDEXES.POSTS) {
                const posts = await payload.find({
                    collection: 'posts',
                    depth: 2,
                    limit: 10000,
                })

                const postDocs = posts.docs.map((post: any) => ({
                    id: String(post.id),
                    title: post.title,
                    slug: post.slug || '',
                    excerpt: post.excerpt || '',
                    categoryName: typeof post.category === 'object' ? post.category?.name : undefined,
                    categoryId:
                        typeof post.category === 'object'
                            ? String(post.category?.id)
                            : post.category
                                ? String(post.category)
                                : undefined,
                    authorName:
                        typeof post.author === 'object'
                            ? post.author?.displayName || post.author?.email
                            : undefined,
                    tags: Array.isArray(post.tags)
                        ? post.tags.map((t: any) => (typeof t === 'object' ? t.name : t)).filter(Boolean)
                        : [],
                    isPublished: post.isPublished || false,
                    publishedDate: post.publishedAt || undefined,
                    thumbnailUrl: typeof post.featuredImage === 'object' ? post.featuredImage?.url : undefined,
                }))

                const postsIndex = client.index(INDEXES.POSTS)
                await postsIndex.deleteAllDocuments()
                if (postDocs.length > 0) {
                    await postsIndex.addDocuments(postDocs)
                }
                results.posts = { indexed: postDocs.length }
            }

            // Reindex Courses
            if (!indexToReindex || indexToReindex === INDEXES.COURSES) {
                const courses = await payload.find({
                    collection: 'courses',
                    depth: 2,
                    limit: 10000,
                })

                const courseDocs = courses.docs.map((course: any) => ({
                    id: String(course.id),
                    title: course.title,
                    slug: course.slug || '',
                    description: course.shortDescription || '',
                    categoryName: typeof course.category === 'object' ? course.category?.name : undefined,
                    categoryId:
                        typeof course.category === 'object'
                            ? String(course.category?.id)
                            : course.category
                                ? String(course.category)
                                : undefined,
                    difficulty: course.difficulty || undefined,
                    instructorName:
                        typeof course.instructor === 'object' ? course.instructor?.displayName : undefined,
                    isPublished: course.isPublished || false,
                    thumbnailUrl: typeof course.thumbnail === 'object' ? course.thumbnail?.url : undefined,
                }))

                const coursesIndex = client.index(INDEXES.COURSES)
                await coursesIndex.deleteAllDocuments()
                if (courseDocs.length > 0) {
                    await coursesIndex.addDocuments(courseDocs)
                }
                results.courses = { indexed: courseDocs.length }
            }

            // Reindex Coaches
            if (!indexToReindex || indexToReindex === INDEXES.COACHES) {
                const coaches = await payload.find({
                    collection: 'coach-profiles',
                    depth: 1,
                    limit: 10000,
                })

                const coachDocs = coaches.docs.map((coach: any) => ({
                    id: String(coach.id),
                    displayName: coach.displayName,
                    slug: coach.slug || '',
                    bio: coach.bio || '',
                    expertise: Array.isArray(coach.expertise)
                        ? coach.expertise.map((e: any) => e.area).filter(Boolean)
                        : [],
                    yearsOfExperience: coach.experience?.yearsOfExperience || undefined,
                    isActive: coach.isActive || false,
                    profilePhotoUrl: typeof coach.profilePhoto === 'object' ? coach.profilePhoto?.url : undefined,
                }))

                const coachesIndex = client.index(INDEXES.COACHES)
                await coachesIndex.deleteAllDocuments()
                if (coachDocs.length > 0) {
                    await coachesIndex.addDocuments(coachDocs)
                }
                results.coaches = { indexed: coachDocs.length }
            }

            // Reindex Pages
            if (!indexToReindex || indexToReindex === INDEXES.PAGES) {
                const pages = await payload.find({
                    collection: 'pages',
                    depth: 1,
                    limit: 10000,
                })

                const pageDocs = pages.docs.map((page: any) => ({
                    id: String(page.id),
                    title: page.title,
                    slug: page.slug || '',
                    authorName: typeof page.author === 'object' ? page.author?.displayName || page.author?.email : undefined,
                    isPublished: page.isPublished || false,
                    publishedDate: page.publishedAt || undefined,
                }))

                const pagesIndex = client.index(INDEXES.PAGES)
                await pagesIndex.deleteAllDocuments()
                if (pageDocs.length > 0) {
                    await pagesIndex.addDocuments(pageDocs)
                }
                results.pages = { indexed: pageDocs.length }
            }

            return Response.json({
                success: true,
                message: 'Reindex completed',
                results,
            })
        } catch (error: any) {
            return Response.json({ error: error.message }, { status: 500 })
        }
    },
}

// DELETE /api/admin/meilisearch/clear
export const meilisearchClearEndpoint: Endpoint = {
    path: '/admin/meilisearch/clear',
    method: 'delete',
    handler: async (req) => {
        if (!isAdmin(req)) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const client = getClient()
        if (!client) {
            return Response.json({ error: 'Meilisearch not configured' }, { status: 500 })
        }

        try {
            let indexToClear: string | null = null
            try {
                const url = new URL(req.url || '', 'http://localhost')
                indexToClear = url.searchParams.get('index')
            } catch {
                // No index specified
            }

            const results: Record<string, any> = {}

            if (!indexToClear) {
                // Clear all indexes
                for (const indexName of Object.values(INDEXES)) {
                    try {
                        const index = client.index(indexName)
                        await index.deleteAllDocuments()
                        results[indexName] = { cleared: true }
                    } catch (e: any) {
                        results[indexName] = { error: e.message }
                    }
                }
            } else {
                // Clear specific index
                if (!Object.values(INDEXES).includes(indexToClear as any)) {
                    return Response.json({ error: 'Invalid index name' }, { status: 400 })
                }
                const index = client.index(indexToClear)
                await index.deleteAllDocuments()
                results[indexToClear] = { cleared: true }
            }

            return Response.json({
                success: true,
                message: 'Index(es) cleared',
                results,
            })
        } catch (error: any) {
            return Response.json({ error: error.message }, { status: 500 })
        }
    },
}

// Export all admin endpoints
export const meilisearchAdminEndpoints: Endpoint[] = [
    meilisearchStatusEndpoint,
    meilisearchReindexEndpoint,
    meilisearchClearEndpoint,
]
