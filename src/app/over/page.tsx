import { Page, PageHeader, PageTitle, PageDescription, PageContent } from "@/components/layout/page";
import { Container } from "@/components/layout/container";
import { BackToHome } from "@/components/layout/back-to-home";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRightIcon, MailIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { streamingPlatforms, socials } from "@/lib/constants";

export const metadata: Metadata = {
    title: "Over Nillihc | Post-jazz uit Rotterdam",
    description: "Nillihc is een zevenkoppige instrumentale band uit Rotterdam die post-jazz, funk en fusion combineert tot energieke, dansbare muziek. Leer de bandleden kennen en ontdek onze muziek.",
    keywords: [
        "Nillihc",
        "Nillihc band",
        "Rotterdam jazz band",
        "Nederlandse funk band",
        "post-jazz Rotterdam",
        "instrumentale band Nederland",
        "jazz fusion band",
        "live band Rotterdam",
        "Grote Prijs van Dordt",
        "Dizzy Rotterdam",
        "funk jazz Nederland",
        "dansbare jazz",
        "instrumentale muziek",
        "blazers band",
        "live muziek Rotterdam",
    ],
    authors: [{ name: "Nillihc" }],
    creator: "Nillihc",
    publisher: "Nillihc",
    openGraph: {
        title: "Over Nillihc | Post-jazz uit Rotterdam",
        description: "Zevenkoppige instrumentale band uit Rotterdam. Post-jazz, funk en fusion met dikke baslijnen, jazzy blazers en dansbare grooves. Winnaar Grote Prijs van Dordt 2025.",
        url: "https://nillihcband.com/over",
        siteName: "Nillihc",
        locale: "nl_NL",
        type: "website",
        images: [
            {
                url: "/presskit/presspic-landscape.webp",
                width: 1200,
                height: 630,
                alt: "Nillihc - Post-jazz uit Rotterdam",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Over Nillihc | Post-jazz uit Rotterdam",
        description: "Zevenkoppige instrumentale band uit Rotterdam. Post-jazz, funk en fusion met dikke baslijnen en dansbare grooves.",
        images: ["/presskit/presspic-landscape.webp"],
    },
    alternates: {
        canonical: "https://nillihcband.com/over",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

// Structured Data for SEO (JSON-LD)
const structuredData = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: "Nillihc",
    alternateName: ["Nillihc Band", "Nillihc Rotterdam"],
    description: "Nillihc is een zevenkoppige instrumentale jazzformatie uit Rotterdam die jazz een frisse, groovy twist geeft. Hun muziek combineert post-jazz, funk, fusion en psychedelische elementen tot energieke, dansbare composities.",
    foundingDate: "2017-02",
    foundingLocation: {
        "@type": "Place",
        name: "Rotterdam",
        address: {
            "@type": "PostalAddress",
            addressLocality: "Rotterdam",
            addressRegion: "Zuid-Holland",
            addressCountry: "NL",
        },
    },
    genre: ["Post-Jazz", "Funk", "Fusion", "Jazz", "Instrumentale muziek"],
    numberOfEmployees: "7",
    member: [
        {
            "@type": "OrganizationRole",
            member: { "@type": "Person", name: "Jan Timmerman" },
            roleName: "Drums",
        },
        {
            "@type": "OrganizationRole",
            member: { "@type": "Person", name: "Niels Sas" },
            roleName: "Basgitaar",
        },
        {
            "@type": "OrganizationRole",
            member: { "@type": "Person", name: "Thijmen Sas" },
            roleName: "Gitaar",
        },
        {
            "@type": "OrganizationRole",
            member: { "@type": "Person", name: "Jascha Huisman" },
            roleName: "Toetsen",
        },
        {
            "@type": "OrganizationRole",
            member: { "@type": "Person", name: "Jisk van der Veen" },
            roleName: "Altsaxofoon",
        },
        {
            "@type": "OrganizationRole",
            member: { "@type": "Person", name: "Geert Timmerman" },
            roleName: "Trompet",
        },
        {
            "@type": "OrganizationRole",
            member: { "@type": "Person", name: "Matthijs Verzijden" },
            roleName: "Percussie",
        },
    ],
    award: [
        "Rabobank Cultuurprijs (2017)",
        "De Puls Strakheids Belofte Nissewaard (2021)",
        "De Grote Prijs van Dordt (2025)",
    ],
    album: [
        {
            "@type": "MusicAlbum",
            name: "GAINZ",
            albumProductionType: "EP",
            datePublished: "2018",
        },
        {
            "@type": "MusicAlbum",
            name: "Do You Mind",
            albumProductionType: "EP",
            datePublished: "2019",
        },
    ],
    track: [
        { "@type": "MusicRecording", name: "Fanfare Joepie", datePublished: "2018" },
        { "@type": "MusicRecording", name: "Get It High", datePublished: "2023" },
        { "@type": "MusicRecording", name: "Energiehuis", datePublished: "2024" },
    ],
    sameAs: [
        "https://open.spotify.com/artist/3LAoxEz5BGdijXj4YG2f6v",
        "https://music.apple.com/nl/artist/nillihc/1370500346",
        "https://www.instagram.com/nillihcband",
        "https://www.facebook.com/nillihcband",
        "https://www.youtube.com/@nillihcband",
        "https://soundcloud.com/nillihc-band",
        "https://nillihc.bandcamp.com",
    ],
    url: "https://nillihcband.com",
    email: "info@nillihcband.com",
    telephone: "+31620672161",
    image: "https://nillihcband.com/presskit/presspic-landscape.webp",
    logo: "https://nillihcband.com/logo.svg",
};

// Bandleden data
const bandleden = [
    { naam: "Jan Timmerman", rol: "Drums", emoji: "🥁" },
    { naam: "Niels Sas", rol: "Basgitaar", emoji: "🎸" },
    { naam: "Thijmen Sas", rol: "Gitaar", emoji: "🎸" },
    { naam: "Jascha Huisman", rol: "Toetsen & Synthesizer", emoji: "🎹" },
    { naam: "Jisk van der Veen", rol: "Altsaxofoon", emoji: "🎷" },
    { naam: "Geert Timmerman", rol: "Trompet & Keys", emoji: "🎺" },
    { naam: "Matthijs Verzijden", rol: "Percussie", emoji: "🪘" },
];

// Discografie data
const discografie = [
    { titel: "GAINZ", type: "EP", jaar: "2018" },
    { titel: "Fanfare Joepie", type: "Single", jaar: "2018" },
    { titel: "Do You Mind", type: "EP", jaar: "2019" },
    { titel: "Get It High", type: "Single", jaar: "2023" },
    { titel: "Energiehuis", type: "Single", jaar: "2024" },
];

// Prijzen en hoogtepunten
const hoogtepunten = [
    { jaar: "2017", titel: "Oprichting & Rabobank Cultuurprijs" },
    { jaar: "2018", titel: "Debuut EP 'GAINZ' & eerste tour Frankrijk" },
    { jaar: "2019", titel: "EP 'Do You Mind'" },
    { jaar: "2020", titel: "Voorprogramma Willem 't Hart" },
    { jaar: "2021", titel: "De Puls Strakheids Belofte Nissewaard" },
    { jaar: "2023", titel: "Residentie Dizzy Rotterdam & single 'Get It High'" },
    { jaar: "2024", titel: "Single 'Energiehuis'" },
    { jaar: "2025", titel: "Winnaar De Grote Prijs van Dordt" },
];

export default function OverPage() {
    return (
        <>
            {/* JSON-LD Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            <Page>
                <PageHeader>
                    <Container>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <BackToHome />
                                <PageTitle>Over Nillihc</PageTitle>
                                <PageDescription>
                                    Zevenkoppige jazz-funk formatie uit Rotterdam
                                </PageDescription>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <Button asChild variant="outline" className="hidden md:flex">
                                    <Link href="/epk">
                                        Bekijk perskit <ArrowRightIcon />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </Container>
                </PageHeader>

                <PageContent>
                    {/* Hero intro sectie */}
                    <Container>
                        <article itemScope itemType="https://schema.org/Article">
                            <header>
                                <h2 className="sr-only" itemProp="headline">
                                    Nillihc - Post-jazz uit Rotterdam
                                </h2>
                            </header>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                                {/* Foto */}
                                <div className="lg:sticky lg:top-8">
                                    <Image
                                        src="/presskit/presspic-landscape.webp"
                                        alt="Nillihc band - zevenkoppige post-jazz formatie uit Rotterdam op het podium"
                                        width={800}
                                        height={533}
                                        className="w-full h-auto rounded-2xl"
                                        priority
                                        itemProp="image"
                                    />
                                </div>

                                {/* Intro tekst */}
                                <div className="space-y-6" itemProp="articleBody">
                                    <p className="text-3xl md:text-4xl font-bold leading-snug tracking-tight">
                                        Nillihc maakt er een{" "}
                                        <span className="dancing-text text-primary inline-block">feestje</span>{" "}
                                        van. Dansbare ritmes, dikke baslijnen en jazzy blazers.
                                    </p>

                                    <p className="text-lg text-muted-foreground max-w-prose">
                                        Deze zevenkoppige band uit Rotterdam maakt energieke, originele
                                        instrumentale muziek op het snijvlak van post-jazz,{" "}
                                        funk en fusion. Nillihc&apos;s sound
                                        kenmerkt zich door catchy, dansbare melodieën en een onmiskenbaar
                                        psychedelisch randje.
                                    </p>

                                    <p className="text-lg text-muted-foreground max-w-prose">
                                        Dikke baslijnen, dwarse blazers en keiharde grooves. Regelrechte
                                        post-jazz in je mik. Nillihc blaast je volledig van de sokken met
                                        aanstekelijk veel speelplezier, ongefilterd enthousiasme en hun
                                        ijzersterke melodieën.
                                    </p>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPinIcon className="size-4" />
                                        <span>Rotterdam, Nederland</span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </Container>

                    <Container>
                        <Separator className="bg-muted-foreground/30" />
                    </Container>

                    {/* Oorsprong & Geschiedenis */}
                    <Container id="geschiedenis">
                        <section aria-labelledby="geschiedenis-heading">
                            <div className="flex items-center gap-3 mb-6">
                                <h2 id="geschiedenis-heading" className="text-2xl font-bold">
                                    Van klaslokaal naar podium
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold">Oorsprong</h3>
                                    <p className="text-muted-foreground">
                                        Wat in februari 2017 begon als een onschuldig
                                        middelbare schoolproject, is inmiddels uitgegroeid tot een niet te
                                        negeren kracht in de Zuid-Hollandse muziekscene. Nillihc is het
                                        bewijs dat sommige schoolbandjes niet uit elkaar vallen, maar juist
                                        samensmelten tot iets groters.
                                    </p>
                                    <p className="text-muted-foreground">
                                        De potentie was er direct: in hun oprichtingsjaar sleepte de formatie
                                        meteen de Rabobank Cultuurprijs binnen. Het was het
                                        startschot voor een periode van creatieve drift.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold">Creatieve groei</h3>
                                    <p className="text-muted-foreground">
                                        Gedreven door een gedeelde obsessie voor alles wat funky, jazzy en
                                        bovenal dansbaar is, verruilde de band het klaslokaal al snel voor de
                                        podia van Rotterdam en ver daarbuiten.
                                    </p>
                                    <p className="text-muted-foreground">
                                        De live-reputatie werd steen voor steen opgebouwd. In 2023 claimde
                                        Nillihc hun plek in de scene met een residentie in het Rotterdamse
                                        jazzwalhalla Dizzy.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </Container>

                    <Container>
                        <Separator className="bg-muted-foreground/30" />
                    </Container>

                    {/* Bandleden */}
                    <Container id="bandleden">
                        <section aria-labelledby="bandleden-heading">
                            <div className="flex items-center gap-3 mb-6">
                                <h2 id="bandleden-heading" className="text-2xl font-bold">
                                    Zeven muzikanten
                                </h2>
                            </div>

                            <ul className="space-y-1">
                                {bandleden.map((lid) => (
                                    <li
                                        key={lid.naam}
                                        className="flex items-center gap-3 py-2"
                                        itemScope
                                        itemType="https://schema.org/Person"
                                    >
                                        <span className="text-2xl" aria-hidden="true">{lid.emoji}</span>
                                        <span>
                                            <span className="font-bold text-sm" itemProp="name">
                                                {lid.naam}
                                            </span>
                                            {" · "}
                                            <span className="text-xs text-muted-foreground" itemProp="jobTitle">
                                                {lid.rol}
                                            </span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </Container>

                    <Container>
                        <Separator className="bg-muted-foreground/30" />
                    </Container>

                    {/* Muzikale invloeden */}
                    <Container id="invloeden">
                        <section aria-labelledby="invloeden-heading">
                            <div className="flex items-center gap-3 mb-6">
                                <h2 id="invloeden-heading" className="text-2xl font-bold">
                                    Muzikale invloeden
                                </h2>
                            </div>

                            <p className="text-muted-foreground mb-6 max-w-prose">
                                Geïnspireerd door bands die groove, jazz en funk naadloos combineren,
                                viert Nillihc de totale kortsluiting tussen kop en staart.
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {[
                                    "Snarky Puppy",
                                    "FORQ",
                                    "Jungle by Night",
                                    "New Cool Collective",
                                    "Vulfpeck"
                                ].map((band) => (
                                    <span
                                        key={band}
                                        className="bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm font-medium"
                                    >
                                        {band}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </Container>

                    <Container>
                        <Separator className="bg-muted-foreground/30" />
                    </Container>

                    {/* Discografie */}
                    <Container id="discografie">
                        <section aria-labelledby="discografie-heading">
                            <div className="flex items-center gap-3 mb-6">
                                <h2 id="discografie-heading" className="text-2xl font-bold">
                                    Discografie
                                </h2>
                            </div>

                            <ul className="flex flex-col gap-1">
                                {discografie.map((release) => (
                                    <li
                                        key={release.titel}
                                        itemScope
                                        itemType="https://schema.org/MusicAlbum"
                                        className="flex items-baseline gap-3 px-1 py-1"
                                    >
                                        <span className="text-xs text-primary font-semibold uppercase tracking-widest min-w-[60px]">
                                            {release.type}
                                        </span>
                                        <span className="font-bold" itemProp="name">
                                            {release.titel}
                                        </span>
                                        <span className="text-xs text-muted-foreground ml-auto" itemProp="datePublished">
                                            {release.jaar}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-6 flex flex-wrap gap-2">
                                {streamingPlatforms.slice(0, 4).map((platform) => (
                                    <Button key={platform.name} variant="outline" size="sm" asChild>
                                        <a
                                            href={platform.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={platform.ariaLabel}
                                        >
                                            <platform.icon className="size-4 mr-2" />
                                            {platform.name}
                                        </a>
                                    </Button>
                                ))}
                            </div>
                        </section>
                    </Container>

                    <Container>
                        <Separator className="bg-muted-foreground/30" />
                    </Container>

                    {/* Tijdlijn hoogtepunten */}
                    <Container id="hoogtepunten">
                        <section aria-labelledby="hoogtepunten-heading">
                            <div className="flex items-center gap-3 mb-6">
                                <h2 id="hoogtepunten-heading" className="text-2xl font-bold">
                                    Hoogtepunten & Prijzen
                                </h2>
                            </div>

                            <ul className="flex flex-col gap-1">
                                {hoogtepunten.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-baseline gap-3 w-full"
                                    >
                                        <span className="font-bold">
                                            {item.titel}
                                        </span>
                                        <span className="text-xs text-muted-foreground ml-auto" itemProp="datePublished">
                                            {item.jaar}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </Container>

                    <Container>
                        <Separator className="bg-muted-foreground/30" />
                    </Container>

                    {/* Festivals & optredens */}
                    <Container id="optredens">
                        <section aria-labelledby="optredens-heading">
                            <h2 id="optredens-heading" className="text-2xl font-bold mb-6">
                                Festivals & Optredens
                            </h2>

                            <p className="text-muted-foreground mb-6 max-w-prose">
                                Nillihc is een graag geziene gast op festivals en podia door heel
                                Nederland. Van intieme jazzclubs tot grote festivalpodia.
                            </p>

                            <div className="flex flex-wrap gap-2 text-sm">
                                {[
                                    "Big Rivers Festival",
                                    "Spijkenisse Festival",
                                    "Voorstraat Noord Festival",
                                    "Popcentrale Festival",
                                    "Gorcum Jazz Festival",
                                    "Lepeltje Lepeltje Dordrecht",
                                    "Dizzy Rotterdam",
                                    "Muziekpodium DJS",
                                ].map((festival) => (
                                    <span
                                        key={festival}
                                        className="bg-muted text-foreground px-3 py-1.5 rounded-full"
                                    >
                                        {festival}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </Container>

                    <Container>
                        <Separator className="bg-muted-foreground/30" />
                    </Container>

                    {/* CTA / Contact */}
                    <Container id="contact">
                        <section aria-labelledby="contact-heading" className="text-center">
                            <h2 id="contact-heading" className="text-2xl font-bold mb-4">
                                Boek Nillihc
                            </h2>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Wil je Nillihc boeken voor een festival, evenement of privéfeest?
                                Neem contact met ons op!
                            </p>

                            <div className="flex flex-wrap gap-3 justify-center">
                                <Button asChild>
                                    <a href="mailto:info@nillihcband.com">
                                        <MailIcon className="size-4 mr-2" />
                                        info@nillihcband.com
                                    </a>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/epk">
                                        Bekijk perskit <ArrowRightIcon />
                                    </Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/rider">
                                        Technische rider <ArrowRightIcon />
                                    </Link>
                                </Button>
                            </div>

                            {/* Social links */}
                            <div className="mt-8 flex flex-wrap gap-3 justify-center">
                                {socials.map((social) => (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.ariaLabel}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <social.icon className="size-6" />
                                    </a>
                                ))}
                            </div>
                        </section>
                    </Container>
                </PageContent>
            </Page>
        </>
    );
}
