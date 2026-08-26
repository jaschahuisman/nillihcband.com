"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  ChevronDown,
  ExternalLink,
  MoreHorizontal,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { ContactBadges } from "@/components/crm/contact-badges";
import { DeleteAlert } from "@/components/crm/delete-alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CrmToolbar } from "@/components/crm/crm-toolbar";
import {
  emptyVenueFilters,
  parseSmartVenueSearch,
  type VenueFilters,
} from "@/components/crm/venue-filters";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { VenueStatus } from "@/db/schema";
import {
  deleteVenue,
  setVenueArchived,
  setVenueStatus,
  toggleVenueFavorite,
} from "@/lib/crm/actions";
import {
  formatContactName,
  venueScaleLabels,
  venueStatusLabels,
} from "@/lib/crm/labels";
import type { VenueWithContacts } from "@/lib/crm/queries";
import { cn } from "@/lib/utils";

function PageLink({ href, label }: { href: string | null; label: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
      onClick={(event) => event.stopPropagation()}
      title={label}
    >
      {label}
      <ExternalLink className="size-2.5" />
    </a>
  );
}

function mergeFilters(
  base: VenueFilters,
  parsed: Partial<VenueFilters>,
): VenueFilters {
  return {
    scales: [...new Set([...base.scales, ...(parsed.scales ?? [])])],
    cities: [...new Set([...base.cities, ...(parsed.cities ?? [])])],
    regions: [...new Set([...base.regions, ...(parsed.regions ?? [])])],
    statuses: [...new Set([...base.statuses, ...(parsed.statuses ?? [])])],
    favoriteOnly: base.favoriteOnly || Boolean(parsed.favoriteOnly),
  };
}

