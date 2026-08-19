import { PrismaAdapter } from "@next-auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url, provider }) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: provider.from,
            to: identifier,
            subject: "Sign in to Imvecto",
            html: `<p>Tap the link below to sign in to Imvecto.</p><p><a href="${url}">Sign in</a></p>`,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Resend error, status ${res.status}: ${text}`);
        }
      },
    } as any),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
        (session.user as any).role = (user as any).role;
      }
      return session;
    },
  },
};
