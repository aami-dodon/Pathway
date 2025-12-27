/**
 * Content Management Seed Data (Categories, Tags, Posts, Pages)
 */
import type { Payload } from 'payload'

const categoriesData = [
    { name: 'Leadership', slug: 'leadership', description: 'Articles about leadership skills, team management, and executive development' },
    { name: 'Career Development', slug: 'career-development', description: 'Career growth, transitions, and professional advancement' },
    { name: 'Entrepreneurship', slug: 'entrepreneurship', description: 'Starting and growing businesses, startup culture, and founder insights' },
    { name: 'Wellness', slug: 'wellness', description: 'Mental health, work-life balance, and holistic well-being' },
    { name: 'Technology', slug: 'technology', description: 'Tech trends, digital skills, and innovation' },
    { name: 'Communication', slug: 'communication', description: 'Public speaking, presentations, and interpersonal skills' },
    { name: 'Productivity', slug: 'productivity', description: 'Time management, efficiency, and getting things done' },
    { name: 'Finance', slug: 'finance', description: 'Personal finance, investing, and financial planning' },
]

const tagsData = [
    { name: 'Beginner', slug: 'beginner' },
    { name: 'Advanced', slug: 'advanced' },
    { name: 'Quick Tips', slug: 'quick-tips' },
    { name: 'Deep Dive', slug: 'deep-dive' },
    { name: 'Case Study', slug: 'case-study' },
    { name: 'Interview', slug: 'interview' },
    { name: 'How-To', slug: 'how-to' },
    { name: 'Opinion', slug: 'opinion' },
    { name: 'Research', slug: 'research' },
    { name: 'Tools', slug: 'tools' },
    { name: 'Frameworks', slug: 'frameworks' },
    { name: 'Remote Work', slug: 'remote-work' },
    { name: 'AI', slug: 'ai' },
    { name: 'Mindfulness', slug: 'mindfulness' },
    { name: 'Networking', slug: 'networking' },
]

type AccessLevel = 'public' | 'subscribers'

