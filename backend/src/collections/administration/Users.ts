import type { CollectionConfig } from 'payload'
import {
    manageProfiles,
    cleanupProfiles,
    checkUserStatus
} from './hooks'

export const Users: CollectionConfig = {
    slug: 'users',
    admin: {
        group: 'Administration',
        useAsTitle: 'email',
        description: 'User accounts for authentication and authorization',
    },
    auth: {
        forgotPassword: {
            generateEmailSubject: () => 'Reset your password',
            generateEmailHTML: (args) => {
                const token = args?.token
                const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`
                return `
                        <p>You have requested to reset your password.</p>
                        <p>Please click on the following link to reset your password:</p>
                        <p><a href="${resetLink}">${resetLink}</a></p>
                    `
            },
        },
    },
    endpoints: [
        {
            path: '/logout',
            method: 'post',
            handler: async (req) => {
                try {
                    const cookiePrefix = req.payload.config.cookiePrefix || 'payload'
                    const cookieName = `${cookiePrefix}-token`

                    return Response.json({ message: 'Logged out successfully' }, {
                        status: 200,
                        headers: {
                            'Set-Cookie': `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
                        }
                    })

                } catch (error) {
                    const cookiePrefix = req.payload.config.cookiePrefix || 'payload'
                    const cookieName = `${cookiePrefix}-token`

                    return Response.json({ message: 'Logged out successfully (fallback)' }, {
                        status: 200,
                        headers: {
                            'Set-Cookie': `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
                        }
                    })
                }
            },
        },
    ],
    access: {
        admin: ({ req: { user } }) => Boolean(user),
        read: () => true,
        create: () => true,
        update: () => true,
        delete: () => true,
    },
    hooks: {
        beforeLogin: [checkUserStatus],
        afterChange: [manageProfiles],
        afterDelete: [cleanupProfiles],
    },
    fields: [
        {
            name: 'role',
            type: 'select',
            required: true,
            defaultValue: 'subscriber',
            options: [
                { label: 'Subscriber', value: 'subscriber' },
                { label: 'Creator', value: 'creator' },
                { label: 'Coach', value: 'coach' },
                { label: 'Admin', value: 'admin' },
            ],
            access: {
                create: () => true,
                update: () => true,
            },
            admin: {
                position: 'sidebar',
                description: 'User role determines permissions',
            },
        },
        {
            name: 'isActive',
            type: 'checkbox',
            defaultValue: true,
            admin: {
                position: 'sidebar',
                description: 'Uncheck to block user login',
            },
        },
        {
            name: 'isFirstLogin',
            type: 'checkbox',
            defaultValue: true,
            admin: {
                hidden: true,
            },
        },
    ],
}
