/**
 * Safe domain matching for vault entries.
 * Prevents evilgithub.com matching github.com etc.
 * Both inputs can be full URLs or bare hostnames.
 */

function extractHostname(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Try as URL, fallback to adding https:// for bare host
  let url: URL | null = null;
  try {
    url = new URL(trimmed);
  } catch {
    try {
      url = new URL(`https://${trimmed}`);
    } catch {
      return null;
    }
  }
  const h = url.hostname.toLowerCase();
  // Strip trailing dot, remove port already handled by hostname
  return h.replace(/\.$/, "") || null;
}

/**
 * Returns true if entryUrl matches current site host.
 * Match is exact OR sub-domain: currentHost === entryHost OR currentHost ends with `.`+entryHost
 * Does NOT match sibling domains like evilgithub.com vs github.com
 * Case-insensitive, handles ports, paths ignored.
 */
export function isDomainMatch(entryUrl: string | null | undefined, currentUrlOrHost: string | null | undefined): boolean {
  const entryHost = extractHostname(entryUrl);
  const currentHost = extractHostname(currentUrlOrHost);
  if (!entryHost || !currentHost) return false;
  if (currentHost === entryHost) return true;
  // Subdomain match: app.github.com matches github.com, but evilgithub.com does not (needs dot)
  return currentHost.endsWith(`.${entryHost}`);
}

export function extractHostnameForTest(input: string | null | undefined): string | null {
  return extractHostname(input);
}
