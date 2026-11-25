"use client";
import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, Loader2, Sigma } from "lucide-react";
import { Badge, statusTone } from "@/components/ui";
import { cn, fmtDate, todayIso, downloadBlob } from "@/lib/utils";
import { requestKpis, isOverdue, daysBetween, type RequestStatus, type ServiceRequest } from "@/data/sample";
import { buildWorkbook } from "@/data/workbook";
import { DL } from "@/data/downloads";
import { useDataset } from "./shared";

const SHEETS = ["Client Master List", "Application Tracker", "Service Request Tracker", "Pending Requirements", "Appointment Schedule", "Follow-up Tracker", "Staff Task Assignment", "Monthly Performance Report", "KPI Dashboard"];
const STATUSES: RequestStatus[] = ["Received", "In Progress", "Pending Client", "Pending Home Office", "Completed"];

export default function ExcelDemo() {
  const ds = useDataset();
  const today = todayIso();
  const [reqs, setReqs] = useState<ServiceRequest[]>(ds.requests);
  const [tab, setTab] = useState("KPI Dashboard");
  const [busy, setBusy] = useState(false);
  const k = requestKpis(reqs, today);

  const formulas: [string, string, string][] = [
    ["Total requests", "=COUNTA('Service Request Tracker'!A4:A)", String(k.total)],
    ["Completed requests", '=COUNTIF(H4:H,"Completed")', String(k.completed)],
    ["Pending requests", "=B5-B6", String(k.pending)],
    ["Overdue requests", '=COUNTIF(K4:K,"Yes")  · K = IF(AND(H<>"Completed",G<TODAY()),"Yes","No")', String(k.overdue)],
    ["Average turnaround time", '=AVERAGE(J4:J)  · J = IF(I="","",I-D)', `${k.avgTat} days`],
    ["Completion rate", "=B6/B5", `${k.completionRate}%`],
    ["On-time resolution rate", '=COUNTIF(L4:L,"Yes")/B6  · L = IF(I<=G,"Yes","No")', `${k.onTimeRate}%`],
  ];

  const preview = useMemo(() => {
    const adv = (id: string) => ds.advisors.find((a) => a.id === id)?.name ?? id;
    switch (tab) {
      case "Client Master List": return { cols: ["ID", "Name", "Email", "Advisor", "Status", "Next Follow-up", "Due?"], rows: ds.clients.map((c) => [c.id, c.name, c.email, adv(c.advisorId), c.status, fmtDate(c.nextFollowUp), c.nextFollowUp <= today && c.status !== "Inactive" ? "Yes" : "No"]) };
      case "Application Tracker": return { cols: ["Ref", "Client", "Form", "Received", "Status"], rows: reqs.filter((r) => ["New Account Application", "Transfer Paperwork", "Systematic Contribution Setup", "Beneficiary Update"].includes(r.category)).map((r) => [r.ref, r.clientName, r.category, fmtDate(r.received), r.status]) };
      case "Pending Requirements": return { cols: ["Ref", "Client", "Requirement", "Due"], rows: reqs.filter((r) => r.status !== "Completed").flatMap((r) => r.pending.map((p) => [r.ref, r.clientName, p, fmtDate(r.target)])) };
      case "Appointment Schedule": return { cols: ["ID", "Date", "Start PT", "Advisor", "Client", "Type", "Status"], rows: ds.appointments.map((a) => [a.id, fmtDate(a.date), a.start, adv(a.advisorId), a.clientName, a.type, a.status]) };
      case "Follow-up Tracker": return { cols: ["Client", "Last Contact", "Next Follow-up", "Days Until"], rows: ds.clients.filter((c) => c.status !== "Inactive").map((c) => [c.name, fmtDate(c.lastContact), fmtDate(c.nextFollowUp), String(daysBetween(today, c.nextFollowUp))]) };
      case "Staff Task Assignment": return { cols: ["Task", "Client", "Owner", "Due", "Status"], rows: ds.meetings.flatMap((m) => m.actions.map((a) => [a.task, m.clientName, a.owner, fmtDate(a.due), a.done ? "Done" : "Open"])) };
      case "Monthly Performance Report": return { cols: ["Month", "Received", "Completed", "Overdue", "New Clients", "Avg TAT", "On-time %", "Completion %"], rows: ds.months.map((m) => [m.month, String(m.received), String(m.completed), String(m.overdue), String(m.newClients), String(m.avgTat), `${m.onTime}%`, `${Math.round((m.completed / m.received) * 100)}%`]) };
      default: return null;
    }
  }, [tab, ds, reqs, today]);

  async function exportLive() {
    setBusy(true);
    try {
      const ExcelJS = (await import("exceljs")).default;
      const wb = buildWorkbook(ExcelJS, { ...ds, requests: reqs, base: today });
      const buf = await wb.xlsx.writeBuffer();
      downloadBlob(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `Admin-Reporting-System-LIVE-${today}.xlsx`);
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <a className="btn-primary" href={DL.xlsx} download><FileSpreadsheet className="h-4 w-4" /> Download full workbook (with charts)</a>
        <button className="btn-outline" onClick={exportLive} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Export workbook with my edits</button>
      </div>
      <p className="text-xs text-mist-500">The full workbook includes native Excel charts. The in-browser export rebuilds all 9 sheets and formulas from your current edits, without charts.</p>
      <div className="overflow-x-auto"><div className="flex min-w-max gap-1 border-b border-mist-200">
        {SHEETS.map((s) => <button key={s} onClick={() => setTab(s)} className={cn("rounded-t-md px-3 py-2 text-xs font-semibold", tab === s ? "bg-emerald-700 text-white" : "bg-mist-100 text-mist-600 hover:bg-mist-200")}>{s}</button>)}
      </div></div>

      {tab === "KPI Dashboard" && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-navy-900 text-white"><tr><th className="th !text-white">KPI</th><th className="th !text-white">Excel formula</th><th className="th !text-white">Live value</th></tr></thead>
            <tbody className="divide-y divide-mist-100">{formulas.map(([l, f, v]) => <tr key={l}><td className="td font-semibold">{l}</td><td className="td font-mono text-xs text-emerald-800"><Sigma className="mr-1 inline h-3 w-3" />{f}</td><td className="td text-lg font-semibold text-navy-800">{v}</td></tr>)}</tbody>
          </table>
        </div>
      )}
      {(tab === "Service Request Tracker" || tab === "KPI Dashboard") && (
        <div className="card overflow-x-auto">
          <p className="px-4 pt-3 text-xs text-mist-500">Try it: change a status below and watch the KPI values recalculate, as the Excel formulas would.</p>
          <table className="w-full min-w-[900px]">
            <thead><tr className="border-b border-mist-200">{["Ref", "Client", "Category", "Received", "Target", "Status", "Resolved", "TAT", "Overdue?", "On time?"].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-mist-100">
              {reqs.slice(0, tab === "KPI Dashboard" ? 10 : 40).map((r) => (
                <tr key={r.ref} className={cn(isOverdue(r, today) && "bg-rose-50")}>
                  <td className="td font-mono text-xs">{r.ref}</td><td className="td">{r.clientName}</td><td className="td text-xs">{r.category}</td><td className="td text-xs">{fmtDate(r.received)}</td><td className="td text-xs">{fmtDate(r.target)}</td>
                  <td className="td"><select className="input py-1 text-xs" value={r.status} aria-label={`Status of ${r.ref}`} onChange={(e) => { const s = e.target.value as RequestStatus; setReqs((rs) => rs.map((x) => (x.ref === r.ref ? { ...x, status: s, resolved: s === "Completed" ? (x.resolved ?? today) : null } : x))); }}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></td>
                  <td className="td text-xs">{fmtDate(r.resolved)}</td>
                  <td className="td text-xs">{r.resolved ? daysBetween(r.received, r.resolved) : ""}</td>
                  <td className="td">{isOverdue(r, today) ? <Badge tone="red">Yes</Badge> : "No"}</td>
                  <td className="td text-xs">{r.resolved ? (r.resolved <= r.target ? "Yes" : "No") : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {preview && (
        <div className="card max-h-[480px] overflow-auto">
          <table className="w-full min-w-[640px]">
            <thead className="sticky top-0 bg-navy-900 text-white"><tr>{preview.cols.map((c) => <th key={c} className="th !text-white">{c}</th>)}</tr></thead>
            <tbody className="divide-y divide-mist-100">{preview.rows.map((r, i) => <tr key={i} className={i % 2 ? "bg-mist-50" : ""}>{r.map((v, j) => <td key={j} className="td text-xs">{/^(Yes|OVERDUE)$/.test(v) && j === r.length - 1 ? <Badge tone="red">{v}</Badge> : STATUSES.includes(v as RequestStatus) ? <Badge tone={statusTone(v)}>{v}</Badge> : v}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
