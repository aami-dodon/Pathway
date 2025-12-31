import { Payload } from 'payload'
import { brand, oklchToHex } from '@org/brand'
import { tokens } from '@org/brand/tokens'

// Simple helper to provide hex fallback for OKLCH since emails have poor support for OKLCH
const getEmailColor = (tokenPath: string, mode: 'light' | 'dark' = 'light'): string => {
  const color = (tokens.colors as any)[tokenPath]?.[mode] || '#EAB308' // Default to a brand-like amber if missing
  return oklchToHex(color) || color
}

export const seedEmails = async (payload: Payload) => {
  console.log(`--- Seeding Email Templates & Layout for ${brand.name} ---`)

  // Colors derived from system tokens
  const primaryColor = getEmailColor('primary')
  const backgroundColor = getEmailColor('background')
  const foregroundColor = getEmailColor('foreground')
  const mutedBackgroundColor = getEmailColor('secondary')
  const mutedForegroundColor = getEmailColor('mutedForeground')
  const borderColor = getEmailColor('border')

  // 1. Seed Email Layout (Global)
  const existingLayout = await payload.findGlobal({
    slug: 'email-layout' as any,
  })

  const masterTemplate = `
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
  <div class="container">
    <div class="header">
      {header}
    </div>
    <div class="content">
      {body}
    </div>
    <div class="footer">
      {footer}
      <p style="margin-top: 16px;">&copy; ${new Date().getFullYear()} ${brand.name}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`.trim()

  const headerHTML = `{logo}`
  const footerHTML = `
    <p>You received this because you're a member of the ${brand.name} community.</p>
    {socialLinks}
    <div style="margin: 16px 0;">
      <a href="#" style="margin: 0 10px; color: ${mutedForegroundColor}; text-decoration: none;">Support</a>
    </div>
  `.trim()

  // Try to find the logo media to link it
  const logoMedia = await payload.find({
    collection: 'media' as any,
    where: {
      filename: { equals: 'logo-full-dark.svg' },
    },
    limit: 1,
  })

  await payload.updateGlobal({
    slug: 'email-layout' as any,
    data: {
      masterTemplate,
      headerHTML,
      footerHTML,
      logo: logoMedia.docs[0]?.id || null,
    } as any,
  })

  // 2. Seed Templates (Collection)
  const templates = [
    {
      slug: 'welcome-email',
      name: 'Welcome Email',
      subject: `Welcome to ${brand.name}!`,
      body: `
        <h1>Welcome to ${brand.name}!</h1>
        <p>Hello there,</p>
        <p>We're thrilled to have you join our community. Your account as a <strong>{role}</strong> has been successfully created.</p>
        <p>At ${brand.name}, we believe in ${brand.metadata.description.split('.')[0]}.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">Go to Dashboard</a>
      `.trim(),
    },
    {
      slug: 'contact-acknowledgment',
      name: 'Contact Form Acknowledgment',
      subject: 'We received your message',
      body: `
        <h2>Hi {firstName},</h2>
        <p>Thank you for reaching out to ${brand.name}. We've received your message and our team will get back to you shortly.</p>
        <div style="background: ${mutedBackgroundColor}; padding: 16px; border-radius: 8px; margin: 24px 0; border: 1px solid ${borderColor};">
          <h4 style="margin-top: 0;">Your Message:</h4>
          <p style="font-style: italic; margin-bottom: 0;">"{message}"</p>
        </div>
        <p>In the meantime, feel free to check out our latest content or offerings.</p>
      `.trim(),
    },
    {
      slug: 'admin-contact-notification',
      name: 'Admin: New Contact Submission',
      subject: 'New Contact Form Submission',
      body: `
        <h2>New Inquiry Received</h2>
        <p><strong>From:</strong> {firstName} {lastName} ({email})</p>
        <p><strong>Message:</strong></p>
        <p style="background: ${mutedBackgroundColor}; padding: 16px; border-radius: 8px; border: 1px solid ${borderColor};">{message}</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/collections/contact-submissions" class="button">View in CMS</a>
      `.trim(),
    },
    {
      slug: 'newsletter-welcome',
      name: 'Newsletter Welcome',
      subject: `Welcome to the ${brand.name} Newsletter!`,
      body: `
        <h2>Thanks for subscribing!</h2>
        <p>You're now on the list to receive the latest updates, launches, and tips from ${brand.name}.</p>
        <p>Stay tuned for our next update!</p>
      `.trim(),
    },
    {
      slug: 'booking-confirmation',
      name: 'Booking Confirmation (Student)',
      subject: 'Session Requested: {sessionTitle}',
      body: `
        <h2>Session Requested!</h2>
        <p>Hi {bookerName}, your request for <strong>{sessionTitle}</strong> with <strong>{coachName}</strong> has been received.</p>
        <p><strong>Scheduled for:</strong> {scheduledAt}</p>
        <p><strong>Duration:</strong> {duration} minutes</p>
        <p>We will notify you once the coach confirms the session.</p>
      `.trim(),
    },
    {
      slug: 'booking-confirmed',
      name: 'Booking Confirmed!',
      subject: 'Confirmed: {sessionTitle}',
      body: `
        <h2>Your session is confirmed!</h2>
        <p>Hi {bookerName}, your session <strong>{sessionTitle}</strong> is now confirmed.</p>
        <p><strong>Time:</strong> {scheduledAt}</p>
        <p><strong>Meeting Link:</strong> <a href="{meetingLink}" class="primary-color">{meetingLink}</a></p>
        <a href="{meetingLink}" class="button">Join Call</a>
      `.trim(),
    }
  ]

  for (const t of templates) {
    const existing = await payload.find({
      collection: 'email-templates' as any,
      where: { slug: { equals: t.slug } },
      limit: 1,
    })

    if (existing.totalDocs === 0) {
      await payload.create({
        collection: 'email-templates' as any,
        data: t as any,
      })
      console.log(`Created template: ${t.slug}`)
    } else {
      await payload.update({
        collection: 'email-templates' as any,
        id: existing.docs[0].id,
        data: t as any,
      })
      console.log(`Updated template: ${t.slug}`)
    }
  }

  console.log('--- Email Seeding Complete ---')
}
