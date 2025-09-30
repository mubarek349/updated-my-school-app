import { requireAdminOrUstaz } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdminOrUstaz();
    return <>{children}</>;
  } catch {
    redirect("/en/login");
  }
}
