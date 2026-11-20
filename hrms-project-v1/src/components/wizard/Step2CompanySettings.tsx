"use client";

// src/components/wizard/Step2CompanySettings.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSetupWizardStore } from "@/store/useSetupWizardStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IdCard, Sparkles } from "lucide-react";

const step2Schema = z.object({
  themeColor: z.string().min(4, "Theme color is required"),
  shiftStartTime: z.string().min(1, "Start time is required"),
  shiftEndTime: z.string().min(1, "End time is required"),
  attendanceMethod: z.string().min(1, "Attendance method is required"),
  workDays: z.array(z.string()).min(1, "Select at least one working day"),
  employeeIdFormat: z.string().optional(),
  employeeIdPrefix: z.string().optional(),
  employeeIdDigits: z.number().optional(),
});

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const ATTENDANCE_METHODS = ["MANUAL", "GPS", "QR", "FACE_RECOGNITION", "BIOMETRIC", "RFID"];

const HOURS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

function parse24hTo12h(timeStr: string) {
  if (!timeStr) return { hour: 9, minute: 0, period: "AM" };
  const [hStr, mStr] = timeStr.split(":");
  const h24 = parseInt(hStr) || 0;
  const m = parseInt(mStr) || 0;
  const period = h24 >= 12 ? "PM" : "AM";
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return { hour: h12, minute: m, period };
}

function format12hTo24h(hour: number, minute: number, period: string) {
  let h24 = hour % 12;
  if (period === "PM") h24 += 12;
  const hStr = h24.toString().padStart(2, "0");
  const mStr = minute.toString().padStart(2, "0");
  return `${hStr}:${mStr}`;
}

