import type { CollectionConfig } from 'payload'
import { populateCreatedBy } from '../../hooks'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { isAdmin, isAuthenticated, isAdminOrUploader } from '../../access'

// Separate client for signing URLs that points to the Public CDN
// This ensures the signature matches the Host header ('cdn.dodon.in')
// regardless of what endpoint the backend uses for internal operations.
const signerClient = new S3Client({
    endpoint: 'https://cdn.dodon.in',
    forcePathStyle: true,
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_KEY || '',
    },
})

async function generateSignedUrl(filename: string, doc: any, req: any) {
    if (!filename) return undefined;

    // Permissions check for subscriber-only media
    if (doc.isSubscriberOnly) {
        // req.user might be missing if not logged in
        if (!req.user) {
            return undefined;
        }

        // Allowed roles for subscriber content
        const allowedRoles = ['admin', 'coach', 'creator', 'subscriber'];
        if (!allowedRoles.includes(req.user.role)) {
            return undefined;
        }
    }

    // Determine expiration based on rules
    let expiresIn = 900; // Default public (15 min)
    if (doc.isSubscriberOnly) {
        expiresIn = 600; // 10 min
    }

    try {
        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: filename,
        });

        // Generate signed URL using the CDN client
        return await getSignedUrl(signerClient, command, { expiresIn });
    } catch (err) {
        console.error('Error generating signed URL:', err);
        return undefined;
    }
}

export const Media: CollectionConfig = {
    slug: 'media',
    labels: {
        singular: 'Media',
        plural: 'Media',
    },
    admin: {
        group: 'Administration',
        description: 'Unified media library with access control and signed URLs',
        defaultColumns: ['filename', 'mimeType', 'isSubscriberOnly', 'category'],
    },
    access: {
        read: () => true,           // Public (signed URLs protect actual content)
        create: isAuthenticated,    // Must be logged in to upload
        update: isAdminOrUploader,  // Admin or original uploader
        delete: isAdmin,            // Only admins can delete
    },
    hooks: {
        beforeChange: [
            populateCreatedBy,
            ({ data }) => {
                if (data.mimeType && !data.category) {
                    if (data.mimeType.startsWith('image/')) data.category = 'images';
                    else if (data.mimeType.startsWith('video/')) data.category = 'videos';
                    else data.category = 'documents';
                }
                return data;
            }
        ],
        afterRead: [
            async ({ doc, req }) => {
                // Sign main URL
                if (doc.filename) {
                    const signedUrl = await generateSignedUrl(doc.filename, doc, req);
                    if (signedUrl) doc.url = signedUrl;
                }

                // Sign sizes
                if (doc.sizes) {
                    for (const sizeKey of Object.keys(doc.sizes)) {
                        if (doc.sizes[sizeKey].filename) {
                            const signedUrl = await generateSignedUrl(doc.sizes[sizeKey].filename, doc, req);
                            if (signedUrl) doc.sizes[sizeKey].url = signedUrl;
                        }
                    }
                }

                return doc;
            }
        ]
    },
    fields: [
        {
            name: 'alt',
            type: 'text',
            required: true,
            admin: {
                description: 'Alt text for accessibility',
            },
        },
        {
            name: 'isSubscriberOnly',
            type: 'checkbox',
            defaultValue: false,
            admin: {
                position: 'sidebar',
                description: 'Restrict this media to subscribers only.',
            },
        },
        {
            name: 'category',
            type: 'select',
            required: true,
            defaultValue: 'images',
            options: [
                { label: 'Images', value: 'images' },
                { label: 'Videos', value: 'videos' },
                { label: 'Documents', value: 'documents' },
            ],
            admin: {
                position: 'sidebar',
                description: 'Used for organizing media in storage',
            },
        },
        {
            name: 'createdBy',
            type: 'relationship',
            relationTo: 'users',
            admin: {
                readOnly: true,
                position: 'sidebar',
                description: 'User who uploaded this media',
            },
        },
    ],
    upload: {
        imageSizes: [
            {
                name: 'thumbnail',
                width: 400,
                height: 300,
                position: 'centre',
            },
            {
                name: 'card',
                width: 768,
                height: 1024,
                position: 'centre',
            },
            {
                name: 'tablet',
                width: 1024,
                height: undefined,
                position: 'centre',
            },
        ],
        adminThumbnail: 'thumbnail',
        mimeTypes: ['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    },
}
