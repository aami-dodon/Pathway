/**
 * LMS Seed Data (Courses, Modules, Lessons, Quizzes)
 */
import type { Payload } from 'payload'



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

const quizzesData = [
    {
        title: 'Leadership Fundamentals Assessment',
        description: 'Test your understanding of core leadership concepts.',
        settings: { timeLimit: 20, passingScore: 70, maxAttempts: 3, shuffleQuestions: true, showCorrectAnswers: 'after-submit' as const },
        questions: [
            {
                questionType: 'multiple-choice' as const,
                question: createRichText('What is the primary difference between a leader and a manager?'),
                points: 2,
                options: [
                    { text: 'Leaders focus on people, managers focus on systems', isCorrect: true },
                    { text: 'Leaders earn more money', isCorrect: false },
                    { text: 'Managers work harder', isCorrect: false },
                    { text: 'There is no difference', isCorrect: false },
                ],
            },
            {
                questionType: 'true-false' as const,
                question: createRichText('Emotional intelligence is not important for effective leadership.'),
                points: 1,
                correctAnswer: false,
            },
            {
                questionType: 'multiple-select' as const,
                question: createRichText('Which of the following are key leadership qualities? (Select all that apply)'),
                points: 3,
                options: [
                    { text: 'Vision', isCorrect: true },
                    { text: 'Integrity', isCorrect: true },
                    { text: 'Micromanagement', isCorrect: false },
                    { text: 'Empathy', isCorrect: true },
                ],
            },
        ],
    },
    {
        title: 'Communication Skills Quiz',
        description: 'Evaluate your communication competencies.',
        settings: { timeLimit: 15, passingScore: 75, maxAttempts: 2, shuffleQuestions: false, showCorrectAnswers: 'after-pass' as const },
        questions: [
            {
                questionType: 'multiple-choice' as const,
                question: createRichText('What percentage of communication is non-verbal?'),
                points: 2,
                options: [
                    { text: 'About 10%', isCorrect: false },
                    { text: 'About 55%', isCorrect: true },
                    { text: 'About 90%', isCorrect: false },
                    { text: 'About 25%', isCorrect: false },
                ],
            },
            {
                questionType: 'short-answer' as const,
                question: createRichText('What is the technique called where you repeat back what someone said to confirm understanding?'),
                points: 2,
                acceptedAnswers: [{ answer: 'active listening' }, { answer: 'reflective listening' }, { answer: 'mirroring' }],
            },
        ],
    },
    {
        title: 'Entrepreneurship Basics Quiz',
        description: 'Test your startup and business knowledge.',
        settings: { timeLimit: 25, passingScore: 70, maxAttempts: 0, shuffleQuestions: true, showCorrectAnswers: 'after-submit' as const },
        questions: [
            {
                questionType: 'multiple-choice' as const,
                question: createRichText('What does MVP stand for in startup terminology?'),
                points: 1,
                options: [
                    { text: 'Most Valuable Product', isCorrect: false },
                    { text: 'Minimum Viable Product', isCorrect: true },
                    { text: 'Maximum Value Proposition', isCorrect: false },
                    { text: 'Market Validation Process', isCorrect: false },
                ],
            },
            {
                questionType: 'true-false' as const,
                question: createRichText('A business plan should be completely rigid and never change.'),
                points: 1,
                correctAnswer: false,
            },
            {
                questionType: 'multiple-choice' as const,
                question: createRichText('What is the typical equity range a seed investor expects?'),
                points: 2,
                options: [
                    { text: '1-5%', isCorrect: false },
                    { text: '10-20%', isCorrect: true },
                    { text: '50-60%', isCorrect: false },
                    { text: '80-90%', isCorrect: false },
                ],
            },
        ],
    },
    {
        title: 'Productivity Methods Assessment',
        description: 'How well do you know productivity frameworks?',
        settings: { timeLimit: 15, passingScore: 80, maxAttempts: 5, shuffleQuestions: false, showCorrectAnswers: 'after-submit' as const },
        questions: [
            {
                questionType: 'multiple-choice' as const,
                question: createRichText('How long is a standard Pomodoro work interval?'),
                points: 1,
                options: [
                    { text: '15 minutes', isCorrect: false },
                    { text: '25 minutes', isCorrect: true },
                    { text: '45 minutes', isCorrect: false },
                    { text: '60 minutes', isCorrect: false },
                ],
            },
            {
                questionType: 'multiple-select' as const,
                question: createRichText('Which are part of the GTD (Getting Things Done) workflow?'),
                points: 3,
                options: [
                    { text: 'Capture', isCorrect: true },
                    { text: 'Process', isCorrect: true },
                    { text: 'Ignore', isCorrect: false },
                    { text: 'Review', isCorrect: true },
                ],
            },
        ],
    },
    {
        title: 'Mindfulness Fundamentals',
        description: 'Understanding core mindfulness concepts.',
        settings: { timeLimit: 10, passingScore: 70, maxAttempts: 0, shuffleQuestions: false, showCorrectAnswers: 'after-submit' as const },
        questions: [
            {
                questionType: 'true-false' as const,
                question: createRichText('Mindfulness requires emptying your mind completely.'),
                points: 1,
                correctAnswer: false,
            },
            {
                questionType: 'multiple-choice' as const,
                question: createRichText('What is the recommended starting duration for mindfulness meditation beginners?'),
                points: 2,
                options: [
                    { text: '1 hour', isCorrect: false },
                    { text: '5-10 minutes', isCorrect: true },
                    { text: '30 minutes', isCorrect: false },
                    { text: '2 hours', isCorrect: false },
                ],
            },
        ],
    },
]

