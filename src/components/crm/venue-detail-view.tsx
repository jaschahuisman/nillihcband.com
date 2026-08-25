"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  ChevronDown,
  ExternalLink,
  MoreHorizontal,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ContactMultiSelect } from "@/components/crm/contact-multi-select";
import { DeleteAlert } from "@/components/crm/delete-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Venue } from "@/db/schema";
import {
  addVenueNote,
  deleteVenue,
  deleteVenueNote,
  setVenueArchived,
  toggleVenueFavorite,
  upsertVenue,
} from "@/lib/crm/actions";
import {
  formatDateTime,
  venueScaleLabels,
  venueStatusLabels,
} from "@/lib/crm/labels";
import type {
  ContactOption,
  VenueNoteEntry,
  VenueWithContacts,
} from "@/lib/crm/queries";
import { cn } from "@/lib/utils";

const SAVE_DEBOUNCE_MS = 600;
const fieldClass = "space-y-1";
const labelClass = "text-[11px] text-muted-foreground";
const inputClass =
  "h-7 bg-transparent text-[13px] shadow-none dark:bg-transparent hover:bg-input/30 hover:dark:bg-input/30 focus-visible:bg-transparent focus-visible:dark:bg-transparent";
const selectClass = "crm-select h-7 text-[13px]";

type VenueDraft = {
  name: string;
  city: string;
  region: string;
  address: string;
  capacity: string;
  email: string;
  phone: string;
  homeUrl: string;
  programmaUrl: string;
  contactUrl: string;
  rejectionReason: string;
  status: Venue["status"];
  scale: NonNullable<Venue["scale"]> | "none";
  contactIds: string[];
};

function draftFromVenue(venue: VenueWithContacts | null): VenueDraft {
  return {
    name: venue?.name ?? "",
    city: venue?.city ?? "",
    region: venue?.region ?? "",
    address: venue?.address ?? "",
    capacity: venue?.capacity != null ? String(venue.capacity) : "",
    email: venue?.email ?? "",
    phone: venue?.phone ?? "",
    homeUrl: venue?.homeUrl ?? venue?.website ?? "",
    programmaUrl: venue?.programmaUrl ?? "",
    contactUrl: venue?.contactUrl ?? "",
    rejectionReason: venue?.rejectionReason ?? "",
    status: venue?.status ?? "prospect",
    scale: venue?.scale ?? "none",
    contactIds: venue?.contacts.map((contact) => contact.id) ?? [],
  };
}

function externalHref(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function UrlField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const href = externalHref(value);

  return (
    <div className={fieldClass}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className={labelClass}>
          {label}
        </Label>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground"
          >
            Open
            <ExternalLink className="size-2.5" />
          </a>
        ) : null}
      </div>
      <Input
        id={id}
        type="url"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </div>
  );
}

