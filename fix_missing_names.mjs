import fs from "fs";
import path from "path";

const fixturesDir = "college_template/fixtures";
const files = fs.readdirSync(fixturesDir).filter(f => f.endsWith(".json"));

let totalFixed = 0;

for (const file of files) {
  const filePath = path.join(fixturesDir, file);
  const content = fs.readFileSync(filePath, "utf8");
  const records = JSON.parse(content);
  const before = records.length;

  // Remove records without a 'name' field
  const clean = records.filter(r => {
    if (!r.name || r.name.trim() === "") {
      console.log(`  ${file}: Removing record with no name (doctype: ${r.doctype || "unknown"})`);
      return false;
    }
    return true;
  });

  const after = clean.length;
  const removed = before - after;

  if (removed > 0) {
    fs.writeFileSync(filePath, JSON.stringify(clean, null, 2));
    console.log(`  ${file}: ${before} → ${after} (removed ${removed})`);
    totalFixed += removed;
  } else {
    console.log(`  ${file}: ✅ ${before} records - clean`);
  }
}

console.log(`\n=== Summary ===`);
console.log(`Total records removed (missing name): ${totalFixed}`);
