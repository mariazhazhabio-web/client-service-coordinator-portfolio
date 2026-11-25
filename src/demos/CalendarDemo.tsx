"use client";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, Globe2, BellRing, Settings2, Send } from "lucide-react";
import { Badge, Modal, statusTone } from "@/components/ui";
import { useLocalState } from "@/lib/hooks";
import { cn, fmtDate, todayIso } from "@/lib/utils";
import { ptToPh, wallToUtc, fmtIn, tzAbbr, PT, PH, fmt12 } from "@/lib/timezone";
import type { Appointment } from "@/data/sample";
import { addDaysIso } from "./onboardingUtils";
import { useDataset, ResetButton, advisorName } from "./shared";

type View = "day" | "week" | "month";
type Hours = Record<string, { start: number; end: number; off: string[] }>;
const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const dow = (d: string) => { const [y, m, dd] = d.split("-").map(Number); return new Date(y, m - 1, dd).getDay(); };
const mondayOf = (d: string) => addDaysIso(d, -((dow(d) + 6) % 7));

export default function CalendarDemo() {
  const ds = useDataset();
  const today = todayIso();
  const [appts, setAppts, reset] = useLocalState<Appointment[]>("appointments", () => ds.appointments);
  const [hours, setHours] = useLocalState<Hours>("advisor-hours", () => Object.fromEntries(ds.advisors.map((a) => [a.id, { start: 8, end: 17, off: [] as string[] }])));
  const [view, setView] = useState<View>("week");
  const [cursor, setCursor] = useState(today);
  const [advFilter, setAdvFilter] = useState<string[]>(ds.advisors.map((a) => a.id));
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [settings, setSettings] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [err, setErr] = useState("");
  const blank = { advisorId: ds.advisors[0].id, clientId: ds.clients[0].id, type: "Annual Review", date: addDaysIso(today, 1), start: "10:00", duration: 60, mode: "Video" as Appointment["mode"] };
  const [nf, setNf] = useState(blank);
  const [rs, setRs] = useState({ date: today, start: "10:00" });
  const [conv, setConv] = useState({ dir: "pt" as "pt" | "ph", date: today, time: "09:00" });

  const color = (id: string) => ds.advisors.find((a) => a.id === id)?.color ?? "#213b73";
  const visible = useMemo(() => appts.filter((a) => advFilter.includes(a.advisorId) && a.status !== "Rescheduled"), [appts, advFilter]);
  const sel = appts.find((a) => a.id === openId);
  const note = (m: string) => setLog((l) => [`${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} · ${m}`, ...l].slice(0, 40));

  function validate(advisorId: string, date: string, start: string, duration: number, ignoreId?: string) {
    const h = hours[advisorId];
    const d = dow(date);
    if (d === 0 || d === 6) return "Advisors are not available on weekends.";
    if (h.off.includes(date)) return `${advisorName(advisorId, ds.advisors)} is marked out of office on ${fmtDate(date)}.`;
    const s = toMin(start), e = s + duration;
    if (s < h.start * 60 || e > h.end * 60) return `Outside working hours (${fmt12(`${h.start}:00`)}–${fmt12(`${h.end}:00`)} PT).`;
    const clash = appts.find((a) => a.id !== ignoreId && a.advisorId === advisorId && a.date === date && a.status !== "Rescheduled" && toMin(a.start) < e && toMin(a.start) + a.duration > s);
    if (clash) return `Conflict: ${clash.clientName} is booked ${fmt12(clash.start)} PT for ${clash.duration} min.`;
    return "";
  }
  function create(e: React.FormEvent) {
    e.preventDefault();
    const v = validate(nf.advisorId, nf.date, nf.start, nf.duration);
    if (v) { setErr(v); return; }
    const c = ds.clients.find((x) => x.id === nf.clientId)!;
    const id = `AP-${String(appts.length + 100 + Math.floor(Math.random() * 900))}`;
    setAppts((as) => [...as, { id, ...nf, clientName: c.name, status: "Confirmed" }]);
    const t = ptToPh(nf.date, nf.start);
    note(`Invitation & confirmation sent to ${c.email} (simulated): ${nf.type} ${fmtDate(nf.date)} ${t.pt} PT / ${t.ph} PHT.`);
    setCreating(false); setErr(""); setCursor(nf.date);
  }
  function reschedule() {
    if (!sel) return;
    const v = validate(sel.advisorId, rs.date, rs.start, sel.duration, sel.id);
    if (v) { setErr(v); return; }
    setAppts((as) => as.map((a) => (a.id === sel.id ? { ...a, date: rs.date, start: rs.start, status: "Confirmed" } : a)));
    note(`Rescheduling notice sent to ${sel.clientName} (simulated): moved to ${fmtDate(rs.date)} ${fmt12(rs.start)} PT.`);
    setErr(""); setOpenId(null);
  }
  function remindTomorrow() {
    const tmr = addDaysIso(today, 1);
    const list = appts.filter((a) => a.date === tmr && a.status !== "Rescheduled");
    list.forEach((a) => note(`24-hour reminder sent to ${a.clientName} (simulated) for ${fmt12(a.start)} PT.`));
    if (!list.length) note("No appointments tomorrow. No reminders needed.");
  }

  /* range for current view */
  const weekStart = mondayOf(cursor);
  const days = view === "day" ? [cursor] : view === "week" ? [0, 1, 2, 3, 4].map((i) => addDaysIso(weekStart, i)) : [];
  const monthGrid = useMemo(() => {
    const [y, m] = cursor.split("-").map(Number);
    const first = `${y}-${String(m).padStart(2, "0")}-01`;
    const start = mondayOf(first);
    return Array.from({ length: 42 }, (_, i) => addDaysIso(start, i));
  }, [cursor]);
  const step = (n: number) => setCursor(view === "day" ? addDaysIso(cursor, n) : view === "week" ? addDaysIso(cursor, 7 * n) : (() => { const [y, m] = cursor.split("-").map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`; })());
  const title = view === "month" ? new Date(cursor + "T12:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" }) : view === "week" ? `Week of ${fmtDate(weekStart)}` : new Date(cursor + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const convUtc = conv.dir === "pt" ? wallToUtc(conv.date, conv.time, PT) : wallToUtc(conv.date, conv.time, PH);

  const ApptChip = ({ a, compact }: { a: Appointment; compact?: boolean }) => {
    const t = ptToPh(a.date, a.start);
    return (
      <button onClick={() => { setOpenId(a.id); setRs({ date: a.date, start: a.start }); setErr(""); }} className="block w-full rounded-md border-l-4 bg-white px-2 py-1 text-left text-xs shadow-sm hover:bg-mist-50" style={{ borderLeftColor: color(a.advisorId) }}>
        <span className="font-semibold">{fmt12(a.start)} PT</span>{!compact && <span className="text-mist-500"> · {t.ph.split(", ").pop()} PHT</span>}
        <span className="block truncate">{a.clientName}{!compact && ` · ${a.type}`}</span>
        {!compact && a.status === "Tentative" && <span className="text-amber-700">Tentative</span>}
      </button>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-mist-300 bg-white p-0.5" role="tablist" aria-label="Calendar view">
          {(["day", "week", "month"] as View[]).map((v) => <button key={v} role="tab" aria-selected={view === v} className={cn("btn btn-sm capitalize", view === v ? "bg-navy-800 text-white" : "text-navy-700")} onClick={() => setView(v)}>{v}</button>)}
        </div>
        <button className="btn-outline btn-sm" onClick={() => step(-1)} aria-label="Previous"><ChevronLeft className="h-4 w-4" /></button>
        <button className="btn-outline btn-sm" onClick={() => setCursor(today)}>Today</button>
        <button className="btn-outline btn-sm" onClick={() => step(1)} aria-label="Next"><ChevronRight className="h-4 w-4" /></button>
        <p className="font-semibold">{title}</p>
        <div className="ml-auto flex flex-wrap gap-2">
          <button className="btn-primary btn-sm" onClick={() => { setNf(blank); setErr(""); setCreating(true); }}><Plus className="h-4 w-4" /> New appointment</button>
          <button className="btn-outline btn-sm" onClick={remindTomorrow}><BellRing className="h-4 w-4" /> Send tomorrow&apos;s reminders</button>
          <button className="btn-outline btn-sm" onClick={() => setSettings(true)}><Settings2 className="h-4 w-4" /> Availability</button>
          <ResetButton onReset={reset} />
        </div>
      </div>
      <div className="flex flex-wrap gap-3" role="group" aria-label="Advisor calendars">
        {ds.advisors.map((a) => (
          <label key={a.id} className="flex items-center gap-2 rounded-full border border-mist-200 bg-white px-3 py-1 text-sm">
            <input type="checkbox" checked={advFilter.includes(a.id)} onChange={(e) => setAdvFilter((f) => (e.target.checked ? [...f, a.id] : f.filter((x) => x !== a.id)))} />
            <span className="h-3 w-3 rounded-full" style={{ background: a.color }} />{a.name}
          </label>
        ))}
      </div>

      {view === "month" ? (
        <div className="card overflow-x-auto p-2">
          <div className="grid min-w-[640px] grid-cols-7 gap-1 text-center text-xs font-semibold text-mist-500">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="py-1">{d}</div>)}</div>
          <div className="grid min-w-[640px] grid-cols-7 gap-1">
            {monthGrid.map((d) => {
              const list = visible.filter((a) => a.date === d).sort((a, b) => a.start.localeCompare(b.start));
              const inMonth = d.slice(0, 7) === cursor.slice(0, 7);
              return (
                <div key={d} className={cn("min-h-[96px] rounded-md border p-1", inMonth ? "border-mist-200 bg-white" : "border-transparent bg-mist-50 opacity-60", d === today && "ring-2 ring-gold-400")}>
                  <button className="text-xs font-semibold hover:underline" onClick={() => { setCursor(d); setView("day"); }}>{Number(d.slice(8))}</button>
                  <div className="mt-1 space-y-1">{list.slice(0, 2).map((a) => <ApptChip key={a.id} a={a} compact />)}{list.length > 2 && <button className="text-[11px] text-navy-600" onClick={() => { setCursor(d); setView("day"); }}>+{list.length - 2} more</button>}</div>
                </div>
              );
            })}
          </div>
        </div>
      ) : view === "week" ? (
        <div className="grid gap-2 md:grid-cols-5">
          {days.map((d) => {
            const list = visible.filter((a) => a.date === d).sort((a, b) => a.start.localeCompare(b.start));
            return (
              <div key={d} className={cn("rounded-xl bg-mist-100 p-2", d === today && "ring-2 ring-gold-400")}>
                <button className="mb-2 w-full text-left text-xs font-bold uppercase text-mist-600 hover:underline" onClick={() => { setCursor(d); setView("day"); }}>{new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</button>
                <div className="space-y-1.5">{list.map((a) => <ApptChip key={a.id} a={a} />)}{!list.length && <p className="text-xs text-mist-500">No appointments</p>}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card divide-y divide-mist-100">
          {Array.from({ length: 11 }, (_, i) => i + 7).map((h) => {
            const list = visible.filter((a) => a.date === cursor && Number(a.start.slice(0, 2)) === h);
            const t = ptToPh(cursor, `${String(h).padStart(2, "0")}:00`);
            return (
              <div key={h} className="grid grid-cols-[110px_1fr] gap-3 px-3 py-2">
                <div className="text-xs"><p className="font-semibold">{fmt12(`${h}:00`)} PT</p><p className="text-mist-500">{t.ph.split(", ").pop()} PHT</p></div>
                <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">{list.map((a) => <ApptChip key={a.id} a={a} />)}</div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <p className="flex items-center gap-2 text-sm font-semibold"><Globe2 className="h-4 w-4 text-gold-500" /> Time zone converter: California ↔ Philippines</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <select className="input" value={conv.dir} onChange={(e) => setConv({ ...conv, dir: e.target.value as "pt" | "ph" })} aria-label="Conversion direction"><option value="pt">From California (PT)</option><option value="ph">From Philippines (PHT)</option></select>
            <input type="date" className="input" value={conv.date} onChange={(e) => setConv({ ...conv, date: e.target.value })} aria-label="Date" />
            <input type="time" className="input" value={conv.time} onChange={(e) => setConv({ ...conv, time: e.target.value })} aria-label="Time" />
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-navy-50 p-3"><p className="label">California · {tzAbbr(convUtc, PT)}</p><p className="text-lg font-semibold">{fmtIn(convUtc, PT)}</p></div>
            <div className="rounded-lg bg-gold-50 p-3"><p className="label">Philippines · PHT (UTC+8)</p><p className="text-lg font-semibold">{fmtIn(convUtc, PH)}</p></div>
          </div>
          <p className="mt-2 text-xs text-mist-500">Manila is {ptToPh(conv.date, "12:00").diffHours} hours ahead of California on this date. The difference is 16 hours during U.S. daylight saving time and 15 hours otherwise. The Philippines does not observe DST.</p>
        </div>
        <div className="card p-4">
          <p className="flex items-center gap-2 text-sm font-semibold"><Send className="h-4 w-4 text-gold-500" /> Invitations &amp; reminders log (simulated)</p>
          <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-xs text-mist-600" aria-live="polite">{log.map((l, i) => <li key={i}>{l}</li>)}{!log.length && <li>Create or reschedule an appointment, or send tomorrow&apos;s reminders.</li>}</ul>
        </div>
      </div>

      <Modal open={!!sel} onClose={() => setOpenId(null)} title={sel ? `${sel.type}: ${sel.clientName}` : ""}>
        {sel && (() => { const t = ptToPh(sel.date, sel.start); return (
          <div className="space-y-4 text-sm">
            <dl className="grid grid-cols-2 gap-3">
              <div><dt className="label">Advisor</dt><dd>{advisorName(sel.advisorId, ds.advisors)}</dd></div>
              <div><dt className="label">Status</dt><dd><Badge tone={statusTone(sel.status)}>{sel.status}</Badge></dd></div>
              <div><dt className="label">California time</dt><dd>{fmtDate(sel.date)} · {fmt12(sel.start)} {tzAbbr(t.utc, PT)}</dd></div>
              <div><dt className="label">Philippine time</dt><dd>{t.ph} PHT</dd></div>
              <div><dt className="label">Duration</dt><dd>{sel.duration} min</dd></div>
              <div><dt className="label">Mode</dt><dd>{sel.mode}</dd></div>
            </dl>
            <div className="rounded-lg bg-mist-50 p-3">
              <p className="label flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Reschedule (PT)</p>
              <div className="flex flex-wrap gap-2"><input type="date" className="input w-auto" value={rs.date} onChange={(e) => setRs({ ...rs, date: e.target.value })} aria-label="New date" /><input type="time" step={1800} className="input w-auto" value={rs.start} onChange={(e) => setRs({ ...rs, start: e.target.value })} aria-label="New time" /><button className="btn-primary btn-sm" onClick={reschedule}>Reschedule</button></div>
              <p className="mt-1 text-xs text-mist-500">= {ptToPh(rs.date, rs.start).ph} PHT</p>
            </div>
            {err && <p className="text-sm text-rose-600" role="alert">{err}</p>}
            <div className="flex flex-wrap gap-2">
              <button className="btn-outline btn-sm" onClick={() => note(`Reminder sent to ${sel.clientName} (simulated) for ${fmtDate(sel.date)} ${fmt12(sel.start)} PT.`)}><BellRing className="h-3.5 w-3.5" /> Send reminder</button>
              {sel.status === "Tentative" && <button className="btn-outline btn-sm" onClick={() => { setAppts((as) => as.map((a) => (a.id === sel.id ? { ...a, status: "Confirmed" } : a))); note(`${sel.clientName} confirmed (simulated).`); }}>Mark confirmed</button>}
              <button className="btn-outline btn-sm" onClick={() => { setAppts((as) => as.map((a) => (a.id === sel.id ? { ...a, status: "Completed" } : a))); setOpenId(null); }}>Mark completed</button>
              <button className="btn-ghost btn-sm text-rose-600" onClick={() => { if (!confirm("Cancel this appointment?")) return; setAppts((as) => as.filter((a) => a.id !== sel.id)); note(`Cancellation notice sent to ${sel.clientName} (simulated).`); setOpenId(null); }}>Cancel appointment</button>
            </div>
          </div>
        ); })()}
      </Modal>

      <Modal open={creating} onClose={() => setCreating(false)} title="New appointment">
        <form className="grid gap-3" onSubmit={create}>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label" htmlFor="a-adv">Advisor</label><select id="a-adv" className="input" value={nf.advisorId} onChange={(e) => setNf({ ...nf, advisorId: e.target.value })}>{ds.advisors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
            <div><label className="label" htmlFor="a-cl">Client</label><select id="a-cl" className="input" value={nf.clientId} onChange={(e) => setNf({ ...nf, clientId: e.target.value })}>{ds.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="label" htmlFor="a-ty">Type</label><select id="a-ty" className="input" value={nf.type} onChange={(e) => setNf({ ...nf, type: e.target.value })}>{["Annual Review", "Discovery Meeting", "Paperwork Signing", "Follow-up Call", "Planning Presentation", "Onboarding Session"].map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><label className="label" htmlFor="a-mo">Mode</label><select id="a-mo" className="input" value={nf.mode} onChange={(e) => setNf({ ...nf, mode: e.target.value as Appointment["mode"] })}>{["Video", "Phone", "In-Office"].map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><label className="label" htmlFor="a-da">Date</label><input id="a-da" type="date" className="input" value={nf.date} onChange={(e) => setNf({ ...nf, date: e.target.value })} /></div>
            <div><label className="label" htmlFor="a-ti">Start (PT)</label><input id="a-ti" type="time" step={1800} className="input" value={nf.start} onChange={(e) => setNf({ ...nf, start: e.target.value })} /></div>
            <div><label className="label" htmlFor="a-du">Duration</label><select id="a-du" className="input" value={nf.duration} onChange={(e) => setNf({ ...nf, duration: Number(e.target.value) })}>{[30, 45, 60, 90].map((d) => <option key={d} value={d}>{d} min</option>)}</select></div>
            <div className="self-end rounded-md bg-gold-50 px-3 py-2 text-xs">Philippine time: <strong>{ptToPh(nf.date, nf.start).ph} PHT</strong></div>
          </div>
          {err && <p className="text-sm text-rose-600" role="alert">{err}</p>}
          <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setCreating(false)}>Cancel</button><button className="btn-primary">Book &amp; send invitation (simulated)</button></div>
        </form>
      </Modal>

      <Modal open={settings} onClose={() => setSettings(false)} title="Advisor availability (Pacific Time)">
        <div className="space-y-4">
          {ds.advisors.map((a) => (
            <div key={a.id} className="rounded-lg border border-mist-200 p-3">
              <p className="font-semibold">{a.name}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div><label className="label" htmlFor={`h-s-${a.id}`}>Start</label><select id={`h-s-${a.id}`} className="input" value={hours[a.id].start} onChange={(e) => setHours({ ...hours, [a.id]: { ...hours[a.id], start: Number(e.target.value) } })}>{[7, 8, 9, 10].map((h) => <option key={h} value={h}>{fmt12(`${h}:00`)}</option>)}</select></div>
                <div><label className="label" htmlFor={`h-e-${a.id}`}>End</label><select id={`h-e-${a.id}`} className="input" value={hours[a.id].end} onChange={(e) => setHours({ ...hours, [a.id]: { ...hours[a.id], end: Number(e.target.value) } })}>{[15, 16, 17, 18].map((h) => <option key={h} value={h}>{fmt12(`${h}:00`)}</option>)}</select></div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="label !mb-0">Out of office:</span>
                {hours[a.id].off.map((d) => <button key={d} className="badge bg-rose-50 text-rose-700" onClick={() => setHours({ ...hours, [a.id]: { ...hours[a.id], off: hours[a.id].off.filter((x) => x !== d) } })}>{fmtDate(d)} ✕</button>)}
                <input type="date" className="input w-auto py-1 text-xs" aria-label={`Add out-of-office date for ${a.name}`} onChange={(e) => { if (e.target.value) setHours({ ...hours, [a.id]: { ...hours[a.id], off: Array.from(new Set([...hours[a.id].off, e.target.value])) } }); }} />
              </div>
            </div>
          ))}
          <p className="text-xs text-mist-500">New bookings and reschedules are checked against these hours, out-of-office dates, weekends, and existing appointments.</p>
        </div>
      </Modal>
    </div>
  );
}
