"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface TextRevealProps {
    text: string;
    className?: string;
    el?: React.ElementType;
    delay?: number;
}

export function TextReveal({ text, className, el: Tag = "div", delay = 0 }: TextRevealProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: delay,
            },
        },
    };

    const childVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut",
            },
        },
    };

    const words = text.split(" ");

    return (
        <Tag ref={ref} className={cn("inline-block", className)}>
            <motion.span
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={containerVariants}
                className="inline-block"
            >
                {words.map((word, index) => (
                    <motion.span
                        key={index}
                        variants={childVariants}
                        className="inline-block mr-[0.2em] last:mr-0"
                    >
                        {word}
                    </motion.span>
                ))}
            </motion.span>
        </Tag>
    );
}
