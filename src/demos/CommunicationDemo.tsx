"use client";
import { useMemo, useState } from "react";
import { Copy, Send, Search, Check, Mail } from "lucide-react";
import { Badge } from "@/components/ui";
import { useLocalState } from "@/lib/hooks";
import { cn, fmtDate, todayIso, exportCsv } from "@/lib/utils";
import { addDaysIso } from "./onboardingUtils";
import { fmt12 } from "@/lib/timezone";
import { useDataset, ResetButton, advisorName } from "./shared";

type Tpl = { id: string; name: string; audience: "Client" | "Internal"; subject: string; body: string };
type Sent = { id: string; date: string; template: string; to: string; subject: string; body: string };

const TEMPLATES: Tpl[] = [
  { id: "welcome", name: "Welcome email", audience: "Client", subject: "Welcome to the practice, {{FirstName}}", body: "Dear {{FirstName}},\n\nWelcome! On behalf of {{AdvisorName}} and our team, thank you for choosing to work with us. I am {{CoordinatorName}}, your Client Service Coordinator, and I will help with scheduling, paperwork, and any administrative questions.\n\nTo complete your onboarding, please review the attached checklist and return the listed items by {{DueDate}}. If you have any questions, simply reply to this email.\n\nWe look forward to working with you.\n\nWarm regards,\n{{CoordinatorName}}\nClient Service Coordinator" },
  { id: "confirm", name: "Appointment confirmation", audience: "Client", subject: "Confirmed: {{MeetingType}} on {{AppointmentDate}}", body: "Dear {{FirstName}},\n\nThis confirms your {{MeetingType}} with {{AdvisorName}} on {{AppointmentDate}} at {{AppointmentTime}} Pacific Time ({{Mode}}).\n\nTo help us prepare, please have any recent documents you would like to discuss available. If you need to reschedule, please let us know at least 24 hours in advance.\n\nKind regards,\n{{CoordinatorName}}" },
  { id: "missing", name: "Missing document reminder", audience: "Client", subject: "Friendly reminder: items needed to complete your request", body: "Dear {{FirstName}},\n\nI hope you are well. To finish processing your request (ref. {{RequestRef}}), we still need the following:\n\n{{MissingItems}}\n\nCould you please send these by {{DueDate}}? Please use our secure upload method and do not email sensitive documents. If you have already sent them, thank you, and please disregard this message.\n\nBest regards,\n{{CoordinatorName}}" },
  { id: "status", name: "Application status update", audience: "Client", subject: "Update on your request {{RequestRef}}", body: "Dear {{FirstName}},\n\nI wanted to give you a quick update on your {{RequestCategory}} request (ref. {{RequestRef}}). The current status is: {{RequestStatus}}.\n\nNext step: {{NextStep}}. We expect to complete this by {{DueDate}}, and I will let you know as soon as it is done.\n\nThank you for your patience,\n{{CoordinatorName}}" },
  { id: "followup", name: "Client follow-up", audience: "Client", subject: "Following up after our meeting", body: "Dear {{FirstName}},\n\nThank you for meeting with {{AdvisorName}} on {{AppointmentDate}}. As discussed, here are the next administrative steps:\n\n{{MissingItems}}\n\nPlease let me know if you have any questions. I will follow up again on {{DueDate}}.\n\nKind regards,\n{{CoordinatorName}}" },
  { id: "ack", name: "Service request acknowledgment", audience: "Client", subject: "We received your request ({{RequestRef}})", body: "Dear {{FirstName}},\n\nThank you for contacting us. We have received your {{RequestCategory}} request and assigned it reference number {{RequestRef}}.\n\nWe expect to complete it by {{DueDate}}. I will contact you if we need anything else.\n\nBest regards,\n{{CoordinatorName}}" },
  { id: "reschedule", name: "Appointment rescheduling", audience: "Client", subject: "Your appointment has been rescheduled", body: "Dear {{FirstName}},\n\nAs requested, your {{MeetingType}} with {{AdvisorName}} has been moved to {{AppointmentDate}} at {{AppointmentTime}} Pacific Time. An updated calendar invitation will follow.\n\nIf this new time does not work, just reply with two or three times that suit you better.\n\nKind regards,\n{{CoordinatorName}}" },
  { id: "resolved", name: "Issue resolution confirmation", audience: "Client", subject: "Completed: your request {{RequestRef}}", body: "Dear {{FirstName}},\n\nGood news: your {{RequestCategory}} request (ref. {{RequestRef}}) has been completed. Please review the update when convenient and let me know if anything looks incorrect.\n\nThank you for your patience. It is a pleasure to assist you.\n\nWarm regards,\n{{CoordinatorName}}" },
  { id: "internal", name: "Internal coordination email", audience: "Internal", subject: "Action needed: {{RequestRef}} for {{ClientName}}", body: "Hi team,\n\nRequest {{RequestRef}} ({{RequestCategory}}) for {{ClientName}} is currently {{RequestStatus}} and due {{DueDate}}.\n\nOutstanding items:\n{{MissingItems}}\n\nCould you confirm the next step and expected completion date? I will update the tracker and keep the client informed.\n\nThanks,\n{{CoordinatorName}}" },
];

