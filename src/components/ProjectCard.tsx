import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Project } from "@/data/projects";
import { ICONS } from "./icons";

export default function ProjectCard({ p }: { p: Project }) {
  const Icon = ICONS[p.icon];
  return (
    <Link href={`/projects/${p.slug}`} className="card group flex flex-col p-5 transition hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-navy-50 text-navy-700 group-hover:bg-navy-800 group-hover:text-gold-300 transition-colors">
          {Icon && <Icon className="h-5 w-5" aria-hidden />}
        </span>
        <span className="text-xs font-semibold text-mist-400">Project {String(p.n).padStart(2, "0")}</span>
      </div>
      <h3 className="mt-4 font-sans text-base font-semibold text-navy-900">{p.title}</h3>
      <p className="mt-1 flex-1 text-sm text-mist-600">{p.short}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy-700">Case study &amp; live demo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
    </Link>
  );
}
