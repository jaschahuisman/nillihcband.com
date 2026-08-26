"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Mail, Sparkles, Trash2 } from "lucide-react";
import { CopyButton } from "@/components/crm/outreach/copy-button";
import {
  OutreachGenerateDialog,
  type GenerateOptions,
} from "@/components/crm/outreach/generate-dialog";
import { DeleteAlert } from "@/components/crm/delete-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { OutreachDraftStatus } from "@/db/schema";
import { formatDateTime } from "@/lib/crm/labels";
import type { LinkedContact } from "@/lib/crm/queries";
import type { OutreachDraftEntry, VenueResearchEntry } from "@/lib/outreach/queries";
import {
  outreachAngleLabels,
  outreachDraftStatusLabels,
  outreachKindLabels,
} from "@/lib/outreach/schemas";
import { cn } from "@/lib/utils";

export function OutreachDraftSheet({
  draft,
  venueName,
  venueEmail,
  research,
  contacts,
  pending,
  onOpenChange,
  onGenerateVersion,
  onSelectVersion,
  onSaveVersion,
  onStatusChange,
  onDelete,
}: {
  draft: OutreachDraftEntry | null;
  venueName: string;
  venueEmail: string | null;
  research: VenueResearchEntry | null;
  contacts: LinkedContact[];
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateVersion: (draftId: string, options: GenerateOptions) => Promise<void>;
  onSelectVersion: (draftId: string, versionId: string) => Promise<void>;
  onSaveVersion: (
    versionId: string,
    input: { subject: string; body: string },
  ) => Promise<void>;
  onStatusChange: (draftId: string, status: OutreachDraftStatus) => Promise<void>;
  onDelete: (draftId: string) => Promise<void>;
}) {
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  /**
   * Unsaved edits are scoped to the version they belong to, so switching
   * versions (or a regeneration arriving) never leaks text between them.
   */
  const [edits, setEdits] = useState<{
    versionId: string;
    subject: string;
    body: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const versions = useMemo(() => draft?.versions ?? [], [draft]);

  const activeVersion = useMemo(() => {
    if (versions.length === 0) return null;
    return (
      versions.find((version) => version.id === activeVersionId) ??
      versions.find((version) => version.selected) ??
      versions[versions.length - 1]
    );
  }, [versions, activeVersionId]);

  const pendingEdits =
    edits && activeVersion && edits.versionId === activeVersion.id ? edits : null;
  const subject = pendingEdits?.subject ?? activeVersion?.subject ?? "";
  const body = pendingEdits?.body ?? activeVersion?.body ?? "";

  const dirty =
    activeVersion !== null &&
    pendingEdits !== null &&
    (subject !== activeVersion.subject || body !== activeVersion.body);

  function patchEdits(patch: { subject?: string; body?: string }) {
    if (!activeVersion) return;
    setEdits({
      versionId: activeVersion.id,
      subject: patch.subject ?? subject,
      body: patch.body ?? body,
    });
  }

  const mailtoHref = venueEmail
    ? `mailto:${venueEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : null;

  async function handleSave() {
    if (!activeVersion || !dirty) return;
    setSaving(true);
    await onSaveVersion(activeVersion.id, { subject, body });
    setSaving(false);
    setEdits(null);
  }

  async function handlePickVersion(versionId: string) {
    if (!draft) return;
    setActiveVersionId(versionId);
    await onSelectVersion(draft.id, versionId);
  }

  return (
    <>
      <Sheet open={draft !== null} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full gap-0 p-0 sm:max-w-xl"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          {draft && activeVersion ? (
            <>
              <SheetHeader className="border-b border-border pr-12">
                <SheetTitle className="text-sm">
                  {outreachKindLabels[draft.kind]} · {venueName}
                </SheetTitle>
                <SheetDescription className="text-[11px]">
                  Versie {activeVersion.versionNumber} van {versions.length} ·{" "}
                  {formatDateTime(activeVersion.createdAt)}
                  {activeVersion.model ? ` · ${activeVersion.model}` : ""}
                  {activeVersion.edited ? " · handmatig aangepast" : ""}
                </SheetDescription>
              </SheetHeader>

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  {versions.map((version) => (
                    <Button
                      key={version.id}
                      type="button"
                      variant={version.id === activeVersion.id ? "default" : "outline"}
                      size="sm"
                      className="h-6 px-2 text-[11px]"
                      onClick={() => void handlePickVersion(version.id)}
                    >
                      v{version.versionNumber}
                      {version.selected ? " ✓" : ""}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1 px-2 text-[11px]"
                    onClick={() => setGenerateOpen(true)}
                    disabled={pending}
                  >
                    <Sparkles className="size-3" />
                    Nieuwe versie
                  </Button>
                </div>

                {activeVersion.angle ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal">
                      {outreachAngleLabels[activeVersion.angle]}
                    </Badge>
                    {activeVersion.language !== "nl" ? (
                      <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal">
                        {activeVersion.language.toUpperCase()}
                      </Badge>
                    ) : null}
                  </div>
                ) : null}

                <div className="space-y-1">
                  <Label htmlFor="draft-subject" className="text-[11px] text-muted-foreground">
                    Onderwerp
                  </Label>
                  <Input
                    id="draft-subject"
                    value={subject}
                    onChange={(event) => patchEdits({ subject: event.target.value })}
                    className="h-8 text-[13px]"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="draft-body" className="text-[11px] text-muted-foreground">
                    Bericht
                  </Label>
                  <Textarea
                    id="draft-body"
                    value={body}
                    onChange={(event) => patchEdits({ body: event.target.value })}
                    className="min-h-80 text-[13px] leading-relaxed"
                  />
                </div>

                {dirty ? (
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setEdits(null)}
                    >
                      Herstel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={saving}
                      onClick={() => void handleSave()}
                    >
                      {saving ? "Opslaan…" : "Bewaar aanpassing"}
                    </Button>
                  </div>
                ) : null}

                {activeVersion.rationale || activeVersion.talkingPoints.length > 0 ? (
                  <Collapsible>
                    <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-left text-[11px] text-muted-foreground hover:bg-input/30">
                      Waarom deze mail
                      <ChevronDown className="size-3 transition-transform group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 px-3 py-2">
                      {activeVersion.rationale ? (
                        <p className="text-[12px] leading-relaxed text-muted-foreground">
                          {activeVersion.rationale}
                        </p>
                      ) : null}
                      {activeVersion.talkingPoints.length > 0 ? (
                        <ul className="space-y-1">
                          {activeVersion.talkingPoints.map((point) => (
                            <li key={point} className="text-[12px] text-muted-foreground">
                              · {point}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {activeVersion.instructions ? (
                        <p className="text-[11px] text-muted-foreground/80">
                          Gevraagd: {activeVersion.instructions}
                        </p>
                      ) : null}
                    </CollapsibleContent>
                  </Collapsible>
                ) : null}
              </div>

              <SheetFooter className="gap-2 border-t border-border">
                <div className="flex flex-wrap items-center gap-1.5">
                  <CopyButton value={subject} label="Onderwerp" />
                  <CopyButton value={body} label="Tekst" variant="secondary" />
                  <CopyButton
                    value={`${subject}\n\n${body}`}
                    label="Alles"
                  />
                  {mailtoHref ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1.5 text-xs"
                      asChild
                    >
                      <a href={mailtoHref}>
                        <Mail className="size-3" />
                        Mail openen
                      </a>
                    </Button>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <select
                    value={draft.status}
                    onChange={(event) =>
                      void onStatusChange(
                        draft.id,
                        event.target.value as OutreachDraftStatus,
                      )
                    }
                    className={cn("crm-select h-7 max-w-40 text-[12px]")}
                    aria-label="Status"
                  >
                    {Object.entries(outreachDraftStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    {draft.sentAt ? (
                      <span className="text-[11px] text-muted-foreground">
                        Verzonden {formatDateTime(draft.sentAt)}
                      </span>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-7 text-muted-foreground"
                      onClick={() => setDeleteOpen(true)}
                      aria-label="Concept verwijderen"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {draft ? (
        <>
          <OutreachGenerateDialog
            open={generateOpen}
            onOpenChange={setGenerateOpen}
            onGenerate={async (options) => {
              await onGenerateVersion(draft.id, options);
              setGenerateOpen(false);
            }}
            research={research}
            contacts={contacts}
            lockedKind={draft.kind}
            hasSentMail
            pending={pending}
          />
          <DeleteAlert
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Concept verwijderen?"
            description="Alle versies van deze mail gaan verloren."
            onConfirm={async () => {
              await onDelete(draft.id);
              setDeleteOpen(false);
            }}
          />
        </>
      ) : null}
    </>
  );
}
