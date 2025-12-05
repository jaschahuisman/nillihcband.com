import Container from "@/components/layout/Container";
import Image from "next/image";

export default function Contact() {
    return (
        <section aria-label="Contact Nillihc">
            <Container className="py-8 md:py-12">
                <h2 className="text-4xl font-bold text-right">Contact</h2>
                <div className="flex flex-col-reverse md:flex-row items-end justify-end gap-6 md:gap-8 md:mt-6 w-full ">

                    <div className="flex flex-col gap-2 text-2xl w-full md:w-auto text-right">
                        <a
                            title="Instagram"
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://www.instagram.com/nillihcband/"
                            className="underline hover:text-primary transition"
                        >
                            @nillihcband
                        </a>
                        <a
                            title="Email"
                            target="_blank"
                            rel="noopener noreferrer"
                            href="mailto:info@nillihcband.com"
                            className="underline hover:text-primary transition"
                        >
                            info@nillihcband.com
                        </a>
                        <a
                            title="Telefoon"
                            target="_blank"
                            rel="noopener noreferrer"
                            href="tel:+31620672161"
                            className="underline hover:text-primary transition"
                        >
                            +31 6 20672161
                        </a>
                        <p title="Locatie" className="text-sm text-muted-foreground mt-4">
                            Rottterdam, Nederland
                        </p>
                    </div>
                    <div className="shrink-0 flex justify-end w-full md:w-auto">
                        <div className="relative bg-secondary w-40 h-56 md:w-48 md:h-72 rounded-xl overflow-hidden">
                            <Image
                                src="/images/contact.jpg"
                                alt="Contact Nillihc band voor boekingen en informatie"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    )
}