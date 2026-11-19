"use client";

import api, { API_BASE_URL } from "@/lib/api";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  UserCheck,
  CheckCircle2,
  Clock,
  FileText,
  FileCheck,
  AlertCircle,
  Plus,
  Trash2,
  Search,
  Users,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Send,
  Loader2,
  Building2,
  Briefcase,
  FileSignature,
  ListChecks,
  Layers,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

interface OnboardingTask {
  id: string;
  title: string;
  description?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  requiredForActivation: boolean;
}

interface OnboardingDocument {
  id: string;
  name: string;
  category: string;
  status: "SUBMITTED" | "APPROVED" | "REJECTED";
  isSigned: boolean;
  fileUrl?: string;
}

interface OnboardingCase {
  id: string;
  companyId: string;
  employeeId: string;
  status: "INVITED" | "OFFER_ACCEPTED" | "IN_PROGRESS" | "PENDING_VERIFICATION" | "COMPLETED";
  offerSigned: boolean;
  bgvStatus: string;
  createdAt: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
    employeeCode?: string;
    joiningDate?: string;
    employmentStatus: string;
    profilePhoto?: string;
    bloodGroup?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    panNumber?: string;
    nationalId?: string;
    department?: { id: string; name: string };
    designation?: { id: string; name: string; color?: string };
    emergencyContacts?: any[];
  };
  template?: { id: string; name: string };
  tasks: OnboardingTask[];
  documents: OnboardingDocument[];
  metrics: {
    totalTasks: number;
    completedTasks: number;
    progressPercent: number;
    totalDocuments: number;
    verifiedDocuments: number;
  };
}

interface OnboardingTemplate {
  id: string;
  name: string;
  departmentId?: string;
  roleId?: string;
  taskChecklist: Array<{ title: string; description?: string; requiredForActivation?: boolean }>;
  documentChecklist: Array<{ name: string; category: string }>;
  _count?: { cases: number };
  createdAt: string;
}

