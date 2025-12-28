// API client for Pathway backend

const isServer = typeof window === 'undefined';
export const API_BASE_URL = isServer
    ? (process.env.INTERNAL_API_URL || 'http://localhost:9006')
    : ''; // Use relative URL on client to leverage Next.js proxy (rewrites)

export interface User {
    id: string;
    email: string;
    role: 'subscriber' | 'creator' | 'coach' | 'admin';
    createdAt: string;
    updatedAt: string;
    isFirstLogin?: boolean;
}

export interface CoachProfile {
    id: string;
    user: User | string;
    displayName: string;
    slug: string;
    bio?: string;
    profilePhoto?: Media;
    expertise?: { area: string }[];
    experience?: {
        yearsOfExperience?: number;
        credentials?: string;
        previousWork?: string;
    };
    isActive: boolean;
    socialLinks?: {
        website?: string;
        linkedin?: string;
        twitter?: string;
    };
    timezone: string;
    availability?: {
        day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
        startTime: string;
        endTime: string;
    }[];
    createdAt: string;
    updatedAt: string;
}

export interface SubscriberProfile {
    id: string;
    user: User | string;
    displayName: string;
    avatar?: Media;
    isAnonymous: boolean;
    interests?: { topic: string }[];
    metadata?: {
        timezone?: string;
        language?: string;
        joinedAt?: string;
    };
    learningPreferences?: {
        preferredFormat?: 'video' | 'text' | 'audio' | 'interactive';
        pace?: 'self-paced' | 'scheduled' | 'intensive';
    };
    createdAt: string;
    updatedAt: string;
}

export interface Media {
    id: string;
    url: string;
    alt?: string;
    filename: string;
    mimeType: string;
    filesize: number;
    width?: number;
    height?: number;
}

export interface Post {
    id: string;
    title: string;
    slug: string;
    author: CoachProfile | string;
    featuredImage?: Media;
    featuredImagePrivate?: Media;
    excerpt?: string;
    content?: unknown;
    category?: Category | string;
    tags?: (Tag | string)[];
    isSubscriberOnly: boolean;
    publishedAt?: string;
    isPublished: boolean;
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
        ogImage?: Media;
        ogImagePrivate?: Media;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
}

export interface Tag {
    id: string;
    name: string;
    slug: string;
}

