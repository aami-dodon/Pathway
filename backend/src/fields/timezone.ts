import { Field } from 'payload'

const timezones = [
    { label: 'UTC', value: 'UTC' },
    ...Intl.supportedValuesOf('timeZone').map((tz) => ({
        label: tz.replace(/_/g, ' '),
        value: tz,
    })),
]

type TimezoneFieldOptions = {
    name?: string
    required?: boolean
    defaultValue?: string
    label?: string
    admin?: {
        description?: string
        position?: 'sidebar'
    }
}

export const timezoneField = (options: TimezoneFieldOptions = {}): Field => {
    const {
        name = 'timezone',
        required = true,
        defaultValue = 'UTC',
        label,
        admin,
    } = options

    return {
        name,
        type: 'select',
        required,
        defaultValue,
        label,
        options: timezones,
        admin: {
            description: admin?.description || 'Select a timezone',
            position: admin?.position,
        },
    }
}
