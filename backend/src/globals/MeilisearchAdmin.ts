import { GlobalConfig } from 'payload'

export const MeilisearchAdmin: GlobalConfig = {
    slug: 'meilisearch-admin',
    label: 'Meilisearch Management',
    admin: {
        group: 'Administration',
        components: {
            views: {
                edit: {
                    default: {
                        Component: '/components/MeilisearchDashboard#MeilisearchDashboard',
                    }
                }
            }
        }
    },
    access: {
        read: ({ req: { user } }) => user?.role === 'admin',
        update: ({ req: { user } }) => user?.role === 'admin',
    },
    fields: [
        {
            name: 'lastReindex',
            type: 'date',
            admin: {
                readOnly: true,
            }
        },
    ],
}
