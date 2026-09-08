"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SpaceType } from "@/generated/prisma/client";
import { spaceSchema, entrySchema, updateEntrySchema } from "@/lib/validators";

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

  await prisma.space.create({
    data: { name: parsed.name, type: parsed.type as SpaceType, description: parsed.description || null, color: parsed.color || "#006FEE", icon: parsed.icon || null, ownerId: user.id },
  });
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

async function ensureCategory(name: string, icon: string | null, color: string | null, logoUrl: string | null, ownerId: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Category name required");
  let cat = await prisma.category.findFirst({ where: { ownerId, name: { equals: trimmed, mode: "insensitive" } } });
  if (cat) {
    // update icon/color/logo if changed
    if ((icon && cat.icon !== icon) || (color && cat.color !== color) || (logoUrl && cat.logoUrl !== logoUrl)) {
      cat = await prisma.category.update({ where: { id: cat.id }, data: { icon: icon ?? cat.icon, color: color ?? cat.color, logoUrl: logoUrl ?? cat.logoUrl } });
    }
    return cat;
  }
  return await prisma.category.create({ data: { name: trimmed, icon: icon || null, color: color || "#006FEE", logoUrl: logoUrl || null, ownerId } });
}

export async function createEntry(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  const spaceId = String(formData.get("spaceId") || "");
  const title = String(formData.get("title") || "").trim() || null;
  const email = String(formData.get("email") || "").trim(); // login/username, not strictly email
  const password = String(formData.get("password") || "");
  const description = String(formData.get("description") || "").trim() || null;
  const url = String(formData.get("url") || "").trim() || null;
  const rawCategoryId = String(formData.get("categoryId") || "").trim() || null;
  const rawCategory = String(formData.get("category") || "").trim() || null;
  const rawIcon = String(formData.get("icon") || "").trim() || null;
  const rawColor = String(formData.get("color") || "").trim() || null;
  const rawLogoUrl = String(formData.get("logoUrl") || "").trim() || null;
  const customCategory = String(formData.get("customCategory") || "").trim() || null;
  // zod validation before DB (client also validates, this is server guard)
  const parsedEntry = entrySchema.safeParse({ title, email, password, url, description, category: rawCategory || customCategory, icon: rawIcon, color: rawColor || "#006FEE", logoUrl: rawLogoUrl, categoryId: rawCategoryId, customCategory });
  if (!parsedEntry.success) throw new Error(parsedEntry.error?.issues?.[0]?.message || "Validation failed");
  if (!spaceId) throw new Error("Missing fields");

  const space = await prisma.space.findFirst({ where: { id: spaceId, ownerId: user.id } });
  if (!space) throw new Error("Space not found");

  if (title) {
    const dup = await prisma.vaultEntry.findFirst({
      where: { spaceId, title: { equals: title, mode: "insensitive" } },
    });
    if (dup) throw new Error("Title must be unique in this space");
  }

  let categoryId: string | null = null;
  let category: string | null = null;
  let icon: string | null = rawIcon;
  let color: string | null = rawColor || "#006FEE";
  let logoUrl: string | null = rawLogoUrl;

  if (rawCategoryId && rawCategoryId !== "none") {
    if (rawCategoryId === "custom" && customCategory) {
      const cat = await ensureCategory(customCategory, icon, color, logoUrl, user.id);
      categoryId = cat.id;
      category = cat.name;
      icon = cat.icon;
      color = cat.color;
      logoUrl = cat.logoUrl;
    } else if (rawCategoryId !== "custom") {
      const cat = await prisma.category.findFirst({ where: { id: rawCategoryId, ownerId: user.id } });
      if (!cat) throw new Error("Category not found");
      categoryId = cat.id;
      category = cat.name;
      icon = cat.icon;
      color = cat.color;
      logoUrl = cat.logoUrl;
    }
  } else if (rawCategory) {
    const cat = await ensureCategory(rawCategory, icon, color, logoUrl, user.id);
    categoryId = cat.id;
    category = cat.name;
    icon = cat.icon;
    color = cat.color;
    logoUrl = cat.logoUrl;
  }

  await prisma.vaultEntry.create({
    data: { spaceId, title, email, password, description, url, category, icon, color, logoUrl, categoryId },
  });
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
  // zod guard (password optional on update)
  const parsedUpd = updateEntrySchema.safeParse({ title, email, password: password || null, url, description, category: rawCategory || customCategory, icon: rawIcon, color: rawColor, logoUrl: rawLogoUrl, entryId, spaceId, categoryId: rawCategoryId, customCategory });
  if (!parsedUpd.success) throw new Error(parsedUpd.error?.issues?.[0]?.message || "Validation failed");
  if (!entryId || !email || !spaceId) throw new Error("Missing fields");

  const space = await prisma.space.findFirst({ where: { id: spaceId, ownerId: user.id } });
  if (!space) throw new Error("Space not found");

  if (title) {
    const dup = await prisma.vaultEntry.findFirst({
      where: { spaceId, title: { equals: title, mode: "insensitive" }, NOT: { id: entryId } },
    });
    if (dup) throw new Error("Title must be unique in this space");
  }

  let categoryId: string | null = null;
  let category: string | null = null;
  let icon: string | null = rawIcon;
  let color: string | null = rawColor || null;
  let logoUrl: string | null = rawLogoUrl;

  if (rawCategoryId && rawCategoryId !== "none") {
    if (rawCategoryId === "custom" && customCategory) {
      const cat = await ensureCategory(customCategory, icon, color, logoUrl, user.id);
      categoryId = cat.id;
      category = cat.name;
      icon = cat.icon;
      color = cat.color;
      logoUrl = cat.logoUrl;
    } else if (rawCategoryId !== "custom") {
      const cat = await prisma.category.findFirst({ where: { id: rawCategoryId, ownerId: user.id } });
      if (!cat) throw new Error("Category not found");
      categoryId = cat.id;
      category = cat.name;
      icon = cat.icon;
      color = cat.color;
      logoUrl = cat.logoUrl;
    }
  } else if (rawCategory) {
    const cat = await ensureCategory(rawCategory, icon, color, logoUrl, user.id);
    categoryId = cat.id;
    category = cat.name;
    icon = cat.icon;
    color = cat.color;
    logoUrl = cat.logoUrl;
  } else if (rawCategoryId === "none") {
    categoryId = null;
    category = null;
    icon = null;
    color = null;
    logoUrl = null;
  }

  const data: Record<string, unknown> = { title, email, description, url, category, icon, color, logoUrl, categoryId };
  if (password) data.password = password;
  // allow clearing category
  if (rawCategoryId === "none") {
    data.category = null;
    data.icon = null;
    data.color = null;
    data.logoUrl = null;
    data.categoryId = null;
  }

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

export async function bulkDeleteEntries(entryIds: string[], spaceId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");
  const space = await prisma.space.findFirst({ where: { id: spaceId, ownerId: user.id } });
  if (!space) throw new Error("Space not found");
  if (!entryIds.length) return;
  // ensure all entries belong to this space and user owns space
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
    if (entry.title) {
      const dup = await prisma.vaultEntry.findFirst({ where: { spaceId: targetSpaceId, title: { equals: entry.title, mode: "insensitive" } } });
      if (dup) throw new Error(`Title already exists in target space: ${entry.title}`);
    }
  }
  await prisma.vaultEntry.updateMany({ where: { id: { in: entryIds } }, data: { spaceId: targetSpaceId } });
  // revalidate all affected spaces
  const spaceIds = new Set(entries.map((e) => e.spaceId));
  spaceIds.add(targetSpaceId);
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
  if (entry.title) {
    const dup = await prisma.vaultEntry.findFirst({
      where: { spaceId: targetSpaceId, title: { equals: entry.title, mode: "insensitive" } },
    });
    if (dup) throw new Error("Title already exists in target space");
  }
  await prisma.vaultEntry.update({ where: { id: entryId }, data: { spaceId: targetSpaceId } });
  revalidatePath(`/spaces/${entry.spaceId}`);
  revalidatePath(`/spaces/${targetSpaceId}`);
  revalidatePath("/dashboard");
}

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  const name = String(formData.get("name") || "").trim() || null;
  const image = String(formData.get("image") || "").trim() || null;
  // allow clearing image with empty string
  if (name !== null && name.length > 100) throw new Error("Name too long");

  await prisma.user.update({
    where: { id: user.id },
    data: { name, image },
  });
  revalidatePath("/dashboard");
  revalidatePath("/account");
}

