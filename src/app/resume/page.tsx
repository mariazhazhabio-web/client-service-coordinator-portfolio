import { Download, FileText } from "lucide-react";
import { PageHeader, Section } from "@/components/ui";
import { PROFILE, CORE_COMPETENCIES, EXPERIENCE, EDUCATION, CREDENTIALS, TOOLS } from "@/data/profile";
import { DL } from "@/data/downloads";

export const metadata = { title: "Resume" };

export default function Resume() {
  return (
    <>
      <PageHeader eyebrow="Downloadable resume" title="ATS-friendly resume" intro="Single-column layout, standard headings, and no tables or graphics, so it parses cleanly in applicant tracking systems such as Workable. Edit the bracketed placeholders before submitting.">
        <div className="flex flex-wrap gap-3">
          <a href={DL.resumePdf} download className="btn-gold"><Download className="h-4 w-4" /> Resume (PDF)</a>
          <a href={DL.resumeDocx} download className="btn border border-white/30 text-white hover:bg-white/10"><FileText className="h-4 w-4" /> Resume (DOCX, editable)</a>
          <a href={DL.coverDocx} download className="btn border border-white/30 text-white hover:bg-white/10"><FileText className="h-4 w-4" /> Cover Letter (DOCX)</a>
          <a href={DL.coverPdf} download className="btn border border-white/30 text-white hover:bg-white/10"><Download className="h-4 w-4" /> Cover Letter (PDF)</a>
        </div>
      </PageHeader>
      <Section>
        <article className="card mx-auto max-w-3xl p-6 sm:p-10 text-[14px] leading-relaxed" aria-label="Resume preview">
          <header className="border-b border-mist-200 pb-4 text-center">
            <h2 className="text-2xl font-semibold">{PROFILE.name}</h2>
            <p className="mt-1 font-medium text-navy-700">{PROFILE.title}</p>
            <p className="mt-1 text-xs text-mist-600">{[PROFILE.location, PROFILE.email, PROFILE.phone, PROFILE.linkedin].filter(Boolean).join(" · ")}</p>
          </header>
          <h3 className="mt-5 font-sans text-xs font-bold uppercase tracking-widest text-gold-600">Professional Summary</h3>
          <p className="mt-1">{PROFILE.summary}</p>
          <h3 className="mt-5 font-sans text-xs font-bold uppercase tracking-widest text-gold-600">Core Competencies</h3>
          <p className="mt-1">{CORE_COMPETENCIES.join(" · ")}</p>
          <h3 className="mt-5 font-sans text-xs font-bold uppercase tracking-widest text-gold-600">Professional Experience</h3>
          {EXPERIENCE.map((e) => (
            <div key={e.role} className="mt-3">
              <p className="font-semibold">{e.role}, {e.org}</p>
              <p className="text-xs text-mist-500">{e.location} · {e.period}</p>
              <ul className="mt-1 list-disc pl-5">{e.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
            </div>
          ))}
          <h3 className="mt-5 font-sans text-xs font-bold uppercase tracking-widest text-gold-600">Education</h3>
          <ul className="mt-1 list-disc pl-5">{EDUCATION.map((e) => <li key={e.degree}>{e.degree}, {e.school}, {e.year}</li>)}</ul>
          <h3 className="mt-5 font-sans text-xs font-bold uppercase tracking-widest text-gold-600">Licenses &amp; Eligibility</h3>
          <ul className="mt-1 list-disc pl-5">{CREDENTIALS.map((c) => <li key={c.name}>{c.name}, {c.body}</li>)}</ul>
          <h3 className="mt-5 font-sans text-xs font-bold uppercase tracking-widest text-gold-600">Technical Skills</h3>
          <p className="mt-1">{TOOLS.join(", ")}</p>
          <h3 className="mt-5 font-sans text-xs font-bold uppercase tracking-widest text-gold-600">Portfolio</h3>
          <p className="mt-1">12 working client service demonstrations (CRM, onboarding, service request tracking, calendar, Excel reporting, PowerPoint, SOPs, automation) built with fictional data: {PROFILE.portfolioUrl}</p>
        </article>
      </Section>
    </>
  );
}
