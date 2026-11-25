import { GraduationCap, Award } from "lucide-react";
import { PageHeader, Section } from "@/components/ui";
import { EDUCATION, CREDENTIALS } from "@/data/profile";

export const metadata = { title: "Education & Qualifications" };

export default function Education() {
  return (
    <>
      <PageHeader eyebrow="Education & qualifications" title="Four degrees and four professional credentials" intro="A broad academic foundation in management, engineering, criminology, and education. Each one reinforces precision, procedure, integrity, and clear communication." />
      <Section title="Academic degrees">
        <div className="grid gap-4 md:grid-cols-2">
          {EDUCATION.map((e) => (
            <div key={e.degree} className="card flex gap-4 p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-navy-800 text-gold-300"><GraduationCap className="h-5 w-5" /></span>
              <div>
                <h3 className="font-sans font-semibold">{e.degree}</h3>
                <p className="text-sm text-mist-600">{e.school} · {e.year}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <section className="bg-white">
        <Section title="Professional qualifications" intro="Credentials are Philippine professional licenses and eligibility. They are not U.S. financial services licenses, and I make no claim to any financial services registration or certification.">
          <div className="grid gap-4 md:grid-cols-2">
            {CREDENTIALS.map((c) => (
              <div key={c.name} className="card p-5">
                <div className="flex items-center gap-3">
                  <Award className="h-6 w-6 text-gold-500" aria-hidden />
                  <h3 className="font-sans font-semibold">{c.name}</h3>
                </div>
                <p className="mt-1 text-xs text-mist-500">{c.body}</p>
                <p className="mt-3 text-sm"><span className="font-semibold text-navy-700">Relevance to this role: </span>{c.relevance}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-mist-500">Add license numbers or validity dates only if the employer requests them during verification. They are intentionally not published on this website.</p>
        </Section>
      </section>
    </>
  );
}
