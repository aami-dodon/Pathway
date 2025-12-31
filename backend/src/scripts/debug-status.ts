
import { Resend } from 'resend'
import dotenv from 'dotenv'
dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY)

async function debugStatus() {
    console.log('--- Debugging Template Status ---')
    try {
        const list = await resend.get('/templates?limit=100') as any
        const tmpls = (list && list.data && list.data.data) ? list.data.data : list
        const t = tmpls.find((x: any) => x.name === 'welcome-email')

        if (t) {
            console.log('Template:', t)
            console.log('Status:', t.status)
        } else {
            console.log('Template not found')
        }
    } catch (e) { console.error(e) }
}
debugStatus()
