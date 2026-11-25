import Link from "next/link";
import { ArrowRight, Download, Mail, MonitorPlay, CheckCircle2, ShieldCheck, Clock, FileCheck2 } from "lucide-react";
import Headshot from "@/components/Headshot";
import ProjectCard from "@/components/ProjectCard";
import { Section } from "@/components/ui";
import { PROFILE, CORE_COMPETENCIES, TRANSLATION } from "@/data/profile";
import { PROJECTS } from "@/data/projects";
import { DL } from "@/data/downloads";

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" aria-hidden />
        <div className="absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-gold-500/10 blur-3xl" aria-hidden />
        <div className="container-x relative grid items-center gap-10 py-16 lg:grid-cols-[1.4fr_1fr] lg:py-24">
          <div className="animate-fade-up">
            <p className="eyebrow text-gold-300">Client Service Coordinator · Application Portfolio</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl lg:text-[3.4rem]">{PROFILE.headline}</h1>
            <p className="mt-5 max-w-2xl text-lg text-navy-100">{PROFILE.subheading}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#overview" className="btn-gold">Explore My Portfolio <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/projects" className="btn border border-white/30 text-white hover:bg-white/10"><MonitorPlay className="h-4 w-4" /> View Interactive Demonstrations</Link>
              <a href={DL.resumePdf} download className="btn border border-white/30 text-white hover:bg-white/10"><Download className="h-4 w-4" /> Download My Resume</a>
              <Link href="/contact" className="btn border border-white/30 text-white hover:bg-white/10"><Mail className="h-4 w-4" /> Contact Me</Link>
            </div>
            <p className="mt-6 text-xs text-navy-300">Independent portfolio demonstration. Not affiliated with or endorsed by Ameriprise Financial or any financial firm. All demo data is fictional.</p>
          </div>
          <div className="mx-auto w-full max-w-xs lg:max-w-sm">
            <Headshot />
            <div className="mt-6 text-center">
              <p className="font-serif text-xl">{PROFILE.name}</p>
              <p className="mt-1 text-sm text-navy-200">{PROFILE.title}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 bg-navy-900/60">
          <dl className="container-x grid grid-cols-2 gap-6 py-6 md:grid-cols-4">
            {PROFILE.stats.map((s) => (
              <div key={s.label}>
                <dt className="text-xs uppercase tracking-wide text-navy-300">{s.label}</dt>
                <dd className="font-serif text-3xl text-gold-300">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div id="overview" className="scroll-mt-16" />
      <Section eyebrow="What I bring" title="Administrative support built on accuracy, discretion, and follow-through" intro={PROFILE.summary}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: FileCheck2, t: "Accurate paperwork", d: "Applications and forms checked for completeness before they move forward." },
            { icon: Clock, t: "Proactive follow-up", d: "Outstanding items tracked with owners and dates, so clients never have to chase." },
            { icon: ShieldCheck, t: "Confidentiality", d: "18 years handling confidential records with integrity and discretion." },
            { icon: CheckCircle2, t: "Organized operations", d: "Calendars, records, reports, and SOPs that keep the practice running smoothly." },
          ].map(({ icon: I, t, d }) => (
            <div key={t} className="card p-5">
              <I className="h-6 w-6 text-gold-500" aria-hidden />
              <h3 className="mt-3 font-sans font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-mist-600">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {CORE_COMPETENCIES.map((c) => (
            <span key={c} className="rounded-full border border-navy-100 bg-white px-3 py-1 text-sm text-navy-700">{c}</span>
          ))}
        </div>
      </Section>

      <section className="bg-white">
        <Section eyebrow="Transferable experience" title="How my public service work translates to client service" intro="My background is in government administration, not financial services. The skills are the same: process applications accurately, protect confidential records, communicate clearly, and follow up.">
          <div className="overflow-x-auto rounded-xl border border-mist-200">
            <table className="w-full text-sm">
              <thead className="bg-navy-900 text-left text-white">
                <tr><th className="px-4 py-3 font-semibold">Public service experience</th><th className="px-4 py-3 font-semibold">Client Service Coordinator application</th></tr>
              </thead>
              <tbody>
                {TRANSLATION.slice(0, 6).map((t, i) => (
                  <tr key={t.gov} className={i % 2 ? "bg-mist-50" : "bg-white"}>
                    <td className="px-4 py-3 text-mist-600">{t.gov}</td>
                    <td className="px-4 py-3 font-medium text-navy-800">{t.corp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href="/experience" className="btn-outline mt-6">See full experience <ArrowRight className="h-4 w-4" /></Link>
        </Section>
      </section>

      <Section eyebrow="12 working demonstrations" title="Interactive projects mapped to the job description" intro="Each project is a working tool with realistic fictional data. It is not a screenshot. Open a demo to add records, filter, calculate, and export.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p) => <ProjectCard key={p.slug} p={p} />)}
        </div>
      </Section>

      <section className="container-x">
        <div className="card flex flex-col items-start justify-between gap-6 bg-gradient-to-br from-navy-800 to-navy-950 p-8 text-white md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-semibold">Ready to support your advisors and clients</h2>
            <p className="mt-2 max-w-2xl text-navy-100">Download my resume, cover letter, and work samples, including Excel, PowerPoint, Word SOPs, and n8n workflows, or get in touch to schedule a conversation.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/application" className="btn-gold">Application Kit</Link>
            <Link href="/contact" className="btn border border-white/30 text-white hover:bg-white/10">Contact Me</Link>
          </div>
        </div>
      </section>
    </>
  );
}
