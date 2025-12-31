
import { Resend } from 'resend'
import dotenv from 'dotenv'
dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY)
async function test() {
    try {
        console.log('Listing templates via generic get...')
        const response = await resend.get('/templates')
        console.log('Response:', response)
    } catch (e) {
        console.error('Error:', e)
    }
}
test()
