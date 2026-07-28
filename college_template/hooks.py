app_name = "college_template"
app_title = "College Template"
app_publisher = "Bizaxl"
app_description = "College ERP Customizations - Doctypes, Scripts, Reports & Dashboard"
app_icon = "octicon octicon-file-directory"
app_color = "grey"
app_email = "info@bizaxl.com"
app_license = "MIT"

# App dependencies for Frappe v15
# Education and LMS are separate apps in v15, must be installed first
app_dependencies = ["education", "lms"]

# Fixtures - non-doctype records only
# DocTypes are auto-discovered from the doctype/ folder structure
fixtures = [
    "Client Script",
    "Server Script",
    "Custom Field",
    "Notification",
    "Report",
    "Number Card",
    "Dashboard Chart",
    "Workspace",
]

# DocType JS
doctype_js = {}

# Boot info
# before_tests hook removed - install.py not required for fixture-based app
