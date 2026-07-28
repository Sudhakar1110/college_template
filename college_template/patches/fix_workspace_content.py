import frappe
import json


def execute():
    """Update the College ERP workspace content to include card block entries."""
    if not frappe.db.exists("Workspace", "College ERP"):
        return

    ws = frappe.get_doc("Workspace", "College ERP")

    # Build content with header + cards matching the Card Break labels
    # Clear module restriction so all doctypes from all modules are visible
    ws.module = ""

    # Build content with header + cards matching the Card Break labels
    ws.content = json.dumps([
        {"type": "header", "data": {"text": "College ERP", "level": 1}},
        {"type": "card", "data": {"card_name": "Admissions"}},
        {"type": "card", "data": {"card_name": "Events"}},
        {"type": "card", "data": {"card_name": "Academic Calendar"}},
        {"type": "card", "data": {"card_name": "Scholarships"}},
        {"type": "card", "data": {"card_name": "Placements"}},
        {"type": "card", "data": {"card_name": "Exams"}},
        {"type": "card", "data": {"card_name": "Course Registration"}},
        {"type": "card", "data": {"card_name": "Fees"}},
        {"type": "card", "data": {"card_name": "Alumni"}},
        {"type": "card", "data": {"card_name": "LMS"}},
        {"type": "card", "data": {"card_name": "Setup"}},
    ])

    ws.flags.ignore_links = True
    frappe.flags.ignore_links = True
    ws.save(ignore_permissions=True)
    frappe.db.commit()
