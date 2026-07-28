import fs from "fs";

const filePath = "college_template/fixtures/server_script.json";
const content = fs.readFileSync(filePath, "utf8");
const records = JSON.parse(content);

const before = records.length;
let removed = 0;

// Find records with empty script field
const clean = records.filter(r => {
  if (!r.script || r.script.trim() === "") {
    console.log(`  Removing "${r.name}" - empty script field`);
    removed++;
    return false;
  }
  return true;
});

const after = clean.length;
fs.writeFileSync(filePath, JSON.stringify(clean, null, 2));
console.log(`\n✅ ${filePath}: ${before} → ${after} (removed ${removed} with empty script)`);
