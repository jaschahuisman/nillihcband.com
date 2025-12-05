"use client"

import { motion } from "motion/react"
import Container from "@/components/layout/Container"
import { cn } from "@/utils"

type Musician = {
    name: string
    description: string

}

const musicians: Musician[] = [


    {
        "name": "Jan Timmerman",
        "description": "Drummer met ADHD-superkrachten."
    },
    {
        "name": "Thijmen Sas",
        "description": "Gitarist met een arsenaal aan effecten."
    },
    {
        "name": "Niels Sas",
        "description": "Bassist en grappen- en groovemaster"
    },
    {
        "name": "Geert Timmerman",
        "description": "Trompettist met virtuoso flaws"
    },
    {
        "name": "Jisk van der Veen",
        "description": "Saxofonist, maakt funk sexy again"
    },
    {
        "name": "Matthijs Verzijden",
        "description": "Percussionist. Kan iedereen laten dansen."
    },
    {
        "name": "Jascha Huisman",
        "description": "Toetsenist en freaky synth wizard."
    }


]

export default function Musicians() {
    return (
        <section className="bg-background py-16 md:py-24" aria-label="Nillihc muzikanten">
            <Container>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl font-bold mb-12 md:mb-16 text-center"
                >
                    Wij zijn Nillihc
                </motion.h2>

                <div className="flex flex-wrap justify-center gap-6 md:gap-8 max-w-5xl mx-auto">
                    {musicians.map((musician, index) => {
                        const rotation = index % 3 === 0 ? '2deg' : index % 3 === 1 ? '-2deg' : '1deg'

                        return (
                            <motion.div
                                key={musician.name}
                                initial={{ opacity: 0, y: 30, rotate: rotation }}
                                whileInView={{ opacity: 1, y: 0, rotate: rotation }}
                                whileHover={{ rotate: '0deg', scale: 1.05 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="flex flex-col items-center text-center max-w-[150px]"
                            >
                                {/* Circular avatar */}
                                <div className={cn(
                                    "relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden mb-3",
                                    "border-2 border-border group-hover:border-primary transition-colors duration-300",

                                )}>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl md:text-3xl font-bold text-primary-foreground opacity-30">
                                            {musician.name.charAt(0)}
                                        </span>
                                    </div>
                                    {/* Decorative pattern overlay */}
                                    <div className="absolute inset-0 bg-linear-to-br from-transparent via-transparent to-black/10" />
                                </div>

                                {/* Name and description */}
                                <h3 className="text-lg md:text-xl font-bold mb-1 text-foreground">
                                    {musician.name}
                                </h3>
                                <p className="text-muted-foreground text-xs">
                                    {musician.description}
                                </p>
                            </motion.div>
                        )
                    })}
                </div>
            </Container>
        </section>
    )
}

