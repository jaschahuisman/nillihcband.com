"use client";

import { Page, PageHeader, PageTitle, PageDescription, PageContent } from "@/components/layout/page";
import { Container } from "@/components/layout/container";
import { BackToHome } from "@/components/layout/back-to-home";
import { YoutubeVideoEmbed } from "@/components/video-embed";
import { SpotifyEmbed } from "@/components/spotify-embed";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, DownloadIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { socials, streamingPlatforms } from "@/lib/constants";

export default function EpkPage() {
    return (
        <Page>
            <PageHeader>
                <Container>
                    <div className="flex justify-between items-center">


                        <div>
                            <BackToHome />
                            <PageTitle>Perskit</PageTitle>
                            <PageDescription>
                                Electronic Press Kit
                            </PageDescription>


                        </div>

                        <Button asChild variant={"outline"} className="hidden md:flex">
                            <Link href="/rider" className="">
                                Bekijk onze rider
                                <ArrowRightIcon />
                            </Link>
                        </Button>

                    </div>
                </Container>

            </PageHeader >

            <PageContent>
                <Container id="socials">
                    <h2 className="text-base font-bold mb-4">Socials</h2>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {socials.map((social) => (
                            <a
                                key={social.name}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                                aria-label={social.ariaLabel}
                            >
                                {social.name}
                            </a>
                        ))}
                    </div>
                </Container>

                <Container id="photos">
                    <h2 className="text-base font-bold mb-4">Nillihc in beeld</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        {/* Landscape image */}
                        <div>
                            <a
                                href="/presskit/presspic-landscape.webp"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block relative aspect-video rounded-2xl overflow-hidden bg-muted cursor-zoom-in hover:opacity-90 transition-opacity select-none"
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                <Image
                                    className="object-cover"
                                    src="/presskit/presspic-landscape.webp"
                                    alt="Nillihc - Landscape"
                                    fill
                                    onContextMenu={(e) => e.preventDefault()}
                                    draggable={false}
                                />
                            </a>
                            <div className="flex justify-end mt-2">
                                <Button variant="outline" size="sm" asChild>
                                    <a href="/presskit/presspic-landscape.webp" download="nillihc-landscape.webp">
                                        <DownloadIcon className="size-4 mr-2" />
                                        Download
                                    </a>
                                </Button>
                            </div>
                        </div>

                        {/* Portrait placeholder */}
                        <div>
                            <a
                                href="/presskit/presspic-portrait.webp"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block relative aspect-3/4 rounded-2xl overflow-hidden bg-muted cursor-zoom-in hover:opacity-90 transition-opacity select-none"
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                <Image
                                    className="object-cover"
                                    src="/presskit/presspic-portrait.webp"
                                    alt="Nillihc - Portrait"
                                    fill
                                    onContextMenu={(e) => e.preventDefault()}
                                    draggable={false}
                                />
                            </a>
                            <div className="flex justify-end mt-2">
                                <Button variant="outline" size="sm" asChild>
                                    <a href="/presskit/presspic-portrait.webp" download="nillihc-portrait.webp">
                                        <DownloadIcon className="size-4 mr-2" />
                                        Download
                                    </a>
                                </Button>
                            </div>
                        </div>

                        {/* Square image */}
                        <div>
                            <a
                                href="/presskit/presspic-square.jpg"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block relative aspect-square rounded-2xl overflow-hidden bg-muted cursor-zoom-in hover:opacity-90 transition-opacity select-none"
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                <Image
                                    className="object-cover"
                                    src="/presskit/presspic-square.jpg"
                                    alt="Nillihc - Square"
                                    fill
                                    onContextMenu={(e) => e.preventDefault()}
                                    draggable={false}
                                />
                            </a>
                            <div className="flex justify-end mt-2">
                                <Button variant="outline" size="sm" asChild>
                                    <a href="/presskit/presspic-square.jpg" download="nillihc-square.jpg">
                                        <DownloadIcon className="size-4 mr-2" />
                                        Download
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </Container>

                <Container id="blurp">
                    <h2 className="text-base font-bold mb-4">Geoliede machine</h2>
                    <h3 className="text-xl md:text-3xl leading-normal text-muted-foreground max-w-prose font-bold tracking-tight mb-6">
                        Dikke baslijnen, dwarse blazers en keiharde grooves. Regelrechte post-jazz in je mik. Nillihc blaast je volledig van de sokken met aanstekelijk veel speelplezier, ongefilterd enthousiasme en hun ijzersterke melodieën. Geïnspireerd door bands als Jungle by Night en Vulfpeck viert Nillihc de totale kortsluiting tussen kop en staart.
                    </h3>

                    <div className="flex justify-end">
                        <Button variant={"outline"} asChild>
                            <Link href="/over#biography">
                                Meer over Nillihc
                            </Link>
                        </Button>
                    </div>
                </Container>

                <Container id="watch">
                    <h2 className="text-base font-bold mb-4">Bekijk Nillihc live</h2>
                    <YoutubeVideoEmbed url="https://www.youtube.com/watch?v=_dwec2wJG7U" title="Nillihc live" />
                </Container>

                <Container id="listen">
                    <h2 className="text-base font-bold mb-4">Luister Nillihc</h2>
                    <div className="mb-8">
                        <SpotifyEmbed
                            url="https://open.spotify.com/embed/artist/3LAoxEz5BGdijXj4YG2f6v?utm_source=generator"
                            title="Nillihc Spotify Artist"
                            height={352}
                        />
                    </div>
                    <div className="flex justify-center">
                        <div className="flex items-center gap-4">
                            {streamingPlatforms.map((platform) => (
                                <a
                                    key={platform.name}
                                    href={platform.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={platform.ariaLabel}
                                    className="text-foreground/80 hover:text-foreground transition-colors duration-200 hover:scale-110"
                                >
                                    <platform.icon className="size-5 md:size-8" />
                                </a>
                            ))}
                        </div>
                    </div>
                </Container>
            </PageContent>
        </Page >
    )
}