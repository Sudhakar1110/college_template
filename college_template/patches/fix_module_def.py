# Copyright (c) 2026, Bizaxl and contributors
# For license information, please see license.txt

import frappe

def execute():
    """
    Fix the 'Education' Module Def to point to 'college_template' app.
    
    When both the core 'education' app and 'college_template' app define the
    'Education' module, Frappe's Module Def may point to the wrong app.
    This causes load_doctype_module() to fail during migration when trying
    to import DocType controllers for custom DocTypes in the Education module.
    
    This patch ensures the Module Def points to college_template so that
    import paths resolve correctly (college_template.education.doctype.X
    instead of education.education.doctype.X).
    """
    module_def = frappe.db.get_value("Module Def", "Education", "app_name")
    if module_def and module_def != "college_template":
        frappe.db.set_value("Module Def", "Education", "app_name", "college_template")
        frappe.log_error(
            f"Fixed Module Def 'Education': changed app_name from '{module_def}' to 'college_template'",
            "college_template.patches.fix_module_def"
        )
        print(f"  ✓ Fixed Module Def 'Education': {module_def} → college_template")
    elif not module_def:
        frappe.log_error(
            "Module Def 'Education' not found. This may indicate a missing dependency (education app).",
            "college_template.patches.fix_module_def"
        )
        print("  ! Module Def 'Education' not found")
    else:
        print("  ✓ Module Def 'Education' already points to college_template")
