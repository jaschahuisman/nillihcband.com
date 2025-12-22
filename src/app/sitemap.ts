import { MetadataRoute } from "next";

const BASE_URL = "https://nillihcband.com";

export default function sitemap(): MetadataRoute.Sitemap {
  // Static pages with their configurations
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
      images: [
        `${BASE_URL}/opengraph.png`,
        `${BASE_URL}/hero-desktop.webp`,
        `${BASE_URL}/presskit/presspic-landscape.webp`,
      ],
    },
    {
      url: `${BASE_URL}/over`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
      images: [
        `${BASE_URL}/presskit/presspic-portrait.webp`,
        `${BASE_URL}/presskit/presspic-square.jpg`,
      ],
    },
    {
      url: `${BASE_URL}/epk`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
      images: [
        `${BASE_URL}/presskit/presspic-landscape.webp`,
        `${BASE_URL}/presskit/presspic-portrait.webp`,
        `${BASE_URL}/presskit/presspic-square.jpg`,
      ],
    },
    {
      url: `${BASE_URL}/rider`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
      images: [`${BASE_URL}/rider/rider.jpg`],
    },
  ];

  return staticPages;
}
