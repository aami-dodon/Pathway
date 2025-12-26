import type { Access, Where } from 'payload'

/**
 * Returns published content only for public access, all content for admins/coaches
 * Use for: Public-facing content (posts, courses, pages)
 */
export const isPublishedOrAdmin: Access = ({ req: { user } }) => {
    // Admins and coaches can see all content
    if (user && ['admin', 'coach', 'creator'].includes(user.role as string)) {
        return true
    }

    // Public users only see published content
    const where: Where = {
        status: { equals: 'published' },
    }
    return where
}

/**
 * Returns published content or content owned by the current user
 * Use for: Content where authors should see their own drafts
 */
export const isPublishedOrOwner = (authorField = 'author'): Access => {
    return ({ req: { user } }) => {
        // Admins can see all
        if (user?.role === 'admin') return true

        // If user is coach/creator, show their own content + published
        if (user && ['coach', 'creator'].includes(user.role as string)) {
            const where: Where = {
                or: [
                    { status: { equals: 'published' } },
                    { [authorField]: { equals: user.id } },
                ],
            }
            return where
        }

        // Public users only see published
        const where: Where = {
            status: { equals: 'published' },
        }
        return where
    }
}
