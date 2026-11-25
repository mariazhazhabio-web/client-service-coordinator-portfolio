/*
 * Builds importable n8n workflow JSON from src/data/automations.ts.
 * Safety: placeholder credentials, test resource IDs, workflow inactive,
 * and every Gmail node disabled so importing can never send email.
 */
import crypto from "node:crypto";

const uuid = () => crypto.randomUUID();
const RL = (value, mode = "id") => ({ __rl: true, value, mode });
const CRED = {
  sheets: { googleSheetsOAuth2Api: { id: "MOCK_CREDENTIAL_ID", name: "MOCK_GOOGLE_SHEETS (replace with your test account)" } },
  gmail: { gmailOAuth2: { id: "MOCK_CREDENTIAL_ID", name: "MOCK_GMAIL (replace with your test account)" } },
  calendar: { googleCalendarOAuth2Api: { id: "MOCK_CREDENTIAL_ID", name: "MOCK_GOOGLE_CALENDAR (replace)" } },
  drive: { googleDriveOAuth2Api: { id: "MOCK_CREDENTIAL_ID", name: "MOCK_GOOGLE_DRIVE (replace)" } },
  trello: { trelloApi: { id: "MOCK_CREDENTIAL_ID", name: "MOCK_TRELLO (replace)" } },
};

const CODE = {
  "Validate & normalize": `// Validate required fields and normalize formats (test data only)
return $input.all().map(item => {
  const j = item.json;
  const name = String(j['Full Name'] ?? j.name ?? '').trim();
  const email = String(j['Email'] ?? j.email ?? '').trim().toLowerCase();
  const digits = String(j['Phone'] ?? j.phone ?? '').replace(/\\D/g, '').slice(-10);
  const phone = digits.length === 10 ? \`(\${digits.slice(0,3)}) \${digits.slice(3,6)}-\${digits.slice(6)}\` : '';
  const errors = [];
  if (!name) errors.push('Missing name');
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) errors.push('Invalid email');
  return { json: { name, email, phone, advisor: j['Preferred Advisor'] ?? 'Unassigned', valid: errors.length === 0, errors, receivedAt: new Date().toISOString() } };
});`,
  "Apply category checklist": `const CHECKLISTS = {
  'Address Change': ['Signed address change form', 'Update CRM', 'Confirm with client'],
  'Beneficiary Update': ['Signed beneficiary form', 'Advisor review', 'Confirm with client'],
  'New Account Application': ['Forms complete', 'Signatures', 'Advisor approval', 'Submit', 'Confirm'],
};
return $input.all().map(i => ({ json: { ...i.json, checklist: CHECKLISTS[i.json.Category] ?? ['Process request', 'Confirm with client'] } }));`,
  "Set due date by priority": `const DAYS = { High: 2, Medium: 5, Low: 7 };
const addBusinessDays = (d, n) => { const r = new Date(d); while (n > 0) { r.setDate(r.getDate() + 1); if (r.getDay() % 6 !== 0) n--; } return r; };
return $input.all().map(i => ({ json: { ...i.json, dueDate: addBusinessDays(new Date(), DAYS[i.json.Priority] ?? 5).toISOString().slice(0, 10) } }));`,
  "Group by owner": `const groups = {};
for (const i of $input.all()) { const o = i.json['Owner'] ?? 'Unassigned'; (groups[o] ??= []).push(i.json); }
return Object.entries(groups).map(([owner, items]) => ({ json: { owner, count: items.length, lines: items.map(x => \`- \${x['Client']}: \${x['Purpose']} (due \${x['Next Follow-up']})\`).join('\\n') } }));`,
  "Build reminder from template": `return $input.all().map(i => ({ json: { ...i.json,
  subject: 'Friendly reminder: items needed to complete your request',
  body: \`Dear \${i.json['Client']},\\n\\nTo finish processing your request, we still need:\\n- \${i.json['Requirement']}\\n\\nPlease use our secure upload method. Thank you!\\n\\nClient Service Coordinator\` } }));`,
  "Convert time zones": `const fmt = (d, tz) => new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(d);
return $input.all().map(i => { const start = new Date(i.json.start?.dateTime ?? i.json.start ?? Date.now());
  return { json: { ...i.json, pacific: fmt(start, 'America/Los_Angeles'), manila: fmt(start, 'Asia/Manila') } }; });`,
  "Schedule 24-hour reminder": `// In production you would use a Wait node set to 24h before start. Simulation: compute the reminder time only.
return $input.all().map(i => ({ json: { ...i.json, reminderAt: new Date(new Date(i.json.start?.dateTime ?? Date.now()).getTime() - 864e5).toISOString() } }));`,
  "Find overdue": `const today = new Date().toISOString().slice(0, 10);
return $input.all().filter(i => i.json['Status'] !== 'Completed' && String(i.json['Target Date']).slice(0, 10) < today);`,
  "Calculate KPIs": `const rows = $input.all().map(i => i.json);
const today = new Date().toISOString().slice(0, 10);
const done = rows.filter(r => r['Status'] === 'Completed');
const days = (a, b) => (new Date(b) - new Date(a)) / 864e5;
const tat = done.map(r => days(r['Date Received'], r['Resolution Date'])).filter(n => !isNaN(n));
const onTime = done.filter(r => r['Resolution Date'] <= r['Target Date']).length;
return [{ json: {
  total: rows.length, completed: done.length, pending: rows.length - done.length,
  overdue: rows.filter(r => r['Status'] !== 'Completed' && r['Target Date'] < today).length,
  avgTurnaroundDays: tat.length ? +(tat.reduce((a, b) => a + b, 0) / tat.length).toFixed(1) : 0,
  completionRate: rows.length ? +(done.length / rows.length * 100).toFixed(1) : 0,
  onTimeRate: done.length ? +(onTime / done.length * 100).toFixed(1) : 0,
} }];`,
};

