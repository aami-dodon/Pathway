import { Payload } from 'payload'

export const seedHomePage = async (payload: Payload) => {
    payload.logger.info('   - Seeding Home Page...')

    await payload.updateGlobal({
        slug: 'home-page',
        data: {
            hero: {
                badge: 'New courses added weekly',
                title: 'Transform Your Career with',
                highlightedText: 'Expert Guidance',
                description: 'Join thousands of learners accessing premium courses, insightful content, and personalized coaching from industry-leading experts.',
                primaryButtonText: 'Explore Courses',
                primaryButtonLink: '/courses',
                secondaryButtonText: 'Read Latest Posts',
                secondaryButtonLink: '/blog',
            },
            stats: [
                { value: '10K+', label: 'Active Learners' },
                { value: '500+', label: 'Expert Coaches' },
                { value: '1,000+', label: 'Courses Available' },
                { value: '98%', label: 'Satisfaction Rate' },
            ],
            featuresHeader: {
                badge: 'Why Choose Pathway',
                title: 'Everything you need to succeed',
                description: 'We provide the tools, content, and connections to help you reach your goals.',
            },
            features: [
                {
                    icon: 'BookOpen',
                    title: 'Expert-Led Courses',
                    description: 'Learn from industry professionals with proven track records and real-world experience.',
                },
                {
                    icon: 'Users',
                    title: 'Personal Coaching',
                    description: 'Book one-on-one sessions with coaches who can guide your personal growth journey.',
                },
                {
                    icon: 'Sparkles',
                    title: 'Premium Content',
                    description: 'Access exclusive articles, tutorials, and insights written by our community of experts.',
                },
                {
                    icon: 'Users',
                    title: 'Community Access',
                    description: 'Join a vibrant community of learners and mentors to share knowledge and grow together.',
                }
            ],
            testimonialsHeader: {
                badge: 'Testimonials',
                title: 'Loved by learners everywhere',
            },
            reviews: [
                {
                    name: 'Sarah Johnson',
                    role: 'Software Engineer',
                    content: 'Pathway has completely transformed my career. The courses are practical and the coaching sessions provided me with the guidance I needed to land my dream job.',
                    avatar: 'SJ'
                },
                {
                    name: 'Michael Chen',
                    role: 'Product Manager',
                    content: "The quality of content here is unmatched. I've taken several courses and read countless articles. Each one has added real value to my professional life.",
                    avatar: 'MC'
                },
                {
                    name: 'Emily Rodriguez',
                    role: 'UX Designer',
                    content: 'I love the community aspect. Connecting with other learners and mentors has opened so many doors for collaboration and growth.',
                    avatar: 'ER'
                }
            ],
            cta: {
                title: 'Ready to start your learning journey?',
                description: 'Join our community of learners and get access to exclusive content and coaching sessions.',
                buttonText: 'Get Started Free',
                buttonLink: '/register',
                benefits: [
                    { text: 'Unlimited course access' },
                    { text: '1-on-1 coaching sessions' },
                    { text: 'Exclusive community' },
                ]
            }
        }
    })
}
