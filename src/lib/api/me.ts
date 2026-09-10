import { apiFetch } from "./client";

export type MeResponse = { user: { id: string; name: string | null; email: string; image: string | null; createdAt: string } | null };

export function getMe() {
  return apiFetch<MeResponse>("/api/me");
}
