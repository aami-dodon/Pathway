import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { API_BASE_URL, Course, Module, Lesson, PaginatedResponse, api } from "@/lib/api";
import { CoursePlayerClient } from "@/components/course-player/CoursePlayerClient";

interface LearnPageProps {
    params: Promise<{ slug: string }>;
}

async function getCourseWithContent(slug: string): Promise<Course | null> {
    try {
        // Depth 3 to ensure we get modules and lessons
        const response = await fetch(
            `${API_BASE_URL}/api/courses?where[slug][equals]=${encodeURIComponent(slug)}&depth=3`,
            {
                next: { revalidate: 60 },
            }
        );

        if (!response.ok) return null;

        const data: PaginatedResponse<Course> = await response.json();
        return data.docs[0] || null;
    } catch (error) {
        console.error("Failed to fetch course:", error);
        return null;
    }
}

async function getEnrollmentData(courseId: string) {
    try {
        const headersList = await headers();
        const cookie = headersList.get('cookie');

        if (!cookie) return null;

        const userRes = await fetch(`${API_BASE_URL}/api/users/me`, {
            headers: { 'Content-Type': 'application/json', Cookie: cookie },
            cache: 'no-store',
        });

        if (!userRes.ok) return null;
        const userData = await userRes.json();
        const user = userData.user;

        if (!user) return null;

        const profileRes = await fetch(`${API_BASE_URL}/api/subscriber-profiles?where[user][equals]=${user.id}`, {
            headers: { 'Content-Type': 'application/json', Cookie: cookie },
            cache: 'no-store'
        });

        if (!profileRes.ok) return null;
        const profileData = await profileRes.json();
        const subscriberId = profileData.docs?.[0]?.id;

        if (!subscriberId) return null;

        // Get Enrollment
        const enrollmentRes = await fetch(`${API_BASE_URL}/api/enrollments?where[course][equals]=${courseId}&where[subscriber][equals]=${subscriberId}&where[status][equals]=active`, {
            headers: { 'Content-Type': 'application/json', Cookie: cookie },
            cache: 'no-store'
        });

        const enrollmentData = await enrollmentRes.json();
        if (!enrollmentData.docs || enrollmentData.docs.length === 0) return null;

        const enrollmentId = enrollmentData.docs[0].id;

        // Get Progress
        const progressRes = await fetch(`${API_BASE_URL}/api/progress?where[enrollment][equals]=${enrollmentId}&limit=1000`, {
            headers: { 'Content-Type': 'application/json', Cookie: cookie },
            cache: 'no-store'
        });
        const progressData = await progressRes.json();

        return {
            enrollmentId,
            progress: progressData.docs || []
        };

    } catch (error) {
        console.error("Failed to fetch enrollment data:", error);
        return null;
    }
}

export default async function LearnPage({ params }: LearnPageProps) {
    const { slug } = await params;
    const course = await getCourseWithContent(slug);

    if (!course) {
        notFound();
    }

    const enrollmentData = await getEnrollmentData(course.id);

    if (!enrollmentData) {
        redirect(`/courses/${slug}`);
    }

    return (
        <CoursePlayerClient
            course={course}
            enrollmentId={enrollmentData.enrollmentId}
            initialProgress={enrollmentData.progress}
        />
    );
}
