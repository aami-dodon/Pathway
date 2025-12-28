import { Payload } from 'payload'

export async function seedContactSubmissions(payload: Payload) {
    console.log('   Seeding contact submissions...')

    const submissions = [
        {
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.j@example.com',
            message: 'I am interested in the Advanced React course. Are there any prerequisites for it?',
        },
        {
            firstName: 'Michael',
            lastName: 'Chen',
            email: 'm.chen@techcorp.com',
            message: 'Do you offer corporate training packages for teams? We have about 10 developers who want to learn Next.js.',
        },
        {
            firstName: 'Emma',
            lastName: 'Wilson',
            email: 'emma.coach@outlook.com',
            message: 'I am an executive coach with 15 years of experience. How can I apply to become a coach on your platform?',
        },
        {
            firstName: 'David',
            lastName: 'Rodriguez',
            email: 'david.r@freelance.io',
            message: 'Is it possible to get a certificate after completing a course? I need it for my LinkedIn profile.',
        },
    ]

    const createdSubmissions = []

    for (const submission of submissions) {
        // Check if submission already exists (by email and message to avoid duplicates in seeds)
        const { docs: existing } = await payload.find({
            collection: 'contact-submissions',
            where: {
                and: [
                    { email: { equals: submission.email } },
                    { message: { equals: submission.message } },
                ],
            },
        })

        if (existing.length === 0) {
            const doc = await payload.create({
                collection: 'contact-submissions',
                data: submission,
            })
            createdSubmissions.push(doc)
        } else {
            createdSubmissions.push(existing[0])
        }
    }

    return createdSubmissions
}
