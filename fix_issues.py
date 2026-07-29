#!/usr/bin/env python3
"""Fix code review issues: auto-grade API, Transport Trip, OMR Answer Sheet, module fix, __init__.py, workspace"""
import json
import os

base = r"C:\Users\sujai\Downloads\git\college_template"

# ===== FIX #2: Fix auto-grade API with proper answer extraction =====
ss_path = os.path.join(base, "college_template", "fixtures", "server_script.json")
with open(ss_path, "r") as f:
    scripts = json.load(f)

for script in scripts:
    if script["name"] == "auto_grade_lms_quiz":
        # Fix the user_answer extraction
        old_code = 'user_answer = ""  # This depends on LMS Quiz Submission structure'
        new_code = (
            '# Try to extract user answer from LMS Quiz Result child table\n'
            '        user_answer = ""\n'
            '        results_table = submission.get("result") or []\n'
            '        if i < len(results_table):\n'
            '            r = results_table[i]\n'
            '            user_answer = (r.get("selected_option") or r.get("answer") or r.get("response") or "")'
        )
        script["script"] = script["script"].replace(old_code, new_code)
        script["allow_guest"] = 0
        print("Fixed auto_grade_lms_quiz script")
        break

# Also fix the OMR API to persist results as OMR Answer Sheet
for script in scripts:
    if script["name"] == "omr_grade_sheet":
        old_code = 'frappe.response["message"] = {'
        new_code = (
            '# Save graded sheet as OMR Answer Sheet for persistence\n'
            '    sheet = frappe.get_doc({\n'
            '        "doctype": "OMR Answer Sheet",\n'
            '        "answer_key": answer_key_name,\n'
            '        "student_answers": student_answers,\n'
            '        "total_questions": total,\n'
            '        "correct_count": correct_count,\n'
            '        "wrong_count": wrong_count,\n'
            '        "score": score,\n'
            '        "passed": 1 if score >= (key.passing_score or 0) else 0\n'
            '    })\n'
            '    sheet.insert(ignore_permissions=True)\n'
            '    frappe.db.commit()\n'
            '\n    frappe.response["message"] = {'
        )
        script["script"] = script["script"].replace(
            'frappe.response["message"] = {',
            new_code
        )
        # Add sheet_id to response
        old_resp = '"passing": score >= (key.passing_score or 0)'
        new_resp = '"passing": score >= (key.passing_score or 0),\n        "sheet_id": sheet.name'
        script["script"] = script["script"].replace(old_resp, new_resp)
        print("Fixed omr_grade_sheet script to persist results")
        break

with open(ss_path, "w") as f:
    json.dump(scripts, f, indent=2)
print("Saved server_script.json")

# ===== FIX #3: Create Transport Trip DocType =====
trip_dir = os.path.join(base, "college_template", "hostel", "doctype", "transport_trip")
os.makedirs(trip_dir, exist_ok=True)
trip = {
    "doctype": "DocType", "name": "Transport Trip", "module": "Hostel", "custom": 1,
    "is_submittable": 1, "is_child_table": 0, "is_single": 0, "is_tree": 0, "editable_grid": 1,
    "track_changes": 1, "allow_rename": 1, "max_attachments": 0,
    "title_field": "title", "sort_field": "date", "sort_order": "DESC",
    "naming_rule": "Expression", "autoname": "TR-TRIP-.YYYY.-.#####",
    "search_fields": "route,vehicle_number,driver_name",
    "fields": [
        {"fieldname": "title", "label": "Title", "fieldtype": "Data", "reqd": 1, "read_only": 1},
        {"fieldname": "date", "label": "Trip Date", "fieldtype": "Date", "reqd": 1, "default": "Today", "in_list_view": 1},
        {"fieldname": "route", "label": "Route", "fieldtype": "Link", "options": "Transport Route", "reqd": 1, "in_list_view": 1},
        {"fieldname": "vehicle", "label": "Vehicle", "fieldtype": "Link", "options": "Transport Vehicle", "reqd": 1},
        {"fieldname": "vehicle_number", "label": "Vehicle Number", "fieldtype": "Data", "fetch_from": "vehicle.vehicle_number", "read_only": 1, "in_list_view": 1},
        {"fieldname": "driver_name", "label": "Driver Name", "fieldtype": "Data", "fetch_from": "vehicle.driver_name", "read_only": 1},
        {"fieldname": "driver_phone", "label": "Driver Phone", "fieldtype": "Data", "fetch_from": "vehicle.driver_phone", "read_only": 1},
        {"fieldname": "column_break_tt", "label": "", "fieldtype": "Column Break"},
        {"fieldname": "departure_time", "label": "Departure Time", "fieldtype": "Time", "reqd": 1},
        {"fieldname": "arrival_time", "label": "Arrival Time", "fieldtype": "Time"},
        {"fieldname": "status", "label": "Status", "fieldtype": "Select", "options": "Scheduled\nIn Progress\nCompleted\nCancelled", "default": "Scheduled", "in_list_view": 1},
        {"fieldname": "notes", "label": "Notes", "fieldtype": "Small Text"}
    ],
    "permissions": [{"role": "System Manager", "create": 1, "read": 1, "write": 1, "delete": 1, "email": 1, "export": 1, "print": 1, "report": 1, "share": 1}]
}
with open(os.path.join(trip_dir, "transport_trip.json"), "w") as f:
    json.dump(trip, f, indent=2)
