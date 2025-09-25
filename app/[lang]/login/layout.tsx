import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userType = (session.user as any)?.userType;

    if (userType === "admin") {
      redirect("/en/admin/coursesPackages");
    } else if (userType === "ustaz") {
      redirect("/en/ustaz");
    } else {
      redirect("/en/login");
    }
  }

  return <>{children}</>;
}
