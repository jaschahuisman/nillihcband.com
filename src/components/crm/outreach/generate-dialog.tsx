"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { OutreachAngle, OutreachKind } from "@/db/schema";
import type { LinkedContact } from "@/lib/crm/queries";
import { formatContactName } from "@/lib/crm/labels";
import {
  outreachAngleDescriptions,
  outreachAngleLabels,
  outreachKindLabels,
} from "@/lib/outreach/schemas";
import type { VenueResearchEntry } from "@/lib/outreach/queries";

const labelClass = "text-[11px] text-muted-foreground";
const selectClass = "crm-select h-7 text-[13px]";

export type GenerateOptions = {
  kind: OutreachKind;
  angle: OutreachAngle | null;
  contactId: string | null;
  language: "nl" | "en";
  instructions: string;
};

export function OutreachGenerateDialog({
  open,
  onOpenChange,
  ...props
}: GenerateFormProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark sm:max-w-md">
        {/* Remounts on every open, so the form always starts from fresh defaults. */}
        <GenerateForm {...props} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

type GenerateFormProps = {
  onGenerate: (options: GenerateOptions) => void;
  research: VenueResearchEntry | null;
  contacts: LinkedContact[];
  /** Set when adding a version to an existing thread — kind is then fixed. */
  lockedKind?: OutreachKind;
  hasSentMail: boolean;
  pending: boolean;
};

function GenerateForm({
  onGenerate,
  onCancel,
  research,
  contacts,
  lockedKind,
  hasSentMail,
  pending,
}: GenerateFormProps & { onCancel: () => void }) {
  const recommended = research?.data.recommendedAngles?.[0]?.angle ?? null;

  const [kind, setKind] = useState<OutreachKind>(
    lockedKind ?? (hasSentMail ? "reminder" : "initial"),
  );
  const [angle, setAngle] = useState<OutreachAngle | "auto">("auto");
  const [contactId, setContactId] = useState<string>("auto");
  const [language, setLanguage] = useState<"nl" | "en">("nl");
  const [instructions, setInstructions] = useState("");

  const angleHint =
    angle === "auto"
      ? recommended
        ? `Automatisch. Het onderzoek raadt "${outreachAngleLabels[recommended]}" aan.`
        : "Automatisch. Het model kiest zelf de sterkste invalshoek."
      : outreachAngleDescriptions[angle];

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-base">
          {lockedKind ? "Nieuwe versie genereren" : "E-mail genereren"}
        </DialogTitle>
        <DialogDescription className="text-xs">
          {research
            ? `Gebruikt het onderzoek van deze venue (fit ${research.data.fitScore}/100).`
            : "Er is nog geen onderzoek gedaan. De mail wordt daardoor algemener."}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        {!lockedKind ? (
          <div className="space-y-1">
            <Label htmlFor="outreach-kind" className={labelClass}>
              Type
            </Label>
            <select
              id="outreach-kind"
              value={kind}
              onChange={(event) => setKind(event.target.value as OutreachKind)}
              className={selectClass}
            >
              {Object.entries(outreachKindLabels).map(([value, label]) => (
                <option
                  key={value}
                  value={value}
                  disabled={value !== "initial" && !hasSentMail}
                >
                  {label}
                  {value !== "initial" && !hasSentMail ? " — nog niets verzonden" : ""}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="space-y-1">
          <Label htmlFor="outreach-angle" className={labelClass}>
            Invalshoek
          </Label>
          <select
            id="outreach-angle"
            value={angle}
            onChange={(event) =>
              setAngle(event.target.value as OutreachAngle | "auto")
            }
            className={selectClass}
          >
            <option value="auto">Automatisch</option>
            {Object.entries(outreachAngleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
                {value === recommended ? " (aanbevolen)" : ""}
              </option>
            ))}
          </select>
          <p className="text-[11px] leading-snug text-muted-foreground">{angleHint}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="outreach-contact" className={labelClass}>
              Geadresseerde
            </Label>
            <select
              id="outreach-contact"
              value={contactId}
              onChange={(event) => setContactId(event.target.value)}
              className={selectClass}
            >
              <option value="auto">Automatisch</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {formatContactName(contact)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="outreach-language" className={labelClass}>
              Taal
            </Label>
            <select
              id="outreach-language"
              value={language}
              onChange={(event) => setLanguage(event.target.value as "nl" | "en")}
              className={selectClass}
            >
              <option value="nl">Nederlands</option>
              <option value="en">Engels</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="outreach-instructions" className={labelClass}>
            Extra instructies
          </Label>
          <Textarea
            id="outreach-instructions"
            rows={3}
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            placeholder="Bijv. noem dat we in maart in de buurt spelen, of houd het extra kort."
            className="min-h-16 text-[13px]"
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={onCancel}
          disabled={pending}
        >
          Annuleren
        </Button>
        <Button
          type="button"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          disabled={pending}
          onClick={() =>
            onGenerate({
              kind,
              angle: angle === "auto" ? null : angle,
              contactId: contactId === "auto" ? null : contactId,
              language,
              instructions,
            })
          }
        >
          <Sparkles className="size-3.5" />
          {pending ? "Genereren…" : "Genereer"}
        </Button>
      </DialogFooter>
    </>
  );
}
