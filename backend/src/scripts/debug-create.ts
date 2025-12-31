
import { Resend } from 'resend'
import dotenv from 'dotenv'
dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY)

async function debugCreate() {
    console.log('--- Debugging Create Template ---')
    try {
        const payload = {
            name: 'debug-template-v3',
            subject: 'Debug Subject',
            html: '<h1>Debug</h1>'
        }
        console.log('Creating template:', payload)
        const response = await resend.post('/templates', payload) as any
        console.log('Response:', response)

        if (response.data && response.data.id) {
            console.log('Fetching created template...')
            const t = await resend.get(`/templates/${response.data.id}`) as any
            console.log('Fetched Template:', t)
        }
    } catch (e: any) {
        console.error('Create failed:', e.response?.data || e.message)
    }
}
debugCreate()
