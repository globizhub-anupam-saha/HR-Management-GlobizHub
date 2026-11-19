"use client";

import { API_BASE_URL } from "@/lib/api";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Briefcase,
  Building2,
  Upload,
  FileText,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Loader2,
  X,
  MapPin,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ToastProvider";

const API_URL = API_BASE_URL;

export default function CandidateApplicationPage({
  params,
}: {
  params: Promise<{ companySlug: string; jobCode: string }>;
}) {
  const { companySlug, jobCode } = use(params);
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentLocation: "",
    totalExperienceYears: "",
    currentCompany: "",
    currentTitle: "",
    linkedinUrl: "",
    portfolioUrl: "",
    coverLetter: "",
  });

  // Resume File
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Dynamic Screening Answers map: { [questionId]: answerValue }
  const [screeningAnswers, setScreeningAnswers] = useState<Record<string, any>>({});

  // 1. Fetch Job Details & Configured Screening Questions
  const { data: job, isLoading } = useQuery({
    queryKey: ["publicJobApply", companySlug, jobCode],
    queryFn: async () => {
      const res = await axios.get(
        `${API_URL}/recruitment/public/careers/${companySlug}/${jobCode}`,
      );
      return res.data;
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["pdf", "doc", "docx"].includes(ext || "")) {
        toast("Only PDF, DOC, or DOCX files are allowed", "error");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast("File size exceeds 10MB limit", "error");
        return;
      }
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast("Please fill in all mandatory personal details", "error");
      return;
    }

    if (!resumeFile) {
      toast("Please upload your resume (PDF or DOCX)", "error");
      return;
    }

    // Validate Required Screening Questions
    const configuredQuestions = (job?.screeningQuestions as any[]) || [];
    const formattedAnswers: any[] = [];

    for (const q of configuredQuestions) {
      const val = screeningAnswers[q.id];
      if (q.required && (val === undefined || val === null || val === "")) {
        toast(`Please answer the required question: "${q.question}"`, "error");
        return;
      }
      if (val !== undefined && val !== null && val !== "") {
        formattedAnswers.push({
          questionId: q.id,
          question: q.question,
          type: q.type,
          answer: val,
        });
      }
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("firstName", formData.firstName.trim());
      payload.append("lastName", formData.lastName.trim());
      payload.append("email", formData.email.trim().toLowerCase());
      if (formData.phone) payload.append("phone", formData.phone.trim());
      if (formData.currentLocation) payload.append("currentLocation", formData.currentLocation.trim());
      if (formData.totalExperienceYears) payload.append("totalExperienceYears", formData.totalExperienceYears);
      if (formData.currentCompany) payload.append("currentCompany", formData.currentCompany.trim());
      if (formData.currentTitle) payload.append("currentTitle", formData.currentTitle.trim());
      if (formData.linkedinUrl) payload.append("linkedinUrl", formData.linkedinUrl.trim());
      if (formData.portfolioUrl) payload.append("portfolioUrl", formData.portfolioUrl.trim());
      if (formData.coverLetter) payload.append("coverLetter", formData.coverLetter.trim());

      payload.append("screeningAnswers", JSON.stringify(formattedAnswers));
      payload.append("resume", resumeFile);

      const res = await axios.post(
        `${API_URL}/recruitment/public/careers/${companySlug}/${jobCode}/apply`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setSubmittedData(res.data);
      toast("Application submitted successfully!", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to submit application. Please try again.";
      toast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href={`/careers/${companySlug}/${jobCode}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Role Overview
          </Link>

          <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-primary" />
            {job?.company?.name || "Company"}
          </span>
        </div>
      </header>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-xs">Loading application form...</span>
        </div>
      ) : submittedData ? (
        /* Success Screen */
        <main className="container mx-auto px-4 py-16 flex-1 max-w-lg flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center border-2 border-emerald-500/20 shadow-sm animate-in zoom-in-90 duration-300">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Application Delivered
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              Thank You, {submittedData.candidateName}!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Your application for <strong>{job?.title}</strong> at <strong>{job?.company?.name}</strong> has been received by the hiring team.
            </p>
          </div>

          <div className="p-4 bg-muted/40 rounded-2xl border w-full text-center space-y-1">
            <span className="text-[11px] text-muted-foreground block font-medium">Application Reference</span>
            <span className="font-mono text-base font-bold text-primary">
              {submittedData.applicationNumber}
            </span>
          </div>

          <p className="text-xs text-muted-foreground italic">
            A confirmation was recorded. If your profile matches the role requirements, our talent team will reach out to you directly.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
            <Link href={`/careers/${companySlug}`} className="flex-1">
              <Button variant="outline" className="w-full text-xs font-semibold">
                More Jobs at {job?.company?.name}
              </Button>
            </Link>
            <Link href="/careers" className="flex-1">
              <Button className="w-full text-xs font-semibold bg-primary text-primary-foreground">
                Careers Marketplace <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </main>
      ) : (
        <main className="container mx-auto px-4 py-8 flex-1 max-w-3xl space-y-8">
          {/* Header Card */}
          <div className="p-6 bg-card rounded-2xl border shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-md">
                {job?.jobCode}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs font-medium text-muted-foreground">{job?.department?.name}</span>
            </div>

            <h1 className="text-2xl font-black text-foreground">Apply for {job?.title}</h1>

            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                {job?.company?.name}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {job?.location} ({job?.workplaceType})
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Personal Information */}
            <section className="space-y-4 p-6 bg-card rounded-2xl border shadow-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                  1
                </span>
                Personal Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    First Name *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Rahul"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Last Name *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Sharma"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="e.g. rahul@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Phone Number
                  </label>
                  <Input
                    placeholder="e.g. +91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Current City / Location
                </label>
                <Input
                  placeholder="e.g. Guwahati, Assam"
                  value={formData.currentLocation}
                  onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                />
              </div>
            </section>

            {/* 2. Professional Details */}
            <section className="space-y-4 p-6 bg-card rounded-2xl border shadow-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                  2
                </span>
                Professional Background
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Total Experience (Years)
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="e.g. 3.5"
                    value={formData.totalExperienceYears}
                    onChange={(e) => setFormData({ ...formData, totalExperienceYears: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Current / Recent Employer
                  </label>
                  <Input
                    placeholder="e.g. TechCorp Solutions"
                    value={formData.currentCompany}
                    onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Current Job Title
                  </label>
                  <Input
                    placeholder="e.g. Software Engineer"
                    value={formData.currentTitle}
                    onChange={(e) => setFormData({ ...formData, currentTitle: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    LinkedIn Profile URL
                  </label>
                  <Input
                    placeholder="https://linkedin.com/in/username"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Portfolio / GitHub URL
                  </label>
                  <Input
                    placeholder="https://github.com/username"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  />
                </div>
              </div>
            </section>

            {/* 3. Resume Upload */}
            <section className="space-y-4 p-6 bg-card rounded-2xl border shadow-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                  3
                </span>
                Upload Resume *
              </h2>

              <div className="relative border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-6 text-center transition-colors">
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.doc,.docx"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                {resumeFile ? (
                  <div className="flex items-center justify-center gap-3 p-2">
                    <FileText className="w-8 h-8 text-primary" />
                    <div className="text-left">
                      <span className="font-bold text-xs text-foreground block">{resumeFile.name}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-8 w-8 ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setResumeFile(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-muted-foreground/60 mx-auto" />
                    <div className="text-xs text-foreground font-semibold">
                      Click to upload or drag & drop your resume
                    </div>
                    <span className="text-[11px] text-muted-foreground block">
                      Supported formats: PDF, DOC, DOCX (Max 10MB)
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* 4. Dynamic Structured Screening Questions */}
            {job?.screeningQuestions && Array.isArray(job.screeningQuestions) && job.screeningQuestions.length > 0 && (
              <section className="space-y-4 p-6 bg-card rounded-2xl border shadow-xs">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                      4
                    </span>
                    Screening Questions
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    Required for initial recruiter screening
                  </span>
                </div>

                <div className="space-y-4">
                  {job.screeningQuestions.map((q: any, idx: number) => {
                    const currentVal = screeningAnswers[q.id];

                    return (
                      <div key={q.id || idx} className="p-4 bg-muted/20 rounded-xl border space-y-2.5">
                        <label className="text-xs font-bold text-foreground block">
                          {idx + 1}. {q.question} {q.required && <span className="text-destructive">*</span>}
                        </label>

                        {/* YES / NO */}
                        {q.type === "YES_NO" && (
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setScreeningAnswers({ ...screeningAnswers, [q.id]: "YES" })}
                              className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                                currentVal === "YES"
                                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                  : "bg-background text-foreground hover:bg-muted"
                              }`}
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setScreeningAnswers({ ...screeningAnswers, [q.id]: "NO" })}
                              className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                                currentVal === "NO"
                                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                  : "bg-background text-foreground hover:bg-muted"
                              }`}
                            >
                              No
                            </button>
                          </div>
                        )}

                        {/* NUMBER */}
                        {q.type === "NUMBER" && (
                          <Input
                            type="number"
                            placeholder="Enter a number..."
                            className="max-w-xs bg-background"
                            value={currentVal !== undefined ? currentVal : ""}
                            onChange={(e) =>
                              setScreeningAnswers({
                                ...screeningAnswers,
                                [q.id]: e.target.value === "" ? "" : Number(e.target.value),
                              })
                            }
                          />
                        )}

                        {/* TEXT */}
                        {q.type === "TEXT" && (
                          <Input
                            placeholder="Your answer..."
                            className="bg-background"
                            value={currentVal || ""}
                            onChange={(e) =>
                              setScreeningAnswers({ ...screeningAnswers, [q.id]: e.target.value })
                            }
                          />
                        )}

                        {/* MULTIPLE CHOICE */}
                        {q.type === "MULTIPLE_CHOICE" && (
                          <div className="flex flex-wrap gap-2">
                            {q.options?.map((opt: string) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setScreeningAnswers({ ...screeningAnswers, [q.id]: opt })}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                  currentVal === opt
                                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                    : "bg-background text-foreground hover:bg-muted"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 5. Optional Cover Letter */}
            <section className="space-y-4 p-6 bg-card rounded-2xl border shadow-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                  5
                </span>
                Additional Notes / Cover Letter (Optional)
              </h2>

              <Textarea
                rows={4}
                placeholder="Share any additional context, key achievements, or reason for your interest in this role..."
                value={formData.coverLetter}
                onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
              />
            </section>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-between">
              <Link href={`/careers/${companySlug}/${jobCode}`}>
                <Button variant="outline" type="button" className="text-xs">
                  Cancel
                </Button>
              </Link>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="font-bold text-xs h-11 px-8 bg-primary text-primary-foreground shadow-md hover:scale-[1.02] transition-transform"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    Submit Application <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </main>
      )}

      {/* Footer */}
      <footer className="border-t py-6 px-4 bg-muted/20 text-center text-xs text-muted-foreground mt-auto">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} GlobizHR Careers. Direct Corporate Recruitment.</span>
          <Link href="/careers" className="hover:text-foreground">
            Marketplace Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
