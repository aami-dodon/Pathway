import type { CollectionBeforeDeleteHook } from 'payload'

export const deleteCourseChildren: CollectionBeforeDeleteHook = async ({ req, id }) => {
    const { payload } = req
    payload.logger.info(`[Cascade] Starting deleteCourseChildren for Course ID: ${id}`)

    // Fetch the course to get its modules
    const course = await payload.findByID({
        collection: 'courses',
        id,
        depth: 1,
        draft: true, // Include drafts
        req,
    })

    if (!course) {
        payload.logger.info(`[Cascade] Course ${id} not found, skipping module/enrollment deletion.`)
        return
    }

    // Delete associated Modules
    // Courses has 'modules' array relationship
    if (course.modules && Array.isArray(course.modules) && course.modules.length > 0) {
        payload.logger.info(`[Cascade] Deleting ${course.modules.length} modules for Course ${id}`)
        for (const moduleId of course.modules) {
            const modId = typeof moduleId === 'object' ? moduleId.id : moduleId
            if (modId) {
                try {
                    // Verify existence first to avoid aborting transaction on 404
                    const moduleExists = await payload.findByID({
                        collection: 'modules',
                        id: modId,
                        req,
                    })

                    if (moduleExists) {
                        await payload.delete({
                            collection: 'modules',
                            id: modId,
                            req,
                        })
                    } else {
                        payload.logger.info(`[Cascade] Module ${modId} already missing, skipping.`)
                    }
                } catch (error) {
                    // Ignore errors if module already missing
                    payload.logger.error(`[Cascade] Error deleting module ${modId}: ${error}`)
                }
            }
        }
    } else {
        payload.logger.info(`[Cascade] No modules found for Course ${id}, skipping.`)
    }

    // Delete associated Enrollments
    try {
        const enrollments = await payload.find({
            collection: 'enrollments',
            where: {
                course: {
                    equals: id,
                },
            },
            limit: 0,
            draft: true,
            req,
        })

        if (enrollments.totalDocs > 0) {
            payload.logger.info(`[Cascade] Deleting ${enrollments.totalDocs} enrollments for Course ${id}`)
            await payload.delete({
                collection: 'enrollments',
                where: {
                    course: {
                        equals: id,
                    },
                },
                req,
            })
        } else {
            payload.logger.info(`[Cascade] No enrollments found for Course ${id}, skipping.`)
        }
    } catch (error) {
        payload.logger.error(`[Cascade] Error deleting enrollments for course ${id}: ${error}`)
    }
}

export const deleteModuleChildren: CollectionBeforeDeleteHook = async ({ req, id }) => {
    const { payload } = req
    payload.logger.info(`[Cascade] Starting deleteModuleChildren for Module ID: ${id}`)

    const moduleDoc = await payload.findByID({
        collection: 'modules',
        id,
        depth: 1, // Need depth to see lessons if they are populated? Actually ID is enough if array of relationships
        draft: true,
        req,
    })

    if (!moduleDoc) {
        payload.logger.info(`[Cascade] Module ${id} not found, skipping lesson deletion.`)
        return
    }

    // Delete associated Lessons
    // Modules has 'lessons' array relationship
    if (moduleDoc.lessons && Array.isArray(moduleDoc.lessons) && moduleDoc.lessons.length > 0) {
        payload.logger.info(`[Cascade] Deleting ${moduleDoc.lessons.length} lessons for Module ${id}`)
        for (const lessonId of moduleDoc.lessons) {
            const lId = typeof lessonId === 'object' ? lessonId.id : lessonId
            if (lId) {
                try {
                    // Verify existence first to avoid aborting transaction on 404
                    const lessonExists = await payload.findByID({
                        collection: 'lessons',
                        id: lId,
                        req,
                    })

                    if (lessonExists) {
                        await payload.delete({
                            collection: 'lessons',
                            id: lId,
                            req,
                        })
                    } else {
                        payload.logger.info(`[Cascade] Lesson ${lId} already missing, skipping.`)
                    }
                } catch (error) {
                    payload.logger.error(`[Cascade] Error deleting lesson ${lId}: ${error}`)
                }
            }
        }
    } else {
        payload.logger.info(`[Cascade] No lessons found for Module ${id}, skipping.`)
    }
}

