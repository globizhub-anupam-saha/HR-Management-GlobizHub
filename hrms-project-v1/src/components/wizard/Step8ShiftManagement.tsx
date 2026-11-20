"use client";

// src/components/wizard/Step8ShiftManagement.tsx

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
import { Clock } from "lucide-react";

const step8Schema = z.object({
  shifts: z.array(z.string()).min(1, "Select at least one standard shift to continue"),
});

const DEFAULT_SHIFTS = [
  "Morning", 
  "General", 
  "Night", 
  "Flexible", 
  "Remote", 
  "Rotational"
];

export default function Step8ShiftManagement() {
  const { formData, updateFormData, nextStep, prevStep } = useSetupWizardStore();

  const form = useForm<z.infer<typeof step8Schema>>({
    resolver: zodResolver(step8Schema),
    defaultValues: {
      shifts: formData.shifts || [],
    },
  });

  function onSubmit(values: z.infer<typeof step8Schema>) {
    updateFormData(values);
    nextStep();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <FormField
          control={form.control}
          name="shifts"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base text-slate-900">Shift Management</FormLabel>
                <p className="text-sm text-slate-500">Select the standard shift types your employees work.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {DEFAULT_SHIFTS.map((shift) => (
                  <FormField
                    key={shift}
                    control={form.control}
                    name="shifts"
                    render={({ field }) => {
                      const isChecked = field.value?.includes(shift);
                      return (
                        <FormItem
                          key={shift}
                          className={`flex flex-row items-center space-x-3 space-y-0 p-4 border rounded-xl cursor-pointer transition-colors ${
                            isChecked ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-emerald-200"
                          }`}
                        >
                          <FormControl>
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              checked={isChecked}
                              onChange={(e) => {
                                return e.target.checked
                                  ? field.onChange([...field.value, shift])
                                  : field.onChange(
                                      field.value?.filter((value) => value !== shift)
                                    )
                              }}
                            />
                          </FormControl>
                          <div className="flex items-center space-x-2">
                            <Clock className={`h-4 w-4 ${isChecked ? "text-emerald-600" : "text-slate-400"}`} />
                            <FormLabel className="font-medium text-slate-900 cursor-pointer mb-0">
                              {shift}
                            </FormLabel>
                          </div>
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