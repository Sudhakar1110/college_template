import frappe


def execute():
    """Fix the College ERP workspace to use Frappe v15 Card Break format."""
    if not frappe.db.exists("Workspace", "College ERP"):
        return

    ws = frappe.get_doc("Workspace", "College ERP")

    # Replace links with Frappe v15 Card Break format
    ws.links = []

    sections = [
        ("Admissions", [
            "Admission Student", "Admission Enquiry", "Admission Opening",
            "Admission Campaign", "Admission Program Enrollment",
            "Admission Campaign Program", "Admission Marketing Activity",
            "Academic Batch", "Academic Enrollment", "Document Verification",
            "Eligibility Check",
        ]),
        ("Events", [
            "College Event", "Event Registration", "Event Attendance",
            "Event Certificate", "Event Committee", "Event Feedback",
            "Event Budget", "Event Expense", "Event Sponsor", "Event Winner",
            "Event Gallery", "Event Document", "Student Club",
        ]),
        ("Academic Calendar", [
            "Academic Calendar", "Academic Calendar Event",
        ]),
        ("Scholarships", [
            "Scholarship Scheme", "Scholarship Application",
            "Scholarship Verification", "Scholarship Renewal",
            "Scholarship Sanction", "Scholarship Payment",
        ]),
        ("Placements", [
            "Placement Drive", "Placement Company", "Placement Registration",
            "Placement Offer", "Placement Drive Schedule",
            "Placement Drive Program", "Placement Round Detail",
        ]),
        ("Exams", [
            "Exam Schedule", "Exam Hall", "Hall Allocation", "Hall ticket",
            "Exam Attendance", "Assessment Result", "Semester", "Section",
        ]),
        ("Course Registration", [
            "Course Registration Window", "Course Registration",
            "Promotion Rule", "Student Promotion",
        ]),
        ("Fees", [
            "Student Fee Structure", "Student Fee Assignment",
            "Fee Payment Entry", "Fee Head", "Generate Student Fees",
        ]),
        ("Alumni", [
            "Alumni", "Alumni Event", "Alumni Event Registration",
            "Alumni Donation", "Alumni Achievement", "Alumni Employment",
            "Alumni Higher Education", "Alumni Mentorship", "Generate Alumni",
        ]),
        ("LMS", [
            "LMS Course", "LMS Batch", "LMS Batch Enrollment", "LMS Quiz",
            "LMS Quiz Submission", "LMS Assessment", "LMS Program Course",
            "LMS Program Member", "Course Chapter", "Course Lesson",
        ]),
        ("Setup", [
            "Promote Students", "Print Heading",
        ]),
    ]

    for card_label, doctypes in sections:
        ws.append("links", {
            "type": "Card Break",
            "label": card_label,
        })
        for dt in doctypes:
            ws.append("links", {
                "type": "Link",
                "label": dt,
                "link_type": "DocType",
                "link_to": dt,
            })

    ws.save(ignore_permissions=True)
    frappe.db.commit()
