import { Download, Package } from "lucide-react";
import { PageHeader, Section } from "@/components/ui";
import { DL } from "@/data/downloads";
import { PLAN_30_60_90, SELF_INTRO, REFERENCES_TEMPLATE } from "@/data/documents";
import InterviewPrep from "./InterviewPrep";

export const metadata = { title: "Application Kit" };

const DOCS = [
  { name: "ATS-friendly resume", files: [["DOCX", DL.resumeDocx], ["PDF", DL.resumePdf]] },
  { name: "Cover letter (tailored)", files: [["DOCX", DL.coverDocx], ["PDF", DL.coverPdf]] },
  { name: "One-page professional profile", files: [["DOCX", DL.profileDocx], ["PDF", DL.profilePdf]] },
  { name: "Administrative skills matrix", files: [["DOCX", DL.matrixDocx], ["PDF", DL.matrixPdf]] },
  { name: "Portfolio project summary", files: [["DOCX", DL.summaryDocx], ["PDF", DL.summaryPdf]] },
  { name: "Interview preparation guide", files: [["DOCX", DL.interviewDocx], ["PDF", DL.interviewPdf]] },
  { name: "Professional references template", files: [["DOCX", DL.referencesDocx], ["PDF", DL.referencesPdf]] },
  { name: "30-60-90-day work plan", files: [["DOCX", DL.planDocx], ["PDF", DL.planPdf]] },
];

export default function Application() {
  return (
    <>
      <PageHeader eyebrow="Application kit" title="Job application documents & interview preparation" intro="Tailored to the Client Service Coordinator role. My transferable skills are highlighted honestly, with no claim of prior Ameriprise or financial advisory experience. Replace every [bracketed placeholder] before sending.">
        <a href={DL.applicationZip} download className="btn-gold"><Package className="h-4 w-4" /> Download all application documents (ZIP)</a>
      </PageHeader>
      <Section title="Documents">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DOCS.map((d) => (
            <div key={d.name} className="card flex flex-col p-4">
              <p className="flex-1 text-sm font-semibold">{d.name}</p>
              <div className="mt-3 flex gap-2">
                {d.files.map(([l, h]) => <a key={h} href={h} download className="btn-outline btn-sm"><Download className="h-3.5 w-3.5" />{l}</a>)}
              </div>
            </div>
          ))}
        </div>
      </Section>
      <section className="bg-white">
        <Section eyebrow="Interview preparation" title="60-second self-introduction">
          <blockquote className="card border-l-4 border-l-gold-400 p-6 text-[15px] leading-relaxed text-navy-800">{SELF_INTRO}</blockquote>
          <p className="mt-2 text-xs text-mist-500">About 150 words, roughly 60 seconds at a calm speaking pace. Practice it aloud and adjust the wording to sound natural.</p>
        </Section>
        <Section title="Interview questions with suggested answers" intro="Suggested answers are based on your stated background. Bracketed answers need your own real STAR example (Situation, Task, Action, Result). Never invent achievements.">
          <InterviewPrep />
        </Section>
      </section>
      <Section title="30-60-90-day work plan">
        <div className="grid gap-4 md:grid-cols-3">
          {PLAN_30_60_90.map((p, i) => (
            <div key={p.phase} className="card overflow-hidden">
              <div className={`px-5 py-3 text-white ${["bg-navy-700", "bg-navy-800", "bg-navy-950"][i]}`}><p className="font-semibold">{p.phase}</p></div>
              <ul className="list-disc space-y-1.5 p-5 pl-9 text-sm">{p.items.map((it) => <li key={it}>{it}</li>)}</ul>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Professional references template">
        <div className="overflow-x-auto rounded-xl border border-mist-200 bg-white">
          <table className="w-full min-w-[720px]">
            <thead className="bg-mist-100"><tr>{["Name", "Title", "Organization", "Relationship", "Phone", "Email"].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-mist-100">
              {REFERENCES_TEMPLATE.map((r, i) => <tr key={i}>{[r.name, r.title, r.org, r.relationship, r.phone, r.email].map((v, k) => <td key={k} className="td text-mist-600">{v}</td>)}</tr>)}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-mist-500">Always ask your references for permission first and tell them about the role.</p>
      </Section>
    </>
  );
}
