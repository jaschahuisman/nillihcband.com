"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  OutreachGenerateDialog,
  type GenerateOptions,
} from "@/components/crm/outreach/generate-dialog";
import { OutreachDraftSheet } from "@/components/crm/outreach/draft-sheet";
import { FindingsList } from "@/components/crm/outreach/findings-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import type { OutreachDraftStatus } from "@/db/schema";
import { formatDate, formatDateTime } from "@/lib/crm/labels";
import type { LinkedContact } from "@/lib/crm/queries";
import {
  applyFindingsAction,
  deleteOutreachDraftAction,
  dismissFindingAction,
  generateOutreachDraftAction,
  researchVenueAction,
  selectDraftVersionAction,
  setDraftStatusAction,
  updateDraftVersionAction,
} from "@/lib/outreach/actions";
import type { AppliedFinding } from "@/lib/outreach/findings";
import type { VenueOutreach, VenueResearchEntry } from "@/lib/outreach/queries";
import {
  outreachAngleLabels,
  outreachDraftStatusLabels,
  outreachKindLabels,
} from "@/lib/outreach/schemas";
import { cn } from "@/lib/utils";

const labelClass = "text-[11px] text-muted-foreground";

function fitTone(score: number | null) {
  if (score === null) return "text-muted-foreground";
  if (score >= 70) return "text-emerald-400";
  if (score >= 45) return "text-amber-400";
  return "text-muted-foreground";
}

