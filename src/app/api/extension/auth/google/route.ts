import { prisma } from "@/lib/prisma";
import { createExtensionToken } from "@/lib/auth-extension";
import { jsonError, withError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const idToken = body.id_token || body.idToken;
    if (!idToken) return jsonError("Missing id_token", 400);

    // Verify via Google tokeninfo
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!res.ok) return jsonError("Invalid Google token", 401);
    const data = await res.json() as { aud?: string; email?: string; email_verified?: string; name?: string; picture?: string; sub?: string; iss?: string };
    const expectedAud = process.env.AUTH_GOOGLE_ID;
    if (!expectedAud || data.aud !== expectedAud) return jsonError("Token audience mismatch", 401);
    if (!data.email) return jsonError("No email in token", 401);
    // Optionally check email_verified
    // if (data.email_verified !== "true") return jsonError("Email not verified", 401);

    let user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name ?? null,
          image: data.picture ?? null,
          emailVerified: data.email_verified === "true" ? new Date() : null,
        },
      });
      if (!user) return jsonError("Failed to create user", 500);
      // seed default spaces as in src/auth.ts createUser
      const { DEFAULT_SPACES } = await import("@/lib/constants/default-spaces");
      const existing = await prisma.space.count({ where: { ownerId: user!.id } });
      if (existing === 0) {
        await prisma.space.createMany({
          data: DEFAULT_SPACES.map((s) => ({
            name: s.name,
            type: s.type,
            description: s.description,
            color: s.color,
            icon: s.icon,
            ownerId: user!.id,
          })),
        });
      }
    } else {
      // optionally update name/image
      if (data.name || data.picture) {
        await prisma.user.update({ where: { id: user!.id }, data: { name: data.name ?? user!.name, image: data.picture ?? user!.image } }).catch(() => {});
      }
    }
    if (!user) return jsonError("User not found", 500);

    const { raw, record } = await createExtensionToken(user!.id, { name: "Extension Google", expiresInDays: 14 });
    return Response.json({ token: raw, expiresAt: record.expiresAt }, { status: 201 });
  } catch (e) {
    return withError(e);
  }
}
