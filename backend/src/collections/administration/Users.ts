import type { CollectionConfig } from 'payload'

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
                    // Attempt standard logout
                    await req.payload.auth({
                        headers: req.headers,
                        req, // Pass the request object
                    })
                    // Since payload.auth() authenticates, we assume standard logout endpoint logic
                    // Actually, we should call the auth operation directly if exposed, or just rely on cookie clearing.
                    // But Payload endpoints are tricky. 
                    // Let's just return success and let the browser clear the cookie via the header set by Payload response?
                    // Wait, if we return our own response, we must handle the cookie clearing ourselves!
                    // Payload's default logout handler does helpful things.

                    // BETTER APPROACH: Just catch the error from the standard strategy?
                    // We can't easily "wrap" the default endpoint logic because it's internal.
                    // But we can invoke the logout operation.

                    // Actually, if we just return 200 OK and clear the cookie, that's enough.
                    const cookiePrefix = req.payload.config.cookiePrefix || 'payload'
                    const cookieName = `${cookiePrefix}-token`

                    return Response.json({ message: 'Logged out successfully' }, {
                        status: 200,
                        headers: {
                            'Set-Cookie': `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
                        }
                    })

                } catch (_error) {
                    // Fallback: clear cookie anyway
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
    ],
}
