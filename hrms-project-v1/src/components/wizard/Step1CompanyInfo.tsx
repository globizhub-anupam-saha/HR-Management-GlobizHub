"use client";

// src/components/wizard/Step1CompanyInfo.tsx

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSetupWizardStore } from "@/store/useSetupWizardStore";
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
import {
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  Mail,
  AlertCircle,
  X,
} from "lucide-react";
import api from "@/lib/api";
import { authApi } from "@/lib/api/auth";

// 1. Define the validation rules for Step 1
const step1Schema = z
  .object({
    companyName: z.string().min(2, "Company Name is required"),
    industry: z.string().min(2, "Industry is required"),
    companySize: z.string().min(1, "Company size is required (e.g., 1-50)"),
    email: z.string().email("Invalid company email address"),
    phone: z.string().min(10, "Valid phone number required"),
    website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    adminFirstName: z.string().min(2, "Admin first name is required"),
    adminLastName: z.string().min(2, "Admin last name is required"),
    adminEmail: z.string().email("Invalid admin email address"),
    adminPhone: z.string().min(10, "Valid admin phone required"),
    adminPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please retype your password"),
  })
  .refine((data) => data.adminPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Step1CompanyInfo() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // 2. Connect to our Zustand memory bank
  const { formData, updateFormData, nextStep } = useSetupWizardStore();

  // Email OTP states for Admin Email (Primary login)
  const [isAdminEmailVerified, setIsAdminEmailVerified] = useState(
    formData.adminEmailVerified || false
  );
  const [showAdminOtpBox, setShowAdminOtpBox] = useState(false);
  const [adminOtpCode, setAdminOtpCode] = useState("");
  const [isAdminSendingOtp, setIsAdminSendingOtp] = useState(false);
  const [isAdminVerifyingOtp, setIsAdminVerifyingOtp] = useState(false);
  const [adminOtpCooldown, setAdminOtpCooldown] = useState(0);
  const [adminOtpError, setAdminOtpError] = useState<string | null>(null);
  const [adminOtpSuccess, setAdminOtpSuccess] = useState<string | null>(null);
  const [adminDebugOtp, setAdminDebugOtp] = useState<string | null>(null);

  // Email OTP states for Company Email (Optional verification)
  const [isCompanyEmailVerified, setIsCompanyEmailVerified] = useState(
    formData.emailVerified || false
  );
  const [showCompanyOtpBox, setShowCompanyOtpBox] = useState(false);
  const [companyOtpCode, setCompanyOtpCode] = useState("");
  const [isCompanySendingOtp, setIsCompanySendingOtp] = useState(false);
  const [isCompanyVerifyingOtp, setIsCompanyVerifyingOtp] = useState(false);
  const [companyOtpCooldown, setCompanyOtpCooldown] = useState(0);
  const [companyOtpError, setCompanyOtpError] = useState<string | null>(null);
  const [companyOtpSuccess, setCompanyOtpSuccess] = useState<string | null>(null);
  const [companyDebugOtp, setCompanyDebugOtp] = useState<string | null>(null);

  // Countdown timer for Admin OTP resend
  useEffect(() => {
    if (adminOtpCooldown <= 0) return;
    const timer = setInterval(() => {
      setAdminOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [adminOtpCooldown]);

  // Countdown timer for Company OTP resend
  useEffect(() => {
    if (companyOtpCooldown <= 0) return;
    const timer = setInterval(() => {
      setCompanyOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [companyOtpCooldown]);

  // 3. Initialize the form with data from Zustand
  const form = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      companyName: formData.companyName || "",
      industry: formData.industry || "",
      companySize: formData.companySize || "",
      email: formData.email || "",
      phone: formData.phone || "",
      website: formData.website || "",
      adminFirstName: formData.adminFirstName || "",
      adminLastName: formData.adminLastName || "",
      adminEmail: formData.adminEmail || "",
      adminPhone: formData.adminPhone || "",
      adminPassword: formData.adminPassword || "",
      confirmPassword: "",
    },
  });

  // Admin Email OTP handlers
  const handleSendAdminOtp = async () => {
    const email = form.getValues("adminEmail");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      form.setError("adminEmail", {
        type: "manual",
        message: "Please enter a valid admin email address first",
      });
      return;
    }

    setIsAdminSendingOtp(true);
    setAdminOtpError(null);
    setAdminOtpSuccess(null);
    form.clearErrors("adminEmail");

    try {
      const res = await authApi.sendRegistrationOtp(email);
      setShowAdminOtpBox(true);
      setAdminOtpCooldown(45);
      setAdminOtpSuccess("Verification code sent to your email!");
      if (res.debugOtp) {
        setAdminDebugOtp(res.debugOtp);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Failed to send verification code. Please try again.";
      setAdminOtpError(msg);
      setShowAdminOtpBox(true);
    } finally {
      setIsAdminSendingOtp(false);
    }
  };

  const handleVerifyAdminOtp = async () => {
    const email = form.getValues("adminEmail");
    if (!adminOtpCode || adminOtpCode.trim().length !== 6) {
      setAdminOtpError("Please enter the complete 6-digit code");
      return;
    }

    setIsAdminVerifyingOtp(true);
    setAdminOtpError(null);

    try {
      await authApi.verifyRegistrationOtp(email, adminOtpCode.trim());
      setIsAdminEmailVerified(true);
      setShowAdminOtpBox(false);
      setAdminOtpCode("");
      setAdminDebugOtp(null);
      setAdminOtpSuccess("Admin email verified successfully!");
      
      const companyEmail = form.getValues("email");
      const isSameAsCompany = companyEmail && companyEmail.trim().toLowerCase() === email.trim().toLowerCase();
      if (isSameAsCompany) {
        setIsCompanyEmailVerified(true);
      }

      updateFormData({
        adminEmailVerified: true,
        ...(isSameAsCompany ? { emailVerified: true } : {}),
      });
      form.clearErrors("adminEmail");
    } catch (err: any) {
      setAdminOtpError(
        err.response?.data?.message || "Invalid or expired verification code"
      );
    } finally {
      setIsAdminVerifyingOtp(false);
    }
  };

  // Company Email OTP handlers
  const handleSendCompanyOtp = async () => {
    const email = form.getValues("email");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      form.setError("email", {
        type: "manual",
        message: "Please enter a valid company email address first",
      });
      return;
    }

    setIsCompanySendingOtp(true);
    setCompanyOtpError(null);
    setCompanyOtpSuccess(null);
    form.clearErrors("email");

    try {
      const res = await authApi.sendRegistrationOtp(email);
      setShowCompanyOtpBox(true);
      setCompanyOtpCooldown(45);
      setCompanyOtpSuccess("Verification code sent to company email!");
      if (res.debugOtp) {
        setCompanyDebugOtp(res.debugOtp);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Failed to send verification code. Please try again.";
      setCompanyOtpError(msg);
      setShowCompanyOtpBox(true);
    } finally {
      setIsCompanySendingOtp(false);
    }
  };

  const handleVerifyCompanyOtp = async () => {
    const email = form.getValues("email");
    if (!companyOtpCode || companyOtpCode.trim().length !== 6) {
      setCompanyOtpError("Please enter the complete 6-digit code");
      return;
    }

    setIsCompanyVerifyingOtp(true);
    setCompanyOtpError(null);

    try {
      await authApi.verifyRegistrationOtp(email, companyOtpCode.trim());
      setIsCompanyEmailVerified(true);
      setShowCompanyOtpBox(false);
      setCompanyOtpCode("");
      setCompanyDebugOtp(null);
      setCompanyOtpSuccess("Company email verified successfully!");
      updateFormData({ emailVerified: true });
    } catch (err: any) {
      setCompanyOtpError(
        err.response?.data?.message || "Invalid or expired verification code"
      );
    } finally {
      setIsCompanyVerifyingOtp(false);
    }
  };

  // 4. When the user hits "Next", save to Zustand and move to Step 2
  async function onSubmit(values: z.infer<typeof step1Schema>) {
    form.clearErrors("adminEmail");

    // MANDATORY OTP VERIFICATION CHECK
    if (!isAdminEmailVerified) {
      form.setError("adminEmail", {
        type: "manual",
        message: "Email verification is mandatory. Please verify your email with OTP to proceed.",
      });

      // Automatically dispatch OTP and show verification box if not open
      if (!showAdminOtpBox) {
        setShowAdminOtpBox(true);
        handleSendAdminOtp();
      }
      return;
    }

    setIsCheckingEmail(true);

    try {
      const { confirmPassword: _confirmPassword, ...step1Data } = values;
      const isSameAsCompany = Boolean(
        values.email &&
          values.email.trim().toLowerCase() === values.adminEmail.trim().toLowerCase()
      );
      
      updateFormData({
        ...step1Data,
        adminEmailVerified: true,
        emailVerified: Boolean(isCompanyEmailVerified || isSameAsCompany),
      });
      nextStep();
    } catch {
      form.setError("adminEmail", {
        type: "manual",
        message: "Unable to proceed. Please try again.",
      });
    } finally {
      setIsCheckingEmail(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* COMPANY DETAILS SECTION */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">
            Company Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input placeholder="Technology" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* COMPANY EMAIL WITH OTP OPTION */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <div className="flex items-center justify-between mb-1">
                    <FormLabel>Company Email</FormLabel>
                    {isCompanyEmailVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendCompanyOtp}
                        disabled={isCompanySendingOtp}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        {isCompanySendingOtp ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" /> Sending…
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" /> Verify with OTP
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="hello@acmecorp.com"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (isCompanyEmailVerified) setIsCompanyEmailVerified(false);
                          if (showCompanyOtpBox) setShowCompanyOtpBox(false);
                        }}
                        className={
                          isCompanyEmailVerified
                            ? "border-emerald-500 bg-emerald-50/20 pr-9 text-slate-800 font-medium"
                            : ""
                        }
                      />
                      {isCompanyEmailVerified && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-3 pointer-events-none" />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />

                  {/* Company Email Inline OTP Box */}
                  {showCompanyOtpBox && (
                    <div className="mt-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in-50 duration-200">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-emerald-600" />
                            Enter Verification Code
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Sent to{" "}
                            <span className="font-medium text-slate-700">
                              {form.watch("email")}
                            </span>
                          </p>
                        </div>
                        {companyDebugOtp && (
                          <span
                            className="text-[10px] bg-amber-100 text-amber-800 font-mono px-2 py-0.5 rounded border border-amber-200"
                            title="Test code in development"
                          >
                            Dev OTP: {companyDebugOtp}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          maxLength={6}
                          placeholder="••••••"
                          value={companyOtpCode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setCompanyOtpCode(val);
                            if (companyOtpError) setCompanyOtpError(null);
                          }}
                          className="w-36 h-9 text-center font-mono font-bold tracking-[0.3em] text-base bg-white"
                          autoFocus
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleVerifyCompanyOtp}
                          disabled={isCompanyVerifyingOtp || companyOtpCode.length !== 6}
                          className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs cursor-pointer"
                        >
                          {isCompanyVerifyingOtp ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />{" "}
                              Verifying…
                            </>
                          ) : (
                            "Verify Code"
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowCompanyOtpBox(false);
                            setCompanyOtpError(null);
                          }}
                          className="h-9 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      {companyOtpError && (
                        <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          {companyOtpError}
                        </p>
                      )}

                      {companyOtpSuccess && !companyOtpError && (
                        <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                          ✓ {companyOtpSuccess}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-[11px] text-slate-500">
                        <span>Didn't receive code?</span>
                        {companyOtpCooldown > 0 ? (
                          <span className="text-slate-400 font-mono">
                            Resend in {companyOtpCooldown}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendCompanyOtp}
                            disabled={isCompanySendingOtp}
                            className="text-emerald-600 hover:text-emerald-700 font-medium underline cursor-pointer"
                          >
                            {isCompanySendingOtp ? "Sending…" : "Resend Code"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 555 123 4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://acmecorp.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companySize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Size</FormLabel>
                  <FormControl>
                    <Input placeholder="10-50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ADMIN DETAILS SECTION */}
        <div className="pt-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">
            Administrator Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="adminFirstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Alex" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="adminLastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Morgan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ADMIN EMAIL (LOGIN ID) WITH MANDATORY OTP VERIFICATION */}
            <FormField
              control={form.control}
              name="adminEmail"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <div className="flex items-center justify-between mb-1">
                    <FormLabel className="flex items-center gap-1 font-semibold text-slate-900">
                      Admin Email (Login ID) <span className="text-rose-500">*</span>
                    </FormLabel>
                    {isAdminEmailVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendAdminOtp}
                        disabled={isAdminSendingOtp}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        {isAdminSendingOtp ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" /> Sending…
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Verify with OTP (Mandatory)
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="alex@acmecorp.com"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (isAdminEmailVerified) setIsAdminEmailVerified(false);
                          if (showAdminOtpBox) setShowAdminOtpBox(false);
                        }}
                        className={
                          isAdminEmailVerified
                            ? "border-emerald-500 bg-emerald-50/20 pr-9 text-slate-800 font-medium"
                            : "border-slate-300"
                        }
                      />
                      {isAdminEmailVerified && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-3 pointer-events-none" />
                      )}
                    </div>
                  </FormControl>

                  {/* Mandatory verification helper text */}
                  {isAdminEmailVerified ? (
                    <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Email verified successfully. Ready to proceed.
                    </p>
                  ) : (
                    <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Mandatory: You must verify this email with a 6-digit OTP code before proceeding.
                    </p>
                  )}
                  <FormMessage />

                  {/* Admin Email Inline OTP Box */}
                  {showAdminOtpBox && (
                    <div className="mt-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in-50 duration-200">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-emerald-600" />
                            Enter Verification Code
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Sent to{" "}
                            <span className="font-medium text-slate-700">
                              {form.watch("adminEmail")}
                            </span>
                          </p>
                        </div>
                        {adminDebugOtp && (
                          <span
                            className="text-[10px] bg-amber-100 text-amber-800 font-mono px-2 py-0.5 rounded border border-amber-200"
                            title="Test code in development"
                          >
                            Dev OTP: {adminDebugOtp}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          maxLength={6}
                          placeholder="••••••"
                          value={adminOtpCode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setAdminOtpCode(val);
                            if (adminOtpError) setAdminOtpError(null);
                          }}
                          className="w-36 h-9 text-center font-mono font-bold tracking-[0.3em] text-base bg-white"
                          autoFocus
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleVerifyAdminOtp}
                          disabled={isAdminVerifyingOtp || adminOtpCode.length !== 6}
                          className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs cursor-pointer"
                        >
                          {isAdminVerifyingOtp ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />{" "}
                              Verifying…
                            </>
                          ) : (
                            "Verify Code"
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowAdminOtpBox(false);
                            setAdminOtpError(null);
                          }}
                          className="h-9 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      {adminOtpError && (
                        <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          {adminOtpError}
                        </p>
                      )}

                      {adminOtpSuccess && !adminOtpError && (
                        <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                          ✓ {adminOtpSuccess}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-[11px] text-slate-500">
                        <span>Didn't receive code?</span>
                        {adminOtpCooldown > 0 ? (
                          <span className="text-slate-400 font-mono">
                            Resend in {adminOtpCooldown}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendAdminOtp}
                            disabled={isAdminSendingOtp}
                            className="text-emerald-600 hover:text-emerald-700 font-medium underline cursor-pointer"
                          >
                            {isAdminSendingOtp ? "Sending…" : "Resend Code"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adminPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 555 987 6543" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="adminPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Retype Admin Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-6 flex justify-end">
          <Button
            type="submit"
            disabled={isCheckingEmail}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {isCheckingEmail ? "Checking…" : "Next Step"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
