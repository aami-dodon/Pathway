import type { CollectionConfig } from 'payload'
import {
    manageProfiles,
    cleanupProfiles,
    checkUserStatus
} from './hooks'
import { ResendContactService } from '../../services/resendContactService'
import { isAdmin, isAdminOrSelf, adminOnlyField } from '../../access'

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
        read: isAdminOrSelf,
        create: () => true,  // Public registration allowed
        update: isAdminOrSelf,
        delete: isAdmin,
    },
    hooks: {
        beforeLogin: [checkUserStatus],
        afterChange: [
            manageProfiles,
            async ({ doc, operation, req }) => {
                if (req.context?.preventResendSync) return
                try {
                    // Sync User changes to Resend
                    const params: any = {
                        email: doc.email,
                        // We primarily sync email here. Names come from Profiles.
                        // We can add role as segment/tag if desired.
                        data: {
                            role: doc.role,
                        }
                    }

                    // If isActive changed to false, we might ideally unsubscribe them or just track it?
                    // Implementation plan said: "Update subscription status"
                    /*
                       Actually, 'isActive' blocks login. It might not mean 'unsubscribed' from email.
                       But usually disabled users shouldn't receive emails.
                       Let's set unsubscribed if isActive is false.
                   */
                    if (doc.isActive === false) {
                        // If account is disabled, we treat as unsubscribed?
                        // Or just respect 'unsubscribed' field?
                        // Ideally respect 'unsubscribed'.
                        // But if blocked, maybe we shouldn't email them?
                        // Let's rely on 'unsubscribed' field primarily.
                        // And if isActive is false, maybe Resend handles it, but let's stick to explicit preference.
                    }
                    if (doc.unsubscribed) {
                        params.unsubscribed = true
                    } else {
                        params.unsubscribed = false
                    }

                    const res = await ResendContactService.upsertContact(params)

                    if (res?.id && doc.resendContactId !== res.id) {
                        await req.payload.update({
                            collection: 'users',
                            id: doc.id,
                            data: { resendContactId: res.id },
                            req,
                        })
                    }
                } catch (error) {
                    console.error('Error syncing User to Resend:', error)
                }
            }
        ],
        afterDelete: [
            cleanupProfiles,
            async ({ doc }) => {
                try {
                    await ResendContactService.deleteContact(doc.email)
                } catch (error) {
                    console.error('Error deleting Resend contact for User:', error)
                }
            }
        ],
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
                create: adminOnlyField,
                update: adminOnlyField,
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
            name: 'resendContactId',
            type: 'text',
            admin: {
                position: 'sidebar',
                readOnly: true,
                description: 'Resend Contact ID for sync tracking',
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
        {
            name: 'unsubscribed',
            type: 'checkbox',
            defaultValue: false,
            admin: {
                position: 'sidebar',
                description: 'User has opted out of marketing emails',
            },
        },
    ],
}
