"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SpaceType } from "@prisma/client";
import { spaceSchema } from "@/lib/validators";

export async function createSpace(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");
  const raw = {
    name: String(formData.get("name") || "").trim(),
    type: String(formData.get("type") || "personal") as SpaceType,
    description: String(formData.get("description") || "").trim() || null,
    color: String(formData.get("color") || "").trim() || "#006FEE",
    icon: String(formData.get("icon") || "").trim() || null,
  };
  const parsed = spaceSchema.parse(raw);
  await prisma.space.create({ data: { name: parsed.name, type: parsed.type as SpaceType, description: parsed.description || null, color: parsed.color || "#006FEE", icon: parsed.icon || null, ownerId: user.id } });
  revalidatePath("/dashboard");
}

export async function deleteSpace(spaceId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");
  await prisma.space.deleteMany({ where: { id: spaceId, ownerId: user.id } });
  revalidatePath("/dashboard");
}

export async function updateSpace(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");
  const spaceId = String(formData.get("spaceId") || "");
  const raw = {
    name: String(formData.get("name") || "").trim(),
    type: String(formData.get("type") || "personal") as SpaceType,
    description: String(formData.get("description") || "").trim() || null,
    color: String(formData.get("color") || "").trim() || null,
    icon: String(formData.get("icon") || "").trim() || null,
  };
  const parsed = spaceSchema.parse(raw);
  if (!spaceId) throw new Error("Space id required");
  const space = await prisma.space.findFirst({ where: { id: spaceId, ownerId: user.id } });
  if (!space) throw new Error("Space not found");
  await prisma.space.update({ where: { id: spaceId }, data: { name: parsed.name, type: parsed.type as SpaceType, description: parsed.description || null, color: parsed.color ?? undefined, icon: parsed.icon || null } });
  revalidatePath("/dashboard");
  revalidatePath(`/spaces/${spaceId}`);
}
