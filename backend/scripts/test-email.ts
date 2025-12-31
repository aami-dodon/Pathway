import { getPayload } from 'payload'
import config from '../src/payload.config'
import { EmailService } from '../src/services/emailService'

async function run() {
    console.log('--- Starting Test Email Script ---')

    const payload = await getPayload({ config })
    const testEmail = process.env.ADMIN_EMAIL || 'test@example.com'

    console.log(`Sending test 'welcome-email' to ${testEmail}...`)

    const success = await EmailService.send(payload, {
        to: testEmail,
        templateSlug: 'welcome-email',
        data: {
            role: 'subscriber'
        }
    })

    if (success) {
        console.log('✅ Email sent successfully!')
        console.log('Check your inbox (or the logs above if you added any).')
        console.log('The footer should now contain ONLY the active social links from Site Settings.')
    } else {
        console.error('❌ Failed to send email.')
    }

    process.exit(success ? 0 : 1)
}

run().catch(error => {
    console.error('Script failed:', error)
    process.exit(1)
})
