export interface CopilotAction {
  label: string;
  url: string;
  variant?: "default" | "outline" | "secondary";
}

export interface CopilotResponse {
  reply: string;
  suggestedActions?: CopilotAction[];
  suggestedQuestions?: string[];
  source: "knowledge_base" | "llm";
}

export interface ModuleGuide {
  id: string;
  name: string;
  path: string;
  summary: string;
  quickQuestions: string[];
  topics: {
    keywords: string[];
    answer: string;
    action?: CopilotAction;
  }[];
}

export const HRMS_MODULE_GUIDES: ModuleGuide[] = [
  {
    id: "employees",
    name: "Employees & Directory",
    path: "/workspace/employees",
    summary:
      "Manage staff profiles, departmental assignments, personal data, and onboarding status.",
    quickQuestions: [
      "How do I add a new employee?",
      "Can I import employees in bulk from Excel or CSV?",
      "How do I view employee documents and identity proofs?",
      "How do I export the employee directory?",
    ],
    topics: [
      {
        keywords: ["add", "create", "new employee", "onboard employee", "hire", "single employee"],
        answer:
          "To add a new employee:\n1. Navigate to **Employees**.\n2. Click the **'+ Add Employee'** button at the top right.\n3. Fill in the **Basic Information** (Name, Work Email, Phone, Designation, Department).\n4. Enter the **Employment Details** (Date of Joining, Employment Type, Reporting Manager, Salary/CTC).\n5. (Optional) Provide Bank & Tax details or leave it for the employee to complete during onboarding.\n6. Click **Save & Send Invite** to trigger a welcome email with their login credentials.",
        action: { label: "Go to Employees Directory", url: "/workspace/employees" },
      },
      {
        keywords: ["bulk", "import", "csv", "excel", "xlsx", "multiple employees", "upload list"],
        answer:
          "To bulk import employees:\n1. Go to **Employees**.\n2. Click the **'Import Employees'** button next to Add Employee.\n3. Download the sample Excel/CSV template to ensure column headers match (First Name, Last Name, Email, Designation, Department, Date of Joining).\n4. Upload your populated file. The system will validate records and report any missing fields or duplicate emails before creating the accounts.",
        action: { label: "Open Employees Page", url: "/workspace/employees" },
      },
      {
        keywords: ["documents", "upload document", "passport", "aadhar", "pan", "id", "kyc", "identity"],
        answer:
          "To view or verify employee documents:\n1. Open the **Employees** table and click on the employee row.\n2. In the profile drawer or detail view, switch to the **Documents** tab (or visit `/workspace/employees/[id]/documents`).\n3. You can review uploaded Identity Proofs, Degree Certificates, and Signed Offer Letters.\n4. Admins can verify or reject submissions and upload new documents on the employee's behalf.",
        action: { label: "Go to Documents Center", url: "/workspace/documents" },
      },
      {
        keywords: ["status", "probation", "terminate", "inactive", "active", "filter", "exited"],
        answer:
          "To manage or filter employee employment status:\n1. Use the status filter tabs at the top of the table: **All**, **Active**, **On Probation**, or **Exited**.\n2. To change an employee's status, click the **Three-Dots Menu (⋮)** on their row and select **'Edit Status'**.\n3. Status changes are automatically recorded in the audit log for compliance.",
        action: { label: "View Employee Directory", url: "/workspace/employees" },
      },
      {
        keywords: ["export", "download list", "spreadsheet", "report", "csv export"],
        answer:
          "To export your employee records:\n1. Go to **Employees**.\n2. Apply any desired Department, Designation, or Status filters.\n3. Click the **'Export'** icon/button above the table.\n4. An Excel (`.xlsx`) file containing all filtered employee records and contact details will download immediately.",
        action: { label: "Open Employee Table", url: "/workspace/employees" },
      },
    ],
  },

  {
    id: "documents",
    name: "Documents Center",
    path: "/workspace/documents",
    summary: "Centralized repository for company policies, contracts, and employee records.",
    quickQuestions: [
      "What file formats and sizes are supported?",
      "Who has permission to view confidential documents?",
      "How do I upload company policies for all staff?",
      "How does document verification work?",
    ],
    topics: [
      {
        keywords: ["format", "supported", "file type", "size", "limit", "upload limit", "10mb"],
        answer:
          "The Documents module supports **PDF, PNG, JPG, and DOCX** files.\n- Maximum file size per upload is **10MB**.\n- Uploaded files are securely stored with cloud encryption.\n- For KYC and contracts, PDF format is recommended for optimal rendering in the in-app previewer.",
        action: { label: "Go to Documents", url: "/workspace/documents" },
      },
      {
        keywords: ["permission", "access", "confidential", "who can see", "privacy", "security"],
        answer:
          "Document access is strictly governed by Role-Based Access Control (RBAC):\n- **Employees**: Can view their own personal uploads and company-wide policies.\n- **Managers**: Can view non-confidential records of their direct reportees.\n- **HR Admins**: Have full privileges to inspect, approve, reject, and upload records across the organization.\n- Statutory data (PAN, Aadhaar, Bank Details) is encrypted at rest.",
        action: { label: "View Roles & Permissions", url: "/workspace/settings" },
      },
      {
        keywords: ["policy", "policies", "handbook", "company document", "leave policy", "publish policy"],
        answer:
          "To publish an organization-wide policy (e.g. Code of Conduct, Anti-Harassment, Leave Policy):\n1. Go to **Documents**.\n2. Select the **'Company Policies'** tab.\n3. Click **'Upload Policy'**.\n4. Give it a title, choose a category (HR, IT & Security, Operations), and attach the PDF.\n5. Click **Publish** to make it instantly visible in all employees' workspaces.",
        action: { label: "View Company Policies", url: "/workspace/documents" },
      },
      {
        keywords: ["verify", "verification", "approve document", "reject document", "kyc check"],
        answer:
          "To verify uploaded documents:\n1. In **Documents**, click the **'Pending Verification'** tab.\n2. Click the document preview to inspect the file.\n3. Click **'Verify & Approve'** to certify the document, or **'Reject'** with comments so the employee is asked to re-upload.",
        action: { label: "Open Documents", url: "/workspace/documents" },
      },
    ],
  },

  {
    id: "leave",
    name: "Leave & Time Off",
    path: "/workspace/leave",
    summary: "Apply for leaves, track leave balances, and approve time-off requests.",
    quickQuestions: [
      "How do I apply for leave?",
      "How do managers approve or reject leave requests?",
      "What leave types exist and what is the quota?",
      "What is the Sandwich Rule and Loss of Pay (LOP)?",
    ],
    topics: [
      {
        keywords: ["apply", "request leave", "take leave", "vacation", "sick leave", "casual leave", "time off"],
        answer:
          "To request time off:\n1. Head over to **Leave**.\n2. Click the **'Apply Leave'** button.\n3. Choose your leave category (Casual, Sick, Earned, or Maternity/Paternity).\n4. Select the Start and End dates (or toggle Half-Day).\n5. Provide a short reason and click **Submit Request**.\nYour reporting manager will receive an immediate notification to review your request.",
        action: { label: "Apply for Leave", url: "/workspace/leave" },
      },
      {
        keywords: ["approve", "reject", "manager approval", "pending leaves", "action request"],
        answer:
          "Managers and HR Admins can review pending requests:\n1. Open the **Leave** module.\n2. Switch to the **'Pending Approvals'** tab.\n3. Click on any request to inspect dates, leave category, remaining balance, and reason.\n4. Click **Approve** or **Reject** (with mandatory feedback remarks).",
        action: { label: "View Pending Approvals", url: "/workspace/leave" },
      },
      {
        keywords: ["types", "balance", "quota", "earned", "casual", "sick", "annual leave", "maternity"],
        answer:
          "Standard leave categories allocated per calendar year:\n- **Casual Leave (CL)**: For unexpected personal errands (credited monthly/yearly).\n- **Sick Leave (SL)**: For medical needs (medical certificate required for > 2 consecutive days).\n- **Earned / Privilege Leave (EL)**: Planned vacations accumulated based on service tenure.\n- **Maternity / Paternity Leave**: Statutory parental time off.\nCheck your remaining balances at the top of the Leave dashboard.",
        action: { label: "Check Leave Balances", url: "/workspace/leave" },
      },
      {
        keywords: ["sandwich", "sandwich rule", "lop", "loss of pay", "unpaid", "leave deduction"],
        answer:
          "**Sandwich Rule & Loss of Pay (LOP)**:\n- **Sandwich Rule**: If enabled in Company Settings, taking leave on Friday and Monday treats intervening Saturday and Sunday as leave days.\n- **Loss of Pay (LOP)**: If an employee exhausts their leave balance or takes unapproved absences, the payroll engine automatically marks those days as LOP and deducts pro-rata pay during monthly payroll processing.",
        action: { label: "View Leave Rules", url: "/workspace/leave" },
      },
    ],
  },

  {
    id: "attendance",
    name: "Attendance & Daily Logs",
    path: "/workspace/attendance",
    summary: "Clock in/out, view daily logs, track work hours, and schedule shifts.",
    quickQuestions: [
      "How do I clock in and out?",
      "How do I regularize a missed punch or forgot to clock out?",
      "Where can I see my monthly attendance record?",
      "What is the late mark and half-day policy?",
    ],
    topics: [
      {
        keywords: ["clock in", "punch in", "sign in", "mark attendance", "clock out", "punch out"],
        answer:
          "To mark daily attendance:\n1. Look at the top navigation bar or visit the **Attendance** page.\n2. Click the **'Clock In'** button at the start of your shift.\n3. The system captures your timestamp and network details.\n4. When finishing your workday, click **'Clock Out'** to compute total productive work hours.",
        action: { label: "Go to Attendance", url: "/workspace/attendance" },
      },
      {
        keywords: ["missed", "regularize", "forgot to clock", "adjustment", "correction", "punch error"],
        answer:
          "If you forgot to punch in or experienced technical issues:\n1. Go to **Attendance** -> **Attendance Logs**.\n2. Find the date and click **'Request Regularization'**.\n3. Enter the actual Check-In and Check-Out times along with an explanation.\n4. Submit for manager approval. Once approved, the record is updated from Absent to Present.",
        action: { label: "View Attendance Logs", url: "/workspace/attendance" },
      },
      {
        keywords: ["late", "late mark", "grace period", "half day", "threshold", "penalty"],
        answer:
          "Attendance calculation rules:\n- **Grace Period**: Typically 15 minutes after shift start time (configured under Shifts).\n- **Late Mark**: Clocking in after the grace period registers a Late mark. (e.g. 3 late marks in a month may trigger a half-day deduction based on company policy).\n- **Half-Day**: Completing between 4 and 8 hours of work counts as a Half-Day.",
        action: { label: "Check Shift Policies", url: "/workspace/shifts" },
      },
      {
        keywords: ["timesheet", "monthly record", "calendar view", "hours worked", "overtime"],
        answer:
          "To view your monthly attendance summary:\n1. Visit the **Attendance** page.\n2. Use the **Calendar View** to see green (Present), amber (Half-day/Late), blue (Leave/Holiday), and red (Absent) badges.\n3. Summary metric cards display total hours worked, overtime hours, and average daily punctuality.",
        action: { label: "Open Attendance Calendar", url: "/workspace/attendance" },
      },
    ],
  },

  {
    id: "payroll",
    name: "Payroll Management",
    path: "/workspace/payroll",
    summary: "Manage salary structures, deductions, tax compliance, and monthly payouts.",
    quickQuestions: [
      "How do HR admins run monthly payroll?",
      "What is the payroll simulation step?",
      "How are statutory deductions (PF, Tax) calculated?",
      "How do I export bank payout transfer sheets?",
    ],
    topics: [
      {
        keywords: ["run payroll", "process salary", "generate payslips", "batch", "payroll cycle"],
        answer:
          "To process monthly payroll (HR Admins):\n1. Navigate to **Payroll**.\n2. Select the current pay month (e.g. October 2026).\n3. The system automatically fetches attendance, unpaid leaves (LOP), and approved bonuses.\n4. Click **'Run Payroll Simulation'** to verify net pay and gross totals across all employees.\n5. Click **'Lock & Finalize'** to generate tamper-proof payslips and update employee records.",
        action: { label: "Open Payroll Console", url: "/workspace/payroll" },
      },
      {
        keywords: ["simulation", "preview payroll", "verify salary", "pre-check"],
        answer:
          "The **Payroll Simulation** feature calculates expected payouts without committing changes to the database. It alerts you to any anomalies (such as negative net pay, missing bank account details, or unregularized absences) so you can fix them before final disbursement.",
        action: { label: "Run Simulation", url: "/workspace/payroll" },
      },
      {
        keywords: ["deductions", "pf", "provident fund", "tax", "tds", "professional tax", "pt"],
        answer:
          "Statutory deductions in GlobizHR:\n- **Provident Fund (PF)**: Typically 12% of Basic Salary (with employer matching).\n- **Professional Tax (PT)**: State-regulated tier deduction (e.g. ₹200/month).\n- **TDS / Income Tax**: Deducted based on selected tax regime and declared investments.\n- Formulas are customizable under **Settings -> Payroll**.",
        action: { label: "Manage Salary Templates", url: "/workspace/settings/payroll" },
      },
      {
        keywords: ["bank export", "bank transfer", "payout file", "neft", "salary disbursement"],
        answer:
          "Once payroll is finalized:\n1. Click **'Download Bank Payout File'** on the finalized payroll page.\n2. Choose your bank format (Excel/CSV with Account Number, Beneficiary Name, IFSC, Amount).\n3. Upload this batch file directly to your corporate banking portal for seamless NEFT/RTGS salary transfers.",
        action: { label: "Go to Payroll", url: "/workspace/payroll" },
      },
    ],
  },

  {
    id: "my-payslips",
    name: "My Payslips (Employee View)",
    path: "/workspace/my-payslips",
    summary: "Download certified salary slips, review compensation breakdown, and view tax certificates.",
    quickQuestions: [
      "Where can I download my payslip PDF?",
      "How do I understand my gross vs net salary?",
      "Where can I find Form 16 and tax summaries?",
    ],
    topics: [
      {
        keywords: ["payslip", "download payslip", "salary slip", "salary receipt", "pdf payslip"],
        answer:
          "To view and download your payslip:\n1. Go to **My Payslips** in the sidebar (or visit your Profile).\n2. Filter by month and year.\n3. Click the **'Download PDF'** icon on any finalized month to save a formal payslip with company letterhead, earnings breakdown, and deductions.",
        action: { label: "View My Payslips", url: "/workspace/my-payslips" },
      },
      {
        keywords: ["gross", "net", "take home", "earnings", "breakdown", "ctc vs take home"],
        answer:
          "Understanding your payslip calculation:\n- **Gross Earnings**: Basic + House Rent Allowance (HRA) + Conveyance + Medical + Special Allowances.\n- **Total Deductions**: PF (12% of Basic) + Professional Tax + TDS (Income Tax) + LOP (Unpaid Leaves).\n- **Net Salary (Take-Home)** = Gross Earnings minus Total Deductions.",
        action: { label: "Inspect My Payslips", url: "/workspace/my-payslips" },
      },
    ],
  },

  {
    id: "recruitment",
    name: "Recruitment & Jobs",
    path: "/workspace/recruitment",
    summary: "Post job openings, track candidate pipeline, schedule interviews, and send offers.",
    quickQuestions: [
      "How do I post a new job vacancy?",
      "How does the candidate pipeline Kanban board work?",
      "How do I schedule candidate interviews?",
      "How do I convert a hired candidate into an employee?",
    ],
    topics: [
      {
        keywords: ["job", "post job", "opening", "create vacancy", "new requisition", "careers"],
        answer:
          "To post a new job opening:\n1. Go to **Recruitment**.\n2. Click the **'Create Job Opening'** button.\n3. Enter Job Title, Department, Workplace Type (Remote / Hybrid / Onsite), and Salary Range.\n4. Define key responsibilities and qualifications.\n5. Click **Publish**. The vacancy immediately appears on your public `/careers` portal for incoming applicant resumes.",
        action: { label: "Open Recruitment Board", url: "/workspace/recruitment" },
      },
      {
        keywords: ["candidate", "pipeline", "kanban", "stages", "move candidate", "screening"],
        answer:
          "The recruitment pipeline is a drag-and-drop Kanban workflow with 5 standard stages:\n1. **Applied**: Newly submitted applications and resumes.\n2. **Screening**: Initial recruiter review of qualifications.\n3. **Interview**: Panel assignments, technical tests, and scorecard rating.\n4. **Offered**: Compensation approved and formal offer letter dispatched.\n5. **Hired**: Candidate accepted offer and is ready for onboarding.",
        action: { label: "View Pipeline Board", url: "/workspace/recruitment" },
      },
      {
        keywords: ["interview", "schedule interview", "panel", "scorecard", "evaluator"],
        answer:
          "To schedule an interview:\n1. Click on any candidate card in the Recruitment board.\n2. Click **'Schedule Interview'**.\n3. Select date, time slot, and assign team members to the interview panel.\n4. Provide a meeting link (Google Meet / Zoom / Onsite).\n5. Evaluators receive an invite and a structured evaluation scorecard to rate technical and soft skills.",
        action: { label: "Go to Recruitment", url: "/workspace/recruitment" },
      },
      {
        keywords: ["convert", "hire", "offer acceptance", "convert to employee", "onboarding transfer"],
        answer:
          "Converting a candidate to a full employee:\n1. Move the candidate to the **Hired** column.\n2. Click **'Convert to Onboarding'**.\n3. The system pre-fills their name, email, phone, and offered salary into the employee database.\n4. An onboarding portal invite is dispatched to the candidate so they can submit IDs and bank details prior to Day 1.",
        action: { label: "Go to Onboarding", url: "/workspace/onboarding" },
      },
    ],
  },

  {
    id: "onboarding",
    name: "Employee Onboarding",
    path: "/workspace/onboarding",
    summary: "Coordinate pre-boarding tasks, document collection, IT provisioning, and orientation.",
    quickQuestions: [
      "What is the onboarding checklist?",
      "How do new hires submit their personal and banking info?",
      "How do we track onboarding completion progress?",
    ],
    topics: [
      {
        keywords: ["onboarding", "pre-boarding", "welcome", "checklist", "new joiner", "orientation"],
        answer:
          "The Onboarding module manages all milestones before and during a new hire's first 90 days:\n- **Step 1: Welcome & Profile**: Employee fills personal and emergency contact details.\n- **Step 2: Statutory & Bank Details**: Collection of PAN, Aadhaar/SSN, and Bank Account IFSC.\n- **Step 3: Document Verification**: Uploading educational certificates and signed appointment letters.\n- **Step 4: IT & Equipment**: Provisioning laptop, corporate email, and software licenses.\n- **Step 5: Buddy & Manager Orientation**: Scheduled intro meetings with team.",
        action: { label: "Go to Onboarding", url: "/workspace/onboarding" },
      },
      {
        keywords: ["track progress", "completion", "pending tasks", "onboarding status"],
        answer:
          "HR Admins can track onboarding readiness via the progress bar on each new joiner's card. Employees with missing mandatory KYC documents or pending IT setups are highlighted with alert badges so HR can follow up before their official start date.",
        action: { label: "View Onboarding Dashboard", url: "/workspace/onboarding" },
      },
    ],
  },

  {
    id: "resignation",
    name: "Resignation & Offboarding",
    path: "/workspace/resignation",
    summary: "Manage voluntary resignations, notice periods, multi-department clearances, and final settlement.",
    quickQuestions: [
      "How do employees submit a resignation request?",
      "How is the Notice Period and Last Working Day (LWD) calculated?",
      "What are the 4 exit clearance departments?",
      "How is the Full & Final (FnF) settlement handled?",
    ],
    topics: [
      {
        keywords: ["resign", "resignation", "quit", "leave company", "notice", "submit resignation"],
        answer:
          "To submit a resignation request (Employee):\n1. Navigate to **Resignation**.\n2. Click **'Submit Resignation'**.\n3. Choose your intended Last Working Day (LWD) based on your contract's notice period.\n4. Provide the formal reason and transition notes.\n5. Click **Submit**. Your manager and HR receive an immediate notification to schedule an exit discussion.",
        action: { label: "Open Resignation Desk", url: "/workspace/resignation" },
      },
      {
        keywords: ["lwd", "last working day", "notice period", "waiver", "buyout"],
        answer:
          "Notice Period rules:\n- The system calculates the contractual notice period (e.g., 30, 60, or 90 days) based on the employee's designation.\n- HR and Managers can approve an **Early Release / Notice Waiver** if project handovers are complete, which recalibrates the official Last Working Day (LWD).",
        action: { label: "Check Resignation Requests", url: "/workspace/resignation" },
      },
      {
        keywords: ["clearance", "exit clearance", "it clearance", "finance clearance", "handover", "laptop return"],
        answer:
          "GlobizHR requires multi-department exit clearances before offboarding:\n1. **IT Clearance**: Return of company laptop, access revoke, and security sign-off.\n2. **Finance Clearance**: Travel expense claims settled, corporate credit card cleared, loan recovery.\n3. **HR Clearance**: Exit interview completed, non-disclosure agreement (NDA) reaffirmed.\n4. **Admin Clearance**: ID badge and physical office access cards returned.",
        action: { label: "Manage Clearances", url: "/workspace/resignation" },
      },
      {
        keywords: ["fnf", "full and final", "settlement", "gratuity", "leave encashment", "exit payroll"],
        answer:
          "**Full & Final (FnF) Settlement**:\nOnce all clearances are signed off, the payroll module calculates the final settlement:\n- Unused Earned Leave balance encashment.\n- Pro-rata salary for days worked in the final month.\n- Gratuity calculation (if eligible by tenure).\n- Deductions for notice shortfall or unreturned assets.",
        action: { label: "Go to Payroll", url: "/workspace/payroll" },
      },
    ],
  },

  {
    id: "training",
    name: "Training & Career Development",
    path: "/workspace/training",
    summary: "Assign skill plans, manage training cohorts, assess competencies, and track certifications.",
    quickQuestions: [
      "How do I create and assign a training plan?",
      "How are competency matrices and skill assessments scored?",
      "Does completing training automatically promote an employee?",
      "How do we track certification renewals?",
    ],
    topics: [
      {
        keywords: ["training", "create plan", "course", "cohort", "assign training", "curriculum"],
        answer:
          "To set up a training plan (HR / Department Managers):\n1. Navigate to **Training**.\n2. Click **'Create Training Plan'**.\n3. Specify Category (e.g. Compliance, Leadership, Technical, Safety/OSHA) and Target Competency.\n4. Define sessions, materials, trainer, and enroll individual employees or entire cohorts.\n5. Enrolled employees can access their learning roadmap and schedule directly from their dashboard.",
        action: { label: "Open Training Module", url: "/workspace/training" },
      },
      {
        keywords: ["promotion", "automatic promotion", "career", "position change", "strict non-automatic"],
        answer:
          "**Strict Non-Automatic Promotion Rule**:\nUnder GlobizHR governance, completing a training program or earning a top assessment score **never automatically changes an employee's designation, grade, or salary**.\n\nCareer outcomes require a separate, governed **Employee Position Change** workflow that must be reviewed and approved by Department Heads, HR, and Finance.",
        action: { label: "View Training Governance", url: "/workspace/training" },
      },
      {
        keywords: ["assessment", "score", "competency", "proficiency", "evaluation", "grades"],
        answer:
          "Assessments & Competencies:\n- Evaluators grade candidates on a standardized 1 to 5 proficiency scale.\n- Multi-method evaluations include practical demonstrations, written tests, and post-training manager feedback.\n- Passing scores automatically update the employee's internal skill profile.",
        action: { label: "Go to Training", url: "/workspace/training" },
      },
      {
        keywords: ["certificate", "certification", "expiry", "renewal", "compliance audit"],
        answer:
          "Certification Expiration Tracking:\n- Training certifications store validity start and expiry dates.\n- The system triggers automated reminder alerts (60, 30, and 15 days prior to expiration) to ensure compliance in regulated industries (Healthcare, Aviation, Finance, Safety).",
        action: { label: "View Certifications", url: "/workspace/training" },
      },
    ],
  },

  {
    id: "shifts",
    name: "Shifts & Work Hours",
    path: "/workspace/shifts",
    summary: "Configure shift timings, grace periods, lunch breaks, and late mark thresholds.",
    quickQuestions: [
      "How do I create or edit shifts?",
      "What is the grace period and late-in tolerance?",
      "How are night shifts and overtime recorded?",
    ],
    topics: [
      {
        keywords: ["shift", "create shift", "working hours", "timing", "morning shift", "night shift"],
        answer:
          "To configure shifts (Admins / HR):\n1. Go to **Shifts**.\n2. Click **'Create Shift'**.\n3. Set Shift Name (e.g. General Shift, Night Shift, Weekend Roster).\n4. Specify Start Time, End Time, and Break Duration (e.g. 60 mins).\n5. Save. The shift can now be assigned to departments or employees in the **Schedules** module.",
        action: { label: "Manage Shifts", url: "/workspace/shifts" },
      },
      {
        keywords: ["grace", "grace period", "late tolerance", "late rule", "half day rule"],
        answer:
          "Shift Grace Rules:\n- **Grace Period**: Typically 15 minutes tolerance after official shift start.\n- **Late Mark**: Clocks after the grace period flag as Late.\n- **Half-Day Cutoff**: Clocks occurring after 2 hours into the shift are classified as Half-Day present.",
        action: { label: "Open Shifts Page", url: "/workspace/shifts" },
      },
    ],
  },

  {
    id: "schedules",
    name: "Schedules & Rosters",
    path: "/workspace/schedules",
    summary: "Assign shift templates to employees and departments, manage weekly offs, and view rosters.",
    quickQuestions: [
      "How do I assign shifts to employees?",
      "How do I configure weekly offs and rotational rosters?",
    ],
    topics: [
      {
        keywords: ["roster", "schedule", "assign shift", "weekly schedule", "calendar"],
        answer:
          "To assign schedules:\n1. Navigate to **Schedules**.\n2. Choose weekly or monthly grid view.\n3. Select an employee or an entire department.\n4. Assign their active shift (e.g. Morning 09:00 - 18:00) or mark days as **Weekly Off (WO)**.\n5. Click **Publish Schedule** so employees can see their upcoming roster in advance.",
        action: { label: "Open Schedules", url: "/workspace/schedules" },
      },
    ],
  },

  {
    id: "settings-payroll",
    name: "Salary Templates & Payroll Settings",
    path: "/workspace/settings/payroll",
    summary: "Configure CTC calculation percentages (Basic, HRA, PF), allowances, and state tax rules.",
    quickQuestions: [
      "How do I configure salary structure templates?",
      "How are Basic, HRA, and PF percentages defined?",
      "How do I add fixed allowances like Conveyance or Medical?",
    ],
    topics: [
      {
        keywords: ["salary template", "ctc template", "basic percent", "hra percent", "structure", "configure salary"],
        answer:
          "To configure salary templates:\n1. Head to **Settings -> Payroll** (or `/workspace/settings/payroll`).\n2. Click **'+ Add Template'** or edit an existing salary blueprint.\n3. Configure default proportions:\n   - **Basic Salary**: Typically 40% to 50% of CTC.\n   - **HRA**: Typically 20% to 25% of CTC.\n   - **Provident Fund (PF)**: 12% of Basic.\n   - **Conveyance & Medical**: Fixed amounts (e.g. ₹1600 & ₹1250) or custom percentages.\n   - **Professional Tax**: Fixed tier deduction (e.g. ₹200).\n4. Save template. You can link this template to designations during hiring.",
        action: { label: "Manage Salary Templates", url: "/workspace/settings/payroll" },
      },
    ],
  },

  {
    id: "settings-audit",
    name: "Audit Logs & Security",
    path: "/workspace/settings/audit-logs",
    summary: "Monitor chronological system actions, security changes, approvals, and user telemetry.",
    quickQuestions: [
      "Where can I view system audit logs?",
      "What actions are recorded in the audit trail?",
      "Can audit logs be altered or deleted?",
    ],
    topics: [
      {
        keywords: ["audit", "audit log", "security log", "history", "who did what", "track changes", "telemetry"],
        answer:
          "Audit Logs feature:\n1. Visit **Settings -> Audit Logs** (or `/workspace/settings/audit-logs`).\n2. The system maintains an immutable chronological log of actions:\n   - **CREATE**: New employee created, job posted, leave applied.\n   - **UPDATE**: Salary changed, status altered, profile edited.\n   - **DELETE**: Record removed.\n   - **APPROVE / REJECT**: Leave approved, resignation cleared, payroll finalized.\n3. Each entry logs User Identity, Action Badge, Target Entity, IP Address, Device Type, and ISO Timestamp.",
        action: { label: "View Audit Logs", url: "/workspace/settings/audit-logs" },
      },
    ],
  },

  {
    id: "settings-holidays",
    name: "Holidays & Company Calendar",
    path: "/workspace/settings/holidays",
    summary: "Define mandatory national holidays, optional festivals, and restricted leaves.",
    quickQuestions: [
      "How do I add holidays for the year?",
      "What is the difference between mandatory and optional holidays?",
    ],
    topics: [
      {
        keywords: ["holiday", "holidays", "add holiday", "public holiday", "calendar", "national holiday", "festival"],
        answer:
          "To set up the annual holiday calendar:\n1. Go to **Settings -> Holidays**.\n2. Click **'Add Holiday'**.\n3. Choose Date, Name (e.g. Independence Day, New Year, Diwali), and Type (**Mandatory** or **Restricted/Optional**).\n4. Mandatory holidays automatically reflect on attendance sheets as paid off-days and do not count against employee leave balances.",
        action: { label: "Manage Holiday Calendar", url: "/workspace/settings/holidays" },
      },
    ],
  },

  {
    id: "settings-general",
    name: "Company Settings & Administration",
    path: "/workspace/settings",
    summary: "Manage company profile, organization branding, roles & permissions, and departments.",
    quickQuestions: [
      "How do I update company branding and logo?",
      "How do I configure roles and permissions (RBAC)?",
      "Where do I add new departments and designations?",
    ],
    topics: [
      {
        keywords: ["company profile", "logo", "branding", "organization", "timezone", "address"],
        answer:
          "To update company information:\n1. Navigate to **Settings**.\n2. Under **Company Profile**, upload your corporate logo and brand colors.\n3. Set your legal business name, registered address, tax IDs (GSTIN/CIN/EIN), and default time zone.",
        action: { label: "Open Company Settings", url: "/workspace/settings" },
      },
      {
        keywords: ["role", "permissions", "rbac", "admin access", "hr permissions", "access control"],
        answer:
          "Roles & Permissions Matrix in GlobizHR:\n- **ADMIN**: Complete system control, billing, audit logs, and settings.\n- **HR_MANAGER**: Employee records, onboarding, leave/attendance approvals, payroll runs, recruitment.\n- **DEPARTMENT_MANAGER**: Approves direct report leaves, attendance regularizations, and submits training recommendations.\n- **EMPLOYEE**: Self-service portal (apply leaves, clock attendance, view payslips, raise support tickets).",
        action: { label: "Manage Roles & Permissions", url: "/workspace/settings" },
      },
      {
        keywords: ["designation", "department", "add department", "job title", "hierarchy"],
        answer:
          "To configure organizational hierarchy:\n1. Go to **Settings -> Designations**.\n2. Add company departments (Engineering, Human Resources, Finance, Sales, Operations).\n3. Add designations/roles under each department with their reporting level.",
        action: { label: "View Designations", url: "/workspace/settings/designations" },
      },
    ],
  },

  {
    id: "tasks",
    name: "Tasks & Action Items",
    path: "/workspace/tasks",
    summary: "Assign internal action items, track deadlines, set priority levels, and collaborate.",
    quickQuestions: [
      "How do I assign a task to an employee?",
      "How do I track task deadlines and status?",
    ],
    topics: [
      {
        keywords: ["task", "create task", "assign task", "todo", "action item", "deadline"],
        answer:
          "To assign internal work tasks:\n1. Go to **Tasks**.\n2. Click **'Create Task'**.\n3. Enter Title, detailed instructions, due date, and priority (Low, Medium, High, Urgent).\n4. Assign to an employee or multiple assignees.\n5. Team members can update status from **To Do** -> **In Progress** -> **Completed** with attachments.",
        action: { label: "Open Tasks", url: "/workspace/tasks" },
      },
    ],
  },

  {
    id: "profile",
    name: "Employee Self-Service Profile",
    path: "/workspace/profile",
    summary: "View and edit personal details, emergency contacts, encrypted bank data, and security settings.",
    quickQuestions: [
      "How do I update my bank account or tax information?",
      "How do I change my login password or enable two-factor auth?",
      "Where do I update my emergency contacts?",
    ],
    topics: [
      {
        keywords: ["profile", "bank details", "update bank", "pan", "aadhaar", "ifsc", "account number"],
        answer:
          "To update your banking or statutory data:\n1. Click your avatar in the top right or go to **Profile**.\n2. Switch to the **Bank & Statutory** tab.\n3. Update your Bank Name, Account Number, IFSC, and Tax IDs (PAN / Aadhaar / UAN).\n4. All sensitive financial records are encrypted using AES-256 for maximum security.",
        action: { label: "Open My Profile", url: "/workspace/profile" },
      },
      {
        keywords: ["password", "change password", "security", "login", "reset password", "2fa"],
        answer:
          "To manage your account security:\n1. Visit **Profile** -> **Security** tab.\n2. Enter your current password followed by your new password (minimum 8 characters with letters, numbers, and symbols).\n3. Click **Update Password** to secure your account across all active sessions.",
        action: { label: "View Security Settings", url: "/workspace/profile" },
      },
    ],
  },

  {
    id: "support",
    name: "Help & Support Tickets",
    path: "/workspace/support",
    summary: "Raise internal IT, HR, or workplace tickets and track their resolution.",
    quickQuestions: [
      "How do I raise an HR or IT ticket?",
      "How to check the status of my ticket?",
      "How do admins resolve support tickets?",
    ],
    topics: [
      {
        keywords: ["ticket", "raise ticket", "issue", "it support", "hr query", "help desk", "problem"],
        answer:
          "To create an internal help ticket:\n1. Navigate to **Support**.\n2. Click **'Create Ticket'**.\n3. Pick the category (Hardware/IT, HR Query, Payroll Dispute, Facilities, Software Access).\n4. Select priority level (Low, Medium, High) and describe the problem.\n5. Click **Submit Ticket**. You will receive notifications as the assigned support agent updates the ticket status.",
        action: { label: "Open Support Desk", url: "/workspace/support" },
      },
      {
        keywords: ["status", "ticket status", "open tickets", "resolved"],
        answer:
          "To track existing tickets:\n1. Open **Support**.\n2. Filter by status: **Open**, **In Progress**, or **Resolved**.\n3. Click on any ticket to view response comments, request clarifications, or add attachments.",
        action: { label: "View My Tickets", url: "/workspace/support" },
      },
    ],
  },
];

