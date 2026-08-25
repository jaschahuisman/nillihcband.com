"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { ContactBadges } from "@/components/crm/contact-badges";
import { ContactMultiSelect } from "@/components/crm/contact-multi-select";
import { DeleteAlert } from "@/components/crm/delete-alert";
import { CrmToolbar } from "@/components/crm/crm-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { deleteSimilarArtist, upsertSimilarArtist } from "@/lib/crm/actions";
import { formatContactName, parseTags } from "@/lib/crm/labels";
import type { ContactOption, SimilarArtistWithContacts } from "@/lib/crm/queries";

type SheetMode =
  | { kind: "create" }
  | { kind: "edit"; artist: SimilarArtistWithContacts };

export function SimilarArtistsView({
  artists,
  contactOptions,
}: {
  artists: SimilarArtistWithContacts[];
  contactOptions: ContactOption[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sheet, setSheet] = useState<SheetMode | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

  useEffect(() => {
    if (sheet?.kind === "edit") {
      setSelectedContactIds(sheet.artist.contacts.map((contact) => contact.id));
      return;
    }
    if (sheet?.kind === "create") {
      setSelectedContactIds([]);
    }
  }, [sheet]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return artists;

    return artists.filter((artist) =>
      [
        artist.name,
        artist.genre,
        artist.city,
        artist.tags?.join(" "),
        ...artist.contacts.map((contact) => formatContactName(contact)),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [artists, search]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const form = new FormData(event.currentTarget);
    const result = await upsertSimilarArtist({
      id: sheet?.kind === "edit" ? sheet.artist.id : undefined,
      name: String(form.get("name") ?? ""),
      genre: String(form.get("genre") ?? ""),
      city: String(form.get("city") ?? ""),
      spotifyUrl: String(form.get("spotifyUrl") ?? ""),
      website: String(form.get("website") ?? ""),
      notes: String(form.get("notes") ?? ""),
      tags: parseTags(String(form.get("tags") ?? "")),
      contactIds: selectedContactIds,
    });

    setPending(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(
      sheet?.kind === "edit"
        ? "Vergelijkbare artiest bijgewerkt"
        : "Vergelijkbare artiest toegevoegd",
    );
    setSheet(null);
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteId) return;
    const result = await deleteSimilarArtist(deleteId);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Vergelijkbare artiest verwijderd");
    setDeleteId(null);
    router.refresh();
  }

  const editing = sheet?.kind === "edit" ? sheet.artist : null;

  return (
    <>
      <CrmToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Zoek vergelijkbare artiesten…"
        addLabel="Vergelijkbare artiest"
        onAdd={() => setSheet({ kind: "create" })}
      />

      {filtered.length === 0 ? (
        <div className="flex items-center justify-between border border-border bg-card/40 px-3 py-5 text-sm">
          <span className="text-muted-foreground">
            Nog geen vergelijkbare artiesten
          </span>
          <Button size="sm" className="h-7 text-xs" onClick={() => setSheet({ kind: "create" })}>
            Vergelijkbare artiest toevoegen
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <Table className="text-[13px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-8 px-3 text-xs text-muted-foreground">Naam</TableHead>
                <TableHead className="h-8 px-3 text-xs text-muted-foreground">Genre</TableHead>
                <TableHead className="hidden h-8 px-3 text-xs text-muted-foreground md:table-cell">
                  Contacten
                </TableHead>
                <TableHead className="hidden h-8 px-3 text-xs text-muted-foreground lg:table-cell">
                  Tags
                </TableHead>
                <TableHead className="h-8 w-8 px-1" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((artist) => (
                <TableRow
                  key={artist.id}
                  className="cursor-pointer"
                  onClick={() => setSheet({ kind: "edit", artist })}
                >
                  <TableCell className="px-3 py-1.5 font-medium">{artist.name}</TableCell>
                  <TableCell className="px-3 py-1.5 text-muted-foreground">
                    {artist.genre ?? "—"}
                  </TableCell>
                  <TableCell className="hidden px-3 py-1.5 md:table-cell">
                    <ContactBadges contacts={artist.contacts} />
                  </TableCell>
                  <TableCell className="hidden px-3 py-1.5 lg:table-cell">
                    {artist.tags?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {artist.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="rounded-md px-1.5 py-0 text-[10px] font-normal"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-1 py-1.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon-sm" className="size-7">
                          <MoreHorizontal className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setSheet({ kind: "edit", artist });
                          }}
                        >
                          Bewerken
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(artist.id);
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

      <Sheet open={sheet !== null} onOpenChange={(open) => !open && setSheet(null)}>
        <SheetContent className="gap-0 overflow-y-auto p-0 sm:max-w-md">
          <SheetHeader className="border-b border-border px-4 py-3">
            <SheetTitle className="text-base">
              {sheet?.kind === "edit"
                ? "Vergelijkbare artiest bewerken"
                : "Nieuwe vergelijkbare artiest"}
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-3 p-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs text-muted-foreground">
                Naam *
              </Label>
              <Input
                id="name"
                name="name"
                required
                className="h-8 shadow-none"
                defaultValue={editing?.name}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="genre" className="text-xs text-muted-foreground">
                  Genre
                </Label>
                <Input
                  id="genre"
                  name="genre"
                  className="h-8 shadow-none"
                  defaultValue={editing?.genre ?? ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs text-muted-foreground">
                  Stad
                </Label>
                <Input
                  id="city"
                  name="city"
                  className="h-8 shadow-none"
                  defaultValue={editing?.city ?? ""}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Contacten</Label>
              <ContactMultiSelect
                options={contactOptions}
                value={selectedContactIds}
                onChange={setSelectedContactIds}
              />
            </div>

            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-0 text-xs text-muted-foreground"
                >
                  Meer velden
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="spotifyUrl" className="text-xs text-muted-foreground">
                    Spotify URL
                  </Label>
                  <Input
                    id="spotifyUrl"
                    name="spotifyUrl"
                    className="h-8 shadow-none"
                    defaultValue={editing?.spotifyUrl ?? ""}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="website" className="text-xs text-muted-foreground">
                    Website
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    className="h-8 shadow-none"
                    defaultValue={editing?.website ?? ""}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tags" className="text-xs text-muted-foreground">
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    name="tags"
                    className="h-8 shadow-none"
                    defaultValue={editing?.tags?.join(", ") ?? ""}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs text-muted-foreground">
                    Notities
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="min-h-16 shadow-none"
                    defaultValue={editing?.notes ?? ""}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <SheetFooter className="px-0 pt-1">
              <Button type="submit" size="sm" disabled={pending} className="h-8 w-full">
                {pending ? "Opslaan…" : "Opslaan"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <DeleteAlert
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Vergelijkbare artiest verwijderen?"
        description="Dit kan niet ongedaan worden gemaakt."
        onConfirm={handleDelete}
      />
    </>
  );
}
