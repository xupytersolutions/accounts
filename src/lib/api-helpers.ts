import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.email) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  return user;
}

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return Response.json({ error: message, ...extra }, { status });
}

export function withError(e: unknown) {
  const msg = e instanceof Error ? e.message : "Internal error";
  const status = (e as { status?: number })?.status ?? 500;
  // map zod-like validation join to 422
  if (msg.includes("Please enter") || msg.includes("must be") || msg.includes("Validation failed")) {
    return jsonError(msg, 422);
  }
  return jsonError(msg, status);
}
