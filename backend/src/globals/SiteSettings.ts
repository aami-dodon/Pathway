import { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
    slug: 'site-settings',
    label: 'Site Settings',
    admin: {
        group: 'Globals',
    },
    access: {
        read: () => true,
        update: () => true, // In production, this should be restricted to admins
    },
    fields: [
        {
            name: 'maintenanceMode',
            type: 'group',
            label: 'Coming Soon / Maintenance Mode',
            fields: [
                {
                    name: 'isEnabled',
                    type: 'checkbox',
                    label: 'Enable Coming Soon Page',
                    defaultValue: false,
                },
                {
                    name: 'title',
                    type: 'text',
                    label: 'Coming Soon Title',
                    defaultValue: 'Something Great is Coming',
                    admin: {
                        condition: (data) => data?.maintenanceMode?.isEnabled,
                    },
                },
                {
                    name: 'description',
                    type: 'textarea',
                    label: 'Coming Soon Description',
                    defaultValue: 'We are working hard to bring you a new experience. Stay tuned!',
                    admin: {
                        condition: (data) => data?.maintenanceMode?.isEnabled,
                    },
                },
                {
                    name: 'expectedLaunchDate',
                    type: 'date',
                    label: 'Expected Launch Date',
                    admin: {
                        condition: (data) => data?.maintenanceMode?.isEnabled,
                    },
                },
                {
                    name: 'showNewsletter',
                    type: 'checkbox',
                    label: 'Show Newsletter Subscription',
                    defaultValue: true,
                    admin: {
                        condition: (data) => data?.maintenanceMode?.isEnabled,
                    },
                },
            ],
        },
        {
            name: 'socialLinks',
            type: 'group',
            label: 'Global Social Links',
            fields: [
                {
                    name: 'facebook',
                    type: 'text',
                    label: 'Facebook URL',
                },
                {
                    name: 'instagram',
                    type: 'text',
                    label: 'Instagram URL',
                },
                {
                    name: 'twitter',
                    type: 'text',
                    label: 'X (formerly Twitter) URL',
                },
                {
                    name: 'linkedin',
                    type: 'text',
                    label: 'LinkedIn URL',
                },
                {
                    name: 'youtube',
                    type: 'text',
                    label: 'YouTube URL',
                },
                {
                    name: 'tiktok',
                    type: 'text',
                    label: 'TikTok URL',
                },
                {
                    name: 'threads',
                    type: 'text',
                    label: 'Threads URL',
                },
                {
                    name: 'github',
                    type: 'text',
                    label: 'GitHub URL',
                },
                {
                    name: 'discord',
                    type: 'text',
                    label: 'Discord URL',
                },
                {
                    name: 'whatsapp',
                    type: 'text',
                    label: 'WhatsApp URL',
                },
                {
                    name: 'telegram',
                    type: 'text',
                    label: 'Telegram URL',
                },
            ],
        },
    ],
}


