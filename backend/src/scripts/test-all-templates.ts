
import { getPayload } from 'payload'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { EmailService } from '../services/emailService'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const envPath = path.resolve(dirname, '../../.env')
dotenv.config({ path: envPath })

const TEST_EMAIL = 'sayantan.kumar.basu@gmail.com'

interface TemplateTest {
    slug: string
    name: string
    data: Record<string, string>
}

const templates: TemplateTest[] = [
    {
        slug: 'welcome-email',
        name: 'Welcome Email',
        data: { role: 'Student' }
    },
    {
        slug: 'contact-acknowledgment',
        name: 'Contact Form Acknowledgment',
        data: { firstName: 'John', message: 'This is a test message from the contact form.' }
    },
    {
        slug: 'admin-contact-notification',
        name: 'Admin Contact Notification',
        data: { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', message: 'User inquiry about services.' }
    },
    {
        slug: 'newsletter-welcome',
        name: 'Newsletter Welcome',
        data: {}
    },
    {
        slug: 'booking-confirmation',
        name: 'Booking Confirmation (Student)',
        data: { bookerName: 'Alice', sessionTitle: '1:1 Coaching Session', coachName: 'Dr. Smith', scheduledAt: 'Jan 5, 2025 at 3:00 PM', duration: '60' }
    },
    {
        slug: 'booking-confirmed',
        name: 'Booking Confirmed',
        data: { bookerName: 'Alice', sessionTitle: '1:1 Coaching Session', scheduledAt: 'Jan 5, 2025 at 3:00 PM', meetingLink: 'https://zoom.us/j/12345' }
    },
    {
        slug: 'booking-coach-notification',
        name: 'Booking Coach Notification',
        data: { coachName: 'Dr. Smith', bookerName: 'Alice', sessionTitle: '1:1 Coaching Session', scheduledAt: 'Jan 5, 2025 at 3:00 PM', topic: 'Career guidance' }
    },
    {
        slug: 'booking-cancellation',
        name: 'Booking Cancellation',
        data: { recipientName: 'Alice', sessionTitle: '1:1 Coaching Session', scheduledAt: 'Jan 5, 2025 at 3:00 PM', reason: 'Coach unavailable due to emergency.' }
    },
    {
        slug: 'course-enrollment',
        name: 'Course Enrollment',
        data: { subscriberName: 'Bob', courseTitle: 'Introduction to Data Science', courseSlug: 'intro-data-science' }
    },
    {
        slug: 'course-completion',
        name: 'Course Completion',
        data: { subscriberName: 'Bob', courseTitle: 'Introduction to Data Science' }
    }
]

async function testAllTemplates() {
    const { default: config } = await import('../payload.config')
    const payload = await getPayload({ config })

    console.log('=== Testing All Email Templates ===\n')
    console.log(`Sending to: ${TEST_EMAIL}`)
    console.log(`Total templates: ${templates.length}\n`)

    let passed = 0
    let failed = 0

    for (const template of templates) {
        console.log(`[${passed + failed + 1}/${templates.length}] Testing: ${template.name}...`)

        try {
            const result = await EmailService.send(payload, {
                to: TEST_EMAIL,
                templateSlug: template.slug,
                data: template.data,
                subject: `[TEST] ${template.name}`,
            })

            if (result) {
                console.log(`   ✅ PASSED\n`)
                passed++
            } else {
                console.log(`   ❌ FAILED (send returned false)\n`)
                failed++
            }
        } catch (error: any) {
            console.log(`   ❌ FAILED: ${error.message}\n`)
            failed++
        }

        // Rate limit delay between sends
        await new Promise(r => setTimeout(r, 1500))
    }

    console.log('=== Test Summary ===')
    console.log(`✅ Passed: ${passed}/${templates.length}`)
    console.log(`❌ Failed: ${failed}/${templates.length}`)

    if (failed > 0) {
        process.exit(1)
    }
    process.exit(0)
}

testAllTemplates().catch(console.error)
