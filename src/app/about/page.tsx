import Link from "next/link";
import { Heart, Target, Compass, Globe2 } from "lucide-react";
import Headshot from "@/components/Headshot";
import { PageHeader, Section } from "@/components/ui";
import { PROFILE } from "@/data/profile";

export const metadata = { title: "About Me" };

export default function About() {
  return (
    <>
      <PageHeader eyebrow="About me" title="An organized, dependable partner for advisors and their clients" intro={PROFILE.title} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
          <div className="mx-auto w-full max-w-xs">
            <Headshot />
            <dl className="card mt-8 space-y-3 p-5 text-sm">
              <div><dt className="label">Location</dt><dd>{PROFILE.location}</dd></div>
              <div><dt className="label">Availability</dt><dd>Part-time or flexible hours; start date subject to agreement</dd></div>
              <div><dt className="label">Work setup</dt><dd>Remote, from the Philippines</dd></div>
            </dl>
          </div>
          <div className="space-y-6 text-[15px] leading-relaxed text-navy-800">
            <p className="text-lg">
              I am <strong>Maria Zha-Zha Cornillez Bio</strong>, an administrative and operations professional from the Philippines with <strong>18 years of public service experience</strong>.
            </p>
            <p>
              For most of my career I have kept offices organized and moving. I received and processed applications, checked requirements, maintained confidential records and databases, prepared official documents and reports, monitored pending transactions, and coordinated meetings and activities. I also contributed to plans and policy development, which taught me to write clear procedures that others can follow.
            </p>
            <p>
              Before joining public service, I worked in a <strong>call center</strong> (2007–2008), helping customers by phone, email, and chat. In 2016 I also taught English online as an <strong>ESL teacher</strong>. Both roles sharpened my communication: listening carefully, explaining things simply, staying calm with frustrated people, and documenting every interaction.
            </p>
            <p>
              My education spans management, engineering, criminology, and education. I hold a <strong>Master in Management (Public Administration)</strong> and am a <strong>Licensed Professional Teacher</strong>, <strong>Registered Chemical Technician</strong>, and <strong>Registered Criminologist</strong>, with <strong>Civil Service Professional Eligibility</strong>. Each one reinforced the habits a financial advisory practice depends on: accuracy, procedure, integrity, and discretion.
            </p>
            <p>
              I have not worked in financial services. I am transitioning into client service administration because it fits how I already work. This portfolio shows, with working tools and fictional data, exactly how I would support advisors and clients.
            </p>
            <div className="grid gap-4 pt-2 sm:grid-cols-2">
              {[
                { icon: Heart, t: "Client-first", d: "Clients should always know what happens next." },
                { icon: Target, t: "Accuracy", d: "Check twice, submit once." },
                { icon: Compass, t: "Integrity", d: "Follow procedure, protect information, escalate early." },
                { icon: Globe2, t: "Remote-ready", d: "Self-managed, responsive, and comfortable across time zones." },
              ].map(({ icon: I, t, d }) => (
                <div key={t} className="card flex gap-3 p-4">
                  <I className="h-5 w-5 shrink-0 text-gold-500" aria-hidden />
                  <div><p className="font-semibold">{t}</p><p className="text-sm text-mist-600">{d}</p></div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/experience" className="btn-primary">Professional Experience</Link>
              <Link href="/projects" className="btn-outline">Interactive Demonstrations</Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
