/*
 * Excel Administrative Reporting System: workbook builder.
 * Shared by the browser demo and scripts/generate-assets.mjs (which also injects native charts).
 * Only type imports (erased at runtime); the caller passes the ExcelJS module.
 */
import type { Dataset } from "./sample";

/* eslint-disable @typescript-eslint/no-explicit-any */
type WB = any;
type WS = any;

const NAVY = "FF112144", GOLD = "FFB98B30", LIGHT = "FFF1F3F6", WHITE = "FFFFFFFF";
const RED_FILL = { type: "expression", formulae: [], style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFFDE2E4" } }, font: { color: { argb: "FF9F1239" }, bold: true } } };
const GREEN_FILL = { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFDCFCE7" } }, font: { color: { argb: "FF166534" } } };

const d = (isoDate: string | null) => {
  if (!isoDate) return null;
  const [y, m, dd] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, dd));
};
const colL = (n: number) => { let s = ""; n++; while (n) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; };

type Col = { header: string; key: string; width?: number; fmt?: string };

function sheet(wb: WB, name: string, title: string, cols: Col[], rows: Record<string, unknown>[], tab = "FF213B73"): WS {
  const ws = wb.addWorksheet(name, { properties: { tabColor: { argb: tab } }, views: [{ state: "frozen", ySplit: 3 }] });
  ws.mergeCells(1, 1, 1, cols.length);
  ws.getCell(1, 1).value = title;
  ws.getCell(1, 1).font = { bold: true, size: 14, color: { argb: NAVY } };
  ws.getCell(2, 1).value = "FICTIONAL DEMO DATA · Independent portfolio demonstration · Not affiliated with any financial firm";
  ws.getCell(2, 1).font = { italic: true, size: 9, color: { argb: "FF6B7485" } };
  ws.mergeCells(2, 1, 2, cols.length);
  const hr = ws.getRow(3);
  cols.forEach((c, i) => {
    const cell = hr.getCell(i + 1);
    cell.value = c.header;
    cell.font = { bold: true, color: { argb: WHITE } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
    cell.alignment = { vertical: "middle", wrapText: true };
    cell.border = { bottom: { style: "medium", color: { argb: GOLD } } };
    ws.getColumn(i + 1).width = c.width ?? Math.max(12, c.header.length + 3);
    if (c.fmt) ws.getColumn(i + 1).numFmt = c.fmt;
  });
  hr.height = 30;
  rows.forEach((r, ri) => {
    const row = ws.getRow(4 + ri);
    cols.forEach((c, ci) => { row.getCell(ci + 1).value = r[c.key] as never; });
    if (ri % 2) row.eachCell({ includeEmpty: true }, (cell: any) => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT } }; });
  });
  ws.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3 + Math.max(rows.length, 1), column: cols.length } };
  return ws;
}

function flagRule(ws: WS, col: number, first: number, last: number, value: string, good = false) {
  const L = colL(col - 1);
  ws.addConditionalFormatting({ ref: `${L}${first}:${L}${last}`, rules: [{ ...RED_FILL, ...(good ? { style: GREEN_FILL } : {}), formulae: [`${L}${first}="${value}"`], priority: 1 }] });
}
function listValidation(ws: WS, col: number, first: number, last: number, list: string[]) {
  for (let r = first; r <= last; r++) ws.getCell(r, col).dataValidation = { type: "list", allowBlank: true, formulae: [`"${list.join(",")}"`] };
}

