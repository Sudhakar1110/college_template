import { readFileSync, writeFileSync } from 'fs';

// ============================================================
// Proper CSV Parser — handles multi-line quoted fields & ""
// ============================================================
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          // Escaped quote ""
          currentField += '"';
          i += 2;
          continue;
        } else {
          // End of quoted field
          inQuotes = false;
          i += 1;
          continue;
        }
      } else {
        currentField += ch;
        i += 1;
        continue;
      }
    }

    // Not in quotes
    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }

    if (ch === ',') {
      currentRow.push(currentField);
      currentField = '';
      i += 1;
      continue;
    }

    if (ch === '\n' || (ch === '\r' && text[i + 1] === '\n')) {
      if (ch === '\r') i += 1; // skip \r in \r\n
      currentRow.push(currentField);
      currentField = '';
      if (currentRow.length > 0 && currentRow.some(f => f.trim() !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      i += 1;
      continue;
    }

    if (ch === '\r') {
      currentRow.push(currentField);
      currentField = '';
      if (currentRow.length > 0 && currentRow.some(f => f.trim() !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      i += 1;
      continue;
    }

    currentField += ch;
    i += 1;
  }

  // Don't forget the last field/row
  currentRow.push(currentField);
  if (currentRow.length > 0 && currentRow.some(f => f.trim() !== '')) {
    rows.push(currentRow);
  }

  return rows;
}

function cleanField(val) {
  if (!val) return '';
  return val.trim();
}

// ============================================================
// 1. Parse Server Script CSV → server_script.json
// ============================================================
function parseServerScripts(csvText) {
  const rows = parseCSV(csvText);
  if (rows.length < 2) {
    console.error('Server Script CSV: Not enough rows');
    return [];
  }

  const header = rows[0];
  console.log('Server Script header:', header);
  
  const colIndex = {};
  header.forEach((col, i) => {
    colIndex[col.trim()] = i;
  });

  const scripts = [];
  const errors = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const name = cleanField(row[colIndex['ID']]);
    const scriptType = cleanField(row[colIndex['Script Type']]);
    const script = cleanField(row[colIndex['Script']]);
    const refDocType = cleanField(row[colIndex['Reference Document Type']] || '');
    const eventFreq = cleanField(row[colIndex['Event Frequency']] || '');
    const cronFormat = cleanField(row[colIndex['Cron Format']] || '');
    const doctypeEvent = cleanField(row[colIndex['DocType Event']] || '');
    const apiMethod = cleanField(row[colIndex['API Method']] || '');
    const allowGuest = cleanField(row[colIndex['Allow Guest']] || '0');
    const module = cleanField(row[colIndex['Module (for export)']] || '');
    const disabled = cleanField(row[colIndex['Disabled']] || '0');

    if (!name || !scriptType || !script) {
      errors.push(`Row ${r}: missing required field (name='${name}', type='${scriptType}', script='${script.substring(0,50)}')`);
      continue;
    }

    const record = {
      doctype: 'Server Script',
      name: name,
      script_type: scriptType,
      script: script,
      module: module,
      disabled: parseInt(disabled) || 0
    };

    // Add fields based on script type
    if (scriptType === 'DocType Event') {
      record.reference_doctype = refDocType || '';
      record.doctype_event = doctypeEvent || 'Before Save';
    } else if (scriptType === 'API') {
      record.api_method = apiMethod || '';
      record.allow_guest = parseInt(allowGuest) || 0;
    } else if (scriptType === 'Scheduler Event') {
      record.event_frequency = eventFreq || 'Daily';
      record.cron_format = cronFormat || '';
    }

    scripts.push(record);
  }

  if (errors.length > 0) {
    console.log('Parse errors:');
    errors.forEach(e => console.log('  ' + e));
  }

  return scripts;
}

// ============================================================
// 2. Parse Notification CSV → notification.json
// ============================================================
function parseNotifications(csvText) {
  const rows = parseCSV(csvText);
  if (rows.length < 2) {
    console.error('Notification CSV: Not enough rows');
    return [];
  }

  const header = rows[0];
  console.log('Notification header:', header.map((h,i)=>`${i}:${h}`).join(' | '));

  const colIndex = {};
  header.forEach((col, i) => {
    colIndex[col.trim()] = i;
  });

  const notifications = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const id = cleanField(row[colIndex['ID']] || '');
    const channel = cleanField(row[colIndex['Channel']] || '');
    const sendAlertOn = cleanField(row[colIndex['Send Alert On']] || '');
    const documentType = cleanField(row[colIndex['Document Type']] || '');
    const enabled = cleanField(row[colIndex['Enabled']] || '1');
    const subject = cleanField(row[colIndex['Subject']] || '');
    const condition = cleanField(row[colIndex['Condition']] || '');
    const messageType = cleanField(row[colIndex['Message Type']] || 'Markdown');
    const message = cleanField(row[colIndex['Message']] || '');
    const valueChanged = cleanField(row[colIndex['Value Changed']] || '');
    const sendSysNotification = cleanField(row[colIndex['Send System Notification']] || '0');
    const senderEmail = cleanField(row[colIndex['Sender Email']] || '');
    const setProperty = cleanField(row[colIndex['Set Property After Alert']] || '');
    const setValue = cleanField(row[colIndex['Value To Be Set']] || '');
    const sendToAll = cleanField(row[colIndex['Send To All Assignees']] || '0');
    const module = cleanField(row[colIndex['Module']] || '');
    const recipientField = cleanField(row[colIndex['Receiver By Document Field (Recipients)']] || '');
    const recipientRole = cleanField(row[colIndex['Receiver By Role (Recipients)']] || '');

    if (!id || !documentType || !subject) {
      continue; // skip rows with missing mandatory fields
    }

    const record = {
      doctype: 'Notification',
      name: id,
      channel: channel || 'Email',
      enabled: parseInt(enabled) || 1,
      subject: subject,
      document_type: documentType,
      event: sendAlertOn || 'Save',
      message: message,
      message_type: messageType || 'Markdown',
      is_standard: 0,
      module: module || 'College Events',
      condition: condition || '',
      value_changed: valueChanged || '',
      send_system_notification: parseInt(sendSysNotification) || 0,
      sender_email: senderEmail || '',
      set_property_after_alert: setProperty || '',
      value_to_be_set: setValue || '',
      send_to_all_assignees: parseInt(sendToAll) || 0,
      attach_print: 0
    };

    // Add recipients
    if (recipientField) {
      record.recipients = [];
      record.recipients.push({
        receiver_by_document_field: recipientField,
        receiver_by_role: recipientRole || ''
      });
    }

    notifications.push(record);
  }

  return notifications;
}

