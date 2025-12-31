/**
 * Content Management Seed Data (Categories, Tags, Posts, Pages)
 */
import type { Payload } from 'payload'

import { createRichText } from './utils.js'
const categoriesData = [
    { name: 'Leadership', slug: 'leadership', description: 'Articles about leadership skills, team management, and executive development' },
]

const tagsData = [
    { name: 'Beginner', slug: 'beginner' },
]

const postsData: { title: string; slug: string; excerpt: string; isSubscriberOnly: boolean; categorySlug: string; tagSlugs: string[]; content: string }[] = [
    {
        title: '10 Essential Leadership Skills for the Modern Workplace',
        slug: 'essential-leadership-skills-modern-workplace',
        excerpt: 'Discover the key leadership competencies that drive success in today\'s rapidly evolving business environment.',
        isSubscriberOnly: false,
        categorySlug: 'leadership',
        tagSlugs: ['beginner', 'how-to'], // 'how-to' isn't in tagsData anymore, I should remove it or keep 'how-to' tag too. I will remove 'how-to' reference here.
        content: `
            <p>In today's fast-paced business world, effective leadership is more crucial than ever. It's no longer just about giving orders; it's about inspiring teams, navigating uncertainty, and driving innovation. Here are the 10 essential skills every modern leader needs to master.</p>

            <h3>1. Emotional Intelligence (EQ)</h3>
            <p>The ability to understand and manage your own emotions, as well as those of others, is the cornerstone of effective leadership. Leaders with high EQ can build stronger relationships and navigate conflicts with empathy.</p>

            <h3>2. Adaptability</h3>
            <p>Change is the only constant. Modern leaders must be able to pivot strategies quickly and guide their teams through transitions without losing momentum.</p>

            <h3>3. Communication</h3>
            <p>Clear, transparent communication fosters trust. It's not just about speaking well, but also about active listening and ensuring that your message is understood at all levels.</p>

            <h3>4. Decisiveness</h3>
            <p>Analysis paralysis can kill progress. Leaders need to be able to make informed decisions promptly, even with incomplete information, and then stand by them.</p>

            <h3>5. Empathy</h3>
            <p>Understanding the unique challenges and motivations of your team members allows you to support them effectively and creates a positive, inclusive work culture.</p>
            
            <h3>6. Strategic Thinking</h3>
            <p>Great leaders don't just put out fires; they look ahead. They can visualize the future and develop actionable plans to get there.</p>

            <h3>7. Delegation</h3>
            <p>Micro-management stifles growth. Effective delegation empowers team members, helps them develop new skills, and frees up your time for high-level strategy.</p>

            <h3>8. Integrity</h3>
            <p>Leading by example is powerful. When leaders act with honesty and integrity, they set a standard for the entire organization.</p>

            <h3>9. Tech Savviness</h3>
            <p>You don't need to be a coder, but you do need to understand how technology impacts your industry and how to leverage tools to improve efficiency.</p>

            <h3>10. Resilience</h3>
            <p>Setbacks are inevitable. The best leaders view failures as learning opportunities and can bounce back quickly, keeping morale high.</p>

            <p><strong>Conclusion:</strong> Developing these skills takes time and practice, but the investment is well worth it. Start by focusing on one or two areas and consistently work to improve.</p>
        `,
    },
]

