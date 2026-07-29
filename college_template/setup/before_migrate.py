# Copyright (c) 2026, Bizaxl and contributors
# For license information, please see license.txt

# Modules known to conflict with other installed apps (education, lms, etc.)
# When both apps define a module with the same name, Frappe's Module Def
# may point to the wrong app, causing custom DocTypes to be detected as
# "orphaned" and deleted during migration.
# Only add modules here that are CONFIRMED to have this issue.
CONFLICTING_MODULES = [
    "Education",      # Conflicts with the core 'education' app
    "College Custom",  # Conflicts with frappe's built-in 'Custom' module
]


def fix_module_defs():
    """
    Ensures college_template Module Defs point to 'college_template' app.
    Runs *before* DocType sync to prevent orphan DocType detection/deletion.
    """
    fixed = []
    for module_name in CONFLICTING_MODULES:
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
