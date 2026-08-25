"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CrmLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Inloggen mislukt.");
        return;
      }

      const next = searchParams.get("next") || "/crm/contacts";
      router.push(next);
      router.refresh();
    } catch {
      setError("Inloggen mislukt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-sm flex-col justify-center px-4">
      <div className="border border-border bg-card p-6">
        <p className="text-xs text-muted-foreground">Nillihc</p>
        <h1 className="mt-1 text-lg font-semibold tracking-tight">CRM</h1>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs text-muted-foreground">
              E-mail
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-8 bg-muted/40 shadow-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs text-muted-foreground">
              Wachtwoord
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-8 bg-muted/40 shadow-none"
            />
          </div>

          {error ? (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" size="sm" className="h-8 w-full" disabled={loading}>
            {loading ? "Bezig…" : "Inloggen"}
          </Button>
        </form>
      </div>
    </main>
  );
}
