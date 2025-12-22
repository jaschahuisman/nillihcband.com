import type { Metadata } from "next";
import { Stack_Sans_Headline } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/footer";

const stackSansHeadline = Stack_Sans_Headline({
  variable: "--font-stack-sans-headline",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nillihc.nl"),
  title: {
    default: "Nillihc | Rotterdamse Jazz Funk Band",
    template: "%s | Nillihc",
  },
  description:
    "Nillihc is een zevenkoppige instrumentale band uit Rotterdam. Post-jazz, funk en fusion met dikke baslijnen, jazzy blazers en dansbare grooves. Boek ons voor je evenement!",
  keywords: [
    "Nillihc",
    "Nillihc band",
    "Rotterdam jazz",
    "funk band Nederland",
    "post-jazz",
    "instrumentale muziek",
    "live band boeken",
    "jazz fusion",
    "Nederlandse band",
    "Rotterdam muziek",
    "Grote Prijs van Dordt",
  ],
  authors: [{ name: "Nillihc" }],
  creator: "Nillihc",
  publisher: "Nillihc",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://nillihc.nl",
    siteName: "Nillihc",
    title: "Nillihc | Rotterdamse Jazz Funk Band",
    description:
      "Zevenkoppige instrumentale band uit Rotterdam. Post-jazz, funk en fusion met dikke baslijnen en dansbare grooves. Winnaar Grote Prijs van Dordt 2025.",
    images: [
      {
        url: "/presskit/presspic-landscape.webp",
        width: 1200,
        height: 630,
        alt: "Nillihc - Rotterdamse jazz funk band",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nillihc | Rotterdamse Jazz Funk Band",
    description:
      "Zevenkoppige instrumentale band uit Rotterdam. Post-jazz, funk en fusion met dikke baslijnen en dansbare grooves.",
    images: ["/presskit/presspic-landscape.webp"],
    creator: "@nillihcband",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Voeg je Google Search Console verificatie code hier toe
    // google: "je-verificatie-code",
  },
  alternates: {
    canonical: "https://nillihc.nl",
  },
  category: "music",
};

// JSON-LD Structured Data voor de hele site
const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://nillihc.nl/#website",
      url: "https://nillihc.nl",
      name: "Nillihc",
      description: "Officiële website van Nillihc - Rotterdamse jazz funk band",
      publisher: { "@id": "https://nillihc.nl/#musicgroup" },
      inLanguage: "nl-NL",
    },
    {
      "@type": "MusicGroup",
      "@id": "https://nillihc.nl/#musicgroup",
      name: "Nillihc",
      alternateName: ["Nillihc Band", "Nillihc Rotterdam"],
      url: "https://nillihc.nl",
      logo: "https://nillihc.nl/logo.svg",
      image: "https://nillihc.nl/presskit/presspic-landscape.webp",
      description:
        "Nillihc is een zevenkoppige instrumentale jazzformatie uit Rotterdam die jazz een frisse, groovy twist geeft door een unieke mix van jazz, funk en fusion.",
      foundingDate: "2017-02",
      foundingLocation: {
        "@type": "Place",
        name: "Rotterdam",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Rotterdam",
          addressRegion: "Zuid-Holland",
          addressCountry: "NL",
        },
      },
      genre: ["Post-Jazz", "Funk", "Fusion", "Jazz", "Instrumentale muziek"],
      email: "info@nillihcband.com",
      telephone: "+31620672161",
      sameAs: [
        "https://open.spotify.com/artist/3LAoxEz5BGdijXj4YG2f6v",
        "https://music.apple.com/nl/artist/nillihc/1370500346",
        "https://www.instagram.com/nillihcband",
        "https://www.facebook.com/nillihcband",
        "https://www.youtube.com/@nillihcband",
        "https://soundcloud.com/nillihc-band",
        "https://nillihc.bandcamp.com",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteStructuredData) }}
        />
      </head>
      <body className={`${stackSansHeadline.variable} font-sans antialiased`}>
        {children}
        <Footer />
      </body>
    </html>
  );
}
