"use client";
import { useState } from "react";
import { UserPlus, Send, CheckCircle2, AlertCircle, BellRing, PartyPopper } from "lucide-react";
import { Badge, Progress, statusTone } from "@/components/ui";
import { useLocalState } from "@/lib/hooks";
import { cn, fmtDate, todayIso, addDaysIso } from "./onboardingUtils";
import { useDataset, ResetButton } from "./shared";

type ItemStatus = "Not Received" | "Received" | "Verified" | "Issue";
type Item = { key: string; name: string; owner: string; status: ItemStatus; note: string };
type Case = { id: string; client: string; email: string; phone: string; advisor: string; type: string; created: string; target: string; items: Item[]; completed: string | null; log: string[] };

const CHECKLIST: [string, string][] = [
  ["Client information form (mock)", "Client Service Coordinator"],
  ["Proof of identity (mock placeholder)", "Operations Associate"],
  ["Proof of address (mock placeholder)", "Operations Associate"],
  ["Signed privacy notice acknowledgment (mock)", "Client Service Coordinator"],
  ["Contact preferences confirmed", "Client Service Coordinator"],
  ["Beneficiary information form (mock)", "Operations Associate"],
  ["Advisor introduction meeting held", "Financial Advisor"],
  ["CRM record created & reviewed", "Client Service Coordinator"],
];

function newCase(client: string, email: string, phone: string, advisor: string, type: string, created: string, progress = 0): Case {
  const statuses: ItemStatus[] = ["Verified", "Verified", "Received", "Issue", "Not Received"];
  return {
    id: `ONB-${Math.floor(1000 + Math.random() * 9000)}`, client, email, phone, advisor, type, created, target: addDaysIso(created, 14), completed: null,
    items: CHECKLIST.map(([name, owner], i) => ({ key: `i${i}`, name, owner, status: i < progress ? statuses[Math.min(i % 5, 1)] : i === progress ? statuses[2 + (progress % 3)] : "Not Received", note: "" })),
    log: [`${fmtDate(created)} · Onboarding case opened and checklist generated.`],
  };
}

