import { MeiliSearch, Index, RecordAny } from 'meilisearch'

// Meilisearch client singleton
let client: MeiliSearch | null = null

export function getMeilisearchClient(): MeiliSearch | null {
    if (!process.env.MEILISEARCH_HOST || !process.env.MEILISEARCH_API_KEY) {
        console.warn('Meilisearch not configured: missing MEILISEARCH_HOST or MEILISEARCH_API_KEY')
        return null
    }

    if (!client) {
        client = new MeiliSearch({
            host: process.env.MEILISEARCH_HOST,
            apiKey: process.env.MEILISEARCH_API_KEY,
        })
    }

    return client
}

// Index names
export const INDEXES = {
    POSTS: 'posts',
    COURSES: 'courses',
    COACHES: 'coaches',
    PAGES: 'pages',
} as const

// Document types for indexing
export interface PostDocument {
    id: string
    title: string
    slug: string
    excerpt?: string
    categoryName?: string
    categoryId?: string
    authorName?: string
    tags?: string[]
    isPublished: boolean
    publishedDate?: string
    thumbnailUrl?: string
}

export interface CourseDocument {
    id: string
    title: string
    slug: string
    description?: string
    categoryName?: string
    categoryId?: string
    difficulty?: string
    instructorName?: string
    isPublished: boolean
    thumbnailUrl?: string
}

export interface CoachDocument {
    id: string
    displayName: string
    slug: string
    bio?: string
    expertise?: string[]
    yearsOfExperience?: number
    isActive: boolean
    profilePhotoUrl?: string
}

export interface PageDocument {
    id: string
    title: string
    slug: string
    content?: string
    authorName?: string
    isPublished: boolean
    publishedDate?: string
}

// Initialize indexes with proper settings
export async function initializeMeilisearchIndexes(): Promise<void> {
    const client = getMeilisearchClient()
    if (!client) return

    try {
        // Create posts index
        await client.createIndex(INDEXES.POSTS, { primaryKey: 'id' })
        const postsIndex = client.index(INDEXES.POSTS)
        await postsIndex.updateSearchableAttributes(['title', 'excerpt', 'categoryName', 'authorName', 'tags'])
        await postsIndex.updateFilterableAttributes(['isPublished', 'categoryId'])
        await postsIndex.updateSortableAttributes(['publishedDate', 'title'])

        // Create courses index
        await client.createIndex(INDEXES.COURSES, { primaryKey: 'id' })
        const coursesIndex = client.index(INDEXES.COURSES)
        await coursesIndex.updateSearchableAttributes(['title', 'description', 'categoryName', 'instructorName'])
        await coursesIndex.updateFilterableAttributes(['isPublished', 'categoryId', 'difficulty'])
        await coursesIndex.updateSortableAttributes(['title'])

        // Create coaches index
        await client.createIndex(INDEXES.COACHES, { primaryKey: 'id' })
        const coachesIndex = client.index(INDEXES.COACHES)
        await coachesIndex.updateSearchableAttributes(['displayName', 'bio', 'expertise'])
        await coachesIndex.updateFilterableAttributes(['isActive'])
        await coachesIndex.updateSortableAttributes(['displayName', 'yearsOfExperience'])

        // Create pages index
        await client.createIndex(INDEXES.PAGES, { primaryKey: 'id' })
        const pagesIndex = client.index(INDEXES.PAGES)
        await pagesIndex.updateSearchableAttributes(['title', 'content', 'authorName'])
        await pagesIndex.updateFilterableAttributes(['isPublished'])
        await pagesIndex.updateSortableAttributes(['publishedDate', 'title'])

        console.log('✅ Meilisearch indexes initialized successfully')
    } catch (error: any) {
        // Index might already exist, that's ok
        if (error.code !== 'index_already_exists') {
            console.error('Failed to initialize Meilisearch indexes:', error)
        }
    }
}

// Generic indexing functions
export async function indexDocument<T extends RecordAny>(
    indexName: string,
    document: T
): Promise<void> {
    const client = getMeilisearchClient()
    if (!client) return

    try {
        const index = client.index(indexName)
        await index.addDocuments([document])
    } catch (error) {
        console.error(`Failed to index document in ${indexName}:`, error)
    }
}

export async function updateDocument<T extends RecordAny>(
    indexName: string,
    document: T
): Promise<void> {
    const client = getMeilisearchClient()
    if (!client) return

    try {
        const index = client.index(indexName)
        await index.updateDocuments([document])
    } catch (error) {
        console.error(`Failed to update document in ${indexName}:`, error)
    }
}

export async function deleteDocument(indexName: string, documentId: string): Promise<void> {
    const client = getMeilisearchClient()
    if (!client) return

    try {
        const index = client.index(indexName)
        await index.deleteDocument(documentId)
    } catch (error) {
        console.error(`Failed to delete document from ${indexName}:`, error)
    }
}

// Search function
export interface SearchOptions {
    query: string
    limit?: number
    offset?: number
    filter?: string | string[]
}

export interface SearchResult<T> {
    hits: T[]
    query: string
    processingTimeMs: number
    limit: number
    offset: number
    estimatedTotalHits: number
}

export async function search<T extends RecordAny>(
    indexName: string,
    options: SearchOptions
): Promise<SearchResult<T> | null> {
    const client = getMeilisearchClient()
    if (!client) return null

    try {
        const index = client.index(indexName)
        const result = await index.search<T>(options.query, {
            limit: options.limit || 20,
            offset: options.offset || 0,
            filter: options.filter,
        })

        return {
            hits: result.hits,
            query: result.query,
            processingTimeMs: result.processingTimeMs,
            limit: options.limit || 20,
            offset: options.offset || 0,
            estimatedTotalHits: result.estimatedTotalHits || 0,
        }
    } catch (error) {
        console.error(`Search failed in ${indexName}:`, error)
        return null
    }
}

// Multi-index search for global search
export async function multiSearch(
    query: string,
    indexes: string[] = [INDEXES.POSTS, INDEXES.COURSES, INDEXES.COACHES, INDEXES.PAGES],
    limit: number = 5
): Promise<{ [key: string]: any[] }> {
    const client = getMeilisearchClient()
    if (!client) return {}

    try {
        const results = await client.multiSearch({
            queries: indexes.map((indexUid) => ({
                indexUid,
                q: query,
                limit,
                filter: indexUid === INDEXES.COACHES ? 'isActive = true' : 'isPublished = true',
            })),
        })

        const grouped: { [key: string]: any[] } = {}
        results.results.forEach((result, i) => {
            grouped[indexes[i]] = result.hits
        })

        return grouped
    } catch (error) {
        console.error('Multi-search failed:', error)
        return {}
    }
}
