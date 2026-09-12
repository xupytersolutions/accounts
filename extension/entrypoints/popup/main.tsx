import React, { useEffect, useState, useCallback, useRef } from "react";
import ReactDOM from "react-dom/client";
import { getToken, setToken, clearToken, getSiteUrl, setSiteUrl } from "../../utils/storage";
import { listSpaces, searchEntries, getCredential, ApiError } from "../../utils/api";
import { getCurrentHost } from "../../utils/host";
import { isDomainMatch } from "../../utils/domain";
import "./style.css";

type Space = { id: string; name: string; type: string; color?: string | null; _count?: { entries: number } };
type Entry = { id: string; title: string | null; email: string; url: string | null; description: string | null; category: string | null; spaceId: string };

function useDebounced<T>(v: T, ms = 300): T {
  const [d, setD] = useState(v);
  useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return d;
}

function AuthGate({ onAuthed, siteUrl, setSiteUrl: setSiteUrlCb }: { onAuthed: (t: string) => void; siteUrl: string; setSiteUrl: (s: string) => void }) {
  const [token, setTokenInput] = useState("");
  const [url, setUrl] = useState(siteUrl);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const test = async () => {
    setErr(null);
    if (!token.trim()) { setErr("Paste token from site"); return; }
    setLoading(true);
    try {
      await setSiteUrl(url);
      await setToken(token.trim());
      // validate
      await listSpaces(token.trim());
      onAuthed(token.trim());
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Failed";
      setErr(msg);
      if (e instanceof ApiError && e.status === 401) await clearToken();
    } finally { setLoading(false); }
  };
  const openSite = async (auto = false) => {
    const u = url.replace(/\/$/, "") + (auto ? "/extension?auto=1" : "/extension");
    browser.tabs.create({ url: u });
  };
  const pasteFromClipboard = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (t) setTokenInput(t.trim());
      else setErr("Clipboard empty");
    } catch {
      setErr("Clipboard read failed — paste manually");
    }
  };
  return (
    <div className="p-4 flex flex-col gap-3 w-[360px]">
      <h1 className="text-base font-semibold">OneAccount</h1>
      <p className="text-xs text-muted">Paste extension token from site. Never use your website cookie.</p>
      <input className="border rounded px-2 py-1.5 text-sm" placeholder="Site URL (http://localhost:3000)" value={url} onChange={(e) => setUrl(e.target.value)} />
      <div className="flex gap-2">
        <input className="border rounded px-2 py-1.5 text-sm font-mono flex-1" placeholder="Paste token (shown once on site)" value={token} onChange={(e) => setTokenInput(e.target.value)} />
        <button onClick={pasteFromClipboard} className="border rounded px-2 py-1.5 text-xs shrink-0">Paste</button>
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
      <button onClick={test} disabled={loading} className="bg-black text-white rounded px-3 py-1.5 text-sm disabled:opacity-50">{loading ? "Checking…" : "Save & Connect"}</button>
      <div className="flex gap-2">
        <button onClick={() => openSite(false)} className="text-xs underline text-left flex-1">Open site →</button>
        <button onClick={() => openSite(true)} className="text-xs underline text-left flex-1 text-right">Connect automatically →</button>
      </div>
      <p className="text-[11px] text-muted">Auto: opens site, copies token, then Paste. Token 14d, revocable, stored locally only.</p>
    </div>
  );
}

