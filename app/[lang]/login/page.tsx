"use client";

import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/zodSchema";
import { authenticate } from "@/actions/admin/authentication";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

type FormValues = z.infer<typeof loginSchema>;

function LoginPage() {
  const router = useRouter();
  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  const [pending, startTransition] = useTransition();

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const result = await authenticate(values);

      if (result.ok) {
        toast.success(result.message);
        router.push(result.redirectTo ?? "/");
        return;
      }

      // Show precise inline error when possible
      if (result.field && result.field !== "form") {
        setError(result.field, { type: "server", message: result.message });
      } else {
        setError("root", { type: "server", message: result.message });
      }
      toast.error(result.message);
    });
  };

  return (
   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-8">
  <div className="w-full max-w-md bg-white border border-gray-200 shadow-lg rounded-2xl p-8 animate-in fade-in duration-500 ease-out">
    <div className="flex justify-center mb-6">
      <Image
        src="/logo.png"
        alt="Darelkubra Logo"
        width={64}
        height={64}
        className="h-16 w-auto object-contain"
        priority
      />
    </div>

    <div className="text-center mb-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Admin Portal</h1>
      <p className="text-sm text-gray-500">Sign in to continue</p>
    </div>

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
          inputMode="tel"
          autoComplete="tel"
          placeholder="09*********"
          aria-invalid={!!errors.phoneno || undefined}
          aria-describedby={errors.phoneno ? "phoneno-error" : undefined}
          disabled={pending}
          {...register("phoneno")}
        />
        {errors.phoneno && (
          <p id="phoneno-error" className="text-sm text-red-600 mt-1">
            {errors.phoneno.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="passcode"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Passcode
        </label>
        <Input
          id="passcode"
          type="password"
          autoComplete="current-password"
          placeholder="********"
          aria-invalid={!!errors.passcode || undefined}
          aria-describedby={errors.passcode ? "passcode-error" : undefined}
          disabled={pending}
          {...register("passcode")}
        />
        {errors.passcode && (
          <p id="passcode-error" className="text-sm text-red-600 mt-1">
            {errors.passcode.message}
          </p>
        )}
      </div>

      {errors.root?.message && (
        <div
          role="alert"
          className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm p-3"
        >
          {errors.root.message}
        </div>
      )}

      <Button
        type="submit"
        className="w-full flex justify-center items-center gap-2"
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  </div>
</div>

  );
}

export default LoginPage;
