"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { toast } from "sonner";

const benefits = [
    "Access to free courses and content",
    "Personalized learning recommendations",
    "Book coaching sessions",
    "Join our community",
];

export default function RegisterPage() {
    const router = useRouter();
    const { login } = useAuth(); // Keep login if used, or remove useAuth if not needed. Checking usage below.
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);

        try {
            // Create user via API

            const response = await fetch(
                `${API_BASE_URL}/api/users`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.errors?.[0]?.message || "Registration failed");
            }

            toast.success("Account created! Please sign in.");
            router.push("/login");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-4xl grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
                {/* Benefits Section */}
                <div className="hidden lg:block">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Start your learning journey today
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        Join thousands of learners already accelerating their growth with
                        Pathway.
                    </p>

                    <ul className="mt-8 space-y-4">
                        {benefits.map((benefit) => (
                            <li key={benefit} className="flex items-center gap-3">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm">{benefit}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Registration Form */}
                <div>
                    {/* Logo (mobile only) */}
                    <div className="flex justify-center mb-8 lg:hidden">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25">
                                <GraduationCap className="h-6 w-6 text-primary-foreground" />
                            </div>
                        </Link>
                    </div>

                    <Card className="border-border/50 shadow-xl shadow-primary/5">
                        <CardHeader className="text-center pb-4">
                            <CardTitle className="text-2xl">Create an account</CardTitle>
                            <CardDescription>
                                Get started with your free account
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
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

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            className="h-11 pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Must be at least 8 characters
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                                            Creating account...
                                        </>
                                    ) : (
                                        "Create account"
                                    )}
                                </Button>
                            </form>

                            <p className="mt-4 text-center text-xs text-muted-foreground">
                                By creating an account, you agree to our{" "}
                                <Button variant="link" size="sm" asChild className="h-auto p-0">
                                    <Link href="/terms">Terms of Service</Link>
                                </Button>{" "}
                                and{" "}
                                <Button variant="link" size="sm" asChild className="h-auto p-0">
                                    <Link href="/privacy">Privacy Policy</Link>
                                </Button>
                                .
                            </p>

                            <div className="mt-6 text-center text-sm">
                                <span className="text-muted-foreground">
                                    Already have an account?{" "}
                                </span>
                                <Link
                                    href="/login"
                                    className="font-medium text-primary hover:underline"
                                >
                                    Sign in
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
