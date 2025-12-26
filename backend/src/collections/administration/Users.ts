import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrSelf } from '../../access'
import { deleteUserChildren } from '../../hooks/cascadeDelete'

export const Users: CollectionConfig = {
    slug: 'users',
    admin: {
        group: 'Administration',
        useAsTitle: 'email',
        description: 'User accounts for authentication and authorization',
    },
    hooks: {
        beforeDelete: [deleteUserChildren],
    },
    auth: true,
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

                } catch (error) {
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
        // Admin panel access - only admin/coach/creator can access
        admin: ({ req: { user } }) => {
            if (!user) return false
            const role = user.role as string
            return ['admin', 'coach', 'creator'].includes(role)
        },
        // Read: Users can see their own data, admins can see all
        read: isAdminOrSelf,
        // Create: Public (for registration) - but role defaults to subscriber
        create: () => true,
        // Update: Users can update themselves, admins can update anyone
        update: isAdminOrSelf,
        // Delete: Only admins can delete users
        delete: isAdmin,
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
                // Only admins can change roles (including on create via API)
                create: ({ req: { user } }) => user?.role === 'admin',
                update: ({ req: { user } }) => user?.role === 'admin',
            },
            admin: {
                position: 'sidebar',
                description: 'User role determines permissions',
            },
        },
    ],
}
