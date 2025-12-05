import { FaArrowRight } from "react-icons/fa";
import Container from "@/components/layout/Container";


export default function Bio() {
    return (
        <section className="border-y border-secondary bg-muted text-muted-foreground" aria-label="Over Nillihc">
            <Container className="py-16 md:py-16">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight max-w-3xl">Nillihc maakt er een <span className="shaky text-foreground tracking-tighter">feestje</span> van. Dansbare ritmes, dikke baslijnen en jazzy blazers.</h2>
                <a href={"/epk.pdf"} target="_blank" rel="noopener noreferrer" className="font-bold flex items-center gap-2 underline" aria-label="Download Nillihc EPK en Rider">EPK & Rider <FaArrowRight /></a>
            </Container>
        </section>
    )
}