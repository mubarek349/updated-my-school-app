"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, CheckCircle2, Info } from "lucide-react";
import { useState } from "react";
import Confetti from "react-confetti";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
});

const CreatePage = () => {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;
  const lang = "en";
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post("/api/coursesPackages", values);
      setSuccess(true);
      toast.success("Course Package created successfully");
      setTimeout(() => {
        router.push(`/${lang}/admin/coursesPackages/${response.data.id}`);
      }, 1800);
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="p-6">
      {success && (
        <Confetti
          numberOfPieces={200}
          recycle={false}
        />
      )}
      <Link
        href={`/${lang}/admin/coursesPackages`}
        className="flex items-center text-sm hover:opacity-75 transition mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Course Packages
      </Link>
      <div className="max-w-2xl mx-auto flex md:items-center md:justify-center h-full p-6">
        <div className="w-full bg-white/90 rounded-xl shadow-xl p-8 border border-gray-100 animate-fade-in hover:shadow-2xl transition-shadow duration-300">
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 transition-all">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4 animate-bounce-in" />
              <h2 className="text-2xl font-bold mb-2 text-green-700">
                Success!
              </h2>
              <p className="text-muted-foreground mb-2 text-center">
                Your course package has been created.
              </p>
              <span className="text-xs text-gray-400">Redirecting...</span>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2 text-blue-900 animate-fade-in-slow">
                Name your Course Package
              </h1>
              <p className="mb-6 text-gray-600 animate-fade-in-slow">
                What would you like to name your course package? Don&apos;t
                worry, you can change this later.
              </p>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8 mt-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel className="text-base">
                            Course Package name
                          </FormLabel>
                          <span
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                            className="relative cursor-pointer"
                          >
                            <Info className="h-4 w-4 text-blue-400" />
                            {showTooltip && (
                              <span className="absolute left-6 top-0 z-10 bg-blue-50 text-blue-900 text-xs rounded px-2 py-1 shadow-lg animate-fade-in-fast">
                                Choose a clear, descriptive name!
                              </span>
                            )}
                          </span>
                        </div>
                        <FormControl>
                          <Input
                            disabled={isSubmitting}
                            placeholder="e.g. 'Programming Languages'"
                            {...field}
                            className="focus:ring-2 focus:ring-blue-400 transition-all duration-200 focus:scale-105"
                          />
                        </FormControl>
                        <FormDescription>
                          What courses will you teach in this course package?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center gap-x-2">
                    <Link href={`/${lang}/admin/coursesPackages`}>
                      <Button type="button" variant="ghost">
                        Cancel
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      disabled={!isValid || isSubmitting}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all duration-200 shadow-md hover:scale-105"
                    >
                      {isSubmitting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {isSubmitting ? "Creating..." : "Continue"}
                    </Button>
                  </div>
                  {isSubmitting && (
                    <div className="w-full mt-4">
                      <div className="h-2 rounded bg-blue-100 overflow-hidden">
                        <div className="h-full bg-blue-500 animate-progress-bar" />
                      </div>
                    </div>
                  )}
                </form>
              </Form>
            </>
          )}
        </div>
      </div>
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-fade-in-slow {
          animation: fadeIn 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-fade-in-fast {
          animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-bounce-in {
          animation: bounceIn 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.7);
          }
          70% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-progress-bar {
          animation: progressBar 1.2s linear infinite;
        }
        @keyframes progressBar {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default CreatePage;
// This page is protected by the middleware, so it will only be accessible to authenticated users.