const lessonsData = [
    // Leadership Course Lessons
    { title: 'What is Leadership?', slug: 'what-is-leadership', type: 'video', order: 1, duration: { hours: 0, minutes: 15 }, isFree: true },
    { title: 'Leadership vs Management', slug: 'leadership-vs-management', type: 'video', order: 2, duration: { hours: 0, minutes: 20 } },
    { title: 'Core Leadership Qualities', slug: 'core-leadership-qualities', type: 'text', order: 3, duration: { hours: 0, minutes: 25 } },
    { title: 'Building Your Leadership Style', slug: 'building-leadership-style', type: 'video', order: 4, duration: { hours: 0, minutes: 30 } },
    { title: 'Emotional Intelligence for Leaders', slug: 'emotional-intelligence-leaders', type: 'video', order: 5, duration: { hours: 0, minutes: 35 } },
    { title: 'Team Motivation Strategies', slug: 'team-motivation-strategies', type: 'text', order: 6, duration: { hours: 0, minutes: 20 } },
    { title: 'Giving Effective Feedback', slug: 'giving-effective-feedback', type: 'video', order: 7, duration: { hours: 0, minutes: 25 } },
    { title: 'Conflict Resolution', slug: 'conflict-resolution', type: 'video', order: 8, duration: { hours: 0, minutes: 30 } },
    { title: 'Leadership Reflection Exercise', slug: 'leadership-reflection', type: 'assignment', order: 9, duration: { hours: 1, minutes: 0 } },
    { title: 'Leadership Assessment', slug: 'leadership-assessment', type: 'quiz', order: 10, duration: { hours: 0, minutes: 20 } },
    // Communication Course Lessons
    { title: 'Introduction to Communication', slug: 'intro-communication', type: 'video', order: 1, duration: { hours: 0, minutes: 15 }, isFree: true },
    { title: 'Active Listening Skills', slug: 'active-listening-skills', type: 'video', order: 2, duration: { hours: 0, minutes: 20 } },
    { title: 'Non-Verbal Communication', slug: 'non-verbal-communication', type: 'text', order: 3, duration: { hours: 0, minutes: 25 } },
    { title: 'Presentation Fundamentals', slug: 'presentation-fundamentals', type: 'video', order: 4, duration: { hours: 0, minutes: 35 } },
    { title: 'Handling Difficult Conversations', slug: 'difficult-conversations', type: 'video', order: 5, duration: { hours: 0, minutes: 30 } },
    { title: 'Communication Skills Quiz', slug: 'communication-quiz', type: 'quiz', order: 6, duration: { hours: 0, minutes: 15 } },
    // Entrepreneurship Course Lessons
    { title: 'The Entrepreneurial Mindset', slug: 'entrepreneurial-mindset', type: 'video', order: 1, duration: { hours: 0, minutes: 20 }, isFree: true },
    { title: 'Identifying Opportunities', slug: 'identifying-opportunities', type: 'video', order: 2, duration: { hours: 0, minutes: 25 } },
    { title: 'Building Your MVP', slug: 'building-mvp', type: 'text', order: 3, duration: { hours: 0, minutes: 30 } },
    { title: 'Customer Discovery', slug: 'customer-discovery', type: 'video', order: 4, duration: { hours: 0, minutes: 35 } },
    { title: 'Fundraising Basics', slug: 'fundraising-basics', type: 'video', order: 5, duration: { hours: 0, minutes: 40 } },
    { title: 'Pitching Your Startup', slug: 'pitching-startup', type: 'video', order: 6, duration: { hours: 0, minutes: 30 } },
    { title: 'Business Plan Assignment', slug: 'business-plan-assignment', type: 'assignment', order: 7, duration: { hours: 2, minutes: 0 } },
    { title: 'Entrepreneurship Quiz', slug: 'entrepreneurship-quiz', type: 'quiz', order: 8, duration: { hours: 0, minutes: 25 } },
    // Productivity Course Lessons
    { title: 'Why Productivity Matters', slug: 'why-productivity-matters', type: 'video', order: 1, duration: { hours: 0, minutes: 15 }, isFree: true },
    { title: 'The Pomodoro Technique', slug: 'pomodoro-technique', type: 'video', order: 2, duration: { hours: 0, minutes: 20 } },
    { title: 'Getting Things Done (GTD)', slug: 'getting-things-done', type: 'text', order: 3, duration: { hours: 0, minutes: 30 } },
    { title: 'Time Blocking Mastery', slug: 'time-blocking-mastery', type: 'video', order: 4, duration: { hours: 0, minutes: 25 } },
    { title: 'Digital Tools for Productivity', slug: 'digital-tools-productivity', type: 'video', order: 5, duration: { hours: 0, minutes: 20 } },
    { title: 'Productivity Assessment', slug: 'productivity-assessment', type: 'quiz', order: 6, duration: { hours: 0, minutes: 15 } },
    // Wellness Course Lessons
    { title: 'Understanding Stress', slug: 'understanding-stress', type: 'video', order: 1, duration: { hours: 0, minutes: 20 }, isFree: true },
    { title: 'Mindfulness Basics', slug: 'mindfulness-basics', type: 'video', order: 2, duration: { hours: 0, minutes: 25 } },
    { title: 'Breathing Exercises', slug: 'breathing-exercises', type: 'audio', order: 3, duration: { hours: 0, minutes: 15 } },
    { title: 'Work-Life Balance Strategies', slug: 'work-life-balance', type: 'text', order: 4, duration: { hours: 0, minutes: 20 } },
    { title: 'Building Healthy Habits', slug: 'building-healthy-habits', type: 'video', order: 5, duration: { hours: 0, minutes: 30 } },
    { title: 'Wellness Quiz', slug: 'wellness-quiz', type: 'quiz', order: 6, duration: { hours: 0, minutes: 10 } },
]