export const deleteLessonChildren: CollectionBeforeDeleteHook = async ({ req, id }) => {
    const { payload } = req
    payload.logger.info(`[Cascade] Starting deleteLessonChildren for Lesson ID: ${id}`)

    // Delete associated Progress
    try {
        const progress = await payload.find({
            collection: 'progress',
            where: {
                lesson: {
                    equals: id,
                },
            },
            limit: 0,
            draft: true,
            req,
        })

        if (progress.totalDocs > 0) {
            payload.logger.info(`[Cascade] Deleting ${progress.totalDocs} progress records for Lesson ${id}`)
            await payload.delete({
                collection: 'progress',
                where: {
                    lesson: {
                        equals: id,
                    },
                },
                req,
            })
        } else {
            payload.logger.info(`[Cascade] No progress records found for Lesson ${id}, skipping.`)
        }
    } catch (error) {
        payload.logger.error(`[Cascade] Error deleting progress for lesson ${id}: ${error}`)
    }
}

export const deleteEnrollmentChildren: CollectionBeforeDeleteHook = async ({ req, id }) => {
    const { payload } = req
    payload.logger.info(`[Cascade] Starting deleteEnrollmentChildren for Enrollment ID: ${id}`)

    // Delete associated Progress
    try {
        const progress = await payload.find({
            collection: 'progress',
            where: {
                enrollment: {
                    equals: id,
                },
            },
            limit: 0,
            draft: true,
            req,
        })

        if (progress.totalDocs > 0) {
            payload.logger.info(`[Cascade] Deleting ${progress.totalDocs} progress records for Enrollment ${id}`)
            await payload.delete({
                collection: 'progress',
                where: {
                    enrollment: {
                        equals: id,
                    },
                },
                req,
            })
        } else {
            payload.logger.info(`[Cascade] No progress records found for Enrollment ${id}, skipping.`)
        }
    } catch (error) {
        payload.logger.error(`[Cascade] Error deleting progress for enrollment ${id}: ${error}`)
    }

    // Delete associated Quiz Attempts
    try {
        const attempts = await payload.find({
            collection: 'quiz-attempts',
            where: {
                enrollment: {
                    equals: id,
                },
            },
            limit: 0,
            req,
        })

        if (attempts.totalDocs > 0) {
            payload.logger.info(`[Cascade] Deleting ${attempts.totalDocs} quiz attempts for Enrollment ${id}`)
            await payload.delete({
                collection: 'quiz-attempts',
                where: {
                    enrollment: {
                        equals: id,
                    },
                },
                req,
            })
        } else {
            payload.logger.info(`[Cascade] No quiz attempts found for Enrollment ${id}, skipping.`)
        }
    } catch (error) {
        payload.logger.error(`[Cascade] Error deleting quiz attempts for enrollment ${id}: ${error}`)
    }
}

export const deleteUserChildren: CollectionBeforeDeleteHook = async ({ req, id }) => {
    const { payload } = req
    payload.logger.info(`[Cascade] Starting deleteUserChildren for User ID: ${id}`)

    // Delete associated Subscriber Profile
    try {
        const subscriberProfiles = await payload.find({
            collection: 'subscriber-profiles',
            where: {
                user: {
                    equals: id,
                },
            },
            limit: 1,
            req,
        })

        if (subscriberProfiles.docs.length > 0) {
            const profileId = subscriberProfiles.docs[0].id
            payload.logger.info(`[Cascade] Found Subscriber Profile ${profileId} for User ${id}. Deleting...`)
            await payload.delete({
                collection: 'subscriber-profiles',
                id: profileId,
                req,
            })
            payload.logger.info(`[Cascade] Subscriber Profile ${profileId} deleted.`)
        } else {
            payload.logger.info(`[Cascade] No Subscriber Profile found for User ${id}.`)
        }
    } catch (error) {
        payload.logger.error(`[Cascade] Error deleting subscriber profile for user ${id}: ${error}`)
    }

    // Delete associated Coach Profile
    try {
        const coachProfiles = await payload.find({
            collection: 'coach-profiles',
            where: {
                user: {
                    equals: id,
                },
            },
            limit: 1,
            draft: true,
            req,
        })

        if (coachProfiles.docs.length > 0) {
            const profileId = coachProfiles.docs[0].id
            payload.logger.info(`[Cascade] Found Coach Profile ${profileId} for User ${id}. Deleting...`)
            await payload.delete({
                collection: 'coach-profiles',
                id: profileId,
                req,
            })
            payload.logger.info(`[Cascade] Coach Profile ${profileId} deleted.`)
        } else {
            payload.logger.info(`[Cascade] No Coach Profile found for User ${id}.`)
        }
    } catch (error) {
        payload.logger.error(`[Cascade] Error deleting coach profile for user ${id}: ${error}`)
    }

    // Delete associated Coaching Sessions (Bookings by this user)
    try {
        const sessions = await payload.find({
            collection: 'coaching-sessions',
            where: {
                bookedByUser: {
                    equals: id,
                },
            },
            limit: 0,
            req,
        })

        if (sessions.totalDocs > 0) {
            payload.logger.info(`[Cascade] Deleting ${sessions.totalDocs} coaching sessions booked by User ${id}`)
            await payload.delete({
                collection: 'coaching-sessions',
                where: {
                    bookedByUser: {
                        equals: id,
                    },
                },
                req,
            })
        }
    } catch (error) {
        payload.logger.error(`[Cascade] Error deleting coaching sessions for user ${id}: ${error}`)
    }
}

