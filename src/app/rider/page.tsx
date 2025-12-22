import { Page, PageHeader, PageTitle, PageDescription, PageContent } from "@/components/layout/page";
import { Container } from "@/components/layout/container";
import { BackToHome } from "@/components/layout/back-to-home";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function RiderPage() {
    return (
        <Page>
            <PageHeader>
                <Container>
                    <div className="flex justify-between items-center">
                        <div>
                            <BackToHome />
                            <PageTitle>Rider</PageTitle>
                            <PageDescription>
                                Technische specificaties
                            </PageDescription>
                        </div>

                        <Button asChild variant={"outline"} className="hidden md:flex">
                            <Link href="/epk">
                                Bekijk onze perskit
                                <ArrowRightIcon />
                            </Link>
                        </Button>
                    </div>
                </Container>
            </PageHeader>

            <PageContent>
                <Container>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* Image - sticky on desktop */}
                        <div className="lg:sticky lg:top-8 lg:self-start lg:order-2">
                            <Image
                                src="/rider/rider.jpg"
                                alt="Nillihc stage plot"
                                width={1000}
                                height={1000}
                                className="w-full h-auto object-cover rounded-2xl"
                            />
                        </div>

                        {/* Tech specs grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:order-1">
                            {/* Priklijst */}
                            <div>
                                <h2 className="text-base font-bold mb-4">Priklijst</h2>
                                <table className="w-full text-sm">
                                    <tbody className="text-muted-foreground">
                                        <tr><td className="pr-3 py-0.5 text-foreground/60 tabular-nums">1</td><td>Basdrum</td></tr>
                                        <tr><td className="pr-3 py-0.5 text-foreground/60 tabular-nums">2</td><td>Snare 1</td></tr>
                                        <tr><td className="pr-3 py-0.5 text-foreground/60 tabular-nums">3</td><td>Snare 2</td></tr>
                                        <tr><td className="pr-3 py-0.5 text-foreground/60 tabular-nums">4</td><td>Overhead L</td></tr>
                                        <tr><td className="pr-3 py-0.5 text-foreground/60 tabular-nums">5</td><td>Overhead R</td></tr>
                                        <tr><td className="pr-3 py-0.5 text-foreground/60 tabular-nums">6</td><td>Basgitaar</td></tr>
                                        <tr><td className="pr-3 py-0.5 text-foreground/60 tabular-nums">7</td><td>Gitaar</td></tr>
                                        <tr><td className="pr-3 py-0.5 text-foreground/60 tabular-nums">8</td><td>Piano L</td></tr>
                                        <tr><td className="pr-3 py-0.5 text-foreground/60 tabular-nums">9</td><td>Piano R</td></tr>
                                        <tr><td className="pr-3 py-0.5 text-foreground/60 tabular-nums">10</td><td>Synthesizer</td></tr>
                                        <tr><td className="pr-3 py-0.5 text-foreground/60 tabular-nums">11</td><td>Piano trompettist</td></tr>
                                        <tr><td className="pr-3 py-0.5 text-foreground/60 tabular-nums">12</td><td>Saxofoon</td></tr>
                                        <tr><td className="pr-3 py-0.5 text-foreground/60 tabular-nums">13</td><td>Trompet</td></tr>
                                        <tr><td className="pr-3 py-0.5 text-foreground/60 tabular-nums">14</td><td>Spraakmicrofoon</td></tr>
                                        <tr><td className="pr-3 py-0.5 text-foreground/60 tabular-nums">15</td><td>Percussie L</td></tr>
                                        <tr><td className="pr-3 py-0.5 text-foreground/60 tabular-nums">16</td><td>Percussie R</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Monitorlijst + Voorstelrondje */}
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-base font-bold mb-4">Monitorlijst</h2>
                                    <table className="w-full text-sm">
                                        <tbody className="text-muted-foreground">
                                            <tr><td className="pr-3 py-0.5 text-foreground/60">A</td><td>Drums</td></tr>
                                            <tr><td className="pr-3 py-0.5 text-foreground/60">B</td><td>Basgitaar</td></tr>
                                            <tr><td className="pr-3 py-0.5 text-foreground/60">C</td><td>Gitaar</td></tr>
                                            <tr><td className="pr-3 py-0.5 text-foreground/60">D</td><td>Toetsen</td></tr>
                                            <tr><td className="pr-3 py-0.5 text-foreground/60">E</td><td>Saxofoon</td></tr>
                                            <tr><td className="pr-3 py-0.5 text-foreground/60">F</td><td>Trompet</td></tr>
                                            <tr><td className="pr-3 py-0.5 text-foreground/60">G</td><td>Percussie</td></tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div>
                                    <h2 className="text-base font-bold mb-4">Voorstelrondje</h2>
                                    <table className="w-full text-sm">
                                        <tbody className="text-muted-foreground">
                                            <tr><td className="pr-3 py-0.5 font-medium text-foreground">Drummer</td><td>Jan</td></tr>
                                            <tr><td className="pr-3 py-0.5 font-medium text-foreground">Bassist</td><td>Niels</td></tr>
                                            <tr><td className="pr-3 py-0.5 font-medium text-foreground">Gitarist</td><td>Thijmen</td></tr>
                                            <tr><td className="pr-3 py-0.5 font-medium text-foreground">Toetsenist</td><td>Jascha</td></tr>
                                            <tr><td className="pr-3 py-0.5 font-medium text-foreground">Saxofonist</td><td>Jisk</td></tr>
                                            <tr><td className="pr-3 py-0.5 font-medium text-foreground">Trompettist</td><td>Geert</td></tr>
                                            <tr><td className="pr-3 py-0.5 font-medium text-foreground">Percussionist</td><td>Matthijs</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Wat nemen wij mee? */}
                            <div>
                                <h2 className="text-base font-bold mb-4">Wat nemen wij mee?</h2>
                                <ul className="text-sm text-muted-foreground space-y-1.5">
                                    <li>Cymbals, 2x snare drum, Basgitaar + effecten</li>
                                    <li>Gitaar + effecten</li>
                                    <li>Eigen toetsen + keystands</li>
                                    <li>Trompet + microfoon</li>
                                    <li>Saxofoon + microfoon</li>
                                </ul>
                            </div>

                            {/* Wat hebben we nodig? */}
                            <div>
                                <h2 className="text-base font-bold mb-4">Wat hebben we nodig?</h2>
                                <ul className="text-sm text-muted-foreground space-y-1.5">
                                    <li>Drum kit exc. cymbals en snare drums.</li>
                                    <li>Versterker basgitaar</li>
                                    <li>Versterker gitaar</li>
                                    <li>Stroomvoorziening</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </Container>



                <Container>
                    <h2 className="text-base font-bold mb-4">Hoe wij willen klinken</h2>
                    <p className="text-muted-foreground">
                        Snarky puppy, FORQ, Jungle by Night, New Cool Collective
                    </p>
                </Container>

                <Container>
                    <div className="border-t border-border/40 pt-6 space-y-3">
                        <p className="text-xs text-muted-foreground/70 italic max-w-prose">
                            <span className="not-italic">*</span> Het kan voorkomen dat wij niet altijd met volledige bezetting spelen. In dat geval nemen wij altijd tijdig contact op met de venue om dit af te stemmen.
                        </p>
                        <p className="text-xs text-muted-foreground/70 italic max-w-prose">
                            <span className="not-italic">*</span> Wij maken graag video-opnames van onze shows. Hiervoor zetten wij graag een camera op statief achter in de zaal of bij FOH.
                        </p>
                    </div>
                </Container>


            </PageContent>
        </Page>
    );
}