const modulesData = [
    // Leadership Course Modules
    { title: 'Understanding Leadership', slug: 'understanding-leadership', order: 1, lessonRange: [0, 4] },
    { title: 'Leading Teams', slug: 'leading-teams', order: 2, lessonRange: [4, 9] },
    { title: 'Leadership Assessment', slug: 'leadership-assessment-module', order: 3, lessonRange: [9, 10], quizIndex: 0 },
    // Communication Course Modules
    { title: 'Communication Foundations', slug: 'communication-foundations', order: 1, lessonRange: [10, 13] },
    { title: 'Advanced Communication', slug: 'advanced-communication', order: 2, lessonRange: [13, 16], quizIndex: 1 },
    // Entrepreneurship Course Modules
    { title: 'Startup Fundamentals', slug: 'startup-fundamentals', order: 1, lessonRange: [16, 20] },
    { title: 'Growing Your Business', slug: 'growing-business', order: 2, lessonRange: [20, 24], quizIndex: 2 },
    // Productivity Course Modules
    { title: 'Productivity Principles', slug: 'productivity-principles', order: 1, lessonRange: [24, 27] },
    { title: 'Productivity Tools', slug: 'productivity-tools', order: 2, lessonRange: [27, 30], quizIndex: 3 },
    // Wellness Course Modules
    { title: 'Stress Management', slug: 'stress-management', order: 1, lessonRange: [30, 33] },
    { title: 'Building Wellness Habits', slug: 'wellness-habits', order: 2, lessonRange: [33, 36], quizIndex: 4 },
]

