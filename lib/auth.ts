import NextAuth, { CredentialsSignin, NextAuthConfig } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import prisma from "./db";
import { loginSchema } from "./zodSchema";
// import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id?: string;
    // role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    // role: Role;
  }
}

export class CustomError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
  }
}

const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/signin",
    signOut: "/signout",
  },
  callbacks: {
    authorized: async () => {
      return true;
    },
    jwt: async ({ token, user }) => {
      return { ...token, ...user };
    },
    session: async ({ session, token }) => {
      return { ...session, user: { ...session.user, ...token } };
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const { phoneno, passcode } = await loginSchema.parseAsync(credentials);
        const user = await prisma.admin.findFirst({
          where: { phoneno },
          select: { id: true, passcode: true },
        });
        if (!user) throw new CustomError("Invalid Phone Number");
        if (!user.passcode) throw new CustomError("Password Not Set");
        // Plain text password comparison (not secure for production)
        if (passcode !== user.passcode)
          throw new CustomError("Invalid Password");
        return { id: user.id };
      },
    }),
  ],
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
