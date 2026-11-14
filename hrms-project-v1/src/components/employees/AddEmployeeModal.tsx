"use client";
import api, { employeesApi } from "@/lib/api";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useEffect } from "react";

// Validation schema for adding an employee
const addEmployeeSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Please select a role"),
  reportingManagerId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  uanNumber: z.string().optional().nullable(),
  esicIpNumber: z.string().optional().nullable(),
  establishmentId: z.string().optional().nullable(),
});

export function AddEmployeeModal() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managers, setManagers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [establishments, setEstablishments] = useState<any[]>([]);

  const form = useForm<z.infer<typeof addEmployeeSchema>>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      reportingManagerId: "",
      departmentId: "",
      uanNumber: "",
      esicIpNumber: "",
      establishmentId: "",
    },
  });

  useEffect(() => {
    if (open) {
      api.get("/employees")
        .then((res) => setManagers(res.data))
        .catch((err) => console.error("Failed to load employees for managers list", err));

      api.get("/organization/departments")
        .then((res) => setDepartments(res.data))
        .catch((err) => console.error("Failed to load departments", err));

      api.get("/payroll/statutory/establishments")
        .then((res) => setEstablishments(res.data))
        .catch((err) => console.error("Failed to load establishments", err));
    }
  }, [open]);

  async function onSubmit(values: z.infer<typeof addEmployeeSchema>) {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        departmentId: values.departmentId === "none" || !values.departmentId ? null : values.departmentId,
        reportingManagerId: values.reportingManagerId === "none" || !values.reportingManagerId ? null : values.reportingManagerId,
        establishmentId: values.establishmentId === "none" || !values.establishmentId ? null : values.establishmentId,
        uanNumber: values.uanNumber ? values.uanNumber.trim() : null,
        esicIpNumber: values.esicIpNumber ? values.esicIpNumber.trim() : null,
      };

      // Send the data using centralized employeesApi
      await employeesApi.invite(payload);
      
      setOpen(false);
      form.reset();
      
      alert("Invitation sent! The candidate has been added to the Onboarding Pipeline and will appear in the Employee Directory once onboarding is completed.");
      window.location.reload(); 
      
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to add employee");
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-[10px] bg-primary px-3.5 text-[14px] font-medium whitespace-nowrap text-primary-foreground transition-all hover:bg-primary/90 apple-shadow-sm active:scale-[0.98]">
          <UserPlus className="mr-2 h-4 w-4" /> Add Employee
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite New Candidate</DialogTitle>
          <DialogDescription>
            Enter candidate details. They will be added to the Onboarding Pipeline and activated in the directory upon completion.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
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
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@company.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a role">
                          {(value) => {
                            const rolesMap: Record<string, string> = {
                              EMPLOYEE: "Standard Employee",
                              HR_HEAD: "HR Admin",
                              MANAGER: "Manager",
                              SUPER_ADMIN: "Super Admin",
                              OWNER: "Owner",
                            };
                            return rolesMap[value as string] || value;
                          }}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EMPLOYEE">Standard Employee</SelectItem>
                      <SelectItem value="HR_HEAD">HR Admin</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
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
                  <FormLabel>Department</FormLabel>
                  <Select key={`dept-${departments.length}`} onValueChange={field.onChange} value={field.value || "none"}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a department (Optional)">
                          {(value) => {
                            if (value === "none" || !value) return "None";
                            return departments.find((d) => d.id === value)?.name || value;
                          }}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
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
                  <FormLabel>Reporting Manager</FormLabel>
                  <Select key={`mgr-${managers.length}`} onValueChange={field.onChange} value={field.value || "none"}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a manager (Optional)">
                          {(value) => {
                            if (value === "none" || !value) return "None";
                            const mgr = managers.find((m) => m.id === value);
                            return mgr
                              ? `${mgr.firstName} ${mgr.lastName} (${mgr.role.replace("_", " ").toLowerCase()})`
                              : value;
                          }}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {managers.map((mgr) => (
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

            {/* Statutory Compliance Details */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Statutory Compliance (PF & ESI)
                </p>
                <span className="text-[11px] text-slate-400 font-normal">Optional for new joiners</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                If the employee is fresh/new and has not been allotted UAN or ESIC IP numbers yet, you can leave these blank. Either you or the employee can add them at any time after onboarding.
              </p>

              {establishments.length > 0 && (
                <FormField
                  control={form.control}
                  name="establishmentId"
                  render={({ field }) => (
                    <FormItem className="mb-3">
                      <FormLabel className="text-xs">Registered Establishment</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "none"}>
                        <FormControl>
                          <SelectTrigger className="w-full text-xs">
                            <SelectValue placeholder="Assign Establishment (Optional)">
                              {(value) => {
                                if (value === "none" || !value) return "Default Establishment";
                                const est = establishments.find((e) => e.id === value);
                                return est?.name || value;
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
              )}

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="uanNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">EPFO UAN</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="12-digit UAN"
                          maxLength={12}
                          value={field.value || ""}
                          onChange={field.onChange}
                          className="text-xs font-mono"
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
                      <FormLabel className="text-xs">ESIC IP Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="IP / ESI Number"
                          maxLength={17}
                          value={field.value || ""}
                          onChange={field.onChange}
                          className="text-xs font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" variant="default" size="default" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Invite...
                  </>
                ) : (
                  "Send Invitation"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
