"use client";

import { motion } from "motion/react";
import { Container } from "@/components/layout/container";
import { SpotifyEmbed } from "@/components/spotify-embed";
import { streamingPlatforms } from "@/lib/constants";

function Listen() {
    return (
        <Container id="listen">
            <div className="flex flex-col gap-2 mb-8">
                <h2 className="text-4xl font-bold">Luister Nillihc</h2>
                <p className="text-lg font-normal">
                    Benieuwd naar de Nillihc sound? Beluister alle muziek hier.</p>
            </div>

            <div className="mb-8">
                <SpotifyEmbed
                    url="https://open.spotify.com/embed/artist/3LAoxEz5BGdijXj4YG2f6v?utm_source=generator"
                    title="Nillihc Spotify Artist"
                    height={352}
                />
            </div>

            <div className="flex justify-center mb-12">
                <motion.div
                    className="flex items-center gap-4"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        hidden: {},
                        visible: {
                            transition: {
                                staggerChildren: 0.1,
                            },
                        },
                    }}
                >
                    {streamingPlatforms.map((platform) => (
                        <motion.a
                            key={platform.name}
                            href={platform.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={platform.ariaLabel}
                            className="text-foreground/80 hover:text-foreground transition-colors duration-200"
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 },
                            }}
                            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <platform.icon className="size-5 md:size-8" />
                        </motion.a>
                    ))}
                </motion.div>
            </div>
        </Container>
    );
}

export { Listen };