// ============================================================
// 3. Parse Report CSV → report.json
// ============================================================
function parseReports(csvText) {
  const rows = parseCSV(csvText);
  if (rows.length < 2) {
    console.error('Report CSV: Not enough rows');
    return [];
  }

  const header = rows[0];
  console.log('Report header:', header.map((h,i)=>`${i}:${h}`).join(' | '));

  const colIndex = {};
  header.forEach((col, i) => {
    colIndex[col.trim()] = i;
  });

  const reports = [];
  let currentReport = null;

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const reportName = cleanField(row[colIndex['Report Name']] || '');
    const refDocType = cleanField(row[colIndex['Ref DocType']] || '');
    const reportType = cleanField(row[colIndex['Report Type']] || '');
    const module = cleanField(row[colIndex['Module']] || '');
    const query = cleanField(row[colIndex['Query']] || '');
    const role = cleanField(row[colIndex['Role (Roles)']] || '');

    if (reportName && refDocType) {
      // New report record
      if (currentReport) {
        reports.push(currentReport);
      }
      currentReport = {
        doctype: 'Report',
        name: reportName,
        report_name: reportName,
        ref_doctype: refDocType,
        report_type: reportType || 'Query Report',
        is_standard: 'No',
        module: module || 'College Events',
        add_total_row: 0,
        disabled: 0,
        query: query || ''
      };
      if (role) {
        currentReport.roles = [{ role: role }];
      }
    } else if (currentReport && role && !reportName) {
      // Role-only row (continuation of current report)
      if (!currentReport.roles) currentReport.roles = [];
      if (!currentReport.roles.find(r => r.role === role)) {
        currentReport.roles.push({ role: role });
      }
    } else if (currentReport && !reportName && !role) {
      // Skip empty rows
    }
  }

  // Push last report
  if (currentReport) {
    reports.push(currentReport);
  }

  return reports;
}

