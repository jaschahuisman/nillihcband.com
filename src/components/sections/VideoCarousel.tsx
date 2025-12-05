import { useRef, useState, useEffect } from "react";
import Container from "@/components/layout/Container";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { cn } from "@/utils";
import Image from "next/image";

type VideoItem = {
    id: string;
    videoId: string;
    title?: string;
};

const videoItems: VideoItem[] = [
    { id: "video-1", videoId: "pvRvFSj3E9Y" },
    { id: "video-2", videoId: "f-r8Jy3S14w" },
    { id: "video-3", videoId: "noNvg9Cqxuo" },
];

export default function VideoCarousel() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

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

    const handleVideoClick = (videoId: string) => {
        setPlayingVideoId(videoId);
    };

    const getThumbnailUrl = (videoId: string) => {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    };

    const getEmbedUrl = (videoId: string) => {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    };

    return (
        <section className="overflow-hidden bg-background" aria-label="Nillihc live video's en optredens">
            <Container className="py-8 md:py-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">

                    <div className="flex flex-col gap-2">
                        <h2 className="text-4xl font-bold">Nillihc Live</h2>
                        <p className="text-lg font-normal">Bekijk onze live optredens en performances.</p>
                    </div>

                    {/* Desktop controls - same row */}
                    <div className="hidden md:flex items-end gap-4">
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

                {/* Mobile controls - below subtitle */}
                <div className="flex justify-center md:hidden items-end mb-8">
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
                        "flex gap-6 h-[400px] sm:h-[500px] overflow-x-auto overflow-y-hidden pb-12 scrollbar-hide",
                        isDragging ? "cursor-grabbing" : "cursor-grab snap-x snap-mandatory"
                    )}
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {videoItems.map((video, idx) => (
                        <div
                            key={video.id}
                            className={cn(
                                "relative min-w-[320px] w-[85vw] sm:w-[500px] h-full flex-none snap-center rounded-xl overflow-hidden",
                                idx % 2 === 0 ? "translate-y-0" : "translate-y-8"
                            )}
                        >
                            {playingVideoId === video.videoId ? (
                                <iframe
                                    className="w-full h-full"
                                    src={getEmbedUrl(video.videoId)}
                                    title={video.title || `Video ${idx + 1}`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <div
                                    className="relative w-full h-full cursor-pointer group"
                                    onClick={() => handleVideoClick(video.videoId)}
                                >
                                    <Image
                                        src={getThumbnailUrl(video.videoId)}
                                        alt={video.title || `Nillihc live optreden video ${idx + 1}`}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        draggable={false}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors duration-300">
                                        <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center group-hover:bg-white transition-colors duration-300">
                                            <svg
                                                className="w-10 h-10 text-foreground ml-1"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Padding element for scroll end */}
                    <div className="w-8 h-full flex-none" />
                </div>
            </Container>
        </section>
    );
}

