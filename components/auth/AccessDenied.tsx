"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";

interface AccessDeniedProps {
  userType?: string;
  requiredType?: string;
}

export default function AccessDenied({
  userType,
  requiredType,
}: AccessDeniedProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
          {userType && requiredType && (
            <p className="text-sm text-gray-500 mt-2">
              Your role: <span className="font-semibold">{userType}</span> |
              Required: <span className="font-semibold">{requiredType}</span>
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          <Button onClick={() => router.push("/en/login")} className="w-full">
            Sign In Again
          </Button>
        </div>
      </div>
    </div>
  );
}