// ============================================================
// Python Syntax Validation
// ============================================================
function validatePython(code) {
  // Try to use Python if available, otherwise use basic checks
  try {
    const { execSync } = require('child_process');
    // Create a temporary validation script
    const tmpFile = `__pycheck_${Date.now()}.py`;
    writeFileSync(tmpFile, code, 'utf8');
    try {
      execSync(`python3 -c "compile(open('${tmpFile}').read(),'${tmpFile}','exec')" 2>&1 || python -c "compile(open('${tmpFile}').read(),'${tmpFile}','exec')" 2>&1`, 
        { stdio: 'pipe', timeout: 5000 });
      // Clean up
      try { require('fs').unlinkSync(tmpFile); } catch(e) {}
      return { valid: true, error: null };
    } catch (e) {
      try { require('fs').unlinkSync(tmpFile); } catch(e2) {}
      return { valid: false, error: e.message || 'Unknown error' };
    }
  } catch (e) {
    // Python not available - do basic validation
    // Check for unbalanced braces/parens
    let braces = 0, parens = 0, brackets = 0;
    let inStr = false, inTriple = false;
    for (let i = 0; i < code.length; i++) {
      const ch = code[i];
      if (ch === '"' || ch === "'") {
        if (i + 2 < code.length && code[i] === code[i+1] && code[i] === code[i+2]) {
          inTriple = !inTriple;
          i += 2;
          continue;
        }
        if (!inTriple) inStr = !inStr;
      }
      if (!inStr && !inTriple) {
        if (ch === '{') braces++;
        if (ch === '}') braces--;
        if (ch === '(') parens++;
        if (ch === ')') parens--;
        if (ch === '[') brackets++;
        if (ch === ']') brackets--;
      }
    }
    if (braces !== 0) return { valid: false, error: `Unbalanced braces: ${braces}` };
    if (parens !== 0) return { valid: false, error: `Unbalanced parens: ${parens}` };
    if (brackets !== 0) return { valid: false, error: `Unbalanced brackets: ${brackets}` };
    return { valid: true, error: null };
  }
}

// ============================================================
// MAIN
// ============================================================
function main() {
  // Read CSV files
  let ssCsv, notifCsv, reportCsv;
  try {
    ssCsv = readFileSync('csv_data/server_scripts.csv', 'utf8');
  } catch(e) {
    console.log('Server Script CSV not found at csv_data/server_scripts.csv');
    ssCsv = '';
  }
  try {
    notifCsv = readFileSync('csv_data/notifications.csv', 'utf8');
  } catch(e) {
    console.log('Notification CSV not found at csv_data/notifications.csv');
    notifCsv = '';
  }
  try {
    reportCsv = readFileSync('csv_data/reports.csv', 'utf8');
  } catch(e) {
    console.log('Report CSV not found at csv_data/reports.csv');
    reportCsv = '';
  }

  // Process Server Scripts
  if (ssCsv) {
    console.log('\n=== PARSING SERVER SCRIPTS ===');
    const scripts = parseServerScripts(ssCsv);
    console.log(`Total parsed: ${scripts.length}`);

    // Validate Python
    let validCount = 0, invalidCount = 0;
    for (const s of scripts) {
      const result = validatePython(s.script);
      if (result.valid) {
        validCount++;
      } else {
        invalidCount++;
        console.log(`  Python error in "${s.name}": ${result.error}`);
      }
    }
    console.log(`Python validation: ${validCount} valid, ${invalidCount} with issues (may be partial)`);

    writeFileSync('college_template/fixtures/server_script.json', JSON.stringify(scripts, null, 2) + '\n', 'utf8');
    console.log(`Wrote ${scripts.length} Server Scripts to fixtures/server_script.json`);
  }

  // Process Notifications
  if (notifCsv) {
    console.log('\n=== PARSING NOTIFICATIONS ===');
    const notifications = parseNotifications(notifCsv);
    console.log(`Total parsed: ${notifications.length}`);
    writeFileSync('college_template/fixtures/notification.json', JSON.stringify(notifications, null, 2) + '\n', 'utf8');
    console.log(`Wrote ${notifications.length} Notifications to fixtures/notification.json`);
  }

  // Process Reports
  if (reportCsv) {
    console.log('\n=== PARSING REPORTS ===');
    const reports = parseReports(reportCsv);
    console.log(`Total parsed: ${reports.length}`);
    writeFileSync('college_template/fixtures/report.json', JSON.stringify(reports, null, 2) + '\n', 'utf8');
    console.log(`Wrote ${reports.length} Reports to fixtures/report.json`);
  }
}

main();
