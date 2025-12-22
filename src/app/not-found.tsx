"use client";

import { Page, PageHeader, PageContent } from "@/components/layout/page";
import { Container } from "@/components/layout/container";
import { BackToHome } from "@/components/layout/back-to-home";
import { Button } from "@/components/ui/button";
import { SpotifyEmbed } from "@/components/spotify-embed";
import { ArrowLeftIcon, MusicIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

export default function NotFound() {
    return (
        <Page>
            <PageHeader>
                <Container>
                    <BackToHome />
                </Container>
            </PageHeader>

            <PageContent>
                <Container>
                    <div className="flex flex-col items-center text-center py-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: -12 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
                            className="mb-8"
                        >
                            <div className="relative">
                                <div className="text-[12rem] font-bold leading-none text-muted/50 select-none">
                                    404
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <MusicIcon className="size-24 text-foreground" strokeWidth={2} />
                                </motion.div>
                            </div>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.35 }}
                            className="text-2xl font-bold mb-4"
                        >
                            Pagina niet gevonden!
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.45 }}
                            className="text-muted-foreground max-w-md mb-8"
                        >
                            De pagina die je zoekt bestaat niet of is verplaatst. Hier wat lekkere tunes om het ongemak te verzachten.
                        </motion.p>



                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                            className="w-full max-w-md mb-8"
                        >
                            <SpotifyEmbed
                                url="https://open.spotify.com/embed/artist/3LAoxEz5BGdijXj4YG2f6v?utm_source=generator"
                                title="Nillihc Spotify Artist"
                                height={152}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.55 }}
                            className="flex gap-4"
                        >
                            <Button asChild>
                                <Link href="/">
                                    <ArrowLeftIcon />
                                    Terug naar home
                                </Link>
                            </Button>
                        </motion.div>
                    </div>
                </Container>
            </PageContent>
        </Page>
    );
}

