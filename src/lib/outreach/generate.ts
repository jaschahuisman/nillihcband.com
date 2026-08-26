import { generateObject } from "ai";
import type { OutreachAngle, OutreachKind, Venue } from "@/db/schema";
import { venueScaleLabels, venueStatusLabels } from "@/lib/crm/labels";
import { bandProfile, renderBandProfile } from "@/lib/outreach/band-profile";
import { writerModel, writerModelId } from "@/lib/outreach/model";
import { renderResearchBriefing } from "@/lib/outreach/research";
import {
  outreachAngleDescriptions,
  outreachEmailSchema,
  type OutreachEmailOutput,
  type VenueResearchData,
} from "@/lib/outreach/schemas";

export type GeneratedEmail = OutreachEmailOutput & { model: string };

export type PriorMessage = {
  subject: string;
  body: string;
  sentAt: Date | null;
  kind: OutreachKind;
};

export type GenerateEmailInput = {
  venue: Venue;
  research: VenueResearchData | null;
  kind: OutreachKind;
  /** Null lets the model pick the strongest angle from the research. */
  angle: OutreachAngle | null;
  instructions: string | null;
  recipient: { name: string | null; role: string | null } | null;
  notes: string[];
  /** The version being revised, if the user asked for another take. */
  previousVersion: { subject: string; body: string } | null;
  /** Earlier correspondence in this thread, oldest first. */
  priorMessages: PriorMessage[];
  language: "nl" | "en";
};

const SYSTEM_PROMPT = `Je bent de boekingsagent van de Nederlandse band Nillihc en schrijft koude en opvolgende e-mails aan programmeurs van podia. Je bent goed omdat je mails kort zijn, concreet, en aantoonbaar over dat ene podium gaan.

## Harde regels
- Verzin nooit feiten. Alles wat je over Nillihc schrijft komt uit het artiestprofiel, alles wat je over het podium schrijft uit de research. Weet je iets niet, laat het weg.
- Noem geen concrete speeldata, bedragen of beschikbaarheid tenzij die letterlijk in de input staan. Vraag naar mogelijkheden in plaats van ze te claimen.
- Gebruik geen namen van contactpersonen die niet zijn aangeleverd.
- Een dubbelconcert of voorprogramma stel je alleen voor bij een act die nog op hun agenda staat. Een optreden dat al geweest is kun je hooguit noemen als bewijs dat je hun programmering kent ("ik zag dat X bij jullie speelde"), nooit als iets waar Nillihc nog bij aan kan sluiten.
- Platte tekst. Geen markdown, geen opsommingstekens, geen kopjes, geen emoji.
- Nederlands, tenzij expliciet anders gevraagd.

## Wat een goede mail is
- Onderwerp: maximaal 60 tekens, concreet, geen clickbait en geen uitroeptekens.
- Opening: één zin die bewijst dat je hun programmering echt bekeken hebt. Noem een specifieke act, reeks of avond. Nooit algemene complimenten als "mooi programma" of "gezellige zaal".
- Daarna: in één of twee zinnen wie Nillihc is, met bewijs (prijs, podium of festival dat ertoe doet voor dit podium). Kies bewijs dat relevant is voor déze plek.
- De vraag: één duidelijke, laagdrempelige vraag die past bij de invalshoek. Bied flexibiliteit in periode en bezetting.
- Links: hooguit twee, live video eerst, dan de perskit.
- Afsluiting: korte vraag die makkelijk met ja of nee te beantwoorden is.
- Ondertekening met naam, rol, e-mail en telefoonnummer.

## Lengte
- Eerste mail: 110 tot 170 woorden in de body, exclusief ondertekening.
- Herinnering: maximaal 90 woorden. Verwijs kort naar de eerdere mail en wanneer die verstuurd is, voeg één nieuw en concreet gegeven toe, en geef expliciet een makkelijke uitweg ("laat gerust weten als het niet past"). Herhaal de pitch niet.
- Opvolging: bouw voort op het lopende contact, geen herhaalde introductie.

## Toon
- Standaard je-vorm en enthousiast maar zakelijk.
- U-vorm bij institutionele podia, theaters, gemeentelijke instellingen en concertzalen.
- Geen superlatieven over de band zonder bewijs. Geen verkooptaal.

## Eigen controle voor je antwoordt
1. Staat er minstens één detail in dat alléén op dit podium slaat? Zo niet, herschrijf.
2. Zou een programmeur dit binnen twintig seconden kunnen lezen en beantwoorden? Zo niet, kort in.
3. Staat er iets in dat niet uit de input komt? Zo ja, haal het weg.`;

function toneHint(venue: Venue): string {
  if (venue.scale === "institutional" || venue.scale === "hall") {
    return "Dit is een institutioneel of groot podium: gebruik de u-vorm en een formelere toon.";
  }
  if (venue.scale === "intimate" || venue.scale === "club") {
    return "Dit is een club of intieme zaal: gebruik de je-vorm en een directe, informele toon.";
  }
  return "Kies zelf tussen je- en u-vorm op basis van het profiel van het podium.";
}

