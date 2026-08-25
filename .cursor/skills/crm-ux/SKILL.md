---
name: crm-ux
description: >-
  Design and build the Nillihc band CRM with Vercel-grade UX — compact, minimal
  clicks, shadcn/ui components. Use when working on /crm pages, contacts,
  venues, gigs, CRM layout, or when the user asks for CRM UX improvements.
---

# Nillihc CRM UX

Build a **fast, quiet, operational** CRM. The user manages **contacts**, **venues**, and **gigs** — not a marketing site.

## North star

> Every common task in **≤2 clicks** from the main CRM view. Zero decorative chrome.

Benchmark: Vercel Dashboard — dense layout, sidebar nav, inline actions, sheets over pages, instant feedback.

## Before coding

1. Read current CRM: `src/app/crm/`, `src/lib/crm/`, `src/db/schema/`.
2. Check installed shadcn components in `src/components/ui/`. Install missing ones via shadcn MCP or `pnpm dlx shadcn@latest add <name>`.
3. Prefer **extending** existing schema/actions over parallel systems.

## Layout rules

| Do | Don't |
|----|-------|
| Fixed **sidebar** (nav + entity switch) | Large hero headers, taglines, role badges |
| Single **toolbar row**: search + filters + one primary CTA | Multi-section page headers |
| **Sheet** or **Dialog** for create/edit/detail (contacts, gigs) | Dedicated `/new` or `/edit` routes for contacts/gigs |
| **Full page** for venue detail (`/crm/venues/[id]`, `/crm/venues/new`) | Venue create/edit in a sheet |
| **Data table** as home for each entity | Card grids for list views |
| **Toast** (Sonner) for save/delete feedback | Inline success paragraphs |
| Collapse empty optional fields | Show 15-field forms by default |

### CRM shell structure

```
┌──────────┬─────────────────────────────────────────┐
│ Sidebar  │ [Search…] [Filter ▾] [+ Add contact]    │
│          ├─────────────────────────────────────────┤
│ Contacts │ Data table (sortable, row actions)      │
│ Venues   │                                         │
│ Gigs     │                                         │
│          │                                         │
│ ──────── │                                         │
│ Logout   │                                         │
└──────────┴─────────────────────────────────────────┘
```

- Sidebar: `Sidebar`, `SidebarMenu`, `SidebarMenuButton` — max width ~240px.
- Main header height: **≤56px**. Title optional; prefer active nav label in sidebar.
- Hide public-site footer on `/crm` (already handled via middleware header).

## Click budgets

Design to these targets:

| Task | Max clicks | Pattern |
|------|------------|---------|
| Add contact | 2 | Toolbar **+** → sheet with required fields only |
| Find contact | 1 | Toolbar search filters table live |
| Edit contact | 2 | Row click → sheet, auto-save or single Save |
| Edit venue | 2 | Row click → full venue page |
| Delete contact | 2 | Row **⋯** → Delete → confirm dialog |
| Switch entity (contacts/venues/gigs) | 1 | Sidebar nav |
| Log out | 1 | Sidebar footer |

If a flow exceeds the budget, redesign before shipping.

## shadcn component map

Install via MCP `get_add_command_for_items` or CLI. Default style: **new-york** (see `components.json`).

| UX need | shadcn components |
|---------|-------------------|
| CRM shell | `sidebar`, `separator`, `scroll-area` |
| Lists | `table`, `badge`, `dropdown-menu`, `checkbox` (bulk later) |
| Create/edit | `sheet`, `form`, `input`, `label`, `textarea`, `select` |
| Search/filter | `input`, `popover`, `command` (combobox pattern) |
| Confirm destructive | `alert-dialog` |
| Feedback | `sonner` |
| Loading | `skeleton` |
| Entity tabs (if no sidebar room) | `tabs` |
| Date (gigs) | `calendar`, `popover` |

**Required baseline** for CRM work: `sidebar`, `sheet`, `table`, `input`, `label`, `select`, `dropdown-menu`, `alert-dialog`, `sonner`, `badge`, `separator`.

Use existing `Button` from `@/components/ui/button`. Match site tokens in `globals.css` — CRM uses same palette, not a separate theme.

## Forms

- **Create sheet**: show only `firstName`, `type`, `email`/`phone` (one required contact method). Rest under "More fields" collapsible.
- **Edit sheet**: same fields; pre-filled; optimistic UI where safe.
- Labels in **Dutch** (site language). Code/comments in English.
- Validate on submit; field errors inline via `FormMessage`.
- No full-page spinners — disable submit button + toast on completion.

## Data tables

- Row click opens detail/edit sheet (not navigation).
- Row **⋯** menu: Edit, Delete, (future) Link to gig.
- Columns: name, organization, type, status, contact, updated — hide low-value columns on mobile.
- Empty state: one line + primary button ("Voeg contact toe") — no illustration bloat.

## Domain model guidance

### Contacts
Existing schema: `src/db/schema/contacts.ts`. Types include `venue`, `promoter`, etc.

### Venues
Prefer **filtered contacts view** (`type = venue`) until a dedicated `venues` table is justified. Venue-specific fields (capacity, address, tech rider link) belong on a venue record or linked entity — don't duplicate contact data.

### Gigs
New entity when implemented: date, venue (FK or link), fee/status, notes, contact links. Gigs list = table; create/edit = sheet; link venue via **combobox** search.

## File organization

```
src/app/crm/
  layout.tsx          # Sidebar shell (server)
  page.tsx            # Redirect or default entity
  contacts/page.tsx   # Contacts table view
  venues/page.tsx     # Venues table
  venues/new/page.tsx # Create venue (full page)
  venues/[id]/page.tsx # Venue detail/edit (full page)
  gigs/page.tsx       # Gigs table
src/components/crm/
  crm-sidebar.tsx
  contacts-table.tsx
  contact-sheet.tsx
  venue-detail-view.tsx
  crm-toolbar.tsx
src/lib/crm/
  actions.ts          # Server actions
  queries.ts          # Shared DB reads (optional)
```

Keep client components leaf-level (`"use client"` on sheets/tables/detail forms only).

## Anti-patterns (reject these)

- Marketing hero ("Nillihc CRM", role subtitle, large logout in header)
- Permanent create form beside the list (two-pane admin template)
- `window.confirm` for delete
- Full page reload after mutations (`router.refresh()` sparingly; prefer revalidate + optimistic)
- Custom CSS that bypasses shadcn tokens
- New npm UI libs when shadcn covers the need
- Venue create/edit in a sheet — venues use full pages for room to grow

## Implementation checklist

When redesigning a CRM screen:

```
- [ ] Sidebar nav with Contacts / Venues / Gigs
- [ ] Toolbar: search + primary add action
- [ ] Data table with row actions
- [ ] Sheet for create/edit (contacts/gigs) or full page (venues)
- [ ] Alert dialog for delete
- [ ] Sonner toasts wired
- [ ] Click budget verified for top 3 tasks
- [ ] Mobile: sidebar → sheet trigger, table scrolls horizontally
- [ ] robots noindex preserved on /crm
```

## Verification

1. `pnpm build` passes.
2. Manual: add contact in ≤2 clicks from `/crm/contacts`; open venue page from list in ≤2 clicks.
3. Header area ≤56px; no duplicate titles (sidebar + page).
4. All interactive elements reachable via shadcn components (no raw unstyled inputs).

## Reference

- shadcn component recipes and Vercel patterns: [reference.md](reference.md)
