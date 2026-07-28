#!/usr/bin/env node
/**
 * Convert College ERP CSV export files into Frappe fixture JSON files.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_DIR = 'C:\\Users\\sujai\\OneDrive\\Desktop\\collage\\College_ERP\\Custom';
const FIXTURES_DIR = path.join(__dirname, 'college_template', 'fixtures');

fs.mkdirSync(FIXTURES_DIR, { recursive: true });

function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return [];
  const header = parseCSVLine(lines[0]).map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && !values[0].trim())) continue;
    const row = {};
    header.forEach((h, idx) => { row[h] = (values[idx] || '').trim(); });
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) { result.push(current); current = ''; }
    else { current += ch; }
  }
  result.push(current);
  return result;
}

function readCSV(filename) {
  let filepath = path.join(CSV_DIR, filename);
  if (!fs.existsSync(filepath)) {
    const files = fs.readdirSync(CSV_DIR);
    const match = files.find(f => f.toLowerCase().startsWith(filename.toLowerCase().split('.')[0]));
    if (match) { filepath = path.join(CSV_DIR, match); }
    else { console.log(`WARNING: Could not find ${filename}`); return []; }
  }
  return parseCSV(fs.readFileSync(filepath, 'utf-8'));
}

function toBool(v) { return (v && ['1','yes','true'].includes(v.toLowerCase().trim())) ? 1 : 0; }
function toInt(v) { const n = parseInt(v); return isNaN(n) ? 0 : n; }

function writeFixture(name, data) {
  if (!data || !data.length) { console.log(`  SKIPPED ${name}`); return; }
  const fp = path.join(FIXTURES_DIR, `${name}.json`);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`  Written: ${fp} (${data.length} records)`);
}

// ==== Converters ====
function convertClientScripts(rows) {
  const seen = new Set();
  return rows.filter(r => r.ID && !seen.has(r.ID) && seen.add(r.ID)).map(r => ({
    doctype: 'Client Script', name: r.ID, dt: r.DocType || '',
    script: r.Script || '', enabled: toBool(r.Enabled || '1'),
    module: r['Module (for export)'] || '', apply_to: r['Apply To'] || 'Form'
  }));
}

function convertServerScripts(rows) {
  const seen = new Set();
  return rows.filter(r => r.ID && !seen.has(r.ID) && seen.add(r.ID)).map(r => {
    const f = { doctype: 'Server Script', name: r.ID,
      script_type: r['Script Type'] || '', script: r.Script || '',
      module: r['Module (for export)'] || '', disabled: toBool(r.Disabled || '0') };
    if (r['Script Type'] === 'Scheduler Event') {
      f.event_frequency = r['Event Frequency'] || 'Daily'; f.cron_format = r['Cron Format'] || '';
    } else if (r['Script Type'] === 'DocType Event') {
      f.reference_doctype = r['Reference Document Type'] || '';
      f.doctype_event = r['DocType Event'] || 'Before Save';
    } else if (r['Script Type'] === 'API') {
      f.api_method = r['API Method'] || ''; f.allow_guest = toBool(r['Allow Guest'] || '0');
    }
    return f;
  });
}

function convertNotifications(rows) {
  const seen = new Set();
  return rows.filter(r => r.ID && !seen.has(r.ID) && seen.add(r.ID)).map(r => ({
    doctype: 'Notification', name: r.ID, channel: r.Channel || 'Email',
    enabled: toBool(r.Enabled || '1'), subject: r.Subject || '',
    document_type: r['Document Type'] || '', event: r['Send Alert On'] || 'Save',
    message_type: r['Message Type'] || 'Markdown', message: r.Message || '',
    condition: r.Condition || '', value_changed: r['Value Changed'] || '',
    module: r.Module || '', is_standard: toBool(r['Is Standard'] || '0')
  }));
}

function convertReports(rows) {
  const seen = new Set();
  return rows.filter(r => r['Report Name'] && !seen.has(r['Report Name']) && seen.add(r['Report Name'])).map(r => ({
    doctype: 'Report', name: r['Report Name'], ref_doctype: r['Ref DocType'] || '',
    report_type: r['Report Type'] || 'Query Report', is_standard: r['Is Standard'] || 'No',
    query: r.Query || '', module: r.Module || '', disabled: toBool(r.Disabled || '0'),
    add_total_row: toBool(r['Add Total Row'] || '0')
  }));
}

function convertNumberCards(rows) {
  const seen = new Set();
  return rows.filter(r => r.ID && !seen.has(r.ID) && seen.add(r.ID)).map(r => ({
    doctype: 'Number Card', name: r.ID, label: r.Label || r.ID,
    type: r.Type || 'Document Type', document_type: r['Document Type'] || '',
    function: r.Function || 'Count', aggregate_function_based_on: r['Aggregate Function Based On'] || '',
    report_name: r['Report Name'] || '',
    is_public: toBool(r['Is Public'] || '1'),
    stats_time_interval: r['Stats Time Interval'] || 'Daily',
    filters_json: r['Filters JSON'] || '[]',
    module: r.Module || '', is_standard: toBool(r['Is Standard'] || '0'),
    currency: r.Currency || 'INR'
  }));
}

function convertDashboardCharts(rows) {
  const seen = new Set();
  return rows.filter(r => r['Chart Name'] && !seen.has(r['Chart Name']) && seen.add(r['Chart Name'])).map(r => ({
    doctype: 'Dashboard Chart', name: r['Chart Name'], chart_name: r['Chart Name'],
    chart_type: r['Chart Type'] || 'Count', type: r.Type || 'Bar',
    document_type: r['Document Type'] || '',
    use_report_chart: toBool(r['Use Report Chart'] || '0'),
    x_field: r['X Field'] || '', timeseries: toBool(r['Time Series'] || '0'),
    time_series_based_on: r['Time Series Based On'] || '',
    time_interval: r['Time Interval'] || 'Yearly', timespan: r.Timespan || 'Last Year',
    value_based_on: r['Value Based On'] || '',
    group_by_type: r['Group By Type'] || 'Count',
    group_by_based_on: r['Group By Based On'] || '',
    aggregate_function_based_on: r['Aggregate Function Based On'] || '',
    number_of_groups: toInt(r['Number of Groups'] || '0'),
    is_public: toBool(r['Is Public'] || '1'), is_standard: toBool(r['Is Standard'] || '0'),
    currency: r.Currency || 'INR', filters_json: r['Filters JSON'] || '[]',
    color: r.Color || '', module: r.Module || ''
  }));
}

function convertDoctypes(rows) {
  const doctypes = [];
  let current = null;
  let fields = [];
  let perms = [];

  function saveCurrent() {
    if (!current || !current.name) return;
    const record = {
      doctype: 'DocType',
      name: current.name,
      module: current.module,
      custom: current.custom,
      is_submittable: current.is_submittable,
      is_child_table: current.is_child_table,
      is_single: current.is_single,
      is_tree: current.is_tree,
      editable_grid: current.editable_grid,
      track_changes: current.track_changes,
      track_seen: current.track_seen,
      track_views: current.track_views,
      allow_rename: current.allow_rename,
      allow_import: current.allow_import,
      max_attachments: current.max_attachments,
      title_field: current.title_field,
      image_field: current.image_field,
      timeline_field: current.timeline_field,
      sort_field: current.sort_field,
      sort_order: current.sort_order,
      default_view: current.default_view,
      search_fields: current.search_fields,
      naming_rule: current.naming_rule,
      autoname: current.autoname,
      description: current.description,
      icon: current.icon,
      color: current.color,
      fields: fields,
      permissions: perms.length ? perms : []
    };
    if (!record.permissions.length) {
      record.permissions = [{ role: 'System Manager', create: 1, read: 1, write: 1, delete: 1, email: 1, export: 1, print: 1, report: 1, share: 1 }];
    }
    doctypes.push(record);
    fields = [];
    perms = [];
  }

  for (const row of rows) {
    if (row.ID && row.Module) {
      saveCurrent();
      current = {
        name: row.ID, module: row.Module || 'Education',
        custom: toBool(row['Custom?'] || '1'),
        is_submittable: toBool(row['Is Submittable'] || '0'),
        is_child_table: toBool(row['Is Child Table'] || '0'),
        is_single: toBool(row['Is Single'] || '0'),
        is_tree: toBool(row['Is Tree'] || '0'),
        editable_grid: toBool(row['Editable Grid'] || '0'),
        track_changes: toBool(row['Track Changes'] || '0'),
        track_seen: toBool(row['Track Seen'] || '0'),
        track_views: toBool(row['Track Views'] || '0'),
        allow_rename: toBool(row['Allow Rename'] || '0'),
        allow_import: toBool(row['Allow Import (via Data Import Tool)'] || '0'),
        max_attachments: toInt(row['Max Attachments'] || '0'),
        title_field: row['Title Field'] || '',
        image_field: row['Image Field'] || '',
        timeline_field: row['Timeline Field'] || '',
        sort_field: row['Default Sort Field'] || 'modified',
        sort_order: row['Default Sort Order'] || 'DESC',
        default_view: row['Default View'] || '',
        search_fields: row['Search Fields'] || '',
        naming_rule: row['Naming Rule'] || '',
        autoname: row['Auto Name'] || '',
        description: row.Description || '',
        icon: row.Icon || '', color: row.Color || ''
      };
    } else if (current) {
      const fn = row['Fieldname (Fields)'] || row['Fieldname (Columns)'] || '';
      const ft = row['Type (Fields)'] || '';
      const lb = row['Label (Fields)'] || row['Label (Columns)'] || '';
      const role = row['Role (Roles)'] || '';
      if (ft && ft !== 'ID' && (fn || lb)) {
        fields.push({
          fieldname: fn, label: lb, fieldtype: ft,
          options: row['Options (Fields)'] || row['Options'] || '',
          default: row['Default (Fields)'] || '',
          reqd: toBool(row['Mandatory (Fields)'] || '0'),
          read_only: toBool(row['Read Only (Fields)'] || '0'),
          unique: toBool(row['Unique (Fields)'] || '0'),
          hidden: toBool(row['Hidden (Fields)'] || '0'),
          in_list_view: toBool(row['In List View (Fields)'] || '0'),
          in_filter: toBool(row['In Filter (Fields)'] || '0'),
          in_global_search: toBool(row['In Global Search (Fields)'] || '0'),
          in_preview: toBool(row['In Preview (Fields)'] || '0'),
          allow_on_submit: toBool(row['Allow on Submit (Fields)'] || '0'),
          collapsible: toBool(row['Collapsible (Fields)'] || '0'),
          columns: toInt(row['Columns (Fields)'] || '0'),
          fetch_from: row['Fetch From (Fields)'] || '',
          fetch_if_empty: toBool(row['Fetch on Save if Empty (Fields)'] || '0'),
          no_copy: toBool(row['No Copy (Fields)'] || '0'),
          non_negative: toBool(row['Non Negative (Fields)'] || '0'),
          permlevel: toInt(row['Perm Level (Fields)'] || '0'),
          precision: row['Precision (Fields)'] || '',
          print_hide: toBool(row['Print Hide (Fields)'] || '0'),
          report_hide: toBool(row['Report Hide (Fields)'] || '0'),
          set_only_once: toBool(row['Set only once (Fields)'] || '0'),
          translatable: toBool(row['Translatable (Fields)'] || '0'),
          depends_on: row['Display Depends On (JS) (Fields)'] || '',
          mandatory_depends_on: row['Mandatory Depends On (JS) (Fields)'] || '',
          read_only_depends_on: row['Read Only Depends On (JS) (Fields)'] || '',
          description: row['Description (Fields)'] || '',
          placeholder: row['Placeholder (Fields)'] || ''
        });
      } else if (role) {
        perms.push({
          role, create: toBool(row['Create (Permissions)'] || '1'),
          read: toBool(row['Read (Permissions)'] || '1'),
          write: toBool(row['Write (Permissions)'] || '1'),
          delete: toBool(row['Delete (Permissions)'] || '1'),
          submit: toBool(row['Submit (Permissions)'] || '0'),
          cancel: toBool(row['Cancel (Permissions)'] || '0'),
          amend: toBool(row['Amend (Permissions)'] || '0'),
          email: toBool(row['Email (Permissions)'] || '1'),
          export: toBool(row['Export (Permissions)'] || '1'),
          print: toBool(row['Print (Permissions)'] || '1'),
          report: toBool(row['Report (Permissions)'] || '1'),
          share: toBool(row['Share (Permissions)'] || '1'),
          permlevel: toInt(row['Level (Permissions)'] || '0')
        });
      }
    }
  }
  saveCurrent();

  console.log(`  Found ${doctypes.length} unique doctypes:`);
  for (const record of doctypes) {
    const dtPath = path.join(FIXTURES_DIR, `${record.name}.json`);
    fs.writeFileSync(dtPath, JSON.stringify(record, null, 2), 'utf-8');
    console.log(`    Written: ${dtPath} (${record.fields.length} fields)`);
  }
  return doctypes.map(d => d.name);
}

// ==== Generate hooks.py fixture list ====
function generateHooksFixtureList(dtNames) {
  const fixtures = [
    'Client Script', 'Server Script', 'Notification', 'Report',
    'Number Card', 'Dashboard Chart', ...dtNames
  ];
  const jsonStr = JSON.stringify(fixtures, null, 2);
  return jsonStr;
}

// ==== Main ====
console.log('='.repeat(60));
console.log('Converting College ERP CSVs to Frappe Fixture JSON');
console.log('='.repeat(60));
console.log();

const cs1 = readCSV('Client Script (7).csv');
const cs2 = readCSV('Client Script (6).csv');
console.log(`[1/7] Client Scripts (${cs1.length + cs2.length} rows)`);
writeFixture('Client Script', convertClientScripts([...cs1, ...cs2]));

const ss = readCSV('Server Script (5).csv');
console.log(`[2/7] Server Scripts (${ss.length} rows)`);
writeFixture('Server Script', convertServerScripts(ss));

const notif = readCSV('Notification (7).csv');
console.log(`[3/7] Notifications (${notif.length} rows)`);
writeFixture('Notification', convertNotifications(notif));

const reports = readCSV('Report.csv');
console.log(`[4/7] Reports (${reports.length} rows)`);
writeFixture('Report', convertReports(reports));

const nc = readCSV('Number Card (2).csv');
console.log(`[5/7] Number Cards (${nc.length} rows)`);
writeFixture('Number Card', convertNumberCards(nc));

const charts = readCSV('Dashboard Chart.csv');
console.log(`[6/7] Dashboard Charts (${charts.length} rows)`);
writeFixture('Dashboard Chart', convertDashboardCharts(charts));

const dt = readCSV('DocType (5).csv');
console.log(`[7/7] DocTypes (${dt.length} raw rows)`);
const dtNames = convertDoctypes(dt);

// Generate fixture list for hooks.py
console.log('\n=== Generated Fixture List for hooks.py ===');
console.log(generateHooksFixtureList(dtNames));

console.log('\n' + '='.repeat(60));
console.log('Conversion Complete!');
console.log('='.repeat(60));