const pagesData = [
    {
        title: 'About Us',
        slug: 'about',
        content: `
            <h2>Our Mission</h2>
            <p>At Pathway, we believe that professional growth should be accessible, structured, and continuous. Our mission is to bridge the gap between ambition and achievement by connecting learners with world-class coaches and actionable learning paths.</p>
            
            <h2>Our Story</h2>
            <p>Founded in 2023, Pathway began with a simple question: "Why is professional development often so fragmented?" We realized that while there is an abundance of content online, there was a lack of structured guidance and personalized mentorship. We set out to build a platform that combines the best of e-learning with the human touch of coaching.</p>

            <h2>Our Values</h2>
            <ul>
                <li><strong>Empowerment:</strong> We give you the tools to take control of your career.</li>
                <li><strong>Community:</strong> Growth happens faster when we learn together.</li>
                <li><strong>Excellence:</strong> We are committed to high-quality content and coaching.</li>
                <li><strong>Integrity:</strong> We believe in honest, transparent, and ethical practices.</li>
            </ul>

            <h2>Meet the Team</h2>
            <p>Our diverse team of educators, engineers, and creatives works tirelessly to create the best learning experience for you. We are headquartered in San Francisco but work remotely from all corners of the globe.</p>
        `,
    },
    {
        title: 'Careers',
        slug: 'careers',
        content: `
            <h2>Join Our Team</h2>
            <p>We are on a mission to transform professional development, and we need your help. If you are passionate about education, technology, and helping others succeed, Pathway might be the perfect place for you.</p>

            <h2>Why Work With Us?</h2>
            <ul>
                <li><strong>Remote-First Culture:</strong> Work from anywhere in the world.</li>
                <li><strong>Continuous Learning:</strong> We practice what we preach. All employees get a generous learning stipend.</li>
                <li><strong>Impact:</strong> Your work directly helps people improve their lives and careers.</li>
                <li><strong>Competitive Compensation:</strong> We offer market-leading salaries and equity packages.</li>
            </ul>

            <h2>Open Positions</h2>
            <h3>Engineering</h3>
            <ul>
                <li>Senior Full Stack Engineer</li>
                <li>DevOps Specialist</li>
            </ul>

            <h3>Content & Coaching</h3>
            <ul>
                <li>Lead Instructional Designer</li>
                <li>Coach Success Manager</li>
            </ul>

            <p>Don't see a role that fits? Email your resume to careers@pathway.com and tell us how you can contribute.</p>
        `,
    },
    {
        title: 'Contact Us',
        slug: 'contact',
        content: `
            <h2>Get in Touch</h2>
            <p>We'd love to hear from you. Whether you have a question about our courses, need support, or just want to share your feedback, our team is here to help.</p>

            <h3>General Inquiries</h3>
            <p>Email: hello@pathway.com<br>
            Phone: +1 (555) 123-4567</p>

            <h3>Support</h3>
            <p>For technical issues or account help, please visit our Help Center or email support@pathway.com.</p>

            <h3>Office Address</h3>
            <p>Pathway Inc.<br>
            123 Innovation Way, Suite 400<br>
            San Francisco, CA 94103<br>
            USA</p>

            <h3>Follow Us</h3>
            <p>Stay updated with the latest news and tips by following us on social media:</p>
            <ul>
                <li>LinkedIn: /company/pathway</li>
                <li>Twitter: @pathway_learning</li>
                <li>Instagram: @pathway_official</li>
            </ul>
        `,
    },
    {
        title: 'Privacy Policy',
        slug: 'privacy',
        content: `
            <h2>Privacy Policy</h2>
            <p><strong>Last Updated: January 1, 2024</strong></p>

            <p>At Pathway, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website and services.</p>

            <h3>1. Information We Collect</h3>
            <p>We collect information you provide directly to us, such as when you create an account, enroll in a course, or contact support. This may include your name, email address, payment information, and profile details.</p>

            <h3>2. How We Use Your Information</h3>
            <p>We use your information to:</p>
            <ul>
                <li>Provide, maintain, and improve our services.</li>
                <li>Process transactions and send related information.</li>
                <li>Communicate with you about new courses, features, and events.</li>
                <li>Personalize your learning experience.</li>
            </ul>

            <h3>3. Data Security</h3>
            <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>

            <h3>4. Your Rights</h3>
            <p>You have the right to access, correct, or delete your personal information. You can manage your preferences in your account settings or contact us at privacy@pathway.com.</p>
        `,
    },
    {
        title: 'Terms of Service',
        slug: 'terms',
        content: `
            <h2>Terms of Service</h2>
            <p><strong>Last Updated: January 1, 2024</strong></p>

            <p>Please read these Terms of Service ("Terms") carefully before using the Pathway platform operated by Pathway Inc.</p>

            <h3>1. Acceptance of Terms</h3>
            <p>By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>

            <h3>2. Accounts</h3>
            <p>When you create an account with us, you must provide ensuring that the information is accurate, complete, and current. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.</p>

            <h3>3. Intellectual Property</h3>
            <p>The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of Pathway Inc. and its licensors.</p>

            <h3>4. Termination</h3>
            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
        `,
    },
    {
        title: 'Cookie Policy',
        slug: 'cookies',
        content: `
            <h2>Cookie Policy</h2>
            <p>This Cookie Policy explains how Pathway uses cookies and similar technologies to recognize you when you visit our website.</p>

            <h3>What are cookies?</h3>
            <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>

            <h3>Why do we use cookies?</h3>
            <p>We use cookies for several reasons:</p>
            <ul>
                <li><strong>Essential Cookies:</strong> These are required for technical reasons in order for our website to operate.</li>
                <li><strong>Performance Cookies:</strong> These allow us to track and target the interests of our users to enhance the experience on our Online Properties.</li>
                <li><strong>Analytics Cookies:</strong> These help us understand how our website is being used and how effective our marketing campaigns are.</li>
            </ul>

            <h3>How can I control cookies?</h3>
            <p>You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies.</p>
        `,
    },
]



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
            console.log(`   ⚠️ Error seeding tag ${tagData.slug}: ${(e as Error).message} `)
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
                content: createRichText(postData.content),
                category: category?.id,
                tags: postTags.map(t => t.id),
                isSubscriberOnly: postData.isSubscriberOnly,
                isPublished: true,
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
            console.log(`   ⚠️ Error seeding post ${postData.slug}: ${(e as Error).message} `)
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
                isPublished: true,
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
            console.log(`   ⚠️ Error seeding page ${pageData.slug}: ${(e as Error).message} `)
        }
    }

    console.log(`   Processed ${created.length} pages`)
    return created
}
