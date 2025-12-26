import { PayloadHandler } from 'payload'

export const quizDeliveryHandler: PayloadHandler = async (req) => {
    const { payload, user } = req
    const id = req.routeParams?.id as string | undefined

    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Fetch the quiz with admin access to get all fields, including answers
        // We will manually sanitize sensitive fields before returning
        const quiz = await payload.findByID({
            collection: 'quizzes',
            id: id as string,
            overrideAccess: true,
        })

        if (!quiz) {
            return Response.json({ error: 'Quiz not found' }, { status: 404 })
        }

        // Check if quiz is published (unless admin/coach)
        const isStaff = ['admin', 'coach'].includes(user.role as string)
        if (!quiz.isPublished && !isStaff) {
            return Response.json({ error: 'Quiz not found' }, { status: 404 })
        }

        // Staff can access without enrollment check
        if (!isStaff) {
            // Find which module contains this quiz
            const modulesWithQuiz = await payload.find({
                collection: 'modules',
                where: {
                    quiz: { equals: quiz.id },
                },
                limit: 1,
                overrideAccess: true,
            })

            // Also check if quiz is linked via a lesson
            const lessonsWithQuiz = await payload.find({
                collection: 'lessons',
                where: {
                    quiz: { equals: quiz.id },
                },
                limit: 1,
                overrideAccess: true,
            })

            let courseId: string | number | null = null

            if (modulesWithQuiz.docs.length > 0) {
                // Find course containing this module
                const coursesWithModule = await payload.find({
                    collection: 'courses',
                    where: {
                        modules: { equals: modulesWithQuiz.docs[0].id },
                    },
                    limit: 1,
                    overrideAccess: true,
                })
                if (coursesWithModule.docs.length > 0) {
                    courseId = coursesWithModule.docs[0].id
                }
            } else if (lessonsWithQuiz.docs.length > 0) {
                // Find module containing this lesson, then course
                const modulesWithLesson = await payload.find({
                    collection: 'modules',
                    where: {
                        lessons: { equals: lessonsWithQuiz.docs[0].id },
                    },
                    limit: 1,
                    overrideAccess: true,
                })
                if (modulesWithLesson.docs.length > 0) {
                    const coursesWithModule = await payload.find({
                        collection: 'courses',
                        where: {
                            modules: { equals: modulesWithLesson.docs[0].id },
                        },
                        limit: 1,
                        overrideAccess: true,
                    })
                    if (coursesWithModule.docs.length > 0) {
                        courseId = coursesWithModule.docs[0].id
                    }
                }
            }

            if (!courseId) {
                return Response.json({ error: 'Quiz configuration error' }, { status: 500 })
            }

            // Get user's subscriber profile
            const subscriberProfile = await payload.find({
                collection: 'subscriber-profiles',
                where: { user: { equals: user.id } },
                limit: 1,
                overrideAccess: true,
            })

            if (subscriberProfile.docs.length === 0) {
                return Response.json({ error: 'Enrollment required' }, { status: 403 })
            }

            // Check for active enrollment
            const enrollments = await payload.find({
                collection: 'enrollments',
                where: {
                    and: [
                        { subscriber: { equals: subscriberProfile.docs[0].id } },
                        { course: { equals: courseId } },
                        { status: { equals: 'active' } },
                    ],
                },
                limit: 1,
                overrideAccess: true,
            })

            if (enrollments.docs.length === 0) {
                return Response.json({ error: 'Enrollment required' }, { status: 403 })
            }
        }

        // Sanitize Quiz Data
        const sanitizedQuiz = {
            ...quiz,
            questions: quiz.questions?.map((q) => {
                const sanitizedQuestion = { ...q }

                // Remove immediate answer keys
                delete (sanitizedQuestion as any).correctAnswer
                delete (sanitizedQuestion as any).acceptedAnswers

                // Sanitize options for multiple choice/select
                if (sanitizedQuestion.options) {
                    sanitizedQuestion.options = sanitizedQuestion.options.map((opt) => {
                        const sanitizedOpt = { ...opt }
                        delete (sanitizedOpt as any).isCorrect
                        return sanitizedOpt
                    })
                }

                return sanitizedQuestion
            }),
        }

        // Remove sensitive settings if needed, but mostly questions are the concern

        return Response.json(sanitizedQuiz)

    } catch (error) {
        payload.logger.error(error)
        return Response.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
