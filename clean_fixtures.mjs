import fs from "fs";

function cleanClientScripts(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const records = JSON.parse(content);
  const before = records.length;
  
  // Remove records with empty dt (corrupted fragments from CSV splitting)
  const clean = records.filter(r => {
    if (r.doctype === "Client Script" && (!r.dt || r.dt.trim() === "")) {
      console.log(`  Removing corrupted record: "${(r.name || "").substring(0, 60)}..."`);
      return false;
    }
    return true;
  });
  
  const after = clean.length;
  console.log(`  ${filePath}: ${before} → ${after} records (removed ${before - after} corrupted)`);
  fs.writeFileSync(filePath, JSON.stringify(clean, null, 2));
  return before - after;
}

function fixNotifications(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const records = JSON.parse(content);
  let fixed = 0;
  
  for (const r of records) {
    if (!r.subject || r.subject.trim() === "") {
      r.subject = r.name || "Notification";
      fixed++;
    }
  }
  
  console.log(`  ${filePath}: Fixed ${fixed} empty subjects`);
  fs.writeFileSync(filePath, JSON.stringify(records, null, 2));
  return fixed;
}

// Clean Client Scripts
console.log("=== Cleaning Client Scripts ===");
cleanClientScripts("college_template/fixtures/client_script.json");

// Fix Notifications
console.log("\n=== Fixing Notifications ===");
fixNotifications("college_template/fixtures/notification.json");

console.log("\n✅ Cleanup complete!");
