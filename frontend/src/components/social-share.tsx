"use client";

import React from "react";
import { Twitter, Facebook, Linkedin, Link as LinkIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SocialShareProps {
    url: string;
    title: string;
    className?: string;
}

export function SocialShare({ url, title, className }: SocialShareProps) {
    const [copied, setCopied] = React.useState(false);

    const encode = encodeURIComponent;

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?text=${encode(title)}&url=${encode(url)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encode(url)}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encode(url)}&title=${encode(title)}`,
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Link copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy link");
        }
    };

    const openShareWindow = (e: React.MouseEvent, url: string) => {
        e.preventDefault();
        window.open(url, "_blank", "width=600,height=400,noopener,noreferrer");
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span className="text-sm font-medium text-muted-foreground mr-2">Share:</span>

            <Button
                variant="outline"
                size="icon-sm"
                className="rounded-full hover:text-primary hover:border-primary/20 hover:bg-primary/5 cursor-pointer"
                onClick={(e) => openShareWindow(e, shareLinks.twitter)}
                aria-label="Share on Twitter"
            >
                <Twitter className="h-4 w-4" />
            </Button>

            <Button
                variant="outline"
                size="icon-sm"
                className="rounded-full hover:text-primary hover:border-primary/20 hover:bg-primary/5 cursor-pointer"
                onClick={(e) => openShareWindow(e, shareLinks.facebook)}
                aria-label="Share on Facebook"
            >
                <Facebook className="h-4 w-4" />
            </Button>

            <Button
                variant="outline"
                size="icon-sm"
                className="rounded-full hover:text-primary hover:border-primary/20 hover:bg-primary/5 cursor-pointer"
                onClick={(e) => openShareWindow(e, shareLinks.linkedin)}
                aria-label="Share on LinkedIn"
            >
                <Linkedin className="h-4 w-4" />
            </Button>

            <Button
                variant="outline"
                size="icon-sm"
                className="rounded-full cursor-pointer"
                onClick={handleCopy}
                aria-label="Copy link"
            >
                {copied ? (
                    <Check className="h-4 w-4 text-primary" />
                ) : (
                    <LinkIcon className="h-4 w-4" />
                )}
            </Button>
        </div>
    );
}
