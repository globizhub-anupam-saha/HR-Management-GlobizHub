# GlobizHR Privacy Notice

**Last Updated: November 2026**

---

## GlobizHR's Commitment to Privacy

GlobizHR is committed to keeping your data safe and secure. We believe in earning your trust through transparency, strong security practices, and responsible data handling. We do not sell, rent, or trade your personal information to third parties for advertising or any other purpose. Read this privacy notice along with [GlobizHR's Privacy Policy](https://globizhr.com/privacy) to understand what information we collect through GlobizHR, how it is stored, and how it is used.

---

## About GlobizHR

GlobizHR is a cloud-based Human Resource Management System (HRMS) designed to manage and access all your employee data from a centralized location. GlobizHR provides both a web application and mobile applications on iOS and Android (via Globizhub Careers and capacitor-based apps) to facilitate employee self-service and easy access to everyday HR tasks.

Key features of the platform include:

- **Employee Management** — Centralized employee profiles, organizational charts, department and branch management, designations, and reporting structures.
- **Attendance & Shift Management** — GPS/Wi-Fi based check-in/check-out, selfie verification, split shifts, night shifts, shift swaps, and schedule management.
- **Leave Management** — Configurable leave policies, leave allocation, leave requests and approvals, leave balance tracking, and transaction ledger.
- **Payroll & Statutory Compliance** — Salary structures, payroll batch processing, pay slips, tax declarations (TDS/Section 192/194J), PF/ESI contributions, professional tax, loans, and salary revisions.
- **Recruitment** — Manpower requisitions, job postings, candidate management, interview scheduling, scorecards, job offers, and candidate-to-employee conversion via Globizhub Careers portal.
- **Onboarding & Offboarding** — Onboarding templates and cases, task checklists, document collection, resignation workflows, exit interviews, and clearance processes.
- **Training & Competency Development** — Training programs, training plans, session management, assessments, certifications, competency tracking, and career progression (promotions/transfers).
- **Document Management** — Secure document upload, categorization (Employment, Compliance, Company, Personal), e-signature tracking, and HR verification workflows.
- **Notifications & Announcements** — System notifications, email notifications, push notifications, and company-wide announcements.
- **Audit & Compliance** — Comprehensive audit logs tracking all user actions, IP addresses, and data change history.

---

## Information Entrusted to GlobizHR

We process the information that you and your organization entrust to us. The following sections describe the types of data collected and how they are used across different modules of the platform.

---

## 1. Organization Information

When an organization registers with GlobizHR, we collect:

| Data Category | Information Collected |
|---|---|
| **Company Identity** | Company name, legal name, industry, size, CIN/registration number, GSTIN/tax ID, PAN, website, incorporation date |
| **Contact Information** | Official email, phone number, office address (city, state, country, pincode) |
| **Configuration** | Timezone, working days, fiscal year, attendance method preferences, shift settings, leave policy defaults, pay cycle configuration |
| **Branding** | Company logo, theme color, payslip header image |

This information is used to configure and personalize the HRMS platform for your organization.

---

## 2. Employee Personal Information

When employees are added to GlobizHR, the following information is collected and processed:

| Data Category | Information Collected |
|---|---|
| **Identity** | First name, last name, email address, phone number, employee code, profile photo |
| **Demographics** | Gender, blood group, date of joining |
| **Employment Details** | Department, designation, role, reporting manager, employment status (Invited, Onboarding, Active, Notice Period, Terminated, Resigned), worker type (Salaried, Consultant, Contract Labour) |
| **Financial Information** | Bank name, account number, IFSC code, PAN number, national ID (e.g., Aadhaar), PF account number, UAN number |
| **Emergency Contacts** | Contact name, relationship, phone, email |
| **Skills & Employment History** | Professional skills and proficiency levels, previous employment records |
| **Preferences** | Theme preference, time format, notification settings |

> [!IMPORTANT]
> **Sensitive Financial Data**: Bank account details, PAN numbers, Aadhaar/national IDs, PF account numbers, and UAN numbers are classified as sensitive personal information. Access to this data is strictly controlled based on organizational role permissions.

---

## 3. GlobizHR Attendance Service Privacy Notice

### Information Processed for Location-Based Attendance

The GPS/Wi-Fi based attendance tracking feature in GlobizHR can be enabled based on your organization's preferences. Once enabled, this feature enhances attendance management by validating employee presence using geographic location and/or Wi-Fi network verification, adhering to privacy protocols, and storing data in a secure environment.

By choosing to use the location-based attendance feature, the following types of information will be processed:

#### Data Processed

**Location Data**

When you enable the location tracking feature, the geographic location (latitude and longitude coordinates) of employees marking their attendance is captured and used to verify their physical presence at the designated work location against the configured office coordinates and allowed radius.

**Device & Network Data**

Depending on your attendance configuration, the following device-related data may also be captured:

- Wi-Fi SSID of the connected network (when Wi-Fi verification is enabled)
- IP address of the connected network
- Device identifier (browser fingerprint or mobile device ID)
- Device name and type

#### Location data processed based on GlobizHR attendance settings

| Setting | Data Behavior |
|---|---|
| **GPS Only** | The employee's GPS coordinates are captured to validate proximity to the office location. Location data is stored with the attendance record. |
| **Wi-Fi Only** | The connected Wi-Fi network SSID is captured and matched against allowed office SSIDs. No GPS coordinates are stored. |
| **GPS and Wi-Fi** | Both GPS coordinates and Wi-Fi SSID are captured for dual verification. Both data points are stored with the attendance record. |
| **IP Restriction** | The employee's IP address is captured and validated against the configured office IP address. |

#### Location capture based on platform

- **Web-based attendance**: For web-based check-in and check-out, GlobizHR captures employees' location data (latitude and longitude coordinates) using the browser's geolocation API. If the employee's browser location setting is disabled, the system will capture location data based on the IP address of the connected network.
- **Mobile-based attendance**: For mobile-based check-in and check-out, GlobizHR captures location data from the employee's device GPS. If the device GPS is disabled, location data will not be captured.

### Information Processed for Selfie Verification

The selfie-based verification feature in GlobizHR can be enabled based on your organization's preferences (`requireSelfie` setting). Once enabled, this feature enhances attendance integrity by requiring employees to capture a selfie photo at the time of check-in and/or check-out.

#### Data Processed

**Image Data**

When selfie verification is enabled, an image of the employee is captured during attendance marking. This image is stored securely on our servers and is linked to the corresponding attendance record. Access to the photo is granted to authorized employees within your organization, based on the permissions set by your organization.

> [!NOTE]
> GlobizHR's selfie verification is an **image capture and storage** mechanism for attendance verification. It captures and stores employee photos at check-in/check-out for manual review by authorized personnel. It does not perform automated facial recognition or biometric template matching.

### Device Registration & Control

GlobizHR supports device registration and restriction for attendance purposes:

| Setting | Data Behavior |
|---|---|
| **One Device Per Employee** | When enabled, only the first approved device can be used for attendance. The device identifier (browser fingerprint or device ID), device name, and last-used timestamp are stored. |
| **Multiple Devices** | When enabled, employees may register multiple devices. Each device undergoes an approval workflow (Pending → Approved/Rejected). |

Device data stored includes:
- Device name (e.g., "Windows Chrome", "iPhone 14")
- Device identifier (browser fingerprint or mobile device ID)
- Approval status and last-used timestamp

### Mock Location Detection

When enabled (`enableMockLocation` setting), GlobizHR's mobile application will detect and block attempts to use fake GPS applications. No additional personal data is collected for this feature beyond the standard GPS coordinates.

---

## 4. Payroll & Financial Data

GlobizHR processes the following financial information for payroll purposes:

| Data Category | Information Collected |
|---|---|
| **Salary Structure** | Basic salary, HRA, conveyance allowance, medical allowance, special allowance, other allowances, PF contribution, tax deduction, professional tax, custom salary components |
| **Consultant/194J Data** | Retainer fees, OPD consultation rates, surgery share percentages, professional fees |
| **Payroll Records** | Monthly pay breakdowns, attendance snapshots, overtime hours, net salary, arrears, night shift allowance, TDS deductions, loan deductions |
| **Tax Information** | TDS section (192/194J), TDS rates, tax declaration data, form type (Form 16/16A) |
| **Loan Records** | Loan amounts, EMI details, interest rates, disbursement and repayment history |
| **Salary Revisions** | Previous and new salary, effective dates, arrears calculations |
| **Statutory Data** | PF/ESI establishment details, contribution records, statutory return filings |

> [!CAUTION]
> **Financial Data Security**: All payroll and financial data is encrypted at rest and in transit. Payroll records are immutable once processed — financial snapshots are stored as JSON breakdowns to ensure payslip accuracy even if salary structures are later modified.

---

## 5. Recruitment Data

When using the GlobizHR recruitment module (via Globizhub Careers), the following candidate information is collected:

| Data Category | Information Collected |
|---|---|
| **Candidate Profile** | First name, last name, email, phone, current company, current title, total experience, current location |
| **Professional Links** | LinkedIn URL, portfolio URL |
| **Application Materials** | Resume (uploaded to secure storage), cover letter, screening question responses |
| **Interview Data** | Scheduled interview details, interviewer assignments, scorecard ratings, strengths/concerns notes, recommendations |
| **Offer Data** | Compensation details, joining date, terms and conditions, approval chain history |

Candidates apply through the public Globizhub Careers portal. Their data is accessible only to authorized employees within the hiring organization based on configured permissions.

---

## 6. Training & Competency Data

| Data Category | Information Collected |
|---|---|
| **Training Records** | Enrollment status, attendance, completion percentage, hours spent, assessment scores, feedback |
| **Certifications** | Certificate titles, issuing organization, issue/expiry dates, verification status, credential URLs |
| **Competency Profiles** | Competency assessments, proficiency levels, assessor details, evidence documentation |
| **Career Progression** | Position change records (promotions, transfers, redesignations), evaluation outcomes, decision history |

---

## 7. Document Management Data

GlobizHR stores documents uploaded by employees and administrators in the following categories:

- **Employment Documents** — Offer letters, NDAs, appointment letters
- **Compliance Documents** — PAN card, passport, bank proofs, identity documents
- **Company Documents** — Policies, handbooks, organizational documents
- **Personal Documents** — Employee's private files

All documents are stored securely using encrypted cloud storage (AWS S3/compatible). Documents go through a verification workflow (Requested → Submitted → Verified/Rejected). E-signature tracking is available for documents that require employee acknowledgement.

---

## 8. System & Audit Data

GlobizHR automatically collects the following system data:

| Data Category | Information Collected |
|---|---|
| **Audit Logs** | Actor identity, action performed, entity affected, old/new values (data snapshots), IP address, user agent, timestamp |
| **Authentication Data** | Login timestamps, session information, password reset tokens (temporary), invite tokens (temporary) |
| **Platform Logs** | API access logs, error logs, security events |

> [!NOTE]
> Audit logs are designed for compliance and security monitoring. They provide a complete, immutable trail of all data changes within the system. Audit logs are retained according to your organization's configured data retention policy and applicable legal requirements.

---

## Access and Data Security

### Permission-Based Access Control

Access to all employee data within GlobizHR is controlled by a multi-layered permission system:

- **Role-Based Access**: Built-in roles (Super Admin, HR Head, Owner, Manager, Employee) with predefined access levels.
- **Custom Roles & Designations**: Organizations can create custom roles with granular permissions (e.g., `employee.create`, `leave.approve`) and designations with configurable sidebar modules, module permissions, and dashboard widgets.
- **Reporting Hierarchy**: Managers can access data for their direct reports; employee data visibility follows the organizational reporting chain.

### Data Residency

All data is securely stored within GlobizHR's designated data centres, with robust security and privacy protections in place, including:

- **Encryption at rest** for all stored data (PostgreSQL database and S3-compatible object storage)
- **Encryption in transit** (TLS/HTTPS) for all data transmissions
- **Hashed passwords** using industry-standard algorithms (passwords are never stored in plain text)
- **Session management** with configurable timeout periods
- **MFA support** for platform administration accounts

### No Third-Party Sharing

We do not sell, rent, or share your employees' personal, financial, attendance, location, or document data with any third parties, except:

- When required by applicable law, regulation, or legal process
- With your explicit written consent
- To service providers who process data on our behalf under strict contractual obligations (e.g., email delivery, cloud hosting infrastructure)

---

## Multi-Tenant Data Isolation

GlobizHR operates as a multi-tenant SaaS platform. Each organization's data is logically isolated:

- All data records are scoped to a unique `companyId`
- Cross-tenant data access is architecturally prevented at the database query level
- Each organization administers its own users, roles, and permissions independently
- Platform-level administration (subscription management, support) is handled by a separate platform admin system with its own authentication and audit trail

---

## User Rights and Opt-Out Options

### For Employees

Employees have the following rights regarding their data:

- **Access**: Employees can view their own profile, attendance records, leave history, payslips, documents, and training records through the self-service portal.
- **Correction**: Employees can request corrections to their attendance records through the Attendance Correction workflow and update their personal profile information.
- **Portability**: Employees can download their payslips and documents from the platform.
- **Opt-Out of Location Services**: Employees can disable location tracking on their mobile device or browser settings to opt out of location-based attendance verification.
- **Opt-Out of Notifications**: Employees can configure their notification preferences (attendance reminders, checkout reminders, leave updates, company announcements, email notifications, push notifications) through their profile settings.

> [!WARNING]
> **Important**: Opting out of location services or selfie verification will prevent employees from marking their attendance if these features have been configured as mandatory by their organization's administrators.

### For Candidates

Candidates who apply through the Globizhub Careers portal can:

- **Withdraw Applications**: Candidates can withdraw their applications at any time.
- **Request Data Deletion**: Candidates can request deletion of their data by contacting the hiring organization or GlobizHR support.

---

## Important Notice for Administrators

Before enabling location-based attendance, selfie verification, device restrictions, or IP-based access controls, administrators must ensure that the use of these features aligns with their organization's policies and complies with regional data protection laws (including but not limited to India's Digital Personal Data Protection Act, GDPR, CCPA, and other applicable regulations).

