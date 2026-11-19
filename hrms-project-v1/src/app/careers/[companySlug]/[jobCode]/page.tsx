"use client";

import { API_BASE_URL } from "@/lib/api";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  ArrowLeft,
  ShieldCheck,
  IndianRupee,
  Loader2,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Calendar,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const API_URL = API_BASE_URL;

export default function PublicJobDetailsPage({
  params,
}: {
  params: Promise<{ companySlug: string; jobCode: string }>;
}) {
  const { companySlug, jobCode } = use(params);

  const { data: job, isLoading } = useQuery({
    queryKey: ["publicJobDetails", companySlug, jobCode],
    queryFn: async () => {
      const res = await axios.get(
        `${API_URL}/recruitment/public/careers/${companySlug}/${jobCode}`,
      );
      return res.data;
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/careers/${companySlug}`}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              All Jobs at {job?.company?.name || "Company"}
            </Link>
          </div>

          <Link href={`/careers/${companySlug}/${jobCode}/apply`}>
            <Button size="sm" className="text-xs font-bold bg-primary shadow-xs">
              Apply Now <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </header>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-xs">Loading position details...</span>
        </div>
      ) : !job ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-3">
          <Briefcase className="w-12 h-12 text-muted-foreground/40 mx-auto" />
          <h2 className="text-xl font-bold">Position Not Found</h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            This vacancy is either closed or no longer actively published on GlobizHR Careers.
          </p>
          <Link href="/careers">
            <Button size="sm" variant="outline">
              Back to Careers Marketplace
            </Button>
          </Link>
        </div>
      ) : (
        <main className="container mx-auto px-4 py-8 flex-1 max-w-5xl space-y-8">
          {/* Hero Banner */}
          <div className="p-6 sm:p-8 bg-card rounded-2xl border shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary px-2.5 py-1 bg-primary/10 rounded-md">
                  {job.jobCode}
                </span>
                <Badge variant="outline" className="text-xs uppercase font-semibold">
                  {job.workplaceType}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {job.employmentType}
                </Badge>
              </div>

              <span className="text-xs text-muted-foreground">
                Published on {new Date(job.publishedAt).toLocaleDateString()}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-foreground">{job.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Link
                  href={`/careers/${companySlug}`}
                  className="font-bold text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <Building2 className="w-4 h-4 text-primary" />
                  {job.company?.name}
                </Link>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] gap-1 font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground pt-2 border-t">
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {job.location}
              </span>
              <span>•</span>
              <span className="font-medium">{job.department?.name}</span>
              <span>•</span>
              <span className="font-medium">{job.openings} Open Positions</span>

              {job.salaryMin || job.salaryMax ? (
                <>
                  <span>•</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <IndianRupee className="w-3.5 h-3.5" />
                    ₹{job.salaryMin ? Number(job.salaryMin).toLocaleString() : "0"} - ₹
                    {job.salaryMax ? Number(job.salaryMax).toLocaleString() : "N/A"}
                  </span>
                </>
              ) : null}
            </div>
          </div>

          {/* 2-Column Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Job Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* About the Role */}
              <section className="space-y-3">
                <h2 className="text-base font-bold uppercase tracking-wider text-foreground">
                  About the Role
                </h2>
                <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line bg-card p-5 rounded-2xl border">
                  {job.description}
                </div>
              </section>

              {/* Responsibilities */}
              {job.responsibilities && (
                <section className="space-y-3">
                  <h2 className="text-base font-bold uppercase tracking-wider text-foreground">
                    Key Responsibilities
                  </h2>
                  <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line bg-card p-5 rounded-2xl border">
                    {job.responsibilities}
                  </div>
                </section>
              )}

              {/* Requirements */}
              {job.requirements && (
                <section className="space-y-3">
                  <h2 className="text-base font-bold uppercase tracking-wider text-foreground">
                    Requirements & Qualifications
                  </h2>
                  <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line bg-card p-5 rounded-2xl border">
                    {job.requirements}
                  </div>
                </section>
              )}

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-base font-bold uppercase tracking-wider text-foreground">
                    Required Skills & Competencies
                  </h2>
                  <div className="flex flex-wrap gap-2 p-4 bg-card rounded-2xl border">
                    {job.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="text-xs py-1 px-3 font-medium">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              {/* Screening Questions Preview */}
              {job.screeningQuestions && Array.isArray(job.screeningQuestions) && job.screeningQuestions.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primary" />
                    <h2 className="text-base font-bold uppercase tracking-wider text-foreground">
                      Pre-Screening Questions ({job.screeningQuestions.length})
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You will be asked these questions during your application submission:
                  </p>
                  <div className="space-y-2">
                    {job.screeningQuestions.map((q: any, i: number) => (
                      <div key={q.id || i} className="p-3 bg-muted/30 rounded-xl border flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">
                          {i + 1}. {q.question}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                            {q.type}
                          </Badge>
                          {q.required && (
                            <Badge variant="secondary" className="text-[10px] font-semibold">
                              Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Sidebar: Quick Summary & CTA */}
            <div className="space-y-6">
              <Card className="border-border shadow-xs sticky top-24">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Ready to apply?
                    </span>
                    <h3 className="font-black text-xl text-foreground">Join the Team</h3>
                    <p className="text-xs text-muted-foreground">
                      No account registration required. Complete our quick form and submit your resume directly to the hiring manager.
                    </p>
                  </div>

                  <Link href={`/careers/${companySlug}/${jobCode}/apply`} className="block">
                    <Button className="w-full font-bold text-xs h-11 bg-primary text-primary-foreground shadow-md hover:scale-[1.02] transition-transform">
                      Apply for this Position <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>

                  <div className="border-t pt-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Department</span>
                      <span className="font-semibold text-foreground">{job.department?.name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Employment</span>
                      <span className="font-semibold text-foreground">{job.employmentType}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Workplace</span>
                      <span className="font-semibold text-foreground">{job.workplaceType}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-semibold text-foreground">{job.location}</span>
                    </div>

                    {job.applicationDeadline && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Deadline</span>
                        <span className="font-semibold text-foreground">
                          {new Date(job.applicationDeadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-muted/40 rounded-xl border text-[11px] text-muted-foreground space-y-1">
                    <span className="font-bold block text-foreground">Direct & Verified Application</span>
                    <span>Your application is received directly by {job.company?.name}&apos;s internal recruitment system.</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-muted/20 text-center text-xs text-muted-foreground mt-auto">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} GlobizHR Careers. Verified Corporate Recruitment.</span>
          <Link href="/careers" className="hover:text-foreground font-medium">
            Browse All Jobs
          </Link>
        </div>
      </footer>
    </div>
  );
}