function renderAngleInstruction(
  angle: OutreachAngle | null,
  research: VenueResearchData | null,
): string {
  if (!angle) {
    const recommended = research?.recommendedAngles?.[0];
    return recommended
      ? `Kies zelf de sterkste invalshoek. De research beveelt "${recommended.angle}" aan: ${recommended.reasoning}`
      : `Kies zelf de sterkste invalshoek op basis van wat je over het podium weet.`;
  }

  const extra: string[] = [`Gebruik verplicht de invalshoek "${angle}": ${outreachAngleDescriptions[angle]}`];

  if (angle === "double_bill" || angle === "support_act") {
    const matches = research?.genreMatches ?? [];
    if (matches.length > 0) {
      const options = matches
        .map((match) => {
          const when = match.eventDate ?? match.isoDate;
          return `${match.artist}${when ? ` (${when})` : ""}`;
        })
        .join(", ");
      extra.push(
        `Deze acts staan nog op hun agenda en komen muzikaal in de buurt: ${options}. Noem er precies één en koppel de vraag aan die avond.`,
      );
    } else {
      extra.push(
        `Er staat op dit moment geen verwante act op hun agenda. Formuleer de vraag daarom open, zonder een bandnaam te verzinnen en zonder een act uit het verleden voor te stellen om mee te spelen.`,
      );
    }
  }

  return extra.join(" ");
}

function renderPriorMessages(messages: PriorMessage[]): string {
  if (messages.length === 0) return "";

  return [
    ``,
    `# Eerdere correspondentie (oudste eerst)`,
    ...messages.map((message, index) => {
      const when = message.sentAt
        ? new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(message.sentAt)
        : "datum onbekend";
      return [
        `## Bericht ${index + 1} — ${message.kind}, verstuurd op ${when}`,
        `Onderwerp: ${message.subject}`,
        message.body,
      ].join("\n");
    }),
  ].join("\n");
}

function renderVenueFacts(venue: Venue, recipient: GenerateEmailInput["recipient"]): string {
  const lines = [
    `- Naam: ${venue.name}`,
    `- Stad: ${venue.city ?? "onbekend"}`,
    `- Schaal: ${venue.scale ? venueScaleLabels[venue.scale] : "onbekend"}`,
    `- Capaciteit: ${venue.capacity ?? "onbekend"}`,
    `- Huidige CRM-status: ${venueStatusLabels[venue.status]}`,
    `- Website: ${venue.homeUrl ?? venue.website ?? "onbekend"}`,
  ];

  if (recipient?.name) {
    lines.push(
      `- Geadresseerde: ${recipient.name}${recipient.role ? ` (${recipient.role})` : ""} — spreek deze persoon bij naam aan.`,
    );
  } else {
    lines.push(
      `- Geadresseerde: onbekend. Gebruik een neutrale aanhef zonder naam en zonder verzonnen functietitel.`,
    );
  }

  return lines.join("\n");
}

export async function generateOutreachEmail(
  input: GenerateEmailInput,
): Promise<GeneratedEmail> {
  const today = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(new Date());

  const sections: string[] = [
    `Schrijf een e-mail van het type "${input.kind}" aan het podium "${input.venue.name}".`,
    `Vandaag is het ${today}.`,
    ``,
    renderBandProfile(),
    ``,
    `# Venue in het CRM`,
    renderVenueFacts(input.venue, input.recipient),
    ``,
    `# Toon`,
    toneHint(input.venue),
    ``,
    `# Invalshoek`,
    renderAngleInstruction(input.angle, input.research),
  ];

  if (input.research) {
    sections.push(``, `# Research over dit podium`, renderResearchBriefing(input.research));
  } else {
    sections.push(
      ``,
      `# Research over dit podium`,
      `Er is geen onderzoek beschikbaar. Schrijf een mail die eerlijk generiek blijft in plaats van details te verzinnen, en houd hem kort.`,
    );
  }

  if (input.notes.length > 0) {
    sections.push(
      ``,
      `# Interne notities uit het CRM (niet letterlijk citeren)`,
      ...input.notes.slice(0, 10).map((note) => `- ${note}`),
    );
  }

  const prior = renderPriorMessages(input.priorMessages);
  if (prior) sections.push(prior);

  if (input.previousVersion) {
    sections.push(
      ``,
      `# Vorige versie van deze mail`,
      `Onderwerp: ${input.previousVersion.subject}`,
      input.previousVersion.body,
      ``,
      `Schrijf een nieuwe versie. Herhaal de vorige versie niet woordelijk; maak hem aantoonbaar beter of anders.`,
    );
  }

  if (input.instructions?.trim()) {
    sections.push(
      ``,
      `# Extra instructies van de band (deze wegen het zwaarst)`,
      input.instructions.trim(),
    );
  }

  if (input.language === "en") {
    sections.push(``, `# Taal`, `Schrijf deze mail in het Engels.`);
  }

  sections.push(
    ``,
    `# Ondertekening`,
    `${bandProfile.contact.signerName}, ${bandProfile.contact.signerRole}`,
    `${bandProfile.contact.email} · ${bandProfile.contact.phone}`,
    bandProfile.links.website,
  );

  const { object } = await generateObject({
    model: writerModel(),
    schema: outreachEmailSchema,
    temperature: input.previousVersion ? 0.9 : 0.7,
    system: SYSTEM_PROMPT,
    prompt: sections.join("\n"),
  });

  return { ...object, model: writerModelId() };
}
