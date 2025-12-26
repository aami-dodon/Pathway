import type { Field } from 'payload'

/**
 * Reusable slug field with URL-friendly identifier
 */
export const slugField: Field = {
    name: 'slug',
    type: 'text',
    required: true,
    unique: true,
    index: true,
    admin: {
        description: 'URL-friendly identifier (auto-generated or custom)',
    },
}