export interface Page {
    id: string;
    title: string;
    slug: string;
    author?: CoachProfile | User | string;
    content?: unknown;
    isPublished: boolean;
    publishedAt?: string;
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
        ogImage?: Media;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Course {
    id: string;
    title: string;
    slug: string;
    description?: unknown;
    shortDescription?: string;
    instructor: CoachProfile | string;
    additionalInstructors?: (CoachProfile | string)[];
    thumbnail?: Media;
    coverImage?: Media;
    previewVideo?: string;
    modules?: (Module | string)[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
    duration?: {
        hours?: number;
        minutes?: number;
    };
    topics?: { topic: string }[];
    learningOutcomes?: { outcome: string }[];
    prerequisites?: { prerequisite: string }[];
    enrollment?: {
        isOpen?: boolean;
        maxEnrollments?: number;
        startDate?: string;
        endDate?: string;
    };
    accessLevel?: 'public' | 'subscribers';
    isPublished: boolean;
    publishedAt?: string;
    category?: Category | string;
    tags?: (Tag | string)[];
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
        ogImage?: Media;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Module {
    id: string;
    title: string;
    slug: string;
    description?: string;
    order: number;
    lessons?: (Lesson | string)[];
    completionRequirements?: {
        requireAllLessons?: boolean;
        minimumLessons?: number;
        requireQuizPass?: boolean;
    };
    estimatedDuration?: {
        hours?: number;
        minutes?: number;
    };
    objectives?: { objective: string }[];
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Lesson {
    id: string;
    title: string;
    slug: string;
    description?: string;
    order: number;
    type: 'video' | 'text' | 'audio' | 'interactive' | 'assignment' | 'quiz' | 'live' | 'download';
    duration?: {
        hours?: number;
        minutes?: number;
    };
    isFree: boolean;
    isPublished: boolean;

    // Content Fields
    videoContent?: {
        videoUrl?: string;
        videoFile?: Media;
        transcript?: any;
        captions?: Media;
    };
    textContent?: any;
    audioContent?: {
        audioFile?: Media;
        transcript?: any;
    };
    assignmentContent?: {
        instructions?: any;
        dueInDays?: number;
        submissionType?: 'file' | 'text' | 'link';
        maxPoints?: number;
    };
    quiz?: any;
    liveSession?: {
        scheduledAt?: string;
        meetingUrl?: string;
        recordingUrl?: string;
    };
    resources?: {
        title: string;
        file: Media;
        description?: string;
        id?: string;
    }[];
    completionCriteria?: 'view' | 'video-complete' | 'quiz-pass' | 'assignment-submit' | 'manual';

    createdAt: string;
    updatedAt: string;
}

export interface CoachingSession {
    id: string;
    sessionTitle: string;
    coach: CoachProfile | string;
    bookerName: string;
    bookerEmail: string;
    bookerPhone?: string;
    bookedByUser?: User | string;
    scheduledAt: string;
    duration: number;
    timezone: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show' | 'rescheduled';
    sessionType: 'video' | 'phone' | 'in-person';
    meetingLink?: string;
    zoomMeeting?: {
        joinUrl?: string;
        meetingId?: string;
        password?: string;
        createdAt?: string;
    };
    topic?: string;
    bookerNotes?: string;
    coachNotes?: string;
    bookedAt?: string;
    confirmedAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AvailableSlot {
    start: string;
    end: string;
}

export interface AvailabilityResponse {
    slots: AvailableSlot[];
}

export interface HomePageData {
    hero: {
        badge: string;
        title: string;
        highlightedText: string;
        description: string;
        primaryButtonText: string;
        primaryButtonLink: string;
        secondaryButtonText: string;
        secondaryButtonLink: string;
    };
    stats: {
        value: string;
        label: string;
    }[];
    featuresHeader: {
        badge: string;
        title: string;
        description: string;
    };
    features: {
        icon: string;
        title: string;
        description: string;
    }[];
    testimonialsHeader: {
        badge: string;
        title: string;
    };
    reviews: {
        name: string;
        role: string;
        content: string;
        avatar: string;
    }[];
    cta: {
        title: string;
        description: string;
        buttonText: string;
        buttonLink: string;
        benefits: {
            text: string;
        }[];
    };
}

export interface BlogPageData {
    hero: {
        badge: string;
        title: string;
        description: string;
    };
}

export interface CoursesPageData {
    hero: {
        badge: string;
        title: string;
        description: string;
    };
}

export interface CoachesPageData {
    hero: {
        badge: string;
        title: string;
        description: string;
    };
}

export interface HeaderNavData {
    navigationLinks: {
        name: string;
        href: string;
    }[];
}

export interface FooterContentData {
    description: string;
    productLinks: {
        name: string;
        href: string;
    }[];
    companyLinks: {
        name: string;
        href: string;
    }[];
    legalLinks: {
        name: string;
        href: string;
    }[];
    socialLinks: {
        twitter?: string;
        github?: string;
        linkedin?: string;
    };
}

export interface PaginatedResponse<T> {
    docs: T[];
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
}

class ApiClient {
    private baseUrl: string;
    private authToken: string | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    setAuthToken(token: string | null) {
        this.authToken = token;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...((options.headers as Record<string, string>) || {}),
        };

        if (this.authToken) {
            headers['Authorization'] = `JWT ${this.authToken}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
            credentials: 'include',
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({ message: 'Unknown error' }));
            const message = data.errors?.[0]?.message || data.message || `HTTP ${response.status}`;
            throw new Error(message);
        }

        return response.json();
    }

    // Auth
    async login(email: string, password: string): Promise<{ user: User; token: string }> {
        return this.request('/api/users/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async logout(): Promise<void> {
        return this.request('/api/users/logout', { method: 'POST' });
    }

    async forgotPassword(email: string): Promise<void> {
        return this.request('/api/users/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    async resetPassword(token: string, password: string): Promise<void> {
        return this.request('/api/users/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, password }),
        });
    }

    async me(): Promise<{ user: User | null }> {
        return this.request('/api/users/me');
    }

    // Users
    async getUsers(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<User>> {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', params.page.toString());
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        const query = searchParams.toString();
        return this.request(`/api/users${query ? `?${query}` : ''}`);
    }

    async getUser(id: string): Promise<User> {
        return this.request(`/api/users/${id}`);
    }

    async updateUser(id: string, data: Partial<User> & { password?: string }): Promise<User> {
        const response = await this.request<{ doc: User }>(`/api/users/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        return response.doc;
    }

    async deleteUser(id: string): Promise<void> {
        return this.request(`/api/users/${id}`, { method: 'DELETE' });
    }

    // Coach Profiles
    async getCoachProfiles(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<CoachProfile>> {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', params.page.toString());
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        const query = searchParams.toString();
        return this.request(`/api/coach-profiles${query ? `?${query}` : ''}`);
    }

    async getCoachProfile(id: string): Promise<CoachProfile> {
        return this.request(`/api/coach-profiles/${id}`);
    }

    async getCoachProfileBySlug(slug: string): Promise<CoachProfile | null> {
        const params = new URLSearchParams();
        params.set('where[slug][equals]', slug);
        params.set('limit', '1');
        const response = await this.request<PaginatedResponse<CoachProfile>>(
            `/api/coach-profiles?${params.toString()}`
        );
        return response.docs[0] || null;
    }

    async createCoachProfile(data: Partial<CoachProfile>): Promise<CoachProfile> {
        const response = await this.request<{ doc: CoachProfile }>('/api/coach-profiles', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.doc;
    }

    async updateCoachProfile(id: string, data: Partial<CoachProfile>): Promise<CoachProfile> {
        const response = await this.request<{ doc: CoachProfile }>(`/api/coach-profiles/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        return response.doc;
    }

    async deleteCoachProfile(id: string): Promise<void> {
        return this.request(`/api/coach-profiles/${id}`, { method: 'DELETE' });
    }

    // Subscriber Profiles
    async getSubscriberProfiles(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<SubscriberProfile>> {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', params.page.toString());
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        const query = searchParams.toString();
        return this.request(`/api/subscriber-profiles${query ? `?${query}` : ''}`);
    }

    async getSubscriberProfile(id: string): Promise<SubscriberProfile> {
        return this.request(`/api/subscriber-profiles/${id}`);
    }

    async updateSubscriberProfile(id: string, data: Partial<SubscriberProfile>): Promise<SubscriberProfile> {
        const response = await this.request<{ doc: SubscriberProfile }>(`/api/subscriber-profiles/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        return response.doc;
    }

    // Posts
    async getPosts(params?: { page?: number; limit?: number; isPublished?: boolean }): Promise<PaginatedResponse<Post>> {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', params.page.toString());
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        if (params?.isPublished !== undefined) {
            searchParams.set('where[isPublished][equals]', params.isPublished.toString());
        }
        const query = searchParams.toString();
        return this.request(`/api/posts${query ? `?${query}` : ''}`);
    }

    async getPost(id: string): Promise<Post> {
        return this.request(`/api/posts/${id}`);
    }

    async createPost(data: Partial<Post>): Promise<Post> {
        const response = await this.request<{ doc: Post }>('/api/posts', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.doc;
    }

    async updatePost(id: string, data: Partial<Post>): Promise<Post> {
        const response = await this.request<{ doc: Post }>(`/api/posts/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        return response.doc;
    }

    async deletePost(id: string): Promise<void> {
        return this.request(`/api/posts/${id}`, { method: 'DELETE' });
    }

    // Categories
    async getCategories(): Promise<PaginatedResponse<Category>> {
        return this.request('/api/categories');
    }

    // Tags
    async getTags(): Promise<PaginatedResponse<Tag>> {
        return this.request('/api/tags');
    }

    // Pages
    async getPages(params?: { page?: number; limit?: number; isPublished?: boolean }): Promise<PaginatedResponse<Page>> {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', params.page.toString());
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        if (params?.isPublished !== undefined) {
            searchParams.set('where[isPublished][equals]', params.isPublished.toString());
        }
        const query = searchParams.toString();
        return this.request(`/api/pages${query ? `?${query}` : ''}`);
    }

    async getPageBySlug(slug: string): Promise<Page | null> {
        const params = new URLSearchParams();
        params.set('where[slug][equals]', slug);
        params.set('where[isPublished][equals]', 'true');
        params.set('limit', '1');
        const response = await this.request<PaginatedResponse<Page>>(
            `/api/pages?${params.toString()}`
        );
        return response.docs[0] || null;
    }

    // Coaching Sessions
    async getCoachingSessions(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<CoachingSession>> {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', params.page.toString());
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        const query = searchParams.toString();
        return this.request(`/api/coaching-sessions${query ? `?${query}` : ''}`);
    }

    async getCoachingSession(id: string): Promise<CoachingSession> {
        return this.request(`/api/coaching-sessions/${id}`);
    }

    async createCoachingSession(data: Partial<CoachingSession>): Promise<CoachingSession> {
        const response = await this.request<{ doc: CoachingSession }>('/api/coaching-sessions', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.doc;
    }

    async updateCoachingSession(id: string, data: Partial<CoachingSession>): Promise<CoachingSession> {
        const response = await this.request<{ doc: CoachingSession }>(`/api/coaching-sessions/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        return response.doc;
    }

    // Availability
    async getAvailability(coachId: string, from: Date, to: Date): Promise<AvailabilityResponse> {
        const searchParams = new URLSearchParams({
            coach: coachId,
            from: from.toISOString(),
            to: to.toISOString(),
        });
        return this.request(`/api/availability?${searchParams.toString()}`);
    }

    // Search
    async search(params: { q: string; index?: string; limit?: number }): Promise<any> {
        const searchParams = new URLSearchParams();
        searchParams.set("q", params.q);
        if (params.index) searchParams.set("index", params.index);
        if (params.limit) searchParams.set("limit", params.limit.toString());

        return this.request(`/api/search?${searchParams.toString()}`);
    }

    // Globals
    async getGlobal<T>(slug: string, options?: RequestInit): Promise<T> {
        return this.request(`/api/globals/${slug}`, options);
    }


    // Enrollments
    async createEnrollment(courseId: string, subscriberId: string): Promise<any> {
        return this.request('/api/enrollments', {
            method: 'POST',
            body: JSON.stringify({
                course: courseId,
                subscriber: subscriberId,
                status: 'active',
                enrolledAt: new Date().toISOString(),
            }),
        });
    }

    async getEnrollment(courseId: string, subscriberId: string): Promise<PaginatedResponse<any>> {
        const searchParams = new URLSearchParams({
            'where[course][equals]': courseId,
            'where[subscriber][equals]': subscriberId,
            'where[status][equals]': 'active',
        });
        return this.request(`/api/enrollments?${searchParams.toString()}`);
    }

    async getMyEnrollments(subscriberId: string): Promise<PaginatedResponse<any>> {
        const searchParams = new URLSearchParams({
            'where[subscriber][equals]': subscriberId,
            'where[status][equals]': 'active',
            'depth': '2',
        });
        return this.request(`/api/enrollments?${searchParams.toString()}`);
    }

    // Progress
    async getEnrollmentProgress(enrollmentId: string): Promise<PaginatedResponse<any>> {
        const searchParams = new URLSearchParams({
            'where[enrollment][equals]': enrollmentId,
            'limit': '1000',
        });
        return this.request(`/api/progress?${searchParams.toString()}`);
    }

    async getProgress(enrollmentId: string, lessonId: string): Promise<PaginatedResponse<any>> {
        const searchParams = new URLSearchParams({
            'where[enrollment][equals]': enrollmentId,
            'where[lesson][equals]': lessonId,
        });
        return this.request(`/api/progress?${searchParams.toString()}`);
    }

    async updateProgress(data: { enrollment: string; lesson: string; status: string; completedAt?: string }): Promise<any> {
        // First check if progress exists
        const existing = await this.getProgress(data.enrollment, data.lesson);

        if (existing.docs.length > 0) {
            return this.request(`/api/progress/${existing.docs[0].id}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            });
        }

        return this.request('/api/progress', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Lessons (Authenticated Access)
    async getLessonContent(id: string): Promise<Lesson> {
        return this.request(`/api/lessons/${id}`);
    }
}

export const api = new ApiClient(API_BASE_URL);
