"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Plus,
  RefreshCw,
  X,
  Mail,
  Calendar,
  Lock,
  UserCheck,
  Edit2,
  KeyRound,
} from "lucide-react";
import { platformApi } from "@/lib/platform-api";

interface PlatformUserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export default function PlatformUsersPage() {
  const [users, setUsers] = useState<PlatformUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, limit: 20 });

  // Invite Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "SUPPORT_ADMIN",
  });

  // Edit Profile / Email Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: "", email: "", firstName: "", lastName: "" });

  // Password Modal
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ id: "", email: "", password: "", confirmPassword: "" });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (roleFilter !== "ALL") params.append("role", roleFilter);
      params.append("page", page.toString());
      params.append("limit", "20");

      const res = await platformApi.get<{ data: PlatformUserItem[]; meta: any }>(
        `/platform/users?${params.toString()}`
      );
      setUsers(res.data?.data || []);
      setMeta(res.data?.meta || { total: 0, totalPages: 1, limit: 20 });
    } catch (err: any) {
      console.error("Failed to load platform users", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (user: PlatformUserItem) => {
    try {
      await platformApi.put(`/platform/users/${user.id}/status`, {
        isActive: !user.isActive,
      });
      fetchUsers();
    } catch (err: any) {
      alert("Failed to toggle status: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await platformApi.put(`/platform/users/${userId}/role`, {
        role: newRole,
      });
      fetchUsers();
    } catch (err: any) {
      alert("Failed to update role: " + (err.response?.data?.message || err.message));
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      await platformApi.post("/platform/users", form);
      setSuccessMsg("Platform administrator invited successfully!");
      setTimeout(() => {
        setInviteModalOpen(false);
        fetchUsers();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to create administrator");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (u: PlatformUserItem) => {
    setEditForm({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
    });
    setErrorMsg("");
    setSuccessMsg("");
    setEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await platformApi.put(`/platform/users/${editForm.id}/profile`, {
        email: editForm.email,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
      });
      setSuccessMsg("Administrator updated successfully!");
      setTimeout(() => {
        setEditModalOpen(false);
        fetchUsers();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to update administrator");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPasswordModal = (u: PlatformUserItem) => {
    setPasswordForm({ id: u.id, email: u.email, password: "", confirmPassword: "" });
    setErrorMsg("");
    setSuccessMsg("");
    setPasswordModalOpen(true);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await platformApi.put(`/platform/users/${passwordForm.id}/password`, {
        password: passwordForm.password,
      });
      setSuccessMsg("Password updated successfully!");
      setTimeout(() => {
        setPasswordModalOpen(false);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-primary/20 text-foreground border-primary/30";
      case "PLATFORM_ADMIN":
        return "bg-secondary text-primary border-border";
      case "BILLING_ADMIN":
        return "bg-status-green/15 text-status-green border-status-green/25";
      case "SUPPORT_ADMIN":
        return "bg-status-orange/15 text-status-orange border-status-orange/25";
      case "PLATFORM_ANALYST":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Platform Administrators</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-primary/15 text-foreground border border-primary/25">
              {meta.total} Staff Member{meta.total !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage authorized SaaS platform staff, role assignments, operational permissions, and security credentials.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/platform-admin/users/roles"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-foreground bg-card border border-border hover:bg-muted rounded-xl transition-colors shadow-xs"
          >
            <ShieldCheck className="size-3.5 text-muted-foreground" />
            Roles & Permissions Matrix
          </Link>
          <button
            onClick={() => {
              setSuccessMsg("");
              setErrorMsg("");
              setInviteModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="size-4" />
            Invite Administrator
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-background border border-border text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Administrator</option>
            <option value="PLATFORM_ADMIN">Platform Administrator</option>
            <option value="BILLING_ADMIN">Billing Administrator</option>
            <option value="SUPPORT_ADMIN">Support Operations</option>
            <option value="PLATFORM_ANALYST">Platform Analyst</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Administrator</th>
                <th className="py-3.5 px-4">Platform Role</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Last Login</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="size-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading platform administrators...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No administrators found matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-foreground text-xs uppercase">
                          {u.firstName?.[0] || "A"}
                          {u.lastName?.[0] || "D"}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {u.firstName} {u.lastName}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border bg-background cursor-pointer ${getRoleBadge(
                          u.role
                        )}`}
                      >
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        <option value="PLATFORM_ADMIN">PLATFORM_ADMIN</option>
                        <option value="BILLING_ADMIN">BILLING_ADMIN</option>
                        <option value="SUPPORT_ADMIN">SUPPORT_ADMIN</option>
                        <option value="PLATFORM_ANALYST">PLATFORM_ANALYST</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                          u.isActive
                            ? "bg-status-green/15 text-status-green border-status-green/25 hover:bg-status-green/25"
                            : "bg-destructive/15 text-destructive border-destructive/25 hover:bg-destructive/25"
                        }`}
                      >
                        {u.isActive ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                        {u.isActive ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-muted-foreground text-[11px]">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-muted-foreground text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          title="Update Email & Name"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium text-foreground bg-card border border-border hover:bg-muted cursor-pointer transition-colors shadow-xs"
                        >
                          <Edit2 className="size-3 text-muted-foreground" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => openPasswordModal(u)}
                          title="Reset Password"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium text-foreground bg-card border border-border hover:bg-muted cursor-pointer transition-colors shadow-xs"
                        >
                          <KeyRound className="size-3 text-muted-foreground" />
                          <span>Password</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="text-xs font-medium text-foreground hover:bg-muted px-2.5 py-1 rounded-xl bg-card border border-border cursor-pointer transition-colors shadow-xs"
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Invite Platform User */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl relative text-foreground">
            <button
              onClick={() => setInviteModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary/15 border border-primary/25 text-primary">
                <Users2 className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Invite Platform Administrator</h3>
                <p className="text-xs text-muted-foreground">
                  Provision new SaaS staff credentials with granular platform RBAC role.
                </p>
              </div>
            </div>

            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-status-green/15 border border-status-green/25 text-status-green text-xs flex items-center gap-2">
                <CheckCircle2 className="size-4" />
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/15 border border-destructive/25 text-destructive text-xs flex items-center gap-2">
                <XCircle className="size-4" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleInviteUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah.j@globizhr.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Initial Password (Min 8 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Assigned Platform Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Full Control)</option>
                  <option value="PLATFORM_ADMIN">PLATFORM_ADMIN (Tenants & Features)</option>
                  <option value="BILLING_ADMIN">BILLING_ADMIN (Plans & Revenue)</option>
                  <option value="SUPPORT_ADMIN">SUPPORT_ADMIN (Customer Support & Diagnostics)</option>
                  <option value="PLATFORM_ANALYST">PLATFORM_ANALYST (Read-Only Analytics)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <RefreshCw className="size-3.5 animate-spin" />
                  ) : (
                    <UserCheck className="size-3.5" />
                  )}
                  Create Administrator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Platform User / Super Admin Profile & Email */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl relative text-foreground">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary/15 border border-primary/25 text-primary">
                <Edit2 className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Update Administrator Details</h3>
                <p className="text-xs text-muted-foreground">Change the primary login ID (email) and display name.</p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-status-green/10 border border-status-green/20 text-xs text-status-green">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Login Email (ID)
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                />
                <p className="text-[11px] text-muted-foreground mt-1">This email is used as the login username.</p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? <RefreshCw className="size-3.5 animate-spin" /> : <UserCheck className="size-3.5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Change Super Admin / User Password */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl relative text-foreground">
            <button
              onClick={() => setPasswordModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary/15 border border-primary/25 text-primary">
                <KeyRound className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Change Password</h3>
                <p className="text-xs text-muted-foreground">
                  Update password for <span className="font-semibold text-foreground">{passwordForm.email}</span>
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-status-green/10 border border-status-green/20 text-xs text-status-green">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  New Password (Min 8 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••••••"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••••••"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? <RefreshCw className="size-3.5 animate-spin" /> : <Lock className="size-3.5" />}
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
