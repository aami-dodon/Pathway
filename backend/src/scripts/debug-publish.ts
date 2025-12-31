
import { Resend } from 'resend'
import dotenv from 'dotenv'
dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY)

async function debugPublish() {
    console.log('--- Debugging Publish Template ---')
    // Get the debug template ID from previous run (or find it)
    let templateId = ''
    try {
        const list = await resend.get('/templates') as any
        const tmpls = (list && list.data && list.data.data) ? list.data.data : list
        const t = tmpls.find((x: any) => x.name === 'debug-template-v3')
        if (t) templateId = t.id
    } catch (e) { console.error(e) }

    if (!templateId) {
        console.log('Using welcome-email as target')
        try {
            const list = await resend.get('/templates?limit=100') as any
            const tmpls = (list && list.data && list.data.data) ? list.data.data : list
            const t = tmpls.find((x: any) => x.name === 'welcome-email')
            if (t) templateId = t.id
        } catch (e) { console.error(e) }
    }

    if (!templateId) {
        console.error('No template found')
        return
    }

    console.log('Target Template ID:', templateId)

    try {
        console.log('Attempting to POST /publish...')
        // Try precise endpoint
        const r = await resend.post(`/templates/${templateId}/publish`, {}) as any
        console.log('Result:', r)
    } catch (e: any) {
        console.error('Publish failed:', e.response?.data || e.message)
    }
}
debugPublish()
