
import { getPayload } from 'payload'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { EmailService } from '../services/emailService'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const envPath = path.resolve(dirname, '../../.env')
dotenv.config({ path: envPath })

async function verifyMigration() {
    const { default: config } = await import('../payload.config')
    const payload = await getPayload({ config })

    console.log('--- Verifying Email Service Migration ---')

    try {
        console.log('Sending test email (Welcome Email)...')
        // Using a test email address
        // 3. Send test email
        const sent = await EmailService.send(payload, {
            to: 'sayantan.kumar.basu@gmail.com',
            templateSlug: 'welcome-email',
            data: {
                role: 'Test User',
                // Explicitly providing these shouldn't be necessary if my service handles it,
                // but let's leave them out to test the service's dynamic resolution.
            },
            subject: 'Verification: Resend Template Migration',
        })

        if (sent) {
            console.log('Email sent successfully!')
        } else {
            console.error('Email failed to send.')
            process.exit(1)
        }

    } catch (error) {
        console.error('Verification failed:', error)
        process.exit(1)
    } finally {
        process.exit(0)
    }
}

verifyMigration()
