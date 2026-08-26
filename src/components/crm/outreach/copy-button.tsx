"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  label,
  className,
  variant = "outline",
}: {
  value: string;
  label: string;
  className?: string;
  variant?: "outline" | "ghost" | "secondary";
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Kopiëren mislukt. Selecteer de tekst handmatig.");
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      className={cn("h-7 gap-1.5 text-xs", className)}
      onClick={() => void handleCopy()}
      disabled={!value}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? "Gekopieerd" : label}
    </Button>
  );
}
