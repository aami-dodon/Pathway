
import { Resend } from 'resend'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const envPath = path.resolve(dirname, '../../.env')
dotenv.config({ path: envPath })

const resend = new Resend(process.env.RESEND_API_KEY)

async function checkTemplate() {
    try {
        // 1. List to get ID
        const list = await resend.get('/templates') as any
        const templates = list.data?.data || list.data || list
        const welcome = templates.find((t: any) => t.name === 'welcome-email')

        if (!welcome) {
            console.log('Welcome email not found')
            return
        }

        console.log('Template ID:', welcome.id)

        // 2. Get details
        const details = await resend.get(`/templates/${welcome.id}`) as any
        console.log('--- Template Details ---')
        console.log('Name:', details.data.name)
        console.log('Status:', details.data.status) // Assuming status field exists?
        console.log('Variables:', JSON.stringify(details.data.variables, null, 2))

        // Check HTML content for logo_html
        const html = details.data.html
        const hasLogoVar = html.includes('logo_html')
        console.log('HTML contains "logo_html":', hasLogoVar)
        console.log('Snippet:', html.substring(0, 500))

    } catch (e: any) {
        console.error(e)
    }
}

checkTemplate()
