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
