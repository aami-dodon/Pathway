"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsLoading(true);

        try {
            await api.forgotPassword(email);
            setIsSubmitted(true);
            toast.success("Password reset email sent");
        } catch (error) {
            toast.error("Failed to send reset email");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25">
                            <GraduationCap className="h-6 w-6 text-primary-foreground" />
                        </div>
                    </Link>
                </div>

                <Card className="border-border/50 shadow-xl shadow-primary/5">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-2xl">Reset password</CardTitle>
                        <CardDescription>
                            Enter your email address and we&apos;ll send you a link to reset your password
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {isSubmitted ? (
                            <div className="text-center space-y-4">
                                <div className="p-4 rounded-lg bg-primary/10 text-primary mb-4">
                                    <p className="font-medium">Check your email</p>
                                    <p className="text-sm mt-1 text-muted-foreground">
                                        We&apos;ve sent password reset instructions to{" "}
                                        <span className="font-medium text-foreground">{email}</span>
                                    </p>
                                </div>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/login">Return to sign in</Link>
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        className="h-11"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full cursor-pointer"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending link...
                                        </>
                                    ) : (
                                        "Send reset link"
                                    )}
                                </Button>

                                <div className="text-center">
                                    <Button variant="link" size="sm" asChild className="text-muted-foreground hover:text-foreground p-0">
                                        <Link href="/login">
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Back to sign in
                                        </Link>
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
