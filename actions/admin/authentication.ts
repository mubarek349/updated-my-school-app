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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  message: string;
};

type AuthResult =
  | { ok: true; message: string; redirectTo?: string }
  | { ok: false; message: string; field?: "phoneno" | "passcode" | "form" };

function normalizePhone(phone: string) {
  // Example: strip spaces and non-digits; adapt to your locale rules.
  return phone.replace(/[^\d+]/g, "");
}

export async function authenticate(
  raw: z.infer<typeof loginSchema>
): Promise<AuthResult> {
  // Validate on the server as well (never trust client)
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
  const phoneno = normalizePhone(data.phoneno);

  try {
    // Use NextAuth signIn to create session with admin userType
    await signIn("credentials", {
      phoneno,
      passcode: data.passcode,
      userType: "admin",
      redirect: false,
    });
  } catch (err) {
    console.log("Authentication error:", err);
    return {
      ok: false,
      message: "Invalid phone number or password.",
      field: "form",
    };
  }

  // Redirect server-side after successful authentication
  redirect("/en/admin/coursesPackages");
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
      console.log("User is not admin, userType:", (session.user as any).userType);
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
