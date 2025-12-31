import type { CollectionConfig } from 'payload'
import { timezoneField } from '../../fields/timezone'
import { enforceUserOwnership, preventUserChange, setJoinedAt } from '../../hooks'
import { cleanupUserBeforeDelete, cleanupUserAfterDelete } from './hooks'
import { ResendContactService } from '../../services/resendContactService'
import type { User } from '../../payload-types'

export const SubscriberProfile: CollectionConfig = {
    slug: 'subscriber-profiles',
    admin: {
        group: 'User Profiles',
        useAsTitle: 'displayName',
        description: 'Learner-specific profile information for subscribers',
        defaultColumns: ['displayName', 'user', 'isActive', 'metadata.joinedAt'],
    },
    access: {
        read: () => true,
        create: () => true,
        update: () => true,
        delete: () => true,
    },
    hooks: {
        afterDelete: [cleanupUserAfterDelete],
        beforeDelete: [cleanupUserBeforeDelete],
        beforeChange: [enforceUserOwnership, preventUserChange, setJoinedAt],
        afterChange: [
            async ({ doc, req }) => {
                try {
                    // When profile changes, sync name to Resend
                    if (doc.user && doc.displayName) {
                        let email: string | undefined

                        if (typeof doc.user === 'object' && doc.user.email) {
                            email = doc.user.email
                        } else {
                            // Fetch user if only ID is present
                            const user = await req.payload.findByID({
                                collection: 'users',
                                id: doc.user as string | number,
                            })
                            if (user) email = user.email
                        }

                        if (email) {
                            // Split display name for first/last
                            const parts = doc.displayName.split(' ')
                            const firstName = parts[0]
                            const lastName = parts.slice(1).join(' ')

                            await ResendContactService.upsertContact({
                                email,
                                firstName,
                                lastName,
                                data: {
                                    source_type: 'subscriber_profile'
                                }
                            })
                        }
                    }
                } catch (error) {
                    console.error('Error syncing SubscriberProfile to Resend:', error)
                }
            }
        ],
    },
    fields: [
        // Required one-to-one relationship with Users
        {
            name: 'user',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            unique: true,
            hasMany: false,
            admin: {
                description: 'The user account associated with this subscriber profile (one-to-one)',
                readOnly: true,
            },
        },
        // Display Information
        {
            name: 'displayName',
            type: 'text',
            required: true,
            admin: {
                description: 'Display name shown in comments, forums, and community features',
            },
        },
        {
            name: 'avatar',
            type: 'upload',
            relationTo: 'media',
            admin: {
                description: 'Subscriber avatar for community features',
            },
        },
        // Privacy Settings
        {
            name: 'isAnonymous',
            type: 'checkbox',
            defaultValue: false,
            admin: {
                description: 'If enabled, this subscriber prefers anonymous participation',
            },
        },
        // Interests & Preferences
        {
            name: 'interests',
            type: 'array',
            admin: {
                description: 'Topics and subjects the subscriber is interested in',
            },
            fields: [
                {
                    name: 'topic',
                    type: 'text',
                    required: true,
                },
            ],
        },
        // Basic Metadata
        {
            name: 'metadata',
            type: 'group',
            admin: {
                description: 'Additional subscriber metadata',
            },
            fields: [
                timezoneField({
                    admin: {
                        description: 'Preferred timezone for scheduling and notifications',
                    },
                    required: false,
                }),
                {
                    name: 'language',
                    type: 'text',
                    defaultValue: 'en',
                    admin: {
                        description: 'Preferred language code',
                    },
                },
                {
                    name: 'joinedAt',
                    type: 'date',
                    admin: {
                        description: 'Date when subscriber profile was created',
                        readOnly: true,
                    },
                },
            ],
        },
        // Learning Preferences (useful for LMS)
        {
            name: 'learningPreferences',
            type: 'group',
            admin: {
                description: 'Learning style and delivery preferences',
            },
            fields: [
                {
                    name: 'preferredFormat',
                    type: 'select',
                    options: [
                        { label: 'Video', value: 'video' },
                        { label: 'Text', value: 'text' },
                        { label: 'Audio', value: 'audio' },
                        { label: 'Interactive', value: 'interactive' },
                    ],
                },
                {
                    name: 'pace',
                    type: 'select',
                    options: [
                        { label: 'Self-paced', value: 'self-paced' },
                        { label: 'Scheduled', value: 'scheduled' },
                        { label: 'Intensive', value: 'intensive' },
                    ],
                },
            ],
        },
        {
            name: 'isActive',
            type: 'checkbox',
            defaultValue: true,
            admin: {
                position: 'sidebar',
                description: 'Whether this subscriber profile is currently active',
            },
        },
    ],
}
