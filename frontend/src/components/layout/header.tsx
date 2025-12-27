"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
    BookOpen,
    Menu,
    Moon,
    Sun,
    User,
    X,
    LogOut,
    Settings,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

const navigation = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: "Courses", href: "/courses" },
    { name: "Coaches", href: "/coaches" },
];

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { user, logout, isLoading } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Logo size="md" />

                {/* Desktop Navigation */}
                <div className="hidden md:flex md:items-center md:gap-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "relative px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                                pathname === item.href
                                    ? "text-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                        >
                            {item.name}
                            {pathname === item.href && (
                                <span className="absolute inset-x-2 -bottom-[17px] h-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-full" />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    >
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    {/* User Menu / Auth Buttons */}
                    {!isLoading && (
                        <>
                            {user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all"
                                        >
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src="" alt={user.email} />
                                                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm font-medium">
                                                    {user.email.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="end" forceMount>
                                        <div className="flex items-center gap-2 p-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs">
                                                    {user.email.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col space-y-0.5">
                                                <p className="text-sm font-medium">{user.email}</p>
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    {user.role}
                                                </p>
                                            </div>
                                        </div>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/profile" className="cursor-pointer">
                                                <User className="mr-2 h-4 w-4" />
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/my-courses" className="cursor-pointer">
                                                <BookOpen className="mr-2 h-4 w-4" />
                                                My Courses
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/settings" className="cursor-pointer">
                                                <Settings className="mr-2 h-4 w-4" />
                                                Settings
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="cursor-pointer text-destructive focus:text-destructive"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Log out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <div className="hidden sm:flex sm:items-center sm:gap-2">
                                    <Button variant="ghost" asChild className="h-9">
                                        <Link href="/login">Sign in</Link>
                                    </Button>
                                    <Button asChild className="h-9 shadow-lg shadow-primary/25">
                                        <Link href="/register">Get Started</Link>
                                    </Button>
                                </div>
                            )}
                        </>
                    )}

                    {/* Mobile Menu */}
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                {mobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-80 pt-12">
                            <nav className="flex flex-col gap-1">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                                            pathname === item.href
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                {!user && (
                                    <>
                                        <div className="my-4 h-px bg-border" />
                                        <Link
                                            href="/login"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                                        >
                                            Sign in
                                        </Link>
                                        <Link
                                            href="/register"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center justify-center gap-3 rounded-lg bg-primary px-4 py-3 text-base font-medium text-primary-foreground"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </header>
    );
}