export const deleteSubscriberChildren: CollectionBeforeDeleteHook = async ({ req, id }) => {
    const { payload } = req
    payload.logger.info(`[Cascade] Starting deleteSubscriberChildren for Subscriber Profile ID: ${id}`)

    // Delete associated Enrollments
    try {
        const enrollments = await payload.find({
            collection: 'enrollments',
            where: {
                subscriber: {
                    equals: id,
                },
            },
            limit: 0,
            req,
        })

        if (enrollments.totalDocs > 0) {
            payload.logger.info(`[Cascade] Deleting ${enrollments.totalDocs} enrollments for Subscriber Profile ${id}`)
            await payload.delete({
                collection: 'enrollments',
                where: {
                    subscriber: {
                        equals: id,
                    },
                },
                req,
            })
        } else {
            payload.logger.info(`[Cascade] No enrollments found for Subscriber Profile ${id}, skipping.`)
        }
    } catch (error) {
        payload.logger.error(`[Cascade] Error deleting enrollments for subscriber ${id}: ${error}`)
    }
}

export const deleteCoachChildren: CollectionBeforeDeleteHook = async ({ req, id }) => {
    const { payload } = req
    payload.logger.info(`[Cascade] Starting deleteCoachChildren for Coach Profile ID: ${id}`)

    // 1. Delete associated Courses
    try {
        const courses = await payload.find({
            collection: 'courses',
            where: {
                instructor: {
                    equals: id,
                },
            },
            limit: 0,
            draft: true, // Include drafts to prevent FK violations
            req,
        })

        if (courses.totalDocs > 0) {
            payload.logger.info(`[Cascade] Deleting ${courses.totalDocs} courses for Coach Profile ${id}`)
            await payload.delete({
                collection: 'courses',
                where: {
                    instructor: {
                        equals: id,
                    },
                },
                req,
            })
        } else {
            payload.logger.info(`[Cascade] No courses found for Coach Profile ${id}, skimming.`)
        }
    } catch (error) {
        payload.logger.error(`[Cascade] Error deleting courses for coach ${id}: ${error}`)
    }

    // 2. Delete associated Coaching Sessions (As Instructor)
    try {
        const sessions = await payload.find({
            collection: 'coaching-sessions',
            where: {
                coach: {
                    equals: id,
                },
            },
            limit: 0,
            req,
        })

        if (sessions.totalDocs > 0) {
            payload.logger.info(`[Cascade] Deleting ${sessions.totalDocs} coaching sessions for Coach Profile ${id}`)
            await payload.delete({
                collection: 'coaching-sessions',
                where: {
                    coach: {
                        equals: id,
                    },
                },
                req,
            })
        }
    } catch (error) {
        payload.logger.error(`[Cascade] Error deleting coaching sessions for coach ${id}: ${error}`)
    }

    // 3. Delete associated Posts (As Author)
    try {
        const posts = await payload.find({
            collection: 'posts',
            where: {
                author: {
                    equals: id,
                },
            },
            limit: 0,
            draft: true,
            req,
        })

        if (posts.totalDocs > 0) {
            payload.logger.info(`[Cascade] Deleting ${posts.totalDocs} posts for Coach Profile ${id}`)
            await payload.delete({
                collection: 'posts',
                where: {
                    author: {
                        equals: id,
                    },
                },
                req,
            })
        }
    } catch (error) {
        payload.logger.error(`[Cascade] Error deleting posts for coach ${id}: ${error}`)
    }
}