export async function bulkCreateEntries(spaceId: string, entries: Array<{ title?: string | null; email: string; password: string; url?: string | null; description?: string | null; category?: string | null; icon?: string | null; color?: string | null; logoUrl?: string | null; categoryId?: string | null }>) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");
  const space = await prisma.space.findFirst({ where: { id: spaceId, ownerId: user.id } });
  if (!space) throw new Error("Space not found");
  const existingTitles = new Set(
    (await prisma.vaultEntry.findMany({ where: { spaceId }, select: { title: true } }))
      .map((e) => (e.title ?? "").toLowerCase())
      .filter(Boolean)
  );
  const seen = new Set<string>();
  // auto-rename duplicate titles instead of throwing (handles "contact" x2)
  for (const e of entries) {
    if (!e.email || !e.password) throw new Error("Each entry needs login and password");
    if (e.title) {
      let base = e.title.trim();
      let low = base.toLowerCase();
      let n = 2;
      // if title collides with DB or earlier rows in this batch, suffix " (2)", " (3)"...
      while (existingTitles.has(low) || seen.has(low)) {
        const candidate = `${base} (${n})`;
        low = candidate.toLowerCase();
        if (!existingTitles.has(low) && !seen.has(low)) {
          e.title = candidate;
          break;
        }
        n++;
        // safety break
        if (n > 100) throw new Error(`Duplicate title: ${base} - too many duplicates`);
      }
      seen.add(low);
      existingTitles.add(low); // reserve for next iteration
    }
  }
  const mapped = await Promise.all(entries.map(async (e) => {
    let categoryId: string | null = e.categoryId ?? null;
    let category: string | null = e.category?.trim() || null;
    let icon: string | null = e.icon ?? null;
    let color: string | null = e.color ?? null;
    let logoUrl: string | null = (e as { logoUrl?: string | null }).logoUrl ?? null;
    if (categoryId) {
      const cat = await prisma.category.findFirst({ where: { id: categoryId, ownerId: user.id } });
      if (cat) { category = cat.name; icon = cat.icon; color = cat.color; logoUrl = cat.logoUrl; }
    } else if (category) {
      const cat = await ensureCategory(category, icon, color, logoUrl, user.id);
      categoryId = cat.id;
      category = cat.name;
      icon = cat.icon;
      color = cat.color;
      logoUrl = cat.logoUrl;
    }
    return {
      spaceId,
      title: e.title?.trim() || null,
      email: e.email.trim(),
      password: e.password,
      url: e.url?.trim() || null,
      description: e.description?.trim() || null,
      category,
      icon,
      color: color || "#006FEE",
      logoUrl,
      categoryId,
    };
  }));
  await prisma.vaultEntry.createMany({ data: mapped });
  revalidatePath(`/spaces/${spaceId}`);
}
