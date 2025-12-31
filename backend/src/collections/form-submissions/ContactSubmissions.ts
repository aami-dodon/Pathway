import type { CollectionConfig } from 'payload'
import { EmailService } from '../../services/emailService'

export const ContactSubmissions: CollectionConfig = {
    slug: 'contact-submissions',
    admin: {
        useAsTitle: 'email',
        defaultColumns: ['firstName', 'lastName', 'email', 'createdAt'],
        group: 'Form Submissions',
    },
    hooks: {
        afterChange: [
            async ({ doc, operation, req }) => {
                if (operation === 'create') {
                    // 1. Send acknowledgement to the user
                    await EmailService.send(req.payload, {
                        to: doc.email,
                        templateSlug: 'contact-acknowledgment',
                        data: {
                            firstName: doc.firstName,
                            lastName: doc.lastName,
                            message: doc.message,
                        },
                    })

                    // 2. Send notification to admin
                    const adminEmail = process.env.ADMIN_EMAIL
                    if (adminEmail) {
                        await EmailService.send(req.payload, {
                            to: adminEmail,
                            templateSlug: 'admin-contact-notification',
                            data: {
                                firstName: doc.firstName,
                                lastName: doc.lastName,
                                email: doc.email,
                                message: doc.message,
                            },
                        })
                    }
                }
            },
        ],
    },
    access: {
        create: () => true, // Anyone can submit a contact form
        read: ({ req: { user } }) => !!user, // Only logged-in users (admins) can read
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => !!user,
    },
    fields: [
        {
            name: 'firstName',
            type: 'text',
            required: true,
        },
        {
            name: 'lastName',
            type: 'text',
            required: true,
        },
        {
            name: 'email',
            type: 'email',
            required: true,
        },
        {
            name: 'message',
            type: 'textarea',
            required: true,
        },
    ],
    timestamps: true,
}