print("Created Transport Trip DocType")

# ===== FIX #4: Create OMR Answer Sheet DocType =====
sheet_dir = os.path.join(base, "college_template", "education", "doctype", "omr_answer_sheet")
os.makedirs(sheet_dir, exist_ok=True)
sheet = {
    "doctype": "DocType", "name": "OMR Answer Sheet", "module": "Education", "custom": 1,
    "is_submittable": 0, "is_child_table": 0, "is_single": 0, "is_tree": 0, "editable_grid": 1,
    "track_changes": 1, "allow_rename": 1, "max_attachments": 0,
    "title_field": "title", "sort_field": "modified", "sort_order": "DESC",
    "naming_rule": "Expression", "autoname": "OMR-SHT-.YYYY.-.#####",
    "search_fields": "answer_key,student_name",
    "fields": [
        {"fieldname": "title", "label": "Title", "fieldtype": "Data", "reqd": 1, "read_only": 1},
        {"fieldname": "answer_key", "label": "Answer Key", "fieldtype": "Link", "options": "OMR Answer Key", "reqd": 1, "in_list_view": 1},
        {"fieldname": "student_name", "label": "Student Name", "fieldtype": "Data", "in_list_view": 1},
        {"fieldname": "student_answers", "label": "Student Answers", "fieldtype": "Small Text", "description": "Comma-separated: 1=A,2=B,3=C..."},
        {"fieldname": "column_break_omrs", "label": "", "fieldtype": "Column Break"},
        {"fieldname": "total_questions", "label": "Total Questions", "fieldtype": "Int", "read_only": 1},
        {"fieldname": "correct_count", "label": "Correct", "fieldtype": "Int", "read_only": 1},
        {"fieldname": "wrong_count", "label": "Wrong", "fieldtype": "Int", "read_only": 1},
        {"fieldname": "score", "label": "Score", "fieldtype": "Float", "read_only": 1},
        {"fieldname": "passed", "label": "Passed", "fieldtype": "Check", "read_only": 1},
        {"fieldname": "graded_on", "label": "Graded On", "fieldtype": "Datetime", "read_only": 1}
    ],
    "permissions": [{"role": "System Manager", "create": 1, "read": 1, "write": 1, "delete": 1, "email": 1, "export": 1, "print": 1, "report": 1, "share": 1}]
}
with open(os.path.join(sheet_dir, "omr_answer_sheet.json"), "w") as f:
    json.dump(sheet, f, indent=2)
print("Created OMR Answer Sheet DocType")

# ===== FIX #5: Fix Transport Route/Vehicle module =====
route_path = os.path.join(base, "college_template", "education", "doctype", "transport_route", "transport_route.json")
with open(route_path, "r") as f:
    route = json.load(f)
route["module"] = "Hostel"
with open(route_path, "w") as f:
    json.dump(route, f, indent=2)
print("Changed Transport Route module to Hostel")

vehicle_path = os.path.join(base, "college_template", "education", "doctype", "transport_vehicle", "transport_vehicle.json")
with open(vehicle_path, "r") as f:
    vehicle = json.load(f)
vehicle["module"] = "Hostel"
with open(vehicle_path, "w") as f:
    json.dump(vehicle, f, indent=2)
print("Changed Transport Vehicle module to Hostel")

# ===== FIX #6: Create __init__.py files =====
import_dirs = [
    "education/doctype/communication_log",
    "education/doctype/digital_signature_request",
    "education/doctype/approval_chain",
    "education/doctype/approval_chain_step",
    "education/doctype/device_config",
    "education/doctype/ai_integration_config",
    "education/doctype/proctoring_config",
    "education/doctype/virtual_classroom_config",
    "education/doctype/omr_answer_key",
    "education/doctype/omr_answer_sheet",
    "education/doctype/auto_grade_result",
    "education/doctype/transport_route",
    "education/doctype/transport_vehicle",
    "hostel/doctype/transport_allocation",
    "hostel/doctype/transport_trip",
]
for d in import_dirs:
    full_path = os.path.join(base, "college_template", d)
    os.makedirs(full_path, exist_ok=True)
    init_path = os.path.join(full_path, "__init__.py")
    if not os.path.exists(init_path):
        with open(init_path, "w") as f:
            f.write("")
        print(f"Created __init__.py in {d}")

print("\n=== ALL FIXES COMPLETE ===")
