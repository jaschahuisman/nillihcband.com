import { z } from "zod";
import type { OutreachAngle, OutreachDraftStatus, OutreachKind } from "@/db/schema";

export const outreachAngleValues = [
  "direct_booking",
  "support_act",
  "double_bill",
  "series_fit",
  "festival_slot",
] as const;

export const outreachAngleLabels: Record<OutreachAngle, string> = {
  direct_booking: "Eigen boeking",
  support_act: "Voorprogramma",
  double_bill: "Dubbelconcert",
  series_fit: "Programmareeks",
  festival_slot: "Festivalslot",
};

export const outreachAngleDescriptions: Record<OutreachAngle, string> = {
  direct_booking:
    "Nillihc speelt een eigen avond of reguliere slot; past bij podia die zelf jazz/funk/fusion programmeren.",
  support_act:
    "Nillihc opent voor een grotere act die het podium al geboekt heeft.",
  double_bill:
    "Nillihc speelt een dubbelconcert samen met een vergelijkbare band uit de eigen programmering van het podium.",
  series_fit:
    "Nillihc sluit aan bij een bestaande reeks, jam, thema-avond of talentenprogramma van het podium.",
  festival_slot:
    "Nillihc speelt een slot op een festival of buitenprogramma van de organisatie.",
};

export const outreachKindLabels: Record<OutreachKind, string> = {
  initial: "Eerste mail",
  reminder: "Herinnering",
  follow_up: "Opvolging",
};

export const outreachDraftStatusLabels: Record<OutreachDraftStatus, string> = {
  draft: "Concept",
  approved: "Goedgekeurd",
  sent: "Verzonden",
  archived: "Archief",
};

/**
 * Kept deliberately flat (no unions, no records) because Gemini's structured
 * output mode only supports a subset of JSON Schema.
 */
