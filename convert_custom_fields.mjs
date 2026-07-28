import XLSX from "xlsx";
import fs from "fs";
import path from "path";

const filePath = "C:\\Users\\sujai\\Downloads\\Custom Field.xlsx";
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets["Custom Field"];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

const docTypeModuleMap = {
  "Assessment Result": "Education",
  "Program Course": "Education",
  "Admission Student": "Education",
  "Student Group Student": "Education",
  "Student Attendance": "Education",
  "Student Fee Assignment": "Education",
  "Student Fee Structure": "Education",
  "Student Applicant": "Education"
};

// Map CSV column names to Frappe Custom Field field names
function toBool(val) {
  const v = String(val).trim();
  return v === "1" || v.toLowerCase() === "yes" || v.toLowerCase() === "true" ? 1 : 0;
}

function mapRow(row, idx) {
  const field = {
    doctype: "Custom Field",
    dt: row.DocType || "",
    fieldname: row.Fieldname || "",
    label: row.Label || "",
    fieldtype: row["Field Type"] || "Data",
    insert_after: row["Insert After"] || "",
    options: row.Options || "",
    length: parseInt(row.Length) || 0,
    precision: row.Precision || "",
    reqd: toBool(row["Is Mandatory Field"]),
    unique: toBool(row.Unique),
    read_only: toBool(row["Read Only"]),
    hidden: toBool(row.Hidden),
    no_copy: toBool(row["No Copy"]),
    allow_on_submit: toBool(row["Allow on Submit"]),
    in_list_view: toBool(row["In List View"]),
    in_standard_filter: toBool(row["In Standard Filter"]),
    in_global_search: toBool(row["In Global Search"]),
    in_preview: toBool(row["In Preview"]),
    bold: toBool(row.Bold),
    report_hide: toBool(row["Report Hide"]),
    default: String(row["Default Value"] || ""),
    depends_on: row["Depends On"] || "",
    mandatory_depends_on: row["Mandatory Depends On"] || "",
    read_only_depends_on: row["Read Only Depends On"] || "",
    collapsible: toBool(row.Collapsible),
    collapsible_depends_on: row["Collapsible Depends On"] || "",
    fetch_from: row["Fetch From"] || "",
    fetch_if_empty: toBool(row["Fetch on Save if Empty"]),
    non_negative: toBool(row["Non Negative"]),
    hide_days: toBool(row["Hide Days"]),
    hide_seconds: toBool(row["Hide Seconds"]),
    ignore_user_permissions: toBool(row["Ignore User Permissions"]),
    print_hide: toBool(row["Print Hide"]),
    print_hide_if_no_value: toBool(row["Print Hide If No Value"]),
    print_width: String(row["Print Width"] || ""),
    translatable: toBool(row.Translatable),
    ignore_xss_filter: toBool(row["Ignore XSS Filter"]),
    hide_border: toBool(row["Hide Border"]),
    show_dashboard: toBool(row["Show Dashboard"]),
    description: row["Field Description"] || "",
    permlevel: parseInt(row["Permission Level"]) || 0,
    width: String(row.Width || ""),
    columns: parseInt(row.Columns) || 0,
    allow_in_quick_entry: toBool(row["Allow in Quick Entry"]),
    index: toBool(row.Index),
    search_index: 0,
    module: docTypeModuleMap[row.DocType] || "Education",
    modified_by: "Administrator",
    owner: "Administrator"
  };

  // Clean up
  Object.keys(field).forEach(k => {
    if (field[k] === null || field[k] === undefined) field[k] = "";
    if (k === "precision" && field[k] === "0") field[k] = "";
  });

  return field;
}

// Convert all rows
const customFields = rows.map((row, idx) => mapRow(row, idx));

// Write as fixture JSON (flat array - Frappe v15 fixture format)
const fixturesDir = "college_template/fixtures";
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

const outputPath = path.join(fixturesDir, "Custom Field.json");
fs.writeFileSync(outputPath, JSON.stringify(customFields, null, 2));

console.log(`✅ Generated ${customFields.length} Custom Fields → ${outputPath}`);
console.log("\n=== Custom Fields Generated ===");
customFields.forEach((f, i) => {
  console.log(`${i + 1}. ${f.dt} → ${f.fieldname} (${f.fieldtype}): ${f.label}`);
});
