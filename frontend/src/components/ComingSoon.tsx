"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Rocket, Bell, Sparkles, Twitter, Linkedin, Instagram, Github } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, SiteSettingsData } from "@/lib/api";
import { toast } from "sonner";
import { Logo } from "@/components/ui/logo";

interface ComingSoonProps {
    data: SiteSettingsData["maintenanceMode"];
    socialLinks?: SiteSettingsData["socialLinks"];
}

export function ComingSoon({ data, socialLinks }: ComingSoonProps) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        try {
            await api.subscribeToNewsletter(email);
            toast.success("We'll notify you as soon as we launch!");
            setEmail("");
        } catch (error: any) {
            console.error("Newsletter subscription error:", error);
            toast.error(error.message || "Failed to subscribe. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background px-4">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute -bottom-[25%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
            </div>

            {/* Header / Logo */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute top-8 left-4 sm:left-12"
            >
                <Logo size="lg" />
            </motion.div>

            <main className="relative z-10 max-w-4xl w-full text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="mb-8 flex justify-center"
                >
                    <div className="relative">
                        <motion.div
                            animate={{
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1.1, 1]
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="p-4 rounded-2xl bg-primary/5 border border-primary/20 backdrop-blur-sm shadow-2xl shadow-primary/10"
                        >
                            <Rocket className="w-12 h-12 text-primary" />
                        </motion.div>
                        <motion.div
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -top-2 -right-2"
                        >
                            <Sparkles className="w-6 h-6 text-yellow-500" />
                        </motion.div>
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50"
                >
                    {data.title || "Something Great is Coming"}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    {data.description || "We're working hard to finish the development of this site. Our target launch date is coming soon!"}
                </motion.p>

                {data.showNewsletter && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="w-full max-w-md mx-auto"
                    >
                        <div className="p-1 rounded-2xl bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 shadow-xl">
                            <form
                                onSubmit={handleSubscribe}
                                className="relative flex flex-col sm:flex-row gap-2 p-1 bg-background rounded-[15px] overflow-hidden"
                            >
                                <div className="relative flex-1 group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                        <Bell className="w-4 h-4" />
                                    </div>
                                    <Input
                                        type="email"
                                        placeholder="Enter your email for updates..."
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 pl-10 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 transition-all duration-300 font-medium group"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Joining...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Notify Me
                                            <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </div>
                        <p className="mt-4 text-xs text-muted-foreground">
                            No spam, just beautiful updates. Promise.
                        </p>
                    </motion.div>
                )}

                {data.expectedLaunchDate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1 }}
                        className="mt-12 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 text-sm font-medium"
                    >
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Target Launch: {new Date(data.expectedLaunchDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </motion.div>
                )}
            </main>

            <footer className="absolute bottom-8 left-0 w-full px-4 text-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="flex gap-8">
                        {socialLinks?.twitter && (
                            <a
                                href={socialLinks.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110"
                            >
                                <Twitter className="w-5 h-5" />
                                <span className="sr-only">Twitter</span>
                            </a>
                        )}
                        {socialLinks?.linkedin && (
                            <a
                                href={socialLinks.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110"
                            >
                                <Linkedin className="w-5 h-5" />
                                <span className="sr-only">LinkedIn</span>
                            </a>
                        )}
                        {socialLinks?.instagram && (
                            <a
                                href={socialLinks.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110"
                            >
                                <Instagram className="w-5 h-5" />
                                <span className="sr-only">Instagram</span>
                            </a>
                        )}
                        {socialLinks?.github && (
                            <a
                                href={socialLinks.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110"
                            >
                                <Github className="w-5 h-5" />
                                <span className="sr-only">GitHub</span>
                            </a>
                        )}
                    </div>
                </motion.div>
            </footer>

        </div>
    );
}
