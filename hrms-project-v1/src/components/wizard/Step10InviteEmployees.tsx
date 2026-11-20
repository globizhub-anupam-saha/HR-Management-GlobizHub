"use client";

import api, { API_BASE_URL } from "@/lib/api";
// src/components/wizard/Step10InviteEmployees.tsx

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSetupWizardStore, WizardInvitedEmployee } from "@/store/useSetupWizardStore";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Upload,
  FileSpreadsheet,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Search,
  Users,
  Download,
  X,
  UserCheck,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  parseEmployeeFile,
  ParsedEmployeeRow,
  ParseResult,
  downloadSampleCsvTemplate,
  downloadSampleExcelTemplate,
} from "@/lib/bulkEmployeeParser";

const step10Schema = z.object({
  inviteEmails: z.string().optional(),
});

export default function Step10InviteEmployees() {
  const { formData, updateFormData, prevStep } = useSetupWizardStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // File Inputs
  const excelInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Preview Dialog State
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<ParseResult | null>(null);
  const [previewRows, setPreviewRows] = useState<ParsedEmployeeRow[]>([]);
  const [searchFilter, setSearchFilter] = useState("");

  const form = useForm<z.infer<typeof step10Schema>>({
    resolver: zodResolver(step10Schema),
    defaultValues: {
      inviteEmails: formData.inviteEmails || "",
    },
  });

  const importedEmployees = formData.invitedEmployees || [];

  // Handle File Selection
  async function handleFileProcess(file: File) {
    setIsParsing(true);
    setParseError(null);
    try {
      const result = await parseEmployeeFile(file);
      setPreviewData(result);
      setPreviewRows(result.rows);
      setSearchFilter("");
      setPreviewOpen(true);
    } catch (err: any) {
      console.error("Failed to parse file:", err);
      setParseError(err.message || "Failed to parse the uploaded file.");
    } finally {
      setIsParsing(false);
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
    // reset input value so re-uploading the same file triggers onChange
    e.target.value = "";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const name = file.name.toLowerCase();
      if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")) {
        handleFileProcess(file);
      } else {
        setParseError("Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file.");
      }
    }
  }

  function handleRemovePreviewRow(rowId: string) {
    setPreviewRows((prev) => prev.filter((r) => r.id !== rowId));
  }

  function handleConfirmImport(onlyValid = true) {
    const rowsToImport = previewRows.filter((r) => (onlyValid ? r.isValid : true));
    const convertedEmployees: WizardInvitedEmployee[] = rowsToImport.map((r) => ({
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      phone: r.phone || undefined,
      department: r.department || undefined,
      designation: r.designation || undefined,
      role: r.role || "EMPLOYEE",
    }));

    updateFormData({
      invitedEmployees: convertedEmployees,
    });

    setPreviewOpen(false);
  }

  function handleClearImported() {
    updateFormData({
      invitedEmployees: [],
    });
  }

  function handleViewExistingRoster() {
    // Open preview dialog with currently imported employees
    const rows: ParsedEmployeeRow[] = importedEmployees.map((emp, idx) => ({
      id: `existing-${idx}`,
      firstName: emp.firstName || "",
      lastName: emp.lastName || "",
      email: emp.email,
      phone: emp.phone || "",
      department: emp.department || "",
      designation: emp.designation || "",
      role: emp.role || "EMPLOYEE",
      isValid: true,
    }));

    setPreviewData({
      rows,
      totalCount: rows.length,
      validCount: rows.length,
      invalidCount: 0,
      fileName: "Imported Employee Directory",
      fileSize: 0,
    });
    setPreviewRows(rows);
    setSearchFilter("");
    setPreviewOpen(true);
  }

  // Filter preview rows
  const filteredPreviewRows = previewRows.filter((r) => {
    const q = searchFilter.toLowerCase();
    return (
      r.firstName.toLowerCase().includes(q) ||
      r.lastName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.designation.toLowerCase().includes(q)
    );
  });

  const validRowCount = previewRows.filter((r) => r.isValid).length;
  const invalidRowCount = previewRows.filter((r) => !r.isValid).length;

  // THE REAL API CALL
  async function onSubmit(values: z.infer<typeof step10Schema>) {
    setIsSubmitting(true);
    updateFormData(values);

    // Combine Zustand data with form values and imported employees
    const finalPayload = {
      ...formData,
      ...values,
      invitedEmployees: formData.invitedEmployees || [],
    };

    try {
      const apiUrl = API_BASE_URL;
      const response = await axios.post(`${apiUrl}/auth/register`, finalPayload);

      // Save JWT token
      localStorage.setItem("hrms_token", response.data.access_token);

      // Clean redirect to initialize all authentication context & dashboard state
      window.location.href = "/workspace/dashboard";
    } catch (error: any) {
      console.error("Registration failed:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Registration failed. Check the console.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={excelInputRef}
        onChange={handleFileInputChange}
        accept=".xlsx, .xls"
        className="hidden"
      />
      <input
        type="file"
        ref={csvInputRef}
        onChange={handleFileInputChange}
        accept=".csv"
        className="hidden"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* EMAIL INVITE BOX */}
            <div className="space-y-4 p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-emerald-600 mb-2">
                  <Mail className="h-5 w-5" />
                  <h3 className="font-bold text-slate-900">Invite via Email</h3>
                </div>
                <p className="text-sm text-slate-500 mb-4">
                  Enter email addresses separated by commas or line breaks. We will send them a secure invitation to join your workspace.
                </p>

                <FormField
                  control={form.control}
                  name="inviteEmails"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="john@acmecorp.com, sarah@acmecorp.com..."
                          className="min-h-[140px] resize-none text-sm font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-2 text-xs text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>You can combine both manual emails and bulk file upload.</span>
              </div>
            </div>

            {/* BULK UPLOAD BOX */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-6 rounded-xl border-2 border-dashed transition-all flex flex-col justify-between items-center text-center ${
                isDragging
                  ? "border-emerald-500 bg-emerald-50/60 scale-[1.01]"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
              }`}
            >
              <div className="w-full flex flex-col items-center">
                <div className="h-11 w-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Bulk Employee Upload</h3>
                <p className="text-sm text-slate-500 mb-4 max-w-xs">
                  Import your complete employee directory from Excel (.xlsx, .xls) or CSV (.csv).
                </p>

                {/* Parsing Status or Error */}
                {isParsing && (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Parsing employee file...
                  </div>
                )}

                {parseError && (
                  <div className="w-full mb-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2 text-left">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{parseError}</span>
                  </div>
                )}

                {/* ACTIVE IMPORTED SUMMARY */}
                {importedEmployees.length > 0 ? (
                  <div className="w-full bg-white border border-emerald-200 rounded-xl p-4 mb-4 text-left shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                          Ready for Onboarding
                        </span>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                        {importedEmployees.length} {importedEmployees.length === 1 ? "Employee" : "Employees"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mb-3">
                      Directory parsed and ready. Team members will receive invitation emails with access links once workspace setup finishes.
                    </p>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleViewExistingRoster}
                        className="flex-1 text-xs h-8 border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                        Review Roster
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleClearImported}
                        className="text-xs h-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Clear
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* UPLOAD BUTTONS */
                  <div className="grid grid-cols-2 gap-3 w-full mb-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => excelInputRef.current?.click()}
                      disabled={isParsing}
                      className="bg-white border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 transition-all cursor-pointer h-10 text-xs font-semibold"
                    >
                      <FileSpreadsheet className="mr-1.5 h-4 w-4 text-emerald-600" />
                      Excel File
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => csvInputRef.current?.click()}
                      disabled={isParsing}
                      className="bg-white border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700 transition-all cursor-pointer h-10 text-xs font-semibold"
                    >
                      <FileText className="mr-1.5 h-4 w-4 text-blue-600" />
                      CSV File
                    </Button>
                  </div>
                )}
              </div>

              {/* SAMPLE TEMPLATES DOWNLOAD */}
              <div className="pt-2 border-t border-slate-200/80 w-full flex items-center justify-center gap-3 text-xs text-slate-500">
                <span className="font-medium text-slate-400">Download Template:</span>
                <button
                  type="button"
                  onClick={downloadSampleExcelTemplate}
                  className="text-emerald-600 hover:text-emerald-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="h-3 w-3" /> Excel (.xlsx)
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={downloadSampleCsvTemplate}
                  className="text-emerald-600 hover:text-emerald-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="h-3 w-3" /> CSV (.csv)
                </button>
              </div>
            </div>
          </div>

          {/* FINAL SUBMIT BUTTONS */}
          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center border-t border-slate-100 gap-4">
            <div className="text-xs text-slate-400">
              {importedEmployees.length > 0 ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <UserCheck className="h-4 w-4" />
                  {importedEmployees.length} employees will be invited upon launch
                </span>
              ) : (
                <span>You can always add more employees later from the Employee Directory.</span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={isSubmitting}
                onClick={prevStep}
                className="border-slate-200 text-slate-600 hover:bg-slate-50 font-bold px-6 cursor-pointer"
              >
                Prev
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={isSubmitting}
                onClick={() => {
                  updateFormData({ invitedEmployees: [] });
                  onSubmit({ inviteEmails: "" });
                }}
                className="border-slate-200 text-slate-500 hover:bg-slate-50 font-bold px-6 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Skipping...
                  </>
                ) : (
                  "Skip & Launch"
                )}
              </Button>
              <Button
                size="lg"
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 shadow-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Workspace...
                  </>
                ) : (
                  "Complete Setup & Launch"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* PREVIEW & VALIDATION DIALOG */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col overflow-hidden p-0 bg-white">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between pr-6">
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  Employee Directory Preview
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-1">
                  {previewData?.fileName} • {previewRows.length} total records found
                </DialogDescription>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {validRowCount} Valid
                </span>
                {invalidRowCount > 0 && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {invalidRowCount} Errors
                  </span>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Search bar inside dialog */}
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search parsed employees..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9 h-8 text-xs bg-white border-slate-200"
              />
            </div>
            {searchFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchFilter("")}
                className="h-8 text-xs text-slate-500"
              >
                Clear Search
              </Button>
            )}
          </div>

          {/* Table of Rows */}
          <div className="flex-1 overflow-y-auto px-6 py-2 min-h-[260px] max-h-[380px]">
            {filteredPreviewRows.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No matching employees found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200/80 text-xs">
                    <TableHead className="font-bold text-slate-700">Name</TableHead>
                    <TableHead className="font-bold text-slate-700">Email</TableHead>
                    <TableHead className="font-bold text-slate-700">Phone</TableHead>
                    <TableHead className="font-bold text-slate-700">Department</TableHead>
                    <TableHead className="font-bold text-slate-700">Role / Designation</TableHead>
                    <TableHead className="font-bold text-slate-700">Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPreviewRows.map((row) => (
                    <TableRow
                      key={row.id}
                      className={`text-xs border-b border-slate-100 transition-colors ${
                        !row.isValid ? "bg-rose-50/40" : "hover:bg-slate-50"
                      }`}
                    >
                      <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                        {row.firstName} {row.lastName}
                      </TableCell>
                      <TableCell className="text-slate-600 font-mono text-[11px]">
                        {row.email || <span className="text-rose-500 italic">Missing</span>}
                      </TableCell>
                      <TableCell className="text-slate-500 whitespace-nowrap">
                        {row.phone || "—"}
                      </TableCell>
                      <TableCell className="text-slate-600 whitespace-nowrap">
                        {row.department || "—"}
                      </TableCell>
                      <TableCell className="text-slate-600 whitespace-nowrap">
                        {row.designation || row.role}
                      </TableCell>
                      <TableCell>
                        {row.isValid ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                            Valid
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700"
                            title={row.validationError}
                          >
                            {row.validationError}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => handleRemovePreviewRow(row.id)}
                          className="h-6 w-6 rounded flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove row"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Footer Controls */}
          <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between sm:justify-between w-full">
            <div className="text-xs text-slate-500">
              {invalidRowCount > 0 ? (
                <span className="text-amber-600 font-medium">
                  Note: Invalid rows will be skipped during import.
                </span>
              ) : (
                <span>All {validRowCount} employee records are valid and ready.</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreviewOpen(false)}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              {validRowCount > 0 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleConfirmImport(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer text-xs font-semibold"
                >
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  Import {validRowCount} Valid {validRowCount === 1 ? "Employee" : "Employees"}
                </Button>
              ) : (
                <Button type="button" size="sm" disabled className="text-xs">
                  No Valid Employees to Import
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}