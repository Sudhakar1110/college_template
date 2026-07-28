import frappe

def execute():
    """Delete the old 'College ERP' workspace so the fixture can re-create it with correct format."""
    if frappe.db.exists("Workspace", "College ERP"):
        frappe.delete_doc("Workspace", "College ERP", delete_permanently=True, force=True)
        frappe.db.commit()
