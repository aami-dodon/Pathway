import { describe, it, expect } from 'vitest'
import { apiFetch } from './helpers'

describe('LMS API', () => {
    it('should fetch courses', async () => {
        const response = await apiFetch('/api/courses')
        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data).toHaveProperty('docs')
        expect(Array.isArray(data.docs)).toBe(true)
        expect(data.docs.length).toBeGreaterThan(0) // Assuming seed data exists

        // Test fetching a single course by slug
        const course = data.docs[0]
        if (course) {
            const courseResponse = await apiFetch(`/api/courses?where[slug][equals]=${course.slug}`)
            expect(courseResponse.status).toBe(200)
            const courseData = await courseResponse.json()
            expect(courseData.docs[0].id).toBe(course.id)

            // Verify modules/lessons structure if depth is sufficient
            // Usually depth=1 or 2 is default.
            const fetchedCourse = courseData.docs[0]
            if (fetchedCourse.modules && fetchedCourse.modules.length > 0) {
                // Check if modules are populated or IDs
                // This depends on depth. Payload default depth is 2 usually.
            }
        }
    })
})
