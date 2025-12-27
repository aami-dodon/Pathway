import { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import {
    indexDocument,
    updateDocument,
    deleteDocument,
    INDEXES,
    PostDocument,
    CourseDocument,
    CoachDocument,
    PageDocument,
} from '../services/meilisearch'

// Helper to extract plain text from rich text content
const extractPlainText = (richText: any): string => {
    if (!richText) return ''
    if (typeof richText === 'string') return richText

    // Handle Lexical rich text format
    if (richText?.root?.children) {
        const extractText = (nodes: any[]): string => {
            return nodes
                .map((node: any) => {
                    if (node.text) return node.text
                    if (node.children) return extractText(node.children)
                    return ''
                })
                .join(' ')
        }
        return extractText(richText.root.children)
    }

    return ''
}

// ============= POSTS HOOKS =============

export const indexPostAfterChange: CollectionAfterChangeHook = async ({
    doc,
    operation,
    req,
}) => {
    // Get full document with relationships
    const fullDoc = await req.payload.findByID({
        collection: 'posts',
        id: doc.id,
        depth: 2,
    })

    const postDoc: PostDocument = {
        id: String(fullDoc.id),
        title: fullDoc.title,
        slug: fullDoc.slug || '',
        excerpt: fullDoc.excerpt || '',
        categoryName:
            typeof fullDoc.category === 'object' && fullDoc.category
                ? (fullDoc.category as any).name
                : undefined,
        categoryId:
            typeof fullDoc.category === 'object' && fullDoc.category
                ? String(fullDoc.category.id)
                : fullDoc.category
                    ? String(fullDoc.category)
                    : undefined,
        authorName:
            typeof fullDoc.author === 'object' && fullDoc.author
                ? (fullDoc.author as any)?.displayName || (fullDoc.author as any)?.email
                : undefined,
        tags: Array.isArray(fullDoc.tags)
            ? fullDoc.tags.map((t: any) => (typeof t === 'object' ? t.name : t)).filter(Boolean)
            : [],
        isPublished: fullDoc.isPublished || false,
        publishedDate: fullDoc.publishedAt || undefined,
        thumbnailUrl:
            typeof fullDoc.featuredImage === 'object' && fullDoc.featuredImage
                ? (fullDoc.featuredImage as any)?.url
                : undefined,
    }

    if (operation === 'create') {
        await indexDocument(INDEXES.POSTS, postDoc)
    } else {
        await updateDocument(INDEXES.POSTS, postDoc)
    }

    return doc
}

export const deletePostAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
    await deleteDocument(INDEXES.POSTS, String(doc.id))
    return doc
}

// ============= COURSES HOOKS =============

export const indexCourseAfterChange: CollectionAfterChangeHook = async ({
    doc,
    operation,
    req,
}) => {
    const fullDoc = await req.payload.findByID({
        collection: 'courses',
        id: doc.id,
        depth: 2,
    })

    // Extract plain text from rich text description
    const descriptionText = extractPlainText(fullDoc.description)

    const courseDoc: CourseDocument = {
        id: String(fullDoc.id),
        title: fullDoc.title,
        slug: fullDoc.slug || '',
        description: fullDoc.shortDescription || descriptionText.slice(0, 500) || '',
        categoryName:
            typeof fullDoc.category === 'object' && fullDoc.category
                ? (fullDoc.category as any).name
                : undefined,
        categoryId:
            typeof fullDoc.category === 'object' && fullDoc.category
                ? String(fullDoc.category.id)
                : fullDoc.category
                    ? String(fullDoc.category)
                    : undefined,
        difficulty: fullDoc.difficulty || undefined,
        instructorName:
            typeof fullDoc.instructor === 'object' && fullDoc.instructor
                ? (fullDoc.instructor as any)?.displayName
                : undefined,
        isPublished: fullDoc.isPublished || false,
        thumbnailUrl:
            typeof fullDoc.thumbnail === 'object' && fullDoc.thumbnail
                ? (fullDoc.thumbnail as any)?.url
                : undefined,
    }

    if (operation === 'create') {
        await indexDocument(INDEXES.COURSES, courseDoc)
    } else {
        await updateDocument(INDEXES.COURSES, courseDoc)
    }

    return doc
}

export const deleteCourseAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
    await deleteDocument(INDEXES.COURSES, String(doc.id))
    return doc
}

// ============= COACH PROFILES HOOKS =============

export const indexCoachAfterChange: CollectionAfterChangeHook = async ({
    doc,
    operation,
    req,
}) => {
    const fullDoc = await req.payload.findByID({
        collection: 'coach-profiles',
        id: doc.id,
        depth: 1,
    })

    const coachDoc: CoachDocument = {
        id: String(fullDoc.id),
        displayName: fullDoc.displayName,
        slug: fullDoc.slug || '',
        bio: fullDoc.bio || '',
        expertise: Array.isArray(fullDoc.expertise)
            ? fullDoc.expertise.map((e: any) => e.area).filter(Boolean)
            : [],
        yearsOfExperience: fullDoc.experience?.yearsOfExperience || undefined,
        isActive: fullDoc.isActive || false,
        profilePhotoUrl:
            typeof fullDoc.profilePhoto === 'object' && fullDoc.profilePhoto
                ? (fullDoc.profilePhoto as any)?.url
                : undefined,
    }

    if (operation === 'create') {
        await indexDocument(INDEXES.COACHES, coachDoc)
    } else {
        await updateDocument(INDEXES.COACHES, coachDoc)
    }

    return doc
}

export const deleteCoachAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
    await deleteDocument(INDEXES.COACHES, String(doc.id))
    return doc
}

// ============= PAGES HOOKS =============

export const indexPageAfterChange: CollectionAfterChangeHook = async ({
    doc,
    operation,
    req,
}) => {
    const fullDoc = await req.payload.findByID({
        collection: 'pages',
        id: doc.id,
        depth: 1,
    })

    const contentText = extractPlainText(fullDoc.content)

    const pageDoc: PageDocument = {
        id: String(fullDoc.id),
        title: fullDoc.title,
        slug: fullDoc.slug || '',
        content: contentText.slice(0, 1000),
        authorName:
            typeof fullDoc.author === 'object' && fullDoc.author
                ? (fullDoc.author as any)?.displayName || (fullDoc.author as any)?.email
                : undefined,
        isPublished: fullDoc.isPublished || false,
        publishedDate: fullDoc.publishedAt || undefined,
    }

    if (operation === 'create') {
        await indexDocument(INDEXES.PAGES, pageDoc)
    } else {
        await updateDocument(INDEXES.PAGES, pageDoc)
    }

    return doc
}

export const deletePageAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
    await deleteDocument(INDEXES.PAGES, String(doc.id))
    return doc
}
