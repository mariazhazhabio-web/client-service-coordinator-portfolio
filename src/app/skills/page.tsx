import Link from "next/link";
import { PageHeader, Section, Badge } from "@/components/ui";
import { SKILL_GROUPS, TOOLS } from "@/data/profile";
import { SKILLS_MATRIX } from "@/data/documents";
import { DL } from "@/data/downloads";

export const metadata = { title: "Skills & Tools" };

function Dots({ n }: { n: number }) {
  return (
    <span className="flex gap-1" aria-label={`${n} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => <span key={i} className={`h-2 w-5 rounded-full ${i <= n ? "bg-navy-700" : "bg-mist-200"}`} />)}
    </span>
  );
}

export default function Skills() {
  return (
    <>
      <PageHeader eyebrow="Skills & tools" title="Practical skills for client service administration" intro="Self-assessed levels based on experience. Tool levels reflect general proficiency. I will learn the practice's specific CRM and financial services platforms." />
      <Section>
        <div className="grid gap-5 md:grid-cols-2">
          {SKILL_GROUPS.map((g) => (
            <div key={g.group} className="card p-5">
              <h2 className="font-sans text-base font-semibold">{g.group}</h2>
              <ul className="mt-4 space-y-3">
                {g.skills.map((s) => (
                  <li key={s.name} className="flex items-center justify-between gap-4 text-sm"><span>{s.name}</span><Dots n={s.level} /></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <h2 className="mt-12 text-2xl font-semibold">Tools &amp; platforms</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {TOOLS.map((t) => <span key={t} className="rounded-lg border border-mist-200 bg-white px-3 py-1.5 text-sm">{t}</span>)}
        </div>
      </Section>
      <section className="bg-white">
        <Section eyebrow="Skills matrix" title="Job requirements vs. my evidence" intro="An honest mapping, including the gap: I have no prior Ameriprise or financial services platform experience.">
          <div className="overflow-x-auto rounded-xl border border-mist-200">
            <table className="w-full min-w-[640px]">
              <thead className="bg-mist-100"><tr><th className="th">Job requirement</th><th className="th">Evidence</th><th className="th">Level</th></tr></thead>
              <tbody className="divide-y divide-mist-100">
                {SKILLS_MATRIX.map((m) => (
                  <tr key={m.req}>
                    <td className="td font-medium">{m.req}</td>
                    <td className="td text-mist-600">{m.evidence}</td>
                    <td className="td"><Badge tone={m.level.startsWith("Gap") ? "red" : m.level.startsWith("Developing") ? "amber" : "green"}>{m.level}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a className="btn-outline" href={DL.matrixDocx} download>Skills Matrix (DOCX)</a>
            <a className="btn-outline" href={DL.matrixPdf} download>Skills Matrix (PDF)</a>
            <Link className="btn-primary" href="/projects">See the evidence in the demos</Link>
          </div>
        </Section>
      </section>
    </>
  );
}
