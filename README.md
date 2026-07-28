# College Template

Frappe/ERPNext custom app for College ERP Management.
**Compatible with Frappe/ERPNext v15+**

## Features

- **College Events Management** - Event registration, attendance, certificates, budget, sponsors
- **Academic Calendar** - Automated scheduling with calendar events, notifications
- **Scholarship Management** - Applications, verification, approval workflow, renewals, payments
- **Placement Management** - Company management, drive registration, eligibility checks, offers
- **Exam Management** - Schedule management, hall allocation, hall tickets, attendance, results
- **Course Registration** - Semester course registration with validation
- **Student Promotion** - Eligibility evaluation and batch promotion
- **Fee Management** - Fee structure, assignment, invoicing, payment tracking
- **Admission Management** - Application processing, document verification, enrollment
- **Alumni Management** - Alumni records, employment tracking, donations, events
- **Dashboard & Reports** - Comprehensive analytics and reporting

## Dependencies (Frappe v15)

Since Frappe/ERPNext v15, the following are separate apps:
- `education` - Education module (Student, Assessment, Programs, etc.)
- `lms` - Learning Management System (Courses, Quizzes, Batches)

## Installation

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
```

## License

MIT