function PopupApp() {
  const [token, setTok] = useState<string | null>(null);
  const [siteUrl, setSiteUrlState] = useState("http://localhost:3000");
  const [checking, setChecking] = useState(true);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const debQ = useDebounced(q, 300);
  const [host, setHost] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [loadingSpaces, setLoadingSpaces] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const timeoutRef = useRef<Record<string, number>>({});

  const init = useCallback(async () => {
    setChecking(true);
    const t = await getToken();
    const u = await getSiteUrl();
    setSiteUrlState(u);
    if (!t) { setChecking(false); return; }
    setTok(t);
    setChecking(false);
  }, []);
  useEffect(() => { init(); }, [init]);

  const handle401 = async (e: unknown) => {
    if (e instanceof ApiError && e.status === 401) {
      await clearToken();
      setLocked(true);
      setTok(null);
      setErr("Session expired or revoked. Generate a new token.");
      return true;
    }
    return false;
  };

  const loadSpaces = useCallback(async (tok: string) => {
    setLoadingSpaces(true); setErr(null);
    try { const r = await listSpaces(tok); setSpaces(r.spaces); } catch (e) { if (!(await handle401(e))) setErr(e instanceof Error ? e.message : "Network error"); } finally { setLoadingSpaces(false); }
  }, []);

  const loadEntries = useCallback(async (tok: string, spaceId: string | null, query: string) => {
    setLoadingEntries(true);
    try {
      const r = await searchEntries(tok, { q: query, spaceId: spaceId || undefined });
      setEntries(r.entries);
    } catch (e) { if (!(await handle401(e))) setErr(e instanceof Error ? e.message : "Network error"); }
    finally { setLoadingEntries(false); }
  }, []);

  useEffect(() => {
    if (!token) return;
    getCurrentHost().then(setHost);
    loadSpaces(token);
  }, [token, loadSpaces]);

  useEffect(() => {
    if (!token) return;
    loadEntries(token, selectedSpace, debQ);
  }, [token, selectedSpace, debQ, loadEntries]);

  // clear sensitive after 60s or when popup closed
  const clearRevealed = (id: string) => setRevealed((p) => { const n = { ...p }; delete n[id]; return n; });
  useEffect(() => () => { Object.values(timeoutRef.current).forEach((id) => clearTimeout(id)); }, []);

  const copyText = async (text: string, id?: string) => {
    await navigator.clipboard.writeText(text);
    if (id) { setCopyFeedback(id); setTimeout(() => setCopyFeedback(null), 1500); }
    else { setCopyFeedback("copied"); setTimeout(() => setCopyFeedback(null), 1500); }
  };

  const copyPassword = async (entry: Entry) => {
    if (!token) return;
    try {
      const r = await getCredential(token, entry.id);
      const pwd = r.password;
      // do not log
      await navigator.clipboard.writeText(pwd);
      setRevealed((p) => ({ ...p, [entry.id]: pwd }));
      setCopyFeedback(entry.id);
      const tid = window.setTimeout(() => clearRevealed(entry.id), 60_000);
      timeoutRef.current[entry.id] = tid as unknown as number;
      setTimeout(() => setCopyFeedback(null), 1500);
    } catch (e) {
      if (!(await handle401(e))) setErr(e instanceof Error ? e.message : "Failed to copy");
    }
  };

  const logout = async () => { await clearToken(); setTok(null); setLocked(false); setEntries([]); setSpaces([]); };

  // prioritize host matching
  const sorted = [...entries].sort((a, b) => {
    const ah = host ? isDomainMatch(a.url, host) : false;
    const bh = host ? isDomainMatch(b.url, host) : false;
    if (ah === bh) return 0;
    return ah ? -1 : 1;
  });

  if (checking) return <div className="p-4 text-sm w-[360px]">Loading…</div>;
  if (!token || locked) {
    return (
      <div className="w-[360px]">
        {locked && <div className="bg-amber-50 border-b px-3 py-2 text-xs">Locked — token expired/revoked.</div>}
        <AuthGate onAuthed={(t) => { setTok(t); setLocked(false); setErr(null); }} siteUrl={siteUrl} setSiteUrl={async (u) => { await setSiteUrl(u); setSiteUrlState(u); }} />
        {err && <p className="px-4 pb-2 text-xs text-red-600">{err}</p>}
      </div>
    );
  }

  if (selectedEntry) {
    const rev = revealed[selectedEntry.id];
    return (
      <div className="w-[360px] p-3 flex flex-col gap-3">
        <button onClick={() => setSelectedEntry(null)} className="text-xs text-left underline">← Back</button>
        <h2 className="font-semibold text-sm">{selectedEntry.title || "Account"}</h2>
        <p className="text-xs break-all">{selectedEntry.email}</p>
        {selectedEntry.url && <a href={selectedEntry.url} target="_blank" className="text-xs text-blue-600 break-all">{selectedEntry.url}</a>}
        {selectedEntry.description && <p className="text-xs text-muted">{selectedEntry.description}</p>}
        <div className="flex gap-2">
          <button onClick={() => copyText(selectedEntry.email, "email")} className="flex-1 border rounded px-2 py-1.5 text-xs">{copyFeedback === "email" ? "Copied" : "Copy username"}</button>
          <button onClick={() => copyPassword(selectedEntry)} className="flex-1 bg-black text-white rounded px-2 py-1.5 text-xs">{copyFeedback === selectedEntry.id ? "Copied" : "Copy password"}</button>
        </div>
        {rev && <p className="text-[11px] text-muted">Password copied. Clears in 60s.</p>}
        {host && selectedEntry.url && isDomainMatch(selectedEntry.url, host) && <span className="text-[11px] bg-green-50 border rounded px-1.5 py-0.5 w-fit">Matches current site: {host}</span>}
        {!host && <p className="text-[11px] text-muted">No site detected (chrome internal page)</p>}
      </div>
    );
  }

  return (
    <div className="w-[360px] flex flex-col max-h-[500px]">
      <div className="p-3 border-b flex items-center justify-between gap-2">
        <h1 className="font-semibold text-sm">OneAccount</h1>
        <div className="flex items-center gap-2">
          {host && <span className="text-[11px] bg-muted border rounded px-1.5 py-0.5">{host}</span>}
          <button onClick={logout} className="text-[11px] underline">Lock</button>
        </div>
      </div>

      {err && <div className="mx-3 mt-2 bg-red-50 border border-red-200 rounded px-2 py-1.5 text-xs">{err} <button onClick={() => setErr(null)} className="underline ml-1">Dismiss</button></div>}

      <div className="p-2 flex gap-1 overflow-x-auto border-b">
        <button onClick={() => setSelectedSpace(null)} className={`shrink-0 text-xs px-2 py-1 rounded border ${!selectedSpace ? "bg-black text-white" : "bg-white"}`}>All ({entries.length})</button>
        {loadingSpaces ? <span className="text-xs px-2 py-1">Loading spaces…</span> : spaces.length === 0 ? <span className="text-xs text-muted px-2 py-1">No spaces</span> : spaces.map((s) => (
          <button key={s.id} onClick={() => setSelectedSpace(s.id)} className={`shrink-0 text-xs px-2 py-1 rounded border ${selectedSpace === s.id ? "bg-black text-white" : "bg-white"}`}>{s.name}</button>
        ))}
      </div>

      <div className="p-2 border-b">
        <input autoFocus placeholder="Search accounts…" value={q} onChange={(e) => setQ(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm" />
      </div>

      <div className="flex-1 overflow-auto">
        {loadingEntries ? <p className="p-3 text-xs text-muted">Loading…</p> : sorted.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm font-medium">No accounts</p>
            <p className="text-xs text-muted mt-1">{q ? `No match for "${q}"` : host ? `No accounts for ${host}` : "No accounts in this space"}</p>
          </div>
        ) : (
          <div className="divide-y">
            {sorted.map((e) => {
              const matched = host ? isDomainMatch(e.url, host) : false;
              return (
                <button key={e.id} onClick={() => setSelectedEntry(e)} className={`w-full text-left px-3 py-2 hover:bg-muted flex items-center justify-between gap-2 ${matched ? "bg-green-50/50" : ""}`}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{e.title || e.email}</p>
                    <p className="text-xs text-muted truncate">{e.email} {e.url ? `· ${new URL(e.url).hostname}` : ""}</p>
                  </div>
                  {matched && <span className="shrink-0 text-[10px] bg-green-600 text-white rounded px-1.5 py-0.5">Match</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-2 border-t flex justify-between items-center">
        <span className="text-[11px] text-muted">{sorted.length} shown {host && `· ${host} prioritized`}</span>
        <a href={`${siteUrl}/extension`} target="_blank" className="text-[11px] underline">Manage tokens</a>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<PopupApp />);
