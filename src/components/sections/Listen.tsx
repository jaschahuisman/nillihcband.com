import Container from "@/components/layout/Container";
import { FaSpotify, FaApple, FaDeezer, FaSoundcloud } from "react-icons/fa";

export default function Listen() {
    return (
        <section aria-label="Luister naar Nillihc muziek">
            <Container className="py-8 md:py-12">
                <div className="flex flex-col gap-2">
                    <h2 className="text-4xl font-bold">Luister Nillihc</h2>
                    <p className="text-lg font-normal">Benieuwd naar hoe wij klinken? Beluister onze muziek hier.</p>
                </div>

                <div>
                    <iframe
                        className="w-full h-96"
                        data-testid="embed-iframe"
                        src="https://open.spotify.com/embed/artist/3LAoxEz5BGdijXj4YG2f6v?utm_source=generator"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        title="Nillihc Spotify player"
                        aria-label="Spotify muziek speler voor Nillihc"
                    ></iframe>
                </div>

                <nav aria-label="Muziek streaming platforms" className="flex gap-4 justify-center">
                    <a href="https://open.spotify.com/artist/3LAoxEz5BGdijXj4YG2f6v?ref=nillihc" target="_blank" rel="noopener noreferrer" className="text-foreground" aria-label="Luister Nillihc op Spotify">
                        <FaSpotify className="size-6" />
                    </a>
                    <a href="https://music.apple.com/nl/artist/nillihc/1370500346?l=en-GB&ref=nillihc" target="_blank" rel="noopener noreferrer" className="text-foreground" aria-label="Luister Nillihc op Apple Music">
                        <FaApple className="size-6" />
                    </a>
                    <a href="https://www.deezer.com/us/artist/14527457?ref=nillihc" target="_blank" rel="noopener noreferrer" className="text-foreground" aria-label="Luister Nillihc op Deezer">
                        <FaDeezer className="size-6" />
                    </a>
                    <a href="https://soundcloud.com/nillihc-band?ref=nillihc" target="_blank" rel="noopener noreferrer" className="text-foreground" aria-label="Luister Nillihc op SoundCloud">
                        <FaSoundcloud className="size-6" />
                    </a>
                </nav>
            </Container>
        </section>
    )
}