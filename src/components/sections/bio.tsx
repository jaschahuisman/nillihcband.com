import { Container } from "@/components/layout/container";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowRightIcon, ImageIcon } from "lucide-react";

function Bio() {
    return (
        <>
            <Container>
                <Separator className="bg-muted-foreground/50" />
            </Container>
            <Container id="bio">
                <div className="flex flex-col gap-2 mb-8">
                    <p className="text-4xl font-bold mb-4 leading-snug max-w-xl">Nillihc maakt er een <span className="dancing-text text-primary inline-block">feestje</span> van. Dansbare ritmes, dikke baslijnen en jazzy blazers. </p>
                    <p className="max-w-prose">Deze zevenkoppige band uit Rotterdam maakt energieke, originele instrumentale muziek op het snijvlak van post-jazz, funk en fusion. Nillihc's sound kenmerkt zich door catchy, dansbare melodieën en een onmiskenbaar psychedelisch randje.</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                    <Button asChild variant={"outline"}>
                        <Link href={"/over"}>
                            Lees meer over Nillihc <ArrowRightIcon />
                        </Link>
                    </Button>
                    <Button asChild variant={"outline"}>
                        <Link href={"/epk"}>
                            Bekijk onze EPK <ImageIcon />
                        </Link>
                    </Button>
                </div>
            </Container>
        </>
    );
}

export { Bio };