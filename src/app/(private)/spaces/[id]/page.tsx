import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SpaceClient } from "@/components/space-client";
import { createEntry, deleteEntry, transferEntry, bulkCreateEntries, bulkDeleteEntries, bulkTransferEntries } from "@/lib/actions";
import { ensureDefaultCategories } from "@/lib/category-seed";

export default async function SpacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const user = await prisma.user.findUnique({ where: { email: session!.user!.email! } });
  const space = await prisma.space.findFirst({ where: { id, ownerId: user!.id }, include: { entries: { orderBy: { createdAt: "desc" } } } });
  if (!space) notFound();
  await ensureDefaultCategories(user!.id);
  const allSpaces = await prisma.space.findMany({ where: { ownerId: user!.id }, select: { id: true, name: true, type: true }, orderBy: { name: "asc" } });
  const allCategories = await prisma.category.findMany({ where: { ownerId: user!.id }, orderBy: { name: "asc" } });
  const entriesWithCategory = await prisma.vaultEntry.findMany({ where: { spaceId: id }, include: { categoryRef: true } });
  // merge categoryRef into space.entries for client
  const spaceWithCats = { ...space, entries: entriesWithCategory.sort((a,b)=> new Date(b.createdAt).getTime()- new Date(a.createdAt).getTime()) };

  return <SpaceClient space={spaceWithCats as never} allSpaces={allSpaces as never} allCategories={allCategories as never} createEntry={createEntry} deleteEntry={deleteEntry} transferEntry={transferEntry} bulkCreateEntries={bulkCreateEntries} bulkDeleteEntries={bulkDeleteEntries} bulkTransferEntries={bulkTransferEntries} />;
}
