"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureCategory } from "./categories";

export async function bulkDeleteEntries(entryIds: string[], spaceId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");
  const space = await prisma.space.findFirst({ where: { id: spaceId, ownerId: user.id } });
  if (!space) throw new Error("Space not found");
  if (!entryIds.length) return;
  await prisma.vaultEntry.deleteMany({ where: { id: { in: entryIds }, spaceId } });
  revalidatePath(`/spaces/${spaceId}`);
}

export async function bulkTransferEntries(entryIds: string[], targetSpaceId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");
  const target = await prisma.space.findFirst({ where: { id: targetSpaceId, ownerId: user.id } });
  if (!target) throw new Error("Target space not found");
  const entries = await prisma.vaultEntry.findMany({ where: { id: { in: entryIds } }, include: { space: true } });
  for (const entry of entries) {
    const source = await prisma.space.findFirst({ where: { id: entry.spaceId, ownerId: user.id } });
    if (!source) throw new Error("Unauthorized source");
    if (entry.spaceId === targetSpaceId) throw new Error("Already in this space");
    if (entry.title) { const dup = await prisma.vaultEntry.findFirst({ where: { spaceId: targetSpaceId, title: { equals: entry.title, mode: "insensitive" } } }); if (dup) throw new Error(`Title already exists in target space: ${entry.title}`); }
  }
  await prisma.vaultEntry.updateMany({ where: { id: { in: entryIds } }, data: { spaceId: targetSpaceId } });
  const spaceIds = new Set(entries.map((e) => e.spaceId)); spaceIds.add(targetSpaceId);
  for (const sid of spaceIds) revalidatePath(`/spaces/${sid}`);
  revalidatePath("/dashboard");
}

export async function transferEntry(entryId: string, targetSpaceId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");
  const entry = await prisma.vaultEntry.findUnique({ where: { id: entryId }, include: { space: true } });
  if (!entry) throw new Error("Entry not found");
  const sourceSpace = await prisma.space.findFirst({ where: { id: entry.spaceId, ownerId: user.id } });
  if (!sourceSpace) throw new Error("Unauthorized source");
  const target = await prisma.space.findFirst({ where: { id: targetSpaceId, ownerId: user.id } });
  if (!target) throw new Error("Target space not found");
  if (entry.spaceId === targetSpaceId) throw new Error("Already in this space");
  if (entry.title) { const dup = await prisma.vaultEntry.findFirst({ where: { spaceId: targetSpaceId, title: { equals: entry.title, mode: "insensitive" } } }); if (dup) throw new Error("Title already exists in target space"); }
  await prisma.vaultEntry.update({ where: { id: entryId }, data: { spaceId: targetSpaceId } });
  revalidatePath(`/spaces/${entry.spaceId}`);
  revalidatePath(`/spaces/${targetSpaceId}`);
  revalidatePath("/dashboard");
}

export async function bulkCreateEntries(spaceId: string, entries: Array<{ title?: string | null; email: string; password: string; url?: string | null; description?: string | null; category?: string | null; icon?: string | null; color?: string | null; logoUrl?: string | null; categoryId?: string | null }>) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");
  const space = await prisma.space.findFirst({ where: { id: spaceId, ownerId: user.id } });
  if (!space) throw new Error("Space not found");
  const existingTitles = new Set((await prisma.vaultEntry.findMany({ where: { spaceId }, select: { title: true } })).map((e) => (e.title ?? "").toLowerCase()).filter(Boolean));
  const seen = new Set<string>();
  for (const e of entries) {
    if (!e.email || !e.password) throw new Error("Each entry needs login and password");
    if (e.title) { let base = e.title.trim(); let low = base.toLowerCase(); let n = 2; while (existingTitles.has(low) || seen.has(low)) { const candidate = `${base} (${n})`; low = candidate.toLowerCase(); if (!existingTitles.has(low) && !seen.has(low)) { e.title = candidate; break; } n++; if (n > 100) throw new Error(`Duplicate title: ${base} - too many duplicates`); } seen.add(low); existingTitles.add(low); }
  }
  const mapped = await Promise.all(entries.map(async (e) => {
    let categoryId: string | null = e.categoryId ?? null; let category: string | null = e.category?.trim() || null; let icon: string | null = e.icon ?? null; let color: string | null = e.color ?? null; let logoUrl: string | null = (e as { logoUrl?: string | null }).logoUrl ?? null;
    if (categoryId) { const cat = await prisma.category.findFirst({ where: { id: categoryId, ownerId: user.id } }); if (cat) { category = cat.name; icon = cat.icon; color = cat.color; logoUrl = cat.logoUrl; } }
    else if (category) { const cat = await ensureCategory(category, icon, color, logoUrl, user.id); categoryId = cat.id; category = cat.name; icon = cat.icon; color = cat.color; logoUrl = cat.logoUrl; }
    return { spaceId, title: e.title?.trim() || null, email: e.email.trim(), password: e.password, url: e.url?.trim() || null, description: e.description?.trim() || null, category, icon, color: color || "#006FEE", logoUrl, categoryId };
  }));
  await prisma.vaultEntry.createMany({ data: mapped });
  revalidatePath(`/spaces/${spaceId}`);
}
