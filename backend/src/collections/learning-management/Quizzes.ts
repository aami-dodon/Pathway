import type { CollectionConfig } from 'payload'
import { quizDeliveryHandler } from '../../endpoints/quiz-delivery'
import { isAdmin, isAdminOrCreator } from '../../access'

export const Quizzes: CollectionConfig = {
    slug: 'quizzes',
    admin: {
        group: 'Learning Management',
        useAsTitle: 'title',
        description: 'Quizzes and assessments for lessons and modules',
        defaultColumns: ['title', 'settings.passingScore', 'isPublished', 'updatedAt'],
    },
    access: {
        read: isAdminOrCreator,   // Answers are sensitive - only admin/creator direct access
        create: isAdminOrCreator, // Admin or coach/creator
        update: isAdminOrCreator, // Admin or coach/creator
        delete: isAdmin,          // Only admins
    },
    endpoints: [
        {
            path: '/:id/take',
            method: 'get',
            handler: quizDeliveryHandler,
        },
    ],
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true,
            admin: {
                description: 'Quiz title',
            },
        },
        {
            name: 'description',
            type: 'textarea',
            admin: {
                description: 'Instructions or description for the quiz',
            },
        },
        // Quiz Settings
        {
            name: 'settings',
            type: 'group',
            admin: {
                description: 'Quiz configuration',
            },
            fields: [
                {
                    name: 'timeLimit',
                    type: 'number',
                    min: 0,
                    admin: {
                        description: 'Time limit in minutes (0 = no limit)',
                    },
                },
                {
                    name: 'passingScore',
                    type: 'number',
                    min: 0,
                    max: 100,
                    defaultValue: 70,
                    admin: {
                        description: 'Minimum percentage to pass',
                    },
                },
                {
                    name: 'maxAttempts',
                    type: 'number',
                    min: 0,
                    defaultValue: 0,
                    admin: {
                        description: 'Maximum attempts allowed (0 = unlimited)',
                    },
                },
                {
                    name: 'shuffleQuestions',
                    type: 'checkbox',
                    defaultValue: false,
                    admin: {
                        description: 'Randomize question order for each attempt',
                    },
                },
                {
                    name: 'showCorrectAnswers',
                    type: 'select',
                    defaultValue: 'after-submit',
                    options: [
                        { label: 'Never', value: 'never' },
                        { label: 'After Submission', value: 'after-submit' },
                        { label: 'After Passing', value: 'after-pass' },
                        { label: 'After All Attempts', value: 'after-attempts' },
                    ],
                    admin: {
                        description: 'When to show correct answers',
                    },
                },
                {
                    name: 'allowReview',
                    type: 'checkbox',
                    defaultValue: true,
                    admin: {
                        description: 'Allow learners to review their answers',
                    },
                },
            ],
        },
        // Questions - IMPORTANT: Contains correct answers, protected by collection-level access
        {
            name: 'questions',
            type: 'array',
            required: true,
            minRows: 1,
            admin: {
                description: 'Quiz questions (contains answers - only visible to coaches/admins)',
            },
            fields: [
                {
                    name: 'questionType',
                    type: 'select',
                    required: true,
                    defaultValue: 'multiple-choice',
                    options: [
                        { label: 'Multiple Choice', value: 'multiple-choice' },
                        { label: 'Multiple Select', value: 'multiple-select' },
                        { label: 'True/False', value: 'true-false' },
                        { label: 'Short Answer', value: 'short-answer' },
                        { label: 'Essay', value: 'essay' },
                        { label: 'Fill in the Blank', value: 'fill-blank' },
                    ],
                },
                {
                    name: 'question',
                    type: 'richText',
                    required: true,
                    admin: {
                        description: 'The question text',
                    },
                },
                {
                    name: 'points',
                    type: 'number',
                    min: 1,
                    defaultValue: 1,
                    admin: {
                        description: 'Points for this question',
                    },
                },
                // Multiple choice/select options - isCorrect is the sensitive data
                {
                    name: 'options',
                    type: 'array',
                    admin: {
                        description: 'Answer options (for multiple choice/select)',
                        condition: (data, siblingData) =>
                            ['multiple-choice', 'multiple-select'].includes(siblingData?.questionType),
                    },
                    fields: [
                        {
                            name: 'text',
                            type: 'text',
                            required: true,
                        },
                        {
                            name: 'isCorrect',
                            type: 'checkbox',
                            defaultValue: false,
                            admin: {
                                description: '⚠️ SENSITIVE: Marks this as the correct answer',
                            },
                        },
                        {
                            name: 'feedback',
                            type: 'text',
                            admin: {
                                description: 'Feedback shown when this option is selected',
                            },
                        },
                    ],
                },
                // True/False answer - correctAnswer is sensitive
                {
                    name: 'correctAnswer',
                    type: 'checkbox',
                    admin: {
                        description: '⚠️ SENSITIVE: The correct answer (True or False)',
                        condition: (data, siblingData) => siblingData?.questionType === 'true-false',
                    },
                },
                // Short answer / Fill in blank - acceptedAnswers is sensitive
                {
                    name: 'acceptedAnswers',
                    type: 'array',
                    admin: {
                        description: '⚠️ SENSITIVE: Accepted answers (case-insensitive matching)',
                        condition: (data, siblingData) =>
                            ['short-answer', 'fill-blank'].includes(siblingData?.questionType),
                    },
                    fields: [
                        {
                            name: 'answer',
                            type: 'text',
                            required: true,
                        },
                    ],
                },
                // Essay grading (not sensitive - just grading settings)
                {
                    name: 'essaySettings',
                    type: 'group',
                    admin: {
                        description: 'Essay question settings',
                        condition: (data, siblingData) => siblingData?.questionType === 'essay',
                    },
                    fields: [
                        {
                            name: 'minWords',
                            type: 'number',
                            min: 0,
                            admin: {
                                description: 'Minimum word count',
                            },
                        },
                        {
                            name: 'maxWords',
                            type: 'number',
                            admin: {
                                description: 'Maximum word count',
                            },
                        },
                        {
                            name: 'rubric',
                            type: 'textarea',
                            admin: {
                                description: 'Grading rubric for instructors',
                            },
                        },
                    ],
                },
                // Explanation (shown after answering based on settings)
                {
                    name: 'explanation',
                    type: 'richText',
                    admin: {
                        description: 'Explanation shown after answering (for learning)',
                    },
                },
            ],
        },
        // Status
        {
            name: 'isPublished',
            type: 'checkbox',
            defaultValue: false,
            admin: {
                position: 'sidebar',
                description: 'Whether this quiz is available to learners',
            },
        },
    ],
}
