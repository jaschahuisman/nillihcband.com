import React from "react";

interface SpotifyEmbedProps {
    url: string;
    height?: number | string; // Allow custom height, default 352 like the example
    title?: string;
}

function SpotifyEmbed({ url, height = 352, title = "Spotify Embed" }: SpotifyEmbedProps) {
    return (
        <div className="w-full rounded-2xl overflow-hidden" style={{ maxWidth: "100%" }}>
            <iframe
                data-testid="embed-iframe"
                style={{ borderRadius: "12px" }}
                src={url}
                width="100%"
                height={height}
                frameBorder={0}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                allowFullScreen
                title={title}
                className="w-full"
            />
        </div>
    );
}

export { SpotifyEmbed };