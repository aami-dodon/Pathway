import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Administration collections
import { Users, Media } from './collections/administration'

// User Profiles - separate from CMS for LMS reuse
import { CoachProfile, SubscriberProfile } from './collections/user-profiles'

// Content Management collections
import { Categories, Tags, Posts, Pages } from './collections/content-management'

// Learning Management collections
import {
  Courses,
  Modules,
  Lessons,
  Quizzes,
  Enrollments,
  Progress,
  QuizAttempts,
} from './collections/learning-management'

// Booking Management collections
import { CoachingSessions } from './collections/booking-management'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    // Administration
    Users,
    Media,
    // User Profiles
    CoachProfile,
    SubscriberProfile,
    // Content Management
    Categories,
    Tags,
    Posts,
    Pages,
    // Learning Management
    Courses,
    Modules,
    Lessons,
    Quizzes,
    Enrollments,
    Progress,
    QuizAttempts,
    // Booking Management
    CoachingSessions,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
  onInit: async (payload) => {
    const existingUsers = await payload.find({
      collection: 'users',
      limit: 1,
    })

    if (existingUsers.docs.length === 0) {
      const adminEmail = process.env.ADMIN_EMAIL
      const adminPassword = process.env.ADMIN_PASSWORD

      if (adminEmail && adminPassword) {
        await payload.create({
          collection: 'users',
          data: {
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
          },
        })
        payload.logger.info(`Admin user created: ${adminEmail}`)
      } else {
        payload.logger.warn('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required to seed the admin user')
      }
    }
  },
})
