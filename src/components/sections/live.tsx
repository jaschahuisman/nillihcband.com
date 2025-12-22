"use client";

import { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/layout/container";
import { FiX } from "react-icons/fi";
import Image from "next/image";

type VideoItem = {
    id: string;
    videoId: string;
    title?: string;
};

const videoItems: VideoItem[] = [
    { id: "video-0", videoId: "_dwec2wJG7U" },
    { id: "video-1", videoId: "pvRvFSj3E9Y" },
    { id: "video-2", videoId: "f-r8Jy3S14w" },
    { id: "video-3", videoId: "noNvg9Cqxuo" },
];

function Live() {
    const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

    const handleVideoClick = (video: VideoItem) => {
        setActiveVideo(video);
    };

    const handleClose = useCallback(() => {
        setActiveVideo(null);
    }, []);

    // Close modal on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleClose();
            }
        };

        if (activeVideo) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [activeVideo, handleClose]);

    const getThumbnailUrl = (videoId: string) => {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    };

    const getEmbedUrl = (videoId: string) => {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    };

    const getAutoplayMutedUrl = (videoId: string) => {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&rel=0&controls=1&modestbranding=1`;
    };

    return (
        <>
            <section
                className="bg-background overflow-hidden"
                aria-label="Nillihc live video's en optredens"
            >
                <Container className="py-8 md:py-12">
                    <div className="flex flex-col gap-2 mb-8">
                        <h2 className="text-4xl font-bold">Nillihc Live</h2>
                        <p className="text-lg font-normal">
                            Check Nillihc's live optredens en performances.
                        </p>
                    </div>

                    {/* Featured large video - autoplay muted */}
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-6">
                        <iframe
                            className="w-full h-full"
                            src={getAutoplayMutedUrl(videoItems[0].videoId)}
                            title={videoItems[0].title || "Nillihc live optreden video 1"}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </Container>

                {/* Smaller videos with playful offset - breaking out 2rem from container on desktop */}
                <Container className="pb-8 md:pb-12">
                    <div className="px-2 md:px-0 md:-mx-8 grid grid-cols-3 gap-2 md:gap-4">
                        {videoItems.slice(1).map((video, idx) => (
                            <div
                                key={video.id}
                                className="relative aspect-video rounded-lg md:rounded-xl overflow-hidden cursor-pointer group transition-transform duration-300"
                                style={{
                                    transform: `translateY(${idx % 2 === 0 ? '0' : '1rem'})`,
                                }}
                                onClick={() => handleVideoClick(video)}
                            >
                                <Image
                                    src={getThumbnailUrl(video.videoId)}
                                    alt={
                                        video.title || `Nillihc live optreden video ${idx + 2}`
                                    }
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    draggable={false}
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors duration-300">
                                    <div className="w-7 h-7 md:w-12 md:h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                                        <svg
                                            className="w-3.5 h-3.5 md:w-6 md:h-6 text-foreground ml-0.5"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Fullscreen Video Modal */}
            {activeVideo && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={handleClose}
                >
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 md:top-8 md:right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 z-10"
                        aria-label="Sluiten"
                    >
                        <FiX className="w-6 h-6" />
                    </button>

                    <div
                        className="w-full max-w-6xl mx-4 aspect-video animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <iframe
                            className="w-full h-full rounded-lg"
                            src={getEmbedUrl(activeVideo.videoId)}
                            title={activeVideo.title || "Video"}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}
        </>
    );
}

export { Live };