const coursesData = [
    {
        title: 'Leadership Mastery: From Manager to Leader',
        slug: 'leadership-mastery',
        shortDescription: 'Transform your management skills into true leadership capabilities.',
        difficulty: 'intermediate' as const,
        duration: { hours: 8, minutes: 30 },
        moduleRange: [0, 3],
        categorySlug: 'leadership',
        tagSlugs: ['deep-dive', 'frameworks'],
        topics: ['Leadership fundamentals', 'Team building', 'Emotional intelligence', 'Conflict resolution'],
        learningOutcomes: ['Develop your personal leadership style', 'Motivate and inspire team members', 'Handle conflicts effectively'],
        prerequisites: ['Basic management experience', 'Leading a team of at least 2 people'],
    },
    {
        title: 'Effective Communication for Professionals',
        slug: 'effective-communication',
        shortDescription: 'Master the art of clear, impactful communication in any situation.',
        difficulty: 'beginner' as const,
        duration: { hours: 5, minutes: 0 },
        moduleRange: [3, 5],
        categorySlug: 'communication',
        tagSlugs: ['beginner', 'how-to'],
        topics: ['Active listening', 'Presentation skills', 'Non-verbal communication'],
        learningOutcomes: ['Deliver compelling presentations', 'Navigate difficult conversations', 'Improve listening skills'],
        prerequisites: [],
    },
    {
        title: 'Startup Success: From Idea to Launch',
        slug: 'startup-success',
        shortDescription: 'Everything you need to know to start and grow your business.',
        difficulty: 'all-levels' as const,
        duration: { hours: 10, minutes: 0 },
        moduleRange: [5, 7],
        categorySlug: 'entrepreneurship',
        tagSlugs: ['deep-dive', 'case-study'],
        topics: ['Idea validation', 'MVP development', 'Fundraising', 'Pitching'],
        learningOutcomes: ['Validate your business idea', 'Build your first MVP', 'Pitch to investors confidently'],
        prerequisites: ['A business idea'],
    },
    {
        title: 'Peak Productivity: Master Your Time',
        slug: 'peak-productivity',
        shortDescription: 'Proven systems and techniques to maximize your daily output.',
        difficulty: 'beginner' as const,
        duration: { hours: 4, minutes: 0 },
        moduleRange: [7, 9],
        categorySlug: 'productivity',
        tagSlugs: ['tools', 'quick-tips'],
        topics: ['Pomodoro Technique', 'GTD', 'Time blocking'],
        learningOutcomes: ['Implement proven productivity systems', 'Eliminate time wasters', 'Achieve more in less time'],
        prerequisites: [],
    },
    {
        title: 'Mindful Professional: Wellness at Work',
        slug: 'mindful-professional',
        shortDescription: 'Build sustainable wellness habits for long-term career success.',
        difficulty: 'beginner' as const,
        duration: { hours: 4, minutes: 30 },
        moduleRange: [9, 11],
        categorySlug: 'wellness',
        tagSlugs: ['mindfulness', 'beginner'],
        topics: ['Stress management', 'Mindfulness', 'Work-life balance'],
        learningOutcomes: ['Reduce workplace stress', 'Practice daily mindfulness', 'Create healthy boundaries'],
        prerequisites: [],
    },
]

