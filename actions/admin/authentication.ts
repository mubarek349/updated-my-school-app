"use server";

import { auth, CustomError } from "@/lib/auth";
import { signIn, signOut } from "../../lib/auth";
import { z } from "zod";
import { loginSchema } from "@/lib/zodSchema";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";

export async function authenticate(data: z.infer<typeof loginSchema>) {
  try {
    console.log("credentials >> ", data);
    await signIn("credentials", {
      phoneno: data.phoneno,
      passcode: data.passcode,
      redirect: false,
    });
    // redirect("/en/admin/coursesPackages");

    console.log("sign in successfully");
    return { message: "Login successful" };
  } catch (error) {
    console.log("sign in failed", error);
    if (error instanceof CustomError) {
      return { message: error.message };
    } else
      return {
        message: error,
      };
  }
}

export async function logout() {
  try {
    await signOut({ redirect: false });
    redirect("/en/login");
    return { message: "Logout successful", status: true };
  } catch (error) {
    console.error("Logout failed:", error);
    return { message: "Logout failed", status: false };
  }
}
export async function checkAuthentication() {
  const session = await signIn("credentials", { redirect: false });
  if (!session || !session.user) {
    redirect("/en/login");
  }
  return session;
}

export async function isAuthenticated() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return false;
  }
  const user = await prisma.admin.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    return false;
  }
  return true;
}

export async function loginData() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return "Unauthorized";
  }
  const user = await prisma.admin.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    return "User not found";
  }
  return user;
}
