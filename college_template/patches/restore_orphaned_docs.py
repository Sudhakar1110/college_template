import frappe


def execute():
    """Restore system doc types that were incorrectly marked as orphaned by the Custom module conflict."""
    orphaned_doctypes = [
        "Custom Field",
        "Customize Form",
        "Customize Form Field",
        "Client Script",
        "DocType Layout",
        "DocType Layout Field",
        "Property Setter",
    ]

    for dt in orphaned_doctypes:
        if frappe.db.exists("DocType", dt):
            # Check if it was marked as deleted
            current_deleted = frappe.db.get_value("DocType", dt, "deleted")
            if current_deleted:
                frappe.db.set_value("DocType", dt, "deleted", 0)
                frappe.db.set_value("DocType", dt, "custom", 0)
                frappe.msgprint(f"Restored orphaned DocType: {dt}")

    frappe.db.commit()
    frappe.clear_cache()
