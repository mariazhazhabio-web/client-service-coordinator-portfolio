import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Download, MonitorPlay, CheckCircle2 } from "lucide-react";
import { PageHeader, Section, DemoNotice } from "@/components/ui";
import { PROJECTS } from "@/data/projects";
import DemoLoader from "@/demos/DemoLoader";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = PROJECTS.find((x) => x.slug === slug);
  return { title: p ? `Project ${p.n}: ${p.title}` : "Project" };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = PROJECTS.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const p = PROJECTS[i];
  const prev = PROJECTS[(i + PROJECTS.length - 1) % PROJECTS.length];
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  const blocks: [string, string][] = [["Business problem", p.problem], ["Project objective", p.objective], ["Proposed solution", p.solution]];

  return (
    <>
      <PageHeader eyebrow={`Project ${String(p.n).padStart(2, "0")} · Case study`} title={p.title} intro={p.short}>
        <div className="flex flex-wrap gap-3">
          <a href="#demo" className="btn-gold"><MonitorPlay className="h-4 w-4" /> Live Demo</a>
          <a href={p.download.href} download className="btn border border-white/30 text-white hover:bg-white/10"><Download className="h-4 w-4" /> Download Sample: {p.download.label}</a>
        </div>
      </PageHeader>

      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          {blocks.map(([h, t]) => (
            <div key={h} className="card p-5">
              <p className="eyebrow">{h}</p>
              <p className="mt-2 text-sm leading-relaxed">{t}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="card p-5">
            <p className="eyebrow">Administrative workflow</p>
            <ol className="mt-3 space-y-2">
              {p.workflow.map((w, k) => (
                <li key={w} className="flex gap-3 text-sm"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy-800 text-xs font-semibold text-gold-300">{k + 1}</span><span className="pt-0.5">{w}</span></li>
              ))}
            </ol>
          </div>
          <div className="card p-5">
            <p className="eyebrow">Functional features</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {p.features.map((f) => <li key={f} className="flex gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{f}</li>)}
            </ul>
          </div>
          <div className="card p-5">
            <p className="eyebrow">Tools &amp; technologies</p>
            <div className="mt-3 flex flex-wrap gap-2">{p.tools.map((t) => <span key={t} className="rounded-md bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-700">{t}</span>)}</div>
            <p className="eyebrow mt-6">Relevant job responsibilities</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{p.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul>
          </div>
          <div className="card p-5">
            <p className="eyebrow">Expected business benefits</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">{p.benefits.map((b) => <li key={b}>{b}</li>)}</ul>
            <p className="mt-4 rounded-md bg-mist-100 px-3 py-2 text-xs text-mist-600">These are design goals of the demonstration, not measured or achieved results.</p>
          </div>
        </div>
      </Section>

      <section id="demo" className="scroll-mt-16 border-y border-mist-200 bg-white">
        <div className="container-x py-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Live demo</p>
              <h2 className="text-2xl font-semibold">{p.title}</h2>
            </div>
            <a href={p.download.href} download className="btn-outline btn-sm"><Download className="h-4 w-4" /> {p.download.label}</a>
          </div>
          <DemoNotice />
          <div className="mt-6"><DemoLoader slug={p.slug} /></div>
        </div>
      </section>

      <div className="container-x flex flex-wrap justify-between gap-3 py-8">
        <Link href={`/projects/${prev.slug}`} className="btn-ghost"><ArrowLeft className="h-4 w-4" /> {prev.title}</Link>
        <Link href={`/projects/${next.slug}`} className="btn-ghost">{next.title} <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </>
  );
}
