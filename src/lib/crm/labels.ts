import type { Contact } from "@/db/schema";

export const contactTypeLabels: Record<Contact["type"], string> = {
  venue: "Venue",
  promoter: "Promotor",
  journalist: "Journalist",
  booking_agent: "Booking agent",
  fan: "Fan",
  collaborator: "Collaborator",
  supplier: "Leverancier",
  other: "Overig",
};

export const contactStatusLabels: Record<Contact["status"], string> = {
  lead: "Lead",
  active: "Actief",
  inactive: "Inactief",
  archived: "Gearchiveerd",
};

export const gigStatusLabels = {
  inquiry: "Aanvraag",
  option: "Optie",
  confirmed: "Bevestigd",
  completed: "Afgerond",
  cancelled: "Geannuleerd",
} as const;

export const venueStatusLabels = {
  prospect: "Prospect",
  approached: "Aangeschreven",
  reminder_sent: "Herinnering gestuurd",
  contact_made: "Contact gelegd",
  played: "Gespeeld",
  rejected: "Afgewezen",
  permanently_closed: "Permanent gesloten",
} as const;

export const venueScaleLabels = {
  intimate: "Intiem",
  club: "Club",
  midsize: "Midsize",
  hall: "Zaal",
  festival: "Festival",
  institutional: "Institutie",
} as const;

export function formatContactName(contact: Pick<Contact, "firstName" | "lastName">) {
  return [contact.firstName, contact.lastName].filter(Boolean).join(" ");
}

export function formatDate(value: Date | null | string) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" }).format(date);
}

export function formatDateTime(value: Date | null | string) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function toDateInputValue(value: Date | null | string) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

export function toDateTimeLocalValue(value: Date | null | string) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function parseTags(raw: string) {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}
