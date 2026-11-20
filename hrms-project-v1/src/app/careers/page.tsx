"use client";

import api, { API_BASE_URL } from "@/lib/api";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Briefcase,
  Building2,
  MapPin,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Globe,
  IndianRupee,
  Loader2,
  Users,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Logo from "@/components/brand/Logo";

const API_URL = API_BASE_URL;

export default function GlobizHRCareersMarketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompanySlug, setSelectedCompanySlug] = useState("ALL");
  const [selectedWorkplace, setSelectedWorkplace] = useState("ALL");

  // 1. Fetch Verified Hiring Companies
  const { data: companies, isLoading: loadingCompanies } = useQuery({
    queryKey: ["publicCompanies"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/recruitment/public/careers/companies`);
      return res.data;
    },
  });

  // 2. Fetch Marketplace Jobs
  const { data: jobs, isLoading: loadingJobs } = useQuery({
    queryKey: ["publicMarketplaceJobs", selectedCompanySlug, selectedWorkplace, searchQuery],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/recruitment/public/careers/jobs`, {
        params: {
          companySlug: selectedCompanySlug !== "ALL" ? selectedCompanySlug : undefined,
          workplaceType: selectedWorkplace !== "ALL" ? selectedWorkplace : undefined,
          search: searchQuery || undefined,
        },
      });
      return res.data;
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Public Navigation */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/careers" className="flex items-center gap-2.5 group">
            <div className="size-9 rounded-xl bg-white dark:bg-slate-900 border border-border/80 flex items-center justify-center p-1 shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <Logo variant="emblem" size="sm" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight">
                <span className="text-[#0066B2] dark:text-[#38BDF8]">Globiz</span><span className="text-[#F7941D]">Hr</span>{" "}
                <span className="text-foreground font-semibold">Careers</span>
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider -mt-0.5">
                Verified Talent Marketplace
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-xs font-semibold">
                Employer Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 px-4 border-b bg-gradient-to-b from-muted/30 to-background overflow-hidden">
        <div className="container mx-auto max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            Discover Careers at Verified Employers
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Find Your Next High-Impact Role Across Top Companies
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Explore verified job opportunities published directly by trusted companies on the GlobizHR platform. No middleman, direct application.
          </p>

          {/* Search & Filter Bar */}
          <div className="pt-4 max-w-3xl mx-auto">
            <div className="p-2.5 bg-card rounded-2xl border shadow-lg flex flex-col sm:flex-row gap-2.5 items-center">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search by job title, skill (e.g. Node.js), or keywords..."
                  className="pl-9 h-10 text-xs bg-background border-none shadow-none focus-visible:ring-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-[190px]">
                <Select value={selectedCompanySlug} onValueChange={(v) => setSelectedCompanySlug(v || "ALL")}>
                  <SelectTrigger className="h-10 text-xs bg-muted/40 border-none">
                    <SelectValue placeholder="All Companies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Companies</SelectItem>
                    {companies?.map((c: any) => (
                      <SelectItem key={c.id} value={c.slug || c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-[150px]">
                <Select value={selectedWorkplace} onValueChange={(v) => setSelectedWorkplace(v || "ALL")}>
                  <SelectTrigger className="h-10 text-xs bg-muted/40 border-none">
                    <SelectValue placeholder="Workplace" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Modes</SelectItem>
                    <SelectItem value="REMOTE">Remote</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                    <SelectItem value="ON_SITE">On-Site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-10 flex-1 space-y-12">
        {/* 1. Verified Hiring Companies Showcase */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Verified Employers on GlobizHR
              </h2>
              <p className="text-xs text-muted-foreground">
                Browse companies actively hiring and click to view their dedicated career page.
              </p>
            </div>
            {selectedCompanySlug !== "ALL" && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setSelectedCompanySlug("ALL")}
              >
                Reset Company Filter &times;
              </Button>
            )}
          </div>

          {loadingCompanies ? (
            <div className="py-8 flex items-center justify-center text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-xs">Loading hiring companies...</span>
            </div>
          ) : !companies || companies.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border">
              No verified companies are actively advertising open positions right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {companies.map((comp: any) => {
                const isSelected = selectedCompanySlug === (comp.slug || comp.id);
                return (
                  <Card
                    key={comp.id}
                    className={`cursor-pointer transition-all hover:border-primary/50 hover:shadow-md ${
                      isSelected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border"
                    }`}
                    onClick={() => setSelectedCompanySlug(comp.slug || comp.id)}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/20">
                          {comp.name.slice(0, 2).toUpperCase()}
                        </div>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] gap-1 font-semibold">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </Badge>
                      </div>

                      <div>
                        <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary">
                          {comp.name}
                        </h3>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {comp.city || "India"}
                        </span>
                      </div>

                      <div className="pt-2 border-t flex items-center justify-between text-xs">
                        <span className="font-semibold text-primary">
                          {comp.openJobsCount} Open {comp.openJobsCount > 1 ? "Roles" : "Role"}
                        </span>
                        <Link
                          href={`/careers/${comp.slug || comp.id}`}
                          className="text-[11px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Company Page <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* 2. Open Job Vacancies Marketplace */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Live Recruitment Advertisements
                {jobs && (
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {jobs.length} Available
                  </Badge>
                )}
              </h2>
              <p className="text-xs text-muted-foreground">
                Apply directly to positions. Your application is delivered straight to the employer&apos;s HRMS.
              </p>
            </div>
          </div>

          {loadingJobs ? (
            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs">Searching marketplace vacancies...</span>
            </div>
          ) : !jobs || jobs.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-foreground bg-muted/20 rounded-2xl border space-y-2">
              <Briefcase className="w-8 h-8 text-muted-foreground/50 mx-auto" />
              <p className="font-medium">No published jobs match your search criteria.</p>
              <p className="text-[11px]">Try adjusting your search terms or clearing the company filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job: any) => {
                const companySlug = job.company?.slug || job.company?.id;
                return (
                  <Card key={job.id} className="border-border hover:border-primary/50 transition-all shadow-xs hover:shadow-md flex flex-col justify-between">
                    <CardContent className="p-5 space-y-4">
                      {/* Top Row */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-[11px] font-bold text-primary/80 block">
                            {job.jobCode}
                          </span>
                          <h3 className="font-bold text-base text-foreground mt-0.5 line-clamp-1">
                            {job.title}
                          </h3>
                          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3.5 h-3.5" />
                            {job.company?.name}
                          </span>
                        </div>

                        <Badge variant="outline" className="text-[10px] font-semibold uppercase">
                          {job.workplaceType}
                        </Badge>
                      </div>

                      {/* Details row */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {job.location}
                        </span>
                        <span>•</span>
                        <span>{job.department?.name}</span>
                        <span>•</span>
                        <span>{job.employmentType}</span>
                      </div>

                      {/* Salary if enabled */}
                      {job.salaryMin || job.salaryMax ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md w-fit">
                          <IndianRupee className="w-3.5 h-3.5" />
                          ₹{job.salaryMin ? Number(job.salaryMin).toLocaleString() : "0"} - ₹
                          {job.salaryMax ? Number(job.salaryMax).toLocaleString() : "N/A"}
                        </div>
                      ) : null}

                      {/* Skills */}
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {job.skills.slice(0, 4).map((skill: string) => (
                            <Badge key={skill} variant="secondary" className="text-[10px] py-0 px-2 font-medium">
                              {skill}
                            </Badge>
                          ))}
                          {job.skills.length > 4 && (
                            <span className="text-[10px] text-muted-foreground self-center">
                              +{job.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>

                    <div className="p-4 pt-0 border-t mt-auto flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">
                        {job.openings} {job.openings > 1 ? "Openings" : "Opening"}
                      </span>

                      <div className="flex items-center gap-2">
                        <Link href={`/careers/${companySlug}/${job.jobCode}`}>
                          <Button variant="outline" size="sm" className="text-xs h-8">
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/careers/${companySlug}/${job.jobCode}/apply`}>
                          <Button size="sm" className="text-xs h-8 font-semibold bg-primary">
                            Apply Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Public Footer */}
      <footer className="border-t py-8 px-4 bg-muted/20 text-center text-xs text-muted-foreground">
        <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-medium">
            &copy; {new Date().getFullYear()} GlobizHR Careers. Verified Corporate Recruitment Marketplace.
          </span>
          <div className="flex items-center gap-4 text-muted-foreground">
            <Link href="/careers" className="hover:text-foreground">Browse Jobs</Link>
            <Link href="/login" className="hover:text-foreground">HRMS Workspace</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
