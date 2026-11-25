"use client";
import { useEffect, useState } from "react";
import { BellRing, Plus, FileText, Package, Play, Pause, CalendarPlus } from "lucide-react";
import { Badge, Progress, Modal } from "@/components/ui";
import { useLocalState } from "@/lib/hooks";
import { cn, fmtDate, todayIso } from "@/lib/utils";
import type { Meeting, MeetingAction } from "@/data/sample";
import { addDaysIso } from "./onboardingUtils";
import { useDataset, ResetButton, advisorName } from "./shared";

export default function PostMeetingDemo() {
  const ds = useDataset();
  const today = todayIso();
  const staff = ds.staff.map((s) => s.name.replace(" (Demo User)", ""));
  const [meetings, setMeetings, reset] = useLocalState<Meeting[]>("meetings", () => ds.meetings);
  const [selId, setSelId] = useState(ds.meetings[0].id);
  const [log, setLog] = useState<{ t: string; msg: string; tone: string }[]>([]);
  const [auto, setAuto] = useState(false);
  const [na, setNa] = useState({ task: "", owner: staff[0], due: addDaysIso(today, 2), docs: "", clientDeliverable: false });
  const [newMeeting, setNewMeeting] = useState(false);
  const [nm, setNm] = useState({ clientId: ds.clients[6].id, type: "Annual Review", date: today, summary: "" });
  const sel = meetings.find((m) => m.id === selId) ?? meetings[0];

  const pct = (m: Meeting) => (m.actions.length ? Math.round((m.actions.filter((a) => a.done).length / m.actions.length) * 100) : 0);
  const upd = (id: string, fn: (m: Meeting) => Meeting) => setMeetings((ms) => ms.map((m) => (m.id === id ? fn(m) : m)));
  const updA = (aid: string, fn: (a: MeetingAction) => MeetingAction) => upd(sel.id, (m) => ({ ...m, actions: m.actions.map((a) => (a.id === aid ? fn(a) : a)) }));

  function runReminders() {
    const t = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const out: { t: string; msg: string; tone: string }[] = [];
    meetings.forEach((m) => m.actions.filter((a) => !a.done).forEach((a) => {
      if (a.due < today) out.push({ t, tone: "red", msg: `OVERDUE · ${m.clientName}: "${a.task}" (owner ${a.owner}, due ${fmtDate(a.due)}). Reminder sent to ${a.owner} (simulated).` });
      else if (a.due <= addDaysIso(today, 1)) out.push({ t, tone: "amber", msg: `DUE SOON · ${m.clientName}: "${a.task}" due ${fmtDate(a.due)}. Heads-up sent to ${a.owner} (simulated).` });
    }));
    if (!out.length) out.push({ t, tone: "green", msg: "No overdue or due-soon action items. No reminders needed." });
    setLog((l) => [...out, ...l].slice(0, 60));
  }
  useEffect(() => {
    if (!auto) return;
    runReminders();
    const id = setInterval(runReminders, 8000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, meetings]);

  function addAction(e: React.FormEvent) {
    e.preventDefault();
    if (!na.task.trim()) return;
    upd(sel.id, (m) => ({ ...m, actions: [...m.actions, { id: `${m.id}-A${Date.now()}`, task: na.task.trim(), owner: na.owner, due: na.due, docs: na.docs.split(",").map((s) => s.trim()).filter(Boolean), clientDeliverable: na.clientDeliverable, done: false }] }));
    setNa({ ...na, task: "", docs: "", clientDeliverable: false });
  }
  function addMeeting(e: React.FormEvent) {
    e.preventDefault();
    const c = ds.clients.find((x) => x.id === nm.clientId)!;
    const id = `MT-${400 + meetings.length}`;
    setMeetings((ms) => [{ id, clientId: c.id, clientName: c.name, advisorId: c.advisorId, date: nm.date, type: nm.type, summary: nm.summary || "Meeting summary to be completed within 24 hours.", actions: [
      { id: `${id}-A1`, task: "Log meeting notes and tasks in CRM", owner: staff[0], due: addDaysIso(nm.date, 1), docs: [], clientDeliverable: false, done: false },
      { id: `${id}-A2`, task: "Send advisor-approved recap email to client", owner: staff[0], due: addDaysIso(nm.date, 2), docs: [], clientDeliverable: false, done: false },
    ] }, ...ms]);
    setSelId(id); setNewMeeting(false);
  }

  const deliverables = sel.actions.filter((a) => a.clientDeliverable);
  const docs = Array.from(new Set(sel.actions.flatMap((a) => a.docs)));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-primary" onClick={() => setNewMeeting(true)}><CalendarPlus className="h-4 w-4" /> Log a meeting</button>
        <button className="btn-gold" onClick={runReminders}><BellRing className="h-4 w-4" /> Run reminder check</button>
        <button className={cn("btn-outline", auto && "border-emerald-400 text-emerald-700")} onClick={() => setAuto((a) => !a)} aria-pressed={auto}>{auto ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {auto ? "Automation running (every 8s)" : "Start automated reminders"}</button>
        <ResetButton onReset={() => { reset(); setLog([]); }} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <div className="card divide-y divide-mist-100 self-start">
          {meetings.map((m) => (
            <button key={m.id} onClick={() => setSelId(m.id)} className={cn("block w-full px-4 py-3 text-left hover:bg-mist-50", sel.id === m.id && "bg-navy-50")}>
              <div className="flex justify-between gap-2"><span className="text-sm font-semibold">{m.clientName}</span><span className="text-xs text-mist-500">{pct(m)}%</span></div>
              <p className="text-xs text-mist-500">{m.type} · {fmtDate(m.date)}</p>
              <Progress value={pct(m)} className="mt-2" />
            </button>
          ))}
        </div>
        <div className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-sans text-lg font-semibold">{sel.type}: {sel.clientName}</h3>
              <p className="text-sm text-mist-500">{sel.id} · {fmtDate(sel.date)} · {advisorName(sel.advisorId, ds.advisors)}</p>
            </div>
            <Badge tone={pct(sel) === 100 ? "green" : "amber"}>{pct(sel) === 100 ? "All items complete" : `${sel.actions.filter((a) => !a.done).length} open items`}</Badge>
          </div>
          <label className="label mt-4" htmlFor="pm-sum">Meeting summary</label>
          <textarea id="pm-sum" rows={3} className="input" value={sel.summary} onChange={(e) => upd(sel.id, (m) => ({ ...m, summary: e.target.value }))} />
          <p className="mt-1 text-[11px] text-mist-500">Administrative notes only. The advisor documents any advice discussion.</p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead><tr className="border-b border-mist-200"><th className="th">Done</th><th className="th">Action item</th><th className="th">Owner</th><th className="th">Due</th><th className="th">Docs</th></tr></thead>
              <tbody className="divide-y divide-mist-100">
                {sel.actions.map((a) => (
                  <tr key={a.id} className={cn(!a.done && a.due < today && "bg-rose-50/60")}>
                    <td className="td"><input type="checkbox" checked={a.done} onChange={() => updA(a.id, (x) => ({ ...x, done: !x.done }))} aria-label={`Mark ${a.task} complete`} /></td>
                    <td className={cn("td", a.done && "text-mist-400 line-through")}>{a.task} {a.clientDeliverable && <Badge tone="gold" className="ml-1">Client deliverable</Badge>}</td>
                    <td className="td"><select className="input py-1 text-xs" value={a.owner} onChange={(e) => updA(a.id, (x) => ({ ...x, owner: e.target.value }))} aria-label="Owner">{staff.map((s) => <option key={s}>{s}</option>)}</select></td>
                    <td className="td whitespace-nowrap text-xs"><input type="date" className="input py-1 text-xs" value={a.due} onChange={(e) => updA(a.id, (x) => ({ ...x, due: e.target.value }))} aria-label="Due date" />{!a.done && a.due < today && <span className="font-semibold text-rose-600">Overdue</span>}</td>
                    <td className="td text-xs text-mist-600">{a.docs.join(", ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form className="mt-3 grid gap-2 rounded-lg bg-mist-50 p-3 md:grid-cols-[2fr_1fr_1fr]" onSubmit={addAction}>
            <input className="input md:col-span-3" placeholder="New action item…" value={na.task} onChange={(e) => setNa({ ...na, task: e.target.value })} aria-label="New action item" />
            <select className="input" value={na.owner} onChange={(e) => setNa({ ...na, owner: e.target.value })} aria-label="Owner">{staff.map((s) => <option key={s}>{s}</option>)}</select>
            <input type="date" className="input" value={na.due} onChange={(e) => setNa({ ...na, due: e.target.value })} aria-label="Due" />
            <input className="input" placeholder="Required docs (comma-separated)" value={na.docs} onChange={(e) => setNa({ ...na, docs: e.target.value })} aria-label="Required documents" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={na.clientDeliverable} onChange={(e) => setNa({ ...na, clientDeliverable: e.target.checked })} /> Client deliverable</label>
            <button className="btn-primary md:col-start-3"><Plus className="h-4 w-4" /> Add action</button>
          </form>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-mist-200 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4" /> Required documents</p>
              <ul className="mt-2 list-disc pl-5 text-sm">{docs.map((d) => <li key={d}>{d}</li>)}</ul>
              {!docs.length && <p className="text-xs text-mist-500">None listed.</p>}
            </div>
            <div className="rounded-lg border border-mist-200 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold"><Package className="h-4 w-4" /> Client deliverables</p>
              <ul className="mt-2 space-y-1 text-sm">{deliverables.map((d) => <li key={d.id} className="flex items-center gap-2"><Badge tone={d.done ? "green" : "amber"}>{d.done ? "Delivered" : "Pending"}</Badge>{d.task}</li>)}</ul>
              {!deliverables.length && <p className="text-xs text-mist-500">None flagged.</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <p className="flex items-center gap-2 text-sm font-semibold"><BellRing className="h-4 w-4 text-gold-500" /> Automated reminder log (simulation, nothing is sent)</p>
        <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto font-mono text-xs" aria-live="polite">
          {log.map((l, i) => <li key={i} className={cn(l.tone === "red" ? "text-rose-700" : l.tone === "amber" ? "text-amber-700" : "text-emerald-700")}>[{l.t}] {l.msg}</li>)}
          {!log.length && <li className="text-mist-500">Run a reminder check to see which action items would trigger reminders.</li>}
        </ul>
      </div>

      <Modal open={newMeeting} onClose={() => setNewMeeting(false)} title="Log a client meeting">
        <form className="grid gap-3" onSubmit={addMeeting}>
          <div><label className="label" htmlFor="m-c">Client</label><select id="m-c" className="input" value={nm.clientId} onChange={(e) => setNm({ ...nm, clientId: e.target.value })}>{ds.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label" htmlFor="m-t">Type</label><select id="m-t" className="input" value={nm.type} onChange={(e) => setNm({ ...nm, type: e.target.value })}>{["Annual Review", "Discovery Meeting", "Planning Presentation", "Paperwork Signing", "Follow-up Call"].map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><label className="label" htmlFor="m-d">Date</label><input id="m-d" type="date" className="input" value={nm.date} onChange={(e) => setNm({ ...nm, date: e.target.value })} /></div>
          </div>
          <div><label className="label" htmlFor="m-s">Summary</label><textarea id="m-s" rows={3} className="input" value={nm.summary} onChange={(e) => setNm({ ...nm, summary: e.target.value })} /></div>
          <p className="text-xs text-mist-500">Standard action items (CRM notes and recap email) are created automatically.</p>
          <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setNewMeeting(false)}>Cancel</button><button className="btn-primary">Create meeting record</button></div>
        </form>
      </Modal>
    </div>
  );
}
