"use client";
import { useMemo, useState } from "react";
import { LayoutGrid, Table2, Plus, AlertTriangle, ArrowUpDown, Search } from "lucide-react";
import { Badge, Kpi, Modal, statusTone } from "@/components/ui";
import { useLocalState } from "@/lib/hooks";
import { cn, fmtDate, todayIso, exportCsv } from "@/lib/utils";
import { REQUEST_CATEGORIES, requestKpis, isOverdue, daysBetween, type ServiceRequest, type RequestStatus } from "@/data/sample";
import { addDaysIso } from "./onboardingUtils";
import { useDataset, ResetButton } from "./shared";

const STATUSES: RequestStatus[] = ["Received", "In Progress", "Pending Client", "Pending Home Office", "Completed"];

export default function RequestTrackerDemo() {
  const ds = useDataset();
  const today = todayIso();
  const staff = ds.staff.map((s) => s.name.replace(" (Demo User)", ""));
  const [reqs, setReqs, reset] = useLocalState<ServiceRequest[]>("requests", () => ds.requests);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [owner, setOwner] = useState("All");
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [sort, setSort] = useState<{ k: keyof ServiceRequest; dir: 1 | -1 }>({ k: "target", dir: 1 });
  const [openRef, setOpenRef] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [nf, setNf] = useState({ clientId: ds.clients[0].id, category: REQUEST_CATEGORIES[0], priority: "Medium" as ServiceRequest["priority"], assignedTo: staff[0], target: addDaysIso(today, 5), pending: "" });
  const [fu, setFu] = useState("");
  const [newPending, setNewPending] = useState("");

  const filtered = useMemo(() => reqs.filter((r) =>
    (!q || `${r.ref} ${r.clientName} ${r.category}`.toLowerCase().includes(q.toLowerCase())) &&
    (cat === "All" || r.category === cat) && (owner === "All" || r.assignedTo === owner) && (!onlyOverdue || isOverdue(r, today)),
  ), [reqs, q, cat, owner, onlyOverdue, today]);
  const sorted = useMemo(() => [...filtered].sort((a, b) => String(a[sort.k] ?? "").localeCompare(String(b[sort.k] ?? "")) * sort.dir), [filtered, sort]);
  const k = requestKpis(filtered, today);
  const overdueList = reqs.filter((r) => isOverdue(r, today));
  const sel = reqs.find((r) => r.ref === openRef);

  const upd = (ref: string, fn: (r: ServiceRequest) => ServiceRequest) => setReqs((rs) => rs.map((r) => (r.ref === ref ? fn(r) : r)));
  function setStatus(ref: string, s: RequestStatus) {
    upd(ref, (r) => ({ ...r, status: s, resolved: s === "Completed" ? today : null, pending: s === "Completed" ? [] : r.pending, followUps: [...r.followUps, { date: today, note: `Status changed to ${s}.` }] }));
  }
  function add(e: React.FormEvent) {
    e.preventDefault();
    const c = ds.clients.find((x) => x.id === nf.clientId)!;
    const max = Math.max(...reqs.map((r) => Number(r.ref.split("-").pop()) || 0), 1200);
    const ref = `SR-${today.slice(0, 4)}-${max + 1}`;
    setReqs((rs) => [{ ref, clientId: c.id, clientName: c.name, category: nf.category, received: today, assignedTo: nf.assignedTo, priority: nf.priority, target: nf.target, status: "Received", pending: nf.pending.split(",").map((s) => s.trim()).filter(Boolean), followUps: [{ date: today, note: "Request logged. Acknowledgment sent to client (simulated)." }], resolved: null }, ...rs]);
    setAdding(false); setOpenRef(ref);
  }
  const head = (key: keyof ServiceRequest, label: string) => (
    <th className="th"><button className="inline-flex items-center gap-1" onClick={() => setSort({ k: key, dir: sort.k === key ? (sort.dir === 1 ? -1 : 1) : 1 })}>{label}<ArrowUpDown className="h-3 w-3" /></button></th>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <Kpi label="Total" value={k.total} />
        <Kpi label="Completed" value={k.completed} tone="green" />
        <Kpi label="Pending" value={k.pending} tone="gold" />
        <Kpi label="Overdue" value={k.overdue} tone="red" />
        <Kpi label="Avg turnaround" value={`${k.avgTat} d`} hint="Received → resolved" />
        <Kpi label="Completion rate" value={`${k.completionRate}%`} tone="green" />
        <Kpi label="On-time rate" value={`${k.onTimeRate}%`} tone="green" hint="Resolved by target" />
      </div>

      {overdueList.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          <AlertTriangle className="h-4 w-4" />
          <strong>{overdueList.length} overdue request{overdueList.length > 1 ? "s" : ""}:</strong>
          {overdueList.slice(0, 5).map((r) => <button key={r.ref} className="underline" onClick={() => setOpenRef(r.ref)}>{r.ref}</button>)}
          {overdueList.length > 5 && <span>…</span>}
          <button className="ml-auto text-xs font-semibold underline" onClick={() => setOnlyOverdue(true)}>Show only overdue</button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-mist-300 bg-white p-0.5" role="tablist" aria-label="View">
          <button role="tab" aria-selected={view === "kanban"} className={cn("btn-sm btn", view === "kanban" ? "bg-navy-800 text-white" : "text-navy-700")} onClick={() => setView("kanban")}><LayoutGrid className="h-3.5 w-3.5" /> Kanban</button>
          <button role="tab" aria-selected={view === "table"} className={cn("btn-sm btn", view === "table" ? "bg-navy-800 text-white" : "text-navy-700")} onClick={() => setView("table")}><Table2 className="h-3.5 w-3.5" /> Table</button>
        </div>
        <div className="relative min-w-[180px] flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-mist-400" /><input className="input pl-9" placeholder="Search ref, client, category" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search requests" /></div>
        <select className="input w-auto" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filter by category"><option>All</option>{REQUEST_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        <select className="input w-auto" value={owner} onChange={(e) => setOwner(e.target.value)} aria-label="Filter by assignee"><option value="All">All staff</option>{staff.map((s) => <option key={s}>{s}</option>)}</select>
        <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={onlyOverdue} onChange={(e) => setOnlyOverdue(e.target.checked)} /> Overdue only</label>
        <button className="btn-primary" onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> New request</button>
        <button className="btn-outline btn-sm" onClick={() => exportCsv(sorted.map((r) => ({ ...r, followUps: r.followUps.map((f) => `${f.date}: ${f.note}`), overdue: isOverdue(r, today) ? "Yes" : "No" })), "service-requests-demo.csv")}>Export CSV</button>
        <ResetButton onReset={reset} />
      </div>

      {view === "kanban" ? (
        <div className="grid gap-3 overflow-x-auto pb-2 md:grid-cols-3 xl:grid-cols-5">
          {STATUSES.map((s) => {
            const col = sorted.filter((r) => r.status === s);
            return (
              <div key={s} className="min-w-[220px] rounded-xl bg-mist-100 p-2">
                <p className="flex items-center justify-between px-1 py-1 text-xs font-bold uppercase tracking-wide text-mist-600">{s}<span className="rounded-full bg-white px-2">{col.length}</span></p>
                <div className="mt-1 max-h-[520px] space-y-2 overflow-y-auto">
                  {col.map((r) => (
                    <div key={r.ref} className={cn("card cursor-pointer p-3 text-left hover:border-navy-300", isOverdue(r, today) && "border-rose-300")} onClick={() => setOpenRef(r.ref)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setOpenRef(r.ref)}>
                      <div className="flex items-center justify-between"><span className="font-mono text-[11px] text-mist-500">{r.ref}</span><Badge tone={statusTone(r.priority)}>{r.priority}</Badge></div>
                      <p className="mt-1 text-sm font-semibold">{r.clientName}</p>
                      <p className="text-xs text-mist-600">{r.category}</p>
                      <p className={cn("mt-1 text-[11px]", isOverdue(r, today) ? "font-semibold text-rose-600" : "text-mist-500")}>{isOverdue(r, today) ? `Overdue · was due ${fmtDate(r.target)}` : r.status === "Completed" ? `Resolved ${fmtDate(r.resolved)}` : `Due ${fmtDate(r.target)}`}</p>
                      {s !== "Completed" && (
                        <select className="input mt-2 py-1 text-xs" value={r.status} onClick={(e) => e.stopPropagation()} onChange={(e) => setStatus(r.ref, e.target.value as RequestStatus)} aria-label={`Move ${r.ref}`}>
                          {STATUSES.map((x) => <option key={x}>{x}</option>)}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-mist-50"><tr>{head("ref", "Ref #")}{head("clientName", "Client")}{head("category", "Category")}{head("received", "Received")}{head("assignedTo", "Assigned")}{head("priority", "Priority")}{head("target", "Target")}{head("status", "Status")}<th className="th">Pending</th>{head("resolved", "Resolved")}</tr></thead>
            <tbody className="divide-y divide-mist-100">
              {sorted.map((r) => (
                <tr key={r.ref} className={cn("cursor-pointer hover:bg-mist-50", isOverdue(r, today) && "bg-rose-50/60")} onClick={() => setOpenRef(r.ref)}>
                  <td className="td font-mono text-xs">{r.ref}</td><td className="td font-medium">{r.clientName}</td><td className="td">{r.category}</td><td className="td">{fmtDate(r.received)}</td><td className="td">{r.assignedTo}</td>
                  <td className="td"><Badge tone={statusTone(r.priority)}>{r.priority}</Badge></td>
                  <td className="td">{fmtDate(r.target)} {isOverdue(r, today) && <Badge tone="red">Overdue</Badge>}</td>
                  <td className="td"><Badge tone={statusTone(r.status)}>{r.status}</Badge></td>
                  <td className="td text-xs">{r.pending.length || "—"}</td><td className="td">{fmtDate(r.resolved)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!sorted.length && <p className="p-6 text-center text-sm text-mist-500">No requests match.</p>}
        </div>
      )}

      <Modal open={!!sel} onClose={() => setOpenRef(null)} title={sel ? `${sel.ref} · ${sel.category}` : ""} wide>
        {sel && (
          <div className="space-y-5">
            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              <div><dt className="label">Client</dt><dd>{sel.clientName} ({sel.clientId})</dd></div>
              <div><dt className="label">Received</dt><dd>{fmtDate(sel.received)}</dd></div>
              <div><dt className="label">Target</dt><dd className={isOverdue(sel, today) ? "font-semibold text-rose-600" : ""}>{fmtDate(sel.target)}{isOverdue(sel, today) && ` (${daysBetween(sel.target, today)} days overdue)`}</dd></div>
              <div><dt className="label">Assigned to</dt><dd><select className="input py-1" value={sel.assignedTo} onChange={(e) => upd(sel.ref, (r) => ({ ...r, assignedTo: e.target.value, followUps: [...r.followUps, { date: today, note: `Reassigned to ${e.target.value}.` }] }))}>{staff.map((s) => <option key={s}>{s}</option>)}</select></dd></div>
              <div><dt className="label">Priority</dt><dd><select className="input py-1" value={sel.priority} onChange={(e) => upd(sel.ref, (r) => ({ ...r, priority: e.target.value as ServiceRequest["priority"] }))}>{["High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}</select></dd></div>
              <div><dt className="label">Status</dt><dd><select className="input py-1" value={sel.status} onChange={(e) => setStatus(sel.ref, e.target.value as RequestStatus)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></dd></div>
            </dl>
            <div>
              <p className="text-sm font-semibold">Pending requirements</p>
              <ul className="mt-2 space-y-1">
                {sel.pending.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm"><input type="checkbox" aria-label={`Mark ${p} received`} onChange={() => upd(sel.ref, (r) => ({ ...r, pending: r.pending.filter((x) => x !== p), followUps: [...r.followUps, { date: today, note: `Requirement received: ${p}.` }] }))} />{p}</li>
                ))}
                {!sel.pending.length && <li className="text-sm text-emerald-700">No pending requirements.</li>}
              </ul>
              <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!newPending.trim()) return; upd(sel.ref, (r) => ({ ...r, pending: [...r.pending, newPending.trim()] })); setNewPending(""); }}>
                <input className="input" placeholder="Add pending requirement…" value={newPending} onChange={(e) => setNewPending(e.target.value)} aria-label="Add pending requirement" /><button className="btn-outline btn-sm">Add</button>
              </form>
            </div>
            <div>
              <p className="text-sm font-semibold">Follow-up history</p>
              <ol className="mt-2 space-y-1 border-l border-mist-200 pl-3 text-sm">{sel.followUps.map((f, i) => <li key={i}><span className="text-xs text-mist-500">{fmtDate(f.date)}</span> · {f.note}</li>)}</ol>
              <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!fu.trim()) return; upd(sel.ref, (r) => ({ ...r, followUps: [...r.followUps, { date: today, note: fu.trim() }] })); setFu(""); }}>
                <input className="input" placeholder="Log a follow-up (e.g., Called client, left voicemail)" value={fu} onChange={(e) => setFu(e.target.value)} aria-label="Log follow-up" /><button className="btn-primary btn-sm">Log</button>
              </form>
            </div>
            {sel.status !== "Completed" ? (
              <button className="btn-gold" onClick={() => setStatus(sel.ref, "Completed")}>Resolve request today</button>
            ) : (
              <p className="text-sm text-emerald-700">Resolved {fmtDate(sel.resolved)} · Turnaround {daysBetween(sel.received, sel.resolved!)} days · {sel.resolved! <= sel.target ? "On time" : "Late"}</p>
            )}
          </div>
        )}
      </Modal>

      <Modal open={adding} onClose={() => setAdding(false)} title="Log new service request">
        <form className="grid gap-3" onSubmit={add}>
          <div><label className="label" htmlFor="n-c">Client</label><select id="n-c" className="input" value={nf.clientId} onChange={(e) => setNf({ ...nf, clientId: e.target.value })}>{ds.clients.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}</select></div>
          <div><label className="label" htmlFor="n-cat">Category</label><select id="n-cat" className="input" value={nf.category} onChange={(e) => setNf({ ...nf, category: e.target.value })}>{REQUEST_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label" htmlFor="n-p">Priority</label><select id="n-p" className="input" value={nf.priority} onChange={(e) => { const p = e.target.value as ServiceRequest["priority"]; setNf({ ...nf, priority: p, target: addDaysIso(today, p === "High" ? 2 : p === "Medium" ? 5 : 7) }); }}>{["High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}</select></div>
            <div><label className="label" htmlFor="n-t">Target date</label><input id="n-t" type="date" className="input" value={nf.target} min={today} onChange={(e) => setNf({ ...nf, target: e.target.value })} /></div>
          </div>
          <div><label className="label" htmlFor="n-a">Assign to</label><select id="n-a" className="input" value={nf.assignedTo} onChange={(e) => setNf({ ...nf, assignedTo: e.target.value })}>{staff.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div><label className="label" htmlFor="n-pe">Pending requirements (comma-separated)</label><input id="n-pe" className="input" value={nf.pending} onChange={(e) => setNf({ ...nf, pending: e.target.value })} placeholder="Signed form, Advisor approval" /></div>
          <p className="text-xs text-mist-500">A reference number is assigned automatically. The target date defaults by priority: High +2, Medium +5, Low +7 days.</p>
          <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setAdding(false)}>Cancel</button><button className="btn-primary">Log request</button></div>
        </form>
      </Modal>
    </div>
  );
}
