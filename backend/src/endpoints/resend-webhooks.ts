import type { PayloadHandler } from 'payload'
import { Webhook } from 'svix'

export const resendWebhookHandler: PayloadHandler = async (req: any) => {
    try {
        const payload = await req.json ? req.json() : req.payload // Fallback if req.json() not available but usually it is in v3
        // Actually req.json() is standard Response method, but Request object also has it in Fetch API.
        // Payload v3 passes Web Request.

        const headers = req.headers

        const secret = process.env.RESEND_WEBHOOK_SECRET

        // Verify signature if secret is present
        if (secret) {
            const wh = new Webhook(secret);
            const svix_id = headers.get("svix-id");
            const svix_timestamp = headers.get("svix-timestamp");
            const svix_signature = headers.get("svix-signature");

            if (!svix_id || !svix_timestamp || !svix_signature) {
                return new Response('Error occured -- no svix headers', {
                    status: 400,
                });
            }

            try {
                // We need the raw body for verification, but req.json() consumes it.
                // We should clone or use text() first?
                // svix requires the raw string body.
                // Re-reading req usually fails if body used.
                // Let's use text() first.
            } catch (e) { /* ignore */ }
        }

        // Revised approach for body reading
        const textBody = await req.text() // Consume body as text

        if (secret) {
            const wh = new Webhook(secret);
            const svix_id = headers.get("svix-id");
            const svix_timestamp = headers.get("svix-timestamp");
            const svix_signature = headers.get("svix-signature");

            if (!svix_id || !svix_timestamp || !svix_signature) {
                return new Response('Error occured -- no svix headers', { status: 400 });
            }

            try {
                wh.verify(textBody, {
                    "svix-id": svix_id,
                    "svix-timestamp": svix_timestamp,
                    "svix-signature": svix_signature,
                });
            } catch (err) {
                return new Response('Error occured: Invalid Signature', { status: 400 });
            }
        } else {
            console.warn('⚠️ RESEND_WEBHOOK_SECRET not set. Skipping signature verification.')
        }

        const payloadJson = JSON.parse(textBody)
        const type = payloadJson.type
        const data = payloadJson.data || {}
        const { email } = data

        // Check for specific unsubscribe event OR contact update with unsubscribed status
        const isUnsubscribeEvent = type === 'contact.unsubscribed' || type === 'email.complained'
        const isContactUpdateUnsubscribe = type === 'contact.updated' && data.unsubscribed === true

        if ((isUnsubscribeEvent || isContactUpdateUnsubscribe) && email) {
            console.log(`Received unsubscribe/opt-out webhook (${type}) for ${email}`)

            // 1. Update User if exists
            try {
                const users = await req.payload.find({
                    collection: 'users',
                    where: { email: { equals: email } },
                    limit: 1,
                })

                if (users.docs.length > 0) {
                    const user = users.docs[0]
                    await req.payload.update({
                        collection: 'users',
                        id: user.id,
                        data: { unsubscribed: true },
                        context: { preventResendSync: true }
                    })
                    console.log(`Marked user ${email} as unsubscribed`)
                }
            } catch (err) {
                console.error('Error updating user from webhook:', err)
            }

            // 2. Update NewsletterSubscriber if exists
            try {
                const subscribers = await req.payload.find({
                    collection: 'newsletter-subscribers',
                    where: { email: { equals: email } },
                    limit: 1,
                })

                if (subscribers.docs.length > 0) {
                    const sub = subscribers.docs[0]
                    await req.payload.update({
                        collection: 'newsletter-subscribers',
                        id: sub.id,
                        data: { active: false },
                        context: { preventResendSync: true }
                    })
                    console.log(`Marked subscriber ${email} as inactive`)
                }
            } catch (err) {
                console.error('Error updating subscriber from webhook:', err)
            }
        }

        return new Response('Webhook received', { status: 200 })
    } catch (err) {
        console.error('Error in Resend webhook:', err)
        return new Response('Internal Server Error', { status: 500 })
    }
}
