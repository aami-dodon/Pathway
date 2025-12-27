/**
 * Site Content Seed Data (Listing Pages, Header, Footer)
 */
import type { Payload } from 'payload'

export async function seedSiteContent(payload: Payload) {
    console.log('[10:54:50] INFO:    - Seeding Site Content...')

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

        // Seed Header Navigation
        const headerNavData = {
            navigationLinks: [
                { name: 'Home', href: '/' },
                { name: 'Blog', href: '/blog' },
                { name: 'Courses', href: '/courses' },
                { name: 'Coaches', href: '/coaches' },
            ],
        }

        const existingHeaderNav = await payload.findGlobal({
            slug: 'header-nav',
        })

        if (existingHeaderNav) {
            await payload.updateGlobal({
                slug: 'header-nav',
                data: headerNavData,
            })
        }

        // Seed Footer Content
        const footerContentData = {
            description: 'Learn from expert coaches and accelerate your personal and professional growth.',
            productLinks: [
                { name: 'Courses', href: '/courses' },
                { name: 'Blog', href: '/blog' },
                { name: 'Coaches', href: '/coaches' },
            ],
            companyLinks: [
                { name: 'About', href: '/about' },
                { name: 'Careers', href: '/careers' },
                { name: 'Contact', href: '/contact' },
            ],
            legalLinks: [
                { name: 'Privacy Policy', href: '/privacy' },
                { name: 'Terms of Service', href: '/terms' },
                { name: 'Cookie Policy', href: '/cookies' },
            ],
            socialLinks: {
                twitter: 'https://twitter.com',
                github: 'https://github.com',
                linkedin: 'https://linkedin.com',
            },
        }

        const existingFooterContent = await payload.findGlobal({
            slug: 'footer-content',
        })

        if (existingFooterContent) {
            await payload.updateGlobal({
                slug: 'footer-content',
                data: footerContentData,
            })
        }

        console.log('   ✅ Site content seeded successfully')
    } catch (error) {
        console.error('   ⚠️ Error seeding site content:', (error as Error).message)
    }
}
