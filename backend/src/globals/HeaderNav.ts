import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access'

export const HeaderNav: GlobalConfig = {
    slug: 'header-nav',
    admin: {
        group: 'Globals',
        description: 'Manage the header navigation menu',
    },
    access: {
        read: () => true,
        update: isAdmin,
    },
    fields: [
        {
            name: 'navigationLinks',
            type: 'array',
            label: 'Navigation Links',
            required: true,
            minRows: 1,
            fields: [
                {
                    name: 'name',
                    type: 'text',
                    required: true,
                    admin: {
                        width: '50%',
                    },
                },
                {
                    name: 'href',
                    type: 'text',
                    required: true,
                    admin: {
                        width: '50%',
                    },
                },
            ],
        },
    ],
}
