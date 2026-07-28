#!/usr/bin/env node
/**
 * Restructure DocType JSON files from flat fixtures/ directory
 * into proper Frappe app doctype/ folder structure organized by module.
 *
 * Before: college_template/fixtures/College Event.json
 * After:  college_template/college_events/doctype/college_event/college_event.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = __dirname;
const FIXTURES_DIR = path.join(APP_DIR, 'college_template', 'fixtures');

// Module name to directory name mapping
const MODULE_DIR_MAP = {
  'College Events': 'college_events',
  'Education': 'education',
  'Custom': 'custom'
};

// Doctype name to directory name mapping
function doctypeToDirName(name) {
  return name
    .replace(/\s+/g, '_')     // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9_]/g, '') // Remove special chars
    .toLowerCase();
}

// List of non-doctype fixtures to keep in fixtures/ folder
const NON_DOCTYPE_FIXTURES = [
  'Client Script.json',
  'Server Script.json',
  'Notification.json',
  'Report.json',
  'Number Card.json',
  'Dashboard Chart.json'
];

console.log('='.repeat(60));
console.log('Restructuring DocType fixtures to doctype/ folder structure');
console.log('='.repeat(60));
console.log();

const fixtureFiles = fs.readdirSync(FIXTURES_DIR).filter(f => f.endsWith('.json'));
let movedCount = 0;
let skippedCount = 0;
const movedDoctypes = [];

for (const file of fixtureFiles) {
  // Skip non-doctype fixtures
  if (NON_DOCTYPE_FIXTURES.includes(file)) {
    console.log(`  SKIPPED (keep in fixtures): ${file}`);
    skippedCount++;
    continue;
  }

  const filePath = path.join(FIXTURES_DIR, file);
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const doc = JSON.parse(content);

    if (doc.doctype !== 'DocType') {
      console.log(`  SKIPPED (not a DocType): ${file}`);
      skippedCount++;
      continue;
    }

    const doctypeName = doc.name;
    const moduleName = doc.module || 'Custom';
    const moduleDir = MODULE_DIR_MAP[moduleName] || moduleName.toLowerCase().replace(/\s+/g, '_');
    const doctypeDir = doctypeToDirName(doctypeName);

    // Create target directory: college_template/{module}/doctype/{doctype_name}/
    const targetDir = path.join(APP_DIR, 'college_template', moduleDir, 'doctype', doctypeDir);
    fs.mkdirSync(targetDir, { recursive: true });

    // Copy the JSON file to the new location
    const targetFile = path.join(targetDir, `${doctypeDir}.json`);
    fs.writeFileSync(targetFile, JSON.stringify(doc, null, 2), 'utf-8');

    // Delete the original file from fixtures/
    fs.unlinkSync(filePath);

    console.log(`  MOVED:  ${file}`);
    console.log(`    -> ${path.join('college_template', moduleDir, 'doctype', doctypeDir, `${doctypeDir}.json`)}`);
    console.log(`    Module: ${moduleName}, Fields: ${(doc.fields || []).length}`);
    
    movedDoctypes.push(doctypeName);
    movedCount++;
  } catch (err) {
    console.error(`  ERROR processing ${file}: ${err.message}`);
    skippedCount++;
  }
}

console.log();
console.log('='.repeat(60));
console.log(`Summary: ${movedCount} DocTypes moved, ${skippedCount} fixtures kept`);
console.log('='.repeat(60));

// Print moved doctypes by module
console.log('\n=== Doctypes by Module ===\n');
const byModule = {};
for (const f of fixtureFiles) {
  if (NON_DOCTYPE_FIXTURES.includes(f)) continue;
  const filePath = path.join(FIXTURES_DIR, f);
  if (!fs.existsSync(filePath)) continue; // Already moved
}
// Re-read from new locations
for (const [moduleName, moduleDir] of Object.entries(MODULE_DIR_MAP)) {
  const moduleDoctypePath = path.join(APP_DIR, 'college_template', moduleDir, 'doctype');
  if (fs.existsSync(moduleDoctypePath)) {
    const doctypeDirs = fs.readdirSync(moduleDoctypePath);
    if (doctypeDirs.length > 0) {
      console.log(`\n${moduleName} (${moduleDir}/):`);
      for (const dir of doctypeDirs) {
        console.log(`  - ${dir}`);
      }
    }
  }
}

console.log('\n=== Instructions for hooks.py ===');
console.log('Remove ALL DocType names from the fixtures list in hooks.py.');
console.log('Keep only: Client Script, Server Script, Notification, Report, Number Card, Dashboard Chart');
console.log('The DocTypes will be auto-discovered from the doctype/ folder structure during bench install-app.');