### Recommended Actions for Administrators

1. **Consult with IT and Privacy Teams**: Verify compliance with your IT, legal, or privacy teams to ensure compliance with internal policies and local regulations before enabling attendance tracking features.

2. **Conduct Privacy Impact Assessments**: Perform regular assessments to evaluate the impact of collecting location, device, and image data within your organization, ensuring that employee privacy is protected.

3. **Employee Consent & Transparency**: Based on your organization's policies and applicable laws:
   - Include the collection of location, device, and selfie data for attendance purposes in your workplace privacy policy or employee handbook.
   - Ensure employees understand how their data is collected, stored, and used.
   - Obtain necessary consents before enabling these features.

4. **Configure Appropriate Permissions**: Set up view and edit permissions for attendance entries, payroll records, and employee data to ensure only authorized personnel can access sensitive information.

5. **Review Audit Logs Regularly**: Monitor audit logs to detect unauthorized access or unusual activity patterns.

6. **Data Retention**: Establish and communicate clear data retention policies for attendance records, payroll data, recruitment records, and training records in compliance with applicable legal requirements.

> [!IMPORTANT]
> By enabling location tracking, selfie verification, device registration, IP restrictions, or any other data collection feature, you acknowledge that your organization has reviewed and accepted all associated legal, privacy, and policy implications. GlobizHR provides the tools — your organization is responsible for ensuring their lawful and ethical use.

