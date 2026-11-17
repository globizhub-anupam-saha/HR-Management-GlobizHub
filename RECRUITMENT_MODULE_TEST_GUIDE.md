# Standard Operating Procedure (SOP): Recruitment Module End-to-End QA Test

## 1. Purpose

This SOP defines the standard process for validating the full recruitment lifecycle in GlobizHR, from requisition creation to employee onboarding. It is intended for business users, QA testers, and HR operations teams who are not expected to have technical knowledge.

## 2. Scope

This procedure covers the following business flow:

- Manpower requisition creation and approval
- Job vacancy creation and publishing
- Candidate application from public careers portal
- Candidate screening and interview evaluation
- Offer formulation and approval
- Offer acceptance and onboarding conversion
- Final recruitment closure and employee creation

## 3. Roles and Responsibilities

- HR Admin / HR Head: creates requisitions, approves requests, publishes jobs, and approves offers
- Recruiter: reviews applications, schedules interviews, and moves candidates through stages
- Candidate: applies via public careers portal
- QA Tester / Business User: validates business process and records evidence

## 4. Prerequisites

Before starting the test, ensure the following are available:

1. The application is running locally.
2. The user is signed in as an Admin or HR Head.
3. At least one department exists.
4. At least one role/designation exists.
5. At least one employee is available for interview panel assignment.
6. At least one employee is available for reporting manager assignment.
7. A candidate browser is available in Incognito / Private mode.
8. A test PDF or DOCX file is ready for resume upload.

## 5. Test Data

Use the following sample values unless a different approved value is already configured in the environment:

- Department: Engineering
- Role: Senior Full-Stack Engineer
- Job openings: 1
- Budget: ₹12,00,000
- Min Experience: 3 years
- Candidate Name: Aarav Sharma
- Candidate Email: aarav.sharma+test01@example.com
- Target Annual CTC: ₹12,00,000
- Screening Questions:
  - How many years of Next.js experience do you have?
  - What is your notice period in days?

> Note: system-generated codes such as requisition numbers, job codes, application numbers, offer codes, and employee codes will vary by environment and should be captured during testing.

## 6. Critical UI Labels to Use

The actual application uses the following labels. Use these names during testing:

- `Request Manpower`
- `Create Job`
- `Save as Draft`
- `Save Draft Job Requisition`
- `Submit`
- `Review`
- `Approve Requisition & Budget`
- `Publish Job`
- `Apply Now`
- `Submit Application`
- `Move to Screening`
- `Shortlist Candidate`
- `Schedule Interview`
- `Submit Scorecard`
- `Mark as Selected (Ready for Offer)`
- `Formulate Job Offer & CTC` or `Formulate Job Offer`
- `Save Offer Draft`
- `Submit for Internal Approval`
- `Approve Offer CTC`
- `Preview Offer Letter`
- `Send Offer to Candidate`
- `Record Acceptance 🎉`
- `Onboard as Employee`
- `Confirm & Onboard Employee`

## 7. Required Evidence

For every major step, capture the following:

- Screenshot of the page or modal
- Date and time of validation
- Test status: Pass / Fail
- Any error message shown
- System-generated codes captured during the step
- Tester comments, if any

## 8. Step-by-Step Procedure

### Phase 1: Requisition Governance

#### Step 1.1: Open recruitment workspace

Purpose: Verify recruiter access to the Recruitment module.

Procedure:
1. Sign in as Admin or HR Head.
2. Navigate to `http://localhost:3000/workspace/recruitment`.
3. Confirm the page title displays `Recruitment & Hiring`.

Screenshot Placeholder:
- [Insert screenshot: Recruitment & Hiring page]

Expected Result:
- Recruitment dashboard loads successfully.
- Tester can access the recruitment workspace.

#### Step 1.2: Create manpower requisition

Purpose: Validate requisition creation and draft saving.

Procedure:
1. Click `Request Manpower`.
2. Fill in the form with:
   - Department
   - Role: Senior Full-Stack Engineer
   - Positions: 1
   - Employment Type: Full Time
   - Location: Remote or office city
   - Hiring Reason: New Position
3. Click `Next`.
4. Enter:
   - Min Experience: 3
   - Max Experience: 6
   - Min Salary / LPA: 900000
   - Max Salary / LPA: 1200000
   - Allocated Budget Amount: 1200000
5. Click `Next`.
6. Add skill entries such as `Next.js` and `React`.
7. Enter a business justification.
8. Click `Save as Draft`.

Screenshot Placeholder:
- [Insert screenshot: New Manpower Requisition form]
- [Insert screenshot: requisition saved as draft]

Expected Result:
- Requisition saves in `DRAFT` status.
- A requisition code is generated.

