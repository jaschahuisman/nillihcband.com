"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "motion/react";

function Page({ children, className, ...props }: React.ComponentProps<"div">) {
    return (
        <div className={cn("", className)} {...props}>
            {children}
        </div>
    )
}

function PageHeader({ children, className, ...props }: HTMLMotionProps<"div">) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className={cn("flex flex-col gap-4 pt-12 pb-8 border-b border-muted/50 ", className)}
            {...props}
        >
            {children}
        </motion.div>
    )
}

function PageTitle({ children, className, ...props }: HTMLMotionProps<"h1">) {
    return (
        <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
            className={cn("text-5xl font-bold leading-tight mb-2 tracking-tight w-full max-w-prose", className)}
            {...props}
        >
            {children}
        </motion.h1>
    )
}

function PageDescription({ children, className, ...props }: HTMLMotionProps<"p">) {
    return (
        <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.18 }}
            className={cn("text-lg text-muted-foreground", className)}
            {...props}
        >
            {children}
        </motion.p>
    )
}

function PageContent({ children, className, ...props }: HTMLMotionProps<"div">) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className={cn("flex flex-col py-16 gap-12 md:gap-16 ", className)}
            {...props}
        >
            {children}
        </motion.div>
    )
}

export { Page, PageHeader, PageTitle, PageDescription, PageContent };