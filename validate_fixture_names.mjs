import fs from "fs";
import path from "path";

// Frappe's validate_name rejects names with these patterns
// From frappe/model/naming.py: Cannot contain {, }, (, ), [, ], ', ", !, @, #, $, %, ^, &, *, <, >, =, +, /, \, |, ~, `, :, ;, ,, ., ?
// Also cannot have leading/trailing whitespace
const invalidNameRegex = /[{}()\[\]'"!#$%^&*<>=+\/\\|~`,;?@\n\r]/;

const fixturesDir = "college_template/fixtures";
const files = fs.readdirSync(fixturesDir).filter(f => f.endsWith(".json"));

let totalRemoved = 0;
let totalFiles = 0;

for (const file of files) {
  const filePath = path.join(fixturesDir, file);
  const content = fs.readFileSync(filePath, "utf8");
  const records = JSON.parse(content);
  
  const before = records.length;
  
  const clean = records.filter(r => {
    const name = r.name || r.title || "";
    
    // Check if name has invalid characters
    if (invalidNameRegex.test(name)) {
      return false;
    }
    
    // Check if name is too long (Frappe limit is 140 chars but names should be reasonable)
    if (name.length > 140) {
      return false;
    }
    
    return true;
  });
  
  const after = clean.length;
  const removed = before - after;
  
  if (removed > 0) {
    console.log(`${file}: ${before} → ${after} (removed ${removed})`);
    fs.writeFileSync(filePath, JSON.stringify(clean, null, 2));
    totalRemoved += removed;
    totalFiles++;
  } else {
    console.log(`${file}: ✅ ${before} records - clean`);
  }
}

console.log(`\n=== Summary ===`);
console.log(`Total records removed: ${totalRemoved}`);
console.log(`Files modified: ${totalFiles}`);