export default function OnboardingPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pipeline" | "templates" | "my-onboarding">("pipeline");

  // HR Pipeline State
  const [cases, setCases] = useState<OnboardingCase[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCase, setSelectedCase] = useState<OnboardingCase | null>(null);
  const [caseDetailOpen, setCaseDetailOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Template State
  const [templates, setTemplates] = useState<OnboardingTemplate[]>([]);
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [taskDrafts, setTaskDrafts] = useState<Array<{ title: string; description: string; requiredForActivation: boolean }>>([
    { title: "Complete Profile & Contact Details", description: "Provide emergency contacts and address.", requiredForActivation: true },
    { title: "Digital Offer Letter Acceptance", description: "Sign digital employment agreement.", requiredForActivation: true },
    { title: "Upload KYC & ID Proof", description: "Submit passport or national identity proof.", requiredForActivation: true },
  ]);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Employee Self-Service State
  const [myCase, setMyCase] = useState<OnboardingCase | null>(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const apiUrl = API_BASE_URL;

  useEffect(() => {
    loadUserDataAndCases();
  }, []);

  async function loadUserDataAndCases() {
    setLoading(true);
    try {
      const token = localStorage.getItem("hrms_token");
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch current user profile
      const profileRes = await axios.get(`${apiUrl}/auth/me`, { headers });
      const user = profileRes.data;
      setCurrentUser(user);

      const isHrOrAdmin = ["SUPER_ADMIN", "ADMIN", "OWNER", "HR_HEAD", "MANAGER"].includes(user.role);

      if (isHrOrAdmin) {
        // Fetch HR Cases & Templates
        const [casesRes, templatesRes] = await Promise.all([
          axios.get(`${apiUrl}/onboarding/cases`, { headers }),
          axios.get(`${apiUrl}/onboarding/templates`, { headers }),
        ]);
        setCases(casesRes.data);
        setTemplates(templatesRes.data);
        setActiveTab("pipeline");
      }

      // Also fetch personal onboarding case if applicable
      try {
        const myCaseRes = await axios.get(`${apiUrl}/onboarding/me`, { headers });
        setMyCase(myCaseRes.data);
        if (!isHrOrAdmin) {
          setActiveTab("my-onboarding");
        }
      } catch (err) {
        // No self case or already regular employee
      }
    } catch (err) {
      console.error("Failed to load onboarding data", err);
    } finally {
      setLoading(false);
    }
  }

  // --- HR Actions ---

  async function handleUpdateCaseStatus(
    caseId: string,
    newStatus: string,
    bgvStatus?: string
  ) {
    setStatusUpdating(true);
    try {
      const token = localStorage.getItem("hrms_token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.patch(
        `${apiUrl}/onboarding/cases/${caseId}/status`,
        { status: newStatus, ...(bgvStatus && { bgvStatus }) },
        { headers }
      );

      // Refresh cases
      const res = await axios.get(`${apiUrl}/onboarding/cases`, { headers });
      setCases(res.data);

      if (selectedCase && selectedCase.id === caseId) {
        const updatedDetail = await axios.get(`${apiUrl}/onboarding/cases/${caseId}`, { headers });
        setSelectedCase(updatedDetail.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  }

  async function handleCreateTemplate() {
    if (!templateName.trim()) {
      alert("Please provide a template name");
      return;
    }
    setSavingTemplate(true);
    try {
      const token = localStorage.getItem("hrms_token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(
        `${apiUrl}/onboarding/templates`,
        {
          name: templateName,
          taskChecklist: taskDrafts.filter((t) => t.title.trim()),
          documentChecklist: [
            { name: "Government Photo ID (Aadhaar / Passport)", category: "KYC" },
            { name: "PAN Card Copy", category: "TAX" },
            { name: "Educational Degree Certificate", category: "EDUCATION" },
          ],
        },
        { headers }
      );

      setCreateTemplateOpen(false);
      setTemplateName("");
      const templatesRes = await axios.get(`${apiUrl}/onboarding/templates`, { headers });
      setTemplates(templatesRes.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create template");
    } finally {
      setSavingTemplate(false);
    }
  }

  async function handleDeleteTemplate(id: string) {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      const token = localStorage.getItem("hrms_token");
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${apiUrl}/onboarding/templates/${id}`, { headers });
      setTemplates(templates.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete template");
    }
  }

  // --- Employee Self-Service Actions ---

  async function handleSignOffer() {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("hrms_token");
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${apiUrl}/onboarding/me/sign-offer`, {}, { headers });
      setOfferModalOpen(false);
      const myCaseRes = await axios.get(`${apiUrl}/onboarding/me`, { headers });
      setMyCase(myCaseRes.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to sign offer");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleToggleMyTask(taskId: string, currentStatus: string) {
    try {
      const token = localStorage.getItem("hrms_token");
      const headers = { Authorization: `Bearer ${token}` };
      const isCompleted = currentStatus !== "COMPLETED";
      await axios.patch(
        `${apiUrl}/onboarding/me/tasks/${taskId}`,
        { isCompleted },
        { headers }
      );
      const myCaseRes = await axios.get(`${apiUrl}/onboarding/me`, { headers });
      setMyCase(myCaseRes.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update task");
    }
  }

  async function handleSubmitForVerification() {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("hrms_token");
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${apiUrl}/onboarding/me/submit`, {}, { headers });
      const myCaseRes = await axios.get(`${apiUrl}/onboarding/me`, { headers });
      setMyCase(myCaseRes.data);
      alert("Your onboarding dossier has been submitted for HR verification!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit verification");
    } finally {
      setActionLoading(false);
    }
  }

  const isHrOrAdmin = currentUser && ["SUPER_ADMIN", "OWNER", "HR_HEAD", "MANAGER"].includes(currentUser.role);

  // Filtered cases
  const filteredCases = cases.filter((c) => {
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const name = `${c.employee.firstName} ${c.employee.lastName}`.toLowerCase();
    const email = c.employee.email.toLowerCase();
    const code = (c.employee.employeeCode || "").toLowerCase();
    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      code.includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // KPI Calculations
  const totalActiveCases = cases.filter((c) => c.status !== "COMPLETED").length;
  const pendingVerificationCount = cases.filter((c) => c.status === "PENDING_VERIFICATION").length;
  const pendingOfferCount = cases.filter((c) => !c.offerSigned && c.status === "INVITED").length;
  const completedCount = cases.filter((c) => c.status === "COMPLETED").length;

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 px-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-2">
        <div className="space-y-4"> 
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <UserCheck className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white ">
              Employee Onboarding & Enrollment
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Track new joiner progress, verify KYC compliance, manage templates, and guide new hires to activation.
          </p>
        </div>

        {isHrOrAdmin && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCreateTemplateOpen(true)}
              variant="outline"
              className="border-slate-300"
            >
              <Layers className="mr-2 h-4 w-4" /> New Template
            </Button>
            <Link href="/workspace/employees">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="mr-2 h-4 w-4" /> Invite New Hire
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val: any) => setActiveTab(val)}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-3">
          {isHrOrAdmin && (
            <TabsTrigger value="pipeline" className="flex items-center gap-2">
              <ListChecks className="h-10 w-10" /> Pipeline
            </TabsTrigger>
          )}
          {isHrOrAdmin && (
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Layers className="h-10 w-10" /> Templates
            </TabsTrigger>
          )}
          <TabsTrigger value="my-onboarding" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" /> My Checklist
          </TabsTrigger>
        </TabsList>

        {/* ========================================================= */}
        {/* TAB 1: HR ONBOARDING PIPELINE */}
        {/* ========================================================= */}
        {isHrOrAdmin && (
          <TabsContent value="pipeline" className="space-y-6 pt-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Active In-Pipeline
                  </span>
                  <span className="rounded-md bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/30">
                    <Clock className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    {totalActiveCases}
                  </span>
                  <span className="text-xs text-slate-500">candidates</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                    Pending Verification
                  </span>
                  <span className="rounded-md bg-amber-50 p-2 text-amber-600 dark:bg-amber-900/30">
                    <AlertCircle className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    {pendingVerificationCount}
                  </span>
                  <span className="text-xs text-slate-500">ready for review</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                    Offer Pending
                  </span>
                  <span className="rounded-md bg-purple-50 p-2 text-purple-600 dark:bg-purple-900/30">
                    <FileSignature className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    {pendingOfferCount}
                  </span>
                  <span className="text-xs text-slate-500">awaiting signature</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    Activated / Completed
                  </span>
                  <span className="rounded-md bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-900/30">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    {completedCount}
                  </span>
                  <span className="text-xs text-slate-500">employees</span>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search candidates by name, email, or employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                {["ALL", "INVITED", "OFFER_ACCEPTED", "IN_PROGRESS", "PENDING_VERIFICATION", "COMPLETED"].map((st) => (
                  <Button
                    key={st}
                    variant={statusFilter === st ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(st)}
                    className={
                      statusFilter === st
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "text-slate-600 text-xs"
                    }
                  >
                    {st === "ALL" ? "All Cases" : st.replace("_", " ")}
                  </Button>
                ))}
              </div>
            </div>

            {/* Candidates Table / List */}
            {filteredCases.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-800">
                <Users className="h-10 w-10 text-slate-400" />
                <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
                  No onboarding cases found
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Invite employees to automatically start their onboarding journey.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredCases.map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-col gap-4 p-5 transition-colors hover:bg-slate-50/80 md:flex-row md:items-center md:justify-between dark:hover:bg-slate-800/40"
                    >
                      {/* Candidate Avatar & Details */}
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border border-slate-200">
                          <AvatarImage src={c.employee.profilePhoto || undefined} />
                          <AvatarFallback className="bg-emerald-100 font-bold text-emerald-700">
                            {c.employee.firstName[0]}
                            {c.employee.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {c.employee.firstName} {c.employee.lastName}
                            </span>
                            {c.employee.employeeCode && (
                              <Badge variant="outline" className="font-mono text-xs">
                                {c.employee.employeeCode}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>{c.employee.email}</span>
                            {c.employee.department && (
                              <>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                  <Building2 className="h-3 w-3" />
                                  {c.employee.department.name}
                                </span>
                              </>
                            )}
                            {c.employee.designation && (
                              <>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1">
                                  <Briefcase className="h-3 w-3" />
                                  {c.employee.designation.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Progress & Status Badges */}
                      <div className="flex flex-wrap items-center gap-6">
                        {/* Progress Bar */}
                        <div className="w-36">
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <span>Progress</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {c.metrics.progressPercent}%
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className="h-2 rounded-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${c.metrics.progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Offer Signed Status */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] uppercase font-semibold text-slate-400">
                            Offer Letter
                          </span>
                          {c.offerSigned ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none text-[11px]">
                              ✓ Signed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-300 text-[11px]">
                              Pending
                            </Badge>
                          )}
                        </div>

                        {/* Overall Case Stage Badge */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] uppercase font-semibold text-slate-400">
                            Stage
                          </span>
                          <Badge
                            className={
                              c.status === "COMPLETED"
                                ? "bg-emerald-500 text-white"
                                : c.status === "PENDING_VERIFICATION"
                                ? "bg-amber-500 text-white"
                                : c.status === "OFFER_ACCEPTED"
                                ? "bg-purple-500 text-white"
                                : "bg-blue-500 text-white"
                            }
                          >
                            {c.status.replace("_", " ")}
                          </Badge>
                        </div>

                        {/* View Dossier Action */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCase(c);
                            setCaseDetailOpen(true);
                          }}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        >
                          Review Dossier <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        )}

        {/* ========================================================= */}
        {/* TAB 2: TEMPLATE BUILDER */}
        {/* ========================================================= */}
        {isHrOrAdmin && (
          <TabsContent value="templates" className="space-y-6 pt-4 px-4">
            <div className="flex items-center justify-between px-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Onboarding Checklist Templates
                </h3>
                <p className="text-sm text-slate-500">
                  Standardize orientation tasks, document requirements, and compliance checklists across departments.
                </p>
              </div>
              <Button
                onClick={() => setCreateTemplateOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Create Template
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {tpl.name}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(tpl.id)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Checklist Tasks</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {Array.isArray(tpl.taskChecklist) ? tpl.taskChecklist.length : 0} items
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Required Documents</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {Array.isArray(tpl.documentChecklist) ? tpl.documentChecklist.length : 0} items
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Active Cases</span>
                        <Badge variant="outline" className="text-xs">
                          {tpl._count?.cases || 0} enrolled
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-3 text-[11px] text-slate-400 dark:border-slate-800">
                    Created {new Date(tpl.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        )}

        {/* ========================================================= */}
        {/* TAB 3: MY ONBOARDING (EMPLOYEE SELF-SERVICE) */}
        {/* ========================================================= */}
        <TabsContent value="my-onboarding" className="space-y-6 pt-4">
          {myCase ? (
            <div className="space-y-6">
              {/* Joiner Hero Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white shadow-lg">
                <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      Welcome to GlobizHR!
                    </div>
                    <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                      {myCase.employee.firstName}, let's get you set up!
                    </h2>
                    <p className="mt-1 text-sm text-emerald-100 max-w-xl">
                      Complete your digital onboarding checklist below to activate your corporate account and payroll profile.
                    </p>
                  </div>

                  {/* Progress Ring / Bar */}
                  <div className="flex flex-col items-center rounded-xl bg-white/10 p-4 backdrop-blur-md">
                    <span className="text-3xl font-black">
                      {myCase.metrics.progressPercent}%
                    </span>
                    <span className="text-xs text-emerald-100">
                      {myCase.metrics.completedTasks} of {myCase.metrics.totalTasks} Tasks Completed
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Core Steps Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Step 1: Offer Letter */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30">
                        <FileSignature className="h-5 w-5" />
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">
                          1. Digital Offer Letter
                        </h4>
                        <p className="text-xs text-slate-500">
                          Review terms and digitally sign your offer
                        </p>
                      </div>
                    </div>
                    {myCase.offerSigned ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-none">
                        ✓ Accepted
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setOfferModalOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Sign Offer
                      </Button>
                    )}
                  </div>
                </div>

                {/* Step 2: Statutory & Profile Info */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30">
                        <ShieldCheck className="h-5 w-5" />
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">
                          2. Statutory & Bank Profile
                        </h4>
                        <p className="text-xs text-slate-500">
                          Fill PAN, Aadhaar, and Bank Account details
                        </p>
                      </div>
                    </div>
                    <Link href="/workspace/profile">
                      <Button size="sm" variant="outline">
                        Edit Profile <ExternalLink className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Step 3: Interactive Task Checklist */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      3. Onboarding Tasks & Orientation
                    </h4>
                    <p className="text-xs text-slate-500">
                      Check off each item as you complete it
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {myCase.tasks.length} items
                  </Badge>
                </div>

                <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                  {myCase.tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleMyTask(task.id, task.status)}
                      className="flex cursor-pointer items-start gap-3 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <button
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                          task.status === "COMPLETED"
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 bg-white hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900"
                        }`}
                      >
                        {task.status === "COMPLETED" && <Check className="h-3.5 w-3.5" />}
                      </button>
                      <div className="flex-1">
                        <span
                          className={`text-sm font-medium ${
                            task.status === "COMPLETED"
                              ? "text-slate-400 line-through"
                              : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.description && (
                          <p className="text-xs text-slate-500">{task.description}</p>
                        )}
                      </div>
                      {task.requiredForActivation && (
                        <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200">
                          Mandatory
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>

                {/* Final Submit Button */}
                <div className="mt-6 flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                  <Button
                    onClick={handleSubmitForVerification}
                    disabled={actionLoading || myCase.status === "COMPLETED" || myCase.status === "PENDING_VERIFICATION"}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {myCase.status === "PENDING_VERIFICATION" ? (
                      <>
                        <Clock className="mr-2 h-4 w-4" /> Pending HR Verification
                      </>
                    ) : myCase.status === "COMPLETED" ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Onboarding Complete
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" /> Submit Dossier for Verification
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <h3 className="mt-3 text-base font-semibold text-slate-900">
                You are fully onboarded and active!
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                All employee records and requirements are in good standing.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ========================================================= */}
      {/* MODAL: HR CANDIDATE REVIEW DOSSIER */}
      {/* ========================================================= */}
      <Dialog open={caseDetailOpen} onOpenChange={setCaseDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedCase && (
            <div>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between text-xl">
                  <span>Candidate Onboarding Dossier</span>
                  <Badge
                    className={
                      selectedCase.status === "COMPLETED"
                        ? "bg-emerald-500 text-white"
                        : "bg-blue-500 text-white"
                    }
                  >
                    {selectedCase.status.replace("_", " ")}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Review candidate progress, verify KYC compliance, and approve employee activation.
                </DialogDescription>
              </DialogHeader>

              {/* Candidate Bio Header */}
              <div className="mt-4 flex items-center gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-emerald-100 font-bold text-emerald-700">
                    {selectedCase.employee.firstName[0]}
                    {selectedCase.employee.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {selectedCase.employee.firstName} {selectedCase.employee.lastName}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{selectedCase.employee.email}</span>
                    <span>•</span>
                    <span>ID: {selectedCase.employee.employeeCode || "Pending"}</span>
                  </div>
                </div>
              </div>

              {/* Checklist Progress */}
              <div className="mt-6 space-y-4">
                <h5 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Checklist Items ({selectedCase.metrics.completedTasks}/{selectedCase.metrics.totalTasks})
                </h5>
                <div className="space-y-2">
                  {selectedCase.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 text-sm dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        {task.status === "COMPLETED" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-slate-400" />
                        )}
                        <span className={task.status === "COMPLETED" ? "text-slate-800 font-medium" : "text-slate-500"}>
                          {task.title}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* BGV Status Control */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Background Verification (BGV) Status:
                </span>
                <div className="flex items-center gap-2">
                  {["PENDING", "PASSED", "WAIVED"].map((bgv) => (
                    <Button
                      key={bgv}
                      size="sm"
                      variant={selectedCase.bgvStatus === bgv ? "default" : "outline"}
                      onClick={() => handleUpdateCaseStatus(selectedCase.id, selectedCase.status, bgv)}
                      className="text-xs"
                    >
                      {bgv}
                    </Button>
                  ))}
                </div>
              </div>

              <DialogFooter className="mt-6 flex gap-2">
                <Button variant="outline" onClick={() => setCaseDetailOpen(false)}>
                  Close
                </Button>
                {selectedCase.status !== "COMPLETED" && (
                  <Button
                    onClick={() => handleUpdateCaseStatus(selectedCase.id, "COMPLETED")}
                    disabled={statusUpdating}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {statusUpdating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Approve & Activate Employee
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL: DIGITAL OFFER LETTER SIGNING */}
      {/* ========================================================= */}
      <Dialog open={offerModalOpen} onOpenChange={setOfferModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileSignature className="h-5 w-5 text-purple-600" />
              Digital Offer Letter Acknowledgment
            </DialogTitle>
            <DialogDescription>
              Please review the employment terms and digitally accept your offer.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600 space-y-2 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">
              Terms of Employment Acceptance:
            </p>
            <p>
              By clicking "Accept & Sign Digitally", you confirm your intent to join the company under the agreed compensation and designation terms outlined during your interview process.
            </p>
            <p>
              Your digital signature will record your timestamped IP and token acknowledgment as verified consent.
            </p>
          </div>

          <DialogFooter className="mt-6 flex gap-2">
            <Button variant="outline" onClick={() => setOfferModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSignOffer}
              disabled={actionLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Accept & Sign Digitally
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL: CREATE TEMPLATE */}
      {/* ========================================================= */}
      <Dialog open={createTemplateOpen} onOpenChange={setCreateTemplateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">Create Onboarding Template</DialogTitle>
            <DialogDescription>
              Configure default checklist tasks automatically assigned to new hires.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Template Name
              </label>
              <Input
                placeholder="e.g., Software Engineering Onboarding"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Checklist Tasks ({taskDrafts.length})
              </label>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {taskDrafts.map((task, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={task.title}
                      onChange={(e) => {
                        const next = [...taskDrafts];
                        next[idx].title = e.target.value;
                        setTaskDrafts(next);
                      }}
                      placeholder="Task Title..."
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setTaskDrafts(taskDrafts.filter((_, i) => i !== idx))}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setTaskDrafts([
                    ...taskDrafts,
                    { title: "", description: "", requiredForActivation: false },
                  ])
                }
                className="mt-2 text-xs text-emerald-600 hover:text-emerald-700"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Another Task
              </Button>
            </div>
          </div>

          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setCreateTemplateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTemplate}
              disabled={savingTemplate || !templateName.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {savingTemplate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
