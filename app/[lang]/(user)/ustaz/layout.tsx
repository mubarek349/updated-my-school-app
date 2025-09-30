import { requireUstaz } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function UstazLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireUstaz();
    return <>{children}</>;
  } catch {
    redirect("/en/login");
  }
}
