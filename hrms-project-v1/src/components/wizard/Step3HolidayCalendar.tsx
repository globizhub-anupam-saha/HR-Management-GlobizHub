"use client";

// src/components/wizard/Step3HolidayCalendar.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSetupWizardStore } from "@/store/useSetupWizardStore";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CalendarDays, Globe, CalendarPlus } from "lucide-react";

const step3Schema = z.object({
  holidayRegion: z.string().min(1, "Please select a holiday calendar"),
});

const CALENDAR_OPTIONS = [
  { id: "INDIA", title: "Indian Holidays", description: "Imports standard public & bank holidays for India.", icon: CalendarDays },
  { id: "US", title: "US Holidays", description: "Imports standard federal holidays for the United States.", icon: Globe },
  { id: "CUSTOM", title: "Custom Calendar", description: "Start with a blank calendar and add holidays manually.", icon: CalendarPlus },
];

export default function Step3HolidayCalendar() {
  const { formData, updateFormData, nextStep, prevStep } = useSetupWizardStore();

  const form = useForm<z.infer<typeof step3Schema>>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      holidayRegion: formData.holidayRegion || "INDIA",
    },
  });

  function onSubmit(values: z.infer<typeof step3Schema>) {
    updateFormData(values);
    nextStep();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <FormField
          control={form.control}
          name="holidayRegion"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormLabel className="text-base text-slate-900">Select Base Holiday Calendar</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CALENDAR_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className={`relative flex cursor-pointer flex-col p-4 rounded-xl border-2 transition-all ${
                      field.value === option.id 
                        ? "border-emerald-500 bg-emerald-50" 
                        : "border-slate-200 bg-white hover:border-emerald-200"
                    }`}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      value={option.id}
                      checked={field.value === option.id}
                      onChange={field.onChange}
                    />
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-lg ${field.value === option.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <option.icon className="h-5 w-5" />
                      </div>
                      <span className="font-semibold text-slate-900">{option.title}</span>
                    </div>
                    <p className="text-sm text-slate-500">{option.description}</p>
                  </label>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SUBMIT BUTTON */}
        <div className="pt-6 flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={prevStep} className="border-slate-200 text-slate-600 hover:bg-slate-50">
            Prev
          </Button>
          <Button type="button" variant="outline" onClick={nextStep} className="border-slate-200 text-slate-500 hover:bg-slate-50">
            Skip Step
          </Button>
          <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">
            Next Step
          </Button>
        </div>
      </form>
    </Form>
  );
}