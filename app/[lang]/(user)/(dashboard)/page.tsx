import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    redirect("/en/login");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userType = (session.user as any)?.userType;

  if (userType === "admin") {
    redirect("/en/admin/coursesPackages");
  } else if (userType === "ustaz") {
    redirect("/en/ustaz");
  } else {
    // If no valid role, redirect to login
    redirect("/en/login");
  }
}
