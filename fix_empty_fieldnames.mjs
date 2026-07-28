import fs from "fs";
import path from "path";

function findDoctypeJsonFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findDoctypeJsonFiles(fp));
    } else if (entry.isFile() && entry.name.endsWith(".json") && dir.includes("doctype")) {
      results.push(fp);
    }
  }
  return results;
}

function toSnakeCase(str) {
  return str
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}

const doctypeFiles = findDoctypeJsonFiles("college_template");
let totalFixed = 0;
let filesWithIssues = [];

for (const file of doctypeFiles) {
  const content = fs.readFileSync(file, "utf8");
  const doc = JSON.parse(content);
  let changed = false;

  if (doc.fields && Array.isArray(doc.fields)) {
    for (const field of doc.fields) {
      if (!field.fieldname || field.fieldname.trim() === "") {
        const label = field.label || "";
        if (label && label.trim()) {
          const generated = toSnakeCase(label);
          console.log(`  ${path.basename(file)}: Empty fieldname -> "${generated}" (label: "${label}")`);
          field.fieldname = generated;
          changed = true;
          totalFixed++;
        } else {
          console.log(`  ${path.basename(file)}: Empty fieldname AND empty label! Setting to "field_${Date.now()}"`);
          field.fieldname = `field_${Math.random().toString(36).substr(2, 8)}`;
          changed = true;
          totalFixed++;
        }
      }
    }
  }

  // Also fix permissions section if it has empty fieldname
  if (doc.permissions && Array.isArray(doc.permissions)) {
    for (const perm of doc.permissions) {
      if (perm.fieldname === "" || perm.fieldname === null || perm.fieldname === undefined) {
        // Remove empty fieldname from permissions - it means it applies to all fields
        delete perm.fieldname;
        changed = true;
      }
    }
  }

  if (changed) {
    filesWithIssues.push(file);
    fs.writeFileSync(file, JSON.stringify(doc, null, 2));
  }
}

console.log(`\n=== Summary ===`);
console.log(`Doctype JSON files scanned: ${doctypeFiles.length}`);
console.log(`Files with fixes applied: ${filesWithIssues.length}`);
console.log(`Total empty fieldnames fixed: ${totalFixed}`);

if (filesWithIssues.length > 0) {
  console.log(`\nFixed files:`);
  filesWithIssues.forEach(f => console.log(`  ${f}`));
}
