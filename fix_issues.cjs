#!/usr/bin/env node
"use strict";
const fs = require('fs');
const path = require('path');

const base = "C:\\Users\\sujai\\Downloads\\git\\college_template";

// ============ FIX #1: Verify allow_guest fix ============
const ssPath = path.join(base, "college_template", "fixtures", "server_script.json");
let scripts = JSON.parse(fs.readFileSync(ssPath, 'utf8'));

let fixedCount = 0;
for (let s of scripts) {
  if (s.script_type === "API" && 
      (s.name.startsWith("student_api_") || s.name === "auto_grade_lms_quiz")) {
    if (s.allow_guest === 1) {
      s.allow_guest = 0;
      fixedCount++;
      console.log(`Fixed ${s.name}: allow_guest 1 -> 0`);
    }
  }
}
console.log(`Fix #1: ${fixedCount} allow_guest fixes applied`);

// ============ FIX #2: Fix auto-grade API with answer extraction ============
for (let s of scripts) {
  if (s.name === "auto_grade_lms_quiz") {
    const oldCode = 'user_answer = ""  # This depends on LMS Quiz Submission structure';
    const newCode = [
      '# Extract user answer from LMS Quiz Result child table (selected_option field)',
      '        user_answer = ""',
      '        results_table = submission.get("result") or []',
      '        if i < len(results_table):',
      '            r = results_table[i]',
      '            user_answer = r.get("selected_option") or r.get("answer") or r.get("response") or ""'
    ].join('\n');
    s.script = s.script.replace(oldCode, newCode);
    console.log("Fix #2: Updated auto_grade_lms_quiz with proper answer extraction");
    break;
  }
}

// ============ FIX OMR API to persist results ============
for (let s of scripts) {
  if (s.name === "omr_grade_sheet") {
    // Add OMR Answer Sheet persistence after score calculation
    const insertPoint = 'frappe.response["message"] = {';
    const newBlock = [
      '# Save graded sheet to OMR Answer Sheet for persistence',
      '    sheet = frappe.get_doc({',
      '        "doctype": "OMR Answer Sheet",',
      '        "answer_key": answer_key_name,',
      '        "student_answers": student_answers,',
      '        "total_questions": total,',
      '        "correct_count": correct_count,',
      '        "wrong_count": wrong_count,',
      '        "score": score,',
      '        "passed": 1 if score >= (key.passing_score or 0) else 0,',
      '        "graded_on": frappe.utils.now_datetime()',
      '    })',
      '    sheet.insert(ignore_permissions=True)',
      '    frappe.db.commit()',
      '',
      '    ' + insertPoint
    ].join('\n');
    s.script = s.script.replace('frappe.response["message"] = {', newBlock);
    // Add sheet_id to response
    s.script = s.script.replace(
      '"passing": score >= (key.passing_score or 0)',
      '"passing": score >= (key.passing_score or 0),\n        "sheet_id": sheet.name'
    );
    console.log("Fix #4: Updated omr_grade_sheet to persist results as OMR Answer Sheet");
    break;
  }
}

fs.writeFileSync(ssPath, JSON.stringify(scripts, null, 2));
console.log("Saved server_script.json");

// ============ FIX #3: Create Transport Trip DocType ============
const tripDir = path.join(base, "college_template", "hostel", "doctype", "transport_trip");
fs.mkdirSync(tripDir, { recursive: true });
const trip = {
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
};
fs.writeFileSync(path.join(tripDir, "transport_trip.json"), JSON.stringify(trip, null, 2));
console.log("Fix #3: Created Transport Trip DocType");

// ============ FIX #4: Create OMR Answer Sheet DocType ============
const sheetDir = path.join(base, "college_template", "education", "doctype", "omr_answer_sheet");
fs.mkdirSync(sheetDir, { recursive: true });
const sheet = {
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
};
fs.writeFileSync(path.join(sheetDir, "omr_answer_sheet.json"), JSON.stringify(sheet, null, 2));
console.log("Fix #4: Created OMR Answer Sheet DocType");

// ============ FIX #5: Change Transport Route/Vehicle module to Hostel ============
const routePath = path.join(base, "college_template", "education", "doctype", "transport_route", "transport_route.json");
let route = JSON.parse(fs.readFileSync(routePath, 'utf8'));
route.module = "Hostel";
fs.writeFileSync(routePath, JSON.stringify(route, null, 2));
console.log("Fix #5: Transport Route module changed to Hostel");

const vehPath = path.join(base, "college_template", "education", "doctype", "transport_vehicle", "transport_vehicle.json");
let veh = JSON.parse(fs.readFileSync(vehPath, 'utf8'));
veh.module = "Hostel";
fs.writeFileSync(vehPath, JSON.stringify(veh, null, 2));
console.log("Fix #5: Transport Vehicle module changed to Hostel");

// ============ FIX #6: Create __init__.py files ============
const initDirs = [
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
];
let initCount = 0;
for (let d of initDirs) {
  const fullPath = path.join(base, "college_template", d);
  fs.mkdirSync(fullPath, { recursive: true });
  const initPath = path.join(fullPath, "__init__.py");
  if (!fs.existsSync(initPath)) {
    fs.writeFileSync(initPath, "");
    initCount++;
  }
}
console.log(`Fix #6: Created ${initCount} __init__.py files`);

console.log("\n=== ALL 6 FIXES COMPLETE ===");
