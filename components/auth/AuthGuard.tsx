"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AccessDenied from "./AccessDenied";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedTypes: string[];
  fallback?: React.ReactNode;
}

export default function AuthGuard({
  children,
  allowedTypes,
  fallback,
}: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/en/login");
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userType = (session.user as any)?.userType;
    if (!allowedTypes.includes(userType)) {
      // User doesn't have the right permissions
      return;
    }
  }, [session, status, router, allowedTypes]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userType = (session.user as any)?.userType;
  if (!allowedTypes.includes(userType)) {
    return (
      fallback || (
        <AccessDenied
          userType={userType}
          requiredType={allowedTypes.join(" or ")}
        />
      )
    );
  }

  return <>{children}</>;
}
