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
import type { Gig } from "@/db/schema";
import { deleteGig, upsertGig } from "@/lib/crm/actions";
import {
  formatContactName,
  formatDateTime,
  gigStatusLabels,
  toDateTimeLocalValue,
} from "@/lib/crm/labels";
import type { ContactOption, GigWithRelations } from "@/lib/crm/queries";

type VenueOption = { id: string; name: string; city: string | null };
type SheetMode = { kind: "create" } | { kind: "edit"; gig: GigWithRelations };

export function GigsView({
  gigs,
  venueOptions,
  contactOptions,
}: {
  gigs: GigWithRelations[];
  venueOptions: VenueOption[];
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
      setSelectedContactIds(sheet.gig.contacts.map((contact) => contact.id));
      return;
    }
    if (sheet?.kind === "create") {
      setSelectedContactIds([]);
    }
  }, [sheet]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return gigs;

    return gigs.filter((gig) =>
      [
        gig.title,
        gig.venueName,
        gig.fee,
        gig.notes,
        gigStatusLabels[gig.status],
        formatDateTime(gig.date),
        ...gig.contacts.map((contact) => formatContactName(contact)),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [gigs, search]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const form = new FormData(event.currentTarget);
    const result = await upsertGig({
      id: sheet?.kind === "edit" ? sheet.gig.id : undefined,
      title: String(form.get("title") ?? ""),
      date: String(form.get("date") ?? ""),
      venueId:
        String(form.get("venueId") ?? "") === "none"
          ? null
          : String(form.get("venueId") ?? "") || null,
      status: String(form.get("status") ?? "inquiry") as Gig["status"],
      fee: String(form.get("fee") ?? ""),
      notes: String(form.get("notes") ?? ""),
      contactIds: selectedContactIds,
    });

    setPending(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(
      sheet?.kind === "edit" ? "Optreden bijgewerkt" : "Optreden toegevoegd",
    );
    setSheet(null);
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteId) return;
    const result = await deleteGig(deleteId);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Optreden verwijderd");
    setDeleteId(null);
    router.refresh();
  }

  const editing = sheet?.kind === "edit" ? sheet.gig : null;

  return (
    <>
      <CrmToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Zoek optredens…"
        addLabel="Optreden"
        onAdd={() => setSheet({ kind: "create" })}
      />

      {filtered.length === 0 ? (
        <div className="flex items-center justify-between border border-border bg-card/40 px-3 py-5 text-sm">
          <span className="text-muted-foreground">Nog geen optredens</span>
          <Button size="sm" className="h-7 text-xs" onClick={() => setSheet({ kind: "create" })}>
            Optreden toevoegen
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <Table className="text-[13px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-8 px-3 text-xs text-muted-foreground">Datum</TableHead>
                <TableHead className="h-8 px-3 text-xs text-muted-foreground">Titel</TableHead>
                <TableHead className="h-8 px-3 text-xs text-muted-foreground">Venue</TableHead>
                <TableHead className="h-8 px-3 text-xs text-muted-foreground">Status</TableHead>
                <TableHead className="hidden h-8 px-3 text-xs text-muted-foreground md:table-cell">
                  Contacten
                </TableHead>
                <TableHead className="hidden h-8 px-3 text-xs text-muted-foreground lg:table-cell">
                  Fee
                </TableHead>
                <TableHead className="h-8 w-8 px-1" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((gig) => (
                <TableRow
                  key={gig.id}
                  className="cursor-pointer"
                  onClick={() => setSheet({ kind: "edit", gig })}
                >
                  <TableCell className="px-3 py-1.5 text-muted-foreground">
                    {formatDateTime(gig.date)}
                  </TableCell>
                  <TableCell className="px-3 py-1.5 font-medium">{gig.title}</TableCell>
                  <TableCell className="px-3 py-1.5">
                    {gig.venueName ?? "—"}
                  </TableCell>
                  <TableCell className="px-3 py-1.5">
                    <Badge
                      variant="outline"
                      className="rounded-md px-1.5 py-0 text-[10px] font-normal"
                    >
                      {gigStatusLabels[gig.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden px-3 py-1.5 md:table-cell">
                    <ContactBadges contacts={gig.contacts} />
                  </TableCell>
                  <TableCell className="hidden px-3 py-1.5 text-muted-foreground lg:table-cell">
                    {gig.fee ?? "—"}
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
                            setSheet({ kind: "edit", gig });
                          }}
                        >
                          Bewerken
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(gig.id);
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
              {sheet?.kind === "edit" ? "Optreden bewerken" : "Nieuw optreden"}
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-3 p-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs text-muted-foreground">
                Titel *
              </Label>
              <Input
                id="title"
                name="title"
                required
                className="h-8 shadow-none"
                defaultValue={editing?.title}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs text-muted-foreground">
                Datum & tijd *
              </Label>
              <Input
                id="date"
                name="date"
                type="datetime-local"
                required
                className="h-8 shadow-none"
                defaultValue={toDateTimeLocalValue(editing?.date ?? "")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="venueId" className="text-xs text-muted-foreground">
                Venue
              </Label>
              <select
                id="venueId"
                name="venueId"
                defaultValue={editing?.venueId ?? "none"}
                className="crm-select"
              >
                <option value="none">Geen venue</option>
                {venueOptions.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name}
                    {venue.city ? ` · ${venue.city}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Contacten</Label>
              <ContactMultiSelect
                options={contactOptions}
                value={selectedContactIds}
                onChange={setSelectedContactIds}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs text-muted-foreground">
                  Status
                </Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={editing?.status ?? "inquiry"}
                  className="crm-select"
                >
                  {Object.entries(gigStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fee" className="text-xs text-muted-foreground">
                  Fee
                </Label>
                <Input
                  id="fee"
                  name="fee"
                  className="h-8 shadow-none"
                  defaultValue={editing?.fee ?? ""}
                />
              </div>
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
        title="Optreden verwijderen?"
        description="Dit kan niet ongedaan worden gemaakt."
        onConfirm={handleDelete}
      />
    </>
  );
}
