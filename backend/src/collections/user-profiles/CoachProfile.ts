import type { CollectionConfig } from 'payload'
import { timezoneField } from '../../fields/timezone'
import { enforceUserOwnership, formatSlug, preventUserChange } from '../../hooks'

export const CoachProfile: CollectionConfig = {
    slug: 'coach-profiles',
    admin: {
        group: 'User Profiles',
        useAsTitle: 'displayName',
        description: 'Public and professional coach information for content authoring and LMS',
    },
    access: {
        read: () => true,
        create: () => true,
        update: () => true,
        delete: () => true,
    },
    hooks: {
        beforeChange: [enforceUserOwnership, preventUserChange],
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
                description: 'The user account associated with this coach profile (one-to-one)',
                // Make it visible but not editable after creation
                condition: (data, siblingData, { user }) => {
                    // Admins can always see/edit
                    if (user?.role === 'admin') return true
                    // For others, it's auto-set
                    return true
                },
            },
        },
        // Public Profile Information
        {
            name: 'displayName',
            type: 'text',
            required: true,
            admin: {
                description: 'Public name shown on content and courses',
            },
        },
        {
            name: 'slug',
            type: 'text',
            required: false,
            unique: true,
            index: true,
            admin: {
                description: 'Will be automatically generated from display name if left empty.',
                position: 'sidebar',
            },
            hooks: {
                beforeValidate: [formatSlug('displayName')],
            },
        },
        {
            name: 'bio',
            type: 'textarea',
            admin: {
                description: 'Public bio shown on profile and authored content',
            },
        },
        {
            name: 'profilePhoto',
            type: 'upload',
            relationTo: 'media',
            admin: {
                description: 'Coach profile photo for public display',
            },
        },
        // Professional Information
        {
            name: 'expertise',
            type: 'array',
            admin: {
                description: 'Areas of expertise and specialization',
            },
            fields: [
                {
                    name: 'area',
                    type: 'text',
                    required: true,
                },
            ],
        },
        {
            name: 'experience',
            type: 'group',
            admin: {
                description: 'Professional experience details',
            },
            fields: [
                {
                    name: 'yearsOfExperience',
                    type: 'number',
                    min: 0,
                },
                {
                    name: 'credentials',
                    type: 'textarea',
                    admin: {
                        description: 'Certifications, qualifications, and credentials',
                    },
                },
                {
                    name: 'previousWork',
                    type: 'textarea',
                    admin: {
                        description: 'Notable previous work or achievements',
                    },
                },
            ],
        },
        // Status
        {
            name: 'isActive',
            type: 'checkbox',
            defaultValue: true,
            admin: {
                position: 'sidebar',
                description: 'Whether this coach profile is currently active',
            },
        },
        // Social Links (useful for public profiles)
        {
            name: 'socialLinks',
            type: 'group',
            admin: {
                description: 'Public social media and contact links',
            },
            fields: [
                {
                    name: 'website',
                    type: 'text',
                },
                {
                    name: 'linkedin',
                    type: 'text',
                },
                {
                    name: 'twitter',
                    type: 'text',
                },
            ],
        },
        // Availability Schedule
        timezoneField({
            admin: {
                description: 'Timezone for the availability slots below',
            },
        }),
        {
            name: 'availability',
            type: 'array',
            label: 'Weekly Availability',
            admin: {
                description: 'Define recurring weekly availability slots.',
            },
            fields: [
                {
                    name: 'day',
                    type: 'select',
                    required: true,
                    options: [
                        { label: 'Monday', value: 'mon' },
                        { label: 'Tuesday', value: 'tue' },
                        { label: 'Wednesday', value: 'wed' },
                        { label: 'Thursday', value: 'thu' },
                        { label: 'Friday', value: 'fri' },
                        { label: 'Saturday', value: 'sat' },
                        { label: 'Sunday', value: 'sun' },
                    ],
                },
                {
                    name: 'startTime',
                    type: 'text',
                    required: true,
                    admin: { placeholder: '09:00' },
                    validate: (value: string | null | undefined) => {
                        if (!value) return 'Required'
                        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
                            return 'Invalid time format (HH:mm)'
                        }
                        return true
                    },
                },
                {
                    name: 'endTime',
                    type: 'text',
                    required: true,
                    admin: { placeholder: '17:00' },
                    validate: (value: string | null | undefined) => {
                        if (!value) return 'Required'
                        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
                            return 'Invalid time format (HH:mm)'
                        }
                        return true
                    },
                },
            ],
        },
    ],
}