export function buildWorkbook(ExcelJS: any, ds: Dataset): WB {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Maria Bio: Portfolio Demonstration";
  wb.created = new Date();
  wb.calcProperties = { fullCalcOnLoad: true };
  const adv = (id: string) => ds.advisors.find((a) => a.id === id)?.name ?? id;
  const today = d(ds.base)!;
  const DATE = "mmm d, yyyy";

  /* README */
  const rd = wb.addWorksheet("README", { properties: { tabColor: { argb: GOLD } } });
  rd.getColumn(1).width = 110;
  [
    ["Client Service Administrative Reporting System", { bold: true, size: 16, color: { argb: NAVY } }],
    ["Independent portfolio demonstration by Maria Zha-Zha Cornillez Bio. All data is fictional. Not affiliated with Ameriprise Financial or any financial firm.", { italic: true }],
    ["", {}],
    ["Worksheets", { bold: true }],
    ["1. Client Master List: client records, days since contact (formula), follow-up due flag (formula)", {}],
    ["2. Application Tracker: completeness checks and % complete (COUNTIF formula)", {}],
    ["3. Service Request Tracker: turnaround days, overdue flag, and on-time flag (IF/AND/TODAY formulas)", {}],
    ["4. Pending Requirements: days outstanding (formula)", {}],
    ["5. Appointment Schedule: end time and Philippine time conversion (formula using the DST-aware offset column)", {}],
    ["6. Follow-up Tracker: days until the follow-up and status flag (formula)", {}],
    ["7. Staff Task Assignment: task list with overdue flag plus a workload summary (COUNTIFS)", {}],
    ["8. Monthly Performance Report: completion rate (formula) and trend chart", {}],
    ["9. KPI Dashboard: total, completed, pending, and overdue requests; average turnaround; completion rate; on-time resolution rate", {}],
    ["", {}],
    ["How to use: enter new rows in the trackers. KPIs recalculate automatically. Use the filter arrows in each header row. Red highlights mark overdue items.", {}],
    [`Data generated relative to ${ds.base}. Formulas that use TODAY() update when the file is opened.`, { italic: true, color: { argb: "FF6B7485" } }],
  ].forEach(([t, f], i) => { const c = rd.getCell(i + 1, 1); c.value = t; c.font = f; c.alignment = { wrapText: true }; });

  /* 1 Client Master List */
  const cm = sheet(wb, "Client Master List", "Client Master List", [
    { header: "Client ID", key: "id", width: 11 }, { header: "Client Name", key: "name", width: 20 }, { header: "Household", key: "household", width: 20 },
    { header: "Email", key: "email", width: 30 }, { header: "Phone", key: "phone", width: 16 }, { header: "City", key: "city", width: 20 },
    { header: "Advisor", key: "advisor", width: 18 }, { header: "Status", key: "status", width: 12 }, { header: "Segment", key: "segment", width: 14 },
    { header: "Account Ref (demo)", key: "accountRef", width: 16 }, { header: "Client Since", key: "since", fmt: DATE }, { header: "Last Contact", key: "lastContact", fmt: DATE },
    { header: "Next Follow-up", key: "nextFollowUp", fmt: DATE }, { header: "Days Since Contact", key: "dsc", width: 12 }, { header: "Follow-up Due?", key: "due", width: 12 },
  ], ds.clients.map((c) => ({ ...c, advisor: adv(c.advisorId), since: d(c.since), lastContact: d(c.lastContact), nextFollowUp: d(c.nextFollowUp) })));
  ds.clients.forEach((c, i) => {
    const r = 4 + i;
    cm.getCell(`N${r}`).value = { formula: `TODAY()-L${r}`, result: Math.round((today.getTime() - d(c.lastContact)!.getTime()) / 864e5) };
    cm.getCell(`O${r}`).value = { formula: `IF(AND(M${r}<=TODAY(),H${r}<>"Inactive"),"Yes","No")`, result: c.nextFollowUp <= ds.base && c.status !== "Inactive" ? "Yes" : "No" };
  });
  const cmLast = 3 + ds.clients.length;
  flagRule(cm, 15, 4, cmLast, "Yes");
  listValidation(cm, 8, 4, cmLast + 50, ["Active", "Onboarding", "Prospect", "Inactive"]);

  /* 3 Service Request Tracker (built before 2 so KPI refs are stable) */
  const reqCols: Col[] = [
    { header: "Ref #", key: "ref", width: 15 }, { header: "Client", key: "clientName", width: 20 }, { header: "Category", key: "category", width: 28 },
    { header: "Date Received", key: "received", fmt: DATE }, { header: "Assigned To", key: "assignedTo", width: 18 }, { header: "Priority", key: "priority", width: 10 },
    { header: "Target Date", key: "target", fmt: DATE }, { header: "Status", key: "status", width: 20 }, { header: "Resolution Date", key: "resolved", fmt: DATE },
    { header: "Turnaround (days)", key: "tat", width: 12 }, { header: "Overdue?", key: "overdue", width: 10 }, { header: "On Time?", key: "ontime", width: 10 },
    { header: "Pending Requirements", key: "pending", width: 40 },
  ];

  /* 2 Application Tracker */
  const appCats = ["New Account Application", "Transfer Paperwork", "Systematic Contribution Setup", "Beneficiary Update"];
  const apps = ds.requests.filter((r) => appCats.includes(r.category));
  const at = sheet(wb, "Application Tracker", "Client Application & Form Tracker", [
    { header: "Ref #", key: "ref", width: 15 }, { header: "Client", key: "clientName", width: 20 }, { header: "Application / Form", key: "category", width: 28 },
    { header: "Date Received", key: "received", fmt: DATE }, { header: "Prepared By", key: "assignedTo", width: 18 }, { header: "Forms Complete", key: "f1", width: 11 },
    { header: "Signatures Obtained", key: "f2", width: 11 }, { header: "Advisor Approved", key: "f3", width: 11 }, { header: "% Complete", key: "pct", width: 11, fmt: "0%" },
    { header: "Status", key: "status", width: 20 }, { header: "Days Open", key: "open", width: 10 },
  ], apps.map((r) => {
    const done = r.status === "Completed";
    const lvl = done ? 3 : r.status === "Pending Home Office" ? 3 : r.status === "Pending Client" ? 1 : r.status === "In Progress" ? 2 : 0;
    return { ...r, received: d(r.received), f1: lvl >= 1 ? "Yes" : "No", f2: lvl >= 2 ? "Yes" : "No", f3: lvl >= 3 ? "Yes" : "No" };
  }));
  apps.forEach((r, i) => {
    const row = 4 + i;
    const yes = ["F", "G", "H"].filter((c) => at.getCell(`${c}${row}`).value === "Yes").length;
    at.getCell(`I${row}`).value = { formula: `COUNTIF(F${row}:H${row},"Yes")/3`, result: yes / 3 };
    at.getCell(`K${row}`).value = { formula: `IF(J${row}="Completed","Closed",TODAY()-D${row})`, result: r.status === "Completed" ? "Closed" : Math.round((today.getTime() - d(r.received)!.getTime()) / 864e5) };
  });
  listValidation(at, 6, 4, 3 + apps.length + 50, ["Yes", "No"]);
  listValidation(at, 7, 4, 3 + apps.length + 50, ["Yes", "No"]);
  listValidation(at, 8, 4, 3 + apps.length + 50, ["Yes", "No"]);
  at.addConditionalFormatting({ ref: `I4:I${3 + apps.length}`, rules: [{ type: "dataBar", priority: 1, cfvo: [{ type: "num", value: 0 }, { type: "num", value: 1 }], color: { argb: "FF4F6FAE" } }] });

  const sr = sheet(wb, "Service Request Tracker", "Client Service Request Tracker", reqCols, ds.requests.map((r) => ({ ...r, received: d(r.received), target: d(r.target), resolved: d(r.resolved), pending: r.pending.join("; ") })));
  ds.requests.forEach((r, i) => {
    const row = 4 + i;
    const tat = r.resolved ? Math.round((d(r.resolved)!.getTime() - d(r.received)!.getTime()) / 864e5) : "";
    sr.getCell(`J${row}`).value = { formula: `IF(I${row}="","",I${row}-D${row})`, result: tat };
    sr.getCell(`K${row}`).value = { formula: `IF(AND(H${row}<>"Completed",G${row}<TODAY()),"Yes","No")`, result: r.status !== "Completed" && r.target < ds.base ? "Yes" : "No" };
    sr.getCell(`L${row}`).value = { formula: `IF(I${row}="","",IF(I${row}<=G${row},"Yes","No"))`, result: r.resolved ? (r.resolved <= r.target ? "Yes" : "No") : "" };
  });
  const srLast = 3 + ds.requests.length;
  flagRule(sr, 11, 4, srLast, "Yes");
  sr.addConditionalFormatting({ ref: `H4:H${srLast}`, rules: [{ type: "expression", priority: 2, formulae: [`H4="Completed"`], style: GREEN_FILL }] });
  listValidation(sr, 8, 4, srLast + 100, ["Received", "In Progress", "Pending Client", "Pending Home Office", "Completed"]);
  listValidation(sr, 6, 4, srLast + 100, ["High", "Medium", "Low"]);
  // move Service Request Tracker to position 4 (after Application Tracker) is automatic by creation order

  /* 4 Pending Requirements */
  const pend = ds.requests.filter((r) => r.status !== "Completed").flatMap((r) => r.pending.map((p) => ({ ref: r.ref, client: r.clientName, req: p, owner: /advisor/i.test(p) ? "Advisor" : /home office/i.test(p) ? "Operations" : "Client", requested: d(r.received), due: d(r.target), status: "Outstanding" })));
  const pr = sheet(wb, "Pending Requirements", "Pending Requirements", [
    { header: "Request Ref", key: "ref", width: 15 }, { header: "Client", key: "client", width: 20 }, { header: "Requirement", key: "req", width: 42 }, { header: "Responsible", key: "owner", width: 13 },
    { header: "Requested", key: "requested", fmt: DATE }, { header: "Due", key: "due", fmt: DATE }, { header: "Status", key: "status", width: 13 }, { header: "Days Outstanding", key: "days", width: 12 },
  ], pend);
  pend.forEach((p, i) => { const row = 4 + i; pr.getCell(`H${row}`).value = { formula: `IF(G${row}="Received","",TODAY()-E${row})`, result: Math.round((today.getTime() - p.requested!.getTime()) / 864e5) }; });
  listValidation(pr, 7, 4, 3 + pend.length + 50, ["Outstanding", "Requested Again", "Received"]);
  pr.addConditionalFormatting({ ref: `H4:H${3 + pend.length}`, rules: [{ type: "cellIs", operator: "greaterThan", formulae: [7], priority: 1, style: RED_FILL.style }] });

  /* 5 Appointment Schedule */
  const tzOff = (date: string, time: string) => {
    // PT offset from UTC for that wall time: -7 (PDT) or -8 (PST). PHT is +8. Difference = 15 or 16.
    const probe = new Date(`${date}T${time}:00Z`);
    const ptHour = Number(new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", hour: "numeric", hourCycle: "h23" }).format(probe));
    const off = ((ptHour - probe.getUTCHours() + 36) % 24) - 12; // -7 or -8
    return 8 - off;
  };
  const ap = sheet(wb, "Appointment Schedule", "Appointment Schedule (Advisor Calendars)", [
    { header: "Appt ID", key: "id", width: 9 }, { header: "Date (PT)", key: "date", fmt: DATE }, { header: "Start (PT)", key: "start", fmt: "h:mm AM/PM" }, { header: "Duration (min)", key: "duration", width: 10 },
    { header: "End (PT)", key: "end", fmt: "h:mm AM/PM" }, { header: "PT→PHT (+hrs)", key: "diff", width: 10 }, { header: "Philippine Date/Time", key: "ph", width: 20, fmt: "ddd mmm d, h:mm AM/PM" },
    { header: "Advisor", key: "advisor", width: 18 }, { header: "Client", key: "clientName", width: 20 }, { header: "Type", key: "type", width: 20 }, { header: "Mode", key: "mode", width: 10 }, { header: "Status", key: "status", width: 12 },
  ], ds.appointments.map((a) => { const [h, m] = a.start.split(":").map(Number); return { ...a, date: d(a.date), start: (h * 60 + m) / 1440, advisor: adv(a.advisorId), diff: tzOff(a.date, a.start) }; }));
  ds.appointments.forEach((a, i) => {
    const row = 4 + i;
    ap.getCell(`E${row}`).value = { formula: `C${row}+D${row}/1440` };
    ap.getCell(`G${row}`).value = { formula: `B${row}+C${row}+F${row}/24` };
  });
  listValidation(ap, 12, 4, 3 + ds.appointments.length + 50, ["Confirmed", "Tentative", "Rescheduled", "Completed"]);

  /* 6 Follow-up Tracker */
  const fus = ds.clients.filter((c) => c.status !== "Inactive").map((c, i) => ({ client: c.name, id: c.id, last: d(c.lastContact), next: d(c.nextFollowUp), owner: ds.staff[i % 2].name.replace(" (Demo User)", ""), method: ["Phone", "Email", "Email", "Video"][i % 4], purpose: ["Outstanding documents", "Schedule annual review", "Request status update", "Post-meeting check-in"][i % 4], status: c.nextFollowUp < ds.base && i % 3 === 0 ? "Done" : "Open" }));
  const fu = sheet(wb, "Follow-up Tracker", "Client Follow-up Tracker", [
    { header: "Client", key: "client", width: 20 }, { header: "Client ID", key: "id", width: 10 }, { header: "Last Contact", key: "last", fmt: DATE }, { header: "Next Follow-up", key: "next", fmt: DATE },
    { header: "Owner", key: "owner", width: 26 }, { header: "Method", key: "method", width: 10 }, { header: "Purpose", key: "purpose", width: 26 }, { header: "Status", key: "status", width: 9 },
    { header: "Days Until", key: "until", width: 10 }, { header: "Flag", key: "flag", width: 12 },
  ], fus);
  fus.forEach((f, i) => {
    const row = 4 + i;
    const until = Math.round((f.next!.getTime() - today.getTime()) / 864e5);
    fu.getCell(`I${row}`).value = { formula: `D${row}-TODAY()`, result: until };
    fu.getCell(`J${row}`).value = { formula: `IF(H${row}="Done","Done",IF(I${row}<0,"OVERDUE",IF(I${row}<=2,"Due soon","Scheduled")))`, result: f.status === "Done" ? "Done" : until < 0 ? "OVERDUE" : until <= 2 ? "Due soon" : "Scheduled" };
  });
  flagRule(fu, 10, 4, 3 + fus.length, "OVERDUE");
  listValidation(fu, 8, 4, 3 + fus.length + 50, ["Open", "Done"]);

  /* 7 Staff Task Assignment */
  const tasks = [
    ...ds.clients.flatMap((c) => c.tasks.map((t) => ({ task: t.title, client: c.name, owner: t.assignee, due: d(t.due), status: t.done ? "Done" : "Open", source: "CRM" }))),
    ...ds.meetings.flatMap((m) => m.actions.map((a) => ({ task: a.task, client: m.clientName, owner: a.owner, due: d(a.due), status: a.done ? "Done" : "Open", source: `Meeting ${m.id}` }))),
  ];
  const st = sheet(wb, "Staff Task Assignment", "Staff Task Assignment", [
    { header: "Task", key: "task", width: 42 }, { header: "Client", key: "client", width: 20 }, { header: "Assigned To", key: "owner", width: 26 }, { header: "Due", key: "due", fmt: DATE },
    { header: "Status", key: "status", width: 9 }, { header: "Source", key: "source", width: 14 }, { header: "Overdue?", key: "od", width: 10 },
  ], tasks);
  tasks.forEach((t, i) => { const row = 4 + i; st.getCell(`G${row}`).value = { formula: `IF(AND(E${row}<>"Done",D${row}<TODAY()),"Yes","No")`, result: t.status !== "Done" && t.due! < today ? "Yes" : "No" }; });
  const stLast = 3 + tasks.length;
  flagRule(st, 7, 4, stLast, "Yes");
  listValidation(st, 5, 4, stLast + 50, ["Open", "Done"]);
  const sumCol = 9;
  st.getCell(3, sumCol).value = "Workload Summary"; st.getCell(3, sumCol).font = { bold: true, color: { argb: WHITE } }; st.getCell(3, sumCol).fill = { type: "pattern", pattern: "solid", fgColor: { argb: GOLD } };
  ["Open Tasks", "Overdue", "Done"].forEach((h, k) => { const c = st.getCell(3, sumCol + 1 + k); c.value = h; c.font = { bold: true, color: { argb: WHITE } }; c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GOLD } }; });
  st.getColumn(sumCol).width = 30;
  ds.staff.forEach((s, k) => {
    const row = 4 + k;
    const n = s.name.replace(" (Demo User)", "");
    st.getCell(row, sumCol).value = n;
    st.getCell(row, sumCol + 1).value = { formula: `COUNTIFS($C$4:$C$${stLast},I${row},$E$4:$E$${stLast},"Open")`, result: tasks.filter((t) => t.owner === n && t.status === "Open").length };
    st.getCell(row, sumCol + 2).value = { formula: `COUNTIFS($C$4:$C$${stLast},I${row},$G$4:$G$${stLast},"Yes")`, result: tasks.filter((t) => t.owner === n && t.status !== "Done" && t.due! < today).length };
    st.getCell(row, sumCol + 3).value = { formula: `COUNTIFS($C$4:$C$${stLast},I${row},$E$4:$E$${stLast},"Done")`, result: tasks.filter((t) => t.owner === n && t.status === "Done").length };
  });

  /* 8 Monthly Performance Report */
  const mp = sheet(wb, "Monthly Performance Report", "Monthly Performance Report (12 months, illustrative)", [
    { header: "Month", key: "month", width: 10 }, { header: "Requests Received", key: "received", width: 12 }, { header: "Requests Completed", key: "completed", width: 12 },
    { header: "Overdue at Month End", key: "overdue", width: 12 }, { header: "New Clients", key: "newClients", width: 10 }, { header: "Avg Turnaround (days)", key: "avgTat", width: 13, fmt: "0.0" },
    { header: "On-time Rate", key: "onTimeP", width: 11, fmt: "0%" }, { header: "Completion Rate", key: "cr", width: 12, fmt: "0%" },
  ], ds.months.map((m) => ({ ...m, onTimeP: m.onTime / 100 })), "FFB98B30");
  ds.months.forEach((m, i) => { const row = 4 + i; mp.getCell(`H${row}`).value = { formula: `IFERROR(C${row}/B${row},0)`, result: m.completed / m.received }; });
  const mpLast = 3 + ds.months.length;
  const tr = mpLast + 1;
  mp.getCell(`A${tr}`).value = "TOTAL / AVG"; mp.getRow(tr).font = { bold: true };
  ["B", "C", "D", "E"].forEach((c) => { mp.getCell(`${c}${tr}`).value = { formula: `SUM(${c}4:${c}${mpLast})` }; });
  mp.getCell(`F${tr}`).value = { formula: `AVERAGE(F4:F${mpLast})` };
  mp.getCell(`G${tr}`).value = { formula: `AVERAGE(G4:G${mpLast})` };
  mp.getCell(`H${tr}`).value = { formula: `IFERROR(C${tr}/B${tr},0)` };

  /* 9 KPI Dashboard */
  const kd = wb.addWorksheet("KPI Dashboard", { properties: { tabColor: { argb: "FF166534" } } });
  kd.getColumn(1).width = 34; kd.getColumn(2).width = 16; kd.getColumn(3).width = 60;
  kd.getCell("A1").value = "Client Service KPI Dashboard"; kd.getCell("A1").font = { bold: true, size: 16, color: { argb: NAVY } };
  kd.getCell("A2").value = "All values are live formulas based on the 'Service Request Tracker' sheet. Fictional demo data."; kd.getCell("A2").font = { italic: true, size: 9, color: { argb: "FF6B7485" } };
  const S = "'Service Request Tracker'!";
  const R = (c: string) => `${S}$${c}$4:$${c}$${srLast + 200}`;
  const kpis: [string, string, string, string?][] = [
    ["Total requests", `COUNTA(${R("A")})`, "COUNTA of reference numbers"],
    ["Completed requests", `COUNTIF(${R("H")},"Completed")`, "COUNTIF Status = Completed"],
    ["Pending requests", `B5-B6`, "Total minus completed"],
    ["Overdue requests", `COUNTIF(${R("K")},"Yes")`, "Open and past target date (TODAY())"],
    ["Average turnaround time (days)", `IFERROR(AVERAGE(${R("J")}),0)`, "AVERAGE of resolution date minus received date", "0.0"],
    ["Completion rate", `IFERROR(B6/B5,0)`, "Completed ÷ total", "0.0%"],
    ["On-time resolution rate", `IFERROR(COUNTIF(${R("L")},"Yes")/B6,0)`, "Resolved on or before target ÷ completed", "0.0%"],
    ["High-priority open requests", `COUNTIFS(${R("F")},"High",${R("H")},"<>Completed")`, "COUNTIFS priority and status"],
    ["Active clients", `COUNTIF('Client Master List'!$H$4:$H$${cmLast + 200},"Active")`, "From Client Master List"],
    ["Follow-ups due", `COUNTIF('Client Master List'!$O$4:$O$${cmLast + 200},"Yes")`, "From Client Master List"],
  ];
  ["KPI", "Value", "Formula logic"].forEach((h, k) => { const c = kd.getCell(4, k + 1); c.value = h; c.font = { bold: true, color: { argb: WHITE } }; c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } }; });
  kpis.forEach(([label, f, logic, fmt], k) => {
    const row = 5 + k;
    kd.getCell(row, 1).value = label; kd.getCell(row, 1).font = { bold: true };
    kd.getCell(row, 2).value = { formula: f };
    kd.getCell(row, 2).font = { bold: true, size: 13, color: { argb: NAVY } };
    if (fmt) kd.getCell(row, 2).numFmt = fmt;
    kd.getCell(row, 3).value = `=${f}  ·  ${logic}`; kd.getCell(row, 3).font = { size: 9, color: { argb: "FF6B7485" } };
    if (k % 2) [1, 2, 3].forEach((c) => { kd.getCell(row, c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT } }; });
  });
  const catStart = 18;
  kd.getCell(catStart - 1, 1).value = "Requests by category"; kd.getCell(catStart - 1, 1).font = { bold: true, color: { argb: NAVY } };
  ["Category", "Total", "Open"].forEach((h, k) => { const c = kd.getCell(catStart, k + 1); c.value = h; c.font = { bold: true, color: { argb: WHITE } }; c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GOLD } }; });
  const cats = Array.from(new Set(ds.requests.map((r) => r.category)));
  cats.forEach((c, k) => {
    const row = catStart + 1 + k;
    kd.getCell(row, 1).value = c;
    kd.getCell(row, 2).value = { formula: `COUNTIF(${R("C")},A${row})`, result: ds.requests.filter((r) => r.category === c).length };
    kd.getCell(row, 3).value = { formula: `COUNTIFS(${R("C")},A${row},${R("H")},"<>Completed")`, result: ds.requests.filter((r) => r.category === c && r.status !== "Completed").length };
    kd.getCell(row, 3).alignment = { horizontal: "left" };
  });
  const wlStart = catStart + cats.length + 3;
  kd.getCell(wlStart - 1, 1).value = "Open requests by staff (workload)"; kd.getCell(wlStart - 1, 1).font = { bold: true, color: { argb: NAVY } };
  ["Staff", "Open", "Overdue"].forEach((h, k) => { const c = kd.getCell(wlStart, k + 1); c.value = h; c.font = { bold: true, color: { argb: WHITE } }; c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GOLD } }; });
  ds.staff.forEach((s, k) => {
    const row = wlStart + 1 + k;
    const n = s.name.replace(" (Demo User)", "");
    kd.getCell(row, 1).value = n;
    kd.getCell(row, 2).value = { formula: `COUNTIFS(${R("E")},A${row},${R("H")},"<>Completed")`, result: ds.requests.filter((r) => r.assignedTo === n && r.status !== "Completed").length };
    kd.getCell(row, 3).value = { formula: `COUNTIFS(${R("E")},A${row},${R("K")},"Yes")`, result: ds.requests.filter((r) => r.assignedTo === n && r.status !== "Completed" && r.target < ds.base).length };
    kd.getCell(row, 3).alignment = { horizontal: "left" };
  });
  kd.getCell("A5").note = "Change any Status in the Service Request Tracker and these KPIs update automatically.";

  // order: README, Client Master, Application, Service Request, Pending, Appointment, Follow-up, Staff, Monthly, KPI
  return wb;
}

