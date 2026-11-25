"use client";
import { useEffect, useRef, useState } from "react";
import { Play, Download, CheckCircle2, Loader2, Circle, FileSpreadsheet, Mail, CalendarDays, HardDrive, Clock, GitBranch, FormInput, Webhook, ShieldAlert, SquareKanban } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUTOMATIONS, type AutoStep } from "@/data/automations";
import { DL } from "@/data/downloads";

const APP_ICON: Record<AutoStep["app"], typeof Mail> = { "Google Forms": FormInput, "Google Sheets": FileSpreadsheet, Gmail: Mail, "Google Calendar": CalendarDays, "Google Drive": HardDrive, Trello: SquareKanban, Schedule: Clock, Logic: GitBranch, Webhook };
const APP_COLOR: Record<AutoStep["app"], string> = { "Google Forms": "bg-violet-100 text-violet-700", "Google Sheets": "bg-emerald-100 text-emerald-700", Gmail: "bg-rose-100 text-rose-700", "Google Calendar": "bg-sky-100 text-sky-700", "Google Drive": "bg-amber-100 text-amber-700", Trello: "bg-blue-100 text-blue-700", Schedule: "bg-mist-200 text-mist-600", Logic: "bg-navy-100 text-navy-700", Webhook: "bg-mist-200 text-mist-600" };

export default function AutomationDemo() {
  const [id, setId] = useState(AUTOMATIONS[0].id);
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const a = AUTOMATIONS.find((x) => x.id === id)!;

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => { setStep(-1); setRunning(false); if (timer.current) clearTimeout(timer.current); }, [id]);

  function run() {
    setRunning(true); setStep(0);
    const start = Date.now();
    setLog((l) => [`▶ ${new Date().toLocaleTimeString()} · Test execution started: "${a.title}" (mock credentials, test data)`, ...l]);
    const go = (i: number) => {
      timer.current = setTimeout(() => {
        const s = a.steps[i];
        setLog((l) => [`  ✓ [${s.app}] ${s.name}: ${s.output}`, ...l]);
        if (i + 1 < a.steps.length) { setStep(i + 1); go(i + 1); }
        else { setStep(a.steps.length); setRunning(false); setLog((l) => [`■ Finished in ${((Date.now() - start) / 1000).toFixed(1)}s (simulated). No external system was contacted and no message was sent.`, ...l]); }
      }, 850);
    };
    go(0);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Workflows">
        {AUTOMATIONS.map((w, i) => <button key={w.id} role="tab" aria-selected={w.id === id} onClick={() => setId(w.id)} className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold", w.id === id ? "border-navy-800 bg-navy-800 text-white" : "border-mist-300 bg-white hover:bg-mist-100")}>{i + 1}. {w.title}</button>)}
      </div>
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-sans text-lg font-semibold">{a.title}</h3>
            <p className="text-sm text-mist-500">Trigger: {a.trigger} · Replaces: {a.manualMinutes}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-gold" onClick={run} disabled={running}>{running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Run test execution</button>
            <a className="btn-outline" href={`/downloads/n8n/${a.file}`} download><Download className="h-4 w-4" /> n8n JSON</a>
          </div>
        </div>
        <ol className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-stretch">
          {a.steps.map((s, i) => {
            const I = APP_ICON[s.app];
            const state = step > i ? "done" : step === i ? "active" : "idle";
            return (
              <li key={s.name} className="flex flex-1 items-center gap-2 lg:flex-col lg:items-stretch">
                <div className={cn("flex-1 rounded-xl border-2 p-3 transition-all", state === "done" ? "border-emerald-400 bg-emerald-50" : state === "active" ? "scale-[1.02] border-gold-400 bg-gold-50 shadow-md" : "border-mist-200 bg-white")}>
                  <div className="flex items-center justify-between">
                    <span className={cn("grid h-8 w-8 place-items-center rounded-lg", APP_COLOR[s.app])}><I className="h-4 w-4" /></span>
                    {state === "done" ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : state === "active" ? <Loader2 className="h-5 w-5 animate-spin text-gold-600" /> : <Circle className="h-5 w-5 text-mist-300" />}
                  </div>
                  <p className="mt-2 text-[11px] font-semibold uppercase text-mist-500">{s.app}</p>
                  <p className="text-sm font-semibold">{s.name}</p>
                  <p className="mt-1 text-xs text-mist-600">{s.action}</p>
                  {state === "done" && <p className="mt-2 rounded bg-white px-2 py-1 font-mono text-[11px] text-emerald-800">{s.output}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="card p-4">
          <p className="text-sm font-semibold">Execution log</p>
          <pre className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-navy-950 p-3 font-mono text-[11px] text-emerald-200" aria-live="polite">{log.join("\n") || "Run a test execution to see the log."}</pre>
        </div>
        <div className="card space-y-3 p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold"><ShieldAlert className="h-4 w-4 text-gold-500" /> Safe-by-default templates</p>
          <ul className="list-disc space-y-1 pl-5 text-mist-600">
            <li>Credentials are placeholders (e.g., <code>MOCK_GOOGLE_SHEETS</code>). Add your own test accounts in n8n.</li>
            <li>Gmail nodes are <strong>disabled</strong> in every template, so importing never sends email.</li>
            <li>Use test Google Sheets and test Trello boards only. Never connect client or production data without approval.</li>
            <li>Works on free self-hosted n8n (Docker or npm). No paid subscription is required.</li>
          </ul>
          <a href={DL.n8nZip} download className="btn-primary btn-sm"><Download className="h-4 w-4" /> All 7 workflows (ZIP)</a>
        </div>
      </div>
    </div>
  );
}
