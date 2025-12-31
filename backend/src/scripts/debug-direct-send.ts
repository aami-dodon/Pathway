
import { Resend } from 'resend'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const envPath = path.resolve(dirname, '../../.env')
dotenv.config({ path: envPath })

const resend = new Resend(process.env.RESEND_API_KEY)

async function testDirect() {
    console.log('--- Direct Template Send Test ---')

    // Test 1: Using template ID directly
    try {
        console.log('\nTest 1: template.id = actual UUID')
        const r = await resend.post('/emails', {
            from: 'Pathway <anirban@preppathway.com>',
            to: ['sayantan.kumar.basu@gmail.com'],
            subject: 'Direct Test with Template ID',
            template: { id: 'ef58df93-149d-433a-baf2-3cb1b7779af4' },
            data: { role: 'Direct Test User' }
        }) as any
        console.log('Result:', r)
    } catch (e: any) {
        console.log('Error:', e)
    }

    // Test 2: Using emails.send with scheduled_at trick to force template
    try {
        console.log('\nTest 2: Using resend.emails.send')
        const r = await resend.emails.send({
            from: 'Pathway <anirban@preppathway.com>',
            to: 'sayantan.kumar.basu@gmail.com',
            subject: 'Direct Test 2',
            html: '<p>Fallback</p>', // Required but ignored if template works
        } as any)
        console.log('Result:', r)
    } catch (e: any) {
        console.log('Error:', e)
    }
}

testDirect()
