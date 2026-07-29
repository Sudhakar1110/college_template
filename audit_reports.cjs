const fs = require("fs");
const path = require("path");

// Load all DocType JSON files to build a field lookup
const base = path.join(__dirname, "college_template");
const doctypeFields = {};

function walkDir(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fp = path.join(dir, item);
    if (fs.statSync(fp).isDirectory()) {
      if (item !== "node_modules" && item !== ".git") walkDir(fp);
    } else if (item.endsWith(".json")) {
      try {
        const doc = JSON.parse(fs.readFileSync(fp, "utf-8"));
        if (doc.doctype === "DocType" && doc.name && doc.fields) {
          const fields = doc.fields.map((f) => f.fieldname);
          doctypeFields[doc.name] = fields;
        }
      } catch (e) {}
    }
  }
}
walkDir(base);

// Also add standard system fields that all DocTypes have
const systemFields = ["name", "owner", "creation", "modified", "modified_by",
  "docstatus", "idx", "parent", "parentfield", "parenttype"];

// Load reports
const reports = JSON.parse(fs.readFileSync(path.join(base, "fixtures/report.json"), "utf-8"));

console.log("=".repeat(100));
console.log("COMPREHENSIVE REPORT AUDIT - Checking all field references");
console.log("=".repeat(100));

let totalIssues = 0;
let reportsWithIssues = 0;

for (const report of reports) {
  const name = report.report_name || report.name;
  const refDT = report.ref_doctype;
  const query = report.query;
  if (!query || !refDT) continue;

  // Extract table aliases and column references from the query
  // Find patterns like alias.column_name or just column_name
  const fieldRefs = [];
  const regex = /(?:\b(\w+)\.)?(\w+)\s*(?:as\s*["`]|,|FROM|WHERE|ORDER|GROUP|ON|AND|OR|CASE|WHEN|THEN|ELSE|END|\)|$)/g;
  const tokens = query.match(/[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*/g) || [];

  // Also extract standalone column names (no alias prefix)
  const standaloneCols = [];
  const selectRegex = /SELECT\s+(.+?)\s+FROM/is;
  const selectMatch = query.match(selectRegex);
  if (selectMatch) {
    const cols = selectMatch[1].split(",");
    for (const col of cols) {
      const m = col.trim().match(/^(\w+)\.(.+?)$/);
      if (!m) {
        const simple = col.trim().match(/^(\w+)\s/);
        if (simple && !["CASE", "WHEN", "SUM", "COUNT", "ROUND", "DATEDIFF", "COALESCE", "IFNULL", "AVG", "MAX", "MIN", "SUBSTRING"].includes(simple[1].toUpperCase())) {
          standaloneCols.push(simple[1]);
        }
      }
    }
  }

  // Map aliases to tables based on FROM/JOIN clauses
  const aliasToTable = {};
  const fromRegex = /(?:FROM|JOIN)\s+`tab(\w+)`\s+(\w+)/gi;
  let m;
  while ((m = fromRegex.exec(query)) !== null) {
    aliasToTable[m[2].toLowerCase()] = m[1];
  }

  const issues = [];

  // Check prefixed references: alias.column
  for (const token of tokens) {
    const [alias, col] = token.split(".");
    const tableName = aliasToTable[alias.toLowerCase()];
    if (tableName) {
      const tableFields = doctypeFields[tableName] || [];
      const allFields = [...tableFields, ...systemFields];
      if (!allFields.includes(col) && col !== "name" && col !== "creation" && col !== "modified" && col !== "docstatus" && col !== "owner" && col !== "parent" && col !== "parentfield" && col !== "parenttype" && col !== "idx") {
        // Special checks
        if (tableName === "College Event" && col === "event_name") continue; // autoname field
        if (tableName === "Placement Drive" && col === "drive_title") continue; // autoname field
        if (tableName === "Placement Company" && col === "company_name") continue; // autoname field
        if (tableName === "Academic Calendar" && col === "calendar_name") continue; // autoname field
        issues.push(`  ❌ ${tableName}.${col} (alias ${alias}) - FIELD NOT FOUND`);
        totalIssues++;
      }
    }
  }

  // Check child table parent references  
  for (const token of tokens) {
    const [alias, col] = token.split(".");
    const tableName = aliasToTable[alias.toLowerCase()];
    if (tableName) {
      const dtDef = Object.entries(doctypeFields).find(([k]) => k === tableName);
      if (dtDef) {
        // Check if this is a child table
        const dtJson = JSON.parse(fs.readFileSync(
          path.join(base, "college_events/doctype", tableName.toLowerCase().replace(/\s+/g, "_"), `${tableName.toLowerCase().replace(/\s+/g, "_")}.json`),
          "utf-8"
        ));
        // This path approach is fragile, skip detailed child table check
      }
    }
  }

  if (issues.length > 0) {
    console.log(`\n📊 ${name} (ref: ${refDT})`);
    issues.forEach(i => console.log(i));
    reportsWithIssues++;
  } else {
    console.log(`✅ ${name}`);
  }
}

console.log("\n" + "=".repeat(100));
console.log(`\nRESULTS: ${reportsWithIssues} reports with issues out of ${reports.length} total`);
console.log(`Total field reference issues: ${totalIssues}`);
