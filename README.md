# College Template

Frappe/ERPNext custom app for **College ERP Management** — a complete student-lifecycle platform covering admissions, academics, examinations, placements, alumni, and institutional back office.

**Compatible with Frappe/ERPNext v15+**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Implemented Features ✅](#implemented-features-)
- [Integration Configurations Ready 🔧](#integration-configurations-ready-)
- [Pending Features & Reasons ❌](#pending-features--reasons-)
- [Workspaces](#workspaces)
- [Custom Reports (38 Total)](#custom-reports-38-total)
- [API Endpoints](#api-endpoints)
- [Migration Notes](#migration-notes)
- [Installation](#installation)
- [License](#license)

---

## Overview

College Template is built on Frappe/ERPNext v15 and extends it with comprehensive college management features. It uses the `education` app for core academic records (Student, Program, Course, Assessment) and the `lms` app for learning management, while adding custom DocTypes, server scripts, workflows, reports, and number cards for college-specific operations.

---

## Implemented Features ✅

### Admissions

| Feature | Status | Components |
|---|---|---|
| Admission Campaign / Opening / Enquiry | ✅ | Campaign, Opening, Enquiry, Marketing Activity |
| Student Applicant Pipeline | ✅ | Applicant → Document Verification → Eligibility Check |
| Student Admission → Enrollment | ✅ | Admission Student → Program Enrollment → Course Enrollment |
| Bulk Enrollment Tool | ✅ | Grade Enrollment Tool |
| **Merit List Generation** | ✅ | Merit List (submittable) + Merit List Entry child table |

### Academic Calendar & Scheduling

| Feature | Status | Components |
|---|---|---|
| Academic Year / Term / Calendar | ✅ | Full calendar with event automation |
| Course Schedule / Time Table | ✅ | Course Schedule, Time Table Scheduling |
| Batch / Group Management | ✅ | Academic Batch, Section, Student Group |
| Automated Calendar Execution | ✅ | Daily scheduler: Placement/Admission/Course Registration auto-open/close |
| **Feedback / Surveys (Accreditation-linked)** | ✅ | Feedback Survey + Question + Response + Answer + Daily Status Scheduler |

### Examination Management

| Feature | Status | Components |
|---|---|---|
| Course Registration Window | ✅ | Window → Registration → Detail |
| Exam Schedule / Hall / Hall Allocation | ✅ | Schedule, Hall, Allocation with seating |
| Hall Ticket Generation | ✅ | Automated per-student hall tickets |
| Exam Attendance | ✅ | Attendance tracking per exam |
| Result Publishing | ✅ | Publish results, Grade Distribution analytics |
| **Promotion Rule Engine** | ✅ | Rules-driven eligibility: Evaluated/Eligible/Held/Repeating |
| **Student Promotion** | ✅ | Bulk promotion with eligibility evaluation |
| **Revaluation / Re-check Workflow** | ✅ | Application + Items + Fee Summary + Pending Reports |
| **Question Bank + Auto Paper Generation** | ✅ | 500+ questions, 2/5/10/15-mark categories, difficulty tagging, auto paper draw with answer key |
| **OMR Bubble-Sheet Grading** | ✅ | OMR Answer Key + Sheet + Auto-grading API |
| **Online Exam Auto-Grading** | ✅ | Auto Grade Result + LMS Quiz Auto-Grading API |

### Student Fees

| Feature | Status | Components |
|---|---|---|
| Fee Structure / Schedule | ✅ | Fee Category → Structure → Schedule |
| Fee Assignment & Invoicing | ✅ | Per-student assignment → Sales Invoice |
| Payment Tracking | ✅ | Fee Payment Entry with payment references |
| Bulk Fee Generation | ✅ | Generate Student Fees tool |

### Scholarship Management

| Feature | Status | Components |
|---|---|---|
| Scheme Management | ✅ | Scholarship Scheme with eligibility criteria |
| Application Workflow | ✅ | Draft → Submitted → Under Verification → Recommended → Approved → Sanctioned → Disbursed |
| Document Verification | ✅ | Verification with item-level status |
| Committee Approval | ✅ | Recommendation + Approval logs |
| Sanction & Payment | ✅ | Sanction → Payment (direct or fee adjustment) |
| Renewal Engine | ✅ | Auto-create new scheme + application for next year |

### Placement Management

| Feature | Status | Components |
|---|---|---|
| Company Management | ✅ | Placement Company with details |
| Drive Management | ✅ | Placement Drive with program/eligibility filters |
| Student Registration | ✅ | Placement Registration for drives |
| Offer Management | ✅ | Placement Offer with package tracking |
| **Package Analytics** | ✅ | Highest Package / Average Package / Students Placed by Company |
| Reports | ✅ | Application Summary, Company-wise, Drive Eligibility, Pending Offers, Selected Students |

### Alumni Management

| Feature | Status | Components |
|---|---|---|
| Generate Alumni | ✅ | Bulk conversion from graduated enrollments |
| Employment Tracking | ✅ | Alumni Employment records |
| Higher Education | ✅ | Alumni Higher Education records |
| Mentorship Program | ✅ | Alumni Mentorship matching |
| Donation Tracking | ✅ | Alumni Donation records |
| Events for Alumni | ✅ | Alumni Event + Registration |
| Auto-Generation on Graduation | ✅ | Server script triggers on enrollment completion |

### College Events & Clubs

| Feature | Status | Components |
|---|---|---|
| Event Management | ✅ | Full lifecycle: Approval → Registration → Attendance → Certificates |
| Student Clubs | ✅ | Club management with members |
| Budget & Expenses | ✅ | Event Budget + Event Expense tracking |
| Certificates | ✅ | Auto-generated certificates for attendees |
| Registration Workflow | ✅ | Registration → Attendance → Certificate issuance |
| Daily Scheduler | ✅ | Auto-open/close registration, send reminders, mark absent |

### Student Services

| Feature | Status | Components |
|---|---|---|
| **Certificate Issuance (Digital)** | ✅ | Student Certificate Request + Issuance Log |
| **Grievance Management** | ✅ | Grievance with urgency detection + Pending Cases report |
| **Internal-Mark Verify-and-Submit Gate** | ✅ | Students verify marks → marks locked → prevent edits |
| **Assignment Notification Loop** | ✅ | New Assignment → Notify Students, Submission → Notify Instructor |

### Hostel & Transport

| Feature | Status | Components |
|---|---|---|
| Hostel Management | ✅ | Hostel + Room + Allocation with occupancy tracking |
| Transport Management | ✅ | Route + Vehicle + Allocation + Trip management |
| Reports | ✅ | Occupancy Report, Allocations by Route |

### Library Management

| Feature | Status | Components |
|---|---|---|
| Book Catalog | ✅ | Library Book with quantity/available tracking |
| Member Management | ✅ | Library Member records |
| Issue/Return Transactions | ✅ | Library Transaction with auto-update availability |
| Reports | ✅ | Books by Category, Overdue Books |

### Convocation

| Feature | Status | Components |
|---|---|---|
| Convocation Management | ✅ | Convocation event setup |
| Student Registration | ✅ | Convocation Registration with auto-title |
| Reports | ✅ | Registration Summary |

### Accreditation

| Feature | Status | Components |
|---|---|---|
| **NAAC/NBA Reporting** | ✅ | Accreditation Report + Criteria + Scores Summary |
| Criteria Management | ✅ | Accreditation Criteria with scoring |

### Institutional Back Office (via ERPNext Core)

| Feature | Status | Notes |
|---|---|---|
| HR (Attendance, Leave, Lifecycle) | ✅ | Via ERPNext HR module |
| Payroll (Salary, Payslips) | ✅ | Via ERPNext Payroll module |
| Accounting (GL, AR, P&L) | ✅ | Via ERPNext Accounts module |
| Procurement (PO, Receipt, Invoice) | ✅ | Via ERPNext Buying module |
| Fixed-Asset Lifecycle & Depreciation | ✅ | Via ERPNext Asset module |

---

## Integration Configurations Ready 🔧

These configuration DocTypes are already built — just set your API keys to activate:

| Config DocType | Purpose | Providers Supported |
|---|---|---|
| **AI Integration Config** (Singleton) | AI Chatbot, Auto Grading, Content Generation, Plagiarism Check | OpenAI, Anthropic, Google AI, Azure AI, Custom |
| **Proctoring Config** (Singleton) | Exam proctoring: Video/Screen/Face/Audio monitoring | Built-in, ProctorU, Honorlock, ExamSoft, Custom |
| **Virtual Classroom Config** (Singleton) | Live virtual classes with recording | Zoom, Google Meet, Microsoft Teams, Jitsi, Custom |
| **Device Config** | Biometric / RFID / Face Recognition attendance hardware | Any IP-based device with API |
| **Digital Signature Request** | E-signature for documents | Manual Upload, DocuSign, Adobe Sign, Frappe E-Sign |
| **Communication Log** | WhatsApp / SMS / Email log | Frappe Email, Twilio SMS, WhatsApp Business, FCM |

**To activate:** Set the API keys in the respective DocType via the System Config workspace on your site.

---

## Pending Features & Reasons ❌

These features from the Gap Analysis could **not** be built as Frappe DocTypes alone — they require external services or platform-level development:

| # | Feature | Reason Not Built |
|---|---|---|
| 1 | **Mobile App** (Student/Parent/Faculty) | Requires native iOS/Android development. **API layer is ready** — 5 REST endpoints with token auth exist (`student_api_get_data`, `get_fees`, `get_attendance`, `get_results`, `submit_grievance`). A mobile app developer can use these endpoints directly. |
| 2 | **Parent/Guardian Web Portal** | Requires dedicated portal UI development. **API layer is ready** — same endpoints as mobile app support portal access. |
| 3 | **Biometric / RFID / Face Recognition Attendance** | Requires hardware SDK integration and physical device installation. **Config DocType is ready** — `Device Config` supports Biometric/RFID/Face Recognition devices. Hardware vendor SDK integration needed. |
| 4 | **AI Proctoring / Anti-Cheating** | Requires AI/ML model integration for real-time proctoring. **Config DocType is ready** — `Proctoring Config` supports Video/Screen/Face/Audio monitoring with flag thresholds. AI provider API key needed. |
| 5 | **AI Tools** (Chatbot, Grading, Content Gen) | Requires AI provider API key (OpenAI, Anthropic, etc.). **Config DocType is ready** — `AI Integration Config` has all settings. Just needs API key to activate. |
| 6 | **WhatsApp / SMS Notifications** | Requires third-party API setup (MessageBird/Twilio). **Script + DocType are ready** — `send_whatsapp_notification` API + `Communication Log` DocType exist. Just needs `pip install messagebird` + API key in site config. |
| 7 | **E-Signature for Documents** | Requires third-party e-sign API (DocuSign, Adobe Sign). **DocType is ready** — `Digital Signature Request` supports all major providers. API integration needed. |
| 8 | **Live/Virtual Classroom** | Requires video conferencing API integration. **Config DocType is ready** — `Virtual Classroom Config` supports Zoom/Meet/Teams/Jitsi. API keys needed. |
| 9 | **No-Code App/Workflow Builder** | Very large platform feature comparable to OpenEduCat. Not feasible as a custom app extension — would require core Frappe changes. |
| 10 | **Online Fee Payment Gateway** | Requires payment gateway integration (Razorpay, PayU, etc.). `Fee Payment Entry` DocType exists for recording payments; gateway API integration needed for online collection. |

### Summary

| Metric | Count |
|---|---|
| Features implemented (Frappe DocTypes + scripts) | **~40+** |
| Integration configs ready (just need API keys) | **6** |
| Features requiring external platform development | **10** |

---

## Workspaces

The app provides **9 workspaces** under the "College ERP" parent page:

| Workspace | Focus |
|---|---|
| **College ERP** | Main dashboard — Admissions, Events, Calendar, Scholarships, Placements, Exams, Fees, Alumni, LMS, Setup |
| **Revaluation & Feedback** | Revaluation Applications + Feedback Surveys |
| **Question Bank** | Question Banks + Paper Templates |
| **Assignments** | Assignments + Submissions |
| **Student Services** | Certificate Requests + Grievances |
| **Library Management** | Books + Members + Transactions |
| **Hostel Management** | Hostels + Rooms + Allocations + Transport |
| **Accreditation** | NAAC/NBA Reports |
| **Auto Grading & OMR** | OMR Answer Keys + Auto Grade Results |

---

## Custom Reports (38 Total)

All custom reports are available under their respective workspaces:

| Module | Reports |
|---|---|
| **Academic Calendar** | Calendar Report, Event Status Overview, Overdue Activities, Upcoming Activities |
| **Accreditation** | Scores Summary |
| **Assignments** | Student Performance, Submission Status |
| **Auto Grading** | Quiz Results |
| **College Events** | Attendance Report, Budget Report, Certificate Report, Club-wise Events, Completed Events, Coordinator Report, Department-wise Events, Student Participation Report, Upcoming Events, Winner Report |
| **Convocation** | Registration Summary |
| **Feedback** | Survey Completion Rate, Survey Responses |
| **Grievance** | Pending Cases |
| **Hostel** | Occupancy Report |
| **Library** | Books by Category, Overdue Books |
| **OMR** | Grading Results |
| **Placement** | Application Summary, Company-wise Summary, Drive Eligibility Summary, Pending Offers, Selected Students |
| **Question Bank** | Generated Papers, Questions by Subject |
| **Revaluation** | Fee Summary, Pending Applications |
| **Scholarship** | Disbursement by Scheme |
| **Student Certificates** | Issuance Log |
| **Transport** | Allocations by Route |

---

## API Endpoints

The following REST API endpoints are available (for mobile app / portal integration):

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/api/method/student_api_get_data` | GET | Get student profile data | Token |
| `/api/method/student_api_get_fees` | GET | Get student fee details + enrollments | Token |
| `/api/method/student_api_get_attendance` | GET | Get student attendance records | Token |
| `/api/method/student_api_get_results` | GET | Get published assessment results | Token |
| `/api/method/student_api_submit_grievance` | POST | Submit a grievance | Token |
| `/api/method/assessment_student_verify` | POST | Verify internal marks (student gate) | Token |
| `/api/method/omr_grade_sheet` | GET | Grade an OMR answer sheet | Login |
| `/api/method/auto_grade_lms_quiz` | GET | Auto-grade an LMS quiz submission | Login |
| `/api/method/question_paper_generate` | GET | Generate question paper from template | Login |
| `/api/method/send_whatsapp_notification` | POST | Send WhatsApp/SMS notification | Token |

**Token Auth:** Set `college_app_api_token` in site config:
```bash
bench --site your-site set-config college_app_api_token "your-secret-token"
```

---

## Migration Notes

### Patch: `add_child_table_parent_columns`

This patch adds missing `parent`/`parenttype`/`parentfield` columns to child tables that were created before the `is_child_table` flag was set. Affected tables:

- `tabEvent Attendance`
- `tabEvent Registration`
- `tabFeedback Response Answer`
- `tabQuestion Bank Item`
- `tabRevaluation Application Item`

### Known Migration Behavior

- **Metadata lock wait:** MySQL may show `Waiting for table metadata lock` during schema changes. This is normal — let it complete. If stuck >5 min, kill the blocking query.
- **Bench migrate lock:** If migration is interrupted, remove stale lock:
  ```bash
  rm sites/your-site/locks/bench_migrate.lock
  ```

---

## Installation

### Prerequisites

- Frappe/ERPNext v15+
- Python 3.11+
- Node.js 18+

### Steps

```bash
# 1. Get all required apps
bench get-app https://github.com/frappe/education.git
bench get-app https://github.com/frappe/lms.git
bench get-app https://github.com/Sudhakar1110/college_template.git

# 2. Install on your site (order matters!)
bench --site [your-site] install-app education
bench --site [your-site] install-app lms
bench --site [your-site] install-app erpnext
bench --site [your-site] install-app college_template

# 3. Run fixture migration to load all customizations
bench --site [your-site] migrate

# 4. (Optional) Set maintenance mode while migrating
bench --site [your-site] set-maintenance-mode on
bench --site [your-site] migrate
bench --site [your-site] set-maintenance-mode off
```

### Verify Installation

After migration, run the report test:

```bash
bench --site [your-site] console
```

Then paste:
```python
import frappe
reports = frappe.db.sql("SELECT name, report_name FROM `tabReport` WHERE is_standard='No' AND disabled=0", as_dict=1)
for r in reports:
    try:
        frappe.get_doc("Report", r.name).execute_query_report({})
        print(f"✅ {r.report_name}")
    except Exception as e:
        print(f"❌ {r.report_name}: {str(e)[:200]}")
```

All 38 reports should pass.

---

## License

MIT
