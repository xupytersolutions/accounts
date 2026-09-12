"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Card, Input, Label, TextField } from "@heroui/react";

type Token = { id: string; name: string | null; createdAt: string; expiresAt: string; revokedAt: string | null; lastUsedAt: string | null };

export function ExtensionTokenClient() {
  const searchParams = useSearchParams();
  const isAuto = searchParams.get("auto") === "1";
  const [tokens, setTokens] = useState<Token[]>([]);
  const [name, setName] = useState("");
  const [raw, setRaw] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [autoDone, setAutoDone] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/api/extension/tokens");
      if (!r.ok) throw new Error("Failed to load");
      const j = await r.json();
      setTokens(j.tokens ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);
  // Auto mode: generate token automatically and copy to clipboard for extension
  useEffect(() => {
    if (!isAuto || autoDone || loading) return;
    if (tokens.length > 0) return; // avoid re-trigger if already has tokens? still allow auto
    // auto-create with name "Extension Auto"
    let cancelled = false;
    const run = async () => {
      setCreating(true);
      try {
        const r = await fetch("/api/extension/tokens", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Extension Auto" }) });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Failed");
        if (cancelled) return;
        setRaw(j.token);
        try { await navigator.clipboard.writeText(j.token); } catch {}
        setAutoDone(true);
        load();
      } catch {}
      finally { if (!cancelled) setCreating(false); }
    };
    // slight delay to ensure load finished
    const t = setTimeout(run, 800);
    return () => { cancelled = true; clearTimeout(t); };
  }, [isAuto, autoDone, loading, tokens.length]);

  const create = async () => {
    setCreating(true);
    setErr(null);
    setRaw(null);
    try {
      const r = await fetch("/api/extension/tokens", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim() || undefined }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed");
      setRaw(j.token);
      setName("");
      load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setCreating(false);
    }
  };
  const revoke = async (id: string) => {
    await fetch(`/api/extension/tokens/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 border border-border shadow-none">
        <Card.Content className="gap-3">
          <TextField value={name} onChange={(v) => setName(String(v))}>
            <Label>Token name (optional)</Label>
            <Input placeholder="Chrome - Work" />
          </TextField>
          <Button onPress={create} isDisabled={creating} className="bg-primary text-primary-foreground">Generate token (14d)</Button>
          {err && <p className="text-sm text-danger">{err}</p>}
          {raw && (
            <div className="rounded-lg bg-muted p-3 break-all">
              <p className="text-xs font-medium">{isAuto ? "Token copied to clipboard — return to extension and paste" : "Copy now — shown once:"}</p>
              <p className="text-sm font-mono mt-1">{raw}</p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="tertiary" onPress={() => navigator.clipboard.writeText(raw)}>Copy</Button>
                {isAuto && <Button size="sm" variant="ghost" onPress={() => window.close()}>Close tab</Button>}
              </div>
            </div>
          )}
        </Card.Content>
      </Card>

      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : tokens.length === 0 ? <p className="text-sm text-muted-foreground">No tokens yet.</p> : (
        <div className="space-y-2">
          {tokens.map((t) => (
            <Card key={t.id} className="p-3 border border-border shadow-none">
              <Card.Content>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{t.name || "Unnamed"} {t.revokedAt ? <span className="text-xs text-danger">(revoked)</span> : new Date(t.expiresAt) < new Date() ? <span className="text-xs text-danger">(expired)</span> : null}</p>
                    <p className="text-xs text-muted-foreground">Created {new Date(t.createdAt).toLocaleDateString()} · Expires {new Date(t.expiresAt).toLocaleDateString()}</p>
                  </div>
                  {!t.revokedAt && new Date(t.expiresAt) > new Date() && <Button size="sm" variant="ghost" onPress={() => revoke(t.id)}>Revoke</Button>}
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
