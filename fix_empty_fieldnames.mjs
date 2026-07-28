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
    const usedFieldnames = new Set();
    
    // Pre-populate with existing (non-empty) fieldnames to avoid conflicts
    for (const field of doc.fields) {
      if (field.fieldname && field.fieldname.trim()) {
        usedFieldnames.add(field.fieldname.trim());
      }
    }
    
    let unnamedCounter = 0;
    
    for (const field of doc.fields) {
      if (!field.fieldname || field.fieldname.trim() === "") {
        const label = field.label || "";
        let generated;
        
        if (label && label.trim()) {
          generated = toSnakeCase(label);
          
          // Handle duplicates by appending _1, _2, etc.
          let candidate = generated;
          let suffix = 1;
          while (usedFieldnames.has(candidate)) {
            candidate = `${generated}_${suffix++}`;
          }
          generated = candidate;
          
          console.log(`  ${path.basename(file)}: Empty fieldname -> "${generated}" (label: "${label}")`);
        } else {
          unnamedCounter++;
          generated = `unnamed_field_${unnamedCounter}`;
          console.log(`  ${path.basename(file)}: Empty fieldname AND empty label! Setting to "${generated}"`);
        }
        
        field.fieldname = generated;
        usedFieldnames.add(generated);
        changed = true;
        totalFixed++;
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
