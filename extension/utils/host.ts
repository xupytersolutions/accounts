export function toHost(input: string | undefined): string | null {
  if (!input) return null;
  try {
    const u = new URL(input);
    // chrome internal pages etc
    if (u.protocol === "chrome:" || u.protocol === "chrome-extension:" || u.protocol === "about:") return null;
    return u.hostname.toLowerCase().replace(/\.$/, "").replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}

export async function getCurrentHost(): Promise<string | null> {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const url = tabs[0]?.url;
    return toHost(url);
  } catch {
    return null;
  }
}
