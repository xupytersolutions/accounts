// Never log tokens. Store only in chrome.storage.local (not sync).
const TOKEN_KEY = "extToken";
const SITE_URL_KEY = "siteUrl";

export async function getToken(): Promise<string | null> {
  const r = await browser.storage.local.get(TOKEN_KEY);
  return (r[TOKEN_KEY] as string | undefined) ?? null;
}
export async function setToken(token: string): Promise<void> {
  await browser.storage.local.set({ [TOKEN_KEY]: token });
}
export async function clearToken(): Promise<void> {
  await browser.storage.local.remove(TOKEN_KEY);
}
export async function getSiteUrl(): Promise<string> {
  const r = await browser.storage.local.get(SITE_URL_KEY);
  const v = r[SITE_URL_KEY] as string | undefined;
  if (v) return v.replace(/\/$/, "");
  // fallback to default (wxt defines import.meta.env, but popup also injects)
  const def = "http://localhost:3000";
  return def;
}
export async function setSiteUrl(url: string): Promise<void> {
  await browser.storage.local.set({ [SITE_URL_KEY]: url.replace(/\/$/, "") });
}
