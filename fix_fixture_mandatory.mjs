import fs from "fs";

const fixtureFiles = [
  "college_template/fixtures/client_script.json",
  "college_template/fixtures/notification.json",
  "college_template/fixtures/report.json",
];

for (const filePath of fixtureFiles) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠ ${filePath} not found, skipping`);
    continue;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const records = JSON.parse(content);
  let fixed = 0;

  for (const record of records) {
    // Fix missing dt (mandatory field for Client Script)
    if (record.doctype === "Client Script" && (!record.dt || record.dt.trim() === "")) {
      const scriptContent = record.script || "";
      const name = record.name || "unnamed";
      console.log(`  ❌ Client Script "${name}" has empty dt! Script preview: ${scriptContent.substring(0, 80)}...`);
      
      // Try to infer dt from name pattern (some names contain the doctype)
      if (name && name.includes(" - ")) {
        const inferredDt = name.split(" - ")[0].trim();
        if (inferredDt) {
          record.dt = inferredDt;
          console.log(`     → Inferred dt from name: "${inferredDt}"`);
          fixed++;
        }
      } else {
        // Try to infer from script content (look for frappe.db.get_all("DocType")
        const dtMatch = scriptContent.match(/get_all\(["']([^"']+)["']\)/);
        if (dtMatch) {
          record.dt = dtMatch[1];
          console.log(`     → Inferred dt from script: "${dtMatch[1]}"`);
          fixed++;
        } else {
          console.log(`     ⚠ Could not infer dt for this script`);
        }
      }
    }

    // Fix missing subject for Notifications
    if (record.doctype === "Notification" && (!record.subject || record.subject.trim() === "")) {
      const name = record.name || "unnamed";
      record.subject = name;
      console.log(`  ✅ Fixed empty subject for Notification "${name}"`);
      fixed++;
    }
  }

  if (fixed > 0) {
    fs.writeFileSync(filePath, JSON.stringify(records, null, 2));
    console.log(`  ✅ Fixed ${fixed} records in ${filePath}`);
  } else {
    console.log(`  ✅ No issues found in ${filePath}`);
  }
}
