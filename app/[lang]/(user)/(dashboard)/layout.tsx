import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect if not authenticated
  if (!session) {
    redirect("/login");
  }

  const userType = (session.user as any)?.userType;

  // Redirect based on userType
  if (userType === "admin" || userType === "ustaz") {
    redirect(`/en/${userType}`);
  }

  return <>{children}</>;
}