const postsData: { title: string; slug: string; excerpt: string; accessLevel: AccessLevel; categorySlug: string; tagSlugs: string[] }[] = [
    {
        title: '10 Essential Leadership Skills for the Modern Workplace',
        slug: 'essential-leadership-skills-modern-workplace',
        excerpt: 'Discover the key leadership competencies that drive success in today\'s rapidly evolving business environment.',
        accessLevel: 'public',
        categorySlug: 'leadership',
        tagSlugs: ['beginner', 'how-to'],
    },
    {
        title: 'The Art of Giving Constructive Feedback',
        slug: 'art-of-giving-constructive-feedback',
        excerpt: 'Learn how to deliver feedback that motivates and develops your team members.',
        accessLevel: 'subscribers',
        categorySlug: 'leadership',
        tagSlugs: ['deep-dive', 'frameworks'],
    },
    {
        title: 'Navigating Your First Career Transition',
        slug: 'navigating-first-career-transition',
        excerpt: 'A comprehensive guide to successfully changing careers while minimizing risks.',
        accessLevel: 'public',
        categorySlug: 'career-development',
        tagSlugs: ['beginner', 'how-to', 'case-study'],
    },
    {
        title: 'Building Your Personal Brand in Tech',
        slug: 'building-personal-brand-tech',
        excerpt: 'Strategic approaches to establishing yourself as a thought leader in the technology industry.',
        accessLevel: 'subscribers',
        categorySlug: 'career-development',
        tagSlugs: ['advanced', 'deep-dive'],
    },
    {
        title: 'From Side Hustle to Startup: A Founder\'s Journey',
        slug: 'side-hustle-to-startup-founders-journey',
        excerpt: 'Real stories from entrepreneurs who turned their passion projects into successful businesses.',
        accessLevel: 'public',
        categorySlug: 'entrepreneurship',
        tagSlugs: ['case-study', 'interview'],
    },
    {
        title: 'Fundraising 101: Preparing for Your First Pitch',
        slug: 'fundraising-101-preparing-first-pitch',
        excerpt: 'Everything you need to know before approaching investors for seed funding.',
        accessLevel: 'subscribers',
        categorySlug: 'entrepreneurship',
        tagSlugs: ['beginner', 'how-to', 'frameworks'],
    },
    {
        title: 'Mindfulness Practices for Busy Professionals',
        slug: 'mindfulness-practices-busy-professionals',
        excerpt: 'Simple techniques to reduce stress and increase focus during your workday.',
        accessLevel: 'public',
        categorySlug: 'wellness',
        tagSlugs: ['quick-tips', 'mindfulness'],
    },
    {
        title: 'Building Sustainable Work-Life Balance',
        slug: 'building-sustainable-work-life-balance',
        excerpt: 'Long-term strategies for maintaining well-being while pursuing ambitious career goals.',
        accessLevel: 'subscribers',
        categorySlug: 'wellness',
        tagSlugs: ['deep-dive', 'mindfulness', 'remote-work'],
    },
    {
        title: 'AI Tools Every Professional Should Know',
        slug: 'ai-tools-every-professional-should-know',
        excerpt: 'A curated list of AI-powered tools that can supercharge your productivity.',
        accessLevel: 'public',
        categorySlug: 'technology',
        tagSlugs: ['tools', 'ai', 'quick-tips'],
    },
    {
        title: 'Future of Work: Trends Shaping 2025 and Beyond',
        slug: 'future-of-work-trends-2025',
        excerpt: 'Expert predictions on how technology will transform the workplace.',
        accessLevel: 'subscribers',
        categorySlug: 'technology',
        tagSlugs: ['research', 'ai', 'remote-work', 'opinion'],
    },
    {
        title: 'Mastering the Art of Public Speaking',
        slug: 'mastering-art-public-speaking',
        excerpt: 'Proven techniques to overcome stage fright and deliver compelling presentations.',
        accessLevel: 'public',
        categorySlug: 'communication',
        tagSlugs: ['beginner', 'how-to'],
    },
    {
        title: 'Executive Presence: Commanding Any Room',
        slug: 'executive-presence-commanding-any-room',
        excerpt: 'Advanced strategies for projecting authority and influence in high-stakes situations.',
        accessLevel: 'subscribers',
        categorySlug: 'communication',
        tagSlugs: ['advanced', 'deep-dive', 'frameworks'],
    },
    {
        title: 'The Pomodoro Technique: A Complete Guide',
        slug: 'pomodoro-technique-complete-guide',
        excerpt: 'How to use time-boxing to dramatically increase your daily output.',
        accessLevel: 'public',
        categorySlug: 'productivity',
        tagSlugs: ['beginner', 'how-to', 'tools'],
    },
    {
        title: 'Building a Second Brain: Knowledge Management',
        slug: 'building-second-brain-knowledge-management',
        excerpt: 'Create a personal knowledge system that amplifies your thinking and creativity.',
        accessLevel: 'subscribers',
        categorySlug: 'productivity',
        tagSlugs: ['advanced', 'deep-dive', 'tools', 'frameworks'],
    },
    {
        title: 'Investment Basics for Beginners',
        slug: 'investment-basics-beginners',
        excerpt: 'Start your investment journey with these fundamental concepts and strategies.',
        accessLevel: 'public',
        categorySlug: 'finance',
        tagSlugs: ['beginner', 'how-to'],
    },
    {
        title: 'Building Wealth Through Diversification',
        slug: 'building-wealth-through-diversification',
        excerpt: 'Advanced portfolio strategies for long-term financial growth.',
        accessLevel: 'subscribers',
        categorySlug: 'finance',
        tagSlugs: ['advanced', 'deep-dive', 'research'],
    },
    {
        title: 'Remote Team Management Best Practices',
        slug: 'remote-team-management-best-practices',
        excerpt: 'Lessons learned from leading distributed teams across time zones.',
        accessLevel: 'public',
        categorySlug: 'leadership',
        tagSlugs: ['remote-work', 'how-to', 'case-study'],
    },
    {
        title: 'The Science of Motivation',
        slug: 'science-of-motivation',
        excerpt: 'Understanding what drives human behavior and how to apply it.',
        accessLevel: 'subscribers',
        categorySlug: 'leadership',
        tagSlugs: ['research', 'deep-dive', 'frameworks'],
    },
    {
        title: 'Networking in the Digital Age',
        slug: 'networking-digital-age',
        excerpt: 'Build meaningful professional relationships online and offline.',
        accessLevel: 'public',
        categorySlug: 'career-development',
        tagSlugs: ['networking', 'how-to', 'quick-tips'],
    },
    {
        title: 'Salary Negotiation Masterclass',
        slug: 'salary-negotiation-masterclass',
        excerpt: 'Proven scripts and strategies for your next compensation discussion.',
        accessLevel: 'subscribers',
        categorySlug: 'career-development',
        tagSlugs: ['advanced', 'frameworks', 'deep-dive'],
    },
]

