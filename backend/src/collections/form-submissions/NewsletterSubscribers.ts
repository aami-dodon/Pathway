import type { CollectionConfig } from 'payload'
import { EmailService } from '../../services/emailService'
import { ResendContactService } from '../../services/resendContactService'
import { isAdmin } from '../../access'

export const NewsletterSubscribers: CollectionConfig = {
    slug: 'newsletter-subscribers',
    admin: {
        useAsTitle: 'email',
        defaultColumns: ['email', 'active', 'createdAt'],
        group: 'Form Submissions',
    },
    hooks: {
        afterChange: [
            async ({ doc, operation, req }) => {
                // Send welcome email on creation
                if (operation === 'create' && doc.active) {
                    await EmailService.send(req.payload, {
                        to: doc.email,
                        templateSlug: 'newsletter-welcome',
                        data: {
                            email: doc.email,
                        },
                    })
                }

                // Sync to Resend
                if (req.context?.preventResendSync) return
                try {
                    // Map active status to unsubscribed status (active=true -> unsubscribed=false)
                    const unsubscribed = !doc.active

                    const res = await ResendContactService.upsertContact({
                        email: doc.email,
                        unsubscribed,
                        // potentially add 'newsletter' tag mapping if our service supported it, 
                        // or rely on a specific Audience for newsletters if configured.
                    })

                    if (res?.id) {
                        // We typically want to save the ID back, but doing a recursive update in afterChange 
                        // can be dangerous if not careful. 
                        // Ideally we only update if it changed or wasn't set.
                        // But updating 'doc' here doesn't persist to DB unless we call payload.update
                        if (doc.resendContactId !== res.id) {
                            await req.payload.update({
                                collection: 'newsletter-subscribers',
                                id: doc.id,
                                data: { resendContactId: res.id },
                                req, // Pass req to maintain transaction/context if needed, but separate transaction might be safer to avoid loop check issues?
                                // Actually passing req usually keeps it in same transaction if supported.
                                // But to avoid infinite loop, we should ensure this update doesn't trigger sync again?
                                // This hook triggers on update.
                                // We need to prevent infinite loop.
                                // usually check if data changed specifically.
                            })
                        }
                    }
                } catch (error) {
                    console.error('Error syncing newsletter subscriber to Resend:', error)
                }
            },
        ],
        afterDelete: [
            async ({ doc }) => {
                try {
                    await ResendContactService.deleteContact(doc.email)
                } catch (error) {
                    console.error('Error deleting Resend contact:', error)
                }
            }
        ]
    },
    access: {
        create: () => true,  // Anyone can subscribe
        read: isAdmin,       // Only admins can read subscriber list
        update: isAdmin,     // Only admins can update
        delete: isAdmin,     // Only admins can delete
    },
    fields: [
        {
            name: 'email',
            type: 'email',
            required: true,
            unique: true,
        },
        {
            name: 'active',
            type: 'checkbox',
            defaultValue: true,
            admin: {
                description: 'Whether this subscriber is actively receiving emails',
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
    ],
    timestamps: true,
}
