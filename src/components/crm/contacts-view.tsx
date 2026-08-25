"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
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
import type { Contact } from "@/db/schema";
import { deleteContact, upsertContact } from "@/lib/crm/actions";
import {
  contactStatusLabels,
  contactTypeLabels,
  formatContactName,
  formatDate,
  parseTags,
} from "@/lib/crm/labels";

type SheetMode = { kind: "create" } | { kind: "edit"; contact: Contact };

export function ContactsView({ contacts }: { contacts: Contact[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sheet, setSheet] = useState<SheetMode | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return contacts;

    return contacts.filter((contact) => {
      const haystack = [
        formatContactName(contact),
        contact.organization,
        contact.email,
        contact.phone,
        contact.city,
        contactTypeLabels[contact.type],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [contacts, search]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const form = new FormData(event.currentTarget);
    const result = await upsertContact({
      id: sheet?.kind === "edit" ? sheet.contact.id : undefined,
      firstName: String(form.get("firstName") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      organization: String(form.get("organization") ?? ""),
      jobTitle: String(form.get("jobTitle") ?? ""),
      type: String(form.get("type") ?? "other") as Contact["type"],
      status: String(form.get("status") ?? "lead") as Contact["status"],
      priority: String(form.get("priority") ?? "normal") as Contact["priority"],
      city: String(form.get("city") ?? ""),
      source: String(form.get("source") ?? ""),
      notes: String(form.get("notes") ?? ""),
      tags: parseTags(String(form.get("tags") ?? "")),
    });

    setPending(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(sheet?.kind === "edit" ? "Contact bijgewerkt" : "Contact toegevoegd");
    setSheet(null);
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteId) return;

    const result = await deleteContact(deleteId);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("Contact verwijderd");
    setDeleteId(null);
    router.refresh();
  }

  const editing = sheet?.kind === "edit" ? sheet.contact : null;

  return (
    <>
      <CrmToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Zoek contacten…"
        addLabel="Contact"
        onAdd={() => setSheet({ kind: "create" })}
      />

      {filtered.length === 0 ? (
        <div className="flex items-center justify-between border border-border bg-card/40 px-3 py-5 text-sm">
          <span className="text-muted-foreground">Nog geen contacten</span>
          <Button size="sm" className="h-7 text-xs" onClick={() => setSheet({ kind: "create" })}>
            Contact toevoegen
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <Table className="text-[13px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-8 px-3 text-xs text-muted-foreground">Naam</TableHead>
                <TableHead className="h-8 px-3 text-xs text-muted-foreground">Organisatie</TableHead>
                <TableHead className="h-8 px-3 text-xs text-muted-foreground">Type</TableHead>
                <TableHead className="h-8 px-3 text-xs text-muted-foreground">Status</TableHead>
                <TableHead className="hidden h-8 px-3 text-xs text-muted-foreground md:table-cell">
                  Contact
                </TableHead>
                <TableHead className="hidden h-8 px-3 text-xs text-muted-foreground lg:table-cell">
                  Bijgewerkt
                </TableHead>
                <TableHead className="h-8 w-8 px-1" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((contact) => (
                <TableRow
                  key={contact.id}
                  className="cursor-pointer"
                  onClick={() => setSheet({ kind: "edit", contact })}
                >
                  <TableCell className="px-3 py-1.5 font-medium">
                    {formatContactName(contact)}
                  </TableCell>
                  <TableCell className="px-3 py-1.5 text-muted-foreground">
                    {contact.organization ?? "—"}
                  </TableCell>
                  <TableCell className="px-3 py-1.5">
                    <Badge
                      variant="secondary"
                      className="rounded-md px-1.5 py-0 text-[10px] font-normal"
                    >
                      {contactTypeLabels[contact.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-1.5">
                    <Badge
                      variant="outline"
                      className="rounded-md px-1.5 py-0 text-[10px] font-normal"
                    >
                      {contactStatusLabels[contact.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden px-3 py-1.5 text-muted-foreground md:table-cell">
                    {contact.email ?? contact.phone ?? "—"}
                  </TableCell>
                  <TableCell className="hidden px-3 py-1.5 text-muted-foreground lg:table-cell">
                    {formatDate(contact.updatedAt)}
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
                            setSheet({ kind: "edit", contact });
                          }}
                        >
                          Bewerken
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(contact.id);
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
        <SheetContent className="dark gap-0 overflow-y-auto p-0 sm:max-w-md">
          <SheetHeader className="border-b border-border px-6 py-3">
            <SheetTitle className="text-base">
              {sheet?.kind === "edit" ? "Contact bewerken" : "Nieuw contact"}
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-3 px-6 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-xs text-muted-foreground">
                Voornaam *
              </Label>
              <Input
                id="firstName"
                name="firstName"
                required
                className="h-8 shadow-none"
                defaultValue={editing?.firstName}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="type" className="text-xs text-muted-foreground">
                  Type
                </Label>
                <select
                  id="type"
                  name="type"
                  defaultValue={editing?.type ?? "other"}
                  className="crm-select"
                >
                  {Object.entries(contactTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs text-muted-foreground">
                  Status
                </Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={editing?.status ?? "lead"}
                  className="crm-select"
                >
                  {Object.entries(contactStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-muted-foreground">
                  E-mail
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="h-8 shadow-none"
                  defaultValue={editing?.email ?? ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs text-muted-foreground">
                  Telefoon
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  className="h-8 shadow-none"
                  defaultValue={editing?.phone ?? ""}
                />
              </div>
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
                  <Label htmlFor="lastName" className="text-xs text-muted-foreground">
                    Achternaam
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    className="h-8 shadow-none"
                    defaultValue={editing?.lastName ?? ""}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="organization" className="text-xs text-muted-foreground">
                    Organisatie
                  </Label>
                  <Input
                    id="organization"
                    name="organization"
                    className="h-8 shadow-none"
                    defaultValue={editing?.organization ?? ""}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="jobTitle" className="text-xs text-muted-foreground">
                    Functie
                  </Label>
                  <Input
                    id="jobTitle"
                    name="jobTitle"
                    className="h-8 shadow-none"
                    defaultValue={editing?.jobTitle ?? ""}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
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
                  <div className="space-y-1.5">
                    <Label htmlFor="priority" className="text-xs text-muted-foreground">
                      Prioriteit
                    </Label>
                    <select
                      id="priority"
                      name="priority"
                      defaultValue={editing?.priority ?? "normal"}
                      className="crm-select"
                    >
                      <option value="low">Laag</option>
                      <option value="normal">Normaal</option>
                      <option value="high">Hoog</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="source" className="text-xs text-muted-foreground">
                    Bron
                  </Label>
                  <Input
                    id="source"
                    name="source"
                    className="h-8 shadow-none"
                    defaultValue={editing?.source ?? ""}
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
        title="Contact verwijderen?"
        description="Dit kan niet ongedaan worden gemaakt."
        onConfirm={handleDelete}
      />
    </>
  );
}
