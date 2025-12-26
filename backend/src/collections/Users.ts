import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    admin: ({ req: { user } }) => {
      if (!user) return false
      const role = user.role as string
      return ['admin', 'coach', 'creator'].includes(role)
    },
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
        // Only admins can change roles
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
  ],
}
