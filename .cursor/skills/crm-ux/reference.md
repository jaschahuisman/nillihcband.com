# CRM UX Reference

## Vercel patterns to copy

1. **Sidebar is the wayfinding** — page content never repeats the section title in large type.
2. **Primary action always top-right** of the content area (+ Add …).
3. **Search is always visible** in the toolbar, not behind a toggle.
4. **Sheets slide in** for detail/edit; closing returns to the same scroll position.
5. **Subtle borders**, no boxed cards inside cards.
6. **Monospace badges** for status (shadcn `Badge` variant `secondary` / `outline`).
7. **Keyboard**: reserve `⌘K` / `Ctrl+K` for command palette when entity count grows.

## shadcn install commands

Run from project root (use pnpm):

```bash
pnpm dlx shadcn@latest add sidebar sheet table input label select textarea form dropdown-menu alert-dialog sonner badge separator scroll-area popover command calendar
```

Install incrementally — only what the current task needs.

## Sheet create flow (contacts)

```tsx
// Toolbar
<Button onClick={() => setOpen(true)}>Contact toevoegen</Button>

// Sheet — minimal fields first
<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Nieuw contact</SheetTitle>
    </SheetHeader>
    <Form>...</Form> {/* firstName, type, email | phone */}
  </SheetContent>
</Sheet>
```

## Table row actions

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={() => openEdit(row)}>Bewerken</DropdownMenuItem>
    <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(row.id)}>
      Verwijderen
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Delete confirmation

Always `AlertDialog` — never `confirm()`.

## Toast wiring

In CRM layout:

```tsx
import { Toaster } from "@/components/ui/sonner";
// ...
<Toaster richColors closeButton />
```

Server action success → `toast.success("Contact opgeslagen")` in client callback.

## Dutch copy defaults

| English | Dutch UI |
|---------|----------|
| Add contact | Contact toevoegen |
| Search contacts | Zoek contacten… |
| Edit | Bewerken |
| Delete | Verwijderen |
| Save | Opslaan |
| Cancel | Annuleren |
| No contacts yet | Nog geen contacten |
| Venues | Venues |
| Gigs | Optredens |

## Responsive

| Breakpoint | Behavior |
|------------|----------|
| `< md` | Sidebar collapses to icon rail or hamburger → sheet |
| `≥ md` | Full sidebar visible |
| Table | `overflow-x-auto`; hide `updatedAt` column on small screens |

## Nillihc CRM routes (target)

| Route | Purpose |
|-------|---------|
| `/crm` | Redirect → `/crm/contacts` |
| `/crm/contacts` | All contacts table |
| `/crm/venues` | Contacts filtered `type=venue` |
| `/crm/gigs` | Gigs table (when schema exists) |
| `/crm/login` | Auth only — keep minimal, no sidebar |
