/**
 * Listing Pages Seed Data (Blog, Courses, Coaches)
 */
import type { Payload } from 'payload'

export async function seedListingPages(payload: Payload) {
    console.log('[10:54:50] INFO:    - Seeding Listing Pages...')

    try {
        // Seed Blog Page
        const blogPageData = {
            hero: {
                badge: 'Blog',
                title: 'Insights from Our Experts',
                description: 'Discover articles, tutorials, and thoughts from our community of coaches and creators.',
            },
        }

        const existingBlogPage = await payload.findGlobal({
            slug: 'blog-page',
        })

        if (existingBlogPage) {
            await payload.updateGlobal({
                slug: 'blog-page',
                data: blogPageData,
            })
        }

        // Seed Courses Page
        const coursesPageData = {
            hero: {
                badge: 'Courses',
                title: 'Learn New Skills',
                description: 'Explore our catalog of expert-led courses designed to help you grow professionally and personally.',
            },
        }

        const existingCoursesPage = await payload.findGlobal({
            slug: 'courses-page',
        })

        if (existingCoursesPage) {
            await payload.updateGlobal({
                slug: 'courses-page',
                data: coursesPageData,
            })
        }

        // Seed Coaches Page
        const coachesPageData = {
            hero: {
                badge: 'Our Coaches',
                title: 'Learn from the Best',
                description: 'Connect with experienced professionals ready to guide your journey to success.',
            },
        }

        const existingCoachesPage = await payload.findGlobal({
            slug: 'coaches-page',
        })

        if (existingCoachesPage) {
            await payload.updateGlobal({
                slug: 'coaches-page',
                data: coachesPageData,
            })
        }

        console.log('   ✅ Listing pages seeded successfully')
    } catch (error) {
        console.error('   ⚠️ Error seeding listing pages:', (error as Error).message)
    }
}