function nodeFor(step, i, wf) {
  const base = { id: uuid(), name: step.name, position: [260 + i * 240, 300] };
  const tz = "America/Los_Angeles";
  switch (step.app) {
    case "Schedule": {
      const cron = (step.action.match(/Cron ([^(]+)/)?.[1] ?? "0 8 * * 1-5").trim();
      return { ...base, type: "n8n-nodes-base.scheduleTrigger", typeVersion: 1.2, parameters: { rule: { interval: [{ field: "cronExpression", expression: cron }] } }, notes: `Timezone: set workflow timezone to ${tz}` };
    }
    case "Google Forms":
      return { ...base, type: "n8n-nodes-base.googleSheetsTrigger", typeVersion: 1, parameters: { pollTimes: { item: [{ mode: "everyMinute" }] }, documentId: RL("YOUR_TEST_FORM_RESPONSES_SHEET_ID"), sheetName: RL("Form Responses 1", "name"), event: "rowAdded", options: {} }, credentials: CRED.sheets, notes: "Google Forms writes responses to a linked Google Sheet; this trigger watches that sheet." };
    case "Google Calendar":
      return { ...base, type: "n8n-nodes-base.googleCalendarTrigger", typeVersion: 1, parameters: { pollTimes: { item: [{ mode: "everyMinute" }] }, calendarId: RL("YOUR_TEST_CALENDAR_ID@group.calendar.google.com"), triggerOn: "eventCreated", options: {} }, credentials: CRED.calendar };
    case "Google Sheets": {
      const isTrigger = i === 0;
      if (isTrigger) return { ...base, type: "n8n-nodes-base.googleSheetsTrigger", typeVersion: 1, parameters: { pollTimes: { item: [{ mode: "everyMinute" }] }, documentId: RL("YOUR_TEST_SHEET_ID"), sheetName: RL("Service_Requests", "name"), event: "rowAdded", options: {} }, credentials: CRED.sheets };
      const op = /append|Append/.test(step.action) ? "append" : /Update|update/.test(step.action) ? "update" : "read";
      const sheet = step.action.match(/'([^']+)'/)?.[1] ?? "Service_Requests";
      return { ...base, type: "n8n-nodes-base.googleSheets", typeVersion: 4.5, parameters: { operation: op, documentId: RL("YOUR_TEST_SHEET_ID"), sheetName: RL(sheet, "name"), ...(op !== "read" ? { columns: { mappingMode: "autoMapInputData", value: {}, matchingColumns: op === "update" ? ["Ref #"] : [] } } : {}), options: {} }, credentials: CRED.sheets };
    }
    case "Gmail":
      return { ...base, type: "n8n-nodes-base.gmail", typeVersion: 2.1, disabled: true, parameters: { sendTo: "test-recipient@example.com", subject: `={{ $json.subject ?? '${wf.title} (TEST)' }}`, emailType: "text", message: `={{ $json.body ?? $json.lines ?? 'Test message from portfolio demo workflow' }}`, options: {} }, credentials: CRED.gmail, notes: "DISABLED BY DEFAULT. Enable only with a test inbox. Never send to real clients from a demo." };
    case "Google Drive":
      return { ...base, type: "n8n-nodes-base.googleDrive", typeVersion: 3, parameters: /folder/i.test(step.action) ? { resource: "folder", name: "={{ 'TEST_' + ($json.name ?? 'Client') }}", driveId: RL("My Drive", "list"), folderId: RL("YOUR_TEST_PARENT_FOLDER_ID"), options: {} } : { operation: "createFromText", content: "={{ JSON.stringify($json, null, 2) }}", name: "={{ 'Weekly Report ' + $now.toFormat('yyyy-MM-dd') }}", driveId: RL("My Drive", "list"), folderId: RL("YOUR_TEST_REPORTS_FOLDER_ID"), options: {} }, credentials: CRED.drive };
    case "Trello":
      return { ...base, type: "n8n-nodes-base.trello", typeVersion: 1, parameters: /label/i.test(step.action) ? { resource: "label", operation: "addLabel", cardId: "={{ $json['Trello Card ID'] }}", id: "YOUR_TEST_OVERDUE_LABEL_ID" } : { listId: "YOUR_TEST_TRELLO_LIST_ID", name: "={{ ($json['Ref #'] ?? 'TEST') + ' · ' + ($json['Category'] ?? 'Request') }}", description: "={{ 'Due: ' + ($json.dueDate ?? '') + '\\nChecklist: ' + ($json.checklist ?? []).join(', ') }}", additionalFields: {} }, credentials: CRED.trello };
    default:
      return { ...base, type: "n8n-nodes-base.code", typeVersion: 2, parameters: { jsCode: CODE[step.name] ?? `// ${step.action}\nreturn $input.all();` } };
  }
}

