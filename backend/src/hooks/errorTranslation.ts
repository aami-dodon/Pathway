import { PayloadRequest } from 'payload'

export const translateDatabaseError = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any,
    req?: PayloadRequest
): { message: string; status: number } | null => {
    const message = error.message || ''

    // PostgreSQL Foreign Key Violation (Error code 23503)
    if (message.includes('violates foreign key constraint') || error.code === '23503') {
        const dependencyMatch = message.match(/violates foreign key constraint "([^"]+)" on table "([^"]+)"/)

        if (dependencyMatch && dependencyMatch[2]) {
            const tableWithDependency = dependencyMatch[2]
            let friendlyName = tableWithDependency.replace(/_/g, ' ')

            // Try to find the collection label if req is provided
            if (req?.payload?.collections) {
                const collection = Object.values(req.payload.collections).find(
                    (c) => c.config.slug === tableWithDependency || c.config.dbName === tableWithDependency
                )
                if (collection?.config?.labels?.plural) {
                    const label = collection.config.labels.plural
                    if (typeof label === 'string') {
                        friendlyName = label
                    } else if (typeof label === 'object' && label !== null) {
                        // Use English as default or first available key
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        friendlyName = (label as any).en || Object.values(label)[0] || tableWithDependency
                    }
                }
            }

            return {
                message: `Cannot delete this record because it is referenced by active records in "${friendlyName}". Please delete associated "${friendlyName}" first.`,
                status: 409,
            }
        }

        return {
            message: 'Cannot delete this record because it is referenced by other records in the system.',
            status: 409,
        }
    }

    // PostgreSQL Unique Violation (Error code 23505)
    if (message.includes('duplicate key value violates unique constraint') || error.code === '23505') {
        return {
            message: 'A record with this information already exists.',
            status: 409,
        }
    }

    return null
}