export const venueResearchSchema = z.object({
  venueSummary: z
    .string()
    .describe("Twee tot drie zinnen in het Nederlands over wat voor plek dit is."),
  positioning: z
    .string()
    .describe(
      "Het profiel van het podium: jazzclub, poppodium, cultureel centrum, kroeg met live muziek, festival, etc.",
    ),
  programmingGenres: z
    .array(z.string())
    .describe("Genres die het podium aantoonbaar programmeert, op volgorde van belang."),
  programmingRhythm: z
    .string()
    .nullable()
    .describe(
      "Ritme van de programmering, bijvoorbeeld 'wekelijkse jazzavond op donderdag' of 'maandelijkse jamsessie'. Null als onbekend.",
    ),
  audienceProfile: z
    .string()
    .nullable()
    .describe("Type publiek dat op dit podium afkomt. Null als onbekend."),
  capacityEstimate: z
    .number()
    .int()
    .nullable()
    .describe("Geschatte capaciteit in personen. Null als er geen aanwijzing is."),
  programmedActs: z
    .array(
      z.object({
        name: z.string(),
        date: z.string().nullable().describe("Datum zoals op de site vermeld, of null."),
        isoDate: z
          .string()
          .nullable()
          .describe(
            "Diezelfde datum als JJJJ-MM-DD. Null als er geen volledige datum af te leiden is. Nooit gokken.",
          ),
        timing: z
          .enum(["upcoming", "past"])
          .describe(
            "upcoming als de datum vandaag of later is, past als de datum al geweest is. Vergelijk met de datum van vandaag uit de prompt.",
          ),
        genre: z.string().nullable(),
      }),
    )
    .describe(
      "Concrete acts uit de agenda en het archief, met hun datum. Alleen namen die echt in de bronnen staan.",
    ),
  genreMatches: z
    .array(
      z.object({
        artist: z.string().describe("Naam van de geprogrammeerde act die op Nillihc lijkt."),
        why: z.string().describe("Waarom deze act muzikaal in de buurt van Nillihc komt."),
        strength: z.enum(["strong", "medium", "weak"]),
        eventDate: z
          .string()
          .nullable()
          .describe("Datum van het aankomende optreden zoals op de site vermeld, of null."),
        isoDate: z
          .string()
          .nullable()
          .describe("Diezelfde datum als JJJJ-MM-DD. Null als er geen volledige datum staat."),
        genre: z.string().nullable().describe("Genre van de act, of null."),
        city: z.string().nullable().describe("Thuisstad van de act, of null."),
        website: z.string().nullable().describe("Website of Spotify-link van de act, of null."),
      }),
    )
    .describe(
      "UITSLUITEND acts die nog moeten komen op de agenda en die qua jazz/fusion/funk/instrumentale groove bij Nillihc passen. Dit zijn kandidaten om samen mee op de affiche te staan, dus een optreden dat al geweest is hoort hier nooit in. Leeg laten als er geen aankomende match is.",
    ),
  venueDetails: z
    .object({
      email: z.string().nullable().describe("Algemeen of boekings-e-mailadres van het podium."),
      phone: z.string().nullable(),
      address: z.string().nullable().describe("Straat en huisnummer, eventueel met postcode."),
      capacity: z.number().int().nullable().describe("Alleen als de site een aantal noemt."),
      homeUrl: z.string().nullable().describe("Volledige URL van de homepage."),
      programmaUrl: z.string().nullable().describe("Volledige URL van de agenda- of programmapagina."),
      contactUrl: z.string().nullable().describe("Volledige URL van de contact- of boekingspagina."),
      region: z.string().nullable().describe("Regio of provincie."),
      scale: z
        .enum(["intimate", "club", "midsize", "hall", "festival", "institutional"])
        .nullable()
        .describe("Schaal van het podium op basis van wat je gevonden hebt."),
    })
    .describe(
      "Harde gegevens over het podium die letterlijk in de bronnen staan. Vul alleen in wat je echt gevonden hebt; gebruik null voor de rest.",
    ),
  discoveredContacts: z
    .array(
      z.object({
        firstName: z.string(),
        lastName: z.string().nullable(),
        jobTitle: z.string().nullable().describe("Functie, bijvoorbeeld programmeur of boeker."),
        email: z.string().nullable(),
        phone: z.string().nullable(),
        sourceUrl: z.string().nullable().describe("Pagina waar deze persoon gevonden is."),
      }),
    )
    .describe(
      "Personen die met programmering of boekingen te maken hebben en met naam op de site staan. Neem geen algemene inboxen op zonder persoonsnaam.",
    ),
  booking: z.object({
    channel: z.enum(["email", "form", "phone", "unknown"]),
    email: z.string().nullable().describe("Boekingsmailadres als dat expliciet vermeld staat."),
    formUrl: z.string().nullable(),
    contactName: z.string().nullable().describe("Naam van de programmeur of boeker."),
    instructions: z
      .string()
      .nullable()
      .describe("Wat het podium vraagt bij een aanvraag, bijvoorbeeld 'stuur EPK en video'."),
    submissionWindow: z
      .string()
      .nullable()
      .describe("Periode waarin aanvragen behandeld worden, bijvoorbeeld 'programmering per seizoen'."),
  }),
  recommendedAngles: z
    .array(
      z.object({
        angle: z.enum(outreachAngleValues),
        reasoning: z.string().describe("Waarom deze invalshoek hier kansrijk is."),
        confidence: z.number().describe("Getal tussen 0 en 1."),
      }),
    )
    .describe("Gesorteerd van meest naar minst kansrijk. Minimaal één, maximaal drie."),
  hooks: z
    .array(z.string())
    .describe(
      "Concrete, verifieerbare details uit het onderzoek die in een mail genoemd kunnen worden. Geen algemeenheden.",
    ),
  risks: z
    .array(z.string())
    .describe(
      "Signalen die tegen benaderen pleiten, bijvoorbeeld gestopt met live muziek, alleen coverbands, of gesloten.",
    ),
  fitScore: z
    .number()
    .int()
    .describe("0-100. Hoe goed past Nillihc bij dit podium, op basis van bewijs uit de bronnen."),
  fitReasoning: z.string().describe("Korte onderbouwing van de score."),
  dataGaps: z
    .array(z.string())
    .describe("Wat niet gevonden is en handmatig uitgezocht moet worden."),
});

export type VenueResearchData = z.infer<typeof venueResearchSchema>;

export const researchSourceSchema = z.object({
  url: z.string(),
  title: z.string(),
  kind: z.enum(["home", "programma", "contact", "search", "discovered"]),
  chars: z.number(),
});

export type ResearchSource = z.infer<typeof researchSourceSchema>;

export const outreachEmailSchema = z.object({
  subject: z.string().describe("Onderwerpregel, maximaal 60 tekens, concreet en zonder clickbait."),
  body: z
    .string()
    .describe(
      "Volledige mailtekst inclusief aanhef en ondertekening. Platte tekst met witregels, geen markdown, geen opsommingstekens.",
    ),
  angle: z.enum(outreachAngleValues).describe("De invalshoek die daadwerkelijk gebruikt is."),
  rationale: z
    .string()
    .describe("Twee zinnen voor de bandleden: waarom deze mail zo geschreven is en waarom hij kan werken."),
  talkingPoints: z
    .array(z.string())
    .describe("De concrete venue-specifieke feiten die in de mail verwerkt zijn."),
});

export type OutreachEmailOutput = z.infer<typeof outreachEmailSchema>;
