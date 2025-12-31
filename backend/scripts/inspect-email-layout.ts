import { getPayload } from 'payload'
import config from '../src/payload.config'

async function run() {
    const payload = await getPayload({ config })
    const layout = await payload.findGlobal({
        slug: 'email-layout',
    })
    console.log('EMAIL LAYOUT:', JSON.stringify(layout, null, 2))
    process.exit(0)
}

run().catch(console.error)
