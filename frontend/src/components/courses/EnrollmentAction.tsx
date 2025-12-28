"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthNudge } from "@/components/auth-nudge";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface EnrollmentActionProps {
    courseId: string;
    courseSlug: string;
    isOpen: boolean;
    isAuthenticated: boolean;
    isEnrolled: boolean;
    enrollmentStatus?: 'active' | 'completed' | 'paused' | 'expired' | 'cancelled';
    subscriberId?: string; // Required for enrollment
}

export function EnrollmentAction({
    courseId,
    courseSlug,
    isOpen,
    isAuthenticated,
    isEnrolled,
    enrollmentStatus,
    subscriberId,
}: EnrollmentActionProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleEnroll = async () => {
        if (!subscriberId) {
            toast.error("You need a subscriber profile to enroll.");
            return;
        }

        setIsLoading(true);
        try {
            await api.createEnrollment(courseId, subscriberId);
            toast.success("Enrolled Successfully! Redirecting to your course...");
            router.refresh();
            router.push(`/courses/${courseSlug}/learn`);
        } catch (error) {
            console.error("Enrollment failed:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isEnrolled) {
        return (
            <div className="space-y-3">
                <Button
                    size="lg"
                    className="w-full cursor-pointer"
                    asChild
                >
                    <Link href={`/courses/${courseSlug}/learn`}>
                        {enrollmentStatus === 'completed' ? "Review Course" : "Continue Learning"}
                    </Link>
                </Button>
                {enrollmentStatus === 'completed' && (
                    <p className="text-center text-xs text-primary font-medium">
                        You've completed this course!
                    </p>
                )}
            </div>
        );
    }

    return (
        <>
            <Button
                size="lg"
                className="w-full cursor-pointer"
                disabled={!isAuthenticated || !isOpen || isLoading}
                onClick={isAuthenticated && isOpen ? handleEnroll : undefined}
            >
                {isLoading ? "Enrolling..." : !isOpen ? "Enrollment Closed" : "Enroll Now"}
            </Button>

            {!isAuthenticated && (
                <AuthNudge
                    title="Login Required to Enroll"
                    description="Please sign in or create an account to enroll in this course."
                    redirectUrl={`/courses/${courseSlug}`}
                    className="mt-4"
                />
            )}
        </>
    );
}
