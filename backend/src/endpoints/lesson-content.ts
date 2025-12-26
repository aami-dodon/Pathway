import { PayloadHandler } from 'payload'

export const lessonContentHandler: PayloadHandler = async (req) => {
    const { payload, user } = req
    const id = req.routeParams?.id as string | undefined

    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // 1. Fetch Lesson
        const lesson = await payload.findByID({
            collection: 'lessons',
            id: id as string,
            overrideAccess: true, // Need to fetch to check permissions manually
        })

        if (!lesson) {
            return Response.json({ error: 'Lesson not found' }, { status: 404 })
        }

        // 2. Check Publishing Status (unless staff)
        const isStaff = ['admin', 'coach'].includes(user.role as string)
        if (!isStaff && !lesson.isPublished) {
            return Response.json({ error: 'Lesson not found' }, { status: 404 })
        }

        // 3. Check Access
        if (isStaff || lesson.isFree) {
            return Response.json(lesson)
        }

        // 4. Enrollment Check
        // Find which module contains this lesson
        const modulesWithLesson = await payload.find({
            collection: 'modules',
            where: {
                lessons: { equals: lesson.id },
            },
            limit: 1,
            overrideAccess: true,
        })

        if (modulesWithLesson.docs.length === 0) {
            // Lesson is orphaned, cannot verify enrollment
            return Response.json({ error: 'Lesson configuration error' }, { status: 500 })
        }

        const module = modulesWithLesson.docs[0]

        // Find which course contains this module
        const coursesWithModule = await payload.find({
            collection: 'courses',
            where: {
                modules: { equals: module.id },
            },
            limit: 1,
            overrideAccess: true,
        })

        if (coursesWithModule.docs.length === 0) {
            return Response.json({ error: 'Course configuration error' }, { status: 500 })
        }

        const course = coursesWithModule.docs[0]

        // Check for active enrollment
        const enrollments = await payload.find({
            collection: 'enrollments',
            where: {
                and: [
                    { student: { equals: user.id } },
                    { course: { equals: course.id } },
                    { status: { equals: 'active' } },
                ],
            },
            limit: 1,
            overrideAccess: true,
        })

        if (enrollments.docs.length > 0) {
            return Response.json(lesson)
        }

        return Response.json({ error: 'Enrollment required' }, { status: 403 })

    } catch (error) {
        payload.logger.error(error)
        return Response.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
