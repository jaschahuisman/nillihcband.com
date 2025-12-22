"use client";

import { Page, PageHeader, PageTitle, PageDescription, PageContent } from "@/components/layout/page";
import { Container } from "@/components/layout/container";
import { BackToHome } from "@/components/layout/back-to-home";
import { YoutubeVideoEmbed } from "@/components/video-embed";
import { SpotifyEmbed } from "@/components/spotify-embed";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, ChevronDownIcon, DownloadIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
                            <Link href="/epk#biography">
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
                    <div className="mb-4">
                        <SpotifyEmbed
                            url="https://open.spotify.com/embed/artist/3LAoxEz5BGdijXj4YG2f6v?utm_source=generator"
                            title="Nillihc Spotify Artist"
                            height={352}
                        />
                    </div>
                </Container>

                <Container id="biography">
                    <Collapsible className="group">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold mb-4">Biografie</h2>
                            <CollapsibleTrigger asChild><Button variant={"outline"}>
                                <span className="group-data-[state=open]:hidden">Lees meer</span>
                                <ChevronDownIcon className="size-4 group-data-[state=open]:rotate-180 transition-transform duration-300" />
                            </Button></CollapsibleTrigger>
                        </div>
                        <section className="mb-4">
                            <h3 className="text-base font-bold mb-2">Oorsprong</h3>
                            <p className="text-muted-foreground max-w-prose">
                                Wat in 2017 begon als een onschuldig middelbare schoolproject, is inmiddels uitgegroeid tot een niet te negeren kracht in de Zuid-Hollandse muziekscene. Nillihc is het bewijs dat sommige schoolbandjes niet uit elkaar vallen, maar juist samensmelten tot iets groters. Gedreven door een gedeelde obsessie voor alles wat funky, jazzy en bovenal dansbaar is, verruilde de band het klaslokaal al snel voor de podia van Rotterdam en ver daarbuiten.
                            </p>
                        </section>
                        <CollapsibleContent>
                            <section className="mb-4">
                                <h3 className="text-base font-bold mb-2">Creatieve drift</h3>
                                <p className="text-muted-foreground max-w-prose">
                                    De potentie was er direct: in hun oprichtingsjaar sleepte de formatie meteen de Rabobank Cultuurprijs (2017) binnen. Het was het startschot voor een periode van creatieve drift, waarin de band hun sound vastlegde op de EP Gainz (2018), gevolgd door de single Fanfare Joepie. De productiviteit bleef hoog, want niet veel later volgde in 2019 de tweede EP Do You Mind.
                                </p>
                            </section>
                            <section className="mb-4">
                                <h3 className="text-base font-bold mb-2">Optredens</h3>
                                <p className="text-muted-foreground max-w-prose">
                                    De live-reputatie van de band werd in de jaren daarna steen voor steen opgebouwd. Zo verzorgde Nillihc in 2020 al het voorprogramma van Willem 't Hart. Dat de groep muzikaal messcherp is, werd een jaar later officieel erkend toen ze de titel De Puls Strakheids Belofte van Nissewaard (2021) op hun naam schreven. De band bleef zich ontwikkelen en claimde hun plek in de scene, wat in 2023 onder meer resulteerde in een residentie in het Rotterdamse jazzwalhalla Dizzy.
                                </p>
                            </section>
                            <section className="mb-4">
                                <h3 className="text-base font-bold mb-2">Stroomversnelling</h3>
                                <p className="text-muted-foreground max-w-prose">
                                    De afgelopen jaren is de band in een stroomversnelling geraakt. Met de releases van de singles Get It High (2023) en het toepasselijke Energiehuis (2024) werd de opmaat gegeven voor een ware triomftocht. De zomer van 2025 voelde als één lang hoogtepunt, waarbij de band alle festivals in de regio plat speelde: van het Spijkenisse Festival en Voorstraat Noord tot aan het jaarlijkse Popcentrale festival. Als kers op de taart – en als ultieme bevestiging van hun groei – won Nillihc in 2025 De Grote Prijs van Dordt, na al jaren een graag geziene gast te zijn geweest op festivals als Big Rivers.
                                </p>
                            </section>
                        </CollapsibleContent>
                    </Collapsible>
                </Container>
            </PageContent>
        </Page >
    )
}