
const ZOOM_API_BASE = 'https://api.zoom.us/v2'

interface ZoomMeetingResult {
    joinUrl: string
    meetingId: string
    password?: string
}

export const ZoomService = {
    /**
     * Get Server-to-Server OAuth Access Token
     */
    getToken: async (): Promise<string | null> => {
        const accountId = process.env.ZOOM_ACCOUNT_ID
        const clientId = process.env.ZOOM_CLIENT_ID
        const clientSecret = process.env.ZOOM_CLIENT_SECRET

        if (!accountId || !clientId || !clientSecret) {
            console.warn('⚠️ Zoom: Missing credentials (ACCOUNT_ID, CLIENT_ID, or CLIENT_SECRET).')
            return null
        }

        try {
            const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
            const params = new URLSearchParams({
                grant_type: 'account_credentials',
                account_id: accountId,
            })

            const response = await fetch(`https://zoom.us/oauth/token?${params.toString()}`, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            })

            if (!response.ok) {
                const error = await response.text()
                console.error('❌ Zoom Token Error:', error)
                return null
            }

            const data = await response.json()
            return data.access_token
        } catch (error) {
            console.error('❌ Zoom Token Exception:', error)
            return null
        }
    },

    /**
     * Create a Zoom Meeting
     */
    createMeeting: async ({
        topic,
        startTime,
        durationMinutes,
        description,
    }: {
        topic: string
        startTime: string | Date
        durationMinutes: number
        description?: string
    }): Promise<ZoomMeetingResult | null> => {
        const token = await ZoomService.getToken()
        if (!token) return null

        try {
            const userId = process.env.ZOOM_USER_ID || 'me'

            const response = await fetch(`${ZOOM_API_BASE}/users/${userId}/meetings`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic,
                    type: 2, // Scheduled meeting
                    start_time: new Date(startTime).toISOString(),
                    duration: durationMinutes,
                    agenda: description,
                    settings: {
                        host_video: true,
                        participant_video: true,
                        // Strict Gating: Host MUST start meeting
                        join_before_host: false,
                        mute_upon_entry: true,
                        waiting_room: true,
                        embargo: true,
                    },
                }),
            })

            if (!response.ok) {
                const error = await response.text()
                console.error('❌ Zoom Create Meeting Error:', error)
                return null
            }

            const data = await response.json()

            return {
                joinUrl: data.join_url,
                meetingId: String(data.id),
                password: data.password,
            }

        } catch (error) {
            console.error('❌ Zoom API Exception:', error)
            return null
        }
    },
}
