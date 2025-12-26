// API client for Pathway backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9006';

export interface User {
    id: string;
    email: string;
    role: 'subscriber' | 'creator' | 'coach' | 'admin';
    createdAt: string;
    updatedAt: string;
}

export interface CoachProfile {
    id: string;
    user: User | string;
    displayName: string;
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
    accessLevel: 'public' | 'subscribers';
    publishedAt?: string;
    status: 'draft' | 'published' | 'archived';
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
    status: 'draft' | 'published' | 'archived';
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
    createdAt: string;
    updatedAt: string;
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
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `HTTP ${response.status}`);
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

    async updateUser(id: string, data: Partial<User>): Promise<User> {
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
    async getPosts(params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<Post>> {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', params.page.toString());
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        if (params?.status) searchParams.set('where[status][equals]', params.status);
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
}

export const api = new ApiClient(API_BASE_URL);