/**
 * Common acronyms expansion mapping for HRMS queries
 */
const ACRONYMS_MAP: Record<string, string[]> = {
  ctc: ["salary", "payroll", "template", "compensation"],
  pf: ["provident fund", "deductions", "payroll"],
  hra: ["house rent", "allowance", "salary"],
  lop: ["loss of pay", "unpaid", "deduction", "leave"],
  lwd: ["last working day", "resignation", "notice period"],
  kyc: ["document", "identity", "passport", "aadhar", "pan"],
  csv: ["bulk", "import", "export", "excel"],
  fnf: ["full and final", "settlement", "resignation"],
  rbac: ["roles", "permissions", "access control"],
  tds: ["tax", "deductions", "income tax"],
  pt: ["professional tax", "deductions"],
  wo: ["weekly off", "schedule", "roster"],
};

/**
 * Intelligent local matcher that inspects the user query, current route, and role.
 */
export function matchHRMSKnowledge(
  query: string,
  currentRoute: string = "",
  role: string = "EMPLOYEE"
): CopilotResponse {
  const cleanQuery = (query || "").trim().toLowerCase();

  // Find module matching current route (most specific route match first)
  const sortedModules = [...HRMS_MODULE_GUIDES].sort(
    (a, b) => b.path.length - a.path.length
  );
  const currentModule = sortedModules.find((m) =>
    currentRoute.startsWith(m.path)
  );

  // If query is empty or a simple greeting, provide a smart route-based welcome
  const isGreeting =
    !cleanQuery ||
    ["hi", "hello", "hey", "help", "who are you", "what can you do", "start", "guide me"].includes(
      cleanQuery
    );

  if (isGreeting) {
    if (currentModule) {
      return {
        reply: `👋 **Hi there! I am Gpilot, your GlobizHR assistant.**\n\nYou are currently on the **${currentModule.name}** page.\n\n${currentModule.summary}\n\nHere are the most common tasks you can do here:`,
        suggestedActions: [
          { label: `Explore ${currentModule.name}`, url: currentModule.path },
        ],
        suggestedQuestions: currentModule.quickQuestions,
        source: "knowledge_base",
      };
    }

    return {
      reply: `👋 **Hello! I am Gpilot, your GlobizHR AI Assistant.**\n\nI can guide you step-by-step through any task in the HRMS—from onboarding and leave applications to payroll runs, shifts, and document verification.\n\nWhat would you like help with today?`,
      suggestedActions: [
        { label: "Employees Directory", url: "/workspace/employees" },
        { label: "Apply for Leave", url: "/workspace/leave" },
        { label: "Clock Attendance", url: "/workspace/attendance" },
        { label: "My Payslips", url: "/workspace/my-payslips" },
      ],
      suggestedQuestions: [
        "How do I add a new employee?",
        "How do I apply for leave?",
        "Where can I find my payslips?",
        "How do I configure salary templates?",
      ],
      source: "knowledge_base",
    };
  }

  // Expand query with acronym meanings
  let expandedQuery = cleanQuery;
  const words = cleanQuery.split(/\s+/);
  for (const w of words) {
    if (ACRONYMS_MAP[w]) {
      expandedQuery += " " + ACRONYMS_MAP[w].join(" ");
    }
  }

  // Score all topics across all modules
  let bestMatch: {
    score: number;
    answer: string;
    action?: CopilotAction;
    module: ModuleGuide;
  } | null = null;

  for (const mod of HRMS_MODULE_GUIDES) {
    for (const topic of mod.topics) {
      let score = 0;
      for (const kw of topic.keywords) {
        if (expandedQuery.includes(kw)) {
          // Weight multi-word matches heavier
          score += kw.split(" ").length * 4;
        }
      }

      // Bonus if topic belongs to the user's active route
      if (currentRoute.startsWith(mod.path)) {
        score += 3;
      }

      if (score > (bestMatch?.score || 0)) {
        bestMatch = {
          score,
          answer: topic.answer,
          action: topic.action,
          module: mod,
        };
      }
    }
  }

  if (bestMatch && bestMatch.score > 0) {
    const otherQuestions = bestMatch.module.quickQuestions.filter(
      (q) => !cleanQuery.includes(q.toLowerCase().slice(0, 10))
    );

    return {
      reply: bestMatch.answer,
      suggestedActions: bestMatch.action ? [bestMatch.action] : undefined,
      suggestedQuestions: otherQuestions.slice(0, 3),
      source: "knowledge_base",
    };
  }

  // Fallback if no specific topic scored
  const defaultQuestions = currentModule
    ? currentModule.quickQuestions
    : [
        "How do I add an employee?",
        "How do I apply for leave?",
        "How do I run monthly payroll?",
        "How do exit clearances work?",
      ];

  return {
    reply: `I couldn't find an exact match for **"${query}"**, but here are key modules you can explore in GlobizHR:\n\n- **Employees & Directory**: Add employees, import from CSV/Excel, verify KYC documents.\n- **Leave & Attendance**: Apply for time off, manage shifts, clock in/out, and regularize punches.\n- **Payroll & Payslips**: Configure CTC templates, run monthly payroll, and download payslip PDFs.\n- **Recruitment & Onboarding**: Post job openings, manage candidate pipeline, and assign new joiner checklists.\n- **Training & Career**: Enroll cohorts, track skill assessments, and manage certifications.\n- **Resignation & Clearances**: Notice period calculation and multi-department exit sign-offs.\n- **Settings**: Company profile, holiday calendar, salary templates, and security audit logs.\n\nClick any suggested question below or pick a module to navigate!`,
    suggestedActions: [
      { label: "Go to Dashboard", url: "/workspace/dashboard" },
      { label: "Help & Support Desk", url: "/workspace/support" },
      { label: "Company Settings", url: "/workspace/settings" },
    ],
    suggestedQuestions: defaultQuestions,
    source: "knowledge_base",
  };
}
