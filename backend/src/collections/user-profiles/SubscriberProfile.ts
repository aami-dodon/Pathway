import type { CollectionConfig } from 'payload'
import { isAuthenticated, isAdmin, isAdminOrOwner } from '../../access'
import { enforceUserOwnership, preventUserChange, setJoinedAt } from '../../hooks'
import { deleteSubscriberChildren } from '../../hooks/cascadeDelete'

export const SubscriberProfile: CollectionConfig = {
    slug: 'subscriber-profiles',
    admin: {
        group: 'User Profiles',
        useAsTitle: 'displayName',
        description: 'Learner-specific profile information for subscribers',
    },
    access: {
        // Read: Only owner can read their own profile (or admin)
        // Public info should be exposed via API endpoints that filter fields
        read: isAdminOrOwner('user'),
        // Create: Any authenticated user can create their own profile
        create: isAuthenticated,
        // Update: Owner or admin
        update: isAdminOrOwner('user'),
        // Delete: Admin only
        delete: isAdmin,
    },
    hooks: {
        beforeChange: [enforceUserOwnership, preventUserChange, setJoinedAt],
        beforeDelete: [deleteSubscriberChildren],
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
                {
                    name: 'timezone',
                    type: 'text',
                    admin: {
                        description: 'Preferred timezone for scheduling and notifications',
                    },
                },
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
    ],
}
