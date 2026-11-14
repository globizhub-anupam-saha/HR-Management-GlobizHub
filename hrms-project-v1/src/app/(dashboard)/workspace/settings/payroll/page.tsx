"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { 
  ArrowLeft, Briefcase, Plus, Percent, Receipt, Calculator, Pencil, Trash2, HelpCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardGridSkeleton } from "@/components/skeletons";

export interface CustomComponent {
  id: string;
  name: string;
  type: "EARNING" | "DEDUCTION";
  calculationType: "PERCENT_OF_CTC" | "PERCENT_OF_BASIC" | "FIXED";
  value: number;
}

export default function PayrollSettingsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<any>(null);
  
  // Track if we are editing an existing template
  const [editingId, setEditingId] = useState<string | null>(null);

  // Custom components list
  const [customComponents, setCustomComponents] = useState<CustomComponent[]>([]);
  
  // Template Form State
  const defaultForm = {
    name: "",
    basicPercentOfCtc: 40,
    hraPercentOfCtc: 20,
    pfPercentOfBasic: 12,
    conveyanceFixed: 1600,
    isConveyancePercent: false,
    medicalFixed: 1250,
    isMedicalPercent: false,
    profTaxFixed: 200,
    isProfTaxPercent: false
  };
  const [form, setForm] = useState(defaultForm);

  // 1. Fetch Existing Templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ["salaryTemplates"],
    queryFn: () => api.get("/payroll/templates").then((res) => res.data),
  });

  // 2. Save Mutation (Handles both Create & Update)
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const fullPayload = {
        ...payload,
        customComponents: customComponents.filter(c => c.name.trim() !== ""),
      };
      if (editingId) {
        await api.patch(`/payroll/templates/${editingId}`, fullPayload);
      } else {
        await api.post("/payroll/templates", fullPayload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaryTemplates"] });
      setIsModalOpen(false);
      setEditingId(null);
      setForm(defaultForm);
      setCustomComponents([]);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to save template.");
    }
  });

  // 3. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/payroll/templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaryTemplates"] });
      setIsDeleteModalOpen(false);
      setTemplateToDelete(null);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to delete template.");
    }
  });

  // Open Modal for New Template
  const handleOpenNew = () => {
    setEditingId(null);
    setForm(defaultForm);
    setCustomComponents([]);
    setIsModalOpen(true);
  };

  // Open Modal to Edit Template
  const handleOpenEdit = (template: any) => {
    setEditingId(template.id);
    setForm({
      name: template.name,
      basicPercentOfCtc: template.basicPercentOfCtc,
      hraPercentOfCtc: template.hraPercentOfCtc,
      pfPercentOfBasic: template.pfPercentOfBasic,
      conveyanceFixed: template.conveyanceFixed,
      isConveyancePercent: template.isConveyancePercent || false,
      medicalFixed: template.medicalFixed,
      isMedicalPercent: template.isMedicalPercent || false,
      profTaxFixed: template.profTaxFixed,
      isProfTaxPercent: template.isProfTaxPercent || false
    });
    setCustomComponents(
      Array.isArray(template.customComponents) ? template.customComponents : []
    );
    setIsModalOpen(true);
  };

  // Custom component helpers
  const handleAddCustomComponent = () => {
    const newComponent: CustomComponent = {
      id: "comp_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      name: "",
      type: "EARNING",
      calculationType: "FIXED",
      value: 0,
    };
    setCustomComponents(prev => [...prev, newComponent]);
  };

  const handleUpdateCustomComponent = (id: string, updates: Partial<CustomComponent>) => {
    setCustomComponents(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleRemoveCustomComponent = (id: string) => {
    setCustomComponents(prev => prev.filter(c => c.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="min-h-screen max-w-6xl mx-auto space-y-6 bg-slate-50/50 p-4 font-sans sm:space-y-8 sm:p-6 lg:p-8">
      
      {/* HEADER */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 text-slate-600">
            <Link href="/workspace/settings"><ArrowLeft className="mr-1 h-4 w-4" /> All settings</Link>
          </Button>
          <h1 className="flex text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            <Calculator className="mr-3 h-7 w-7 shrink-0 text-indigo-600 sm:h-8 sm:w-8" />
            Payroll Settings
          </h1>
          <p className="text-slate-500 mt-1">Configure global salary templates, standard allowances, and custom fields.</p>
        </div>

        {/* CREATE TEMPLATE BUTTON */}
        <Button onClick={handleOpenNew} className="w-full bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> New Salary Template
        </Button>
      </div>

      {/* TEMPLATE MODAL (Used for both Create and Edit) */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsModalOpen(false);
          setEditingId(null);
        }
      }}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] overflow-y-auto bg-white sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {editingId ? "Edit Salary Template" : "Create Salary Template"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* TEMPLATE NAME */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Template Name *</label>
              <Input 
                placeholder="e.g., Software Engineer - Grade A" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})}
                className="font-semibold text-base"
              />
            </div>

            {/* STANDARD CORE COMPONENTS */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {/* PERCENTAGE RULES */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Dynamic Rules (% of CTC)</h4>
                  <Badge variant="outline" className="text-[10px]">Standard</Badge>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex justify-between">
                    <span>Basic Pay</span> <span className="text-slate-400">% of CTC</span>
                  </label>
                  <div className="relative">
                    <Percent className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input type="number" value={form.basicPercentOfCtc} onChange={e => setForm({...form, basicPercentOfCtc: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex justify-between">
                    <span>House Rent (HRA)</span> <span className="text-slate-400">% of CTC</span>
                  </label>
                  <div className="relative">
                    <Percent className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input type="number" value={form.hraPercentOfCtc} onChange={e => setForm({...form, hraPercentOfCtc: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <label className="text-sm font-medium text-slate-700 flex justify-between text-rose-600">
                    <span>Employer PF</span> <span className="text-slate-400">% of Basic</span>
                  </label>
                  <div className="relative">
                    <Percent className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input type="number" value={form.pfPercentOfBasic} onChange={e => setForm({...form, pfPercentOfBasic: Number(e.target.value)})} />
                  </div>
                </div>
              </div>

              {/* FIXED MONTHLY ALLOWANCES */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Fixed Monthly Components</h4>
                  <Badge variant="outline" className="text-[10px]">Standard</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700">Conveyance Allowance</label>
                    <select
                      value={form.isConveyancePercent ? "percent" : "fixed"}
                      onChange={e => setForm({...form, isConveyancePercent: e.target.value === "percent"})}
                      className="text-xs border rounded px-1.5 py-0.5 bg-white border-slate-200 outline-none"
                    >
                      <option value="fixed">₹ Fixed</option>
                      <option value="percent">% of CTC</option>
                    </select>
                  </div>
                  <div className="relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                      {form.isConveyancePercent ? "%" : "₹"}
                    </span>
                    <Input type="number" value={form.conveyanceFixed} onChange={e => setForm({...form, conveyanceFixed: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700">Medical Allowance</label>
                    <select
                      value={form.isMedicalPercent ? "percent" : "fixed"}
                      onChange={e => setForm({...form, isMedicalPercent: e.target.value === "percent"})}
                      className="text-xs border rounded px-1.5 py-0.5 bg-white border-slate-200 outline-none"
                    >
                      <option value="fixed">₹ Fixed</option>
                      <option value="percent">% of CTC</option>
                    </select>
                  </div>
                  <div className="relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                      {form.isMedicalPercent ? "%" : "₹"}
                    </span>
                    <Input type="number" value={form.medicalFixed} onChange={e => setForm({...form, medicalFixed: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700 text-rose-600">Professional Tax</label>
                    <select
                      value={form.isProfTaxPercent ? "percent" : "fixed"}
                      onChange={e => setForm({...form, isProfTaxPercent: e.target.value === "percent"})}
                      className="text-xs border rounded px-1.5 py-0.5 bg-white border-slate-200 outline-none text-rose-600"
                    >
                      <option value="fixed">₹ Fixed</option>
                      <option value="percent">% of CTC</option>
                    </select>
                  </div>
                  <div className="relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                      {form.isProfTaxPercent ? "%" : "₹"}
                    </span>
                    <Input type="number" value={form.profTaxFixed} onChange={e => setForm({...form, profTaxFixed: Number(e.target.value)})} />
                  </div>
                </div>
              </div>
            </div>

            {/* CUSTOM DYNAMIC FIELDS SECTION */}
            <div className="space-y-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    Custom Components & Allowances
                    <span title="Add client-specific allowances, bonuses, reimbursements, or custom deductions">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Add, edit, or remove custom company allowances (e.g. Internet Allowance, Food Coupon) or deductions.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCustomComponent}
                  className="bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-100 h-8 text-xs font-medium"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Custom Field
                </Button>
              </div>

              {customComponents.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-indigo-200 rounded-lg bg-white/60">
                  <p className="text-xs text-slate-500">No custom fields added yet. Click &quot;Add Custom Field&quot; to configure custom allowances or deductions.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {customComponents.map((comp) => (
                    <div 
                      key={comp.id} 
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-white rounded-lg border border-slate-200 shadow-xs"
                    >
                      {/* Field Name */}
                      <div className="flex-1 min-w-[140px]">
                        <Input
                          placeholder="Component Name (e.g., Internet Allowance)"
                          value={comp.name}
                          onChange={(e) => handleUpdateCustomComponent(comp.id, { name: e.target.value })}
                          className="h-8 text-xs font-medium"
                        />
                      </div>

                      {/* Component Type (Earning vs Deduction) */}
                      <div className="w-32">
                        <select
                          value={comp.type}
                          onChange={(e) => handleUpdateCustomComponent(comp.id, { type: e.target.value as "EARNING" | "DEDUCTION" })}
                          className={`w-full h-8 text-xs font-medium border rounded-md px-2 outline-none ${
                            comp.type === "EARNING" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          <option value="EARNING">+ Earning</option>
                          <option value="DEDUCTION">- Deduction</option>
                        </select>
                      </div>

                      {/* Calculation Type */}
                      <div className="w-36">
                        <select
                          value={comp.calculationType}
                          onChange={(e) => handleUpdateCustomComponent(comp.id, { calculationType: e.target.value as any })}
                          className="w-full h-8 text-xs border rounded-md px-2 bg-slate-50 border-slate-200 outline-none text-slate-700"
                        >
                          <option value="FIXED">₹ Fixed Monthly</option>
                          <option value="PERCENT_OF_CTC">% of CTC</option>
                          <option value="PERCENT_OF_BASIC">% of Basic</option>
                        </select>
                      </div>

                      {/* Value Input */}
                      <div className="w-28 relative">
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                          {comp.calculationType === "FIXED" ? "₹" : "%"}
                        </span>
                        <Input
                          type="number"
                          value={comp.value}
                          onChange={(e) => handleUpdateCustomComponent(comp.id, { value: Number(e.target.value) })}
                          className="h-8 text-xs pr-6"
                        />
                      </div>

                      {/* Delete Action */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCustomComponent(comp.id)}
                        className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                        title="Delete field"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-sm text-amber-800">
              <strong>Note:</strong> Special Allowance is automatically calculated at the time of assignment as the remaining balance to match the exact CTC.
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={!form.name || saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {saveMutation.isPending ? "Saving..." : (editingId ? "Update Template" : "Save Template")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRM DELETE MODAL */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Delete Salary Template</DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm text-slate-600">
            Are you sure you want to delete the template <strong className="text-slate-900">&quot;{templateToDelete?.name}&quot;</strong>? This action cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteMutation.mutate(templateToDelete?.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TEMPLATE GRID */}
      {isLoading ? (
        <CardGridSkeleton count={6} columns={3} showAvatar={false} />
      ) : templates?.length === 0 ? (
        <div className="text-center p-16 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-500">
          <Receipt className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Templates Found</h3>
          <p className="text-sm">Create your first CTC template to automate salary assignments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map((template: any) => {
            const comps: CustomComponent[] = Array.isArray(template.customComponents) 
              ? template.customComponents 
              : [];

            return (
              <Card key={template.id} className="border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl flex flex-row items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900 leading-tight">{template.name}</CardTitle>
                        <p className="text-xs text-slate-500 mt-0.5">
                          CTC Driven {comps.length > 0 && `• ${comps.length} custom ${comps.length === 1 ? 'field' : 'fields'}`}
                        </p>
                      </div>
                    </div>
                    {/* EDIT & DELETE ACTIONS */}
                    <div className="flex items-center -mr-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        onClick={() => handleOpenEdit(template)}
                        title="Edit Template"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        onClick={() => {
                          setTemplateToDelete(template);
                          setIsDeleteModalOpen(true);
                        }}
                        title="Delete Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs uppercase font-semibold">Basic</p>
                        <p className="font-medium text-slate-900">{template.basicPercentOfCtc}% of CTC</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs uppercase font-semibold">HRA</p>
                        <p className="font-medium text-slate-900">{template.hraPercentOfCtc}% of CTC</p>
                      </div>
                      <div>
                        <p className="text-rose-500 text-xs uppercase font-semibold">PF Deduction</p>
                        <p className="font-medium text-slate-900">{template.pfPercentOfBasic}% of Basic</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs uppercase font-semibold">Special Allow.</p>
                        <p className="font-medium text-slate-900 text-xs">Auto (Balance)</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-slate-500 text-xs uppercase font-semibold mb-2">Fixed Monthly Components</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Conveyance:</span>
                        <span className="font-medium text-slate-900">
                          {template.isConveyancePercent ? `${template.conveyanceFixed}% of CTC` : formatCurrency(template.conveyanceFixed)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Medical:</span>
                        <span className="font-medium text-slate-900">
                          {template.isMedicalPercent ? `${template.medicalFixed}% of CTC` : formatCurrency(template.medicalFixed)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-rose-600">Prof. Tax:</span>
                        <span className="font-medium text-rose-600">
                          {template.isProfTaxPercent ? `-${template.profTaxFixed}% of CTC` : `-${formatCurrency(template.profTaxFixed)}`}
                        </span>
                      </div>
                    </div>

                    {/* CUSTOM COMPONENTS LISTING */}
                    {comps.length > 0 && (
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-indigo-600 text-xs uppercase font-semibold mb-2">Custom Components</p>
                        <div className="space-y-1.5">
                          {comps.map((c) => (
                            <div key={c.id} className="flex justify-between items-center text-xs">
                              <span className="text-slate-700 flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${c.type === 'EARNING' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                {c.name}:
                              </span>
                              <span className={`font-medium ${c.type === 'EARNING' ? 'text-slate-900' : 'text-rose-600'}`}>
                                {c.type === 'DEDUCTION' && '-'}
                                {c.calculationType === 'FIXED'
                                  ? formatCurrency(c.value)
                                  : `${c.value}% ${c.calculationType === 'PERCENT_OF_CTC' ? 'of CTC' : 'of Basic'}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