#### Step 1.3: Submit and approve requisition

Purpose: Validate requisition governance approval flow.

Procedure:
1. In the requisition row, click `Submit`.
2. Click `Review`.
3. In the review modal, choose the approval action.
4. Click `Approve Requisition & Budget`.
5. Confirm status changes to `APPROVED`.

Screenshot Placeholder:
- [Insert screenshot: requisition review modal]
- [Insert screenshot: approved requisition status]

Expected Result:
- Requisition status becomes `APPROVED`.
- `Create Job` is available for this requisition.

### Phase 2: Job Vacancy Creation and Publishing

#### Step 2.1: Create job from approved requisition

Purpose: Verify job creation from approved manpower request.

Procedure:
1. Click `Create Job` on the approved requisition row.
2. Select the approved requisition.
3. Verify department, title, and budget are auto-filled.
4. Enter job description and responsibilities.
5. Add screening questions.
6. Click `Save Draft Job Requisition`.

Screenshot Placeholder:
- [Insert screenshot: Create Job Vacancy modal]
- [Insert screenshot: screening questions added]

Expected Result:
- Job draft is created successfully.
- Job details are auto-populated from the requisition.

#### Step 2.2: Publish job vacancy

Purpose: Confirm vacancy becomes visible to external candidates.

Procedure:
1. Go to the `Job Requisitions` tab.
2. Locate the newly created job.
3. Click `Publish Job`.
4. Verify the status changes to `PUBLISHED`.

Screenshot Placeholder:
- [Insert screenshot: job requisition list showing published status]

Expected Result:
- Job status is `PUBLISHED`.
- A job code is visible.
- Candidate portal can display this vacancy.

### Phase 3: Public Careers Portal and Candidate Application

#### Step 3.1: Open public careers portal

Purpose: Validate external-facing application flow.

Procedure:
1. Open a new Incognito / Private browser window.
2. Navigate to `http://localhost:3000/careers`.
3. Search for the role `Senior Full-Stack Engineer`.
4. Click `Apply Now`.

Screenshot Placeholder:
- [Insert screenshot: careers portal listing the published role]
- [Insert screenshot: job application form]

Expected Result:
- The public page displays the published vacancy.
- Candidate can begin the application form.

#### Step 3.2: Submit candidate application

Purpose: Confirm candidate can apply successfully.

Procedure:
1. Fill in candidate details:
   - First Name: Aarav
   - Last Name: Sharma
   - Email: aarav.sharma+test01@example.com
2. Enter phone number.
3. Answer screening questions.
4. Upload resume PDF/DOCX.
5. Click `Submit Application`.

Screenshot Placeholder:
- [Insert screenshot: completed application form]
- [Insert screenshot: application success confirmation page]

Expected Result:
- Confirmation screen appears.
- Application number is generated.
- Candidate submission is accepted.

### Phase 4: Screening, Interview and Selection

#### Step 4.1: Review candidate in recruitment workspace

Purpose: Validate recruiter handling of candidate records.

Procedure:
1. Return to the recruiter window.
2. Open `http://localhost:3000/workspace/recruitment`.
3. Go to `Candidates & Applications`.
4. Locate Aarav Sharma.
5. Open the candidate detail view.

Screenshot Placeholder:
- [Insert screenshot: candidate row in candidates list]
- [Insert screenshot: candidate detail modal overview]

Expected Result:
- Candidate is visible as `APPLIED`.
- Candidate profile details and resume can be reviewed.

#### Step 4.2: Advance candidate stages

Purpose: Validate stage progression logic.

Procedure:
1. Click `Move to Screening`.
2. Click `Shortlist Candidate`.
3. Go to `Interviews` tab.
4. Click `Schedule Interview`.
5. Select interview round, interviewer, date, and time.
6. Click `Schedule Interview`.
7. On the interview card, click `Submit Scorecard`.
8. Rate evaluation criteria.
9. Select recommendation `STRONG_YES`.
10. Click `Submit Scorecard`.
11. Go to `Overview` tab.
12. Click `Mark as Selected (Ready for Offer)`.

Screenshot Placeholder:
- [Insert screenshot: candidate in screening stage]
- [Insert screenshot: scheduled interview]
- [Insert screenshot: scorecard submission]
- [Insert screenshot: selected candidate status]

Expected Result:
- Candidate reaches `SELECTED` status.
- Banner suggests offer formulation.

### Phase 5: Offer Creation and Approval

#### Step 5.1: Formulate job offer

Purpose: Verify offer creation and salary breakdown generation.

