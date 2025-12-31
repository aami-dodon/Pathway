/**
 * LMS Seed Data (Courses, Modules, Lessons, Quizzes)
 */
import type { Payload } from 'payload'



import { createRichText } from './utils.js'

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
]

const lessonsData = [
    // Leadership Course Lessons
    { title: 'What is Leadership?', slug: 'what-is-leadership', type: 'video', order: 1, duration: { hours: 0, minutes: 15 }, isFree: true },
]

const modulesData = [
    // Leadership Course Modules
    { title: 'Understanding Leadership', slug: 'understanding-leadership', order: 1, lessonRange: [0, 1], quizIndex: 0 },
]

const coursesData = [
    {
        title: 'Leadership Mastery: From Manager to Leader',
        slug: 'leadership-mastery',
        shortDescription: 'Transform your management skills into true leadership capabilities.',
        difficulty: 'intermediate' as const,
        duration: { hours: 8, minutes: 30 },
        moduleRange: [0, 1],
        categorySlug: 'leadership',
        tagSlugs: ['beginner'],
        topics: ['Leadership fundamentals', 'Team building', 'Emotional intelligence', 'Conflict resolution'],
        learningOutcomes: ['Develop your personal leadership style', 'Motivate and inspire team members', 'Handle conflicts effectively'],
        prerequisites: ['Basic management experience', 'Leading a team of at least 2 people'],
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
                isPublished: true,
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
