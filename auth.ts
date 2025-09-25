/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "./lib/db";
import { loginSchema } from "./lib/zodSchema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        phoneno: { label: "Phone Number", type: "text" },
        passcode: { label: "Passcode", type: "password" },
        userType: { label: "User Type", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phoneno || !credentials?.passcode) {
          return null;
        }

        const userType = credentials.userType as string;

        try {
          // Validate credentials format
          const parsed = loginSchema.safeParse({
            phoneno: credentials.phoneno,
            passcode: credentials.passcode,
          });

          if (!parsed.success) {
            return null;
          }

          const { phoneno, passcode } = parsed.data;
          const normalizedPhone = phoneno.replace(/[^\d+]/g, "");

          if (userType === "ustaz") {
            // Authenticate ustaz
            const ustaz = await prisma.responseUstaz.findFirst({
              where: { phoneno: normalizedPhone },
              select: {
                id: true,
                phoneno: true,
                ustazname: true,
                passcode: true,
                permissioned: true,
              },
            });

            if (!ustaz || ustaz.passcode !== passcode || !ustaz.permissioned) {
              return null;
            }

            return {
              id: ustaz.id.toString(),
              name: ustaz.ustazname,
              email: ustaz.phoneno, // Using phone as email for session
              userType: "ustaz",
            };
          } else {
            // Authenticate admin
            console.log("Attempting admin auth with phone:", normalizedPhone);
            const admin = await prisma.admin.findFirst({
              where: { phoneno: normalizedPhone },
              select: {
                id: true,
                phoneno: true,
                name: true,
                passcode: true,
              },
            });

            console.log("Admin found:", !!admin);
            if (admin) {
              console.log("Passcode match:", admin.passcode === passcode);
            }

            if (!admin || admin.passcode !== passcode) {
              return null;
            }

            return {
              id: admin.id.toString(),
              name: admin.name,
              email: admin.phoneno, // Using phone as email for session
              userType: "admin",
            };
          }
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userType = (user as any).userType;
        token.id = user.id;
      }

      // Note: Permission checking for ustaz users is now handled in the
      // getCurrentUstaz function to avoid Edge Runtime issues with Prisma
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).userType = token.userType;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle redirects based on user type
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/en/login",
    error: "/en/login",
  },
  events: {
    async signOut() {
      // Clean up any session-related data if needed
      console.log("User signed out");
    },
  },
});
