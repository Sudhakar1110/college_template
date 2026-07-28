import fs from "fs";
import path from "path";

const fixturesDir = "college_template/fixtures";
const files = fs.readdirSync(fixturesDir).filter(f => f.endsWith(".json"));

// Special characters that Frappe considers invalid in names
const specialCharsRegex = /[{}()\[\]'"!@#$%^&*<>=+\/\\|~`]/;

for (const file of files) {
  const filePath = path.join(fixturesDir, file);
  const content = fs.readFileSync(filePath, "utf8");
  const records = JSON.parse(content);
  let issues = [];

  for (const record of records) {
    const name = record.name || record.title || "";
    if (name && specialCharsRegex.test(name)) {
      const match = name.match(specialCharsRegex);
      issues.push({
        doctype: record.doctype || "Unknown",
        name: name.substring(0, 80),
        char: match ? match[0] : "unknown"
      });
    }
  }

  if (issues.length > 0) {
    console.log(`\n=== ${file} (${issues.length} issues) ===`);
    for (const issue of issues) {
      console.log(`  ${issue.doctype}: name="${issue.name}"`);
      console.log(`    → contains special char: "${issue.char}"`);
    }
  } else {
    console.log(`✅ ${file} - clean`);
  }
}
