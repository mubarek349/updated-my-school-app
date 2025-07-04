import React from "react";
import LoginPage from "./login-page";

export default async function Page() {
  //   const session = await auth();
  //   if (session && session.user && session.user.id) {
  //     // User is authenticated, redirect to the dashboard
  //     redirect("/en/admin/dashboard");
  //   }
  return <LoginPage />;
}
