"use client";

import { API_BASE_URL } from "@/lib/api";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Building2,
  MapPin,
  Globe,
  Briefcase,
  ArrowLeft,
  ShieldCheck,
  Search,
  IndianRupee,
  Loader2,
  ExternalLink,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const API_URL = API_BASE_URL;

export default function CompanyCareerPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = use(params);
  const [search, setSearch] = useState("");

  const { data: company, isLoading } = useQuery({
    queryKey: ["publicCompanyDetails", companySlug],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/recruitment/public/careers/companies/${companySlug}`);
      return res.data;
    },
  });

  const jobs = company?.jobRequisitions?.filter((j: any) => {
    if (!search) return true;
    return (
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.department?.name?.toLowerCase().includes(search.toLowerCase()) ||
      j.skills?.some((s: string) => s.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/careers" className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to GlobizHR Careers Marketplace
          </Link>

          <Link href="/careers" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-black">
              G
            </div>
            <span className="font-bold text-sm text-foreground">GlobizHR Careers</span>
          </Link>
        </div>
      </header>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-xs">Loading company profile...</span>
        </div>
      ) : !company ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-3">
          <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto" />
          <h2 className="text-xl font-bold">Company Not Found</h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            This company is either not registered or not currently verified to post recruitment advertisements on GlobizHR.
          </p>
          <Link href="/careers">
            <Button size="sm" variant="outline">
              Return to Careers Marketplace
            </Button>
          </Link>
        </div>
      ) : (
        <main className="container mx-auto px-4 py-8 flex-1 space-y-8 max-w-5xl">
          {/* Company Banner & Profile Card */}
          <div className="p-6 bg-card rounded-2xl border shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary/20 to-secondary/20 text-primary font-black flex items-center justify-center text-2xl border border-primary/20 shadow-xs">
                  {company.name.slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black text-foreground">{company.name}</h1>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] gap-1 font-semibold">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Employer
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                    {company.industry && <span>{company.industry}</span>}
                    {company.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {company.city}
                        {company.state ? `, ${company.state}` : ""}
                      </span>
                    )}
                    {company.website && (
                      <a
                        href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline font-medium"
                      >
                        <Globe className="w-3 h-3" /> {company.website.replace(/^https?:\/\//, "")}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0">
                <span className="text-xs text-muted-foreground">Active Openings</span>
                <span className="text-2xl font-black text-primary">
                  {company.jobRequisitions?.length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Job Listings for this company */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Open Positions at {company.name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Explore available roles and apply directly through our secure corporate workflow.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Filter roles or skills..."
                  className="pl-9 h-9 text-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {!jobs || jobs.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted-foreground bg-muted/20 rounded-2xl border space-y-1">
                <p className="font-semibold">No open roles currently match your search.</p>
                <p>Check back soon for new recruitment advertisements from {company.name}.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job: any) => (
                  <Card
                    key={job.id}
                    className="border-border hover:border-primary/50 transition-all shadow-xs hover:shadow-md"
                  >
                    <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-primary">
                            {job.jobCode}
                          </span>
                          <Badge variant="outline" className="text-[10px] font-semibold uppercase">
                            {job.workplaceType}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {job.employmentType}
                          </Badge>
                        </div>

                        <h3 className="text-base font-bold text-foreground">{job.title}</h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {job.location}
                          </span>
                          <span>•</span>
                          <span>{job.department?.name}</span>
                          {job.salaryMin || job.salaryMax ? (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                <IndianRupee className="w-3 h-3" />
                                ₹{job.salaryMin ? Number(job.salaryMin).toLocaleString() : "0"} - ₹
                                {job.salaryMax ? Number(job.salaryMax).toLocaleString() : "N/A"}
                              </span>
                            </>
                          ) : null}
                        </div>

                        {job.skills && job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {job.skills.map((skill: string) => (
                              <Badge key={skill} variant="secondary" className="text-[10px] py-0 px-2 font-medium">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <Link href={`/careers/${companySlug}/${job.jobCode}`}>
                          <Button variant="outline" size="sm" className="text-xs h-9">
                            View Role
                          </Button>
                        </Link>
                        <Link href={`/careers/${companySlug}/${job.jobCode}/apply`}>
                          <Button size="sm" className="text-xs h-9 font-semibold bg-primary">
                            Apply Now
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-muted/20 text-center text-xs text-muted-foreground mt-auto">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} {company?.name || "Company"}. Powered by GlobizHR.</span>
          <Link href="/careers" className="hover:text-foreground font-medium">
            Browse All Companies
          </Link>
        </div>
      </footer>
    </div>
  );
}
