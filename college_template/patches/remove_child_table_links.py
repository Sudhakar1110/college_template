import frappe


def execute():
    """Remove child table doctype links from College ERP workspace since they have no standalone page."""
    if not frappe.db.exists("Workspace", "College ERP"):
        return

    ws = frappe.get_doc("Workspace", "College ERP")

    # Child table doctypes have no standalone page in Frappe
    child_table_links = {"LMS Program Course", "LMS Program Member", "LMS Assessment"}
    links_before = len(ws.links or [])

    ws.links = [
        link for link in (ws.links or [])
        if link.label not in child_table_links
    ]

    if len(ws.links) < links_before:
        ws.flags.ignore_links = True
        ws.save(ignore_permissions=True)
        frappe.db.commit()
