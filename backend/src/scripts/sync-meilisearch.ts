/**
 * Script to sync existing data to Meilisearch indexes.
 * Run this after setting up Meilisearch to index all existing content.
 *
 * Usage: npx tsx src/scripts/sync-meilisearch.ts
 */

import 'dotenv/config'
import { MeiliSearch } from 'meilisearch'
import { getPayload } from 'payload'
import config from '../payload.config'

// Get prefix from environment for dev/prod separation
const getPrefix = (): string => process.env.MEILISEARCH_INDEX_PREFIX || ''

const INDEXES = {
    POSTS: `${getPrefix()}posts`,
    COURSES: `${getPrefix()}courses`,
    COACHES: `${getPrefix()}coaches`,
}

async function syncMeilisearch() {
    if (!process.env.MEILISEARCH_HOST || !process.env.MEILISEARCH_API_KEY) {
        console.error('❌ Missing MEILISEARCH_HOST or MEILISEARCH_API_KEY environment variables')
        process.exit(1)
    }

    const client = new MeiliSearch({
        host: process.env.MEILISEARCH_HOST,
        apiKey: process.env.MEILISEARCH_API_KEY,
    })

    const payload = await getPayload({ config })

    console.log('🔍 Starting Meilisearch sync...\n')

    // Create/update indexes with settings
    console.log('📝 Setting up indexes...')

    try {
        await client.createIndex(INDEXES.POSTS, { primaryKey: 'id' })
    } catch (e) {
        /* index might exist */
    }
    try {
        await client.createIndex(INDEXES.COURSES, { primaryKey: 'id' })
    } catch (e) {
        /* index might exist */
    }
    try {
        await client.createIndex(INDEXES.COACHES, { primaryKey: 'id' })
    } catch (e) {
        /* index might exist */
    }

    const postsIndex = client.index(INDEXES.POSTS)
    await postsIndex.updateSearchableAttributes(['title', 'excerpt', 'categoryName', 'authorName', 'tags'])
    await postsIndex.updateFilterableAttributes(['isPublished', 'categoryId'])
    await postsIndex.updateSortableAttributes(['publishedDate', 'title'])

    const coursesIndex = client.index(INDEXES.COURSES)
    await coursesIndex.updateSearchableAttributes([
        'title',
        'description',
        'categoryName',
        'instructorName',
    ])
    await coursesIndex.updateFilterableAttributes(['isPublished', 'categoryId', 'difficulty'])
    await coursesIndex.updateSortableAttributes(['title'])

    const coachesIndex = client.index(INDEXES.COACHES)
    await coachesIndex.updateSearchableAttributes(['displayName', 'bio', 'expertise'])
    await coachesIndex.updateFilterableAttributes(['isActive'])
    await coachesIndex.updateSortableAttributes(['displayName', 'yearsOfExperience'])

    console.log('✅ Indexes configured\n')

    // Sync Posts
    console.log('📄 Syncing posts...')
    const posts = await payload.find({
        collection: 'posts',
        depth: 2,
        limit: 1000,
    })

    const postDocs = posts.docs.map((post: any) => ({
        id: String(post.id),
        title: post.title,
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        categoryName: typeof post.category === 'object' ? post.category?.name : undefined,
        categoryId:
            typeof post.category === 'object' ? String(post.category?.id) : post.category ? String(post.category) : undefined,
        authorName:
            typeof post.author === 'object' ? post.author?.displayName || post.author?.email : undefined,
        tags: Array.isArray(post.tags)
            ? post.tags.map((t: any) => (typeof t === 'object' ? t.name : t)).filter(Boolean)
            : [],
        isPublished: post.isPublished || false,
        publishedDate: post.publishedAt || undefined,
        thumbnailUrl: typeof post.featuredImage === 'object' ? post.featuredImage?.url : undefined,
    }))

    if (postDocs.length > 0) {
        await postsIndex.addDocuments(postDocs)
        console.log(`  ✅ Indexed ${postDocs.length} posts`)
    } else {
        console.log('  ⚠️ No posts found')
    }

    // Sync Courses
    console.log('📚 Syncing courses...')
    const courses = await payload.find({
        collection: 'courses',
        depth: 2,
        limit: 1000,
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
        instructorName: typeof course.instructor === 'object' ? course.instructor?.displayName : undefined,
        isPublished: course.isPublished || false,
        thumbnailUrl: typeof course.thumbnail === 'object' ? course.thumbnail?.url : undefined,
    }))

    if (courseDocs.length > 0) {
        await coursesIndex.addDocuments(courseDocs)
        console.log(`  ✅ Indexed ${courseDocs.length} courses`)
    } else {
        console.log('  ⚠️ No courses found')
    }

    // Sync Coaches
    console.log('👨‍🏫 Syncing coaches...')
    const coaches = await payload.find({
        collection: 'coach-profiles',
        depth: 1,
        limit: 1000,
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

    if (coachDocs.length > 0) {
        await coachesIndex.addDocuments(coachDocs)
        console.log(`  ✅ Indexed ${coachDocs.length} coaches`)
    } else {
        console.log('  ⚠️ No coaches found')
    }

    console.log('\n🎉 Meilisearch sync complete!')
    process.exit(0)
}

syncMeilisearch().catch((error) => {
    console.error('❌ Sync failed:', error)
    process.exit(1)
})
