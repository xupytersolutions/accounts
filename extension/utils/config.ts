export const DEFAULT_SITE_URL =
  (import.meta.env.WXT_SITE_URL as string | undefined) ||
  (typeof process !== "undefined" && (process as unknown as { env?: Record<string, string> }).env?.NEXT_PUBLIC_APP_URL) ||
  "http://localhost:3000";
