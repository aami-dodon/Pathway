import React from "react";
import { cn } from "@/lib/utils";

export function RichTextContent({ content, className }: { content: unknown, className?: string }) {
    if (!content) return null;

    if (typeof content === "object" && content !== null && "root" in content) {
        const root = (content as { root: { children: unknown[] } }).root;
        return (
            <div className={cn("prose prose-slate dark:prose-invert max-w-none", className)}>
                {renderLexicalNodes(root.children)}
            </div>
        );
    }

    if (typeof content === "string") {
        return <div className={cn("prose prose-slate dark:prose-invert max-w-none", className)}>{content}</div>;
    }

    return null;
}

function renderLexicalNodes(nodes: unknown[]): React.ReactNode {
    if (!Array.isArray(nodes)) return null;

    return nodes.map((node, index) => {
        const typedNode = node as {
            type: string;
            text?: string;
            format?: number;
            children?: unknown[];
            tag?: string;
            listType?: string;
            url?: string;
        };

        switch (typedNode.type) {
            case "paragraph":
                return (
                    <p key={index}>
                        {typedNode.children && renderLexicalNodes(typedNode.children)}
                    </p>
                );
            case "heading": {
                const tag = typedNode.tag || "h2";
                const validTags = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
                const HeadingTag = (validTags.includes(tag as typeof validTags[number]) ? tag : "h2") as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
                return (
                    <HeadingTag key={index}>
                        {typedNode.children && renderLexicalNodes(typedNode.children)}
                    </HeadingTag>
                );
            }
            case "text":
                let text: React.ReactNode = typedNode.text || "";
                const format = typedNode.format || 0;
                if (format & 1) text = <strong key={`bold-${index}`}>{text}</strong>;
                if (format & 2) text = <em key={`italic-${index}`}>{text}</em>;
                if (format & 8) text = <u key={`underline-${index}`}>{text}</u>;
                if (format & 16) text = <code key={`code-${index}`}>{text}</code>;
                return <span key={index}>{text}</span>;
            case "list":
                const ListTag = typedNode.listType === "number" ? "ol" : "ul";
                return (
                    <ListTag key={index}>
                        {typedNode.children && renderLexicalNodes(typedNode.children)}
                    </ListTag>
                );
            case "listitem":
                return (
                    <li key={index}>
                        {typedNode.children && renderLexicalNodes(typedNode.children)}
                    </li>
                );
            case "quote":
                return (
                    <blockquote key={index} className="border-l-4 border-primary pl-4 italic">
                        {typedNode.children && renderLexicalNodes(typedNode.children)}
                    </blockquote>
                );
            case "link":
                return (
                    <a key={index} href={typedNode.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {typedNode.children && renderLexicalNodes(typedNode.children)}
                    </a>
                );
            case "linebreak":
                return <br key={index} />;
            default:
                if (typedNode.children) {
                    return <span key={index}>{renderLexicalNodes(typedNode.children)}</span>;
                }
                return null;
        }
    });
}
