"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Mail, Phone, Send, Loader2 } from "lucide-react";

export function ContactForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        // Simulate network request
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsLoading(false);
        setIsSent(true);
    }

    return (
        <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Details */}
            <div className="flex flex-col gap-6">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight">Get in touch</h3>
                    <p className="mt-2 text-muted-foreground">
                        Have questions about our courses or coaching? We're here to help.
                        Fill out the form or reach out to us directly.
                    </p>
                </div>

                <div className="space-y-4">
                    <Card className="border-border/50 bg-muted/30">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Headquarters</p>
                                <p className="text-sm text-muted-foreground">
                                    123 Learning Street, Tech City, TC 90210
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-muted/30">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Email Us</p>
                                <p className="text-sm text-muted-foreground">
                                    support@pathway.com
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-muted/30">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Call Us</p>
                                <p className="text-sm text-muted-foreground">
                                    +1 (555) 123-4567
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Contact Form */}
            <Card className="border-border/50">
                <CardContent className="p-6">
                    {isSent ? (
                        <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Send className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold">Message Sent!</h3>
                            <p className="mt-2 text-muted-foreground">
                                Thank you for reaching out. We'll get back to you shortly.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-6"
                                onClick={() => setIsSent(false)}
                            >
                                Send another message
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label htmlFor="first-name" className="text-sm font-medium">
                                        First Name
                                    </label>
                                    <Input id="first-name" required placeholder="John" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="last-name" className="text-sm font-medium">
                                        Last Name
                                    </label>
                                    <Input id="last-name" required placeholder="Doe" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </label>
                                <Input id="email" type="email" required placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium">
                                    Message
                                </label>
                                <Textarea
                                    id="message"
                                    required
                                    placeholder="How can we help you?"
                                    className="min-h-[150px]"
                                />
                            </div>
                            <Button type="submit" size="lg" className="w-full h-12 text-base shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Send Message"
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
