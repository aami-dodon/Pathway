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