export function buildN8n(wf) {
  const nodes = wf.steps.map((s, i) => nodeFor(s, i, wf));
  // Manual test path with mock data so the workflow can be tested without any trigger firing
  const manual = { id: uuid(), name: "Test: run manually", type: "n8n-nodes-base.manualTrigger", typeVersion: 1, position: [20, 520], parameters: {} };
  const mock = { id: uuid(), name: "Mock test data", type: "n8n-nodes-base.code", typeVersion: 2, position: [260, 520], parameters: { jsCode: `// FICTIONAL TEST DATA ONLY\nreturn [\n  { json: { 'Full Name': 'Olivia Test', Email: 'olivia.test@example.com', Phone: '805-555-0100', 'Ref #': 'SR-TEST-1201', Category: 'Address Change', Priority: 'Medium', Status: 'In Progress', 'Date Received': '2026-01-05', 'Target Date': '2026-01-09', 'Resolution Date': '', Client: 'Olivia Test', Owner: 'Coordinator', Purpose: 'Outstanding documents', 'Next Follow-up': '2026-01-08', Requirement: 'Signed form (mock)' } },\n  { json: { 'Full Name': 'Ben Sample', Email: 'ben.sample@example.com', Phone: '805-555-0101', 'Ref #': 'SR-TEST-1202', Category: 'Beneficiary Update', Priority: 'High', Status: 'Completed', 'Date Received': '2026-01-02', 'Target Date': '2026-01-06', 'Resolution Date': '2026-01-05', Client: 'Ben Sample', Owner: 'Operations', Purpose: 'Request status update', 'Next Follow-up': '2026-01-07', Requirement: 'Advisor review' } }\n];` } };
  const all = [manual, mock, ...nodes];
  const connections = {};
  const link = (a, b) => { connections[a] = { main: [[{ node: b, type: "main", index: 0 }]] }; };
  for (let i = 0; i < nodes.length - 1; i++) link(nodes[i].name, nodes[i + 1].name);
  link(manual.name, mock.name);
  link(mock.name, nodes[1]?.name ?? nodes[0].name);
  const sticky = { id: uuid(), name: "README", type: "n8n-nodes-base.stickyNote", typeVersion: 1, position: [20, 40], parameters: { width: 520, height: 220, content: `## ${wf.title}\n**Portfolio demonstration. Fictional test data only.**\n\nTrigger: ${wf.trigger}\n\n1. Replace every MOCK credential with your own *test* accounts.\n2. Replace YOUR_TEST_* IDs with test Sheets, Calendars, and Trello lists.\n3. Gmail nodes are disabled. Enable them only with a test inbox.\n4. Use "Test: run manually" to run with mock data.\n\nNot affiliated with any financial firm. Do not connect real client data.` } };
  return {
    name: `[DEMO] ${wf.title}`,
    nodes: [sticky, ...all],
    connections,
    active: false,
    settings: { executionOrder: "v1", timezone: "America/Los_Angeles", saveManualExecutions: true },
    meta: { templateCredsSetupCompleted: false, note: "Independent portfolio demonstration by Maria Zha-Zha Cornillez Bio. Mock credentials." },
    pinData: {},
  };
}
