"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { toast } from "sonner";

const benefits = [
    "Track your learning progress",
    "Resume courses where you left off",
    "Access exclusive subscriber content",
    "Participate in course discussions",
];

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(email, password);
            toast.success("Welcome back!");
            router.push("/");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Login failed");
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
                        Welcome back to Pathway
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        Continue your journey to mastery. Your courses and progress are waiting for you.
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

                {/* Login Form */}
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
                            <CardTitle className="text-2xl">Welcome back</CardTitle>
                            <CardDescription>
                                Sign in to your account to continue learning
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
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <Link
                                            href="/forgot-password"
                                            className="text-xs text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
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
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 shadow-lg shadow-primary/25"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        "Sign in"
                                    )}
                                </Button>
                            </form>

                            <div className="mt-6 text-center text-sm">
                                <span className="text-muted-foreground">
                                    Don&apos;t have an account?{" "}
                                </span>
                                <Link
                                    href="/register"
                                    className="font-medium text-primary hover:underline"
                                >
                                    Sign up
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
