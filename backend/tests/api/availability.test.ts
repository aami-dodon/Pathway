import { beforeAll, describe, expect, it } from 'vitest'
import {
    apiFetch,
    createCoachProfile,
    createCoachingSession,
    createUser,
    isoDateOnly,
    loginAsAdmin,
    randomEmail,
} from './helpers'

const nextUtcWeekday = (weekday: number) => {
    const date = new Date()
    const current = date.getUTCDay()
    const diff = (weekday - current + 7) % 7
    date.setUTCDate(date.getUTCDate() + diff)
    return date
}

describe('Availability API', () => {
    let adminToken: string

    beforeAll(async () => {
        const adminSession = await loginAsAdmin()
        adminToken = adminSession.token
    })

    it('returns 400 when required params are missing', async () => {
        const response = await apiFetch('/api/availability')
        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data).toHaveProperty('error')
    })

    describe('with a coach profile that has availability', () => {
        let coachId: string
        let targetDate: string

        beforeAll(async () => {
            const user = await createUser(randomEmail('coach'), '!TestPassword123')
            const monday = nextUtcWeekday(1)
            targetDate = isoDateOnly(monday)

            const coach = await createCoachProfile({
                token: adminToken,
                userId: user.id || user._id,
                displayName: 'Test Coach',
                timezone: 'UTC',
                availability: [
                    {
                        day: 'mon',
                        startTime: '09:00',
                        endTime: '10:00',
                    },
                ],
            })

            coachId = coach.id || coach._id
        })

        it('returns available slots for the configured window', async () => {
            const response = await apiFetch(
                `/api/availability?coach=${coachId}&from=${targetDate}&to=${targetDate}`
            )

            expect(response.status).toBe(200)
            const data = await response.json()
            expect(data).toHaveProperty('slots')
            expect(Array.isArray(data.slots)).toBe(true)
            expect(data.slots.length).toBeGreaterThanOrEqual(2)

            const starts = data.slots.map((slot: any) => slot.start)
            expect(starts.some((start: string) => start.includes('T09:00:00.000Z'))).toBe(true)
            expect(starts.some((start: string) => start.includes('T09:30:00.000Z'))).toBe(true)
        })

        it('excludes slots that overlap existing sessions (with 15-minute gap)', async () => {
            const bookingStart = `${targetDate}T09:00:00.000Z`
            await createCoachingSession({
                coachId,
                scheduledAt: bookingStart,
                duration: 30,
                bookerEmail: randomEmail('booker'),
            })

            const response = await apiFetch(
                `/api/availability?coach=${coachId}&from=${targetDate}&to=${targetDate}`
            )

            expect(response.status).toBe(200)
            const data = await response.json()
            const starts = data.slots.map((slot: any) => slot.start)
            expect(starts.some((start: string) => start.includes('T09:00:00.000Z'))).toBe(false)
            expect(starts.some((start: string) => start.includes('T09:30:00.000Z'))).toBe(false)
        })
    })
})

