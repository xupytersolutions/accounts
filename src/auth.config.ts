import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  providers: [Google],
  callbacks: {
    async jwt({ token, user }) {
      if (user) (token as unknown as Record<string, unknown>).id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        (session.user as unknown as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
