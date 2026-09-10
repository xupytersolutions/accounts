"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { entrySchema, updateEntrySchema } from "@/lib/validators";
import { ensureCategory } from "./categories";

export async function createEntry(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");
  const spaceId = String(formData.get("spaceId") || "");
  const title = String(formData.get("title") || "").trim() || null;
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const description = String(formData.get("description") || "").trim() || null;
  const url = String(formData.get("url") || "").trim() || null;
  const rawCategoryId = String(formData.get("categoryId") || "").trim() || null;
  const rawCategory = String(formData.get("category") || "").trim() || null;
  const rawIcon = String(formData.get("icon") || "").trim() || null;
  const rawColor = String(formData.get("color") || "").trim() || null;
  const rawLogoUrl = String(formData.get("logoUrl") || "").trim() || null;
  const customCategory = String(formData.get("customCategory") || "").trim() || null;
  const parsedEntry = entrySchema.safeParse({ title, email, password, url, description, category: rawCategory || customCategory, icon: rawIcon, color: rawColor || "#006FEE", logoUrl: rawLogoUrl, categoryId: rawCategoryId, customCategory });
  if (!parsedEntry.success) throw new Error(parsedEntry.error?.issues?.[0]?.message || "Validation failed");
  if (!spaceId) throw new Error("Missing fields");
  const space = await prisma.space.findFirst({ where: { id: spaceId, ownerId: user.id } });
  if (!space) throw new Error("Space not found");
  if (title) { const dup = await prisma.vaultEntry.findFirst({ where: { spaceId, title: { equals: title, mode: "insensitive" } } }); if (dup) throw new Error("Title must be unique in this space"); }
  let categoryId: string | null = null; let category: string | null = null; let icon: string | null = rawIcon; let color: string | null = rawColor || "#006FEE"; let logoUrl: string | null = rawLogoUrl;
  if (rawCategoryId && rawCategoryId !== "none") {
    if (rawCategoryId === "custom" && customCategory) { const cat = await ensureCategory(customCategory, icon, color, logoUrl, user.id); categoryId = cat.id; category = cat.name; icon = cat.icon; color = cat.color; logoUrl = cat.logoUrl; }
    else if (rawCategoryId !== "custom") { const cat = await prisma.category.findFirst({ where: { id: rawCategoryId, ownerId: user.id } }); if (!cat) throw new Error("Category not found"); categoryId = cat.id; category = cat.name; icon = cat.icon; color = cat.color; logoUrl = cat.logoUrl; }
  } else if (rawCategory) { const cat = await ensureCategory(rawCategory, icon, color, logoUrl, user.id); categoryId = cat.id; category = cat.name; icon = cat.icon; color = cat.color; logoUrl = cat.logoUrl; }
  await prisma.vaultEntry.create({ data: { spaceId, title, email, password, description, url, category, icon, color, logoUrl, categoryId } });
  revalidatePath(`/spaces/${spaceId}`);
}

export async function updateEntry(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");
  const entryId = String(formData.get("entryId") || "");
  const spaceId = String(formData.get("spaceId") || "");
  const title = String(formData.get("title") || "").trim() || null;
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const description = String(formData.get("description") || "").trim() || null;
  const url = String(formData.get("url") || "").trim() || null;
  const rawCategoryId = String(formData.get("categoryId") || "").trim() || null;
  const rawCategory = String(formData.get("category") || "").trim() || null;
  const rawIcon = String(formData.get("icon") || "").trim() || null;
  const rawColor = String(formData.get("color") || "").trim() || null;
  const rawLogoUrl = String(formData.get("logoUrl") || "").trim() || null;
  const customCategory = String(formData.get("customCategory") || "").trim() || null;
  const parsedUpd = updateEntrySchema.safeParse({ title, email, password: password || null, url, description, category: rawCategory || customCategory, icon: rawIcon, color: rawColor, logoUrl: rawLogoUrl, entryId, spaceId, categoryId: rawCategoryId, customCategory });
  if (!parsedUpd.success) throw new Error(parsedUpd.error?.issues?.[0]?.message || "Validation failed");
  if (!entryId || !email || !spaceId) throw new Error("Missing fields");
  const space = await prisma.space.findFirst({ where: { id: spaceId, ownerId: user.id } });
  if (!space) throw new Error("Space not found");
  if (title) { const dup = await prisma.vaultEntry.findFirst({ where: { spaceId, title: { equals: title, mode: "insensitive" }, NOT: { id: entryId } } }); if (dup) throw new Error("Title must be unique in this space"); }
  let categoryId: string | null = null; let category: string | null = null; let icon: string | null = rawIcon; let color: string | null = rawColor || null; let logoUrl: string | null = rawLogoUrl;
  if (rawCategoryId && rawCategoryId !== "none") {
    if (rawCategoryId === "custom" && customCategory) { const cat = await ensureCategory(customCategory, icon, color, logoUrl, user.id); categoryId = cat.id; category = cat.name; icon = cat.icon; color = cat.color; logoUrl = cat.logoUrl; }
    else if (rawCategoryId !== "custom") { const cat = await prisma.category.findFirst({ where: { id: rawCategoryId, ownerId: user.id } }); if (!cat) throw new Error("Category not found"); categoryId = cat.id; category = cat.name; icon = cat.icon; color = cat.color; logoUrl = cat.logoUrl; }
  } else if (rawCategory) { const cat = await ensureCategory(rawCategory, icon, color, logoUrl, user.id); categoryId = cat.id; category = cat.name; icon = cat.icon; color = cat.color; logoUrl = cat.logoUrl; }
  else if (rawCategoryId === "none") { categoryId = null; category = null; icon = null; color = null; logoUrl = null; }
  const data: Record<string, unknown> = { title, email, description, url, category, icon, color, logoUrl, categoryId };
  if (password) data.password = password;
  if (rawCategoryId === "none") { data.category = null; data.icon = null; data.color = null; data.logoUrl = null; data.categoryId = null; }
  await prisma.vaultEntry.update({ where: { id: entryId }, data });
  revalidatePath(`/spaces/${spaceId}`);
}

export async function deleteEntry(entryId: string, spaceId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");
  const entry = await prisma.vaultEntry.findUnique({ where: { id: entryId }, include: { space: true } });
  if (!entry) throw new Error("Entry not found");
  const space = await prisma.space.findFirst({ where: { id: entry.spaceId, ownerId: user.id } });
  if (!space) throw new Error("Unauthorized");
  await prisma.vaultEntry.delete({ where: { id: entryId } });
  revalidatePath(`/spaces/${spaceId}`);
}
