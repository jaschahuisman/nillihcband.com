/**
 * Single source of truth for everything the outreach model is allowed to claim
 * about Nillihc. The model is instructed never to invent facts beyond this file
 * plus the venue research, so keep it accurate and up to date.
 */

export type BandRelease = {
  title: string;
  type: "EP" | "Single";
  year: string;
};

export type BandHighlight = {
  year: string;
  title: string;
};

export const bandProfile = {
  name: "Nillihc",
  tagline: "Post-jazz, funk en fusion uit Rotterdam",
  homeCity: "Rotterdam",
  region: "Zuid-Holland",
  country: "Nederland",
  foundedYear: "2017",
  memberCount: 7,
  genres: ["post-jazz", "funk", "fusion", "jazz", "instrumentaal"],
  language: "Instrumentaal (geen zang)",

  shortPitch:
    "Nillihc is een zevenkoppige instrumentale band uit Rotterdam op het snijvlak van post-jazz, funk en fusion. Dikke baslijnen, dwarse blazers en keiharde grooves, met een psychedelisch randje en catchy, dansbare melodieën.",

  longPitch:
    "Wat in 2017 begon als middelbare schoolproject groeide uit tot een vaste waarde in de Zuid-Hollandse scene. Nillihc maakt energieke, originele instrumentale muziek: aanstekelijk speelplezier, ongefilterd enthousiasme en ijzersterke melodieën. Een set die een zaal aan het dansen krijgt zonder dat er een woord gezongen wordt.",

  soundDescriptors: [
    "dansbaar en energiek",
    "dikke baslijnen en strakke grooves",
    "jazzy blazers (sax en trompet)",
    "psychedelisch randje",
    "instrumentaal, geen zang",
  ],

  influences: [
    "Snarky Puppy",
    "FORQ",
    "Jungle by Night",
    "New Cool Collective",
    "Vulfpeck",
  ],

  members: [
    { name: "Jan Timmerman", role: "Drums" },
    { name: "Niels Sas", role: "Basgitaar" },
    { name: "Thijmen Sas", role: "Gitaar" },
    { name: "Jascha Huisman", role: "Toetsen & synthesizer" },
    { name: "Jisk van der Veen", role: "Altsaxofoon" },
    { name: "Geert Timmerman", role: "Trompet & keys" },
    { name: "Matthijs Verzijden", role: "Percussie" },
  ],

  releases: [
    { title: "GAINZ", type: "EP", year: "2018" },
    { title: "Fanfare Joepie", type: "Single", year: "2018" },
    { title: "Do You Mind", type: "EP", year: "2019" },
    { title: "Get It High", type: "Single", year: "2023" },
    { title: "Energiehuis", type: "Single", year: "2024" },
  ] satisfies BandRelease[],

  awards: [
    "Rabobank Cultuurprijs (2017)",
    "De Puls Strakheids Belofte Nissewaard (2021)",
    "Winnaar De Grote Prijs van Dordt (2025)",
  ],

  highlights: [
    { year: "2017", title: "Oprichting en Rabobank Cultuurprijs" },
    { year: "2018", title: "Debuut-EP 'GAINZ' en eerste tour door Frankrijk" },
    { year: "2019", title: "EP 'Do You Mind'" },
    { year: "2020", title: "Voorprogramma Willem 't Hart" },
    { year: "2021", title: "De Puls Strakheids Belofte Nissewaard" },
    { year: "2023", title: "Residentie in Dizzy Rotterdam en single 'Get It High'" },
    { year: "2024", title: "Single 'Energiehuis'" },
    { year: "2025", title: "Winnaar De Grote Prijs van Dordt" },
  ] satisfies BandHighlight[],

  venuesPlayed: [
    "Big Rivers Festival",
    "Spijkenisse Festival",
    "Voorstraat Noord Festival",
    "Popcentrale Festival",
    "Gorcum Jazz Festival",
    "Lepeltje Lepeltje Dordrecht",
    "Dizzy Rotterdam",
    "Muziekpodium DJS",
  ],

  practical: {
    stageSetup:
      "Zevenkoppige bezetting: drums, bas, gitaar, toetsen/synth, altsaxofoon, trompet en percussie.",
    reducedLineup:
      "Bij kleinere podia kan in overleg met een kleinere bezetting gespeeld worden.",
    brings:
      "Eigen cymbals, 2x snare, basgitaar, gitaar, toetsen met stands, blazers met microfoons.",
    needs:
      "Drumkit (excl. cymbals en snares), bas- en gitaarversterker, stroomvoorziening, 16 kanalen PA.",
    travelRadius:
      "Rotterdam en omstreken als thuisbasis, speelt door heel Nederland en heeft in Frankrijk getoerd.",
  },

  links: {
    website: "https://nillihcband.com",
    epk: "https://nillihcband.com/epk",
    about: "https://nillihcband.com/over",
    rider: "https://nillihcband.com/rider",
    liveVideo: "https://www.youtube.com/watch?v=_dwec2wJG7U",
    spotify: "https://open.spotify.com/artist/3LAoxEz5BGdijXj4YG2f6v",
    instagram: "https://www.instagram.com/nillihcband",
    youtube: "https://www.youtube.com/@nillihcband",
  },

  contact: {
    email: "info@nillihcband.com",
    phone: "+31 6 20672161",
    /** Who signs the outreach mails. */
    signerName: "Jascha Huisman",
    signerRole: "Boekingen Nillihc",
  },
} as const;

