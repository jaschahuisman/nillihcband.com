"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Mail, Phone, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Contact } from "@/db/schema";
import { upsertContact } from "@/lib/crm/actions";
import {
  contactTypeLabels,
  formatContactName,
} from "@/lib/crm/labels";
import type { ContactOption } from "@/lib/crm/queries";
import { cn } from "@/lib/utils";

function ContactCard({
  contact,
  onRemove,
}: {
  contact: ContactOption;
  onRemove: () => void;
}) {
  const name = formatContactName(contact);

  return (
    <div className="relative rounded-md border border-border bg-card/40 p-3 pr-8">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-1.5 right-1.5 size-6 text-muted-foreground"
        onClick={onRemove}
        aria-label={`Verwijder ${name}`}
      >
        <X className="size-3" />
      </Button>
      <div>
        <div className="text-sm font-medium">{name}</div>
        <div className="text-[11px] text-muted-foreground">
          {contactTypeLabels[contact.type]}
          {contact.jobTitle ? ` · ${contact.jobTitle}` : ""}
        </div>
      </div>
      {contact.organization ? (
        <div className="mt-1 text-xs text-muted-foreground">
          {contact.organization}
          {contact.city ? ` · ${contact.city}` : ""}
        </div>
      ) : contact.city ? (
        <div className="mt-1 text-xs text-muted-foreground">{contact.city}</div>
      ) : null}
      <div className="mt-2 space-y-1">
        {contact.email ? (
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-1.5 text-xs text-foreground hover:underline"
          >
            <Mail className="size-3 shrink-0 text-muted-foreground" />
            <span className="truncate">{contact.email}</span>
          </a>
        ) : null}
        {contact.phone ? (
          <a
            href={`tel:${contact.phone}`}
            className="flex items-center gap-1.5 text-xs text-foreground hover:underline"
          >
            <Phone className="size-3 shrink-0 text-muted-foreground" />
            <span className="truncate">{contact.phone}</span>
          </a>
        ) : null}
        {!contact.email && !contact.phone ? (
          <p className="text-xs text-muted-foreground">
            Geen e-mail of telefoon
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function ContactMultiSelect({
  options,
  value,
  onChange,
  placeholder = "Kies contacten",
  defaultOrganization = "",
  defaultCity = "",
  defaultType = "venue",
}: {
  options: ContactOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  defaultOrganization?: string;
  defaultCity?: string;
  defaultType?: Contact["type"];
}) {
  const [localOptions, setLocalOptions] = useState(options);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState(defaultOrganization);
  const [jobTitle, setJobTitle] = useState("");
  const [type, setType] = useState<Contact["type"]>(defaultType);

  useEffect(() => {
    setLocalOptions((current) => {
      const byId = new Map(current.map((option) => [option.id, option]));
      for (const option of options) {
        byId.set(option.id, option);
      }
      return [...byId.values()].sort((a, b) =>
        formatContactName(a).localeCompare(formatContactName(b), "nl"),
      );
    });
  }, [options]);

  useEffect(() => {
    if (!createOpen) return;
    setOrganization(defaultOrganization);
    setType(defaultType);
  }, [createOpen, defaultOrganization, defaultType]);

  const selected = localOptions.filter((option) => value.includes(option.id));

  function toggleContact(contactId: string) {
    onChange(
      value.includes(contactId)
        ? value.filter((id) => id !== contactId)
        : [...value, contactId],
    );
  }

  function openCreate() {
    setPickerOpen(false);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setJobTitle("");
    setOrganization(defaultOrganization);
    setType(defaultType);
    setCreateOpen(true);
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() && !phone.trim()) {
      toast.error("E-mail of telefoon is verplicht.");
      return;
    }

    setPending(true);
    const result = await upsertContact({
      firstName,
      lastName,
      email,
      phone,
      organization,
      jobTitle,
      type,
      city: defaultCity || null,
      status: "active",
    });
    setPending(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    setLocalOptions((current) => {
      if (current.some((option) => option.id === result.contact.id)) {
        return current;
      }
      return [...current, result.contact].sort((a, b) =>
        formatContactName(a).localeCompare(formatContactName(b), "nl"),
      );
    });

    if (!value.includes(result.id)) {
      onChange([...value, result.id]);
    }

    toast.success("Contact toegevoegd");
    setCreateOpen(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 min-w-0 flex-1 justify-between border-border bg-transparent px-2.5 font-normal text-foreground shadow-none"
            >
              <span className="truncate text-[13px] text-foreground">
                {selected.length > 0
                  ? `${selected.length} contact${selected.length === 1 ? "" : "en"}`
                  : placeholder}
              </span>
              <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="dark w-(--radix-popover-trigger-width) border-border bg-popover p-0 text-popover-foreground"
            align="start"
          >
            <Command>
              <CommandInput placeholder="Zoek contact…" />
              <CommandList>
                <CommandEmpty>Geen contacten gevonden.</CommandEmpty>
                <CommandGroup>
                  {localOptions.map((option) => (
                    <CommandItem
                      key={option.id}
                      value={[
                        option.firstName,
                        option.lastName,
                        option.email,
                        option.phone,
                        option.organization,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onSelect={() => toggleContact(option.id)}
                    >
                      <Check
                        className={cn(
                          "size-3.5",
                          value.includes(option.id)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      <span className="truncate text-sm">
                        {formatContactName(option)}
                        {option.organization
                          ? ` · ${option.organization}`
                          : ""}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    value="nieuw contact aanmaken"
                    onSelect={openCreate}
                  >
                    <Plus className="size-3.5" />
                    Nieuw contact
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="size-7 shrink-0"
          onClick={openCreate}
          aria-label="Nieuw contact"
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      {selected.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {selected.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onRemove={() => toggleContact(contact.id)}
            />
          ))}
        </div>
      ) : null}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="dark gap-0 p-0 sm:max-w-md">
          <DialogHeader className="border-b border-border px-4 py-3">
            <DialogTitle className="text-base">Nieuw contact</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-2.5 px-4 py-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label
                  htmlFor="contact-firstName"
                  className="text-[11px] text-muted-foreground"
                >
                  Voornaam *
                </Label>
                <Input
                  id="contact-firstName"
                  required
                  autoFocus
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="h-7 text-[13px] shadow-none"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="contact-lastName"
                  className="text-[11px] text-muted-foreground"
                >
                  Achternaam
                </Label>
                <Input
                  id="contact-lastName"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="h-7 text-[13px] shadow-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label
                  htmlFor="contact-email"
                  className="text-[11px] text-muted-foreground"
                >
                  E-mail
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-7 text-[13px] shadow-none"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="contact-phone"
                  className="text-[11px] text-muted-foreground"
                >
                  Telefoon
                </Label>
                <Input
                  id="contact-phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="h-7 text-[13px] shadow-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label
                  htmlFor="contact-organization"
                  className="text-[11px] text-muted-foreground"
                >
                  Organisatie
                </Label>
                <Input
                  id="contact-organization"
                  value={organization}
                  onChange={(event) => setOrganization(event.target.value)}
                  className="h-7 text-[13px] shadow-none"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="contact-type"
                  className="text-[11px] text-muted-foreground"
                >
                  Type
                </Label>
                <select
                  id="contact-type"
                  value={type}
                  onChange={(event) =>
                    setType(event.target.value as Contact["type"])
                  }
                  className="crm-select h-7 text-[13px]"
                >
                  {Object.entries(contactTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="contact-jobTitle"
                className="text-[11px] text-muted-foreground"
              >
                Functie
              </Label>
              <Input
                id="contact-jobTitle"
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                className="h-7 text-[13px] shadow-none"
                placeholder="Bijv. programmeur"
              />
            </div>

            <DialogFooter className="gap-2 px-0 pt-1 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setCreateOpen(false)}
              >
                Annuleren
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={pending}
                className="h-7 text-xs"
              >
                {pending ? "Opslaan…" : "Toevoegen"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
