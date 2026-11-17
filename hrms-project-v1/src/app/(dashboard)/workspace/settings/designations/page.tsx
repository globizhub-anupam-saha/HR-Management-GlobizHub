"use client";

import { designationsApi } from "@/lib/api";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Pencil,
  Shield,
  ChevronRight,
  Loader2,
  Save,
  Users,
  LayoutDashboard,
  Eye,
  Monitor,
  Settings2,
  Check,
  X,
  Search,
  Copy,
  Palette,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  type Designation,
  SIDEBAR_MODULES,
  PERMISSION_MODULES,
  PERMISSION_ACTIONS,
  DASHBOARD_WIDGETS,
  DESIGNATION_COLORS,
  getDefaultSidebarModules,
  getDefaultDashboardWidgets,
  getDefaultModulePermissions,
} from "@/lib/permissions";

// ============================================================
// Main Page Component
// ============================================================

export default function DesignationsPage() {
  const queryClient = useQueryClient();
  const [selectedDesignation, setSelectedDesignation] = useState<Designation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  // Fetch all designations
  const { data: designations = [], isLoading } = useQuery<Designation[]>({
    queryKey: ["designations"],
    queryFn: async () => {
      try {
        return await designationsApi.getAll();
      } catch {
        // API not ready — return empty so page still renders
        return [];
      }
    },
  });

  const filteredDesignations = designations.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteDesignation = useMutation({
    mutationFn: async (id: string) => {
      await designationsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designations"] });
      if (selectedDesignation) setSelectedDesignation(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Failed to delete designation");
    },
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl flex items-center gap-3">
            <div className="p-2.5 bg-primary/20 rounded-xl">
              <Shield className="w-6 h-6 text-secondary" />
            </div>
            Designations & Permissions
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Create designations and configure what each role can see, access, and modify across the platform.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/90 shadow-sm cursor-pointer whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" />
            New Designation
          </DialogTrigger>
          <CreateDesignationDialog
            onClose={() => setCreateOpen(false)}
            onCreated={(d) => {
              setSelectedDesignation(d);
              setCreateOpen(false);
            }}
          />
        </Dialog>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel — Designation List */}
        <div className="lg:col-span-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder="Search designations..."
              className="pl-10 bg-card border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Designation Cards */}
          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32 rounded" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-48 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredDesignations.length === 0 ? (
              <EmptyDesignationState onCreateClick={() => setCreateOpen(true)} />
            ) : (
              filteredDesignations.map((d) => (
                <DesignationCard
                  key={d.id}
                  designation={d}
                  isSelected={selectedDesignation?.id === d.id}
                  onSelect={() => setSelectedDesignation(d)}
                  onDelete={() => {
                    if (confirm(`Delete designation "${d.name}"? This cannot be undone.`)) {
                      deleteDesignation.mutate(d.id);
                    }
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Panel — Permission Editor */}
        <div className="lg:col-span-8">
          {selectedDesignation ? (
            <PermissionEditor
              designation={selectedDesignation}
              onUpdate={(updated) => setSelectedDesignation(updated)}
            />
          ) : (
            <EmptyEditorState />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Designation Card
// ============================================================

function DesignationCard({
  designation,
  isSelected,
  onSelect,
  onDelete,
}: {
  designation: Designation;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const roleLabels: Record<string, string> = {
    EMPLOYEE: "Employee",
    MANAGER: "Manager",
    HR_HEAD: "HR Admin",
    SUPER_ADMIN: "Super Admin",
    OWNER: "Owner",
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
        isSelected
          ? "bg-primary/10 border-primary/40 shadow-sm ring-1 ring-primary/20"
          : "bg-card border-border hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
            style={{ backgroundColor: designation.color || "#6366F1" }}
          >
            {designation.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate">{designation.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                {roleLabels[designation.baseRole] || designation.baseRole}
              </span>
              {designation.isDefault && (
                <span className="text-[10px] font-medium bg-primary/20 text-secondary px-2 py-0.5 rounded-full border border-primary/30">
                  System
                </span>
              )}
            </div>
            {designation.description && (
              <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-1">{designation.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!designation.isDefault && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 rounded-md text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
              title="Delete designation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronRight
            className={`w-4 h-4 transition-colors ${
              isSelected ? "text-primary" : "text-muted-foreground/30"
            }`}
          />
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Monitor className="w-3 h-3" />
          <span>{designation.sidebarModules?.length || 0} modules</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <LayoutDashboard className="w-3 h-3" />
          <span>{designation.dashboardWidgets?.length || 0} widgets</span>
        </div>
        {designation.employeeCount !== undefined && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>{designation.employeeCount} users</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Empty States
// ============================================================

function EmptyDesignationState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Shield className="w-8 h-8 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground text-base">No designations yet</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
        Create your first designation to start configuring role-based access and permissions.
      </p>
      <Button onClick={onCreateClick} className="mt-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
        <Plus className="w-4 h-4 mr-2" />
        Create Designation
      </Button>
    </div>
  );
}

function EmptyEditorState() {
  return (
    <Card className="border-border bg-card shadow-sm h-full min-h-[500px] flex items-center justify-center">
      <div className="text-center py-16 px-6">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-5">
          <Settings2 className="w-10 h-10 text-muted-foreground/30" />
        </div>
        <h3 className="font-semibold text-foreground text-lg">Select a designation</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
          Choose a designation from the list to configure its sidebar visibility, module permissions, and dashboard layout.
        </p>
      </div>
    </Card>
  );
}

// ============================================================
// Create Designation Dialog
// ============================================================

function CreateDesignationDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (d: Designation) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [baseRole, setBaseRole] = useState("EMPLOYEE");
  const [color, setColor] = useState<string>(DESIGNATION_COLORS[0].value);

  const createMutation = useMutation({
    mutationFn: async () => {
      const defaultSidebar = getDefaultSidebarModules(baseRole);
      const defaultWidgets = getDefaultDashboardWidgets(baseRole);
      const defaultPerms = getDefaultModulePermissions(baseRole);

      return await designationsApi.create({
        name,
        description,
        baseRole,
        color,
        sidebarModules: defaultSidebar,
        dashboardWidgets: defaultWidgets,
        modulePermissions: defaultPerms,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["designations"] });
      onCreated(data);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Failed to create designation");
    },
  });

  return (
    <DialogContent className="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Create New Designation
        </DialogTitle>
        <DialogDescription>
          Define a new designation and its base access level. You can fine-tune permissions after creation.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5 pt-2">
        {/* Name */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-foreground">Designation Name</Label>
          <Input
            placeholder="e.g. Senior Developer, HR Executive, Team Lead..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-foreground">Description</Label>
          <Textarea
            placeholder="Brief description of this designation's responsibilities..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        {/* Base Role */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-foreground">Base Access Level</Label>
          <p className="text-[11px] text-muted-foreground -mt-1">
            This determines the starting permissions. You can customize everything after creation.
          </p>
          <Select value={baseRole} onValueChange={(val) => val && setBaseRole(val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EMPLOYEE">Employee — Basic access, personal views</SelectItem>
              <SelectItem value="MANAGER">Manager — Team management access</SelectItem>
              <SelectItem value="HR_HEAD">HR Admin — Full HR + payroll access</SelectItem>
              <SelectItem value="SUPER_ADMIN">Super Admin — Unrestricted access</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Color */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            Badge Color
          </Label>
          <div className="flex flex-wrap gap-2">
            {DESIGNATION_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={`w-8 h-8 rounded-lg border-2 transition-all duration-150 hover:scale-110 ${
                  color === c.value
                    ? "border-foreground shadow-md scale-110"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 bg-muted/30 rounded-xl border border-border">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Preview</p>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm"
              style={{ backgroundColor: color }}
            >
              {name ? name.charAt(0).toUpperCase() : "?"}
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{name || "Untitled Designation"}</p>
              <span className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                {baseRole === "EMPLOYEE" ? "Employee" : baseRole === "MANAGER" ? "Manager" : baseRole === "HR_HEAD" ? "HR Admin" : "Super Admin"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!name.trim() || createMutation.isPending}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Designation
              </>
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

// ============================================================
// Permission Editor Panel
// ============================================================

function PermissionEditor({
  designation,
  onUpdate,
}: {
  designation: Designation;
  onUpdate: (updated: Designation) => void;
}) {
  const queryClient = useQueryClient();

  // Local editable state — initialized from designation
  const [sidebarModules, setSidebarModules] = useState<string[]>(designation.sidebarModules || []);
  const [modulePermissions, setModulePermissions] = useState<Record<string, string[]>>(
    designation.modulePermissions || {}
  );
  const [dashboardWidgets, setDashboardWidgets] = useState<string[]>(designation.dashboardWidgets || []);
  const [hasChanges, setHasChanges] = useState(false);

  // Reset state when designation changes
  useEffect(() => {
    setSidebarModules(designation.sidebarModules || []);
    setModulePermissions(designation.modulePermissions || {});
    setDashboardWidgets(designation.dashboardWidgets || []);
    setHasChanges(false);
  }, [designation.id]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return await designationsApi.updatePermissions(designation.id, {
        sidebarModules,
        modulePermissions,
        dashboardWidgets,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["designations"] });
      onUpdate(data);
      setHasChanges(false);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Failed to save permissions");
    },
  });

  // Sidebar toggle
  const toggleSidebarModule = (key: string) => {
    setSidebarModules((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
    setHasChanges(true);
  };

  // Module permission toggle
  const toggleModulePermission = (moduleKey: string, action: string) => {
    setModulePermissions((prev) => {
      const existing = prev[moduleKey] || [];
      const updated = existing.includes(action)
        ? existing.filter((a) => a !== action)
        : [...existing, action];
      return { ...prev, [moduleKey]: updated };
    });
    setHasChanges(true);
  };

  // Dashboard widget toggle
  const toggleDashboardWidget = (key: string) => {
    setDashboardWidgets((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
    setHasChanges(true);
  };

  // Select/deselect all
  const selectAllSidebar = () => {
    setSidebarModules(SIDEBAR_MODULES.map((m) => m.key));
    setHasChanges(true);
  };
  const deselectAllSidebar = () => {
    setSidebarModules([]);
    setHasChanges(true);
  };
  const selectAllWidgets = () => {
    setDashboardWidgets(DASHBOARD_WIDGETS.map((w) => w.key));
    setHasChanges(true);
  };
  const deselectAllWidgets = () => {
    setDashboardWidgets([]);
    setHasChanges(true);
  };

  const roleLabels: Record<string, string> = {
    EMPLOYEE: "Employee",
    MANAGER: "Manager",
    HR_HEAD: "HR Admin",
    SUPER_ADMIN: "Super Admin",
    OWNER: "Owner",
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      {/* Editor Header */}
      <CardHeader className="pb-4 border-b border-border">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0"
              style={{ backgroundColor: designation.color || "#6366F1" }}
            >
              {designation.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg truncate">{designation.name}</CardTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                  {roleLabels[designation.baseRole] || designation.baseRole}
                </span>
                {designation.description && (
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {designation.description}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!hasChanges || saveMutation.isPending}
            className={`shrink-0 font-semibold transition-all ${
              hasChanges
                ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {hasChanges ? "Save Changes" : "No Changes"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="sidebar" className="w-full">
          <TabsList className="flex flex-row w-full justify-start gap-0 px-6 pt-4 bg-transparent border-b border-border rounded-none h-auto pb-0">
            <TabsTrigger
              value="sidebar"
              className="flex-none px-5 py-3 text-xs sm:text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground"
            >
              <Monitor className="mr-1.5 h-4 w-4 shrink-0" />
              Sidebar Access
            </TabsTrigger>
            <TabsTrigger
              value="permissions"
              className="flex-none px-5 py-3 text-xs sm:text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground"
            >
              <Shield className="mr-1.5 h-4 w-4 shrink-0" />
              Module Permissions
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              className="flex-none px-5 py-3 text-xs sm:text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground"
            >
              <LayoutDashboard className="mr-1.5 h-4 w-4 shrink-0" />
              Dashboard Widgets
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Sidebar Access */}
          <TabsContent value="sidebar" className="p-6 space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-foreground">Sidebar Navigation Modules</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Toggle which sidebar items this designation can see.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={selectAllSidebar}
                  className="text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded-md hover:bg-primary/10"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllSidebar}
                  className="text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SIDEBAR_MODULES.map((mod) => {
                const Icon = mod.icon;
                const isEnabled = sidebarModules.includes(mod.key);
                return (
                  <div
                    key={mod.key}
                    onClick={() => toggleSidebarModule(mod.key)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-200 group ${
                      isEnabled
                        ? "bg-primary/5 border-primary/30 hover:bg-primary/10"
                        : "bg-card border-border hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-lg transition-colors ${
                          isEnabled
                            ? "bg-primary/20 text-secondary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${isEnabled ? "text-foreground" : "text-muted-foreground"}`}>
                          {mod.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 truncate">{mod.description}</p>
                      </div>
                    </div>
                    <ToggleSwitch enabled={isEnabled} />
                  </div>
                );
              })}
            </div>

            {/* Mini Sidebar Preview */}
            <SidebarPreview enabledModules={sidebarModules} designationColor={designation.color} />
          </TabsContent>

          {/* TAB 2: Module Permissions */}
          <TabsContent value="permissions" className="p-6 space-y-4 mt-0">
            <div>
              <h3 className="font-semibold text-sm text-foreground">Module-Level Permissions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure what actions (View, Create, Edit, Delete) each designation can perform per module.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/3">Module</th>
                    {PERMISSION_ACTIONS.map((action) => (
                      <th key={action} className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center w-[16%]">
                        {action}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {PERMISSION_MODULES.map((mod) => {
                    const perms = modulePermissions[mod.key] || [];
                    return (
                      <tr key={mod.key} className="hover:bg-muted/10 transition-colors">
                        <td className="p-4">
                          <p className="text-sm font-medium text-foreground">{mod.label}</p>
                          <p className="text-[10px] text-muted-foreground">{mod.description}</p>
                        </td>
                        {PERMISSION_ACTIONS.map((action) => {
                          const isChecked = perms.includes(action);
                          return (
                            <td key={action} className="p-4 text-center">
                              <button
                                onClick={() => toggleModulePermission(mod.key, action)}
                                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all duration-200 mx-auto ${
                                  isChecked
                                    ? "bg-secondary border-secondary text-secondary-foreground shadow-sm"
                                    : "bg-card border-border text-transparent hover:border-muted-foreground/30"
                                }`}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* TAB 3: Dashboard Widgets */}
          <TabsContent value="dashboard" className="p-6 space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-foreground">Dashboard Widget Configuration</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose which widgets appear on this designation's dashboard.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={selectAllWidgets}
                  className="text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded-md hover:bg-primary/10"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllWidgets}
                  className="text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Group widgets by category */}
            {(["personal", "team", "admin", "company"] as const).map((category) => {
              const categoryWidgets = DASHBOARD_WIDGETS.filter((w) => w.category === category);
              if (categoryWidgets.length === 0) return null;
              const categoryLabels = {
                personal: "Personal Widgets",
                team: "Team Widgets",
                admin: "Admin & Management Widgets",
                company: "Company-wide Widgets",
              };
              return (
                <div key={category} className="space-y-2">
                  <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{categoryLabels[category]}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {categoryWidgets.map((widget) => {
                      const isEnabled = dashboardWidgets.includes(widget.key);
                      return (
                        <div
                          key={widget.key}
                          onClick={() => toggleDashboardWidget(widget.key)}
                          className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                            isEnabled
                              ? "bg-primary/5 border-primary/30 hover:bg-primary/10"
                              : "bg-card border-border hover:bg-muted/30"
                          }`}
                        >
                          <div className="min-w-0">
                            <p className={`text-sm font-medium ${isEnabled ? "text-foreground" : "text-muted-foreground"}`}>
                              {widget.label}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60">{widget.description}</p>
                          </div>
                          <ToggleSwitch enabled={isEnabled} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Toggle Switch Component
// ============================================================

function ToggleSwitch({ enabled }: { enabled: boolean }) {
  return (
    <div
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
        enabled ? "bg-secondary" : "bg-border"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </div>
  );
}

// ============================================================
// Sidebar Preview Component
// ============================================================

function SidebarPreview({ enabledModules, designationColor }: { enabledModules: string[]; designationColor: string }) {
  const visibleModules = SIDEBAR_MODULES.filter((m) => enabledModules.includes(m.key));

  return (
    <div className="mt-4 p-4 bg-muted/20 rounded-xl border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Live Sidebar Preview</span>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-3 max-w-[220px]">
        {/* Brand */}
        <div className="pb-2 mb-2 border-b border-border">
          <span className="text-xs font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            GlobizHR
          </span>
        </div>

        {/* Links */}
        <div className="space-y-0.5">
          {visibleModules.length === 0 ? (
            <p className="text-[10px] text-muted-foreground/60 italic py-4 text-center">No modules enabled</p>
          ) : (
            visibleModules.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.key}
                  className={`flex items-center px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                    idx === 0
                      ? "bg-primary/20 text-secondary"
                      : "text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  <Icon className="w-3 h-3 mr-2 shrink-0" />
                  {mod.label}
                </div>
              );
            })
          )}
        </div>
      </div>

      <p className="text-[9px] text-muted-foreground/40 mt-2 text-center">
        {visibleModules.length} of {SIDEBAR_MODULES.length} modules visible
      </p>
    </div>
  );
}
