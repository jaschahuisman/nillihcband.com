import { MetadataRoute } from "next";

const BASE_URL = "https://nillihcband.com";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/api/",
                    "/_next/",
                    "/private/",
                ],
            },
            {
                // Googlebot gets full access with specific settings
                userAgent: "Googlebot",
                allow: "/",
                disallow: ["/api/", "/_next/"],
            },
            {
                // Googlebot-Image for image search
                userAgent: "Googlebot-Image",
                allow: [
                    "/presskit/",
                    "/hero-desktop.webp",
                    "/hero-mobile.webp",
                    "/rider/",
                    "/logo.svg",
                ],
            },
            {
                // Bingbot
                userAgent: "Bingbot",
                allow: "/",
                disallow: ["/api/", "/_next/"],
            },
            {
                // Facebook crawler for Open Graph
                userAgent: "facebookexternalhit",
                allow: "/",
            },
            {
                // Twitter/X crawler
                userAgent: "Twitterbot",
                allow: "/",
            },
            {
                // LinkedIn crawler
                userAgent: "LinkedInBot",
                allow: "/",
            },
            {
                // Block AI training crawlers (optional - remove if you want AI indexing)
                userAgent: "GPTBot",
                disallow: "/",
            },
            {
                userAgent: "ChatGPT-User",
                disallow: "/",
            },
            {
                userAgent: "CCBot",
                disallow: "/",
            },
            {
                userAgent: "anthropic-ai",
                disallow: "/",
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
        host: BASE_URL,
    };
}
