import { requireAdmin } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
    return <>{children}</>;
  } catch (error) {
    redirect("/en/login");
  }
}
