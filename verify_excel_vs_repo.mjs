import XLSX from "xlsx";
import fs from "fs";
import path from "path";

// Read all relevant Excel files and compare with repo
const excelDir = "C:\\Users\\sujai\\Downloads";

const filesToCheck = [
  { name: "DocType.xlsx", category: "DocType" },
  { name: "DocType (1).xlsx", category: "DocType" },
  { name: "DocType (2).xlsx", category: "DocType" },
  { name: "DocType (3).xlsx", category: "DocType" },
  { name: "DocType (4).xlsx", category: "DocType" },
  { name: "Client Script.xlsx", category: "Client Script" },
  { name: "Server Script.xlsx", category: "Server Script" },
  { name: "New_Admission_Doctype.xlsx", category: "New Admission" },
];

// Current repo data
function countDoctypes() {
  const results = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fp = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(fp);
      else if (entry.name.endsWith(".json") && dir.includes("doctype")) {
        const doc = JSON.parse(fs.readFileSync(fp, "utf8"));
        results.push(doc.name);
      }
    }
  }
  walk("college_template");
  return results;
}

const repoDoctypes = new Set(countDoctypes());
console.log(`Repo doctypes count: ${repoDoctypes.size}`);

// Read fixtures
function readFixture(name) {
  try {
    const data = JSON.parse(fs.readFileSync(`college_template/fixtures/${name}.json`, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

const repoClientScripts = readFixture("Client Script");
const repoServerScripts = readFixture("Server Script");
const repoReports = readFixture("Report");
const repoNotifications = readFixture("Notification");

console.log(`Repo Client Scripts: ${repoClientScripts.length}`);
console.log(`Repo Server Scripts: ${repoServerScripts.length}`);
console.log(`Repo Reports: ${repoReports.length}`);
console.log(`Repo Notifications: ${repoNotifications.length}`);

console.log("\n============================================");
console.log("CHECKING EXCEL FILES...");
console.log("============================================\n");

for (const f of filesToCheck) {
  const fullPath = path.join(excelDir, f.name);
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ NOT FOUND: ${f.name}`);
    continue;
  }
  
  try {
    const wb = XLSX.readFile(fullPath);
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
    
    console.log(`\n📄 ${f.name} (${f.category})`);
    console.log(`   Sheet: ${sheetName}, Rows: ${rows.length}`);
    
    if (rows.length > 0) {
      const headers = Object.keys(rows[0]);
      console.log(`   Columns: ${headers.slice(0, 8).join(", ")}${headers.length > 8 ? "..." : ""}`);
    }
    
    // Compare doctypes
    if (f.category === "DocType") {
      const excelDoctypes = new Set();
      const excelFieldCounts = {};
      for (const row of rows) {
        if (row.ID && row.Module) {
          excelDoctypes.add(row.ID);
          excelFieldCounts[row.ID] = { fields: 0, module: row.Module };
        }
        if (row.ID && (row.Label || row.Fieldname)) {
          for (const id of Object.keys(excelFieldCounts)) {
            // Count fields per doctype
          }
        }
      }
      
      // Find what's missing
      const missingFromRepo = [...excelDoctypes].filter(d => !repoDoctypes.has(d));
      const extraInRepo = [...repoDoctypes].filter(d => !excelDoctypes.has(d));
      
      if (missingFromRepo.length > 0) {
        console.log(`   ⚠️  ${missingFromRepo.length} doctypes in Excel but NOT in repo:`);
        missingFromRepo.slice(0, 10).forEach(d => console.log(`       - ${d}`));
        if (missingFromRepo.length > 10) console.log(`       ... and ${missingFromRepo.length - 10} more`);
      } else {
        console.log(`   ✅ All ${excelDoctypes.size} doctypes from Excel are in repo`);
      }
    }
    
    // Compare Client Scripts
    if (f.category === "Client Script" && rows.length > 0) {
      if (rows[0].ID || rows[0].id || rows[0].name) {
        const excelIds = new Set(rows.map(r => r.ID || r.id || r.name || "").filter(Boolean));
        const repoIds = new Set(repoClientScripts.map(r => r.name || "").filter(Boolean));
        const missing = [...excelIds].filter(id => !repoIds.has(id));
        if (missing.length > 0) {
          console.log(`   ⚠️  ${missing.length} scripts in Excel but NOT in repo (first 5):`);
          missing.slice(0, 5).forEach(d => console.log(`       - ${d}`));
        } else {
          console.log(`   ✅ All ${excelIds.size} scripts from Excel are in repo`);
        }
      } else {
        console.log(`   ⚠️  Cannot identify record IDs from columns: ${headers.slice(0, 5).join(", ")}`);
      }
    }
    
    // Compare Server Scripts  
    if (f.category === "Server Script" && rows.length > 0) {
      if (rows[0].ID || rows[0].id || rows[0].name) {
        const excelIds = new Set(rows.map(r => r.ID || r.id || r.name || "").filter(Boolean));
        const repoIds = new Set(repoServerScripts.map(r => r.name || "").filter(Boolean));
        const missing = [...excelIds].filter(id => !repoIds.has(id));
        if (missing.length > 0) {
          console.log(`   ⚠️  ${missing.length} scripts in Excel but NOT in repo (first 5):`);
          missing.slice(0, 5).forEach(d => console.log(`       - ${d}`));
        } else {
          console.log(`   ✅ All ${excelIds.size} scripts from Excel are in repo`);
        }
      }
    }
    
  } catch (e) {
    console.log(`   ❌ Error reading: ${e.message}`);
  }
}

console.log("\n============================================");
console.log("SUMMARY");
console.log("============================================");
console.log(`Doctypes in repo: ${repoDoctypes.size}`);
console.log(`Client Scripts in repo: ${repoClientScripts.length}`);
console.log(`Server Scripts in repo: ${repoServerScripts.length}`);
console.log(`Reports in repo: ${repoReports.length}`);
console.log(`Notifications in repo: ${repoNotifications.length}`);
console.log(`Custom Fields in repo: ${readFixture("Custom Field").length}`);
console.log(`Dashboard Charts in repo: ${readFixture("Dashboard Chart").length}`);
console.log(`Number Cards in repo: ${readFixture("Number Card").length}`);
