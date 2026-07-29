# Copyright (c) 2026, Bizaxl and contributors
# For license information, please see license.txt

import frappe

# Child tables that may be missing parent/parenttype/parentfield columns
# These DocTypes have is_child_table=1 but the columns were not created
# because the tables already existed before is_child_table was set.
AFFECTED_TABLES = [
    "tabEvent Attendance",
    "tabEvent Registration",
    "tabFeedback Response Answer",
    "tabQuestion Bank Item",
    "tabRevaluation Application Item",
]


def execute():
    """Add missing parent, parenttype, parentfield columns to child tables."""
    # Commit any pending transaction writes first.
    # ALTER TABLE causes an implicit commit in MySQL, which Frappe blocks
    # when transaction_writes > 0. By committing first, we reset the flag
    # so check_transaction_status allows the DDL statement.
    frappe.db.commit()
    for table in AFFECTED_TABLES:
        fix_child_table_columns(table)


def fix_child_table_columns(table):
    """Add parent, parenttype, parentfield columns if they don't exist."""
    existing = set()
    rows = frappe.db.sql(f"SHOW COLUMNS FROM `{table}`")
    for row in rows:
        existing.add(row[0])

    added = []
    for col, col_type in [
        ("parent", "varchar(140)"),
        ("parenttype", "varchar(140)"),
        ("parentfield", "varchar(140)"),
    ]:
        if col not in existing:
            frappe.db.sql(
                f"ALTER TABLE `{table}` ADD COLUMN `{col}` {col_type} DEFAULT ''",
                auto_commit=True
            )
            added.append(col)

    if added:
        frappe.log_error(
            f"Added columns to {table}: {', '.join(added)}",
            "college_template.patches.add_child_table_parent_columns",
        )
        print(f"  ✓ Added columns to {table}: {', '.join(added)}")
    else:
        print(f"  ✓ {table} already has all child table columns")
