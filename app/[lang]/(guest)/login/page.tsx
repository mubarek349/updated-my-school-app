import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LoginPage from "./login-page";

export default async function Page() {
  const session = await auth();
  if (session && session.user && session.user.id) {
    // User is authenticated, redirect to the dashboard
    redirect("/en/admin/dashboard");
  }
  return <LoginPage />;
}
