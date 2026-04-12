import Discord from "next-auth/providers/discord";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID!,
      clientSecret: process.env.AUTH_DISCORD_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isWebmaster = (token.isWebmaster as boolean) ?? false;
        session.user.isBanned = (token.isBanned as boolean) ?? false;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
} satisfies NextAuthConfig;
