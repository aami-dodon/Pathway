import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Administration collections
import { Users, MediaPublic, MediaPrivate } from './collections/administration'

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

const s3BaseConfig = {
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
}

const publicFileURL = (process.env.S3_FILE_URL || '').replace(/\/$/, '')
const serverBaseURL = (process.env.BASE_URL || '').replace(/\/$/, '')
const hasPublicBucket = Boolean(process.env.S3_BUCKET)
const hasPrivateBucket = Boolean(process.env.S3_PRIVATE_BUCKET)

export default buildConfig({
  routes: {
    admin: '/',
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  email: nodemailerAdapter({
    defaultFromAddress: process.env.EMAIL_FROM || '',
    defaultFromName: process.env.EMAIL_FROM || '',
    transportOptions: {
      host: process.env.EMAIL_SMTP_HOST,
      port: Number(process.env.EMAIL_SMTP_PORT) || 465,
      secure: ['true', '1'].includes((process.env.EMAIL_SMTP_SECURE || '').toLowerCase()),
      auth: {
        user: process.env.EMAIL_SMTP_USER,
        pass: process.env.EMAIL_SMTP_PASS,
      },
    },
  }),
  collections: [
    // Administration
    Users,
    MediaPublic,
    MediaPrivate,
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
  plugins: [
    s3Storage({
      enabled: hasPublicBucket,
      acl: 'public-read',
      bucket: process.env.S3_BUCKET || '',
      config: s3BaseConfig,
      collections: {
        media: {
          generateFileURL: ({ filename, prefix }) => {
            const fileKey = [prefix, filename].filter(Boolean).join('/')
            return publicFileURL && fileKey ? `${publicFileURL}/${fileKey}` : fileKey
          },
        },
      },
    }),
    s3Storage({
      enabled: hasPrivateBucket,
      bucket: process.env.S3_PRIVATE_BUCKET || '',
      config: s3BaseConfig,
      collections: {
        'media-private': {
          disableLocalStorage: true,
        },
      },
    }),
  ],
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
