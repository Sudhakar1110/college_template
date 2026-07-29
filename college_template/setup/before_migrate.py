# Copyright (c) 2026, Bizaxl and contributors
# For license information, please see license.txt

import frappe


def fix_education_module_def():
    """
    Ensures the 'Education' Module Def points to 'college_template' app.

    When both the core 'education' app and 'college_template' app define the
    'Education' module, Frappe's Module Def may point to the wrong app.
    This causes load_doctype_module() to fail during migration when trying
    to import DocType controllers for custom DocTypes in the Education module.

    This hook runs *before* DocType sync, so the fix is in place before any
    DocType JSON files are imported.
    """
    module_def = frappe.db.get_value("Module Def", "Education", "app_name")
    if module_def and module_def != "college_template":
        frappe.db.set_value("Module Def", "Education", "app_name", "college_template")
        frappe.log_error(
            f"Fixed Module Def 'Education': changed app_name from "
            f"'{module_def}' to 'college_template'",
            "college_template.before_migrate"
        )
        print(
            f"\n  ✓ Fixed Module Def 'Education': {module_def} → college_template\n"
        )
    elif not module_def:
        print("\n  ! Module Def 'Education' not found (will be created by sync)\n")
    else:
        print("\n  ✓ Module Def 'Education' already points to college_template\n")
