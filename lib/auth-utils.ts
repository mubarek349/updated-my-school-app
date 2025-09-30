import { auth } from "../auth";
import { redirect } from "next/navigation";

export type UserType = "admin" | "ustaz" | "student";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function getCurrentUserType(): Promise<UserType | null> {
  const user = await getCurrentUser();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (user as any)?.userType || null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/en/login");
  }
  return user;
}

export async function requireUserType(allowedTypes: UserType[]) {
  const userType = await getCurrentUserType();
  if (!userType || !allowedTypes.includes(userType)) {
    redirect("/en/login");
  }
  return userType;
}

export async function requireAdmin() {
  return await requireUserType(["admin"]);
}

export async function requireUstaz() {
  return await requireUserType(["ustaz"]);
}

export async function requireStudent() {
  return await requireUserType(["student"]);
}

export async function requireAdminOrUstaz() {
  return await requireUserType(["admin", "ustaz"]);
}