export function VenueDetailView({
  venue,
  contactOptions,
}: {
  venue: VenueWithContacts | null;
  contactOptions: ContactOption[];
}) {
  const router = useRouter();
  const [venueId, setVenueId] = useState<string | null>(venue?.id ?? null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [draft, setDraft] = useState<VenueDraft>(() => draftFromVenue(venue));
  const [noteEntries, setNoteEntries] = useState<VenueNoteEntry[]>(
    () => venue?.noteEntries ?? [],
  );
  const [noteDraft, setNoteDraft] = useState("");
  const [notePending, setNotePending] = useState(false);
  const [favorite, setFavorite] = useState(() => venue?.favorite ?? false);
  const [archived, setArchived] = useState(() => venue?.archived ?? false);

  const saveGeneration = useRef(0);
  const favoriteRef = useRef(favorite);
  const archivedRef = useRef(archived);
  const venueIdRef = useRef(venueId);
  const lastSavedSnapshot = useRef(JSON.stringify(draftFromVenue(venue)));

  favoriteRef.current = favorite;
  archivedRef.current = archived;
  venueIdRef.current = venueId;

  function patchDraft(patch: Partial<VenueDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  async function saveDraft(next: VenueDraft) {
    const name = next.name.trim();
    if (!name) {
      if (venueIdRef.current) {
        toast.error("Naam is verplicht.", { id: "venue-autosave" });
      }
      return;
    }

    if (next.status === "rejected" && !next.rejectionReason.trim()) {
      toast.error("Reden van afwijzing is verplicht.", { id: "venue-autosave" });
      return;
    }

    const snapshot = JSON.stringify(next);
    const capacityRaw = next.capacity.trim();
    const capacity = capacityRaw ? Number(capacityRaw) : null;
    const generation = ++saveGeneration.current;

    const result = await upsertVenue({
      id: venueIdRef.current ?? undefined,
      name,
      city: next.city,
      region: next.region,
      address: next.address,
      email: next.email,
      phone: next.phone,
      homeUrl: next.homeUrl,
      programmaUrl: next.programmaUrl,
      contactUrl: next.contactUrl,
      rejectionReason: next.rejectionReason,
      capacity: Number.isFinite(capacity) ? capacity : null,
      status: next.status,
      scale: next.scale === "none" ? null : next.scale,
      favorite: favoriteRef.current,
      archived: archivedRef.current,
      contactIds: next.contactIds,
    });

    if (generation !== saveGeneration.current) return;

    if (!result.ok) {
      toast.error(result.error, { id: "venue-autosave" });
      return;
    }

    lastSavedSnapshot.current = snapshot;
    toast.success("Opgeslagen", { id: "venue-autosave" });

    if (!venueIdRef.current) {
      setVenueId(result.id);
      router.replace(`/crm/venues/${result.id}`);
    }
  }

  const saveDraftRef = useRef(saveDraft);
  saveDraftRef.current = saveDraft;

  useEffect(() => {
    const snapshot = JSON.stringify(draft);
    if (snapshot === lastSavedSnapshot.current) return;

    const timer = window.setTimeout(() => {
      void saveDraftRef.current(draft);
    }, SAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [draft]);

  async function handleFavorite() {
    if (!venueId) return;
    const result = await toggleVenueFavorite(venueId);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setFavorite((value) => !value);
    router.refresh();
  }

  async function handleArchive() {
    if (!venueId) return;
    const next = !archived;
    const result = await setVenueArchived(venueId, next);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setArchived(next);
    toast.success(next ? "Venue gearchiveerd" : "Venue hersteld");
    router.refresh();
  }

  async function handleDelete() {
    if (!venueId) return;
    const result = await deleteVenue(venueId);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Venue verwijderd");
    router.push("/crm/venues");
    router.refresh();
  }

  async function handleAddNote() {
    if (!venueId) {
      toast.error("Vul eerst een naam in zodat de venue wordt opgeslagen.");
      return;
    }

    const body = noteDraft.trim();
    if (!body) return;

    setNotePending(true);
    const result = await addVenueNote(venueId, body);
    setNotePending(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    setNoteEntries((current) => [result.note, ...current]);
    setNoteDraft("");
    toast.success("Notitie toegevoegd", { id: "venue-note" });
  }

  async function handleDeleteNote(noteId: string) {
    const result = await deleteVenueNote(noteId);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setNoteEntries((current) => current.filter((note) => note.id !== noteId));
    toast.success("Notitie verwijderd", { id: "venue-note" });
  }

  const homeHref = externalHref(draft.homeUrl);
  const programmaHref = externalHref(draft.programmaUrl);
  const contactHref = externalHref(draft.contactUrl);

  return (
    <>
      <div className="w-full">
        <div className="mb-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-1.5 text-xs text-muted-foreground"
            asChild
          >
            <Link href="/crm/venues">
              <ArrowLeft className="size-3.5" />
              Venues
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <div className="min-w-0 flex-1 space-y-5">
            <div className="flex items-start gap-2 border-b border-border pb-3">
              <div className="min-w-0 flex-1">
                <Input
                  id="name"
                  required
                  autoFocus={!venueId}
                  value={draft.name}
                  onChange={(event) => patchDraft({ name: event.target.value })}
                  placeholder="Venue naam"
                  aria-label="Naam"
                  className="h-11 border-transparent bg-transparent px-1 text-2xl font-semibold tracking-tight shadow-none dark:bg-transparent hover:bg-input/30 hover:dark:bg-input/30 focus-visible:border-input focus-visible:bg-transparent focus-visible:dark:bg-transparent md:text-2xl"
                />
                <div className="mt-0.5 flex items-center gap-1.5 px-1">
                  <Input
                    id="city"
                    value={draft.city}
                    onChange={(event) =>
                      patchDraft({ city: event.target.value })
                    }
                    placeholder="Stad"
                    aria-label="Stad"
                    className="h-6 max-w-56 border-transparent bg-transparent px-0 text-[12px] text-muted-foreground shadow-none placeholder:text-muted-foreground/60 dark:bg-transparent hover:bg-input/30 hover:dark:bg-input/30 focus-visible:border-input focus-visible:bg-transparent focus-visible:text-foreground focus-visible:dark:bg-transparent"
                  />
                  {archived ? (
                    <Badge
                      variant="secondary"
                      className="h-4 shrink-0 px-1.5 text-[10px] font-normal"
                    >
                      Archief
                    </Badge>
                  ) : null}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 shrink-0 gap-1.5 px-3 text-sm font-normal"
                  >
                    {venueStatusLabels[draft.status]}
                    <ChevronDown className="size-3.5 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="dark w-52">
                  {Object.entries(venueStatusLabels).map(([value, label]) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() =>
                        patchDraft({ status: value as Venue["status"] })
                      }
                    >
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {venueId ? (
                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-8"
                    onClick={() => void handleFavorite()}
                    aria-label={
                      favorite ? "Verwijder favoriet" : "Maak favoriet"
                    }
                  >
                    <Star
                      className={cn(
                        "size-3.5",
                        favorite
                          ? "fill-primary text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="size-8"
                        aria-label="Meer acties"
                      >
                        <MoreHorizontal className="size-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="dark w-44">
                      <DropdownMenuItem onClick={() => void handleArchive()}>
                        {archived ? (
                          <ArchiveRestore className="size-3.5" />
                        ) : (
                          <Archive className="size-3.5" />
                        )}
                        {archived ? "Herstel uit archief" : "Archiveer"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteOpen(true)}
                      >
                        <Trash2 className="size-3.5" />
                        Verwijderen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : null}
            </div>

            {(homeHref || programmaHref || contactHref) && (
              <div className="flex flex-wrap gap-x-3 gap-y-1 px-1">
                {homeHref ? (
                  <a
                    href={homeHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-foreground hover:underline"
                  >
                    Home
                    <ExternalLink className="size-3 text-muted-foreground" />
                  </a>
                ) : null}
                {programmaHref ? (
                  <a
                    href={programmaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Programma
                    <ExternalLink className="size-3" />
                  </a>
                ) : null}
                {contactHref ? (
                  <a
                    href={contactHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Contactpagina
                    <ExternalLink className="size-3" />
                  </a>
                ) : null}
              </div>
            )}

            <section className={fieldClass}>
              <Label className={labelClass}>Contacten</Label>
              <ContactMultiSelect
                options={contactOptions}
                value={draft.contactIds}
                onChange={(contactIds) => patchDraft({ contactIds })}
                defaultOrganization={draft.name}
                defaultCity={draft.city}
                defaultType="venue"
              />
            </section>

            <section className="space-y-2">
              <Label className={labelClass}>Notities</Label>
              <div className="space-y-2">
                <Textarea
                  value={noteDraft}
                  onChange={(event) => setNoteDraft(event.target.value)}
                  rows={3}
                  placeholder={
                    venueId
                      ? "Nieuwe notitie…"
                      : "Sla de venue eerst op via de naam…"
                  }
                  disabled={!venueId}
                  className="min-h-16 bg-transparent text-[13px] shadow-none dark:bg-transparent hover:bg-input/30 hover:dark:bg-input/30 focus-visible:bg-transparent focus-visible:dark:bg-transparent"
                  onKeyDown={(event) => {
                    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                      event.preventDefault();
                      void handleAddNote();
                    }
                  }}
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={!venueId || notePending || !noteDraft.trim()}
                    onClick={() => void handleAddNote()}
                  >
                    {notePending ? "Toevoegen…" : "Notitie toevoegen"}
                  </Button>
                </div>
              </div>

              {noteEntries.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nog geen notities</p>
              ) : (
                <ul className="space-y-2">
                  {noteEntries.map((note) => (
                    <li
                      key={note.id}
                      className="rounded-md border border-border bg-card/30 px-3 py-2"
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <time
                          dateTime={new Date(note.createdAt).toISOString()}
                          className="text-[11px] text-muted-foreground"
                        >
                          {formatDateTime(note.createdAt)}
                        </time>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="size-6 text-muted-foreground"
                          onClick={() => void handleDeleteNote(note.id)}
                          aria-label="Notitie verwijderen"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                      <p className="whitespace-pre-wrap text-[13px] leading-relaxed">
                        {note.body}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="w-full shrink-0 space-y-2.5 border-t border-border pt-4 lg:w-1/3 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
            <div className={fieldClass}>
              <Label htmlFor="scale" className={labelClass}>
                Schaal
              </Label>
              <select
                id="scale"
                value={draft.scale}
                onChange={(event) =>
                  patchDraft({
                    scale: event.target.value as VenueDraft["scale"],
                  })
                }
                className={selectClass}
              >
                <option value="none">Geen</option>
                {Object.entries(venueScaleLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className={fieldClass}>
              <Label htmlFor="region" className={labelClass}>
                Regio
              </Label>
              <Input
                id="region"
                value={draft.region}
                onChange={(event) => patchDraft({ region: event.target.value })}
                className={inputClass}
              />
            </div>

            <div className={fieldClass}>
              <Label htmlFor="capacity" className={labelClass}>
                Capaciteit
              </Label>
              <Input
                id="capacity"
                type="number"
                min={0}
                value={draft.capacity}
                onChange={(event) =>
                  patchDraft({ capacity: event.target.value })
                }
                className={inputClass}
              />
            </div>

            <div className={fieldClass}>
              <Label htmlFor="address" className={labelClass}>
                Adres
              </Label>
              <Input
                id="address"
                value={draft.address}
                onChange={(event) =>
                  patchDraft({ address: event.target.value })
                }
                className={inputClass}
              />
            </div>

            <UrlField
              id="homeUrl"
              label="Home URL"
              value={draft.homeUrl}
              onChange={(homeUrl) => patchDraft({ homeUrl })}
            />
            <UrlField
              id="programmaUrl"
              label="Programma URL"
              value={draft.programmaUrl}
              onChange={(programmaUrl) => patchDraft({ programmaUrl })}
            />
            <UrlField
              id="contactUrl"
              label="Contact URL"
              value={draft.contactUrl}
              onChange={(contactUrl) => patchDraft({ contactUrl })}
            />

            <div className={fieldClass}>
              <Label htmlFor="email" className={labelClass}>
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={draft.email}
                onChange={(event) => patchDraft({ email: event.target.value })}
                className={inputClass}
              />
            </div>

            <div className={fieldClass}>
              <Label htmlFor="phone" className={labelClass}>
                Telefoon
              </Label>
              <Input
                id="phone"
                value={draft.phone}
                onChange={(event) => patchDraft({ phone: event.target.value })}
                className={inputClass}
              />
            </div>

            {draft.status === "rejected" ? (
              <div className={fieldClass}>
                <Label htmlFor="rejectionReason" className={labelClass}>
                  Reden afwijzing *
                </Label>
                <Textarea
                  id="rejectionReason"
                  rows={2}
                  className="min-h-12 bg-transparent text-[13px] shadow-none dark:bg-transparent hover:bg-input/30 hover:dark:bg-input/30 focus-visible:bg-transparent focus-visible:dark:bg-transparent"
                  value={draft.rejectionReason}
                  onChange={(event) =>
                    patchDraft({ rejectionReason: event.target.value })
                  }
                  placeholder="Waarom afgewezen?"
                />
              </div>
            ) : null}
          </aside>
        </div>
      </div>

      {venueId ? (
        <DeleteAlert
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Venue verwijderen?"
          description="Dit kan niet ongedaan worden gemaakt."
          onConfirm={handleDelete}
        />
      ) : null}
    </>
  );
}