export type BandProfile = typeof bandProfile;

/** Compact markdown rendering of the profile for the model prompt. */
export function renderBandProfile(): string {
  const p = bandProfile;

  return [
    `# Artiestprofiel: ${p.name}`,
    ``,
    `- Basis: ${p.homeCity}, ${p.region}, ${p.country} — actief sinds ${p.foundedYear}`,
    `- Bezetting: ${p.memberCount} muzikanten (${p.language})`,
    `- Genres: ${p.genres.join(", ")}`,
    `- Klank: ${p.soundDescriptors.join("; ")}`,
    `- Vergelijkbaar met / geïnspireerd door: ${p.influences.join(", ")}`,
    ``,
    `## Korte pitch`,
    p.shortPitch,
    ``,
    `## Uitgebreide pitch`,
    p.longPitch,
    ``,
    `## Bandleden`,
    ...p.members.map((m) => `- ${m.name} — ${m.role}`),
    ``,
    `## Releases`,
    ...p.releases.map((r) => `- ${r.type} "${r.title}" (${r.year})`),
    ``,
    `## Prijzen`,
    ...p.awards.map((a) => `- ${a}`),
    ``,
    `## Tijdlijn`,
    ...p.highlights.map((h) => `- ${h.year}: ${h.title}`),
    ``,
    `## Eerder gespeeld op`,
    ...p.venuesPlayed.map((v) => `- ${v}`),
    ``,
    `## Praktisch`,
    `- Podium: ${p.practical.stageSetup}`,
    `- Kleinere bezetting: ${p.practical.reducedLineup}`,
    `- Neemt mee: ${p.practical.brings}`,
    `- Nodig van venue: ${p.practical.needs}`,
    `- Reisbereik: ${p.practical.travelRadius}`,
    ``,
    `## Links`,
    `- Website: ${p.links.website}`,
    `- Perskit (EPK): ${p.links.epk}`,
    `- Live video: ${p.links.liveVideo}`,
    `- Spotify: ${p.links.spotify}`,
    `- Technische rider: ${p.links.rider}`,
    ``,
    `## Afzender`,
    `- ${p.contact.signerName}, ${p.contact.signerRole}`,
    `- ${p.contact.email} · ${p.contact.phone}`,
  ].join("\n");
}
