import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrSelf } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    description: 'User accounts for authentication and authorization',
  },
  auth: true,
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
