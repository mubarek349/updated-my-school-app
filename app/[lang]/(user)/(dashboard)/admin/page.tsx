import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session || (session.user as any)?.userType !== "admin") {
    redirect("/en/login");
  }
  // Redirect to courses packages for admin users
  redirect("/en/admin/coursesPackages");
}
