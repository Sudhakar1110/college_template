# Copyright (c) 2026, Bizaxl and contributors
# For license information, please see license.txt

COLLEGE_APP_MODULES = [
    "Education",
    "College Custom",
    "College Events",
    "Academic Calendar",
    "Placement",
    "LMS",
    "Setup",
    "Student Services",
    "Library",
    "Hostel",
]


def fix_education_module_def():
    """
    Ensures all college_template Module Defs point to 'college_template' app.

    When both the core 'education'/'lms' app and 'college_template' define
    modules with the same name (Education, LMS, Setup, Library, etc.),
    Frappe's Module Def may point to the wrong app. This causes DocTypes
    to be detected as "orphaned" and deleted during migration.

    This hook runs *before* DocType sync, so the fix is in place before any
    DocType JSON files are imported.
    """
    fixed = []
    for module_name in COLLEGE_APP_MODULES:
        module_def_app = frappe.db.get_value("Module Def", module_name, "app_name")
        if module_def_app and module_def_app != "college_template":
            frappe.db.set_value("Module Def", module_name, "app_name", "college_template")
            fixed.append(f"{module_name}: {module_def_app} → college_template")
        elif not module_def_app:
            pass

    if fixed:
        for msg in fixed:
            print(f"  ✓ Fixed Module Def: {msg}")
        frappe.log_error(
            "Fixed Module Defs: " + "; ".join(fixed),
            "college_template.before_migrate"
        )
    else:
        print("  ✓ All college_template Module Defs already point to college_template")
