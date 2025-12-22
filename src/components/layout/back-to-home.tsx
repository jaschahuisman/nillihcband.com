"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";

export function BackToHome() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        >
            <Link
                href="/"
                className="mb-8 hover:text-primary transition-colors inline-flex items-center gap-3 group no-underline"
            >
                <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                        duration: 0.5,
                        ease: [0.4, 0, 0.2, 1],
                        delay: 0,
                    }}
                    whileTap={{ x: 12, scale: 0.94 }}
                >
                    <ArrowLeftIcon className="size-6 transition-transform" />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: 0.5,
                        ease: [0.4, 0, 0.2, 1],
                        delay: 0.14,
                    }}
                    whileTap={{ scale: 1.08, rotate: 0 }}
                    className="flex items-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                            repeat: Infinity,
                            duration: 10,
                            ease: "linear",
                        }}
                        style={{ display: "inline-block" }}
                    >
                        <Image
                            src="/logo-320.jpg"
                            alt="Nillihc"
                            width={100}
                            height={100}
                            className="transition-transform duration-500 size-8 rounded-full"
                        />
                    </motion.div>
                </motion.div>
                <motion.span
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.32,
                        ease: [0.4, 0, 0.2, 1],
                        delay: 0.28,
                    }}
                    className="text-lg font-bold"
                >
                    Nillihc
                </motion.span>
            </Link>
        </motion.div>
    );
}