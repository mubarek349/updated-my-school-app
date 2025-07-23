import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "./lib/db";
import { redirect } from "next/navigation";

const lang = "en";
export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // console.log("AUTH >> ", auth, nextUrl.pathname);
      if (!auth) {
        if (nextUrl.pathname.includes(`/${lang}/admin`)) return false;
        else return true;
      }
      return true;
    },
    jwt({ token, user }) {
      return { ...token, ...user };
    },
    session({ session, token }) {
      return { ...session, user: { ...session.user, ...token } };
    },
  },
  providers: [
    Credentials({
      credentials: {
        phoneno: { name: "phoneno", type: "text", placeholder: "Phone Number" },
        passcode: {
          name: "passcode",
          type: "password",
          placeholder: "Passcode",
        },
      },

      authorize: async (credentials) => {
        const user = await prisma.admin.findFirst({
          where: {
            phoneno: credentials.phoneno as string,
            passcode: credentials.passcode as string,
          },
          select: { id: true },
        });
        if (!user) {
          return redirect("/en");
        }

        return user;

        // student
      },
    }),
  ],

  // trustHost: true,
});

// import NextAuth from "next-auth";
// import Credentials from "next-auth/providers/credentials";
// import prisma from "./lib/db";
// import { DefaultJWT } from "next-auth/jwt";
// import { loginSchema } from "./lib/zodSchema";

// declare module "next-auth" {
//   interface User {
//     id?: string | undefined;
//     phoneno?: string | null | undefined;
//     passcode?: string | undefined;
//   }
//   interface Session {
//     user: {
//       id?: string;
//       phoneno?: string | null;
//       // ...other properties
//     };
//   }
// }
// declare module "next-auth/jwt" {
//   interface JWT extends DefaultJWT {
//     id: string;
//     phoneno: string;
//   }
// }

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   //  By default, the `id` property does not exist on `token` or `session`. See the [TypeScript](https://authjs.dev/getting-started/typescript) on how to add it.
//   session: {
//     strategy: "jwt",
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id ?? "";
//         token.phoneno = user.phoneno ?? "";
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       session.user.id = token.id;
//       session.user.phoneno = token.phoneno;
//       return session;
//     },
//     authorized({ auth, request: { url } }) {
//       if (!auth) {
//         if (url.includes("/teacher")) return false;
//         else return true;
//       }
//       return true;
//     },
//   },
//   providers: [
//     Credentials({
//       // You can specify which fields should be submitted, by adding keys to the `credentials` object.
//       // e.g. domain, username, password, 2FA token, etc.
//       credentials: {
//         phoneno: { name: "phoneno", type: "text", placeholder: "Phone Number" },
//         passcode: {
//           name: "passcode",
//           type: "password",
//           placeholder: "Passcode",
//         },
//       },

//       async authorize(credentials) {
//         const { phoneno, passcode } = await loginSchema.parseAsync(credentials);
//         const user = await prisma.admin.findFirst({
//           where: { phoneno },
//           select: { id: true, phoneno: true, passcode: true },
//         });
//         if (!user) throw new Error("Invalid phoneno");

//         console.log("DB passcode:", user.passcode);
//         console.log("Input passcode:", passcode);
//         if (!(passcode == user.passcode)) {
//           console.log("Invalid password.");
//           throw new Error("Invalid password.");
//         }

//         return user;

//         // student
//       },
//     }),
//   ],
// });
