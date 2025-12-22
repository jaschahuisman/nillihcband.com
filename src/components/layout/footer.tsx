import Link from "next/link";
import { BigLogo } from "../big-logo";
import { Container } from "./container";
import { Separator } from "../ui/separator";
import Image from "next/image";
import { streamingPlatforms, socials } from "@/lib/constants";


function Footer() {
    return (
        <footer
            className="pt-32 pb-16 bg-accent text-accent-foreground flex flex-col gap-16"
            aria-label="Footer: Nillihc Band Contact, Socials & Navigation"
        >
            <Container>
                <div className="flex items-center gap-4">
                    <Image
                        src="/logo-320.jpg"
                        alt="Nillihc band logo - round avatar, Rotterdam post-jazz"
                        width={320}
                        height={320}
                        className="size-16 rounded-full"
                        priority
                    />
                    <h2 className="text-4xl font-bold" tabIndex={0}>Stay Nillihc</h2>
                </div>
            </Container>

            <Container>
                <Separator className="bg-accent-foreground/10" />
            </Container>

            <Container>
                <nav aria-label="Footer Navigation" className="grid grid-cols-1 sm:grid-cols-2 gap-16">
                    <div>
                        <h3 className="text-2xl font-bold mb-4">Nillihc</h3>
                        <ul className="flex flex-col gap-2" itemScope itemType="https://schema.org/SiteNavigationElement">
                            <li>
                                <Link href="/" itemProp="url" aria-label="Homepage - Nillihc">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/over" itemProp="url" aria-label="Over ons - About Nillihc band">
                                    Over ons
                                </Link>
                            </li>
                            <li>
                                <Link href="/epk" itemProp="url" aria-label="EPK - Electronic Press Kit Nillihc">
                                    EPK
                                </Link>
                            </li>
                            <li>
                                <Link href="/rider" itemProp="url" aria-label="Rider - Nillihc Technical Rider">
                                    Rider
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-4">Contact</h3>
                        <address className="not-italic">
                            <ul className="flex flex-col gap-2">
                                <li>
                                    <Link
                                        href="mailto:info@nillihcband.com"
                                        className="hover:underline"
                                        itemProp="email"
                                        aria-label="Email Nillihc: info@nillihcband.com"
                                    >
                                        info@nillihcband.com
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="tel:+31620672161"
                                        className="hover:underline"
                                        itemProp="telephone"
                                        aria-label="Call Nillihc: +31 6 20672161"
                                    >
                                        +31 6 20672161
                                    </Link>
                                </li>
                                <li className="text-sm text-muted-foreground" itemProp="addressLocality">
                                    Regio Rotterdam, Nederland
                                </li>
                            </ul>
                        </address>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-4">Volg ons</h3>
                        <ul className="flex flex-col gap-2" aria-label="Nillihc Social Links">
                            {socials.map((social) => (
                                <li key={social.name}>
                                    <a
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.ariaLabel}
                                        itemProp="sameAs"
                                    >
                                        {social.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-4">Luister Nillihc</h3>
                        <ul className="flex flex-col gap-2" aria-label="Nillihc Streaming Links">
                            {streamingPlatforms.map((platform) => (
                                <li key={platform.name}>
                                    <a
                                        href={platform.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={platform.ariaLabel}
                                        itemProp="url"
                                        className="hover:underline"
                                    >
                                        {platform.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>
            </Container>

            <Container>
                <Separator className="bg-accent-foreground/10" />
            </Container>

            <Container>
                <BigLogo className="text-muted-foreground/10" aria-hidden="true" />
            </Container>

            <Container>
                <Separator className="bg-accent-foreground/10" />
            </Container>

            <Container>
                <p className="text-xs text-muted-foreground/50 text-center">
                    &copy; {new Date().getFullYear()} Nillihc. Alle rechten voorbehouden.
                </p>
            </Container>

        </footer>
    );
}

export { Footer };