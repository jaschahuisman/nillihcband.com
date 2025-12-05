import { useRef, useState, useEffect } from "react";
import Container from "@/components/layout/Container";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { cn } from "@/utils";
import Image from "next/image";

type MediaItem = {
    src: string;
    id: string;
};

type TextItem = {
    text: string;
    id: string;
};

type Item =
    | { type: 'image'; data: MediaItem }
    | { type: 'text'; data: TextItem };

const mediaItems: MediaItem[] = [
    { src: "/images/synth.jpg", id: "synth" },
    { src: "/images/thijmen.jpg", id: "thijmen" },
    { src: "/images/kring.jpg", id: "kring" },
    { src: "/images/contact.jpg", id: "contact" },
    { src: "/images/bridge.jpg", id: "bridge" },
    { src: "/images/big-rivers.jpg", id: "big-rivers" },
    { src: "/images/matthijs.jpg", id: "matthijs" },
];

const textItems: TextItem[] = [
    { text: "Nillihc", id: "nillihc" },
    { text: "in", id: "in" },
    { text: "beeld", id: "beeld" },
];

export default function Media() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = container.clientWidth * 0.8;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0));
        setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
        const walk = (x - startX) * 2;
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollLeft - walk;
        }
    };

    // Prepare items list
    // Mix text and images into a single stream
    const items: Item[] = [];

    const startText = textItems.find(t => t.text === "Nillihc") || textItems[0];
    const remainingTexts = textItems.filter(t => t.id !== startText.id);
    const remainingImages = [...mediaItems]; // Copy

    // Insert title first
    items.push({ type: 'text', data: startText });

    // Helper to insert remaining texts at specific intervals
    remainingImages.forEach((img, idx) => {
        items.push({ type: 'image', data: img });

        // Inject texts
        if (idx === 2 && remainingTexts.find(t => t.text === "in")) {
            items.push({ type: 'text', data: remainingTexts.find(t => t.text === "in")! });
        }
        if (idx === 5 && remainingTexts.find(t => t.text === "beeld")) {
            items.push({ type: 'text', data: remainingTexts.find(t => t.text === "beeld")! });
        }
    });

    // Create columns pattern: A (2 items), B (1 item), A (2 items), ...
    const columns: Item[][] = [];
    let currentIdx = 0;
    let isSplitColumn = true; // Start with "landscape" column (2 items)

    while (currentIdx < items.length) {
        // If split column, take 2 items. If full column, take 1 item.
        const count = isSplitColumn ? 2 : 1;

        // Handle case where we run out of items
        const colItems = items.slice(currentIdx, currentIdx + count);

        if (colItems.length > 0) {
            columns.push(colItems);
            currentIdx += count;

            // Toggle pattern
            isSplitColumn = !isSplitColumn;
        } else {
            break;
        }
    }

    return (
        <section className="overflow-hidden bg-background" aria-label="Nillihc foto's en media">
            <Container className="max-w-none! px-0!">
                <div className="pl-4 md:pl-12 lg:pl-24 mb-8 flex justify-center md:justify-end items-end pr-4 md:pr-12">
                    <div className="flex gap-4">
                        <button
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            className="p-4 rounded-full border border-border hover:bg-foreground hover:text-background disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                            aria-label="Scroll left"
                        >
                            <FiArrowLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                            className="p-4 rounded-full border border-border hover:bg-foreground hover:text-background disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                            aria-label="Scroll right"
                        >
                            <FiArrowRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollContainerRef}
                    onScroll={checkScroll}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    className={cn(
                        // Flex row now, since we have explicit columns
                        "flex gap-4 h-[500px] sm:h-[600px] overflow-x-auto overflow-y-hidden pb-12 px-4 scrollbar-hide",
                        isDragging ? "cursor-grabbing" : "cursor-grab snap-x snap-mandatory"
                    )}
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {columns.map((col, idx) => (
                        <div
                            key={`col-${idx}`}
                            className={cn("flex flex-col gap-4 min-w-[300px] w-[80vw] sm:w-[400px] h-full flex-none snap-center", idx % 2 === 0 ? "translate-y-0" : "translate-y-4")}
                        >
                            {col.map((item, i) => (
                                <div
                                    key={`${item.data.id}-${i}`}
                                    className={cn(
                                        "relative overflow-hidden rounded-xl select-none w-full flex-1",
                                        // flex-1 ensures they split space evenly or take full height
                                    )}
                                >
                                    {item.type === 'image' ? (
                                        <Image
                                            src={item.data.src}
                                            alt={`Nillihc band foto - ${item.data.id === 'synth' ? 'Synthesizer en muziek instrumenten' : item.data.id === 'thijmen' ? 'Bandlid Thijmen' : item.data.id === 'kring' ? 'Nillihc band in kring' : item.data.id === 'contact' ? 'Contact Nillihc' : item.data.id === 'bridge' ? 'Nillihc op brug' : item.data.id === 'big-rivers' ? 'Nillihc bij Big Rivers' : item.data.id === 'matthijs' ? 'Bandlid Matthijs' : 'Nillihc band'}`}
                                            fill
                                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                            draggable={false}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center p-8">
                                            <h2 className="text-7xl md:text-8xl font-bold tracking-tighter text-foreground">
                                                {item.data.text}
                                            </h2>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* Padding element for scroll end */}
                    <div className="w-8 h-full flex-none" />
                </div>
            </Container>
        </section>
    );
}
