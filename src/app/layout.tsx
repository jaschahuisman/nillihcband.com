import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://nillihcband.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Nillihc | Post-jazz funk fusion uit Rotterdam",
    template: "%s | Nillihc"
  },
  description: "Dit is Nillihc. Post-jazz funk fusion band uit Rotterdam. Dansbare ritmes, dikke baslijnen en jazzy blazers smelten samen tot psychedelische grooves.",
  keywords: ["Nillihc", "Post-jazz", "Band Rotterdam", "Collectief", "Festivalband", "Jazz fusion", "Funk band", "Live muziek", "Rotterdam band", "Nederlandse band"],
  authors: [{ name: "Nillihc" }],
  creator: "Nillihc",
  publisher: "Nillihc",
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
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: siteUrl,
    siteName: "Nillihc",
    title: "Nillihc | Post-jazz funk fusion uit Rotterdam",
    description: "Dit is Nillihc. Post-jazz funk fusion band uit Rotterdam. Dansbare ritmes, dikke baslijnen en jazzy blazers smelten samen tot psychedelische grooves.",
    images: [
      {
        url: "/images/opengraph.png",
        width: 1200,
        height: 630,
        alt: "Nillihc - Post-jazz funk fusion band uit Rotterdam",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nillihc | Post-jazz funk fusion band uit Rotterdam",
    description: "Dit is Nillihc. Post-jazz funk fusion band uit Rotterdam. Dansbare ritmes, dikke baslijnen en jazzy blazers smelten samen tot psychedelische grooves.",
    images: ["/images/opengraph.png"],
    creator: "@nillihcband",
  },
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
  category: "music",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "name": "Nillihc",
    "description": "Post-jazz funk fusion band uit Rotterdam. Dansbare ritmes, dikke baslijnen en jazzy blazers smelten samen tot psychedelische grooves.",
    "url": siteUrl,
    "logo": `${siteUrl}/images/logo-sm.jpg`,
    "image": `${siteUrl}/images/opengraph.png`,
    "sameAs": [
      "https://www.instagram.com/nillihcband/",
      "https://www.facebook.com/NillihcBand/",
      "https://www.youtube.com/@nillihcband",
      "https://open.spotify.com/artist/3LAoxEz5BGdijXj4YG2f6v"
    ],
    "genre": ["Post-jazz", "Funk", "Fusion", "Jazz"],
    "areaServed": {
      "@type": "City",
      "name": "Rotterdam",
      "addressCountry": "NL"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "info@nillihcband.com",
      "telephone": "+31620672161",
      "contactType": "Booking"
    }
  };

  return (
    <html lang="nl">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
