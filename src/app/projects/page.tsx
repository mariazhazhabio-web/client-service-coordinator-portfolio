import ProjectCard from "@/components/ProjectCard";
import { PageHeader, Section, DemoNotice } from "@/components/ui";
import { PROJECTS } from "@/data/projects";

export const metadata = { title: "Interactive Project Demonstrations" };

export default function Projects() {
  return (
    <>
      <PageHeader eyebrow="Interactive project demonstrations" title="12 working tools for client service administration" intro="Each project has a case study and a live demo. Data is fictional and saved only in your browser, so feel free to add, edit, and reset." />
      <Section>
        <DemoNotice />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p) => <ProjectCard key={p.slug} p={p} />)}
        </div>
      </Section>
    </>
  );
}