export default function OnboardingDemo() {
  const ds = useDataset();
  const today = todayIso();
  const seed = () => [
    newCase("Grace Delgado", "grace.delgado@example.com", "(805) 555-0112", ds.advisors[2].name, "Individual", addDaysIso(today, -9), 5),
    newCase("Nathan Ellison", "nathan.ellison@example.com", "(805) 555-0113", ds.advisors[0].name, "Family", addDaysIso(today, -4), 2),
    newCase("Harper Langford", "harper.langford@example.org", "(805) 555-0124", ds.advisors[1].name, "Retiree", addDaysIso(today, -16), 7),
  ];
  const [cases, setCases, reset] = useLocalState<Case[]>("onboarding-cases", seed);
  const [selId, setSelId] = useState<string | null>(null);
  const [f, setF] = useState({ client: "", email: "", phone: "", advisor: ds.advisors[0].name, type: "Individual" });
  const [errors, setErrors] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const sel = cases.find((c) => c.id === selId) ?? cases[0];

  const pct = (c: Case) => Math.round((c.items.filter((i) => i.status === "Verified").length / c.items.length) * 100);
  const upd = (id: string, fn: (c: Case) => Case) => setCases((cs) => cs.map((c) => (c.id === id ? fn(c) : c)));
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 4000); };

  function register(e: React.FormEvent) {
    e.preventDefault();
    const er: string[] = [];
    if (f.client.trim().split(" ").length < 2) er.push("Enter the client's first and last name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) er.push("Enter a valid email address (use example.com for demo data).");
    if (f.phone && !/^[\d()+\-\s]{7,}$/.test(f.phone)) er.push("Phone number format looks incorrect.");
    setErrors(er);
    if (er.length) return;
    const c = newCase(f.client.trim(), f.email.trim(), f.phone.trim(), f.advisor, f.type, today);
    c.log.push(`${fmtDate(today)} · Welcome email and document checklist queued (simulated).`);
    setCases((cs) => [c, ...cs]);
    setSelId(c.id);
    setF({ ...f, client: "", email: "", phone: "" });
    flash(`Onboarding case ${c.id} created for ${c.client}.`);
  }

  const missing = sel ? sel.items.filter((i) => i.status === "Not Received" || i.status === "Issue") : [];

  return (
    <div className="space-y-6">
      {toast && <div className="fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-2 rounded-lg bg-navy-900 px-4 py-3 text-sm text-white shadow-xl" role="status"><BellRing className="mt-0.5 h-4 w-4 text-gold-300" />{toast}</div>}
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <form onSubmit={register} className="card space-y-3 p-5" noValidate>
            <h3 className="flex items-center gap-2 font-sans font-semibold"><UserPlus className="h-4 w-4" /> New client registration</h3>
            <div><label className="label" htmlFor="o-n">Client full name *</label><input id="o-n" className="input" value={f.client} onChange={(e) => setF({ ...f, client: e.target.value })} placeholder="e.g., Jamie Sample" /></div>
            <div><label className="label" htmlFor="o-e">Email *</label><input id="o-e" className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="jamie.sample@example.com" /></div>
            <div><label className="label" htmlFor="o-p">Phone</label><input id="o-p" className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="(805) 555-0199" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="label" htmlFor="o-a">Advisor</label><select id="o-a" className="input" value={f.advisor} onChange={(e) => setF({ ...f, advisor: e.target.value })}>{ds.advisors.map((a) => <option key={a.id}>{a.name}</option>)}</select></div>
              <div><label className="label" htmlFor="o-t">Client type</label><select id="o-t" className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{["Individual", "Family", "Retiree", "Business Owner"].map((t) => <option key={t}>{t}</option>)}</select></div>
            </div>
            {errors.length > 0 && <ul className="list-disc pl-5 text-xs text-rose-600" role="alert">{errors.map((x) => <li key={x}>{x}</li>)}</ul>}
            <button className="btn-primary w-full">Register &amp; generate checklist</button>
            <p className="text-[11px] text-mist-500">No documents are actually uploaded or requested. Use fictional details only.</p>
          </form>
          <div className="card divide-y divide-mist-100">
            {cases.map((c) => (
              <button key={c.id} onClick={() => setSelId(c.id)} className={cn("block w-full px-4 py-3 text-left hover:bg-mist-50", sel?.id === c.id && "bg-navy-50")}>
                <div className="flex items-center justify-between"><span className="text-sm font-semibold">{c.client}</span>{c.completed ? <Badge tone="green">Completed</Badge> : <span className="text-xs text-mist-500">{pct(c)}%</span>}</div>
                <p className="text-xs text-mist-500">{c.id} · Opened {fmtDate(c.created)}</p>
                <Progress value={pct(c)} className="mt-2" />
              </button>
            ))}
          </div>
          <ResetButton onReset={() => { reset(); setSelId(null); }} />
        </div>

        {sel && (
          <div className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-sans text-xl font-semibold">{sel.client}</h3>
                <p className="text-sm text-mist-500">{sel.id} · {sel.type} · Advisor: {sel.advisor} · Target: {fmtDate(sel.target)}</p>
              </div>
              {sel.completed ? <Badge tone="green">Onboarded {fmtDate(sel.completed)}</Badge> : sel.target < today ? <Badge tone="red">Past target date</Badge> : <Badge tone="blue">In progress</Badge>}
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs font-semibold text-mist-600"><span>Onboarding progress</span><span>{pct(sel)}% verified</span></div>
              <Progress value={pct(sel)} className="h-3" />
              <ol className="mt-3 grid grid-cols-4 gap-1 text-center text-[11px]">
                {["Registered", "Documents received", "Verified", "Complete"].map((s, i) => {
                  const recv = sel.items.every((x) => x.status !== "Not Received");
                  const done = [true, recv, pct(sel) === 100, !!sel.completed][i];
                  return <li key={s} className={cn("rounded px-1 py-1", done ? "bg-emerald-50 font-semibold text-emerald-700" : "bg-mist-100 text-mist-500")}>{s}</li>;
                })}
              </ol>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead><tr className="border-b border-mist-200"><th className="th">Requirement</th><th className="th">Assigned to</th><th className="th">Status</th></tr></thead>
                <tbody className="divide-y divide-mist-100">
                  {sel.items.map((it) => (
                    <tr key={it.key}>
                      <td className="td">{it.name}</td>
                      <td className="td text-xs text-mist-600">{it.owner}</td>
                      <td className="td">
                        <select disabled={!!sel.completed} className={cn("input py-1 text-xs", it.status === "Verified" && "border-emerald-300 bg-emerald-50", it.status === "Issue" && "border-rose-300 bg-rose-50")} value={it.status} aria-label={`Status of ${it.name}`}
                          onChange={(e) => { const v = e.target.value as ItemStatus; upd(sel.id, (c) => ({ ...c, items: c.items.map((x) => (x.key === it.key ? { ...x, status: v } : x)), log: [...c.log, `${fmtDate(today)} · "${it.name}" marked ${v}.`] })); }}>
                          {["Not Received", "Received", "Verified", "Issue"].map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-mist-200 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold"><AlertCircle className="h-4 w-4 text-rose-500" /> Missing requirements ({missing.length})</p>
                <ul className="mt-2 space-y-1 text-sm">{missing.map((m) => <li key={m.key} className="flex items-center gap-2"><Badge tone={statusTone(m.status === "Issue" ? "missing" : "pending")}>{m.status}</Badge>{m.name}</li>)}</ul>
                {!missing.length && <p className="mt-2 text-sm text-emerald-700">Nothing missing.</p>}
                <button disabled={!missing.length || !!sel.completed} className="btn-outline btn-sm mt-3" onClick={() => { upd(sel.id, (c) => ({ ...c, log: [...c.log, `${fmtDate(today)} · Missing document reminder sent to ${c.email} (simulated): ${missing.map((m) => m.name).join(", ")}.`] })); flash(`Reminder simulated for ${sel.client}. No email was actually sent.`); }}><Send className="h-3.5 w-3.5" /> Send missing-document reminder</button>
              </div>
              <div className="rounded-lg border border-mist-200 p-4">
                <p className="text-sm font-semibold">Activity log</p>
                <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-mist-600">{[...sel.log].reverse().map((l, i) => <li key={i}>{l}</li>)}</ul>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button disabled={pct(sel) < 100 || !!sel.completed} className="btn-gold" onClick={() => { upd(sel.id, (c) => ({ ...c, completed: today, log: [...c.log, `${fmtDate(today)} · Onboarding completed. Welcome confirmation sent to client and advisor notified (simulated).`] })); flash(`🎉 ${sel.client} is fully onboarded. Completion notice simulated to client and ${sel.advisor}.`); }}><CheckCircle2 className="h-4 w-4" /> Complete onboarding</button>
              {pct(sel) < 100 && !sel.completed && <p className="text-xs text-mist-500">All items must be <strong>Verified</strong> before onboarding can be completed.</p>}
              {sel.completed && <p className="flex items-center gap-1 text-sm text-emerald-700"><PartyPopper className="h-4 w-4" /> Completion notification simulated.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
