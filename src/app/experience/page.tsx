import { Briefcase, ArrowRight } from "lucide-react";
import { PageHeader, Section } from "@/components/ui";
import { EXPERIENCE, TRANSLATION } from "@/data/profile";

export const metadata = { title: "Professional Experience" };

export default function Experience() {
  return (
    <>
      <PageHeader eyebrow="Professional experience" title="18 years of public service, plus client-facing call center and teaching experience" intro="Government experience described as transferable corporate competencies. No sensitive government information is included." />
      <Section>
        <ol className="relative space-y-8 border-l-2 border-navy-100 pl-6 sm:pl-8">
          {EXPERIENCE.map((e) => (
            <li key={e.role} className="relative">
              <span className="absolute -left-[37px] top-1 grid h-7 w-7 place-items-center rounded-full border-2 border-gold-400 bg-white sm:-left-[45px]"><Briefcase className="h-3.5 w-3.5 text-navy-700" /></span>
              <div className="card p-5 sm:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-sans text-lg font-semibold">{e.role}</h2>
                  <span className="text-sm text-mist-500">{e.period}</span>
                </div>
                <p className="text-sm font-medium text-gold-600">{e.org} · {e.location}</p>
                <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-navy-800">
                  {e.bullets.map((b) => <li key={b}>{b}</li>)}
                </ul>
                {e.note && <p className="mt-4 rounded-md bg-mist-100 px-3 py-2 text-xs text-mist-600">{e.note}</p>}
              </div>
            </li>
          ))}
        </ol>
      </Section>
      <section className="bg-white">
        <Section eyebrow="Competency translation" title="Government experience → corporate administrative competencies">
          <div className="grid gap-3 md:grid-cols-2">
            {TRANSLATION.map((t) => (
              <div key={t.gov} className="card flex items-start gap-3 p-4">
                <div className="flex-1 text-sm text-mist-600">{t.gov}</div>
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" aria-hidden />
                <div className="flex-1 text-sm font-semibold text-navy-800">{t.corp}</div>
              </div>
            ))}
          </div>
        </Section>
      </section>
    </>
  );
}
