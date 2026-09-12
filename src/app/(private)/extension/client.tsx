"use client";
import { useEffect, useState } from "react";
import { Button, Card, Input, Label, TextField } from "@heroui/react";

type Token = { id: string; name: string | null; createdAt: string; expiresAt: string; revokedAt: string | null; lastUsedAt: string | null };

export function ExtensionTokenClient() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [name, setName] = useState("");
  const [raw, setRaw] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

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
              <p className="text-xs font-medium">Copy now — shown once:</p>
              <p className="text-sm font-mono mt-1">{raw}</p>
              <Button size="sm" variant="tertiary" className="mt-2" onPress={() => navigator.clipboard.writeText(raw)}>Copy</Button>
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