export async function seedQuizzes(payload: Payload) {
    console.log('   Creating/Updating quizzes...')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created: any[] = []

    for (const quizData of quizzesData) {
        try {
            const existing = await payload.find({
                collection: 'quizzes',
                where: { title: { equals: quizData.title } },
                limit: 1,
            })

            const data = {
                title: quizData.title,
                description: quizData.description,
                settings: quizData.settings,
                questions: quizData.questions,
                isPublished: true,
            }

            if (existing.docs.length === 0) {
                const quiz = await payload.create({
                    collection: 'quizzes',
                    data,
                })
                created.push(quiz)
            } else {
                const quiz = await payload.update({
                    collection: 'quizzes',
                    id: existing.docs[0].id,
                    data,
                })
                created.push(quiz)
            }
        } catch (e) {
            console.log(`   ⚠️ Error seeding quiz ${quizData.title}: ${(e as Error).message}`)
        }
    }

    console.log(`   Processed ${created.length} quizzes`)
    return created
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedLessons(payload: Payload, _quizzes: any[]) {
    console.log('   Creating/Updating lessons...')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created: any[] = []

    for (const lessonData of lessonsData) {
        try {
            const existing = await payload.find({
                collection: 'lessons',
                where: { slug: { equals: lessonData.slug } },
                limit: 1,
            })

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data: any = {
                title: lessonData.title,
                slug: lessonData.slug,
                description: `Learn about ${lessonData.title.toLowerCase()} in this comprehensive lesson.`,
                type: lessonData.type,
                order: lessonData.order,
                duration: lessonData.duration,
                isFree: lessonData.isFree || false,
                isPublished: true,
                completionCriteria: lessonData.type === 'quiz' ? 'quiz-pass' : lessonData.type === 'assignment' ? 'assignment-submit' : 'view',
            }

            // Add type-specific content
            if (lessonData.type === 'text') {
                data.textContent = createRichText(`This is the content for the lesson "${lessonData.title}". It provides comprehensive coverage of the topic with practical examples and exercises.`)
            }

            if (lessonData.type === 'assignment') {
                data.assignmentContent = {
                    instructions: createRichText(`Complete this assignment demonstrating your understanding of ${lessonData.title}.`),
                    dueInDays: 7,
                    submissionType: 'text',
                    maxPoints: 100,
                }
            }

            if (existing.docs.length === 0) {
                const lesson = await payload.create({
                    collection: 'lessons',
                    data,
                })
                created.push(lesson)
            } else {
                const lesson = await payload.update({
                    collection: 'lessons',
                    id: existing.docs[0].id,
                    data,
                })
                created.push(lesson)
            }
        } catch (e) {
            console.log(`   ⚠️ Error seeding lesson ${lessonData.slug}: ${(e as Error).message}`)
        }
    }

    console.log(`   Processed ${created.length} lessons`)
    return created
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedModules(payload: Payload, lessons: any[], quizzes: any[]) {
    console.log('   Creating/Updating modules...')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created: any[] = []

    for (const modData of modulesData) {
        try {
            const existing = await payload.find({
                collection: 'modules',
                where: { slug: { equals: modData.slug } },
                limit: 1,
            })

            const moduleLessons = lessons.slice(modData.lessonRange[0], modData.lessonRange[1])
            const moduleQuiz = modData.quizIndex !== undefined ? quizzes[modData.quizIndex] : null

            const data = {
                title: modData.title,
                slug: modData.slug,
                description: `This module covers ${modData.title.toLowerCase()}.`,
                order: modData.order,
                lessons: moduleLessons.map(l => l.id),
                quiz: moduleQuiz?.id,
                completionRequirements: {
                    requireAllLessons: true,
                    requireQuizPass: !!moduleQuiz,
                },
                objectives: [{ objective: `Master the concepts covered in ${modData.title}` }],
                isPublished: true,
            }

            if (existing.docs.length === 0) {
                const moduleDoc = await payload.create({
                    collection: 'modules',
                    data,
                })
                created.push(moduleDoc)
            } else {
                const moduleDoc = await payload.update({
                    collection: 'modules',
                    id: existing.docs[0].id,
                    data,
                })
                created.push(moduleDoc)
            }
        } catch (e) {
            console.log(`   ⚠️ Error seeding module ${modData.slug}: ${(e as Error).message}`)
        }
    }

    console.log(`   Processed ${created.length} modules`)
    return created
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedCourses(payload: Payload, coachProfiles: any[], modules: any[], categories: any[], tags: any[]) {
    console.log('   Creating/Updating courses...')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created: any[] = []

    for (let i = 0; i < coursesData.length; i++) {
        const courseData = coursesData[i]
        const instructor = coachProfiles[i % coachProfiles.length]
        const category = categories.find(c => c.slug === courseData.categorySlug)
        const courseTags = tags.filter(t => courseData.tagSlugs.includes(t.slug))
        const courseModules = modules.slice(courseData.moduleRange[0], courseData.moduleRange[1])

        try {
            const existing = await payload.find({
                collection: 'courses',
                where: { slug: { equals: courseData.slug } },
                limit: 1,
            })

            const data = {
                title: courseData.title,
                slug: courseData.slug,
                description: createRichText(`${courseData.shortDescription}\n\nThis comprehensive course will take you through all the essential concepts and practical applications.`),
                shortDescription: courseData.shortDescription,
                instructor: instructor.id,
                modules: courseModules.map(m => m.id),
                difficulty: courseData.difficulty,
                duration: courseData.duration,
                topics: courseData.topics.map(topic => ({ topic })),
                learningOutcomes: courseData.learningOutcomes.map(outcome => ({ outcome })),
                prerequisites: courseData.prerequisites.map(prerequisite => ({ prerequisite })),
                enrollment: { isOpen: true, maxEnrollments: 0 },
                status: 'published' as const,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                publishedAt: existing.docs.length > 0 ? (existing.docs[0] as any).publishedAt : new Date().toISOString(),
                category: category?.id,
                tags: courseTags.map(t => t.id),
                seo: {
                    metaTitle: courseData.title,
                    metaDescription: courseData.shortDescription,
                },
            }

            if (existing.docs.length === 0) {
                const course = await payload.create({
                    collection: 'courses',
                    data,
                })
                created.push(course)
            } else {
                const course = await payload.update({
                    collection: 'courses',
                    id: existing.docs[0].id,
                    data,
                })
                created.push(course)
            }
        } catch (e) {
            console.log(`   ⚠️ Error seeding course ${courseData.slug}: ${(e as Error).message}`)
        }
    }

    console.log(`   Processed ${created.length} courses`)
    return created
}
