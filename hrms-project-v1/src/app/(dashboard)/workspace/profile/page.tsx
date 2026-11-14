"use client";

import api, { API_BASE_URL } from "@/lib/api";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { User, Lock, MapPin, Bell, Palette, Smartphone, Camera, Loader2, LogOut, Info, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileSkeleton } from "@/components/skeletons";

export default function EmployeeProfileSettings() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<any>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch Resignation Status
  const { data: resignationData } = useQuery({
    queryKey: ["myResignationProfile"],
    queryFn: async () => {
      const token = localStorage.getItem("hrms_token");
      if (!token) return null;
      try {
        const res = await axios.get(
          `${API_BASE_URL}/resignation/my`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return res.data;
      } catch {
        return null;
      }
    },
  });

  // 1. Fetch live user data
  const { data: user, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const token = localStorage.getItem("hrms_token");
      const res = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
  });

  // 2. Populate the form state when data arrives
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        bloodGroup: user.bloodGroup || "",
        gender: user.gender || "",
        email: user.email || "",
        employeeCode: user.employeeCode || "Not Assigned",
        department: user.department?.name || "Not Assigned",
        designation: user.role || "Not Assigned",
        joiningDate: user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : "Not Assigned",
        uanNumber: user.uanNumber || "",
        esicIpNumber: user.esicIpNumber || "",
      });
      setPreviewImage(user.profileImage || null);
    }
  }, [user]);

  // 3. Handle Text Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev: any) => ({ ...prev, [name]: finalValue }));
  };

  // 4. Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // 5. Mutation to Save Profile (Using FormData for the file)
  const saveMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("hrms_token");
      const submitData = new FormData();

      submitData.append("firstName", formData.firstName);
      submitData.append("lastName", formData.lastName);
      submitData.append("phone", formData.phone);
      submitData.append("bloodGroup", formData.bloodGroup);
      submitData.append("gender", formData.gender);
      if (formData.uanNumber !== undefined) {
        submitData.append("uanNumber", formData.uanNumber);
      }
      if (formData.esicIpNumber !== undefined) {
        submitData.append("esicIpNumber", formData.esicIpNumber);
      }

      if (selectedFile) {
        submitData.append("profileImage", selectedFile);
      }

      await axios.patch(`${API_BASE_URL}/employees/me`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      alert("Profile updated successfully!");
    },
  });

  // --- PASSWORD CHANGE STATE & MUTATION ---
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("hrms_token");
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error("New passwords do not match");
      }
      await axios.patch(
        `${API_BASE_URL}/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      alert("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || "Failed to change password");
    },
  });

  // --- DEVICE MANAGEMENT SESSIONS ---
  const token = typeof window !== 'undefined' ? localStorage.getItem("hrms_token") : "";
  const headers = { Authorization: `Bearer ${token}` };

  const { data: devices, refetch: refetchDevices } = useQuery({
    queryKey: ["userDevices"],
    queryFn: async () => {
      const res = await axios.get(
        `${API_BASE_URL}/employees/me/devices`,
        { headers }
      );
      return res.data;
    },
    enabled: !!token,
  });

  const registerDeviceMutation = useMutation({
    mutationFn: async (payload: { deviceName: string; deviceIdentifier: string }) => {
      await axios.post(
        `${API_BASE_URL}/employees/me/devices`,
        payload,
        { headers }
      );
    },
    onSuccess: () => {
      refetchDevices();
    },
  });

  const revokeDeviceMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      await axios.delete(
        `${API_BASE_URL}/employees/me/devices/${deviceId}`,
        { headers }
      );
    },
    onSuccess: () => {
      refetchDevices();
      alert("Session revoked successfully.");
    },
  });

  // Automatically detect and register current device if not in the list
  useEffect(() => {
    if (devices && typeof window !== "undefined") {
      let deviceId = localStorage.getItem("hrms_device_id");
      if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem("hrms_device_id", deviceId);
      }

      const isRegistered = devices.some((d: any) => d.deviceIdentifier === deviceId);
      if (!isRegistered) {
        const userAgent = navigator.userAgent;
        let deviceName = "Unknown Device";
        if (userAgent.indexOf("Chrome") > -1) deviceName = "Chrome Browser";
        else if (userAgent.indexOf("Safari") > -1) deviceName = "Safari Browser";
        else if (userAgent.indexOf("Firefox") > -1) deviceName = "Firefox Browser";

        if (userAgent.indexOf("Windows") > -1) deviceName = "Windows - " + deviceName;
        else if (userAgent.indexOf("Mac") > -1) deviceName = "Mac - " + deviceName;
        else if (userAgent.indexOf("Linux") > -1) deviceName = "Linux - " + deviceName;
        else if (userAgent.indexOf("Android") > -1) deviceName = "Android - Mobile";
        else if (userAgent.indexOf("iPhone") > -1) deviceName = "iPhone - Mobile";

        registerDeviceMutation.mutate({ deviceName, deviceIdentifier: deviceId });
      }
    }
  }, [devices]);

  // --- NOTIFICATION SETTINGS STATE & MUTATION ---
  const [notifications, setNotifications] = useState({
    attendanceReminder: true,
    checkoutReminder: true,
    leaveUpdates: true,
    companyAnnouncements: true,
    emailNotifications: true,
    pushNotifications: false,
  });

  useEffect(() => {
    if (user?.notificationSettings) {
      setNotifications({
        attendanceReminder: user.notificationSettings.attendanceReminder ?? true,
        checkoutReminder: user.notificationSettings.checkoutReminder ?? true,
        leaveUpdates: user.notificationSettings.leaveUpdates ?? true,
        companyAnnouncements: user.notificationSettings.companyAnnouncements ?? true,
        emailNotifications: user.notificationSettings.emailNotifications ?? true,
        pushNotifications: user.notificationSettings.pushNotifications ?? false,
      });
    }
  }, [user]);

  const saveNotificationsMutation = useMutation({
    mutationFn: async (updatedData: typeof notifications) => {
      const token = localStorage.getItem("hrms_token");
      await axios.patch(
        `${API_BASE_URL}/employees/me/notifications`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      alert("Notification settings updated successfully!");
    },
  });

  const handleNotificationChange = (name: string, checked: boolean) => {
    setNotifications((prev) => ({ ...prev, [name]: checked }));
  };

  // --- APPEARANCE STATE & MUTATION ---
  const [appearance, setAppearance] = useState({
    themePreference: "SYSTEM",
    timeFormat: "12h",
  });

  useEffect(() => {
    if (user) {
      setAppearance({
        themePreference: user.themePreference || "SYSTEM",
        timeFormat: user.timeFormat || "12h",
      });
    }
  }, [user]);

  const saveAppearanceMutation = useMutation({
    mutationFn: async (updatedData: typeof appearance) => {
      const token = localStorage.getItem("hrms_token");
      await axios.patch(
        `${API_BASE_URL}/employees/me`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      alert("Appearance settings updated successfully!");
    },
  });

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  const getInitials = (first?: string, last?: string) => {
    return `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase();
  };

  const getRoleLabel = (role?: string) => {
    if (!role) return "Not Assigned";
    if (role === "SUPER_ADMIN") return "CEO / Admin";
    if (role === "HR_HEAD") return "HR Manager";
    return role;
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      <div>
        <h1 className="type-large-title font-bold text-foreground tracking-tight">Account Settings</h1>
        <p className="type-subhead text-label-secondary mt-1">Manage your profile, security, and personal preferences.</p>
      </div>

      <Tabs defaultValue="profile" orientation="vertical" className="flex flex-col md:flex-row gap-8 w-full">
        {/* Navigation Sidebar */}
        <TabsList className="flex md:flex-col flex-row flex-wrap gap-1 bg-card border-0 dark:border dark:border-hairline dark:border-separator rounded-[16px] p-2 apple-shadow-card md:w-64 w-full h-auto self-start">
          <TabsTrigger value="profile" className="flex items-center justify-start gap-3 px-3.5 py-2.5 rounded-[10px] text-label-secondary data-[state=active]:bg-primary/12 data-[state=active]:text-primary transition-all text-[14px] font-medium w-full text-left">
            <User className="size-4 stroke-[1.5]" /> Personal Info
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center justify-start gap-3 px-3.5 py-2.5 rounded-[10px] text-label-secondary data-[state=active]:bg-primary/12 data-[state=active]:text-primary transition-all text-[14px] font-medium w-full text-left">
            <Lock className="size-4 stroke-[1.5]" /> Security & Password
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center justify-start gap-3 px-3.5 py-2.5 rounded-[10px] text-label-secondary data-[state=active]:bg-primary/12 data-[state=active]:text-primary transition-all text-[14px] font-medium w-full text-left">
            <MapPin className="size-4 stroke-[1.5]" /> Shift & Attendance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center justify-start gap-3 px-3.5 py-2.5 rounded-[10px] text-label-secondary data-[state=active]:bg-primary/12 data-[state=active]:text-primary transition-all text-[14px] font-medium w-full text-left">
            <Bell className="size-4 stroke-[1.5]" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center justify-start gap-3 px-3.5 py-2.5 rounded-[10px] text-label-secondary data-[state=active]:bg-primary/12 data-[state=active]:text-primary transition-all text-[14px] font-medium w-full text-left">
            <Palette className="size-4 stroke-[1.5]" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="resignation" className="flex items-center justify-start gap-3 px-3.5 py-2.5 rounded-[10px] text-label-secondary data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive transition-all text-[14px] font-medium w-full text-left">
            <LogOut className="size-4 text-destructive stroke-[1.5]" /> Resignation
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 w-full min-w-0">
          {/* TAB 1: PROFILE / PERSONAL INFO */}
          <TabsContent value="profile" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <CardTitle className="text-lg text-slate-800">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">

                {/* PHOTO UPLOAD SECTION */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                    <AvatarImage src={previewImage || ""} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl font-bold">
                      {getInitials(user?.firstName, user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left space-y-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/png, image/jpeg, image/jpg"
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-4 h-4 mr-2" /> Change Photo
                    </Button>
                    <p className="text-xs text-slate-500">JPG, GIF or PNG. Max size of 2MB.</p>
                  </div>
                </div>

                {/* EDITABLE TEXT FIELDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">First Name</label>
                    <Input name="firstName" value={formData.firstName || ""} onChange={handleChange} className="bg-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Last Name</label>
                    <Input name="lastName" value={formData.lastName || ""} onChange={handleChange} className="bg-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Phone Number</label>
                    <Input name="phone" value={formData.phone || ""} onChange={handleChange} className="bg-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Blood Group</label>
                    <select name="bloodGroup" value={formData.bloodGroup || ""} onChange={handleChange} className="w-full border-slate-200 rounded-md p-2 text-sm bg-white border outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                      <option value="">Select...</option>
                      <option value="O_POS">O+</option>
                      <option value="O_NEG">O-</option>
                      <option value="A_POS">A+</option>
                      <option value="A_NEG">A-</option>
                      <option value="B_POS">B+</option>
                      <option value="B_NEG">B-</option>
                      <option value="AB_POS">AB+</option>
                      <option value="AB_NEG">AB-</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Gender</label>
                    <select name="gender" value={formData.gender || ""} onChange={handleChange} className="w-full border-slate-200 rounded-md p-2 text-sm bg-white border outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                      <option value="">Select...</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                {/* STATUTORY COMPLIANCE IDENTIFIERS */}
                <div className="border-t border-slate-100 pt-6 mt-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-800">Statutory & Retirement Compliance (EPFO & ESIC)</h3>
                    <p className="text-xs text-slate-500">
                      Enter your Indian Provident Fund UAN and ESIC IP numbers once issued. These will be automatically mapped to your company statutory filings.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
                        <span>EPFO UAN (Universal Account Number)</span>
                        <span className="text-xs text-slate-400 font-normal">Optional</span>
                      </label>
                      <Input
                        name="uanNumber"
                        placeholder="12-digit UAN"
                        maxLength={12}
                        value={formData.uanNumber || ""}
                        onChange={handleChange}
                        className="bg-white font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
                        <span>ESIC IP (Insurance Number)</span>
                        <span className="text-xs text-slate-400 font-normal">Optional</span>
                      </label>
                      <Input
                        name="esicIpNumber"
                        placeholder="10-digit / 17-digit IP Number"
                        maxLength={17}
                        value={formData.esicIpNumber || ""}
                        onChange={handleChange}
                        className="bg-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* READ-ONLY FIELDS */}
                <div className="border-t border-slate-100 pt-8 mt-4">
                  <h3 className="text-sm font-semibold text-slate-800 mb-6">Company Details (Read-Only)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><label className="text-sm font-medium text-slate-500">Employee ID</label><Input value={formData.employeeCode} disabled className="bg-slate-50 cursor-not-allowed text-slate-600" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-slate-500">Email Address</label><Input value={formData.email} disabled className="bg-slate-50 cursor-not-allowed text-slate-600" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-slate-500">Department</label><Input value={formData.department} disabled className="bg-slate-50 cursor-not-allowed text-slate-600" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-slate-500">Designation</label><Input value={getRoleLabel(formData.designation)} disabled className="bg-slate-50 cursor-not-allowed text-slate-600" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-slate-500">Joining Date</label><Input value={formData.joiningDate} disabled className="bg-slate-50 cursor-not-allowed text-slate-600" /></div>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                    variant="default"
                    size="default"
                    className="px-6"
                  >
                    {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: SECURITY */}
          <TabsContent value="security" id="sessions" className="m-0 focus-visible:outline-none focus-visible:ring-0 space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <CardTitle className="text-lg text-slate-800">Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Current Password</label>
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="bg-white"
                    placeholder="Enter current password"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">New Password</label>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="bg-white"
                      placeholder="Minimum 8 characters"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="bg-white"
                      placeholder="Re-enter new password"
                    />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={() => changePasswordMutation.mutate()}
                    disabled={changePasswordMutation.isPending || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    variant="default"
                    size="default"
                    className="px-6"
                  >
                    {changePasswordMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <CardTitle className="text-lg text-slate-800">Active Sessions & Fingerprints</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <p className="text-xs text-slate-500">You are currently logged in on these devices. Revoking a session will log you out from that device.</p>
                <div className="divide-y divide-slate-100">
                  {devices?.map((dev: any) => {
                    const isCurrent = typeof window !== 'undefined' && dev.deviceIdentifier === localStorage.getItem("hrms_device_id");
                    return (
                      <div key={dev.id} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                        <div className="flex gap-3 items-center">
                          <Smartphone className="w-8 h-8 text-slate-400" />
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {dev.deviceName}
                              {isCurrent && <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-bold">This Device</span>}
                            </p>
                            <p className="text-xs text-slate-400">Last Active: {new Date(dev.lastUsedAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => revokeDeviceMutation.mutate(dev.id)}
                          disabled={revokeDeviceMutation.isPending}
                        >
                          Revoke Session
                        </Button>
                      </div>
                    );
                  })}
                  {(!devices || devices.length === 0) && (
                    <p className="text-sm text-slate-500 py-2">No active sessions tracked.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: ATTENDANCE & SHIFTS */}
          <TabsContent value="attendance" className="m-0 focus-visible:outline-none focus-visible:ring-0 space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <CardTitle className="text-lg text-slate-800">My Shift Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border rounded-xl bg-slate-50 space-y-2">
                    <h3 className="font-semibold text-slate-800">Office Timings</h3>
                    <div className="flex justify-between text-sm pt-2">
                      <span className="text-slate-500">Start Time:</span>
                      <span className="font-medium text-slate-800">{user?.company?.settings?.officeStartTime || "09:00"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">End Time:</span>
                      <span className="font-medium text-slate-800">{user?.company?.settings?.officeEndTime || "18:00"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Grace Period:</span>
                      <span className="font-medium text-slate-800">{user?.company?.settings?.gracePeriodMinutes || 15} minutes</span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-xl bg-slate-50 space-y-2">
                    <h3 className="font-semibold text-slate-800">Designated Work Days</h3>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                        const isWorkDay = user?.company?.settings?.workingDays?.includes(day);
                        return (
                          <span
                            key={day}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${isWorkDay
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-slate-100 text-slate-400"
                              }`}
                          >
                            {day}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <CardTitle className="text-lg text-slate-800">Clock-in Verification Settings</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="divide-y divide-slate-100">
                  <div className="flex justify-between items-center py-3 first:pt-0">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">GPS Geofencing</p>
                      <p className="text-xs text-slate-500">Required clock-in from within a specific radius of office coordinates.</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-bold rounded ${user?.company?.settings?.enableGps ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      {user?.company?.settings?.enableGps ? "ENABLED" : "DISABLED"}
                    </span>
                  </div>

                  {user?.company?.settings?.enableGps && (
                    <div className="py-3 space-y-2 text-sm text-slate-600 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                      <div className="flex justify-between"><span className="text-slate-500">Office Coordinates:</span> <span className="font-mono">{user?.company?.settings?.officeLatitude?.toFixed(4)}, {user?.company?.settings?.officeLongitude?.toFixed(4)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Allowed Radius:</span> <span>{user?.company?.settings?.allowedRadiusMeters || 100} meters</span></div>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">IP Network Restriction</p>
                      <p className="text-xs text-slate-500">Must be connected to the company Wi-Fi network to clock in.</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-bold rounded ${user?.company?.settings?.isIpRestrictionOn ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      {user?.company?.settings?.isIpRestrictionOn ? "ENABLED" : "DISABLED"}
                    </span>
                  </div>

                  {user?.company?.settings?.isIpRestrictionOn && (
                    <div className="py-3 space-y-2 text-sm text-slate-600 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                      <div className="flex justify-between"><span className="text-slate-500">Required Office IP:</span> <span className="font-mono">{user?.company?.settings?.officeIpAddress || "Not set"}</span></div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: NOTIFICATIONS */}
          <TabsContent value="notifications" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <CardTitle className="text-lg text-slate-800">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b last:border-0 border-slate-100">
                    <div>
                      <label className="text-sm font-semibold text-slate-800 cursor-pointer" htmlFor="attendanceReminder">Attendance Reminder</label>
                      <p className="text-xs text-slate-500">Receive alerts if you forget to clock in at your shift start.</p>
                    </div>
                    <input
                      type="checkbox"
                      id="attendanceReminder"
                      checked={notifications.attendanceReminder}
                      onChange={(e) => handleNotificationChange("attendanceReminder", e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b last:border-0 border-slate-100">
                    <div>
                      <label className="text-sm font-semibold text-slate-800 cursor-pointer" htmlFor="checkoutReminder">Check-out Reminder</label>
                      <p className="text-xs text-slate-500">Receive alerts before your shift ends to clock out.</p>
                    </div>
                    <input
                      type="checkbox"
                      id="checkoutReminder"
                      checked={notifications.checkoutReminder}
                      onChange={(e) => handleNotificationChange("checkoutReminder", e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b last:border-0 border-slate-100">
                    <div>
                      <label className="text-sm font-semibold text-slate-800 cursor-pointer" htmlFor="leaveUpdates">Leave Requests Updates</label>
                      <p className="text-xs text-slate-500">Get notified when your leaves are approved, rejected, or updated.</p>
                    </div>
                    <input
                      type="checkbox"
                      id="leaveUpdates"
                      checked={notifications.leaveUpdates}
                      onChange={(e) => handleNotificationChange("leaveUpdates", e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b last:border-0 border-slate-100">
                    <div>
                      <label className="text-sm font-semibold text-slate-800 cursor-pointer" htmlFor="companyAnnouncements">Company Announcements</label>
                      <p className="text-xs text-slate-500">Get notified when the organization posts a general notice.</p>
                    </div>
                    <input
                      type="checkbox"
                      id="companyAnnouncements"
                      checked={notifications.companyAnnouncements}
                      onChange={(e) => handleNotificationChange("companyAnnouncements", e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b last:border-0 border-slate-100">
                    <div>
                      <label className="text-sm font-semibold text-slate-800 cursor-pointer" htmlFor="emailNotifications">Email Notifications</label>
                      <p className="text-xs text-slate-500">Receive a copy of critical reminders and approvals in your inbox.</p>
                    </div>
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={notifications.emailNotifications}
                      onChange={(e) => handleNotificationChange("emailNotifications", e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b last:border-0 border-slate-100">
                    <div>
                      <label className="text-sm font-semibold text-slate-800 cursor-pointer" htmlFor="pushNotifications">Push Notifications</label>
                      <p className="text-xs text-slate-500">Get instant web browser push notifications.</p>
                    </div>
                    <input
                      type="checkbox"
                      id="pushNotifications"
                      checked={notifications.pushNotifications}
                      onChange={(e) => handleNotificationChange("pushNotifications", e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={() => saveNotificationsMutation.mutate(notifications)}
                    disabled={saveNotificationsMutation.isPending}
                    variant="default"
                    size="default"
                    className="px-6"
                  >
                    {saveNotificationsMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: APPEARANCE */}
          <TabsContent value="appearance" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <CardTitle className="text-lg text-slate-800">Appearance Settings</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Display Theme</label>
                    <div className="grid grid-cols-3 gap-4">
                      {["LIGHT", "DARK", "SYSTEM"].map((theme) => (
                        <button
                          key={theme}
                          onClick={() => setAppearance({ ...appearance, themePreference: theme })}
                          className={`p-3 border rounded-xl text-center text-sm font-semibold transition-all ${appearance.themePreference === theme
                              ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20"
                              : "border-slate-200 hover:bg-slate-50 text-slate-600"
                            }`}
                        >
                          {theme.charAt(0) + theme.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-sm font-medium text-slate-700">Time Format</label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "12-Hour (AM/PM)", value: "12h" },
                        { label: "24-Hour", value: "24h" }
                      ].map((tf) => (
                        <button
                          key={tf.value}
                          onClick={() => setAppearance({ ...appearance, timeFormat: tf.value })}
                          className={`p-3 border rounded-xl text-center text-sm font-semibold transition-all ${appearance.timeFormat === tf.value
                              ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20"
                              : "border-slate-200 hover:bg-slate-50 text-slate-600"
                            }`}
                        >
                          {tf.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={() => saveAppearanceMutation.mutate(appearance)}
                    disabled={saveAppearanceMutation.isPending}
                    variant="default"
                    size="default"
                    className="px-6"
                  >
                    {saveAppearanceMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Save Appearance
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* RESIGNATION / OFFBOARDING SECTION BELOW APPEARANCE */}
            <Card className="border-rose-200/80 bg-gradient-to-br from-white via-white to-rose-50/20 shadow-sm mt-6">
              <CardHeader className="border-b border-rose-100 bg-rose-50/40 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-200">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-slate-800">Employment Resignation</CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Submit formal resignation, calculate notice period, and track offboarding clearance.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push("/workspace/resignation")}
                    className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm text-xs font-semibold rounded-lg gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    {resignationData?.activeResignation ? "View Resignation Status" : "Submit Resignation"}
                  </Button>
                </div>
              </CardHeader>
              {resignationData?.activeResignation && (
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs">
                    <div className="flex items-center gap-2 text-amber-800">
                      <Info className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Active Request: <strong className="font-semibold">{resignationData.activeResignation.status}</strong> &bull; Requested Last Day:{" "}
                        {new Date(resignationData.activeResignation.requestedLastWorkingDay).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-amber-900 hover:text-amber-950 font-semibold p-0 h-auto underline cursor-pointer"
                      onClick={() => router.push("/workspace/resignation")}
                    >
                      View Details &rarr;
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </TabsContent>

          {/* TAB 6: RESIGNATION */}
          <TabsContent value="resignation" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                      <LogOut className="w-5 h-5 text-rose-500" />
                      Employee Resignation & Departure
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-1">
                      Manage your resignation application, view notice period requirements, and monitor separation clearance.
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push("/workspace/resignation")}
                    className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm text-xs font-semibold rounded-lg gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    {resignationData?.activeResignation ? "Open Active Tracker" : "Submit Resignation"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                  <div className="font-semibold text-slate-800 flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    Company Separation & Notice Policy
                  </div>
                  <p>
                    The standard notice period for your role is <strong>{resignationData?.noticePeriodDays ?? 30} days</strong>.
                    Submitting a resignation initiates the formal approval chain with your reporting manager and HR department.
                  </p>
                </div>

                {resignationData?.activeResignation ? (
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-900">Current Status: {resignationData.activeResignation.status}</span>
                      <span className="text-xs text-amber-700 font-medium">
                        Submitted: {new Date(resignationData.activeResignation.submissionDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700">
                      Requested Last Working Day: <strong>{new Date(resignationData.activeResignation.requestedLastWorkingDay).toLocaleDateString()}</strong>
                    </div>
                    <div className="pt-2">
                      <Button
                        size="sm"
                        onClick={() => router.push("/workspace/resignation")}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs cursor-pointer"
                      >
                        Open Detailed Resignation Portal
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-3 border border-dashed rounded-xl border-slate-200">
                    <p className="text-sm text-slate-500">You currently have no active resignation request.</p>
                    <Button
                      size="sm"
                      onClick={() => router.push("/workspace/resignation")}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs cursor-pointer gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Submit Resignation Letter
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
