import type { CollectionConfig, Access } from 'payload'
import { isAdmin, isAuthenticated, isAdminOrProgressOwner } from '../../access'



export const QuizAttempts: CollectionConfig = {
    slug: 'quiz-attempts',
    admin: {
        group: 'Learning Management',
        useAsTitle: 'id',
        description: 'Quiz attempt records and answers',
        defaultColumns: ['enrollment', 'quiz', 'score.percentage', 'passed', 'submittedAt'],
    },
    access: {
        read: isAdminOrProgressOwner,  // Admin or attempt owner (via enrollment)
        create: isAuthenticated,        // System creates on quiz start
        update: isAdminOrProgressOwner, // Admin or owner
        delete: isAdmin,                // Only admins
    },
    fields: [
        // Link to enrollment
        {
            name: 'enrollment',
            type: 'relationship',
            relationTo: 'enrollments',
            required: true,
            hasMany: false,
            admin: {
                description: 'The enrollment this attempt belongs to',
            },
        },
        // Quiz taken
        {
            name: 'quiz',
            type: 'relationship',
            relationTo: 'quizzes',
            required: true,
            hasMany: false,
            admin: {
                description: 'The quiz being attempted',
            },
        },
        // Attempt metadata
        {
            name: 'attemptNumber',
            type: 'number',
            min: 1,
            required: true,
            admin: {
                description: 'Which attempt this is (1st, 2nd, etc.)',
            },
        },
        {
            name: 'status',
            type: 'select',
            required: true,
            defaultValue: 'in-progress',
            options: [
                { label: 'In Progress', value: 'in-progress' },
                { label: 'Submitted', value: 'submitted' },
                { label: 'Graded', value: 'graded' },
                { label: 'Expired', value: 'expired' },
            ],
        },
        // Timestamps
        {
            name: 'startedAt',
            type: 'date',
            required: true,
            admin: {
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        {
            name: 'submittedAt',
            type: 'date',
            admin: {
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        {
            name: 'gradedAt',
            type: 'date',
            admin: {
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        // Time tracking
        {
            name: 'timeSpent',
            type: 'number',
            min: 0,
            admin: {
                description: 'Time spent in seconds',
            },
        },
        // Answers - what the learner submitted
        {
            name: 'answers',
            type: 'array',
            admin: {
                description: 'Submitted answers for each question',
            },
            fields: [
                {
                    name: 'questionIndex',
                    type: 'number',
                    required: true,
                    admin: {
                        description: 'Index of the question in the quiz',
                    },
                },
                {
                    name: 'questionType',
                    type: 'text',
                    admin: {
                        description: 'Type of question for reference',
                    },
                },
                // For multiple choice / true-false
                {
                    name: 'selectedOptions',
                    type: 'array',
                    admin: {
                        description: 'Selected option indices',
                    },
                    fields: [
                        {
                            name: 'optionIndex',
                            type: 'number',
                        },
                    ],
                },
                // For short answer / fill-blank
                {
                    name: 'textAnswer',
                    type: 'text',
                },
                // For essay
                {
                    name: 'essayAnswer',
                    type: 'richText',
                },
                // Grading - these fields are managed by system/instructor
                {
                    name: 'isCorrect',
                    type: 'checkbox',
                    admin: {
                        description: 'Whether the answer is correct',
                    },
                    access: {
                        update: () => true,
                    },
                },
                {
                    name: 'pointsAwarded',
                    type: 'number',
                    min: 0,
                    admin: {
                        description: 'Points awarded for this answer',
                    },
                    access: {
                        update: () => true,
                    },
                },
                {
                    name: 'feedback',
                    type: 'text',
                    admin: {
                        description: 'Instructor feedback for this answer',
                    },
                    access: {
                        update: () => true,
                    },
                },
            ],
        },
        // Scoring - managed by system
        {
            name: 'score',
            type: 'group',
            admin: {
                description: 'Quiz score',
            },
            access: {
                update: () => true,
            },
            fields: [
                {
                    name: 'pointsEarned',
                    type: 'number',
                    min: 0,
                    defaultValue: 0,
                },
                {
                    name: 'pointsPossible',
                    type: 'number',
                    min: 0,
                },
                {
                    name: 'percentage',
                    type: 'number',
                    min: 0,
                    max: 100,
                },
            ],
        },
        {
            name: 'passed',
            type: 'checkbox',
            admin: {
                description: 'Whether the learner passed the quiz',
            },
            access: {
                update: () => true,
            },
        },
        // Instructor feedback
        {
            name: 'instructorFeedback',
            type: 'richText',
            admin: {
                description: 'Overall feedback from the instructor',
            },
            access: {
                update: () => true,
            },
        },
        {
            name: 'gradedBy',
            type: 'relationship',
            relationTo: 'coach-profiles',
            hasMany: false,
            admin: {
                description: 'Instructor who graded this attempt (for essay questions)',
            },
            access: {
                update: () => true,
            },
        },
    ],
}
