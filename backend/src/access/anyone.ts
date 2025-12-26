import type { Access } from 'payload'

/**
 * Allows public access (anyone can access)
 * Use for: Public read operations (media, published content)
 */
export const anyone: Access = () => true

/**
 * Denies all access
 * Use for: Explicitly blocking operations (e.g., public create on system collections)
 */
export const noOne: Access = () => false