function ResearchCard({
  research,
  pending,
  onRun,
}: {
  research: VenueResearchEntry | null;
  pending: boolean;
  onRun: () => void;
}) {
  if (!research) {
    return (
      <div className="rounded-md border border-dashed border-border px-3 py-3">
        <p className="text-[12px] text-muted-foreground">
          Nog geen onderzoek. Nillihc leest de site en het programma van deze venue en
          bepaalt welke invalshoek kans maakt.
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-2 h-7 gap-1.5 text-xs"
          onClick={onRun}
          disabled={pending}
        >
          {pending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Search className="size-3" />
          )}
          {pending ? "Onderzoeken…" : "Onderzoek venue"}
        </Button>
      </div>
    );
  }

  const { data } = research;

  return (
    <div className="rounded-md border border-border bg-card/30 px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className={cn("text-[13px] font-semibold", fitTone(data.fitScore))}>
            Fit {data.fitScore}/100
          </span>
          <span className="truncate text-[12px] text-muted-foreground">
            {data.positioning}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-6 shrink-0 text-muted-foreground"
          onClick={onRun}
          disabled={pending}
          aria-label="Onderzoek verversen"
        >
          {pending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <RefreshCw className="size-3" />
          )}
        </Button>
      </div>

      <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
        {data.venueSummary}
      </p>

      {data.recommendedAngles.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {data.recommendedAngles.slice(0, 3).map((angle) => (
            <Badge
              key={angle.angle}
              variant="secondary"
              className="h-5 px-1.5 text-[10px] font-normal"
            >
              {outreachAngleLabels[angle.angle]}
            </Badge>
          ))}
        </div>
      ) : null}

      {data.risks.length > 0 ? (
        <p className="mt-2 text-[11px] leading-snug text-amber-400/90">
          Let op: {data.risks.join(" · ")}
        </p>
      ) : null}

      <Collapsible>
        <CollapsibleTrigger className="group mt-2 flex w-full items-center justify-between text-left text-[11px] text-muted-foreground hover:text-foreground">
          Details en bronnen
          <ChevronDown className="size-3 transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-2.5 border-t border-border pt-2.5">
          {data.programmingGenres.length > 0 ? (
            <div>
              <p className={labelClass}>Programmeert</p>
              <p className="text-[12px]">{data.programmingGenres.join(", ")}</p>
            </div>
          ) : null}

          {data.genreMatches.length > 0 ? (
            <div>
              <p className={labelClass}>Verwante acts op hun agenda</p>
              <ul className="space-y-0.5">
                {data.genreMatches.map((match) => (
                  <li key={match.artist} className="text-[12px] leading-snug">
                    <span className="font-medium">{match.artist}</span>
                    {match.eventDate ?? match.isoDate ? (
                      <span className="text-muted-foreground">
                        {" "}
                        · {match.eventDate ?? match.isoDate}
                      </span>
                    ) : null}{" "}
                    <span className="text-muted-foreground">— {match.why}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {data.hooks.length > 0 ? (
            <div>
              <p className={labelClass}>Haakjes voor de mail</p>
              <ul className="space-y-0.5">
                {data.hooks.map((hook) => (
                  <li key={hook} className="text-[12px] leading-snug text-muted-foreground">
                    · {hook}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <p className={labelClass}>Boekingsroute</p>
            <p className="text-[12px] text-muted-foreground">
              {[
                data.booking.contactName,
                data.booking.email,
                data.booking.instructions,
                data.booking.submissionWindow,
              ]
                .filter(Boolean)
                .join(" · ") || `Kanaal: ${data.booking.channel}`}
            </p>
          </div>

          {data.dataGaps.length > 0 ? (
            <div>
              <p className={labelClass}>Niet gevonden</p>
              <p className="text-[12px] text-muted-foreground">
                {data.dataGaps.join(" · ")}
              </p>
            </div>
          ) : null}

          <div>
            <p className={labelClass}>
              Bronnen · {formatDateTime(research.createdAt)} · {research.model}
            </p>
            <ul className="space-y-0.5">
              {research.sources.slice(0, 8).map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    <span className="max-w-80 truncate">{source.title || source.url}</span>
                    <ExternalLink className="size-2.5 shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function OutreachPanel({
  venueId,
  venueName,
  venueEmail,
  contacts,
  outreach,
  onFindingsApplied,
}: {
  venueId: string;
  venueName: string;
  venueEmail: string | null;
  contacts: LinkedContact[];
  outreach: VenueOutreach;
  /** Lets the venue form absorb applied findings so autosave cannot undo them. */
  onFindingsApplied: (applied: AppliedFinding[]) => void;
}) {
  const router = useRouter();
  const [data, setData] = useState(outreach);
  const [serverData, setServerData] = useState(outreach);
  const [researchPending, setResearchPending] = useState(false);
  const [generatePending, setGeneratePending] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [openDraftId, setOpenDraftId] = useState<string | null>(null);

  // Local state is optimistic; whenever the server sends fresh data it wins.
  if (outreach !== serverData) {
    setServerData(outreach);
    setData(outreach);
  }

  const hasSentMail = data.drafts.some((draft) => draft.status === "sent");
  const openDraft = data.drafts.find((draft) => draft.id === openDraftId) ?? null;

  async function handleResearch() {
    setResearchPending(true);
    toast.loading("Venue onderzoeken…", { id: "venue-research" });

    const result = await researchVenueAction(venueId);
    setResearchPending(false);

    if (!result.ok) {
      toast.error(result.error, { id: "venue-research" });
      return;
    }

    setData((current) => ({ ...current, research: result.research }));
    toast.success(
      result.newFindings > 0
        ? `Onderzoek klaar — fit ${result.research.data.fitScore}/100 · ${result.newFindings} nieuwe vondsten`
        : `Onderzoek klaar — fit ${result.research.data.fitScore}/100`,
      { id: "venue-research" },
    );
    router.refresh();
  }

  async function handleApplyFindings(findingIds: string[]) {
    const result = await applyFindingsAction(venueId, findingIds);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    onFindingsApplied(result.applied);
    setData((current) => ({
      ...current,
      findings: current.findings.filter((finding) => !findingIds.includes(finding.id)),
    }));
    toast.success(
      result.applied.length === 1
        ? "Toegevoegd aan het CRM"
        : `${result.applied.length} vondsten toegevoegd`,
    );
    router.refresh();
  }

  async function handleDismissFinding(findingId: string) {
    const result = await dismissFindingAction(venueId, findingId);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setData((current) => ({
      ...current,
      findings: current.findings.filter((finding) => finding.id !== findingId),
    }));
    router.refresh();
  }

  async function runGenerate(draftId: string | null, options: GenerateOptions) {
    setGeneratePending(true);
    toast.loading(draftId ? "Nieuwe versie schrijven…" : "E-mail schrijven…", {
      id: "outreach-generate",
    });

    const result = await generateOutreachDraftAction({
      venueId,
      draftId,
      kind: options.kind,
      angle: options.angle,
      contactId: options.contactId,
      language: options.language,
      instructions: options.instructions || null,
    });

    setGeneratePending(false);

    if (!result.ok) {
      toast.error(result.error, { id: "outreach-generate" });
      return;
    }

    toast.success(`Versie ${result.version.versionNumber} klaar`, {
      id: "outreach-generate",
    });
    setOpenDraftId(result.draftId);
    router.refresh();
  }

  async function handleSelectVersion(draftId: string, versionId: string) {
    const result = await selectDraftVersionAction(draftId, versionId);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setData((current) => ({
      ...current,
      drafts: current.drafts.map((draft) =>
        draft.id === draftId
          ? {
              ...draft,
              versions: draft.versions.map((version) => ({
                ...version,
                selected: version.id === versionId,
              })),
            }
          : draft,
      ),
    }));
  }

  async function handleSaveVersion(
    versionId: string,
    input: { subject: string; body: string },
  ) {
    const result = await updateDraftVersionAction(versionId, input);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setData((current) => ({
      ...current,
      drafts: current.drafts.map((draft) => ({
        ...draft,
        versions: draft.versions.map((version) =>
          version.id === versionId
            ? { ...version, ...input, edited: true }
            : version,
        ),
      })),
    }));
    toast.success("Aanpassing bewaard");
  }

  async function handleStatusChange(draftId: string, status: OutreachDraftStatus) {
    const result = await setDraftStatusAction(draftId, status);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setData((current) => ({
      ...current,
      drafts: current.drafts.map((draft) =>
        draft.id === draftId
          ? {
              ...draft,
              status,
              sentAt: status === "sent" ? (draft.sentAt ?? new Date()) : null,
            }
          : draft,
      ),
    }));
    toast.success(`Status: ${outreachDraftStatusLabels[status]}`);
    router.refresh();
  }

  async function handleDeleteDraft(draftId: string) {
    const result = await deleteOutreachDraftAction(draftId);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setOpenDraftId(null);
    setData((current) => ({
      ...current,
      drafts: current.drafts.filter((draft) => draft.id !== draftId),
    }));
    toast.success("Concept verwijderd");
    router.refresh();
  }

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label className={labelClass}>Outreach</Label>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() => void handleResearch()}
            disabled={researchPending}
          >
            {researchPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Search className="size-3" />
            )}
            {data.research ? "Ververs onderzoek" : "Onderzoek"}
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() => setGenerateOpen(true)}
            disabled={generatePending}
          >
            {generatePending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Sparkles className="size-3" />
            )}
            Genereer mail
          </Button>
        </div>
      </div>

      <ResearchCard
        research={data.research}
        pending={researchPending}
        onRun={() => void handleResearch()}
      />

      <FindingsList
        findings={data.findings}
        onApply={handleApplyFindings}
        onDismiss={handleDismissFinding}
      />

      {data.drafts.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nog geen concepten</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {data.drafts.map((draft) => {
            const version =
              draft.versions.find((entry) => entry.selected) ??
              draft.versions[draft.versions.length - 1];

            return (
              <li key={draft.id}>
                <button
                  type="button"
                  onClick={() => setOpenDraftId(draft.id)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-input/30"
                >
                  <Badge
                    variant="outline"
                    className="h-5 shrink-0 px-1.5 text-[10px] font-normal"
                  >
                    {outreachKindLabels[draft.kind]}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate text-[13px]">
                    {version?.subject ?? "Zonder onderwerp"}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    v{version?.versionNumber ?? 1}
                  </span>
                  <Badge
                    variant={draft.status === "sent" ? "default" : "secondary"}
                    className="h-5 shrink-0 px-1.5 text-[10px] font-normal"
                  >
                    {outreachDraftStatusLabels[draft.status]}
                  </Badge>
                  <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:inline">
                    {formatDate(draft.sentAt ?? draft.updatedAt)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <OutreachGenerateDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        onGenerate={async (options) => {
          setGenerateOpen(false);
          await runGenerate(null, options);
        }}
        research={data.research}
        contacts={contacts}
        hasSentMail={hasSentMail}
        pending={generatePending}
      />

      <OutreachDraftSheet
        draft={openDraft}
        venueName={venueName}
        venueEmail={venueEmail}
        research={data.research}
        contacts={contacts}
        pending={generatePending}
        onOpenChange={(open) => {
          if (!open) setOpenDraftId(null);
        }}
        onGenerateVersion={runGenerate}
        onSelectVersion={handleSelectVersion}
        onSaveVersion={handleSaveVersion}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteDraft}
      />
    </section>
  );
}
