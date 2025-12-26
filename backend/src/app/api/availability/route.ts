import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '../../../payload.config'

// CORS origin from environment variable, defaults to '*' for development
const corsOrigin = process.env.CORS_ORIGINS?.split(',')[0]?.trim() || '*'

const corsHeaders = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export const OPTIONS = async () => {
    return NextResponse.json({}, { headers: corsHeaders })
}

export const GET = async (req: NextRequest) => {
    const payload = await getPayload({ config })
    const searchParams = req.nextUrl.searchParams
    const coachId = searchParams.get('coach')
    const fromStr = searchParams.get('from')
    const toStr = searchParams.get('to')

    if (!coachId || !fromStr || !toStr) {
        return NextResponse.json({ error: 'Missing coach, from, or to parameters' }, { status: 400, headers: corsHeaders })
    }

    try {
        const fromDate = new Date(fromStr)
        const toDate = new Date(toStr)

        // 1. Fetch Coach Profile
        const coachProfile = await payload.findByID({
            collection: 'coach-profiles',
            id: coachId,
        })

        if (!coachProfile || !(coachProfile as any).availability) {
            return NextResponse.json({ slots: [] }, { headers: corsHeaders })
        }

        const availability = (coachProfile as any).availability || []
        const timezone = (coachProfile as any).timezone || 'UTC'

        // 2. Fetch Existing Sessions
        const sessions = await payload.find({
            collection: 'coaching-sessions',
            where: {
                and: [
                    { coach: { equals: coachId } },
                    { status: { not_equals: 'cancelled' } },
                    { scheduledAt: { greater_than_equal: fromDate.toISOString() } },
                    // Fetch a bit beyond to catch overlaps
                    { scheduledAt: { less_than_equal: new Date(toDate.getTime() + 86400000).toISOString() } },
                ]
            },
            limit: 500,
        })

        const existingSlots = sessions.docs.map(doc => {
            const start = new Date(doc.scheduledAt).getTime()
            const duration = doc.duration || 30
            return {
                start,
                end: start + (duration * 60000)
            }
        })

        // 3. Generate Slots
        const slots: { start: string; end: string }[] = []
        const current = new Date(fromDate)
        const GAP_MS = 15 * 60000
        const SLOT_DURATION_MS = 30 * 60000

        // Iterate per day
        while (current <= toDate) {
            // Check if day is available in profile
            const dayCodeMap: Record<string, string> = {
                Monday: 'mon', Tuesday: 'tue', Wednesday: 'wed', Thursday: 'thu', Friday: 'fri', Saturday: 'sat', Sunday: 'sun'
            }

            // Get day in Coach's timezone
            const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: timezone }).format(current)
            const dayCode = dayCodeMap[dayName]

            const daySlots = availability.filter((a: any) => a.day === dayCode)

            for (const slotTemplate of daySlots) {
                // Parse "09:00" -> Date object for THIS specific day
                const [h, m] = slotTemplate.startTime.split(':')
                const [endH, endM] = slotTemplate.endTime.split(':')

                // Construct slot start/end in Coach's Timezone
                // This is tricky without a library. 
                // We construct an ISO string based on current day and force the time?
                // Or loop minutes.
                // Simple approach:
                // Construct string "YYYY-MM-DDTHH:mm:00" (Coach Local)
                // Convert to UTC.

                // Get YYYY-MM-DD of 'current' in Coach Timezone
                const parts = new Intl.DateTimeFormat('en-US', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    timeZone: timezone
                }).formatToParts(current)
                const y = parts.find(p => p.type === 'year')?.value
                const mo = parts.find(p => p.type === 'month')?.value
                const d = parts.find(p => p.type === 'day')?.value

                const dateStr = `${y}-${mo}-${d}`

                // Create Date from String + Timezone? 
                // JS Date is dumb. 
                // We'll use a hack: Create ISO string with Offset? No, we don't know offset easily.
                // We'll accept that precise timezone math without date-fns-tz is hard.
                // MVP: Assume 'current' iteration is synced enough.

                // Better: Use `new Date(string)`?
                // Let's rely on the fact that input `from` and `to` and `current` are UTC.
                // And we have `timezone`.

                // Helper: Create UTC Date from Coach Wall Time
                // Not easy.

                // Alternative: Client passes `timezone`? No.

                // Let's assume for MVP: 
                // 1. Generate UTC slots for 00:00 to 23:59.
                // 2. Convert each slot to Coach Timezone.
                // 3. Match against availability (HH:mm).
                // 4. If Match, add to list.

                const dayStart = new Date(current)
                dayStart.setUTCHours(0, 0, 0, 0)

                // Loop every 15 minutes? 30 mins?
                // Slot step 30 mins? 
                // User said "User will select a day and get available slots".
                // Usually slots start every 30 mins or 15 mins?
                // Assuming 30 min increments aligned to Top of Hour.

                for (let min = 0; min < 24 * 60; min += 30) {
                    const slotStart = new Date(dayStart.getTime() + min * 60000)
                    const slotEnd = new Date(slotStart.getTime() + SLOT_DURATION_MS)

                    // 1. Check Availability (Coach Timezone)
                    const sTimeStr = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone }).format(slotStart)
                    const [sh, sm] = sTimeStr.split(':')
                    const normStartTime = `${sh.padStart(2, '0')}:${sm}`

                    const eTimeStr = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone }).format(slotEnd)
                    const [eh, em] = eTimeStr.split(':')
                    const normEndTime = `${eh.padStart(2, '0')}:${em}`

                    // Check if this slot fits in ANY availability window
                    const fits = daySlots.some((ds: any) => {
                        return normStartTime >= ds.startTime && normEndTime <= ds.endTime
                    })

                    if (!fits) continue

                    // 2. Check Existing Bookings (Gap)
                    const isBlocked = existingSlots.some(existing => {
                        // Conflict if: NewStart < OldEnd + Gap AND NewEnd > OldStart - Gap
                        const busyStart = existing.start - GAP_MS
                        const busyEnd = existing.end + GAP_MS

                        return (slotStart.getTime() < busyEnd) && (slotEnd.getTime() > busyStart)
                    })

                    if (!isBlocked) {
                        slots.push({
                            start: slotStart.toISOString(),
                            end: slotEnd.toISOString()
                        })
                    }
                }
            }

            // Next day
            current.setDate(current.getDate() + 1)
        }

        return NextResponse.json({ slots }, { headers: corsHeaders })

    } catch (error) {
        console.error('Availability Error:', error)
        return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500, headers: corsHeaders })
    }
}