export default function CommunicationDemo() {
  const ds = useDataset();
  const today = todayIso();
  const [tpls, setTpls, resetT] = useLocalState<Tpl[]>("comm-templates", () => TEMPLATES);
  const [history, setHistory, resetH] = useLocalState<Sent[]>("comm-history", () => [
    { id: "H1", date: addDaysIso(today, -2), template: "Service request acknowledgment", to: ds.clients[3].email, subject: `We received your request (${ds.requests[0].ref})`, body: "…" },
    { id: "H2", date: addDaysIso(today, -1), template: "Appointment confirmation", to: ds.clients[5].email, subject: "Confirmed: Annual Review", body: "…" },
  ]);
  const [tid, setTid] = useState("welcome");
  const [cid, setCid] = useState(ds.clients[0].id);
  const [coordinator, setCoordinator] = useState("Maria Bio");
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState(false);
  const [sentMsg, setSentMsg] = useState("");
  const tpl = tpls.find((t) => t.id === tid)!;
  const client = ds.clients.find((c) => c.id === cid)!;
  const req = ds.requests.find((r) => r.clientId === cid) ?? ds.requests[0];
  const appt = ds.appointments.find((a) => a.clientId === cid && a.date >= today) ?? ds.appointments.find((a) => a.date >= today)!;

  const fields: Record<string, string> = useMemo(() => ({
    FirstName: client.name.split(" ")[0], ClientName: client.name, AdvisorName: advisorName(client.advisorId, ds.advisors), CoordinatorName: coordinator,
    DueDate: fmtDate(addDaysIso(today, 5)), RequestRef: req.ref, RequestCategory: req.category, RequestStatus: req.status,
    MissingItems: (req.pending.length ? req.pending : ["Signed form (mock)"]).map((p) => `• ${p}`).join("\n"), NextStep: req.pending.length ? `Receive: ${req.pending[0]}` : "Final review",
    MeetingType: appt?.type ?? "Review Meeting", AppointmentDate: fmtDate(appt?.date), AppointmentTime: appt ? fmt12(appt.start) : "10:00 AM", Mode: appt?.mode ?? "Video",
  }), [client, req, appt, coordinator, today, ds.advisors]);
  const fill = (s: string) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => fields[k] ?? `{{${k}}}`);
  const subject = fill(tpl.subject);
  const body = fill(tpl.body);
  const unresolved = (tpl.subject + tpl.body).match(/\{\{(\w+)\}\}/g)?.filter((m) => !(m.slice(2, -2) in fields)) ?? [];
  const editT = (patch: Partial<Tpl>) => setTpls((ts) => ts.map((t) => (t.id === tid ? { ...t, ...patch } : t)));
  const to = tpl.audience === "Internal" ? "operations-team@example.org" : client.email;
  const hist = history.filter((h) => !q || `${h.to} ${h.subject} ${h.template}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[240px_1fr_1fr]">
        <div className="card self-start p-2">
          <p className="px-2 py-1 text-xs font-bold uppercase tracking-wide text-mist-500">Templates</p>
          {tpls.map((t) => (
            <button key={t.id} onClick={() => setTid(t.id)} className={cn("flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-mist-50", t.id === tid && "bg-navy-50 font-semibold")}>
              {t.name}{t.audience === "Internal" && <Badge tone="gray">Internal</Badge>}
            </button>
          ))}
        </div>
        <div className="card space-y-3 p-4">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="label" htmlFor="cm-c">Client (merge data)</label><select id="cm-c" className="input" value={cid} onChange={(e) => setCid(e.target.value)}>{ds.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="label" htmlFor="cm-me">Your name</label><input id="cm-me" className="input" value={coordinator} onChange={(e) => setCoordinator(e.target.value)} /></div>
          </div>
          <div><label className="label" htmlFor="cm-s">Subject template</label><input id="cm-s" className="input" value={tpl.subject} onChange={(e) => editT({ subject: e.target.value })} /></div>
          <div><label className="label" htmlFor="cm-b">Body template (edit freely)</label><textarea id="cm-b" rows={14} className="input font-mono text-xs" value={tpl.body} onChange={(e) => editT({ body: e.target.value })} /></div>
          <p className="text-[11px] text-mist-500">Merge fields: {Object.keys(fields).map((k) => `{{${k}}}`).join(" ")}</p>
          {unresolved.length > 0 && <p className="text-xs text-rose-600">Unknown merge fields: {unresolved.join(", ")}</p>}
        </div>
        <div className="card flex flex-col p-4">
          <p className="flex items-center gap-2 text-sm font-semibold"><Mail className="h-4 w-4" /> Preview</p>
          <div className="mt-2 flex-1 rounded-lg border border-mist-200 bg-mist-50 p-3 text-sm">
            <p className="text-xs text-mist-500">To: {to}</p>
            <p className="mt-1 font-semibold">{subject}</p>
            <hr className="my-2 border-mist-200" />
            <pre className="whitespace-pre-wrap font-sans">{body}</pre>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn-outline btn-sm" onClick={async () => { try { await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked */ } }}>{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "Copied" : "Copy"}</button>
            <button className="btn-primary btn-sm" onClick={() => { setHistory((h) => [{ id: `H${Date.now()}`, date: today, template: tpl.name, to, subject, body }, ...h]); setSentMsg(`Logged as sent to ${to}. Simulation only: no email was sent.`); setTimeout(() => setSentMsg(""), 3500); }}><Send className="h-3.5 w-3.5" /> Send (simulated)</button>
            <ResetButton onReset={() => { resetT(); resetH(); }} />
          </div>
          {sentMsg && <p className="mt-2 text-xs text-emerald-700" role="status">{sentMsg}</p>}
        </div>
      </div>
      <div className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">Communication history ({history.length})</p>
          <div className="flex gap-2">
            <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-mist-400" /><input className="input pl-9" placeholder="Search history" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search communication history" /></div>
            <button className="btn-outline btn-sm" onClick={() => exportCsv(history, "communication-history-demo.csv")}>Export CSV</button>
          </div>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead><tr className="border-b border-mist-200"><th className="th">Date</th><th className="th">Template</th><th className="th">To</th><th className="th">Subject</th></tr></thead>
            <tbody className="divide-y divide-mist-100">{hist.map((h) => <tr key={h.id}><td className="td">{fmtDate(h.date)}</td><td className="td">{h.template}</td><td className="td text-xs">{h.to}</td><td className="td">{h.subject}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