const pagesData = [
    {
        title: 'About Us',
        slug: 'about',
        content: 'Pathway is a comprehensive learning and coaching platform designed to help professionals reach their full potential. We connect learners with expert coaches and provide structured courses to accelerate personal and professional growth.',
    },
    {
        title: 'Careers',
        slug: 'careers',
        content: 'Join our team at Pathway and help us transform professional development. We are always looking for talented individuals who are passionate about education, coaching, and technology. Check back soon for open positions or reach out to us directly.',
    },
    {
        title: 'Contact Us',
        slug: 'contact',
        content: 'Get in touch with our team for support, partnerships, or general inquiries. We would love to hear from you and answer any questions you may have about our platform, courses, or coaching services.',
    },
    {
        title: 'Privacy Policy',
        slug: 'privacy',
        content: 'Our commitment to protecting your personal information and data privacy. We take your privacy seriously and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our platform.',
    },
    {
        title: 'Terms of Service',
        slug: 'terms',
        content: 'The terms and conditions governing your use of the Pathway platform. By accessing or using our services, you agree to be bound by these terms. Please read them carefully before using our platform.',
    },
    {
        title: 'Cookie Policy',
        slug: 'cookies',
        content: 'This cookie policy explains how we use cookies and similar technologies on our platform. Cookies help us provide you with a better experience by remembering your preferences and understanding how you use our services.',
    },
]

// Rich text content helper
function createRichText(text: string) {
    return {
        root: {
            type: 'root',
            children: [
                {
                    type: 'paragraph',
                    children: [{ type: 'text', text, version: 1 }],
                    version: 1,
                },
            ],
            direction: 'ltr' as const,
            format: '' as const,
            indent: 0,
            version: 1,
        },
    }
}

export async function seedCategories(payload: Payload) {
    console.log('   Creating/Updating categories...')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created: any[] = []

    for (const catData of categoriesData) {
        try {
            const existing = await payload.find({
                collection: 'categories',
                where: { slug: { equals: catData.slug } },
                limit: 1,
            })

            if (existing.docs.length === 0) {
                const cat = await payload.create({
                    collection: 'categories',
                    data: catData,
                })
                created.push(cat)
            } else {
                const cat = await payload.update({
                    collection: 'categories',
                    id: existing.docs[0].id,
                    data: catData,
                })
                created.push(cat)
            }
        } catch (e) {
            console.log(`   ⚠️ Error seeding category ${catData.slug}: ${(e as Error).message}`)
        }
    }

    console.log(`   Processed ${created.length} categories`)
    return created
}

