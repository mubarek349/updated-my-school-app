/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { signOut, signIn } from "@/auth";
import { auth } from "@/auth";
import { loginSchema } from "../../lib/zodSchema";
import { redirect } from "next/navigation";
import prisma from "../../lib/db";
import z from "zod";

// Types for consistent return values
type AuthResults = {
  success: boolean;
  message: string;
  error?: string;
};

type UserData = {
  success: boolean;
  data?: any;
  message: string;
};

type AuthResult =
  | { ok: true; message: string; redirectTo?: string }
  | { ok: false; message: string; field?: "phoneno" | "passcode" | "form" };

export async function authenticate(
  raw: z.infer<typeof loginSchema>
): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Invalid input.",
      field:
        (parsed.error.issues[0]?.path?.[0] as "phoneno" | "passcode") ?? "form",
    };
  }

  const data = parsed.data;

  // Check responseUstaz first
  const ustaz = await prisma.responseUstaz.findFirst({
    where: { phoneno: data.phoneno },
    select: { id: true, passcode: true, permissioned: true },
  });

  if (ustaz && ustaz.passcode === data.passcode && ustaz.permissioned) {
    try {
      await signIn("credentials", {
        phoneno: data.phoneno,
        passcode: data.passcode,
        userType: "ustaz",
        redirect: false,
      });
      return {
        ok: true,
        message: "Login successful",
        redirectTo: "/en/ustaz",
      };
    } catch (err) {
      console.log("Ustaz authentication error:", err);
      return {
        ok: false,
        message: "Authentication failed. Please try again.",
        field: "form",
      };
    }
  }

  // Check admin if ustaz not found
  const admin = await prisma.admin.findFirst({
    where: { phoneno: data.phoneno },
    select: { id: true, passcode: true },
  });

  if (admin && admin.passcode === data.passcode) {
    try {
      await signIn("credentials", {
        phoneno: data.phoneno,
        passcode: data.passcode,
        userType: "admin",
        redirect: false,
      });
      return {
        ok: true,
        message: "Login successful",
        redirectTo: "/en/admin/coursesPackages",
      };
    } catch (err) {
      console.log("Admin authentication error:", err);
      return {
        ok: false,
        message: "Authentication failed. Please try again.",
        field: "form",
      };
    }
  }

  return {
    ok: false,
    message: "Invalid phone number or password.",
    field: "form",
  };
}

export async function logout(): Promise<AuthResults> {
  try {
    await signOut({ redirect: false });

    return {
      success: true,
      message: "Logout successful",
    };
  } catch (error) {
    console.error("Logout failed:", error);
    return {
      success: false,
      message: "Logout failed",
      error: "Unable to sign out properly",
    };
  }
}

export async function checkAuthentication(): Promise<boolean> {
  try {
    const session = await auth();
    console.log("Admin checkAuthentication session:", session);

    if (!session?.user?.id) {
      return false;
    }

    // Check if this is an admin session
    if ((session.user as any).userType !== "admin") {
      console.log(
        "User is not admin, userType:",
        (session.user as any).userType
      );
      return false;
    }

    // Verify user exists in database
    const user = await prisma.admin.findUnique({
      where: { id: session.user.id },
    });

    console.log("Admin user found:", !!user);
    return !!user;
  } catch (error) {
    console.error("Authentication check failed:", error);
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return false;
    }

    const user = await prisma.admin.findUnique({
      where: { id: session.user.id },
    });

    return !!user;
  } catch (error) {
    console.error("Authentication verification failed:", error);
    return false;
  }
}

export async function getCurrentUser(): Promise<UserData> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Not authenticated",
      };
    }

    const user = await prisma.admin.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        // Add other fields you want to return
        // email: true,
        // name: true,
        // role: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    return {
      success: true,
      data: user,
      message: "User data retrieved successfully",
    };
  } catch (error) {
    console.error("Failed to get user data:", error);
    return {
      success: false,
      message: "Failed to retrieve user data",
    };
  }
}

export async function requireAuthentication(redirectTo = "/en/login") {
  const isAuth = await checkAuthentication();

  if (!isAuth) {
    redirect(redirectTo);
  }
}
