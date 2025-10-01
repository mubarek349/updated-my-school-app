import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();

  // If no session, redirect to login
  if (!session?.user) {
    redirect("/en/login");
  }

  // Get user type from session
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const userType = (session.user as any)?.userType;

  // Redirect based on user type
  switch (userType) {
    case "admin":
      redirect("/en/admin");
    case "ustaz":
      redirect("/en/ustaz");
    default:
      // Unknown user type or no user type, redirect to login
      // Note: Students don't use the authentication system - they access via direct URLs
      redirect("/en/login");
  }
}
