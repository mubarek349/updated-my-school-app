"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useAction from "@/hooks/useAction";
import { authenticate } from "@/actions/admin/authentication";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loading from "@/components/custom/common/loading"; // Optional: if you're using a custom one
import Image from "next/image";
import { useRouter } from "next/navigation";

function LoginPage() {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const router = useRouter();

  const [, action, loading] = useAction(authenticate, [
    undefined,
    (response) => {
      console.log("Response from action:", response);
      if (response?.message == "Login successful") {
        router.push("/en/admin/coursesPackages");
      }
    },
  ]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.jpg"
            alt="Logo"
            width={64}
            height={64}
            className="h-16 w-auto object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold text-center text-green-600 mb-6">
          Welcome to Darelkubra Admin
        </h1>
        <form onSubmit={handleSubmit(action)} className="space-y-5">
          <div>
            <label
              htmlFor="phoneno"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number
            </label>
            <Input
              id="phoneno"
              type="tel"
              placeholder="09*********"
              {...register("phoneno")}
            />
            {errors.phoneno && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phoneno.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="passcode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <Input
              id="passcode"
              type="password"
              placeholder="********"
              {...register("passcode")}
            />
            {errors.passcode && (
              <p className="text-red-500 text-sm mt-1">
                {errors.passcode.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loading /> : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
