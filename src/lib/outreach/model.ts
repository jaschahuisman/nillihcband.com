import { createGoogleGenerativeAI } from "@ai-sdk/google";

export class OutreachConfigError extends Error {}

/** Fast + cheap: reads a pile of scraped pages and distils facts. */
const DEFAULT_RESEARCH_MODEL = "gemini-2.5-flash";
/** Stronger reasoning and better Dutch prose for the actual email. */
const DEFAULT_WRITER_MODEL = "gemini-2.5-pro";

export function researchModelId(): string {
  return process.env.OUTREACH_RESEARCH_MODEL?.trim() || DEFAULT_RESEARCH_MODEL;
}

export function writerModelId(): string {
  return process.env.OUTREACH_WRITER_MODEL?.trim() || DEFAULT_WRITER_MODEL;
}

function provider() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if (!apiKey) {
    throw new OutreachConfigError(
      "GOOGLE_GENERATIVE_AI_API_KEY ontbreekt. Zet de key in je environment om AI-functies te gebruiken.",
    );
  }
  return createGoogleGenerativeAI({ apiKey });
}

export function researchModel() {
  return provider()(researchModelId());
}

export function writerModel() {
  return provider()(writerModelId());
}

export function hasModelKey(): boolean {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim());
}
