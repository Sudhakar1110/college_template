import fs from "fs";

const filePath = "college_template/fixtures/custom_field.json";
const content = fs.readFileSync(filePath, "utf8");
const records = JSON.parse(content);

let fixed = 0;
for (const r of records) {
  // Custom Field name should be {dt}-{fieldname}
  const expectedName = `${r.dt}-${r.fieldname}`;
  
  if (!r.name || r.name.trim() === "") {
    r.name = expectedName;
    console.log(`  Fixed name: "${expectedName}"`);
    fixed++;
  }
}

fs.writeFileSync(filePath, JSON.stringify(records, null, 2));
console.log(`\n✅ Fixed ${fixed} Custom Field records`);
