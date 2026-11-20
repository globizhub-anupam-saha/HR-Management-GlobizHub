"use client";

// src/app/register/wizard/page.tsx

import { useSetupWizardStore } from "@/store/useSetupWizardStore";
import Step1CompanyInfo from "@/components/wizard/Step1CompanyInfo";
import Step2CompanySettings from "@/components/wizard/Step2CompanySettings";
import Step3HolidayCalendar from "@/components/wizard/Step3HolidayCalendar";
import Step4Departments from "@/components/wizard/Step4Departments";
import Step5Roles from "@/components/wizard/Step5Roles";
import Step6SalaryComponents from "@/components/wizard/Step6SalaryComponents";
import Step7LeavePolicies from "@/components/wizard/Step7LeavePolicies";
import Step8ShiftManagement from "@/components/wizard/Step8ShiftManagement";
import Step9Branches from "@/components/wizard/Step9Branches";
import Step10InviteEmployees from "@/components/wizard/Step10InviteEmployees";

import WizardProgressBar from "@/components/wizard/WizardProgressBar";
import Logo from "@/components/brand/Logo";
import Link from "next/link";

export default function SetupWizardPage() {
  const { currentStep } = useSetupWizardStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Official Brand Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <Logo variant="text-lockup" size="md" showTagline />
        </Link>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
          Setup Wizard
        </span>
      </div>

      {/* Dynamic 10-Step Progress Bar with 5 visible per screen & hidden scrollbar */}
      <div className="w-full max-w-4xl">
        <WizardProgressBar />
      </div>

      {/* Dynamic Form Content Container */}
      <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-sm border border-slate-100 relative">

        {/* STEP RENDERING */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Company Information</h2>
            <p className="text-slate-500 mb-8">Let's start by getting to know your organization and setting up the main administrator.</p>
            <Step1CompanyInfo />
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Company Settings</h2>
            <p className="text-slate-500 mb-8">Configure your organization's default working hours, attendance method, and branding.</p>
            <Step2CompanySettings />
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Holiday Calendar</h2>
            <p className="text-slate-500 mb-8">Choose a base holiday calendar for your company. You can always add or remove specific holidays later.</p>
            <Step3HolidayCalendar />
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Organization Structure</h2>
            <p className="text-slate-500 mb-8">Let's set up the core departments for your company.</p>
            <Step4Departments />
          </div>
        )}

        {currentStep === 5 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Designations & Roles</h2>
            <p className="text-slate-500 mb-8">Let's set up the core job titles for your team members.</p>
            <Step5Roles />
          </div>
        )}

        {currentStep === 6 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Salary Structure</h2>
            <p className="text-slate-500 mb-8">Define the default components used to calculate employee payroll.</p>
            <Step6SalaryComponents />
          </div>
        )}

        {currentStep === 7 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Leave Policies</h2>
            <p className="text-slate-500 mb-8">Set up the default leave and time-off policies for your organization.</p>
            <Step7LeavePolicies />
          </div>
        )}

        {currentStep === 8 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Shift Types</h2>
            <p className="text-slate-500 mb-8">Define the working shifts available across your organization.</p>
            <Step8ShiftManagement />
          </div>
        )}

        {currentStep === 9 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Branches & Locations</h2>
            <p className="text-slate-500 mb-8">Set up the physical and virtual offices for your organization.</p>
            <Step9Branches />
          </div>
        )}

        {currentStep === 10 && (
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Bring your team on board</h2>
            <p className="text-slate-500 mb-8">Invite your employees now, or skip this step and add them later from the dashboard.</p>
            <Step10InviteEmployees />
          </div>
        )}

      </div>
    </div>
  );
}