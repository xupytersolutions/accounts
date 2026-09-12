function extractHost(input: string | null | undefined): string | null {
  if (!input) return null;
  const t = input.trim();
  if (!t) return null;
  try {
    const u = new URL(t);
    return u.hostname.toLowerCase().replace(/\.$/, "") || null;
  } catch {
    try {
      const u = new URL(`https://${t}`);
      return u.hostname.toLowerCase().replace(/\.$/, "") || null;
    } catch {
      return null;
    }
  }
}
export function isDomainMatch(entryUrl: string | null | undefined, currentHost: string | null | undefined): boolean {
  const e = extractHost(entryUrl);
  const c = currentHost ? currentHost.toLowerCase().replace(/\.$/, "").replace(/^www\./, "") : null;
  if (!e || !c) return false;
  const eh = e.replace(/^www\./, "");
  if (c === eh) return true;
  return c.endsWith(`.${eh}`);
}
