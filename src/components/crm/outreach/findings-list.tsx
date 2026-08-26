"use client";

import { useState } from "react";
import { Check, ExternalLink, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ResearchFindingKind } from "@/db/schema";
import type {
  ArtistFindingValue,
  ContactFindingValue,
  VenueFieldFindingValue,
} from "@/lib/outreach/findings";
import type { FindingEntry } from "@/lib/outreach/queries";

const kindLabels: Record<ResearchFindingKind, string> = {
  venue_field: "Gegeven",
  contact: "Contact",
  artist: "Artiest",
};

function describe(finding: FindingEntry): { title: string; detail: string | null } {
  switch (finding.kind) {
    case "venue_field": {
      const value = finding.value as VenueFieldFindingValue;
      return {
        title: `${finding.label}: ${value.display}`,
        detail: finding.currentValue ? `nu: ${finding.currentValue}` : null,
      };
    }
    case "contact": {
      const value = finding.value as ContactFindingValue;
      const detail = [value.jobTitle, value.email, value.phone]
        .filter(Boolean)
        .join(" · ");
      return { title: finding.label, detail: detail || null };
    }
    case "artist": {
      const value = finding.value as ArtistFindingValue;
      const detail = [value.eventDate, value.genre, value.city, value.why]
        .filter(Boolean)
        .join(" · ");
      return { title: finding.label, detail: detail || null };
    }
  }
}

export function FindingsList({
  findings,
  onApply,
  onDismiss,
}: {
  findings: FindingEntry[];
  onApply: (findingIds: string[]) => Promise<void>;
  onDismiss: (findingId: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  if (findings.length === 0) return null;

  async function run(key: string, task: () => Promise<void>) {
    setBusy(key);
    await task();
    setBusy(null);
  }

  return (
    <div className="rounded-md border border-border bg-card/30">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <p className="text-[12px] font-medium">
          Nieuw gevonden{" "}
          <span className="text-muted-foreground">({findings.length})</span>
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-6 gap-1 px-2 text-[11px]"
          disabled={busy !== null}
          onClick={() =>
            void run("all", () => onApply(findings.map((finding) => finding.id)))
          }
        >
          <Check className="size-3" />
          {busy === "all" ? "Toevoegen…" : "Alles toevoegen"}
        </Button>
      </div>

      <ul className="divide-y divide-border">
        {findings.map((finding) => {
          const { title, detail } = describe(finding);
          const disabled = busy !== null;

          return (
            <li key={finding.id} className="flex items-start gap-2 px-3 py-2">
              <Badge
                variant="outline"
                className="mt-0.5 h-5 shrink-0 px-1.5 text-[10px] font-normal"
              >
                {kindLabels[finding.kind]}
              </Badge>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px]">{title}</p>
                {detail ? (
                  <p className="truncate text-[11px] text-muted-foreground">{detail}</p>
                ) : null}
                {finding.sourceUrl ? (
                  <a
                    href={finding.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    bron
                    <ExternalLink className="size-2.5" />
                  </a>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-6"
                  disabled={disabled}
                  onClick={() => void run(finding.id, () => onApply([finding.id]))}
                  aria-label={`${title} toevoegen`}
                >
                  <Plus className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-6 text-muted-foreground"
                  disabled={disabled}
                  onClick={() => void run(finding.id, () => onDismiss(finding.id))}
                  aria-label={`${title} negeren`}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
