
interface IcsOptions {
    title: string
    description?: string
    start: Date
    duration: number // in minutes
    url?: string
    location?: string
    organizer?: {
        name: string
        email: string
    }
}

export function generateICS(options: IcsOptions): string {
    const { title, description, start, duration, url, location, organizer } = options

    const end = new Date(start.getTime() + duration * 60000)

    const formatDate = (date: Date): string => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const now = formatDate(new Date())
    const startStr = formatDate(start)
    const endStr = formatDate(end)
    const uid = `${start.getTime()}-${Math.random().toString(36).substr(2, 9)}@pathway.com`

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Pathway//Coaching Session//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:REQUEST',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${now}`,
        `DTSTART:${startStr}`,
        `DTEND:${endStr}`,
        `SUMMARY:${title}`,
        description ? `DESCRIPTION:${description}` : '',
        url ? `URL:${url}` : '',
        location ? `LOCATION:${location}` : '',
        organizer ? `ORGANIZER;CN=${organizer.name}:mailto:${organizer.email}` : '',
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'END:VEVENT',
        'END:VCALENDAR',
    ]

    return lines.filter(Boolean).join('\r\n')
}