/** Metadata the generator uses to inject native charts (sheet name → chart specs). */
export function chartSpecs(ds: Dataset) {
  const cats = Array.from(new Set(ds.requests.map((r) => r.category)));
  const catStart = 18;
  const n = ds.months.length;
  return [
    { sheet: "KPI Dashboard", title: "Requests by Category (Total vs Open)", type: "bar" as const, cats: `'KPI Dashboard'!$A$${catStart + 1}:$A$${catStart + cats.length}`, series: [{ name: "Total", ref: `'KPI Dashboard'!$B$${catStart + 1}:$B$${catStart + cats.length}`, color: "213B73" }, { name: "Open", ref: `'KPI Dashboard'!$C$${catStart + 1}:$C$${catStart + cats.length}`, color: "B98B30" }], anchor: { col: 4, row: 3, w: 9, h: 18 } },
    { sheet: "Monthly Performance Report", title: "Monthly Requests Received vs Completed", type: "bar" as const, cats: `'Monthly Performance Report'!$A$4:$A$${3 + n}`, series: [{ name: "Received", ref: `'Monthly Performance Report'!$B$4:$B$${3 + n}`, color: "213B73" }, { name: "Completed", ref: `'Monthly Performance Report'!$C$4:$C$${3 + n}`, color: "B98B30" }], anchor: { col: 9, row: 2, w: 10, h: 17 } },
    { sheet: "Monthly Performance Report", title: "Average Turnaround (days)", type: "line" as const, cats: `'Monthly Performance Report'!$A$4:$A$${3 + n}`, series: [{ name: "Avg Turnaround", ref: `'Monthly Performance Report'!$F$4:$F$${3 + n}`, color: "4F6FAE" }], anchor: { col: 9, row: 20, w: 10, h: 15 } },
  ];
}