export default function Step2CompanySettings() {
  const { formData, updateFormData, nextStep, prevStep } = useSetupWizardStore();

  const defaultCompPrefix = formData.companyName
    ? formData.companyName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase()
    : "EMP";

  const form = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      themeColor: formData.themeColor,
      shiftStartTime: formData.shiftStartTime,
      shiftEndTime: formData.shiftEndTime,
      attendanceMethod: formData.attendanceMethod,
      workDays: formData.workDays,
      employeeIdFormat: formData.employeeIdFormat || "{PREFIX}-{DEPT}-{NUMBER}",
      employeeIdPrefix: formData.employeeIdPrefix || defaultCompPrefix,
      employeeIdDigits: formData.employeeIdDigits || 3,
    },
  });

  const watchedFormat = form.watch("employeeIdFormat") || "{PREFIX}-{DEPT}-{NUMBER}";
  const watchedPrefix = form.watch("employeeIdPrefix") || defaultCompPrefix;
  const watchedDigits = form.watch("employeeIdDigits") || 3;

  const currentYear = new Date().getFullYear().toString();
  const shortYear = currentYear.slice(-2);
  const seqNumber = "1".padStart(Number(watchedDigits) || 3, "0");

  let previewCode = watchedFormat
    .replace(/\{PREFIX\}|\[PREFIX\]/gi, watchedPrefix || "EMP")
    .replace(/\{DEPT\}|\[DEPT\]/gi, "HR")
    .replace(/\{YEAR\}|\[YEAR\]/gi, currentYear)
    .replace(/\{YY\}|\[YY\]/gi, shortYear);

  if (/\{NUMBER\}|\[NUMBER\]/gi.test(previewCode)) {
    previewCode = previewCode.replace(/\{NUMBER\}|\[NUMBER\]/gi, seqNumber);
  } else {
    previewCode = `${previewCode}-${seqNumber}`;
  }

  function onSubmit(values: z.infer<typeof step2Schema>) {
    updateFormData(values);
    nextStep();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* THEME COLOR */}
          <FormField
            control={form.control}
            name="themeColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand Theme Color</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Input type="color" className="w-16 h-10 p-1" {...field} />
                    <span className="text-sm text-slate-500 font-mono">{field.value}</span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ATTENDANCE METHOD */}
          <FormField
            control={form.control}
            name="attendanceMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Attendance Method</FormLabel>
                <FormControl>
                  <select 
                    {...field} 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    {ATTENDANCE_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SHIFT TIMINGS */}
          <FormField
            control={form.control}
            name="shiftStartTime"
            render={({ field }) => {
              const { hour, minute, period } = parse24hTo12h(field.value);
              const handleTimeChange = (type: "hour" | "minute" | "period", val: string) => {
                let newHour = hour;
                let newMinute = minute;
                let newPeriod = period;
                if (type === "hour") newHour = parseInt(val) || 12;
                if (type === "minute") newMinute = parseInt(val) || 0;
                if (type === "period") newPeriod = val as any;
                field.onChange(format12hTo24h(newHour, newMinute, newPeriod));
              };

              return (
                <FormItem>
                  <FormLabel>Standard Shift Start Time</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <select
                        value={hour.toString().padStart(2, "0")}
                        onChange={(e) => handleTimeChange("hour", e.target.value)}
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <select
                        value={minute.toString().padStart(2, "0")}
                        onChange={(e) => handleTimeChange("minute", e.target.value)}
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select
                        value={period}
                        onChange={(e) => handleTimeChange("period", e.target.value)}
                        className="flex h-10 w-[80px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 font-bold"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="shiftEndTime"
            render={({ field }) => {
              const { hour, minute, period } = parse24hTo12h(field.value);
              const handleTimeChange = (type: "hour" | "minute" | "period", val: string) => {
                let newHour = hour;
                let newMinute = minute;
                let newPeriod = period;
                if (type === "hour") newHour = parseInt(val) || 12;
                if (type === "minute") newMinute = parseInt(val) || 0;
                if (type === "period") newPeriod = val as any;
                field.onChange(format12hTo24h(newHour, newMinute, newPeriod));
              };

              return (
                <FormItem>
                  <FormLabel>Standard Shift End Time</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <select
                        value={hour.toString().padStart(2, "0")}
                        onChange={(e) => handleTimeChange("hour", e.target.value)}
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <select
                        value={minute.toString().padStart(2, "0")}
                        onChange={(e) => handleTimeChange("minute", e.target.value)}
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select
                        value={period}
                        onChange={(e) => handleTimeChange("period", e.target.value)}
                        className="flex h-10 w-[80px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 font-bold"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        {/* EMPLOYEE ID FORMAT SECTION */}
        <div className="pt-4 border-t space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                <IdCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Employee ID Format</h4>
                <p className="text-xs text-slate-500">Configure the sequential ID structure for new employees.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-slate-500">Preview:</span>
              <Badge variant="outline" className="font-mono bg-emerald-50 text-emerald-700 border-emerald-300 font-bold text-xs">
                {previewCode}
              </Badge>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Choose a Format Template</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {[
                { label: "Company - Dept - Number", value: "{PREFIX}-{DEPT}-{NUMBER}", desc: "Default standard (e.g. EMP-HR-001)" },
                { label: "Company - Number", value: "{PREFIX}-{NUMBER}", desc: "Simple sequence (e.g. EMP-001)" },
                { label: "Company - Year - Number", value: "{PREFIX}-{YEAR}-{NUMBER}", desc: "Yearly batch (e.g. EMP-2026-001)" },
                { label: "Company - Dept - Year - No", value: "{PREFIX}-{DEPT}-{YEAR}-{NUMBER}", desc: "Full breakdown (e.g. EMP-HR-2026-001)" },
              ].map((preset) => {
                const isSelected = form.watch("employeeIdFormat") === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => form.setValue("employeeIdFormat", preset.value)}
                    className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 text-emerald-900 font-medium"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <div className="font-semibold">{preset.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{preset.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <FormField
              control={form.control}
              name="employeeIdPrefix"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">ID Prefix</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={defaultCompPrefix}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      className="h-9 font-mono uppercase text-xs"
                      maxLength={10}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeeIdDigits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Sequence Digits</FormLabel>
                  <FormControl>
                    <select
                      value={field.value || 3}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      <option value={3}>3 Digits (001 - 999)</option>
                      <option value={4}>4 Digits (0001 - 9999)</option>
                      <option value={5}>5 Digits (00001 - 99999)</option>
                      <option value={6}>6 Digits (000001+)</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeeIdFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Format Pattern</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="{PREFIX}-{DEPT}-{NUMBER}"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      className="h-9 font-mono text-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

       {/* WORKING DAYS MULTI-SELECT */}
        <div className="pt-4 border-t">
          <FormField
            control={form.control}
            name="workDays"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base text-slate-900">Working Days</FormLabel>
                  <p className="text-sm text-slate-500">Select the standard working days for your organization.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {DAYS_OF_WEEK.map((day) => (
                    <FormField
                      key={day}
                      control={form.control}
                      name="workDays"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={day}
                            className="flex flex-row items-start space-x-2 space-y-0"
                          >
                            <FormControl>
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                checked={field.value?.includes(day)}
                                onChange={(e) => {
                                  return e.target.checked
                                    ? field.onChange([...field.value, day])
                                    : field.onChange(
                                        field.value?.filter((value) => value !== day)
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal text-slate-700 cursor-pointer">
                              {day}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-6 flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={prevStep} className="border-slate-200 text-slate-600 hover:bg-slate-50">
            Prev
          </Button>
          <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">
            Next Step
          </Button>
        </div>
      </form>
    </Form>
  );
}