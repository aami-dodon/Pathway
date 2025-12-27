import { Endpoint } from 'payload'
import { search, multiSearch, INDEXES } from '../services/meilisearch'

// Search endpoint for individual collections
export const searchEndpoint: Endpoint = {
    path: '/search',
    method: 'get',
    handler: async (req) => {
        const url = new URL(req.url || '', 'http://localhost')
        const query = url.searchParams.get('q') || ''
        const index = url.searchParams.get('index') || ''
        const limit = parseInt(url.searchParams.get('limit') || '20', 10)
        const offset = parseInt(url.searchParams.get('offset') || '0', 10)

        if (!query) {
            return Response.json({ error: 'Query parameter "q" is required' }, { status: 400 })
        }

        // If no specific index, do multi-search
        if (!index) {
            const results = await multiSearch(query, undefined, limit)
            return Response.json({
                query,
                results,
            })
        }

        // Validate index name
        const validIndexes = Object.values(INDEXES)
        if (!validIndexes.includes(index as any)) {
            return Response.json(
                { error: `Invalid index. Valid indexes: ${validIndexes.join(', ')}` },
                { status: 400 }
            )
        }

        // Add filter for published/active content
        let filter: string | undefined
        if (index === INDEXES.POSTS || index === INDEXES.COURSES || index === INDEXES.PAGES) {
            filter = 'isPublished = true'
        } else if (index === INDEXES.COACHES) {
            filter = 'isActive = true'
        }

        const result = await search(index, {
            query,
            limit,
            offset,
            filter,
        })

        if (!result) {
            return Response.json({ error: 'Search service unavailable' }, { status: 503 })
        }

        return Response.json(result)
    },
}

// Export all search endpoints
export const searchEndpoints: Endpoint[] = [searchEndpoint]
