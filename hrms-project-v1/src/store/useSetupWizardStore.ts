// src/store/useSetupWizardStore.ts
import { create } from 'zustand';

export interface WizardInvitedEmployee {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  role?: string;
}

export interface WizardBranch {
  id?: string;
  name: string;
  type?: 'HEADQUARTERS' | 'BRANCH' | 'REGIONAL' | 'REMOTE';
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  isHeadquarters?: boolean;
}

// Define the shape of our massive data collection
interface SetupWizardData {
  // Step 1: Basic Info
  companyName: string;
  industry: string;
  companySize: string;
  email: string;
  phone: string;
  website: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;
  adminPassword: string;
  adminEmailVerified?: boolean;
  emailVerified?: boolean;
  holidayRegion: string;
  departments: string[];
  roles: string[];
  salaryComponents: string[];
  leavePolicies: string[];
  shifts: string[];
  branches: string[];
  branchDetails?: WizardBranch[];
  inviteEmails: string;
  invitedEmployees: WizardInvitedEmployee[];
  
  // Step 2: Settings
  themeColor: string;
  workDays: string[];
  shiftStartTime: string;
  shiftEndTime: string;
  attendanceMethod: string;
  timeZone: string;
  employeeIdFormat: string;
  employeeIdPrefix: string;
  employeeIdDigits: number;
}

interface SetupWizardState {
  currentStep: number;
  formData: SetupWizardData;
  
  // Actions
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  updateFormData: (data: Partial<SetupWizardData>) => void;
  resetForm: () => void;
}

// Initial empty state (UPDATED)
const initialData: SetupWizardData = {
  companyName: '',
  industry: '',
  companySize: '',
  email: '',
  phone: '',
  website: '',
  adminFirstName: '',
  adminLastName: '',
  adminEmail: '',
  adminPhone: '',
  adminPassword: '',
  holidayRegion: 'INDIA',
  departments: ['HR', 'Finance', 'IT', 'Sales', 'Support'], // Sensible defaults
  roles: ["Intern", "Junior Developer", "Developer", "Senior Developer", "Lead", "Manager", "Director"],
  salaryComponents: [
    "Basic", 
    "HRA", 
    "Medical", 
    "Travel", 
    "Special Allowance", 
    "Bonus", 
    "PF", 
    "ESI", 
    "Professional Tax"
  ],
  leavePolicies: [
    "Casual", 
    "Earned", 
    "Medical", 
    "Maternity", 
    "Paternity", 
    "Unpaid"
  ],
  shifts: [
    "General", 
    "Morning", 
    "Flexible"
  ],
  branches: [
    "Headquarters (Mumbai)", 
    "Bengaluru Tech Hub"
  ],
  branchDetails: [
    {
      id: "1",
      name: "Corporate Headquarters",
      type: "HEADQUARTERS",
      country: "India",
      state: "Maharashtra",
      city: "Mumbai",
      address: "Bandra Kurla Complex",
      isHeadquarters: true,
    },
    {
      id: "2",
      name: "Bengaluru Tech Hub",
      type: "BRANCH",
      country: "India",
      state: "Karnataka",
      city: "Bengaluru",
      address: "Koramangala",
      isHeadquarters: false,
    },
  ],
  inviteEmails: "",
  invitedEmployees: [],

  // Step 2 Defaults
  themeColor: '#10b981', // Default emerald
  workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  shiftStartTime: '09:00',
  shiftEndTime: '18:00',
  attendanceMethod: 'MANUAL',
  timeZone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Kolkata',
  employeeIdFormat: '{PREFIX}-{DEPT}-{NUMBER}',
  employeeIdPrefix: '',
  employeeIdDigits: 3,
};


export const useSetupWizardStore = create<SetupWizardState>((set) => ({
  currentStep: 1,
  formData: initialData,
  
  nextStep: () => set((state) => ({ currentStep: Math.min(10, state.currentStep + 1) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),
  setStep: (step) => set({ currentStep: Math.min(Math.max(1, step), 10) }),
  
  updateFormData: (newData) => 
    set((state) => ({
      formData: { ...state.formData, ...newData }
    })),
    
  resetForm: () => set({ currentStep: 1, formData: initialData }),
}));
