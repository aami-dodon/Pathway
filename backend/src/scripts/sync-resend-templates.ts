
import { Resend } from 'resend'
import { brand, oklchToHex } from '@org/brand'
import { tokens } from '@org/brand/tokens'
import dotenv from 'dotenv'

dotenv.config()

if (!process.env.RESEND_API_KEY) {
  console.error('Missing RESEND_API_KEY')
  process.exit(1)
}

const resend = new Resend(process.env.RESEND_API_KEY)

// --- 1. Layout & Styling Helpers (Copied/Adapted from seed/emails.ts) ---

const getEmailColor = (tokenPath: string, mode: 'light' | 'dark' = 'light'): string => {
  const color = (tokens.colors as any)[tokenPath]?.[mode] || '#EAB308'
  return oklchToHex(color) || color
}

const primaryColor = getEmailColor('primary')
const backgroundColor = getEmailColor('background')
const foregroundColor = getEmailColor('foreground')
const mutedBackgroundColor = getEmailColor('secondary')
const mutedForegroundColor = getEmailColor('mutedForeground')
const borderColor = getEmailColor('border')

const masterTemplateLayout = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brand.name} Notification</title>
  <style>
    body { font-family: '${brand.typography.fontFamily}', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: ${mutedBackgroundColor}; color: ${foregroundColor}; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 40px auto; background: ${backgroundColor}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { padding: 32px; text-align: center; background-color: ${backgroundColor}; border-bottom: 1px solid ${borderColor}; }
    .content { padding: 40px 32px; line-height: 1.6; font-size: 16px; }
    .footer { padding: 32px; text-align: center; background-color: ${mutedBackgroundColor}; font-size: 14px; color: ${mutedForegroundColor}; border-top: 1px solid ${borderColor}; }
    .button { display: inline-block; padding: 12px 24px; background-color: ${primaryColor}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 24px; }
    .primary-color { color: ${primaryColor}; }
    h1, h2, h3 { color: ${foregroundColor}; margin-top: 0; }
    p { margin-bottom: 16px; }
  </style>
</head>
<body>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <h1>Pathway</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; background-color: #ffffff; border-radius: 8px; border: 1px solid ${borderColor};">
        {{{body}}}
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0; color: #71717b; font-size: 14px;">
        <p style="margin: 16px 0;">
          &copy; ${new Date().getFullYear()} ${brand.name}. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim()

// Helper to construct the full HTML for a specific body content
const constructFullHtml = (bodyContent: string) => {
  let html = masterTemplateLayout
  html = html.replace('{{{body}}}', bodyContent)
  return html
}

// --- 2. Define Templates ---
// No defaults needed now - all layout is hardcoded
const defaults: { key: string; type: string; fallbackValue: string }[] = []

const templates = [
  {
    slug: 'welcome-email',
    name: 'Welcome Email',
    subject: `Welcome to ${brand.name}!`,
    variables: [...defaults, { key: 'role', type: 'string', fallbackValue: 'member' }],
    body: `
      <h1>Welcome to ${brand.name}!</h1>
      <p>Hello there,</p>
      <p>We're thrilled to have you join our community. Your account as a <strong>{{{role}}}</strong> has been successfully created.</p>
      <p>At ${brand.name}, we believe in ${brand.metadata.description.split('.')[0]}.</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">Go to Dashboard</a>
    `.trim(),
  },
  {
    slug: 'contact-acknowledgment',
    name: 'Contact Form Acknowledgment',
    subject: 'We received your message',
    variables: [...defaults, { key: 'firstName', type: 'string', fallbackValue: 'there' }, { key: 'message', type: 'string', fallbackValue: '' }],
    body: `
      <h2>Hi {{{firstName}}},</h2>
      <p>Thank you for reaching out to ${brand.name}. We've received your message and our team will get back to you shortly.</p>
      <div style="background: ${mutedBackgroundColor}; padding: 16px; border-radius: 8px; margin: 24px 0; border: 1px solid ${borderColor};">
        <h4 style="margin-top: 0;">Your Message:</h4>
        <p style="font-style: italic; margin-bottom: 0;">"{{{message}}}"</p>
      </div>
      <p>In the meantime, feel free to check out our latest content or offerings.</p>
    `.trim(),
  },
  {
    slug: 'admin-contact-notification',
    name: 'Admin: New Contact Submission',
    subject: 'New Contact Form Submission',
    variables: [...defaults, { key: 'firstName', type: 'string', fallbackValue: 'Unknown' }, { key: 'lastName', type: 'string', fallbackValue: '' }, { key: 'email', type: 'string', fallbackValue: '' }, { key: 'message', type: 'string', fallbackValue: '' }],
    body: `
      <h2>New Inquiry Received</h2>
      <p><strong>From:</strong> {{{firstName}}} {{{lastName}}} ({{{email}}})</p>
      <p><strong>Message:</strong></p>
      <p style="background: ${mutedBackgroundColor}; padding: 16px; border-radius: 8px; border: 1px solid ${borderColor};">{{{message}}}</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/collections/contact-submissions" class="button">View in CMS</a>
    `.trim(),
  },
  {
    slug: 'newsletter-welcome',
    name: 'Newsletter Welcome',
    subject: `Welcome to the ${brand.name} Newsletter!`,
    variables: [...defaults],
    body: `
      <h2>Thanks for subscribing!</h2>
      <p>You're now on the list to receive the latest updates, launches, and tips from ${brand.name}.</p>
      <p>Stay tuned for our next update!</p>
    `.trim(),
  },
  {
    slug: 'booking-confirmation',
    name: 'Booking Confirmation (Student)',
    subject: 'Session Requested: {{{sessionTitle}}}',
    variables: [...defaults, { key: 'bookerName', type: 'string', fallbackValue: 'Student' }, { key: 'sessionTitle', type: 'string', fallbackValue: 'Session' }, { key: 'coachName', type: 'string', fallbackValue: 'Coach' }, { key: 'scheduledAt', type: 'string', fallbackValue: 'soon' }, { key: 'duration', type: 'string', fallbackValue: '30' }],
    body: `
      <h2>Session Requested!</h2>
      <p>Hi {{{bookerName}}}, your request for <strong>{{{sessionTitle}}}</strong> with <strong>{{{coachName}}}</strong> has been received.</p>
      <p><strong>Scheduled for:</strong> {{{scheduledAt}}}</p>
      <p><strong>Duration:</strong> {{{duration}}} minutes</p>
      <p>We will notify you once the coach confirms the session.</p>
    `.trim(),
  },
  {
    slug: 'booking-confirmed',
    name: 'Booking Confirmed!',
    subject: 'Confirmed: {{{sessionTitle}}}',
    variables: [...defaults, { key: 'bookerName', type: 'string', fallbackValue: 'Student' }, { key: 'sessionTitle', type: 'string', fallbackValue: 'Session' }, { key: 'scheduledAt', type: 'string', fallbackValue: 'soon' }, { key: 'meetingLink', type: 'string', fallbackValue: '#' }],
    body: `
      <h2>Your session is confirmed!</h2>
      <p>Hi {{{bookerName}}}, your session <strong>{{{sessionTitle}}}</strong> is now confirmed.</p>
      <p><strong>Time:</strong> {{{scheduledAt}}}</p>
      <p><strong>Meeting Link:</strong> <a href="{{{meetingLink}}}" class="primary-color">{{{meetingLink}}}</a></p>
      <a href="{{{meetingLink}}}" class="button">Join Call</a>
    `.trim(),
  },
  {
    slug: 'booking-coach-notification',
    name: 'New Booking Request (Coach)',
    subject: 'New Booking Request: {{{sessionTitle}}}',
    variables: [...defaults, { key: 'coachName', type: 'string', fallbackValue: 'Coach' }, { key: 'bookerName', type: 'string', fallbackValue: 'Student' }, { key: 'sessionTitle', type: 'string', fallbackValue: 'Session' }, { key: 'scheduledAt', type: 'string', fallbackValue: 'soon' }, { key: 'topic', type: 'string', fallbackValue: 'General' }],
    body: `
      <h2>New Session Request</h2>
      <p>Hi {{{coachName}}},</p>
      <p>You have a new booking request from <strong>{{{bookerName}}}</strong>.</p>
      <div style="background: ${mutedBackgroundColor}; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid ${borderColor};">
        <p><strong>Session:</strong> {{{sessionTitle}}}</p>
        <p><strong>Time:</strong> {{{scheduledAt}}}</p>
        <p><strong>Topic:</strong> {{{topic}}}</p>
      </div>
      <p>Please log in to your dashboard to accept or decline this request.</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/coaching" class="button">Manage Sessions</a>
    `.trim(),
  },
  {
    slug: 'booking-cancellation',
    name: 'Booking Cancelled',
    subject: 'Cancelled: {{{sessionTitle}}}',
    variables: [...defaults, { key: 'recipientName', type: 'string', fallbackValue: 'User' }, { key: 'sessionTitle', type: 'string', fallbackValue: 'Session' }, { key: 'scheduledAt', type: 'string', fallbackValue: 'soon' }, { key: 'reason', type: 'string', fallbackValue: 'cancelled' }],
    body: `
      <h2>Session Cancelled</h2>
      <p>Hi {{{recipientName}}},</p>
      <p>The session <strong>{{{sessionTitle}}}</strong> scheduled for <strong>{{{scheduledAt}}}</strong> has been cancelled.</p>
      <div style="background: ${mutedBackgroundColor}; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid ${borderColor};">
        <h4 style="margin-top: 0;">Reason:</h4>
        <p style="margin-bottom: 0;">{{{reason}}}</p>
      </div>
      <p>If you have any questions, please contact support.</p>
    `.trim(),
  },
  {
    slug: 'course-enrollment',
    name: 'Course Enrollment',
    subject: 'Welcome to {{{courseTitle}}}!',
    variables: [...defaults, { key: 'subscriberName', type: 'string', fallbackValue: 'Student' }, { key: 'courseTitle', type: 'string', fallbackValue: 'Course' }, { key: 'courseSlug', type: 'string', fallbackValue: '' }],
    body: `
      <h2>Welcome to the Course!</h2>
      <p>Hi {{{subscriberName}}},</p>
      <p>You have successfully enrolled in <strong>{{{courseTitle}}}</strong>.</p>
      <p>We're excited to help you learn and grow.</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/courses/{{{courseSlug}}}" class="button">Start Learning</a>
    `.trim(),
  },
  {
    slug: 'course-completion',
    name: 'Course Completion',
    subject: 'Congratulations! You completed {{{courseTitle}}}',
    variables: [...defaults, { key: 'subscriberName', type: 'string', fallbackValue: 'Student' }, { key: 'courseTitle', type: 'string', fallbackValue: 'Course' }],
    body: `
      <h2>Congratulations! 🎉</h2>
      <p>Hi {{{subscriberName}}},</p>
      <p>You have successfully completed <strong>{{{courseTitle}}}</strong>.</p>
      <p>We hope you enjoyed the journey. Be sure to check out your certificate if applicable.</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/learning" class="button">View Dashboard</a>
    `.trim(),
  }
]

// --- 3. Sync Logic ---

async function syncTemplates() {
  console.log('--- Syncing Resend Templates ---')
  console.log(`Checking existing templates...`)

  let existingTemplates: any[] = []
  try {
    // Use generic GET
    const listResponse = await resend.get('/templates?limit=100') as any
    // Depending on response structure, listResponse.data.data or listResponse itself might be the array
    // Debug showed: { data: { data: [...] } }
    if (listResponse && listResponse.data && Array.isArray(listResponse.data.data)) {
      existingTemplates = listResponse.data.data
    } else if (listResponse && Array.isArray(listResponse.data)) {
      existingTemplates = listResponse.data
    } else if (Array.isArray(listResponse)) {
      existingTemplates = listResponse
    }
  } catch (error) {
    console.error('Failed to list existing templates:', error)
    process.exit(1)
  }

  console.log(`Found ${existingTemplates.length} existing templates in Resend.`)

  for (const t of templates) {
    const fullHtml = constructFullHtml(t.body)

    // Filter out system variables from definition to avoid strict validation
    // No system variables to filter since layout is hardcoded
    const finalVariables = (t as any).variables || []

    // Check if template exists by slug (mapped to name in Resend)
    const existing = existingTemplates.find((et: any) => et.name === t.slug)

    if (existing) {
      console.log(`Deleting existing template: ${t.slug} (${existing.id})`)
      try {
        await resend.delete(`/templates/${existing.id}`)
        // Wait a bit after delete
        await new Promise(r => setTimeout(r, 1000))
      } catch (e: any) {
        console.error(`Failed to delete ${t.slug}:`, e.response?.data || e.message)
      }
    }

    // Always Create (since we deleted if existed)
    console.log(`Creating template: ${t.slug}`)
    // Use generic POST
    try {
      const createRes = await resend.post('/templates', {
        name: t.slug,
        subject: t.subject,
        html: fullHtml,
        variables: finalVariables,
      }) as any
      console.log(`Created ${t.slug}:`, createRes)

      if (createRes.data && createRes.data.id) {
        console.log(`Publishing ${t.slug}...`)
        await resend.post(`/templates/${createRes.data.id}/publish`, {})
      }
    } catch (e: any) {
      console.error(`Failed to create ${t.slug}:`, e.response?.data || e.message)
    }

    // Rate limit delay
    await new Promise(r => setTimeout(r, 1000))
  }

  console.log('--- Sync Complete ---')
}

// Run
syncTemplates().catch(console.error)
