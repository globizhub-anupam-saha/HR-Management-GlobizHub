"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  CreditCard,
  Mail,
  Shield,
  Save,
  CheckCircle2,
  Lock,
  Globe,
  Bell,
} from "lucide-react";

export default function PlatformSettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "payments" | "email" | "security">("general");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [form, setForm] = useState({
    // General
    platformName: "GlobizHR SaaS",
    supportEmail: "support@globizhr.com",
    marketingUrl: "https://globizhr.com",
    defaultCurrency: "INR",
    timezone: "UTC",

    // Payments
    stripeMode: "live",
    stripePublishableKey: "pk_live_51Ny8...",
    stripeSecretKey: "sk_live_51Ny8...",
    stripeWebhookSecret: "whsec_98ab...",
    razorpayKeyId: "rzp_live_45a...",
    razorpayKeySecret: "••••••••••••••••",

    // Email
    smtpHost: "smtp.sendgrid.net",
    smtpPort: 587,
    smtpUser: "apikey",
    smtpPassword: "••••••••••••••••",
    emailFromName: "GlobizHR Notifications",
    emailFromAddress: "notifications@globizhr.com",

    // Security
    requirePlatformMfa: true,
    sessionTimeoutMinutes: 120,
    maxFailedAttempts: 5,
    allowControlledDiagnostics: true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("globizhr_platform_settings");
      if (saved) {
        setForm((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("globizhr_platform_settings", JSON.stringify(form));
    } catch (e) {
      // ignore
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Platform Settings</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-primary/15 text-foreground border border-primary/25">
              System Configuration
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Global SaaS environment variables, payment gateways, SMTP infrastructure, and multi-tenant security policies.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          <Save className="size-4" />
          Save Changes
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-status-green/15 border border-status-green/25 text-status-green text-xs flex items-center gap-2">
          <CheckCircle2 className="size-4" />
          Platform settings successfully updated!
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border text-xs font-semibold gap-1">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === "general"
              ? "border-primary text-foreground font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="size-4" /> General
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === "payments"
              ? "border-primary text-foreground font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <CreditCard className="size-4" /> Payment Gateways
        </button>
        <button
          onClick={() => setActiveTab("email")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === "email"
              ? "border-primary text-foreground font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mail className="size-4" /> Email & SMTP
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === "security"
              ? "border-primary text-foreground font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Shield className="size-4" /> Security & Auth
        </button>
      </div>

      {/* Tab Panels */}
      <form onSubmit={handleSave} className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
        {activeTab === "general" && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-foreground">General SaaS Platform Identity</h3>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Platform Name
              </label>
              <input
                type="text"
                value={form.platformName}
                onChange={(e) => setForm({ ...form, platformName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Global Support Email
              </label>
              <input
                type="email"
                value={form.supportEmail}
                onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Default Billing Currency
                </label>
                <select
                  value={form.defaultCurrency}
                  onChange={(e) => setForm({ ...form, defaultCurrency: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                >
                  <option value="INR">INR (₹ Indian Rupee)</option>
                  <option value="USD">USD ($ US Dollar)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  System Standard Timezone
                </label>
                <input
                  type="text"
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono shadow-xs"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-foreground">Stripe & Razorpay Gateway Credentials</h3>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Stripe Secret Key
              </label>
              <input
                type="password"
                value={form.stripeSecretKey}
                onChange={(e) => setForm({ ...form, stripeSecretKey: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Stripe Webhook Signing Secret
              </label>
              <input
                type="password"
                value={form.stripeWebhookSecret}
                onChange={(e) => setForm({ ...form, stripeWebhookSecret: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono shadow-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Razorpay Key ID
                </label>
                <input
                  type="text"
                  value={form.razorpayKeyId}
                  onChange={(e) => setForm({ ...form, razorpayKeyId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Razorpay Key Secret
                </label>
                <input
                  type="password"
                  value={form.razorpayKeySecret}
                  onChange={(e) => setForm({ ...form, razorpayKeySecret: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono shadow-xs"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "email" && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-foreground">Transactional Email Delivery (SMTP)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-foreground mb-1">
                  SMTP Host Server
                </label>
                <input
                  type="text"
                  value={form.smtpHost}
                  onChange={(e) => setForm({ ...form, smtpHost: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={form.smtpPort}
                  onChange={(e) => setForm({ ...form, smtpPort: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono shadow-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                From Email Address
              </label>
              <input
                type="email"
                value={form.emailFromAddress}
                onChange={(e) => setForm({ ...form, emailFromAddress: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              />
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-foreground">Platform Security & Access Policies</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/40 border border-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.requirePlatformMfa}
                  onChange={(e) => setForm({ ...form, requirePlatformMfa: e.target.checked })}
                  className="rounded accent-primary"
                />
                <div>
                  <div className="text-xs font-semibold text-foreground">Require Two-Factor Auth (MFA)</div>
                  <div className="text-[11px] text-muted-foreground">
                    Enforce authenticator app (TOTP) for all Platform Super Admins.
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/40 border border-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.allowControlledDiagnostics}
                  onChange={(e) => setForm({ ...form, allowControlledDiagnostics: e.target.checked })}
                  className="rounded accent-primary"
                />
                <div>
                  <div className="text-xs font-semibold text-foreground">Allow Controlled Diagnostic Sessions</div>
                  <div className="text-[11px] text-muted-foreground">
                    Permit generation of 15-minute audited support tokens for tenant diagnostics.
                  </div>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Session Inactivity Timeout (Minutes)
                </label>
                <input
                  type="number"
                  value={form.sessionTimeoutMinutes}
                  onChange={(e) => setForm({ ...form, sessionTimeoutMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Max Failed Password Lockout Threshold
                </label>
                <input
                  type="number"
                  value={form.maxFailedAttempts}
                  onChange={(e) => setForm({ ...form, maxFailedAttempts: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono shadow-xs"
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