Procedure:
1. Click `Formulate Job Offer & CTC` or `Formulate Job Offer`.
2. Enter target annual CTC: `1200000`.
3. Click `Suggest Proportions`.
4. Confirm compensation components are calculated.
5. Fill Joining Date and Reporting Manager.
6. Click `Save Offer Draft`.

Screenshot Placeholder:
- [Insert screenshot: offer modal with compensation breakdown]
- [Insert screenshot: draft offer created]

Expected Result:
- Offer draft is saved.
- Offer code is generated.
- Offer status is `DRAFT`.

#### Step 5.2: Submit and approve offer

Purpose: Validate governance approval of compensation package.

Procedure:
1. Click `Submit for Internal Approval`.
2. Confirm status changes to `PENDING_APPROVAL`.
3. Click `Approve Offer CTC`.
4. Confirm approval.
5. Verify status becomes `APPROVED`.

Screenshot Placeholder:
- [Insert screenshot: pending approval status]
- [Insert screenshot: approval confirmation]

Expected Result:
- Offer is approved successfully.
- Internal approval path completes without error.

#### Step 5.3: Preview, send, and accept offer

Purpose: Validate communication and candidate acceptance.

Procedure:
1. Click `Preview Offer Letter`.
2. Review the letter and compensation table.
3. Click `Send Offer to Candidate`.
4. Wait for status to change to `SENT`.
5. Click `Record Acceptance 🎉`.
6. Confirm the offer status changes to `ACCEPTED`.

Screenshot Placeholder:
- [Insert screenshot: offer letter preview]
- [Insert screenshot: sent offer status]
- [Insert screenshot: accepted offer status]

Expected Result:
- Offer is successfully sent and accepted.
- Candidate is ready for onboarding.

### Phase 6: Employee Onboarding and Recruitment Closure

#### Step 6.1: Onboard as employee

Purpose: Validate conversion from candidate to employee and payroll setup.

Procedure:
1. Click `Onboard as Employee`.
2. Review the pre-flight summary.
3. Confirm candidate identity, role, department, and offer salary data.
4. Click `Confirm & Onboard Employee`.
5. Wait for the loading state to show `Provisioning Employee...`.

Screenshot Placeholder:
- [Insert screenshot: onboarding conversion modal]
- [Insert screenshot: provisioning employee loading state]

Expected Result:
- Employee is created.
- Payroll structure is seeded.
- Onboarding tasks are created.
- Employee code is assigned.

#### Step 6.2: Post-conversion verification

Purpose: Confirm recruitment closure and employee onboarding status.

Procedure:
1. Review the success screen showing employee code and onboarding status.
2. Click `Employee Directory`.
3. Verify the employee appears in the directory with status `ONBOARDING`.
4. Click `Onboarding Hub`.
5. Verify onboarding checklist is active.
6. Return to recruitment workspace.
7. Confirm candidate is now marked `Hired 🌟`.
8. Verify job requisition is closed if the opening count was 1.

Screenshot Placeholder:
- [Insert screenshot: post-conversion success screen]
- [Insert screenshot: employee directory with employee status]
- [Insert screenshot: onboarding hub checklist]
- [Insert screenshot: recruitment screen showing hired status]

Expected Result:
- Candidate is converted to employee.
- Onboarding is active.
- Recruitment closure is reflected in the system.

## 9. Pass / Fail Criteria

The test is considered PASS if all of the following are true:

- Requisition is created and approved.
- Job vacancy is published successfully.
- Candidate can apply to the public career page.
- Candidate reaches `SELECTED` stage after screening and interview.
- Offer is drafted, approved, and sent.
- Offer is accepted.
- Candidate is onboarded as an employee.
- Employee appears in employee directory and onboarding hub.
- Recruiter view reflects final hired status.

The test is considered FAIL if any step fails, shows incorrect labels, does not progress to the expected status, or prevents completion of the business flow.

## 10. Defect Reporting Template

Use the following format when reporting a defect:

- Test Case ID:
- Date:
- Tester Name:
- Module: Recruitment
- Step Number:
- Expected Result:
- Actual Result:
- Error Message:
- Screenshot Reference:
- Severity:
- Notes:

## 11. Closure Checklist

Before closing the SOP execution, confirm:

- [ ] Requisition created and approved
- [ ] Job published
- [ ] Candidate applied
- [ ] Candidate screened and shortlisted
- [ ] Interview scheduled and scored
- [ ] Candidate selected
- [ ] Offer formulated and approved
- [ ] Offer accepted
- [ ] Employee onboarded
- [ ] Hired badge visible in recruitment dashboard
- [ ] Screenshots saved for all critical steps

## 12. Final Note

Always rely on the button labels shown in the current UI. The application uses the official names shown in this document. Do not use older labels that may not exist in the system.
