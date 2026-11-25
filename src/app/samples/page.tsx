import { FileSpreadsheet, Presentation, FileText, Workflow, Database, Package, Download } from "lucide-react";
import { PageHeader, Section } from "@/components/ui";
import { DL, sopFile } from "@/data/downloads";
import { SOPS } from "@/data/documents";
import { AUTOMATIONS } from "@/data/automations";

export const metadata = { title: "Administrative Work Samples" };

type Item = { name: string; desc: string; files: { label: string; href: string }[] };

function Group({ icon: I, title, items }: { icon: typeof FileText; title: string; items: Item[] }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-navy-800 text-gold-300"><I className="h-5 w-5" /></span>
        <h2 className="font-sans text-lg font-semibold">{title}</h2>
      </div>
      <ul className="mt-4 divide-y divide-mist-100">
        {items.map((it) => (
          <li key={it.name} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">{it.name}</p>
              <p className="text-xs text-mist-500">{it.desc}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {it.files.map((f) => (
                <a key={f.href} href={f.href} download className="btn-outline btn-sm"><Download className="h-3.5 w-3.5" />{f.label}</a>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Samples() {
  return (
    <>
      <PageHeader eyebrow="Administrative work samples" title="Real, editable files ready to download" intro="Each file was generated from the same fictional dataset used in the demos. Open them in Microsoft Office, Google Workspace, or LibreOffice.">
        <a href={DL.everythingZip} download className="btn-gold"><Package className="h-4 w-4" /> Download all work samples (ZIP)</a>
      </PageHeader>
      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <Group icon={FileSpreadsheet} title="Excel reporting" items={[
            { name: "Client Service Administrative Reporting System", desc: "9 worksheets · live formulas · filters · conditional formatting · charts", files: [{ label: "XLSX", href: DL.xlsx }] },
          ]} />
          <Group icon={Presentation} title="PowerPoint" items={[
            { name: "Client Meeting Presentation (administrative demo)", desc: "12 editable slides with advisor-only placeholders", files: [{ label: "PPTX", href: DL.pptx }] },
          ]} />
          <Group icon={Workflow} title="n8n workflow templates" items={[
            { name: "All 7 workflows", desc: "Importable JSON. Mock credentials. Email nodes disabled.", files: [{ label: "ZIP", href: DL.n8nZip }] },
            ...AUTOMATIONS.map((a) => ({ name: a.title, desc: a.trigger, files: [{ label: "JSON", href: `/downloads/n8n/${a.file}` }] })),
          ]} />
          <Group icon={Database} title="Sample datasets" items={[
            { name: "Fictional dataset (JSON)", desc: "Clients, requests, appointments, meetings, documents", files: [{ label: "JSON", href: DL.dataJson }] },
            { name: "Fictional dataset (CSV files)", desc: "One CSV per table", files: [{ label: "ZIP", href: DL.dataZip }] },
          ]} />
        </div>
        <div className="mt-6">
          <Group icon={FileText} title="Standard operating procedures (10)" items={[
            { name: "All SOPs", desc: "DOCX and PDF for every SOP", files: [{ label: "ZIP", href: DL.sopZip }] },
            ...SOPS.map((s) => ({ name: `${s.code} · ${s.title}`, desc: s.purpose, files: [{ label: "DOCX", href: sopFile(s.code, s.slug, "docx") }, { label: "PDF", href: sopFile(s.code, s.slug, "pdf") }] })),
          ]} />
        </div>
      </Section>
    </>
  );
}
