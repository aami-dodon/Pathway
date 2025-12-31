import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
    if (!_resend) {
        if (!process.env.RESEND_API_KEY) {
            console.warn('RESEND_API_KEY is missing. Resend operations will fail.')
        }
        _resend = new Resend(process.env.RESEND_API_KEY)
    }
    return _resend
}

// The ID of the audience to sync contacts to.
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || '2754c70c-775f-4bb1-bee5-04629d8c0cac'

interface UpsertContactParams {
    email: string
    firstName?: string
    lastName?: string
    unsubscribed?: boolean
    audienceId?: string
    data?: Record<string, any>
}

export class ResendContactService {
    /**
     * Create or update a contact in Resend
     */
    static async upsertContact(params: UpsertContactParams) {
        try {
            const { email, firstName, lastName, unsubscribed, audienceId, data } = params

            // Construct payload with only defined values to avoid issues with undefined properties
            // appearing in JSON
            const payload: any = {
                email,
                unsubscribed,
            }

            if (firstName) payload.firstName = firstName
            if (lastName) payload.lastName = lastName

            // Add custom data properties
            if (data) {
                // Flatten data or keep as object? Resend expects "data": { key: value }
                // SDK handles this structure.
                payload.data = data
            }

            // Only add audienceId if explicitly provided or valid env var exists
            const activeAudienceId = audienceId || AUDIENCE_ID
            if (activeAudienceId) {
                payload.audienceId = activeAudienceId
            }

            // First, try to create the contact
            const { data: result, error } = await getResend().contacts.create(payload)

            if (error) {
                // If the contact already exists or conflict, try update.
                if ((error as any).name === 'conflict' || error.message?.includes('already exists')) {
                    return await this.updateContact(params)
                }

                console.error('Failed to create Resend contact. Payload:', JSON.stringify(payload), 'Error:', error)
                return null
            }

            return result
        } catch (err) {
            console.error('Error in ResendContactService.upsertContact:', err)
            return null
        }
    }

    static async updateContact(params: UpsertContactParams) {
        try {
            const { email, firstName, lastName, unsubscribed, audienceId, data } = params

            const payload: any = {
                email,
                unsubscribed,
            }
            if (firstName) payload.firstName = firstName
            if (lastName) payload.lastName = lastName

            if (data) {
                payload.data = data
            }

            const activeAudienceId = audienceId || AUDIENCE_ID
            if (activeAudienceId) {
                payload.audienceId = activeAudienceId
            }

            const { data: result, error } = await getResend().contacts.update(payload)

            if (error) {
                console.error('Failed to update Resend contact. Payload:', JSON.stringify(payload), 'Error:', error)
                return null
            }
            return result
        } catch (err) {
            console.error('Error in ResendContactService.updateContact:', err)
            return null
        }
    }

    /**
     * Delete a contact from Resend by email
     */
    static async deleteContact(email: string, audienceId?: string) {
        try {
            const payload: any = { email }
            const activeAudienceId = audienceId || AUDIENCE_ID
            if (activeAudienceId) {
                payload.audienceId = activeAudienceId
            }

            const { error } = await getResend().contacts.remove(payload)

            if (error) {
                console.error('Failed to delete Resend contact:', error)
                return false
            }
            return true
        } catch (err) {
            console.error('Error in ResendContactService.deleteContact:', err)
            return false
        }
    }

    /**
     * Create a segment in Resend (using raw API as SDK support varies)
     */
    static async createSegment(name: string, query: object, audienceId?: string) {
        try {
            const activeAudienceId = audienceId || AUDIENCE_ID
            if (!activeAudienceId) throw new Error('Audience ID required for segments')

            // Check if segment exists first? (Implementation detail: Resend allows dupes? usually no)
            // We'll just try to create.

            /*
               POST /audiences/:id/segments
               { "name": "...", "query": { ... } }
            */

            // Since SDK might not have it, we use fetch
            const response = await fetch(`https://api.resend.com/audiences/${activeAudienceId}/segments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    query
                })
            })

            if (!response.ok) {
                const err = await response.json()
                console.error(`Failed to create segment "${name}":`, err)
                return null
            }

            const data = await response.json()
            return data
        } catch (err) {
            console.error('Error in ResendContactService.createSegment:', err)
            return null
        }
    }
}
