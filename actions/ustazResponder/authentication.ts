"use server";

import { signOut, signIn } from "../../auth";
import { auth } from "../../auth";
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
    // Check if ustaz exists and is permissioned
    const ustaz = await prisma.responseUstaz.findFirst({
      where: { phoneno },
      select: { id: true, passcode: true, permissioned: true, ustazname: true },
    });

    if (!ustaz) {
      return {
        ok: false,
        message: "Invalid phone number or password.",
        field: "form",
      };
    }

    if (!ustaz.permissioned) {
      return {
        ok: false,
        message: "Your account has been suspended. Please contact admin.",
        field: "form",
      };
    }

    if (data.passcode !== ustaz.passcode) {
      return {
        ok: false,
        message: "Invalid phone number or password.",
        field: "form",
      };
    }

    // Use NextAuth signIn to create session with ustaz type
    await signIn("credentials", {
      phoneno,
      passcode: data.passcode,
      userType: "ustaz",
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
  redirect("/en/ustaz");
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

export async function checkUstazAuthentication(): Promise<boolean> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return false;
    }

    // Verify ustaz exists in database and is permissioned
    const ustaz = await prisma.responseUstaz.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { permissioned: true },
    });

    return !!ustaz && (ustaz.permissioned ?? false);
  } catch (error) {
    console.error("Ustaz authentication check failed:", error);
    return false;
  }
}

export async function isUstazAuthenticated(): Promise<boolean> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return false;
    }

    const ustaz = await prisma.responseUstaz.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { permissioned: true },
    });

    return !!ustaz && (ustaz.permissioned ?? false);
  } catch (error) {
    console.error("Ustaz authentication verification failed:", error);
    return false;
  }
}

export async function getCurrentUstaz(): Promise<UserData> {
  try {
    const session = await auth();
    console.log("getCurrentUstaz session:", session);

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Not authenticated",
      };
    }

    // Check if this is an ustaz session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((session.user as any).userType !== "ustaz") {
      return {
        success: false,
        message: "Not authenticated as ustaz",
      };
    }

    const ustaz = await prisma.responseUstaz.findUnique({
      where: { id: parseInt(session.user.id) },
      select: {
        id: true,
        phoneno: true,
        ustazname: true,
        permissioned: true,
        chat_id: true,
      },
    });

    if (!ustaz) {
      return {
        success: false,
        message: "Ustaz not found",
      };
    }

    if (!ustaz.permissioned) {
      return {
        success: false,
        message: "Account suspended",
      };
    }

    return {
      success: true,
      data: ustaz,
      message: "Ustaz data retrieved successfully",
    };
  } catch (error) {
    console.error("Failed to get ustaz data:", error);
    return {
      success: false,
      message: "Failed to retrieve ustaz data",
    };
  }
}

export async function requireUstazAuthentication(redirectTo = "/en/login") {
  const isAuth = await checkUstazAuthentication();

  if (!isAuth) {
    redirect(redirectTo);
  }
}