export function VenuesView({ venues }: { venues: VenueWithContacts[] }) {
  const router = useRouter();
  const [isNavigating, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filters] = useState<VenueFilters>(emptyVenueFilters);
  const [showArchive, setShowArchive] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [rejectionPrompt, setRejectionPrompt] = useState<{
    venueId: string;
    reason: string;
  } | null>(null);

  const archivedCount = useMemo(
    () => venues.filter((venue) => venue.archived).length,
    [venues],
  );

  const filtered = useMemo(() => {
    const { text, filters: parsed } = parseSmartVenueSearch(search);
    const active = mergeFilters(filters, parsed);
    const query = text.toLowerCase();

    return venues.filter((venue) => {
      if (venue.archived !== showArchive) return false;
      if (active.favoriteOnly && !venue.favorite) return false;
      if (
        active.scales.length > 0 &&
        (!venue.scale || !active.scales.includes(venue.scale))
      ) {
        return false;
      }
      if (
        active.cities.length > 0 &&
        (!venue.city || !active.cities.includes(venue.city))
      ) {
        return false;
      }
      if (
        active.regions.length > 0 &&
        (!venue.region || !active.regions.includes(venue.region))
      ) {
        return false;
      }
      if (active.statuses.length > 0 && !active.statuses.includes(venue.status)) {
        return false;
      }
      if (!query) return true;

      return [
        venue.name,
        venue.city,
        venue.region,
        venue.email,
        venue.phone,
        venue.address,
        venue.notes,
        ...venue.noteEntries.map((note) => note.body),
        venue.rejectionReason,
        venueStatusLabels[venue.status],
        venue.scale ? venueScaleLabels[venue.scale] : "",
        ...venue.contacts.map((contact) => formatContactName(contact)),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [venues, search, filters, showArchive]);

  function openVenue(venueId: string) {
    startTransition(() => {
      router.push(`/crm/venues/${venueId}`);
    });
  }

  async function handleFavorite(venueId: string) {
    const result = await toggleVenueFavorite(venueId);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function handleArchive(venueId: string, archived: boolean) {
    const result = await setVenueArchived(venueId, archived);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(archived ? "Venue gearchiveerd" : "Venue hersteld");
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteId) return;
    const result = await deleteVenue(deleteId);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Venue verwijderd");
    setDeleteId(null);
    router.refresh();
  }

  async function applyVenueStatus(
    venueId: string,
    status: VenueStatus,
    rejectionReason?: string | null,
  ) {
    const result = await setVenueStatus(venueId, status, rejectionReason);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Status bijgewerkt");
    router.refresh();
  }

  function handleStatusChange(venue: VenueWithContacts, status: VenueStatus) {
    if (status === venue.status) return;

    if (status === "rejected" && !venue.rejectionReason?.trim()) {
      setRejectionPrompt({ venueId: venue.id, reason: "" });
      return;
    }

    void applyVenueStatus(venue.id, status);
  }

  async function confirmRejection() {
    if (!rejectionPrompt) return;
    const reason = rejectionPrompt.reason.trim();
    if (!reason) {
      toast.error("Reden van afwijzing is verplicht.");
      return;
    }
    await applyVenueStatus(rejectionPrompt.venueId, "rejected", reason);
    setRejectionPrompt(null);
  }

  return (
    <>
      <CrmToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={
          showArchive ? "Zoek in archief…" : "Zoek prospects…"
        }
        addLabel="Venue"
        onAdd={() => {
          startTransition(() => {
            router.push("/crm/venues/new");
          });
        }}
      >
        <Button
          type="button"
          variant={showArchive ? "secondary" : "outline"}
          size="sm"
          className="h-8 shrink-0 gap-1.5 px-2.5 text-xs"
          onClick={() => setShowArchive((value) => !value)}
        >
          {showArchive ? (
            <ArchiveRestore className="size-3.5" />
          ) : (
            <Archive className="size-3.5" />
          )}
          {showArchive
            ? "Actief"
            : `Archief${archivedCount ? ` (${archivedCount})` : ""}`}
        </Button>
      </CrmToolbar>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-between border border-border bg-card/40 px-3 py-5 text-sm">
          <span className="text-muted-foreground">
            {showArchive ? "Archief is leeg" : "Nog geen venues"}
          </span>
          {!showArchive ? (
            <Button size="sm" className="h-7 text-xs" asChild>
              <Link href="/crm/venues/new">Venue toevoegen</Link>
            </Button>
          ) : null}
        </div>
      ) : (
        <div
          className={cn(
            "overflow-x-auto rounded-md border border-border",
            isNavigating && "opacity-70",
          )}
        >
          <Table className="text-[13px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-8 w-8 px-1" />
                <TableHead className="h-8 px-3 text-xs text-muted-foreground">
                  Naam
                </TableHead>
                <TableHead className="h-8 px-3 text-xs text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="hidden h-8 px-3 text-xs text-muted-foreground md:table-cell">
                  Schaal
                </TableHead>
                <TableHead className="hidden h-8 px-3 text-xs text-muted-foreground lg:table-cell">
                  Pagina&apos;s
                </TableHead>
                <TableHead className="hidden h-8 px-3 text-xs text-muted-foreground xl:table-cell">
                  Contacten
                </TableHead>
                <TableHead className="h-8 w-8 px-1" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((venue) => (
                <TableRow
                  key={venue.id}
                  className="cursor-pointer"
                  onClick={() => openVenue(venue.id)}
                >
                  <TableCell className="px-1 py-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-7"
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleFavorite(venue.id);
                      }}
                      aria-label={
                        venue.favorite
                          ? "Verwijder favoriet"
                          : "Maak favoriet"
                      }
                    >
                      <Star
                        className={cn(
                          "size-3.5",
                          venue.favorite
                            ? "fill-primary text-primary"
                            : "text-muted-foreground",
                        )}
                      />
                    </Button>
                  </TableCell>
                  <TableCell className="px-3 py-1.5">
                    <Link
                      href={`/crm/venues/${venue.id}`}
                      className="font-medium hover:underline"
                      onClick={(event) => event.stopPropagation()}
                      prefetch
                    >
                      {venue.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {venue.city ?? "—"}
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-1.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 gap-1 px-2 text-xs font-normal"
                        >
                          {venueStatusLabels[venue.status]}
                          <ChevronDown className="size-3 opacity-60" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="dark w-52">
                        {Object.entries(venueStatusLabels).map(
                          ([value, label]) => (
                            <DropdownMenuItem
                              key={value}
                              disabled={venue.status === value}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleStatusChange(
                                  venue,
                                  value as VenueStatus,
                                );
                              }}
                            >
                              {label}
                            </DropdownMenuItem>
                          ),
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="hidden px-3 py-1.5 text-muted-foreground md:table-cell">
                    {venue.scale ? venueScaleLabels[venue.scale] : "—"}
                  </TableCell>
                  <TableCell className="hidden px-3 py-1.5 lg:table-cell">
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                      <PageLink
                        href={venue.homeUrl ?? venue.website}
                        label={venue.homeUrl ? "Home" : "Website"}
                      />
                      <PageLink href={venue.programmaUrl} label="Programma" />
                      <PageLink href={venue.contactUrl} label="Contact" />
                    </div>
                  </TableCell>
                  <TableCell className="hidden px-3 py-1.5 xl:table-cell">
                    <ContactBadges contacts={venue.contacts} />
                  </TableCell>
                  <TableCell className="px-1 py-1.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-7"
                        >
                          <MoreHorizontal className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="dark">
                        <DropdownMenuItem asChild>
                          <Link href={`/crm/venues/${venue.id}`}>
                            Bewerken
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleFavorite(venue.id);
                          }}
                        >
                          {venue.favorite
                            ? "Verwijder favoriet"
                            : "Maak favoriet"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleArchive(venue.id, !venue.archived);
                          }}
                        >
                          {venue.archived
                            ? "Herstel uit archief"
                            : "Archiveer"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(event) => {
                            event.stopPropagation();
                            setDeleteId(venue.id);
                          }}
                        >
                          Verwijderen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DeleteAlert
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Venue verwijderen?"
        description="Dit kan niet ongedaan worden gemaakt."
        onConfirm={handleDelete}
      />

      <AlertDialog
        open={rejectionPrompt !== null}
        onOpenChange={(open) => !open && setRejectionPrompt(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reden van afwijzing</AlertDialogTitle>
            <AlertDialogDescription>
              Geef een korte reden op voordat je deze venue als afgewezen
              markeert.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={rejectionPrompt?.reason ?? ""}
            onChange={(event) =>
              setRejectionPrompt((current) =>
                current
                  ? { ...current, reason: event.target.value }
                  : current,
              )
            }
            placeholder="Bijv. past niet bij ons genre"
            className="min-h-20 text-sm"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmRejection()}>
              Opslaan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
