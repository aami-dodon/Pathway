"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Mail, Phone, Send, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export function ContactForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            message: "",
        },
    });

    async function onSubmit(data: FormValues) {
        setIsLoading(true);
        try {
            await api.submitContactForm(data);
            setIsSent(true);
            toast.success("Message sent successfully!");
            form.reset();
        } catch (error: any) {
            console.error("Failed to send message:", error);
            toast.error(error.message || "Failed to send message. Please try again.");
        } finally {
            setIsLoading(false);
        }
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
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>First Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="lastName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Last Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="john@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Message</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="How can we help you?"
                                                    className="min-h-[150px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" size="lg" className="w-full cursor-pointer" disabled={isLoading}>
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
                        </Form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
