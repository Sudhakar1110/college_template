import XLSX from "xlsx";
import fs from "fs";

const filePath = "C:\\Users\\sujai\\Downloads\\Custom Field.xlsx";
const workbook = XLSX.readFile(filePath);

console.log("=== Sheet Names ===");
console.log(workbook.SheetNames);

for (const sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  console.log(`\n=== Sheet: ${sheetName} (${json.length} rows) ===`);
  
  if (json.length > 0) {
    console.log("=== Column Headers ===");
    console.log(Object.keys(json[0]).join(" | "));
    console.log("\n=== First 5 Rows ===");
    for (let i = 0; i < Math.min(5, json.length); i++) {
      console.log(JSON.stringify(json[i]));
    }
  }
  
  // Write full data to a JSON file for inspection
  fs.writeFileSync(
    `custom_field_${sheetName}.json`, 
    JSON.stringify(json, null, 2)
  );
  console.log(`\nFull data written to custom_field_${sheetName}.json`);
}
