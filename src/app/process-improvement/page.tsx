import Link from "next/link";
import { Search, PenTool, FlaskConical, Rocket, RefreshCw, ArrowRight, Download } from "lucide-react";
import { PageHeader, Section, Badge } from "@/components/ui";
import { AUTOMATIONS } from "@/data/automations";
import { DL } from "@/data/downloads";

export const metadata = { title: "Process Improvement & Automation" };

const CYCLE = [
  { icon: Search, t: "Observe", d: "Follow the current process exactly and note delays, rework, and repeated questions." },
  { icon: PenTool, t: "Document", d: "Write the as-is steps as an SOP so everyone agrees on the baseline." },
  { icon: FlaskConical, t: "Propose", d: "Suggest small, low-risk changes such as templates, checklists, tracker fields, or reminders." },
  { icon: Rocket, t: "Approve & implement", d: "Implement only with advisor or operations approval, using approved systems." },
  { icon: RefreshCw, t: "Review", d: "Track KPIs such as turnaround and on-time rate and adjust every quarter." },
];

const IDEAS = [
  { area: "Post-meeting follow-up", before: "Action items captured in personal notes", after: "Standard recap template and an action list logged within 24 hours (Project 4)" },
  { area: "Missing documents", before: "Ad-hoc reminder emails", after: "Checklist-driven reminders every 3 business days (Projects 2 and 11)" },
  { area: "Service request status", before: "Clients call to ask for updates", after: "Acknowledgment with timeline, plus overdue alerts (Project 3)" },
  { area: "Weekly reporting", before: "Counting items manually", after: "Formula-driven KPI dashboard (Projects 7 and 12)" },
  { area: "File naming", before: "Inconsistent names and duplicate versions", after: "Naming convention and version control (Project 9)" },
  { area: "Scheduling across time zones", before: "Mental time conversion", after: "Dual-time-zone confirmations and a converter (Project 5)" },
];

export default function ProcessImprovement() {
  return (
    <>
      <PageHeader eyebrow="Process improvement & automation" title="Small, approved improvements that save time and prevent errors" intro="In public service I helped develop plans, policies, and procedures. I apply the same disciplined approach here: understand first, document, then improve with approval." />
      <Section title="My improvement cycle">
        <ol className="grid gap-4 md:grid-cols-5">
          {CYCLE.map(({ icon: I, t, d }, i) => (
            <li key={t} className="card p-4">
              <div className="flex items-center gap-2"><span className="text-xs font-bold text-gold-600">0{i + 1}</span><I className="h-5 w-5 text-navy-700" /></div>
              <p className="mt-2 font-semibold">{t}</p>
              <p className="mt-1 text-sm text-mist-600">{d}</p>
            </li>
          ))}
        </ol>
      </Section>
      <section className="bg-white">
        <Section title="Improvement opportunities demonstrated in this portfolio" intro="Illustrative before and after examples for a typical practice. These are not results measured at any employer.">
          <div className="overflow-x-auto rounded-xl border border-mist-200">
            <table className="w-full min-w-[640px]">
              <thead className="bg-mist-100"><tr><th className="th">Area</th><th className="th">Typical before</th><th className="th">Proposed after</th></tr></thead>
              <tbody className="divide-y divide-mist-100">
                {IDEAS.map((r) => <tr key={r.area}><td className="td font-semibold">{r.area}</td><td className="td text-mist-600">{r.before}</td><td className="td">{r.after}</td></tr>)}
              </tbody>
            </table>
          </div>
        </Section>
      </section>
      <Section title="Automation workflows (n8n)" intro="Seven workflow templates that use free tools and test data. Credentials are placeholders and every email node is disabled, so nothing is ever sent.">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {AUTOMATIONS.map((a) => (
            <div key={a.id} className="card p-5">
              <p className="font-semibold">{a.title}</p>
              <p className="mt-1 text-xs text-mist-500">Trigger: {a.trigger}</p>
              <div className="mt-3 flex flex-wrap gap-1">{Array.from(new Set(a.steps.map((s) => s.app))).map((app) => <Badge key={app} tone="navy">{app}</Badge>)}</div>
              <a href={`/downloads/n8n/${a.file}`} download className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy-700 hover:underline"><Download className="h-4 w-4" /> n8n JSON</a>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/projects/automation" className="btn-primary">Run the automation simulator <ArrowRight className="h-4 w-4" /></Link>
          <a href={DL.n8nZip} download className="btn-outline"><Download className="h-4 w-4" /> All workflows (ZIP)</a>
          <Link href="/projects/sops" className="btn-outline">Read the SOPs</Link>
        </div>
      </Section>
    </>
  );
}
