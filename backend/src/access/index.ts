// Core access functions
export { isAuthenticated } from './isAuthenticated'
export { isAdmin } from './isAdmin'
export { isAdminOrCoach } from './isAdminOrCoach'
export { isAdminOrCreator } from './isAdminOrCreator'
export { isAdminOrSelf, isAdminOrOwner } from './isAdminOrSelf'

// Content status access
export { isPublishedOrAdmin, isPublishedOrOwner } from './isPublished'

// Public/Deny access
export { anyone, noOne } from './anyone'

// Subscriber access
export { isSubscriber, contentAccess, courseContentAccess } from './subscribers'

// Field-level access (for use in field.access, not collection.access)
export {
    fieldIsAdmin,
    fieldIsAdminOrCoach,
    fieldIsAdminOrCreator,
    fieldIsAuthenticated,
} from './fieldAccess'
