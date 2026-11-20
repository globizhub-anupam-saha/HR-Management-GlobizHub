"use client";

// src/components/wizard/Step9Branches.tsx

import React, { useState } from "react";
import { useSetupWizardStore, WizardBranch } from "@/store/useSetupWizardStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Plus,
  Trash2,
  Crown,
  Sparkles,
  ArrowRight,
  Globe2,
  Search,
  CheckCircle2,
} from "lucide-react";
import {
  getCountries,
  getStatesByCountry,
  getCitiesByState,
  POPULAR_PRESETS,
} from "@/lib/geo/city-state";

const OFFICE_TYPES = [
  { value: "HEADQUARTERS", label: "Headquarters" },
  { value: "BRANCH", label: "Branch Office" },
  { value: "REGIONAL", label: "Regional Office" },
  { value: "REMOTE", label: "Remote / Virtual Hub" },
] as const;

function generateBranchId(suffix?: string | number): string {
  const salt = typeof suffix !== "undefined" ? String(suffix) : Math.random().toString(36).substring(2, 7);
  return `branch-${Date.now()}-${salt}`;
}

export default function Step9Branches() {
  const { formData, updateFormData, nextStep, prevStep } = useSetupWizardStore();

  // Initialize branches from existing branchDetails or default to HQ + 1 Branch
  const [branches, setBranches] = useState<WizardBranch[]>(() => {
    if (formData.branchDetails && formData.branchDetails.length > 0) {
      return formData.branchDetails;
    }

    if (formData.branches && formData.branches.length > 0) {
      return formData.branches.map((bName, idx) => ({
        id: generateBranchId(idx),
        name: bName,
        type: idx === 0 ? "HEADQUARTERS" : "BRANCH",
        country: "India",
        state: idx === 0 ? "Maharashtra" : "Karnataka",
        city: idx === 0 ? "Mumbai" : "Bengaluru (Bangalore)",
        address: "",
        isHeadquarters: idx === 0,
      }));
    }

    return [
      {
        id: `branch-hq`,
        name: "Corporate Headquarters",
        type: "HEADQUARTERS",
        country: "India",
        state: "Maharashtra",
        city: "Mumbai",
        address: "Bandra Kurla Complex",
        isHeadquarters: true,
      },
      {
        id: `branch-tech-hub`,
        name: "Bengaluru Tech Hub",
        type: "BRANCH",
        country: "India",
        state: "Karnataka",
        city: "Bengaluru (Bangalore)",
        address: "Koramangala",
        isHeadquarters: false,
      },
    ];
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const countries = getCountries();

  // Helper to get country code by country name
  const getCountryCode = (countryName?: string): string => {
    const found = countries.find(
      (c) => c.name.toLowerCase() === (countryName || "india").toLowerCase()
    );
    return found ? found.code : "IN";
  };

  // Add a new branch
  const handleAddBranch = (preset?: Partial<WizardBranch>) => {
    setValidationError(null);
    const newBranch: WizardBranch = {
      id: preset?.id || generateBranchId(),
      name: preset?.name || `Office Branch ${branches.length + 1}`,
      type: preset?.type || "BRANCH",
      country: preset?.country || "India",
      state: preset?.state || "Maharashtra",
      city: preset?.city || "Mumbai",
      address: preset?.address || "",
      isHeadquarters: preset?.isHeadquarters || branches.length === 0,
    };

    setBranches((prev) => [...prev, newBranch]);
  };

  // Remove a branch
  const handleRemoveBranch = (index: number) => {
    if (branches.length <= 1) {
      setValidationError("You must have at least one office location (Headquarters).");
      return;
    }

    const removed = branches[index];
    const updated = branches.filter((_, i) => i !== index);

    // If removed office was HQ, set the first office as new HQ
    if (removed.isHeadquarters && updated.length > 0) {
      updated[0].isHeadquarters = true;
      updated[0].type = "HEADQUARTERS";
    }

    setBranches(updated);
    setValidationError(null);
  };

  // Update a field for a branch
  const handleBranchChange = (
    index: number,
    field: keyof WizardBranch,
    value: any
  ) => {
    setValidationError(null);
    setBranches((prev) => {
      const updated = [...prev];
      const branch = { ...updated[index], [field]: value };

      // If country changed, auto-select first state and first city
      if (field === "country") {
        const countryCode = getCountryCode(value);
        const states = getStatesByCountry(countryCode);
        branch.state = states[0] || "";
        const cities = getCitiesByState(countryCode, branch.state);
        branch.city = cities[0] || "";
      }

      // If state changed, auto-select first city in that state
      if (field === "state") {
        const countryCode = getCountryCode(branch.country);
        const cities = getCitiesByState(countryCode, value);
        branch.city = cities[0] || "";
      }

      // If office type changed to HEADQUARTERS, ensure only this one is HQ
      if (field === "isHeadquarters" && value === true) {
        return updated.map((b, i) => ({
          ...b,
          isHeadquarters: i === index,
          type: i === index ? "HEADQUARTERS" : b.type === "HEADQUARTERS" ? "BRANCH" : b.type,
        }));
      }

      updated[index] = branch;
      return updated;
    });
  };

  // Set headquarters
  const handleSetHeadquarters = (index: number) => {
    setBranches((prev) =>
      prev.map((b, i) => ({
        ...b,
        isHeadquarters: i === index,
        type: i === index ? "HEADQUARTERS" : b.type === "HEADQUARTERS" ? "BRANCH" : b.type,
      }))
    );
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (branches.length === 0) {
      setValidationError("Please add at least one office location.");
      return;
    }

    // Validate that each office has name and city
    for (let i = 0; i < branches.length; i++) {
      const b = branches[i];
      if (!b.name || !b.name.trim()) {
        setValidationError(`Office #${i + 1} requires an office name.`);
        return;
      }
      if (!b.city || !b.city.trim()) {
        setValidationError(`Office "${b.name}" requires a city.`);
        return;
      }
    }

    // Ensure at least one headquarters exists
    const hasHQ = branches.some((b) => b.isHeadquarters);
    const finalizedBranches = [...branches];
    if (!hasHQ && finalizedBranches.length > 0) {
      finalizedBranches[0].isHeadquarters = true;
      finalizedBranches[0].type = "HEADQUARTERS";
    }

    // Generate backward-compatible string array
    const branchStrings = finalizedBranches.map((b) => {
      const locationPart = [b.city, b.state].filter(Boolean).join(", ");
      return locationPart ? `${b.name} (${locationPart})` : b.name;
    });

    updateFormData({
      branches: branchStrings,
      branchDetails: finalizedBranches,
    });

    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informational Header */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 bg-emerald-600 rounded-xl text-white shadow-sm mt-0.5">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900">
              Corporate Headquarters & Branch Network
            </h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              Configure your primary headquarters, regional offices, and branches.
              Select from all <strong>780+ districts and cities</strong> across India or type any custom city/town name.
            </p>
          </div>
        </div>

        {/* Quick Add Presets */}
        <div className="mt-4 pt-3 border-t border-emerald-200/60 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider flex items-center mr-1">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Quick Presets:
          </span>
          {POPULAR_PRESETS.slice(0, 6).map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() =>
                handleAddBranch({
                  name: preset.name,
                  type: preset.type as any,
                  city: preset.city,
                  state: preset.state,
                  country: preset.country,
                  isHeadquarters: false,
                })
              }
              className="text-xs bg-white hover:bg-emerald-100/60 border border-emerald-200 text-slate-700 font-medium px-2.5 py-1 rounded-lg transition-all hover:border-emerald-300 shadow-2xs"
            >
              + {preset.name.split(" ")[0]} ({preset.city.split(" ")[0]})
            </button>
          ))}
        </div>
      </div>

      {validationError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {validationError}
        </div>
      )}

      {/* Office Cards List */}
      <div className="space-y-5">
        {branches.map((branch, index) => {
          const countryCode = getCountryCode(branch.country);
          const stateOptions = getStatesByCountry(countryCode);
          const cityOptions = getCitiesByState(countryCode, branch.state || stateOptions[0] || "");
          const isHQ = branch.isHeadquarters || branch.type === "HEADQUARTERS";
          const isStandardCity = cityOptions.includes(branch.city || "");
          const datalistId = `city-suggestions-${index}-${branch.id || index}`;

          return (
            <div
              key={branch.id || index}
              className={`relative border rounded-2xl p-5 transition-all bg-white shadow-2xs ${
                isHQ
                  ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div
                    className={`p-2 rounded-lg ${
                      isHQ
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {isHQ ? <Crown className="w-4 h-4 text-emerald-700" /> : <MapPin className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Location #{index + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {branch.name || "Untitled Office"}
                    </h4>
                  </div>

                  {isHQ && (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 text-2xs px-2 py-0.5 ml-2 font-semibold">
                      Primary Headquarters
                    </Badge>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {!isHQ ? (
                    <button
                      type="button"
                      onClick={() => handleSetHeadquarters(index)}
                      className="text-xs font-medium text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-500 mr-1" />
                      Set as HQ
                    </button>
                  ) : null}

                  {branches.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBranch(index)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove location"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Office Name */}
                <div className="md:col-span-5 space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Office / Branch Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={branch.name}
                    onChange={(e) => handleBranchChange(index, "name", e.target.value)}
                    placeholder="e.g. Corporate HQ / Pune Innovation Lab"
                    className="h-10 text-sm border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>

                {/* Office Type */}
                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Office Type</label>
                  <select
                    value={branch.type || "BRANCH"}
                    onChange={(e) => {
                      const newType = e.target.value as any;
                      handleBranchChange(index, "type", newType);
                      if (newType === "HEADQUARTERS") {
                        handleSetHeadquarters(index);
                      }
                    }}
                    className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  >
                    {OFFICE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Country */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 flex items-center">
                    <Globe2 className="w-3.5 h-3.5 mr-1 text-slate-400" /> Country
                  </label>
                  <select
                    value={branch.country || "India"}
                    onChange={(e) => handleBranchChange(index, "country", e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* State Dropdown */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    State / Union Territory <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={branch.state || ""}
                    onChange={(e) => handleBranchChange(index, "state", e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  >
                    {stateOptions.length > 0 ? (
                      stateOptions.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))
                    ) : (
                      <option value="">No states available</option>
                    )}
                  </select>
                </div>

                {/* City Searchable Input with Datalist & Free-Text Support */}
                <div className="md:col-span-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-700">
                      City / District / Town <span className="text-red-500">*</span>
                    </label>
                    <span className="text-2xs text-slate-400">
                      {cityOptions.length} available
                    </span>
                  </div>

                  <div className="relative">
                    <Input
                      type="text"
                      list={datalistId}
                      value={branch.city || ""}
                      onChange={(e) => handleBranchChange(index, "city", e.target.value)}
                      placeholder="Select or type city..."
                      className="h-10 text-sm border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 pr-8"
                      autoComplete="off"
                      required
                    />
                    <div className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none">
                      <Search className="w-4 h-4" />
                    </div>

                    <datalist id={datalistId}>
                      {cityOptions.map((ct) => (
                        <option key={ct} value={ct} />
                      ))}
                    </datalist>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center space-x-1.5 pt-0.5">
                    {branch.city && (
                      isStandardCity ? (
                        <span className="text-2xs text-emerald-600 flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-0.5" />
                          Verified City in {branch.state}
                        </span>
                      ) : (
                        <span className="text-2xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                          Custom City / Area Accepted
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Street Address / Landmark */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Address / Landmark <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <Input
                    type="text"
                    value={branch.address || ""}
                    onChange={(e) => handleBranchChange(index, "address", e.target.value)}
                    placeholder="e.g. Bandra Kurla Complex / Sector 62"
                    className="h-10 text-sm border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Quick Select City Chips for the selected state */}
              {cityOptions.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                  <span className="text-2xs text-slate-400 font-medium mr-1">
                    Popular in {branch.state}:
                  </span>
                  {cityOptions.slice(0, 7).map((cName) => (
                    <button
                      key={cName}
                      type="button"
                      onClick={() => handleBranchChange(index, "city", cName)}
                      className={`text-2xs px-2 py-0.5 rounded-md border transition-all ${
                        branch.city === cName
                          ? "bg-emerald-50 border-emerald-400 text-emerald-800 font-semibold"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {cName}
                    </button>
                  ))}
                  {cityOptions.length > 7 && (
                    <span className="text-2xs text-slate-400 italic">
                      +{cityOptions.length - 7} more in dropdown list
                    </span>
                  )}
                </div>
              )}

              {/* Resolved Location Preview */}
              <div className="mt-2.5 flex items-center text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0" />
                <span className="font-medium text-slate-800 mr-1">Resolved Location:</span>
                <span className="text-slate-600">
                  {[branch.address, branch.city, branch.state, branch.country]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Location Button */}
      <div className="flex justify-center pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleAddBranch()}
          className="border-dashed border-2 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/50 text-emerald-700 font-medium py-5 px-6 rounded-xl flex items-center space-x-2 transition-all w-full md:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Office / Branch Location</span>
        </Button>
      </div>

      {/* Step Navigation Bar */}
      <div className="pt-6 border-t border-slate-200 flex items-center justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          className="border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          Prev
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={nextStep}
          className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
        >
          Skip for Now
        </Button>
        <Button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 flex items-center space-x-2 shadow-sm"
        >
          <span>Save & Continue</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
