import React from "react";

function getYouTubeVideoId(url: string): string | null {
    // Handles typical youtube urls: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID
    try {
        const parsed = new URL(url);
        if (parsed.hostname === "youtu.be") {
            return parsed.pathname.slice(1);
        }
        if (parsed.hostname.includes("youtube.com")) {
            return parsed.searchParams.get("v");
        }
        return null;
    } catch {
        return null;
    }
}

interface YoutubeVideoEmbedProps {
    url: string;
    title?: string;
    start?: number; // in seconds
    autoplay?: boolean;
    cc_load_policy?: boolean;
    controls?: boolean;
    modestbranding?: boolean;
    rel?: boolean;
    disablekb?: boolean;
    fs?: boolean;
    loop?: boolean;
    playlist?: string;
    // More params can be added here as needed
}

function YoutubeVideoEmbed({
    url,
    title = "YouTube video player",
    start,
    autoplay = false,
    cc_load_policy = false,
    controls = true,
    modestbranding = true,
    rel = false,
    disablekb = false,
    fs = true,
    loop = false,
    playlist,
}: YoutubeVideoEmbedProps) {
    const id = getYouTubeVideoId(url);

    if (!id) {
        return (
            <div className="aspect-video w-full flex items-center justify-center text-destructive bg-muted/50 rounded">
                <span className="text-sm">Invalid YouTube URL</span>
            </div>
        );
    }

    // Build embed URL parameters
    const params = new URLSearchParams({
        autoplay: autoplay ? "1" : "0",
        cc_load_policy: cc_load_policy ? "1" : "0",
        controls: controls ? "1" : "0",
        modestbranding: modestbranding ? "1" : "0",
        rel: rel ? "1" : "0",
        disablekb: disablekb ? "1" : "0",
        fs: fs ? "1" : "0",
        loop: loop ? "1" : "0",
        ...(start !== undefined ? { start: String(start) } : {}),
        ...(playlist ? { playlist } : loop ? { playlist: id } : {}),
    });

    const embedUrl = `https://www.youtube.com/embed/${id}?${params.toString()}`;

    return (
        <div className="aspect-video w-full rounded-2xl overflow-hidden">
            <iframe
                src={embedUrl}
                title={title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
                referrerPolicy="strict-origin-when-cross-origin"
            />
        </div>
    );
}

export { YoutubeVideoEmbed };