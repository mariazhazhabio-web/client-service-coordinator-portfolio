"use client";
import { useState } from "react";
import { Download, Printer, Search, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { SOPS } from "@/data/documents";
import { DL, sopFile } from "@/data/downloads";

export default function SopDemo() {
  const [code, setCode] = useState(SOPS[0].code);
  const [q, setQ] = useState("");
  const list = SOPS.filter((s) => !q || JSON.stringify(s).toLowerCase().includes(q.toLowerCase()));
  const s = SOPS.find((x) => x.code === code) ?? SOPS[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <div className="space-y-2">
        <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-mist-400" /><input className="input pl-9" placeholder="Search SOPs…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search SOPs" /></div>
        <div className="card divide-y divide-mist-100">
          {list.map((x) => (
            <button key={x.code} onClick={() => setCode(x.code)} className={cn("block w-full px-3 py-2.5 text-left hover:bg-mist-50", x.code === s.code && "bg-navy-50")}>
              <span className="text-[11px] font-bold text-gold-600">{x.code}</span>
              <span className="block text-sm font-semibold">{x.title}</span>
            </button>
          ))}
          {!list.length && <p className="p-4 text-sm text-mist-500">No SOP matches.</p>}
        </div>
        <a href={DL.sopZip} download className="btn-outline btn-sm w-full"><Package className="h-4 w-4" /> All 10 SOPs (DOCX + PDF)</a>
      </div>
      <article className="card p-6 print:shadow-none" aria-labelledby="sop-title">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-mist-200 pb-4">
          <div>
            <p className="eyebrow">{s.code} · Standard Operating Procedure</p>
            <h3 id="sop-title" className="mt-1 text-2xl font-semibold">{s.title}</h3>
            <p className="mt-1 text-xs text-mist-500">Version 1.0 · Owner: Client Service Coordinator · Review: quarterly · Portfolio demonstration template</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a className="btn-primary btn-sm" href={sopFile(s.code, s.slug, "docx")} download><Download className="h-3.5 w-3.5" /> DOCX</a>
            <a className="btn-outline btn-sm" href={sopFile(s.code, s.slug, "pdf")} download><Download className="h-3.5 w-3.5" /> PDF</a>
            <button className="btn-ghost btn-sm" onClick={() => window.print()}><Printer className="h-3.5 w-3.5" /> Print</button>
          </div>
        </div>
        <div className="mt-4 space-y-5 text-sm leading-relaxed">
          <section><h4 className="font-sans font-bold text-navy-800">1. Purpose</h4><p>{s.purpose}</p></section>
          <section><h4 className="font-sans font-bold text-navy-800">2. Scope</h4><p>{s.scope}</p></section>
          <section><h4 className="font-sans font-bold text-navy-800">3. Responsibilities</h4>
            <table className="mt-2 w-full border border-mist-200 text-sm"><tbody>{s.responsibilities.map((r) => <tr key={r.role} className="border-b border-mist-200"><td className="w-1/3 bg-mist-50 px-3 py-2 font-semibold">{r.role}</td><td className="px-3 py-2">{r.duty}</td></tr>)}</tbody></table>
          </section>
          <section><h4 className="font-sans font-bold text-navy-800">4. Procedure</h4><ol className="mt-1 list-decimal space-y-1 pl-5">{s.procedure.map((p) => <li key={p}>{p}</li>)}</ol></section>
          <section><h4 className="font-sans font-bold text-navy-800">5. Quality control</h4><ul className="mt-1 list-disc space-y-1 pl-5">{s.qc.map((p) => <li key={p}>{p}</li>)}</ul></section>
          <section><h4 className="font-sans font-bold text-navy-800">6. Expected outputs</h4><ul className="mt-1 list-disc space-y-1 pl-5">{s.outputs.map((p) => <li key={p}>{p}</li>)}</ul></section>
          <p className="rounded-md bg-gold-50 px-3 py-2 text-xs text-gold-700">Template SOP for portfolio demonstration. A real practice would align it with its firm&apos;s policies, compliance requirements, and approved systems.</p>
        </div>
      </article>
    </div>
  );
}
