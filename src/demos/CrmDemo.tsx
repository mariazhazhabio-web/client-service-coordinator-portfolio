"use client";
import { useMemo, useState } from "react";
import { Search, Plus, Pencil, Phone, Mail, MessageSquare, CalendarClock, Users, AlertTriangle, CheckSquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Badge, Kpi, Modal, statusTone } from "@/components/ui";
import { useLocalState } from "@/lib/hooks";
import { cn, fmtDate, todayIso, exportCsv } from "@/lib/utils";
import type { Client, Interaction, ClientStatus } from "@/data/sample";
import { useDataset, ResetButton, advisorName } from "./shared";

const EMPTY: Omit<Client, "id" | "tasks" | "interactions"> = {
  name: "", household: "", email: "", phone: "", city: "", advisorId: "ADV-01", status: "Prospect", segment: "Individual",
  accountRef: "DEMO-PENDING", since: todayIso(), lastContact: todayIso(), nextFollowUp: todayIso(),
};
const COLORS = ["#213b73", "#b98b30", "#4f6fae", "#9aa3b2"];

export default function CrmDemo() {
  const ds = useDataset();
  const today = todayIso();
  const [clients, setClients, reset] = useLocalState<Client[]>("crm-clients", () => ds.clients);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [adv, setAdv] = useState("All");
  const [selId, setSelId] = useState<string>(ds.clients[0].id);
  const [form, setForm] = useState<(typeof EMPTY & { id?: string }) | null>(null);
  const [err, setErr] = useState("");
  const [note, setNote] = useState<{ type: Interaction["type"]; summary: string }>({ type: "Call", summary: "" });
  const [task, setTask] = useState({ title: "", assignee: ds.staff[0].name.replace(" (Demo User)", ""), due: today });

  const filtered = useMemo(() => clients.filter((c) => {
    const s = q.toLowerCase();
    return (!s || [c.name, c.email, c.id, c.city, c.phone].some((v) => v.toLowerCase().includes(s))) && (status === "All" || c.status === status) && (adv === "All" || c.advisorId === adv);
  }), [clients, q, status, adv]);
  const sel = clients.find((c) => c.id === selId) ?? filtered[0];
  const requests = ds.requests.filter((r) => r.clientId === sel?.id);

  const dueFollow = clients.filter((c) => c.nextFollowUp <= today && c.status !== "Inactive").length;
  const openTasks = clients.reduce((n, c) => n + c.tasks.filter((t) => !t.done).length, 0);
  const byStatus = (["Active", "Onboarding", "Prospect", "Inactive"] as ClientStatus[]).map((s) => ({ name: s, value: clients.filter((c) => c.status === s).length }));
  const byAdvisor = ds.advisors.map((a) => ({ name: a.name.split(" ")[0], clients: clients.filter((c) => c.advisorId === a.id).length }));

  function update(id: string, fn: (c: Client) => Client) {
    setClients((cs) => cs.map((c) => (c.id === id ? fn(c) : c)));
  }
  function save() {
    if (!form) return;
    if (!form.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setErr("Name and a valid email are required."); return; }
    const dup = clients.find((c) => c.email.toLowerCase() === form.email.toLowerCase() && c.id !== form.id);
    if (dup) { setErr(`Possible duplicate: ${dup.name} (${dup.id}) already uses this email.`); return; }
    if (form.id) {
      update(form.id, (c) => ({ ...c, ...form, id: c.id, interactions: [{ date: today, type: "Note", summary: "Client profile updated.", by: "Coordinator" }, ...c.interactions] }));
    } else {
      const id = `CL-${1001 + clients.length + Math.floor(Math.random() * 900)}`;
      const nc: Client = { ...form, id, household: form.household || `${form.name.split(" ").slice(-1)[0]} Household`, tasks: [], interactions: [{ date: today, type: "Note", summary: "Client record created.", by: "Coordinator" }] };
      setClients((cs) => [nc, ...cs]);
      setSelId(id);
    }
    setForm(null); setErr("");
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Total clients" value={clients.length} icon={<Users className="h-4 w-4" />} />
        <Kpi label="Active" value={clients.filter((c) => c.status === "Active").length} tone="green" />
        <Kpi label="Follow-ups due" value={dueFollow} tone="red" hint="Due today or overdue" icon={<AlertTriangle className="h-4 w-4" />} />
        <Kpi label="Open tasks" value={openTasks} tone="gold" icon={<CheckSquare className="h-4 w-4" />} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-mist-400" aria-hidden />
          <input className="input pl-9" placeholder="Search name, email, ID, city…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search clients" />
        </div>
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          {["All", "Active", "Onboarding", "Prospect", "Inactive"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="input w-auto" value={adv} onChange={(e) => setAdv(e.target.value)} aria-label="Filter by advisor">
          <option value="All">All advisors</option>
          {ds.advisors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <button className="btn-primary" onClick={() => { setForm({ ...EMPTY }); setErr(""); }}><Plus className="h-4 w-4" /> Add client</button>
        <button className="btn-outline btn-sm" onClick={() => exportCsv(filtered.map(({ tasks, interactions, ...c }) => ({ ...c, advisor: advisorName(c.advisorId, ds.advisors), openTasks: tasks.filter((t) => !t.done).length, interactions: interactions.length })), "crm-clients-demo.csv")}>Export CSV</button>
        <ResetButton onReset={reset} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="card max-h-[640px] overflow-y-auto">
          <ul className="divide-y divide-mist-100">
            {filtered.map((c) => (
              <li key={c.id}>
                <button onClick={() => setSelId(c.id)} className={cn("flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-mist-50", sel?.id === c.id && "bg-navy-50")}>
                  <span>
                    <span className="block text-sm font-semibold">{c.name}</span>
                    <span className="block text-xs text-mist-500">{c.id} · {advisorName(c.advisorId, ds.advisors)}</span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                    {c.nextFollowUp <= today && c.status !== "Inactive" && <span className="text-[11px] font-semibold text-rose-600">Follow-up due</span>}
                  </span>
                </button>
              </li>
            ))}
            {!filtered.length && <li className="p-6 text-center text-sm text-mist-500">No clients match your filters.</li>}
          </ul>
        </div>

        {sel && (
          <div className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-sans text-xl font-semibold">{sel.name}</h3>
                <p className="text-sm text-mist-500">{sel.household} · {sel.segment} · Client since {fmtDate(sel.since)}</p>
              </div>
              <button className="btn-outline btn-sm" onClick={() => { const { tasks, interactions, ...rest } = sel; void tasks; void interactions; setForm(rest); setErr(""); }}><Pencil className="h-3.5 w-3.5" /> Edit</button>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="label">Email</dt><dd>{sel.email}</dd></div>
              <div><dt className="label">Phone</dt><dd>{sel.phone}</dd></div>
              <div><dt className="label">City</dt><dd>{sel.city}</dd></div>
              <div><dt className="label">Assigned advisor</dt><dd>{advisorName(sel.advisorId, ds.advisors)}</dd></div>
              <div><dt className="label">Account reference (demo)</dt><dd className="font-mono text-xs">{sel.accountRef}</dd></div>
              <div><dt className="label">Status</dt><dd>
                <select className="input py-1" value={sel.status} onChange={(e) => update(sel.id, (c) => ({ ...c, status: e.target.value as ClientStatus }))} aria-label="Client status">
                  {["Active", "Onboarding", "Prospect", "Inactive"].map((s) => <option key={s}>{s}</option>)}
                </select></dd></div>
              <div><dt className="label">Last contact</dt><dd>{fmtDate(sel.lastContact)}</dd></div>
              <div><dt className="label">Next follow-up</dt><dd><input type="date" className="input py-1" value={sel.nextFollowUp} onChange={(e) => update(sel.id, (c) => ({ ...c, nextFollowUp: e.target.value }))} aria-label="Next follow-up date" /></dd></div>
            </dl>

            <h4 className="mt-6 flex items-center gap-2 text-sm font-semibold"><CheckSquare className="h-4 w-4" /> Tasks</h4>
            <ul className="mt-2 space-y-1">
              {sel.tasks.map((t) => (
                <li key={t.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={t.done} onChange={() => update(sel.id, (c) => ({ ...c, tasks: c.tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)) }))} aria-label={`Mark ${t.title} done`} />
                  <span className={cn("flex-1", t.done && "text-mist-400 line-through")}>{t.title}</span>
                  <span className="text-xs text-mist-500">{t.assignee} · {fmtDate(t.due)}</span>
                  {!t.done && t.due < today && <Badge tone="red">Overdue</Badge>}
                </li>
              ))}
              {!sel.tasks.length && <li className="text-xs text-mist-500">No tasks yet.</li>}
            </ul>
            <form className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]" onSubmit={(e) => { e.preventDefault(); if (!task.title.trim()) return; update(sel.id, (c) => ({ ...c, tasks: [...c.tasks, { id: `${c.id}-T${Date.now()}`, ...task, done: false }] })); setTask({ ...task, title: "" }); }}>
              <input className="input" placeholder="New task…" value={task.title} onChange={(e) => setTask({ ...task, title: e.target.value })} aria-label="New task title" />
              <select className="input" value={task.assignee} onChange={(e) => setTask({ ...task, assignee: e.target.value })} aria-label="Task assignee">
                {ds.staff.map((s) => { const n = s.name.replace(" (Demo User)", ""); return <option key={s.id} value={n}>{n}</option>; })}
              </select>
              <input type="date" className="input" value={task.due} onChange={(e) => setTask({ ...task, due: e.target.value })} aria-label="Task due date" />
              <button className="btn-outline">Assign</button>
            </form>

            <h4 className="mt-6 text-sm font-semibold">Linked service requests ({requests.length})</h4>
            <ul className="mt-2 space-y-1 text-sm">
              {requests.map((r) => <li key={r.ref} className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs">{r.ref}</span>{r.category}<Badge tone={statusTone(r.status)}>{r.status}</Badge></li>)}
              {!requests.length && <li className="text-xs text-mist-500">No service requests on file.</li>}
            </ul>

            <h4 className="mt-6 text-sm font-semibold">Interaction history</h4>
            <form className="mt-2 flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); if (!note.summary.trim()) return; update(sel.id, (c) => ({ ...c, lastContact: today, interactions: [{ date: today, type: note.type, summary: note.summary, by: "Coordinator" }, ...c.interactions] })); setNote({ ...note, summary: "" }); }}>
              <select className="input w-auto" value={note.type} onChange={(e) => setNote({ ...note, type: e.target.value as Interaction["type"] })} aria-label="Interaction type">
                {["Call", "Email", "Meeting", "Note"].map((t) => <option key={t}>{t}</option>)}
              </select>
              <input className="input min-w-[200px] flex-1" placeholder="Summary of the interaction…" value={note.summary} onChange={(e) => setNote({ ...note, summary: e.target.value })} aria-label="Interaction summary" />
              <button className="btn-primary">Log</button>
            </form>
            <ol className="mt-3 space-y-3 border-l border-mist-200 pl-4">
              {sel.interactions.map((it, k) => {
                const I = { Call: Phone, Email: Mail, Meeting: CalendarClock, Note: MessageSquare }[it.type];
                return (
                  <li key={k} className="relative text-sm">
                    <I className="absolute -left-[25px] top-0.5 h-4 w-4 rounded-full bg-white text-navy-600" aria-hidden />
                    <p><span className="font-semibold">{it.type}</span> · <span className="text-mist-500">{fmtDate(it.date)} · {it.by}</span></p>
                    <p className="text-mist-600">{it.summary}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <p className="text-sm font-semibold">Clients by status</p>
          <div className="h-60">
            <ResponsiveContainer><PieChart><Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>{byStatus.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
          </div>
        </div>
        <div className="card p-4">
          <p className="text-sm font-semibold">Clients per advisor</p>
          <div className="h-60">
            <ResponsiveContainer><BarChart data={byAdvisor}><XAxis dataKey="name" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip /><Bar dataKey="clients" fill="#213b73" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
          </div>
        </div>
      </div>

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? `Edit ${form.name}` : "Add new client"}>
        {form && (
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save(); }}>
            {([["name", "Full name *"], ["email", "Email *"], ["phone", "Phone"], ["city", "City"], ["household", "Household"]] as const).map(([k, l]) => (
              <div key={k} className={k === "name" ? "sm:col-span-2" : ""}>
                <label className="label" htmlFor={`f-${k}`}>{l}</label>
                <input id={`f-${k}`} className="input" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
              </div>
            ))}
            <div><label className="label" htmlFor="f-adv">Advisor</label><select id="f-adv" className="input" value={form.advisorId} onChange={(e) => setForm({ ...form, advisorId: e.target.value })}>{ds.advisors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
            <div><label className="label" htmlFor="f-st">Status</label><select id="f-st" className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ClientStatus })}>{["Active", "Onboarding", "Prospect", "Inactive"].map((s) => <option key={s}>{s}</option>)}</select></div>
            <div><label className="label" htmlFor="f-seg">Segment</label><select id="f-seg" className="input" value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value as Client["segment"] })}>{["Individual", "Family", "Retiree", "Business Owner"].map((s) => <option key={s}>{s}</option>)}</select></div>
            <div><label className="label" htmlFor="f-nf">Next follow-up</label><input id="f-nf" type="date" className="input" value={form.nextFollowUp} onChange={(e) => setForm({ ...form, nextFollowUp: e.target.value })} /></div>
            {err && <p className="text-sm text-rose-600 sm:col-span-2" role="alert">{err}</p>}
            <p className="text-xs text-mist-500 sm:col-span-2">Use fictional data only. Do not enter real personal or account information.</p>
            <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary">Save client</button></div>
          </form>
        )}
      </Modal>
    </div>
  );
}