export async function seedTags(payload: Payload) {
    console.log('   Creating/Updating tags...')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created: any[] = []

    for (const tagData of tagsData) {
        try {
            const existing = await payload.find({
                collection: 'tags',
                where: { slug: { equals: tagData.slug } },
                limit: 1,
            })

            if (existing.docs.length === 0) {
                const tag = await payload.create({
                    collection: 'tags',
                    data: tagData,
                })
                created.push(tag)
            } else {
                const tag = await payload.update({
                    collection: 'tags',
                    id: existing.docs[0].id,
                    data: tagData,
                })
                created.push(tag)
            }
        } catch (e) {
            console.log(`   ⚠️ Error seeding tag ${tagData.slug}: ${(e as Error).message}`)
        }
    }

    console.log(`   Processed ${created.length} tags`)
    return created
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedPosts(payload: Payload, coachProfiles: any[], categories: any[], tags: any[]) {
    console.log('   Creating/Updating posts...')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created: any[] = []

    for (let i = 0; i < postsData.length; i++) {
        const postData = postsData[i]
        const author = coachProfiles[i % coachProfiles.length]
        const category = categories.find(c => c.slug === postData.categorySlug)
        const postTags = tags.filter(t => postData.tagSlugs.includes(t.slug))

        try {
            const existing = await payload.find({
                collection: 'posts',
                where: { slug: { equals: postData.slug } },
                limit: 1,
            })

            const data = {
                title: postData.title,
                slug: postData.slug,
                author: author.id,
                excerpt: postData.excerpt,
                content: createRichText(`${postData.excerpt}\n\nThis is comprehensive content for the article "${postData.title}". It covers key concepts, practical examples, and actionable takeaways for readers looking to improve in this area.`),
                category: category?.id,
                tags: postTags.map(t => t.id),
                accessLevel: postData.accessLevel,
                axisLevel: postData.accessLevel,
                status: 'published' as const,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                publishedAt: existing.docs.length > 0 ? (existing.docs[0] as any).publishedAt : new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                seo: {
                    metaTitle: postData.title,
                    metaDescription: postData.excerpt,
                },
            }

            if (existing.docs.length === 0) {
                const post = await payload.create({
                    collection: 'posts',
                    data,
                })
                created.push(post)
            } else {
                const post = await payload.update({
                    collection: 'posts',
                    id: existing.docs[0].id,
                    data,
                })
                created.push(post)
            }
        } catch (e) {
            console.log(`   ⚠️ Error seeding post ${postData.slug}: ${(e as Error).message}`)
        }
    }

    console.log(`   Processed ${created.length} posts`)
    return created
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedPages(payload: Payload, adminUser: any) {
    console.log('   Creating/Updating pages...')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created: any[] = []
    const authorId = adminUser?.id

    for (const pageData of pagesData) {
        try {
            const existing = await payload.find({
                collection: 'pages',
                where: { slug: { equals: pageData.slug } },
                limit: 1,
            })

            const data = {
                title: pageData.title,
                slug: pageData.slug,
                author: {
                    relationTo: 'users' as const,
                    value: authorId,
                },
                content: createRichText(pageData.content),
                status: 'published' as const,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                publishedAt: existing.docs.length > 0 ? (existing.docs[0] as any).publishedAt : new Date().toISOString(),
                seo: {
                    metaTitle: `${pageData.title} | Pathway`,
                    metaDescription: pageData.content.substring(0, 160),
                },
            }

            if (existing.docs.length === 0) {
                const page = await payload.create({
                    collection: 'pages',
                    data,
                })
                created.push(page)
            } else {
                const page = await payload.update({
                    collection: 'pages',
                    id: existing.docs[0].id,
                    data,
                })
                created.push(page)
            }
        } catch (e) {
            console.log(`   ⚠️ Error seeding page ${pageData.slug}: ${(e as Error).message}`)
        }
    }

    console.log(`   Processed ${created.length} pages`)
    return created
}