---

## Data Retention

GlobizHR retains data as follows:

| Data Type | Retention Policy |
|---|---|
| **Employee Records** | Retained for the duration of the employment relationship and as required by applicable labor and tax laws thereafter |
| **Attendance Records** | Retained as configured by the organization, subject to minimum legal retention requirements |
| **Payroll Records** | Retained for a minimum of 8 years or as required by applicable tax and labor laws |
| **Recruitment Data** | Retained for the duration of the hiring process; archival as per organizational policy |
| **Audit Logs** | Retained for a minimum of 3 years or as required by applicable regulations |
| **Documents** | Retained until deleted by authorized personnel or as required by applicable laws |
| **Account Data** | Retained until the organization's subscription is terminated and all data deletion obligations are fulfilled |

---

## Changes to This Privacy Notice

We may update this privacy notice from time to time to reflect changes in our practices, features, or legal requirements. We will notify administrators of material changes through the platform notification system and/or email. Continued use of GlobizHR after such notification constitutes acceptance of the updated privacy notice.

---

## Contact Us

For questions, concerns, or requests regarding this privacy notice or your data:

- **Email**: privacy@globizhr.com
- **Support Portal**: Available through the GlobizHR platform (Support module)
- **Data Protection Officer**: dpo@globizhr.com

---

*This privacy notice is effective as of November 2026 and applies to all users of the GlobizHR platform.*
