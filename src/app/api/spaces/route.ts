import { prisma } from "@/lib/prisma";
import { spaceSchema } from "@/lib/validators";
import { requireUser, jsonError, withError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const user = await requireUser();
    const spaces = await prisma.space.findMany({
      where: { ownerId: user.id },
      include: { _count: { select: { entries: true } } },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({ spaces });
  } catch (e) {
    return withError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const raw = {
      name: String(body.name ?? "").trim(),
      type: String(body.type ?? "personal"),
      description: body.description != null ? String(body.description).trim() || null : null,
      color: body.color ? String(body.color).trim() : "#006FEE",
      icon: body.icon ? String(body.icon).trim() || null : null,
    };
    const parsed = spaceSchema.safeParse(raw);
    if (!parsed.success) return jsonError(parsed.error.issues[0].message, 422, { issues: parsed.error.issues });
    const space = await prisma.space.create({
      data: {
        name: parsed.data.name,
        type: parsed.data.type as never,
        description: parsed.data.description,
        color: parsed.data.color || "#006FEE",
        icon: parsed.data.icon,
        ownerId: user.id,
      },
      include: { _count: { select: { entries: true } } },
    });
    return Response.json({ space }, { status: 201 });
  } catch (e) {
    return withError(e);
  }
}
