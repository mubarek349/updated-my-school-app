import { requireStudent } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireStudent();
    return <>{children}</>;
  } catch  {
    redirect("/en/login");
  }
}
