"use client";
import { useMemo, useState } from "react";
import { Users, UserPlus, Inbox, CheckCircle2, Hourglass, AlertTriangle, Timer, Target, Download, CalendarDays } from "lucide-react";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, BarChart, PieChart, Pie, Cell } from "recharts";
import { Kpi, Badge, statusTone } from "@/components/ui";
import { fmtDate, todayIso, addDaysIso, exportCsv, exportXlsx } from "@/lib/utils";
import { fmt12, ptToPh } from "@/lib/timezone";
import { requestKpis, isOverdue } from "@/data/sample";
import { useDataset, advisorName } from "./shared";

const RANGES = [
  { id: "30", label: "Last 30 days", days: 30 },
  { id: "60", label: "Last 60 days", days: 60 },
  { id: "90", label: "Last 90 days", days: 90 },
  { id: "custom", label: "Custom range", days: 0 },
];
const PIE = ["#9aa3b2", "#4f6fae", "#dcbc6c", "#b98b30", "#213b73"];

export default function DashboardDemo() {
  const ds = useDataset();
  const today = todayIso();
  const [range, setRange] = useState("60");
  const [from, setFrom] = useState(addDaysIso(today, -30));
  const [to, setTo] = useState(today);
  const [months, setMonths] = useState(12);
  const [advisor, setAdvisor] = useState("All");

  const start = range === "custom" ? from : addDaysIso(today, -(RANGES.find((r) => r.id === range)?.days ?? 60));
  const end = range === "custom" ? to : today;
  const clientIds = useMemo(() => new Set(ds.clients.filter((c) => advisor === "All" || c.advisorId === advisor).map((c) => c.id)), [ds, advisor]);
  const reqs = useMemo(() => ds.requests.filter((r) => r.received >= start && r.received <= end && clientIds.has(r.clientId)), [ds, start, end, clientIds]);
  const k = requestKpis(reqs, today);
  const clients = ds.clients.filter((c) => clientIds.has(c.id));
  const active = clients.filter((c) => c.status === "Active").length;
  const newClients = clients.filter((c) => c.since >= start || c.status === "Onboarding").length;
  const upcoming = ds.appointments.filter((a) => a.date >= today && a.date <= addDaysIso(today, 14) && clientIds.has(a.clientId) && a.status !== "Rescheduled").sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const trend = ds.months.slice(-months);
  const staff = ds.staff.map((s) => s.name.replace(" (Demo User)", ""));
  const workload = staff.map((s) => ({ name: s.split(" ")[0] === "Client" ? "Coordinator" : s.split(" ")[0], open: reqs.filter((r) => r.assignedTo === s && r.status !== "Completed").length, overdue: reqs.filter((r) => r.assignedTo === s && isOverdue(r, today)).length, completed: reqs.filter((r) => r.assignedTo === s && r.status === "Completed").length }));
  const byStatus = ["Received", "In Progress", "Pending Client", "Pending Home Office", "Completed"].map((s) => ({ name: s, value: reqs.filter((r) => r.status === s).length })).filter((x) => x.value);
  const byCat = Array.from(new Set(reqs.map((r) => r.category))).map((c) => ({ name: c.replace(" Information", "").replace("Systematic ", ""), count: reqs.filter((r) => r.category === c).length })).sort((a, b) => b.count - a.count);

  const exportRows = () => reqs.map((r) => ({ Ref: r.ref, Client: r.clientName, Category: r.category, Received: r.received, AssignedTo: r.assignedTo, Priority: r.priority, Target: r.target, Status: r.status, Resolved: r.resolved ?? "", Overdue: isOverdue(r, today) ? "Yes" : "No" }));
  const kpiRows = () => [
    { KPI: "Date range", Value: `${start} to ${end}` }, { KPI: "Advisor filter", Value: advisor === "All" ? "All" : advisorName(advisor, ds.advisors) },
    { KPI: "Total active clients", Value: active }, { KPI: "New clients", Value: newClients }, { KPI: "Requests received", Value: k.total }, { KPI: "Completed", Value: k.completed },
    { KPI: "Outstanding", Value: k.pending }, { KPI: "Overdue", Value: k.overdue }, { KPI: "Average turnaround (days)", Value: k.avgTat }, { KPI: "On-time resolution rate (%)", Value: k.onTimeRate }, { KPI: "Completion rate (%)", Value: k.completionRate },
  ];

  return (
    <div className="space-y-5">
      <div className="card flex flex-wrap items-end gap-3 p-3">
        <div><label className="label" htmlFor="d-r">Date range (requests received)</label><select id="d-r" className="input" value={range} onChange={(e) => setRange(e.target.value)}>{RANGES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}</select></div>
        {range === "custom" && <>
          <div><label className="label" htmlFor="d-f">From</label><input id="d-f" type="date" className="input" value={from} max={to} onChange={(e) => setFrom(e.target.value)} /></div>
          <div><label className="label" htmlFor="d-t">To</label><input id="d-t" type="date" className="input" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></div>
        </>}
        <div><label className="label" htmlFor="d-a">Advisor</label><select id="d-a" className="input" value={advisor} onChange={(e) => setAdvisor(e.target.value)}><option value="All">All advisors</option>{ds.advisors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
        <div><label className="label" htmlFor="d-m">Trend period</label><select id="d-m" className="input" value={months} onChange={(e) => setMonths(Number(e.target.value))}>{[3, 6, 12].map((m) => <option key={m} value={m}>Last {m} months</option>)}</select></div>
        <div className="ml-auto flex gap-2">
          <button className="btn-outline btn-sm" onClick={() => exportCsv(exportRows(), `service-requests-${start}_to_${end}.csv`)}><Download className="h-3.5 w-3.5" /> CSV</button>
          <button className="btn-primary btn-sm" onClick={() => exportXlsx([{ name: "KPI Summary", rows: kpiRows() }, { name: "Requests", rows: exportRows() }, { name: "Monthly Trend", rows: trend.map((m) => ({ Month: m.month, Received: m.received, Completed: m.completed, Overdue: m.overdue, NewClients: m.newClients, AvgTAT: m.avgTat, OnTimePct: m.onTime })) }, { name: "Staff Workload", rows: workload.map((w) => ({ Staff: w.name, Open: w.open, Overdue: w.overdue, Completed: w.completed })) }], `client-service-dashboard-${today}.xlsx`)}><Download className="h-3.5 w-3.5" /> Excel</button>
        </div>
      </div>
      <p className="text-xs text-mist-500">Showing {fmtDate(start)} – {fmtDate(end)} · {reqs.length} requests · All figures come from fictional sample data and are illustrative.</p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <Kpi label="Active clients" value={active} icon={<Users className="h-4 w-4" />} />
        <Kpi label="New clients" value={newClients} icon={<UserPlus className="h-4 w-4" />} tone="gold" />
        <Kpi label="Requests received" value={k.total} icon={<Inbox className="h-4 w-4" />} />
        <Kpi label="Completed" value={k.completed} icon={<CheckCircle2 className="h-4 w-4" />} tone="green" />
        <Kpi label="Outstanding" value={k.pending} icon={<Hourglass className="h-4 w-4" />} tone="gold" />
        <Kpi label="Overdue" value={k.overdue} icon={<AlertTriangle className="h-4 w-4" />} tone="red" />
        <Kpi label="Avg turnaround" value={`${k.avgTat}d`} icon={<Timer className="h-4 w-4" />} />
        <Kpi label="On-time rate" value={`${k.onTimeRate}%`} icon={<Target className="h-4 w-4" />} tone="green" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="card p-4 xl:col-span-2">
          <p className="text-sm font-semibold">Monthly performance trend</p>
          <div className="h-72"><ResponsiveContainer><ComposedChart data={trend}><CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" /><XAxis dataKey="month" fontSize={11} /><YAxis yAxisId="l" fontSize={11} /><YAxis yAxisId="r" orientation="right" domain={[60, 100]} fontSize={11} unit="%" /><Tooltip /><Legend /><Bar yAxisId="l" dataKey="received" name="Received" fill="#adbfe0" radius={[3, 3, 0, 0]} /><Bar yAxisId="l" dataKey="completed" name="Completed" fill="#213b73" radius={[3, 3, 0, 0]} /><Line yAxisId="r" dataKey="onTime" name="On-time %" stroke="#b98b30" strokeWidth={2} dot={{ r: 3 }} /></ComposedChart></ResponsiveContainer></div>
        </div>
        <div className="card p-4">
          <p className="text-sm font-semibold">Requests by status</p>
          <div className="h-72"><ResponsiveContainer><PieChart><Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>{byStatus.map((s, i) => <Cell key={s.name} fill={PIE[i % PIE.length]} />)}</Pie><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} /></PieChart></ResponsiveContainer></div>
        </div>
        <div className="card p-4">
          <p className="text-sm font-semibold">Staff workload (in range)</p>
          <div className="h-64"><ResponsiveContainer><BarChart data={workload} layout="vertical" margin={{ left: 10 }}><XAxis type="number" allowDecimals={false} fontSize={11} /><YAxis type="category" dataKey="name" width={80} fontSize={11} /><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="open" stackId="a" name="Open" fill="#4f6fae" /><Bar dataKey="overdue" stackId="a" name="Overdue" fill="#e11d48" /><Bar dataKey="completed" stackId="a" name="Completed" fill="#b98b30" /></BarChart></ResponsiveContainer></div>
        </div>
        <div className="card p-4">
          <p className="text-sm font-semibold">Average turnaround trend (days)</p>
          <div className="h-64"><ResponsiveContainer><ComposedChart data={trend}><CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" /><XAxis dataKey="month" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Line dataKey="avgTat" name="Avg TAT" stroke="#213b73" strokeWidth={2} /><Bar dataKey="overdue" name="Overdue" fill="#fecdd3" /></ComposedChart></ResponsiveContainer></div>
        </div>
        <div className="card p-4">
          <p className="text-sm font-semibold">Requests by category</p>
          <div className="h-64"><ResponsiveContainer><BarChart data={byCat}><XAxis dataKey="name" fontSize={9} interval={0} angle={-25} textAnchor="end" height={60} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="count" fill="#213b73" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <p className="flex items-center gap-2 text-sm font-semibold"><CalendarDays className="h-4 w-4" /> Upcoming appointments (next 14 days): {upcoming.length}</p>
          <ul className="mt-2 max-h-72 divide-y divide-mist-100 overflow-y-auto">
            {upcoming.map((a) => <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"><span><strong>{fmtDate(a.date)}</strong> · {fmt12(a.start)} PT <span className="text-xs text-mist-500">({ptToPh(a.date, a.start).ph} PHT)</span></span><span>{a.clientName} · <span className="text-mist-500">{a.type}</span></span><Badge tone={statusTone(a.status)}>{a.status}</Badge></li>)}
            {!upcoming.length && <li className="py-3 text-sm text-mist-500">No upcoming appointments.</li>}
          </ul>
        </div>
        <div className="card p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-rose-700"><AlertTriangle className="h-4 w-4" /> Overdue requests needing attention</p>
          <ul className="mt-2 max-h-72 divide-y divide-mist-100 overflow-y-auto">
            {reqs.filter((r) => isOverdue(r, today)).map((r) => <li key={r.ref} className="flex flex-wrap justify-between gap-2 py-2 text-sm"><span className="font-mono text-xs">{r.ref}</span><span>{r.clientName} · {r.category}</span><span className="text-xs text-rose-600">Due {fmtDate(r.target)} · {r.assignedTo}</span></li>)}
            {!k.overdue && <li className="py-3 text-sm text-emerald-700">No overdue requests in this range.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
