"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");
  const name = String(formData.get("name") || "").trim() || null;
  const image = String(formData.get("image") || "").trim() || null;
  if (name !== null && name.length > 100) throw new Error("Name too long");
  await prisma.user.update({ where: { id: user.id }, data: { name, image } });
  revalidatePath("/dashboard");
  revalidatePath("/account");
}
