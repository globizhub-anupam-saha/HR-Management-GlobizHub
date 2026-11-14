"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { employeesApi, API_BASE_URL } from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowLeft,
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  GraduationCap,
  ShieldAlert,
  Briefcase,
  LogOut,
  User,
  Mail,
  Building,
  FileText,
  IdCard,
  Phone,
  ExternalLink,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileSkeleton } from "@/components/skeletons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

const employeeEditSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["SUPER_ADMIN", "HR_HEAD", "OWNER", "MANAGER", "EMPLOYEE"]),
  reportingManagerId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  designationId: z.string().optional().nullable(),
  employeeCode: z.string().optional().nullable(),
  uanNumber: z.string().optional().nullable(),
  esicIpNumber: z.string().optional().nullable(),
  establishmentId: z.string().optional().nullable(),
});

type EmployeeEditFormValues = z.infer<typeof employeeEditSchema>;

export default function EmployeeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;
  const queryClient = useQueryClient();

  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states for supplementary tabs
  const [skillForm, setSkillForm] = useState({ name: "", proficiencyLevel: "INTERMEDIATE" });
  const [contactForm, setContactForm] = useState({ name: "", relationship: "", phone: "" });
  const [historyForm, setHistoryForm] = useState({
    companyName: "",
    jobTitle: "",
    startDate: "",
    endDate: "",
    reasonForLeaving: "",
  });
  const [exitForm, setExitForm] = useState({
    exitDate: "",
    reason: "RESIGNED",
    notes: "",
  });

  // State for dropdown options
  const [managers, setManagers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [establishments, setEstablishments] = useState<any[]>([]);

  // Fetch dropdown lookup data
  useEffect(() => {
    api
      .get("/employees")
      .then((res) => setManagers(res.data))
      .catch((err) => console.error("Failed to load managers", err));

    api
      .get("/organization/departments")
      .then((res) => setDepartments(res.data))
      .catch((err) => console.error("Failed to load departments", err));

    api
      .get("/organization/designations")
      .then((res) => setDesignations(res.data))
      .catch((err) => console.error("Failed to load designations", err));

    api
      .get("/payroll/statutory/establishments")
      .then((res) => setEstablishments(res.data))
      .catch((err) => console.error("Failed to load establishments", err));
  }, []);

  // Fetch full employee details
  const {
    data: employee,
    isLoading: isLoadingEmployee,
    refetch,
  } = useQuery({
    queryKey: ["employeeDetails", employeeId],
    queryFn: () => employeesApi.getById(employeeId),
    enabled: Boolean(employeeId),
  });

  const form = useForm<EmployeeEditFormValues>({
    resolver: zodResolver(employeeEditSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "EMPLOYEE",
      reportingManagerId: "none",
      departmentId: "none",
      designationId: "none",
      employeeCode: "",
      uanNumber: "",
      esicIpNumber: "",
      establishmentId: "none",
    },
  });

  // Populate edit form once employee data arrives
  useEffect(() => {
    if (employee) {
      const activeStatProfile = employee.statutoryProfiles?.[0];
      form.reset({
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
        role: employee.role || "EMPLOYEE",
        reportingManagerId: employee.reportingManagerId || employee.reportingManager?.id || "none",
        departmentId: employee.departmentId || employee.department?.id || "none",
        designationId: employee.designationId || employee.designation?.id || "none",
        employeeCode: employee.employeeCode || "",
        uanNumber: employee.uanNumber || activeStatProfile?.epfoUan || "",
        esicIpNumber: activeStatProfile?.esicIpNumber || "",
        establishmentId: activeStatProfile?.establishmentId || "none",
      });
    }
  }, [employee, form]);

  // Mutation: Update Employee Details
  const updateDetailsMutation = useMutation({
    mutationFn: async (values: EmployeeEditFormValues) => {
      const payload = {
        ...values,
        departmentId: values.departmentId === "none" || !values.departmentId ? null : values.departmentId,
        reportingManagerId: values.reportingManagerId === "none" || !values.reportingManagerId ? null : values.reportingManagerId,
        designationId: values.designationId === "none" || !values.designationId ? null : values.designationId,
        employeeCode: values.employeeCode ? values.employeeCode.trim() : null,
        uanNumber: values.uanNumber ? values.uanNumber.trim() : null,
        esicIpNumber: values.esicIpNumber ? values.esicIpNumber.trim() : null,
        establishmentId: values.establishmentId === "none" || !values.establishmentId ? null : values.establishmentId,
      };
      return await employeesApi.update(employeeId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employeeDetails", employeeId] });
      refetch();
      setFeedbackMessage({ type: "success", text: "Employee details updated successfully!" });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (error: any) => {
      setFeedbackMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update employee details",
      });
    },
  });

  // Mutation: Add Skill
  const addSkillMutation = useMutation({
    mutationFn: async (data: any) => {
      await employeesApi.addSkill(employeeId, data);
    },
    onSuccess: () => {
      refetch();
      setSkillForm({ name: "", proficiencyLevel: "INTERMEDIATE" });
      queryClient.invalidateQueries({ queryKey: ["employeeDetails", employeeId] });
      setFeedbackMessage({ type: "success", text: "Skill added successfully!" });
      setTimeout(() => setFeedbackMessage(null), 3000);
    },
    onError: (error: any) => {
      setFeedbackMessage({ type: "error", text: error.response?.data?.message || "Failed to add skill" });
    },
  });

  // Mutation: Delete Skill
  const deleteSkillMutation = useMutation({
    mutationFn: async (skillId: string) => {
      await employeesApi.removeSkill(employeeId, skillId);
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["employeeDetails", employeeId] });
      setFeedbackMessage({ type: "success", text: "Skill removed successfully!" });
      setTimeout(() => setFeedbackMessage(null), 3000);
    },
  });

  // Mutation: Add Emergency Contact
  const addContactMutation = useMutation({
    mutationFn: async (data: any) => {
      await employeesApi.addEmergencyContact(employeeId, data);
    },
    onSuccess: () => {
      refetch();
      setContactForm({ name: "", relationship: "", phone: "" });
      queryClient.invalidateQueries({ queryKey: ["employeeDetails", employeeId] });
      setFeedbackMessage({ type: "success", text: "Emergency contact added successfully!" });
      setTimeout(() => setFeedbackMessage(null), 3000);
    },
    onError: (error: any) => {
      setFeedbackMessage({ type: "error", text: error.response?.data?.message || "Failed to add contact" });
    },
  });

  // Mutation: Delete Emergency Contact
  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      await employeesApi.removeEmergencyContact(employeeId, contactId);
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["employeeDetails", employeeId] });
      setFeedbackMessage({ type: "success", text: "Emergency contact removed!" });
      setTimeout(() => setFeedbackMessage(null), 3000);
    },
  });

  // Mutation: Add Employment History
  const addHistoryMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post(`/employees/${employeeId}/history`, data);
    },
    onSuccess: () => {
      refetch();
      setHistoryForm({ companyName: "", jobTitle: "", startDate: "", endDate: "", reasonForLeaving: "" });
      queryClient.invalidateQueries({ queryKey: ["employeeDetails", employeeId] });
      setFeedbackMessage({ type: "success", text: "Employment history record added!" });
      setTimeout(() => setFeedbackMessage(null), 3000);
    },
    onError: (error: any) => {
      setFeedbackMessage({ type: "error", text: error.response?.data?.message || "Failed to record history" });
    },
  });

  // Mutation: Process Offboarding / Exit
  const exitMutation = useMutation({
    mutationFn: async (data: any) => {
      await employeesApi.processExit(employeeId, data);
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["employeeDetails", employeeId] });
      setFeedbackMessage({ type: "success", text: "Offboarding processed and access updated." });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (error: any) => {
      setFeedbackMessage({ type: "error", text: error.response?.data?.message || "Failed to process exit" });
    },
  });

  const getProfilePhotoUrl = (photoPath?: string) => {
    if (!photoPath) return "";
    if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
      return photoPath;
    }
    return `${API_BASE_URL}${photoPath}`;
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName) return "E";
    return `${firstName.charAt(0)}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getBadgeStyle = (role: string, designationColor?: string) => {
    if (designationColor) {
      return {
        backgroundColor: `${designationColor}15`,
        color: designationColor,
        borderColor: `${designationColor}30`,
      };
    }
    const roleColors: Record<string, string> = {
      SUPER_ADMIN: "#EA580C",
      HR_HEAD: "#DB2777",
      OWNER: "#7C3AED",
      MANAGER: "#2563EB",
      EMPLOYEE: "#059669",
    };
    const color = roleColors[role] || "#4B5563";
    return {
      backgroundColor: `${color}15`,
      color: color,
      borderColor: `${color}30`,
    };
  };

  if (isLoadingEmployee) {
    return <ProfileSkeleton />;
  }

  if (!employee) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-2xl font-bold text-foreground">Employee Not Found</h2>
        <p className="text-muted-foreground">The requested employee could not be found or you do not have permission.</p>
        <Link href="/workspace/employees">
          <Button variant="outline" className="mt-2">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  const roleBadgeStyle = getBadgeStyle(employee.role, employee.designation?.color);
  const designationName = employee.designation?.name || employee.role?.replace("_", " ").toLowerCase();

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Navigation & Back Link */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link
          href="/workspace/employees"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Employee Directory
        </Link>

        <div className="flex items-center gap-3">
          <Link href={`/workspace/employees/${employeeId}/documents`}>
            <Button variant="outline" size="sm" className="gap-2 border-border shadow-sm cursor-pointer">
              <FileText className="h-4 w-4 text-primary" />
              Employee Documents
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Button>
          </Link>
          <a href={`mailto:${employee.email}`}>
            <Button variant="secondary" size="sm" className="gap-2 cursor-pointer">
              <Mail className="h-4 w-4" />
              Email Employee
            </Button>
          </a>
        </div>
      </div>

      {/* Profile Header Hero Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-background shadow-md shrink-0">
            <AvatarImage
              src={getProfilePhotoUrl(employee.profilePhoto)}
              alt={`${employee.firstName} ${employee.lastName}`}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/20 text-foreground font-bold text-2xl">
              {getInitials(employee.firstName, employee.lastName)}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">
                {employee.firstName} {employee.lastName}
              </h1>
              <span
                className="px-3 py-0.5 rounded-full text-xs font-semibold border capitalize"
                style={roleBadgeStyle}
              >
                {designationName}
              </span>
              {employee.employmentStatus && (
                <Badge variant="outline" className="text-[11px] font-mono tracking-wider uppercase">
                  {employee.employmentStatus}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs md:text-sm text-muted-foreground pt-1">
              <div className="flex items-center gap-1.5">
                <IdCard className="h-4 w-4 text-muted-foreground/70 shrink-0" />
                <span className="font-semibold text-foreground/80">ID:</span>
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded border border-border text-foreground text-xs">
                  {employee.employeeCode || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Mail className="h-4 w-4 text-muted-foreground/70 shrink-0" />
                <span className="truncate">{employee.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building className="h-4 w-4 text-muted-foreground/70 shrink-0" />
                <span>{employee.department?.name || "Unassigned Dept"}</span>
              </div>
              {employee.reportingManager && (
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-muted-foreground/70 shrink-0" />
                  <span>
                    Manager: <strong className="text-foreground">{employee.reportingManager.firstName} {employee.reportingManager.lastName}</strong>
                  </span>
                </div>
              )}

              {/* UAN & ESIC Header Badges */}
              <div className="flex items-center gap-2">
                <span className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 text-[11px] font-mono">
                  UAN: {employee.uanNumber || employee.statutoryProfiles?.[0]?.epfoUan || "Not Added"}
                </span>
                <span className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 text-[11px] font-mono">
                  ESIC: {employee.statutoryProfiles?.[0]?.esicIpNumber || "Not Added"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedbackMessage && (
          <div
            className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-sm font-medium border ${
              feedbackMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }`}
          >
            {feedbackMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
        )}
      </div>

      {/* Main Tabs Container */}
      <Tabs defaultValue="details" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-12 bg-muted/40 p-1 rounded-xl border border-border">
          <TabsTrigger value="details" className="rounded-lg font-medium text-xs sm:text-sm">
            <User className="h-4 w-4 mr-1.5" /> Details & Role
          </TabsTrigger>
          <TabsTrigger value="skills" className="rounded-lg font-medium text-xs sm:text-sm">
            <GraduationCap className="h-4 w-4 mr-1.5" /> Skills
          </TabsTrigger>
          <TabsTrigger value="contacts" className="rounded-lg font-medium text-xs sm:text-sm">
            <ShieldAlert className="h-4 w-4 mr-1.5" /> Emergency
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg font-medium text-xs sm:text-sm">
            <Briefcase className="h-4 w-4 mr-1.5" /> History
          </TabsTrigger>
          <TabsTrigger value="exit" className="rounded-lg font-medium text-xs sm:text-sm text-destructive data-[state=active]:text-destructive">
            <LogOut className="h-4 w-4 mr-1.5" /> Offboarding
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: DETAILS & ROLE (EDIT FORM) */}
        {/* ========================================================================= */}
        <TabsContent value="details" className="space-y-6 focus-visible:outline-none">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => updateDetailsMutation.mutate(v))} className="space-y-6">
              
              {/* SECTION: Personal Information */}
              <Card className="border-border shadow-sm rounded-2xl">
                <CardHeader className="border-b border-border bg-muted/20 pb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-base font-bold text-foreground">Personal Information</CardTitle>
                      <CardDescription className="text-xs">Update legal name and work contact information.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-foreground">First Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-10 rounded-lg bg-card border-border" placeholder="e.g. John" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-foreground">Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-10 rounded-lg bg-card border-border" placeholder="e.g. Doe" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-foreground">Work Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                            <Input {...field} type="email" className="pl-9 h-10 rounded-lg bg-card border-border" placeholder="john.doe@company.com" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employeeCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-foreground">Employee ID</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                              className="pl-9 h-10 rounded-lg bg-card border-border font-mono uppercase"
                              placeholder="e.g. EMP-HR-001"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* SECTION: Organization & Hierarchy */}
              <Card className="border-border shadow-sm rounded-2xl">
                <CardHeader className="border-b border-border bg-muted/20 pb-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-base font-bold text-foreground">Organization & Hierarchy</CardTitle>
                      <CardDescription className="text-xs">Configure system permissions, team assignment, and reporting structure.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-foreground">System Access Role</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="h-10 rounded-lg bg-card border-border">
                              <SelectValue placeholder="Select system role">
                                {(val) => {
                                  const rolesMap: Record<string, string> = {
                                    SUPER_ADMIN: "Super Admin",
                                    HR_HEAD: "HR Head / Admin",
                                    OWNER: "Owner",
                                    MANAGER: "Manager",
                                    EMPLOYEE: "Standard Employee",
                                  };
                                  return rolesMap[val as string] || val;
                                }}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                            <SelectItem value="HR_HEAD">HR Head / Admin</SelectItem>
                            <SelectItem value="OWNER">Owner</SelectItem>
                            <SelectItem value="MANAGER">Manager</SelectItem>
                            <SelectItem value="EMPLOYEE">Standard Employee</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="departmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-foreground">Department</FormLabel>
                        <Select value={field.value || "none"} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="h-10 rounded-lg bg-card border-border">
                              <SelectValue placeholder="Select department">
                                {(val) => {
                                  if (val === "none" || !val) return "Unassigned / None";
                                  return departments.find((d) => d.id === val)?.name || val;
                                }}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Unassigned / None</SelectItem>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="designationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-foreground">Designation / Title</FormLabel>
                        <Select value={field.value || "none"} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="h-10 rounded-lg bg-card border-border">
                              <SelectValue placeholder="Select designation">
                                {(val) => {
                                  if (val === "none" || !val) return "Unassigned / None";
                                  return designations.find((d) => d.id === val)?.name || val;
                                }}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Unassigned / None</SelectItem>
                            {designations.map((designation) => (
                              <SelectItem key={designation.id} value={designation.id}>
                                {designation.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reportingManagerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-foreground">Reporting Manager</FormLabel>
                        <Select value={field.value || "none"} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="h-10 rounded-lg bg-card border-border">
                              <SelectValue placeholder="Select reporting manager">
                                {(val) => {
                                  if (val === "none" || !val) return "No Manager";
                                  const mgr = managers.find((m) => m.id === val);
                                  return mgr ? `${mgr.firstName} ${mgr.lastName} (${mgr.role.replace("_", " ").toLowerCase()})` : val;
                                }}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No Manager</SelectItem>
                            {managers
                              .filter((m) => m.id !== employeeId)
                              .map((mgr) => (
                                <SelectItem key={mgr.id} value={mgr.id}>
                                  {mgr.firstName} {mgr.lastName} ({mgr.role.replace("_", " ").toLowerCase()})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* SECTION: Statutory Compliance (EPFO & ESIC) */}
              <Card className="border-border shadow-sm rounded-2xl">
                <CardHeader className="border-b border-border bg-muted/20 pb-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-indigo-600" />
                    <div>
                      <CardTitle className="text-base font-bold text-foreground">Statutory Compliance (EPFO & ESIC)</CardTitle>
                      <CardDescription className="text-xs">
                        Configure Indian statutory compliance numbers for monthly return filings and challans. (Optional for new joiners)
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <FormField
                    control={form.control}
                    name="establishmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-foreground">Registered Establishment</FormLabel>
                        <Select value={field.value || "none"} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="h-10 rounded-lg bg-card border-border">
                              <SelectValue placeholder="Select establishment">
                                {(val) => {
                                  if (val === "none" || !val) return "Default Establishment";
                                  return establishments.find((e) => e.id === val)?.name || val;
                               }}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Default Establishment</SelectItem>
                            {establishments.map((est) => (
                              <SelectItem key={est.id} value={est.id}>
                                {est.name} ({est.epfoEstablishmentCode || "No EPFO Code"})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="uanNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-foreground">EPFO UAN Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            maxLength={12}
                            className="h-10 rounded-lg bg-card border-border font-mono text-xs"
                            placeholder="12-digit UAN (Optional)"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="esicIpNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-foreground">ESIC IP Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            maxLength={17}
                            className="h-10 rounded-lg bg-card border-border font-mono text-xs"
                            placeholder="10-digit / 17-digit IP (Optional)"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Save Action Button */}
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={updateDetailsMutation.isPending}
                  className="h-11 px-8 rounded-xl font-semibold shadow-sm gap-2 cursor-pointer"
                >
                  {updateDetailsMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Employee Details
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: SKILLS & CERTIFICATIONS */}
        {/* ========================================================================= */}
        <TabsContent value="skills" className="space-y-6 focus-visible:outline-none">
          <Card className="border-border shadow-sm rounded-2xl">
            <CardHeader className="border-b border-border bg-muted/20">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Skills & Competencies
              </CardTitle>
              <CardDescription className="text-xs">
                Track technical skills, languages, and certifications for project allocation and role matching.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Existing Skills List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Skills</h4>
                {!employee?.skills?.length ? (
                  <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground text-sm">
                    No skills recorded for this employee yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {employee.skills.map((skill: any) => (
                      <div
                        key={skill.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30 shadow-xs hover:border-primary/40 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-sm text-foreground truncate">{skill.name}</p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 capitalize">
                            {skill.proficiencyLevel.toLowerCase()}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-lg shrink-0"
                          onClick={() => deleteSkillMutation.mutate(skill.id)}
                          disabled={deleteSkillMutation.isPending}
                          title="Delete skill"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Skill Form */}
              <div className="bg-muted/40 p-5 rounded-xl border border-border space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Add New Skill</h4>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Skill / Certification Name</label>
                    <Input
                      placeholder="e.g. React.js, TypeScript, AWS Solutions Architect"
                      className="h-10 rounded-lg bg-card border-border"
                      value={skillForm.name}
                      onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                    />
                  </div>
                  <div className="w-full sm:w-48 space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Proficiency Level</label>
                    <select
                      className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      value={skillForm.proficiencyLevel}
                      onChange={(e) => setSkillForm({ ...skillForm, proficiencyLevel: e.target.value })}
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                  </div>
                  <Button
                    onClick={() => addSkillMutation.mutate(skillForm)}
                    disabled={!skillForm.name || addSkillMutation.isPending}
                    className="h-10 px-5 rounded-lg font-semibold gap-1.5 cursor-pointer shrink-0"
                  >
                    {addSkillMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Add Skill
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: EMERGENCY CONTACTS */}
        {/* ========================================================================= */}
        <TabsContent value="contacts" className="space-y-6 focus-visible:outline-none">
          <Card className="border-border shadow-sm rounded-2xl">
            <CardHeader className="border-b border-border bg-muted/20">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
                Emergency Contacts
              </CardTitle>
              <CardDescription className="text-xs">
                Designated emergency contacts to reach in case of urgent incidents or medical emergencies.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Existing Contacts List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Registered Contacts</h4>
                {!employee?.emergencyContacts?.length ? (
                  <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground text-sm">
                    No emergency contacts registered yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {employee.emergencyContacts.map((contact: any) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30 shadow-xs hover:border-primary/40 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">{contact.name}</span>
                            <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                              {contact.relationship}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                            <Phone className="h-3 w-3 text-muted-foreground/70" />
                            <span>{contact.phone}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-lg shrink-0"
                          onClick={() => deleteContactMutation.mutate(contact.id)}
                          disabled={deleteContactMutation.isPending}
                          title="Delete contact"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Emergency Contact Form */}
              <div className="bg-muted/40 p-5 rounded-xl border border-border space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Add Emergency Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Contact Full Name</label>
                    <Input
                      placeholder="e.g. Jane Doe"
                      className="h-10 rounded-lg bg-card border-border"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Relationship</label>
                    <Input
                      placeholder="e.g. Spouse, Parent, Sibling"
                      className="h-10 rounded-lg bg-card border-border"
                      value={contactForm.relationship}
                      onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Phone Number</label>
                    <Input
                      placeholder="e.g. +1 555-0199"
                      className="h-10 rounded-lg bg-card border-border"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <Button
                    onClick={() => addContactMutation.mutate(contactForm)}
                    disabled={!contactForm.name || !contactForm.phone || addContactMutation.isPending}
                    className="h-10 px-5 rounded-lg font-semibold gap-1.5 cursor-pointer"
                  >
                    {addContactMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Add Emergency Contact
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 4: EMPLOYMENT HISTORY */}
        {/* ========================================================================= */}
        <TabsContent value="history" className="space-y-6 focus-visible:outline-none">
          <Card className="border-border shadow-sm rounded-2xl">
            <CardHeader className="border-b border-border bg-muted/20">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Employment History
              </CardTitle>
              <CardDescription className="text-xs">
                Log prior job titles, organizations, and tenure records.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Add History Form */}
              <div className="bg-muted/40 p-5 rounded-xl border border-border space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Record Past Employment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Company Name</label>
                    <Input
                      placeholder="e.g. Acme Corp"
                      className="h-10 rounded-lg bg-card border-border"
                      value={historyForm.companyName}
                      onChange={(e) => setHistoryForm({ ...historyForm, companyName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Job Title</label>
                    <Input
                      placeholder="e.g. Senior Frontend Engineer"
                      className="h-10 rounded-lg bg-card border-border"
                      value={historyForm.jobTitle}
                      onChange={(e) => setHistoryForm({ ...historyForm, jobTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Start Date</label>
                    <Input
                      type="date"
                      className="h-10 rounded-lg bg-card border-border"
                      value={historyForm.startDate}
                      onChange={(e) => setHistoryForm({ ...historyForm, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">End Date (Optional)</label>
                    <Input
                      type="date"
                      className="h-10 rounded-lg bg-card border-border"
                      value={historyForm.endDate}
                      onChange={(e) => setHistoryForm({ ...historyForm, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Reason for Leaving / Role Summary</label>
                  <Input
                    placeholder="e.g. Career growth, relocation"
                    className="h-10 rounded-lg bg-card border-border"
                    value={historyForm.reasonForLeaving}
                    onChange={(e) => setHistoryForm({ ...historyForm, reasonForLeaving: e.target.value })}
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    onClick={() => addHistoryMutation.mutate(historyForm)}
                    disabled={!historyForm.companyName || !historyForm.jobTitle || !historyForm.startDate || addHistoryMutation.isPending}
                    className="h-10 px-5 rounded-lg font-semibold gap-1.5 cursor-pointer"
                  >
                    {addHistoryMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Record Employment History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 5: OFFBOARDING / EXIT */}
        {/* ========================================================================= */}
        <TabsContent value="exit" className="space-y-6 focus-visible:outline-none">
          <Card className="border-destructive/30 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-destructive/10 border-b border-destructive/20 pb-4">
              <CardTitle className="text-base font-bold text-destructive flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                Initiate Employee Offboarding & Exit
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Formalize employee departure, set official exit date, and archive access privileges.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Official Exit Date</label>
                  <Input
                    type="date"
                    className="h-10 rounded-lg bg-card border-border"
                    value={exitForm.exitDate}
                    onChange={(e) => setExitForm({ ...exitForm, exitDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Departure Reason</label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={exitForm.reason}
                    onChange={(e) => setExitForm({ ...exitForm, reason: e.target.value })}
                  >
                    <option value="RESIGNED">Resigned / Voluntary Separation</option>
                    <option value="TERMINATED">Terminated / Involuntary</option>
                    <option value="RETIRED">Retired</option>
                    <option value="CONTRACT_END">End of Contract</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">HR Exit Interview & Transition Notes (Optional)</label>
                <textarea
                  className="w-full rounded-lg border border-border bg-card p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[120px]"
                  placeholder="Record handover status, equipment return checklist, severance notes, or feedback from exit interview..."
                  value={exitForm.notes}
                  onChange={(e) => setExitForm({ ...exitForm, notes: e.target.value })}
                />
              </div>

              <div className="pt-2">
                <Button
                  variant="destructive"
                  className="w-full h-11 font-semibold rounded-xl cursor-pointer"
                  onClick={() => exitMutation.mutate(exitForm)}
                  disabled={!exitForm.exitDate || exitMutation.isPending}
                >
                  {exitMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing Offboarding...
                    </>
                  ) : (
                    "Process Exit & Finalize Offboarding"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}