"use client";

// src/components/wizard/Step4Departments.tsx

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
import { Building2 } from "lucide-react";

const step4Schema = z.object({
  departments: z.array(z.string()).min(1, "Select at least one department to get started"),
});

const DEFAULT_DEPARTMENTS = [
  "HR", 
  "Finance", 
  "IT", 
  "Marketing", 
  "Operations", 
  "Sales",
  "Support",
  "Legal",
  "Product",
  "Engineering"
];

export default function Step4Departments() {
  const { formData, updateFormData, nextStep, prevStep } = useSetupWizardStore();

  const form = useForm<z.infer<typeof step4Schema>>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      departments: formData.departments || [],
    },
  });

  function onSubmit(values: z.infer<typeof step4Schema>) {
    updateFormData(values);
    nextStep();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <FormField
          control={form.control}
          name="departments"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base text-slate-900">Standard Departments</FormLabel>
                <p className="text-sm text-slate-500">Select the departments that exist in your organization. You can always add custom departments later.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {DEFAULT_DEPARTMENTS.map((dept) => (
                  <FormField
                    key={dept}
                    control={form.control}
                    name="departments"
                    render={({ field }) => {
                      const isChecked = field.value?.includes(dept);
                      return (
                        <FormItem
                          key={dept}
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
                                  ? field.onChange([...field.value, dept])
                                  : field.onChange(
                                      field.value?.filter((value) => value !== dept)
                                    )
                              }}
                            />
                          </FormControl>
                          <div className="flex items-center space-x-2">
                            <Building2 className={`h-4 w-4 ${isChecked ? "text-emerald-600" : "text-slate-400"}`} />
                            <FormLabel className="font-medium text-slate-900 cursor-pointer mb-0">
                              {dept}
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