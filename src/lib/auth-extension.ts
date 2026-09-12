import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateRawToken(): string {
  // 32 bytes -> 43 chars base64url, ~256 bits entropy
  return crypto.randomBytes(32).toString("base64url");
}

export async function createExtensionToken(
  userId: string,
  opts?: { name?: string; expiresInDays?: number }
) {
  const raw = generateRawToken();
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + (opts?.expiresInDays ?? 14) * 24 * 60 * 60 * 1000);
  const record = await prisma.extensionToken.create({
    data: {
      userId,
      tokenHash,
      name: opts?.name ?? null,
      expiresAt,
    },
  });
  return { raw, record };
}

export async function revokeExtensionToken(tokenId: string, userId: string) {
  const token = await prisma.extensionToken.findFirst({ where: { id: tokenId, userId } });
  if (!token) throw Object.assign(new Error("Token not found"), { status: 404 });
  if (token.revokedAt) return token;
  return prisma.extensionToken.update({ where: { id: tokenId }, data: { revokedAt: new Date() } });
}

export async function requireExtensionUser(req: Request) {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    throw Object.assign(new Error("Missing extension token"), { status: 401 });
  }
  const raw = auth.slice(7).trim();
  if (!raw) throw Object.assign(new Error("Missing extension token"), { status: 401 });

  const tokenHash = hashToken(raw);
  const record = await prisma.extensionToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!record) throw Object.assign(new Error("Invalid token"), { status: 401 });
  if (record.revokedAt) throw Object.assign(new Error("Token revoked"), { status: 401 });
  if (record.expiresAt < new Date()) throw Object.assign(new Error("Token expired"), { status: 401 });

  // Fire-and-forget lastUsed update, do not block
  prisma.extensionToken
    .update({ where: { id: record.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {});

  return record.user;
}

/** Helper for routes that accept either session or extension token */
export async function requireUserOrExtension(req: Request) {
  // Try extension first if Authorization present
  const authHeader = req.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    return requireExtensionUser(req);
  }
  // Fallback to session
  const { requireUser } = await import("@/lib/api-helpers");
  return requireUser();
}
