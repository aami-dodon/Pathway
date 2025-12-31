
import { Resend } from 'resend'
import dotenv from 'dotenv'
dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY)

async function debugSend() {
    console.log('--- Debugging Resend Send ---')

    // We need to fetch a valid template ID first or use name if supported
    // But we saw "Expected object" error when using string name.

    // Let's first list templates to get a valid ID/Name pair
    // SKIP FINDING to just test A and D
    // let templateId = ''
    /*
    try {
        const list = await resend.get('/templates') as any
        const tmpls = (list && list.data && list.data.data) ? list.data.data : list
        if (tmpls && tmpls.length > 0) {
            const t = tmpls.find((x: any) => x.name === 'welcome-email')
            if (t) templateId = t.id
            console.log('Found template ID:', templateId)
        }
    } catch (e) {
        console.error('List failed:', e)
    }
    */
    const templateId = 'placeholder-id-if-needed'

    // if (!templateId) {
    //     console.error('No template found to test with')
    //     return
    // }

    const payloadBase = {
        from: 'Pathway <anirban@preppathway.com>',
        to: ['sayantan.kumar.basu@gmail.com'], // Using safe email
        subject: 'Debug Send',
        data: { role: 'Debug User' }
    }

    // Test 1: template as string name
    /*
    try {
        console.log('Test 1: template = string name')
        await resend.post('/emails', { ...payloadBase, template: 'welcome-email' })
        console.log('Test 1 Success!')
    } catch (e: any) {
        console.log('Test 1 Failed:', e.response?.data || e.message)
    }
    */

    // Test 2: template as object with name
    /*
    try {
        console.log('Test 2: template = { name: ... }')
        await resend.post('/emails', { ...payloadBase, template: { name: 'welcome-email' } })
        console.log('Test 2 Success!')
    } catch (e: any) {
        console.log('Test 2 Failed:', e.response?.data || e.message)
    }
    */

    // Test 3: template as object with id
    /*
    try {
        console.log('Test 3: template = { id: ... }')
        await resend.post('/emails', { ...payloadBase, template: { id: templateId } })
        console.log('Test 3 Success!')
    } catch (e: any) {
         console.log('Test 3 Failed:', e.response?.data || e.message)
    }
    */

    // Sequentially run tests

    console.log('Running tests...')

    // Test A: String Name (repro)
    /*
    try {
        console.log('\n--- Test A: template = "welcome-email" ---')
        const r = await resend.post('/emails', { ...payloadBase, subject: 'Test A', template: 'welcome-email' })
        console.log('Success:', r)
    } catch (e: any) {
        console.log('Failed:', e.response?.data || e.message)
    }
    */

    // Test B: ID string
    /*
    try {
        console.log('\n--- Test B: template = UUID ---')
        const r = await resend.post('/emails', { ...payloadBase, subject: 'Test B', template: templateId })
        console.log('Success:', r)
    } catch (e: any) {
        console.log('Failed:', e.response?.data || e.message)
    }
    */

    // Test C: Object ID
    /*
    try {
        console.log('\n--- Test C: template = { id: UUID } ---')
        const r = await resend.post('/emails', { ...payloadBase, subject: 'Test C', template: { id: templateId } })
        console.log('Success:', r) // If this works, that's it
    } catch (e: any) {
        console.log('Failed:', e.response?.data || e.message)
    }
    */

    // Test D: Object Payload with variables
    console.log('\n--- Test D: Explicit Valid Payload ---')
    try {
        const r = await resend.post('/emails', {
            from: 'Pathway <anirban@preppathway.com>',
            to: ['sayantan.kumar.basu@gmail.com'],
            subject: 'Debug Send D',
            template: { id: 'f6db0a76-31c6-40d0-869d-4436feee93b9' },
            data: {
                role: 'Tester',
                logo_html: 'legacy',
                social_links_html: 'legacy',
                app_logo_html: '<h1>App Logo</h1>',
                app_social_links_html: 'Links'
            }
        }) as any
        console.log('Success:', r)
    } catch (e: any) {
        console.log('Error D:', e.response?.data || e.message)
    }

    // Test D: Object Name
    /*
    try {
        console.log('\n--- Test D: template = { name: "welcome-email" } ---')
        const r = await resend.post('/emails', { ...payloadBase, subject: 'Test D', template: { name: 'welcome-email' } })
        console.log('Success:', r)
    } catch (e: any) {
        console.log('Failed:', e.response?.data || e.message)
    }
    */
}

debugSend()
