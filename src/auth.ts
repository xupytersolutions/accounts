import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { DEFAULT_SPACES } from "@/lib/constants/default-spaces";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      try {
        const existing = await prisma.space.count({ where: { ownerId: user.id } });
        if (existing > 0) return;
        await prisma.space.createMany({
          data: DEFAULT_SPACES.map((s) => ({
            name: s.name,
            type: s.type,
            description: s.description,
            color: s.color,
            icon: s.icon,
            ownerId: user.id!,
          })),
        });
      } catch (e) {
        console.error("[auth] failed to seed default spaces for new user", user.id, e);
      }
    },
  },
});
