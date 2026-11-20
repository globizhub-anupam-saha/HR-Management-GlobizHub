"use client";

// src/app/(auth)/login/page.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Building2 } from "lucide-react";
import Logo from "@/components/brand/Logo";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const resData = await authApi.login({ email: values.email, password: values.password });
      const response = { data: resData };

      // Clear any previous session tokens to prevent role/portal crossover
      localStorage.removeItem("platform_token");
      localStorage.removeItem("platform_user");
      localStorage.removeItem("hrms_token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (response.data.portal === "PLATFORM_ADMIN") {
        localStorage.setItem("platform_token", response.data.access_token);
        localStorage.setItem("platform_user", JSON.stringify(response.data.user));
        window.location.href = response.data.targetUrl || "/platform-admin/dashboard";
      } else {
        localStorage.setItem("hrms_token", response.data.access_token);
        localStorage.setItem("token", response.data.access_token);
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        window.location.href = response.data.targetUrl || "/workspace/dashboard";
      }
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Invalid email or password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 safe-area-top safe-area-bottom">
      <div className="max-w-[420px] w-full bg-card rounded-[24px] apple-shadow-card border-0 dark:border dark:border-hairline dark:border-separator p-6 sm:p-8">
        
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-[18px] border border-border/80 shadow-sm flex items-center justify-center mb-3">
            <Logo variant="emblem" size="lg" />
          </div>
          <h1 className="type-title-2 font-black text-foreground text-center tracking-tight">
            Sign in to <span className="text-[#0066B2] dark:text-[#38BDF8]">Globiz</span><span className="text-[#F7941D]">Hr</span>
          </h1>
          <p className="type-subhead text-label-secondary text-center mt-1">
            A complete HR management solution
          </p>
        </div>

        {errorMessage && (
          <div className="bg-destructive/10 text-destructive text-[13px] font-medium p-3 rounded-[10px] mb-6 text-center border border-hairline border-destructive/20 animate-in fade-in-0">
            {errorMessage}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="type-subhead text-label-secondary font-medium">Work Email</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@company.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage className="text-[12px] text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="type-subhead text-label-secondary font-medium">Password</FormLabel>
                    <button
                      type="button"
                      onClick={() => router.push("/forgot-password")}
                      className="text-[13px] text-primary hover:underline font-medium cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <FormControl>
                    <Input placeholder="••••••••" type="password" {...field} />
                  </FormControl>
                  <FormMessage className="text-[12px] text-destructive" />
                </FormItem>
              )}
            />

            <div className="pt-2">
              <Button 
                type="submit" 
                variant="default"
                size="touch"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </div>
          </form>
        </Form>
        
        <div className="mt-6 text-center">
          <p className="type-footnote text-label-secondary">
            Don't have a workspace yet?{" "}
            <button 
              onClick={() => router.push("/register/wizard")} 
              className="text-primary hover:underline font-medium cursor-pointer"
            >
              Register your company
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
