import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function Footer() {
    const [displayedText, setDisplayedText] = useState("");
    const [hasAnimated, setHasAnimated] = useState(false);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const text = "Stay Nillihc.";

    useEffect(() => {
        if (hasAnimated || !headingRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated) {
                        setHasAnimated(true);
                        let currentIndex = 0;

                        const typeWriter = () => {
                            if (currentIndex < text.length) {
                                setDisplayedText(text.slice(0, currentIndex + 1));
                                currentIndex++;
                                setTimeout(typeWriter, 100); // Adjust speed here (milliseconds per letter)
                            }
                        };

                        typeWriter();
                    }
                });
            },
            {
                threshold: 0.3, // Trigger when 30% of the element is visible
            }
        );

        observer.observe(headingRef.current);

        return () => {
            if (headingRef.current) {
                observer.unobserve(headingRef.current);
            }
        };
    }, [hasAnimated, text]);

    return (
        <footer className="relative mt-20">
            <div className="absolute top-0 left-0 w-full py-4">
                <h1 ref={headingRef} className="text-2xl md:text-4xl font-bold text-center text-muted-foreground">
                    {displayedText}
                    {displayedText.length < text.length && <span className="animate-pulse">|</span>}
                </h1>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="absolute bottom-0 left-0 w-full py-4 md:block hidden z-10"
            >
                <div className="w-fit mx-auto bg-muted/25 text-muted-foreground backdrop-blur-md border-muted-foreground/25 border px-4 py-2 rounded-full">
                    <p className="text-xs md:text-sm text-muted-foreground text-center">
                        &copy; {new Date().getFullYear()} Nillihc. Alle rechten voorbehouden.
                    </p>
                </div>
            </motion.div>
            <div className="relative w-full h-full max-h-[80vh]">
                <Image src="/images/footer.webp" alt="Nillihc band footer afbeelding" height={1080} width={1920} className="object-cover w-full" />
            </div>
            <div className="md:hidden block bg-black text-primary py-4">
                <p className="text-xs md:text-sm text-center">
                    &copy; {new Date().getFullYear()} Nillihc. Alle rechten voorbehouden.
                </p>
            </div>
        </footer>
    )
}