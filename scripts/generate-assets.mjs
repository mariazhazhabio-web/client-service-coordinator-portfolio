/*
 * Generates every downloadable work sample into public/downloads:
 *   Excel workbook (formulas, filters, formatting, native charts), PowerPoint deck,
 *   Word + PDF application documents and SOPs, n8n workflow JSON, sample datasets, ZIPs.
 *
 * Run:  npm run generate      (requires Node 22.18+ / 23.6+ for TypeScript type stripping)
 * The output is committed to the repo, so Vercel builds don't need to run this.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ExcelJS from "exceljs";
import PptxGenJS from "pptxgenjs";
import archiver from "archiver";

import { buildDataset } from "../src/data/sample.ts";
import { PROFILE, CORE_COMPETENCIES, EXPERIENCE, EDUCATION, CREDENTIALS, TOOLS, TRANSLATION } from "../src/data/profile.ts";
import { PROJECTS } from "../src/data/projects.ts";
import { SOPS, INTERVIEW, SELF_INTRO, PLAN_30_60_90, REFERENCES_TEMPLATE, SKILLS_MATRIX, COVER_LETTER } from "../src/data/documents.ts";
import { AUTOMATIONS } from "../src/data/automations.ts";
import { buildDeck, deckInputFor } from "../src/data/deck.ts";
import { buildWorkbook, chartSpecs } from "../src/data/workbook.ts";
import { renderBoth } from "./lib/render-docs.mjs";
import { injectCharts } from "./lib/xlsx-charts.mjs";
import { buildN8n } from "./lib/n8n.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "downloads");
const dir = (...p) => { const d = path.join(OUT, ...p); fs.mkdirSync(d, { recursive: true }); return d; };
const log = (m) => console.log(`  ✓ ${m}`);
const DEMO_FOOTER = "Independent portfolio demonstration · Fictional data · Not affiliated with any financial firm";

fs.rmSync(OUT, { recursive: true, force: true });
const ds = buildDataset(new Date());
console.log(`Generating assets (dataset base date ${ds.base})…`);

/* ------------------------------------------------------------------ Excel */
{
  const wb = buildWorkbook(ExcelJS, ds);
  const raw = await wb.xlsx.writeBuffer();
  const withCharts = await injectCharts(Buffer.from(raw), chartSpecs(ds));
  fs.writeFileSync(path.join(dir("excel"), "Client-Service-Admin-Reporting-System.xlsx"), withCharts);
  log("Excel workbook (9 sheets + README, formulas, 3 native charts)");
}

/* ------------------------------------------------------------- PowerPoint */
{
  const pptx = buildDeck(new PptxGenJS(), deckInputFor(ds, ds.clients[2].id, "Maria Bio"));
  await pptx.writeFile({ fileName: path.join(dir("presentations"), "Client-Meeting-Presentation-Demo.pptx") });
  log("PowerPoint client meeting deck (12 slides)");
}

/* --------------------------------------------------------------- SOPs */
{
  const d = dir("sops");
  for (const s of SOPS) {
    const blocks = [
      { t: "title", text: s.title, sub: `${s.code} · Standard Operating Procedure · Client Service Administration` },
      { t: "table", head: ["Document", "Version", "Owner", "Effective date", "Review cycle"], rows: [[s.code, "1.0 (template)", "Client Service Coordinator", "[Effective date]", "Quarterly"]], widths: [0.14, 0.16, 0.28, 0.22, 0.2] },
      { t: "h1", text: "1. Purpose" }, { t: "p", text: s.purpose },
      { t: "h1", text: "2. Scope" }, { t: "p", text: s.scope },
      { t: "h1", text: "3. Responsibilities" }, { t: "table", head: ["Role", "Responsibility"], rows: s.responsibilities.map((r) => [r.role, r.duty]), widths: [0.3, 0.7] },
      { t: "h1", text: "4. Procedure" }, { t: "numbers", items: s.procedure },
      { t: "h1", text: "5. Quality Control" }, { t: "bullets", items: s.qc },
      { t: "h1", text: "6. Expected Outputs" }, { t: "bullets", items: s.outputs },
      { t: "h1", text: "Revision History" }, { t: "table", head: ["Version", "Date", "Change", "Approved by"], rows: [["1.0", "[Date]", "Initial template", "[Name / Title]"]], widths: [0.15, 0.2, 0.4, 0.25] },
      { t: "note", text: "Template SOP prepared as an independent portfolio demonstration. A practice would adapt it to its firm's policies, compliance requirements, and approved systems before use. This document makes no claim of regulatory compliance." },
    ];
    await renderBoth(blocks, path.join(d, `${s.code}-${s.slug}`), { footer: `${s.code} ${s.title} · ${DEMO_FOOTER}`, title: s.title });
  }
  log(`10 SOPs (DOCX + PDF)`);
}

/* ------------------------------------------------- Application documents */
const A = dir("application");
const contact = [PROFILE.location, PROFILE.email, PROFILE.phone, PROFILE.linkedin].filter(Boolean).join(" · ");
{
  // ATS resume: single column, standard headings, no tables
  const resume = [
    { t: "title", text: PROFILE.name, sub: PROFILE.title, center: true },
    { t: "p", text: contact, center: true, size: 9.5 },
    { t: "p", text: `Portfolio: ${PROFILE.portfolioUrl}`, center: true, size: 9.5 },
    { t: "h1", text: "Professional Summary" }, { t: "p", text: PROFILE.summary },
    { t: "h1", text: "Core Competencies" }, { t: "p", text: CORE_COMPETENCIES.join(" | ") },
    { t: "h1", text: "Professional Experience" },
    ...EXPERIENCE.flatMap((e) => [{ t: "h2", text: `${e.role}, ${e.org}` }, { t: "p", text: `${e.location} | ${e.period}`, italic: true, size: 9.5 }, { t: "bullets", items: e.bullets }]),
    { t: "h1", text: "Education" }, { t: "bullets", items: EDUCATION.map((e) => `${e.degree}, ${e.school}, ${e.year}`) },
    { t: "h1", text: "Licenses and Eligibility" }, { t: "bullets", items: CREDENTIALS.map((c) => `${c.name}, ${c.body}`) },
    { t: "h1", text: "Technical Skills" }, { t: "p", text: TOOLS.join(", ") },
    { t: "h1", text: "Portfolio Projects" }, { t: "p", text: "Built 12 working client service demonstrations with fictional data: CRM, client onboarding, service request tracker, post-meeting workflow, appointment calendar with time zone conversion, communication templates, Excel reporting workbook with KPI formulas, client meeting PowerPoint, document management, 10 SOPs, n8n workflow automation, and a performance dashboard." },
  ];
  await renderBoth(resume, path.join(A, "Maria-Bio-Resume-ATS"), { title: `${PROFILE.name} Resume` });

  const cover = [
    { t: "title", text: PROFILE.name, sub: `${PROFILE.title}\n${contact}` },
    { t: "p", text: COVER_LETTER.date },
    ...COVER_LETTER.to.map((l) => ({ t: "p", text: l })),
    { t: "spacer" },
    { t: "p", text: COVER_LETTER.greeting },
    ...COVER_LETTER.paragraphs.map((p) => ({ t: "p", text: p })),
    { t: "p", text: COVER_LETTER.closing }, { t: "spacer" }, { t: "p", text: PROFILE.name, bold: true },
  ];
  await renderBoth(cover, path.join(A, "Maria-Bio-Cover-Letter"), { title: "Cover Letter" });

  const profile = [
    { t: "title", text: PROFILE.name, sub: PROFILE.title },
    { t: "p", text: PROFILE.headline, bold: true, color: "112144" },
    { t: "p", text: PROFILE.subheading },
    { t: "kv", items: [["Location", PROFILE.location], ["Email", PROFILE.email], ["Phone", PROFILE.phone], ["Portfolio", PROFILE.portfolioUrl]].filter(([, v]) => v) },
    { t: "h1", text: "At a Glance" }, { t: "bullets", items: ["18 years of public service in administrative and operational management", "Call center customer service (2007–2008: phone, email, chat), plus online ESL teaching (2016)", "Master in Management (Public Administration) and three bachelor's degrees", "Licensed Professional Teacher · Registered Chemical Technician · Registered Criminologist · Civil Service Professional Eligibility"] },
    { t: "h1", text: "Core Strengths for Client Service Coordination" }, { t: "bullets", items: CORE_COMPETENCIES.slice(0, 8) },
    { t: "h1", text: "Transferable Experience" }, { t: "table", head: ["Public service", "Client service application"], rows: TRANSLATION.slice(0, 5).map((t) => [t.gov, t.corp]), widths: [0.5, 0.5] },
    { t: "note", text: "Transparent note: no prior financial services or Ameriprise platform experience. Committed to completing all required training." },
  ];
  await renderBoth(profile, path.join(A, "Maria-Bio-One-Page-Profile"), { title: "Professional Profile" });

  const matrix = [
    { t: "title", text: "Administrative Skills Matrix", sub: `${PROFILE.name} · Client Service Coordinator application` },
    { t: "p", text: "Job requirements from the Client Service Coordinator posting, mapped to evidence from my experience and portfolio. Levels are self-assessed." },
    { t: "table", head: ["Job requirement", "Evidence", "Level"], rows: SKILLS_MATRIX.map((m) => [m.req, m.evidence, m.level]), widths: [0.38, 0.42, 0.2] },
    { t: "h1", text: "Skill Proficiency (self-assessed, 1–5)" },
    { t: "table", head: ["Skill", "Level"], rows: [["Phone & email client communication", "5"], ["Application & form processing", "5"], ["Confidential records management", "5"], ["Monitoring & status reporting", "5"], ["SOP & policy writing", "5"], ["Microsoft Excel", "4"], ["Microsoft PowerPoint", "4"], ["Calendar coordination", "4"], ["CRM platforms (general)", "3"], ["Workflow automation (n8n)", "3"]], widths: [0.75, 0.25] },
  ];
  await renderBoth(matrix, path.join(A, "Administrative-Skills-Matrix"), { title: "Skills Matrix" });

  const summary = [
    { t: "title", text: "Portfolio Project Summary", sub: `${PROFILE.name} · 12 working demonstrations with fictional data` },
    { t: "note", text: "All projects are independent portfolio demonstrations using fictional data. Expected benefits are design goals, not measured results. Not affiliated with any financial firm." },
    { t: "table", head: ["#", "Project", "Demonstrates", "Sample file"], rows: PROJECTS.map((p) => [String(p.n), p.title, p.responsibilities[0], p.download.label]), widths: [0.06, 0.3, 0.4, 0.24] },
    ...PROJECTS.flatMap((p) => [
      { t: "h2", text: `${p.n}. ${p.title}` },
      { t: "p", text: `Problem: ${p.problem}` },
      { t: "p", text: `Solution: ${p.solution}` },
      { t: "p", text: `Key features: ${p.features.join("; ")}.`, size: 9.5 },
      { t: "p", text: `Live demo: ${PROFILE.portfolioUrl}/projects/${p.slug}`, italic: true, size: 9 },
    ]),
  ];
  await renderBoth(summary, path.join(A, "Portfolio-Project-Summary"), { title: "Portfolio Project Summary", footer: DEMO_FOOTER });

  const topics = Array.from(new Set(INTERVIEW.map((q) => q.topic)));
  const interview = [
    { t: "title", text: "Interview Preparation Guide", sub: "Client Service Coordinator · Personalized questions and suggested answers" },
    { t: "h1", text: "Before the Interview" },
    { t: "bullets", items: [
      "Re-read the job posting: Client Service Coordinator for MethodM Wealth (a private wealth advisory practice of Ameriprise Financial Services, LLC), recruited by The Jambalaya Group.",
      "Important: the posting says remote candidates must have relevant Ameriprise experience, and that prior Ameriprise experience is strongly preferred. Be ready to address this honestly. Focus on transferable skills, fast learning, and your willingness to complete training. Ask whether they would consider candidates without that experience.",
      "The posting lists the role as Remote/Hybrid in the United States. Confirm early whether they accept a contractor or employee based in the Philippines, and how hours and payroll would work.",
      "Prepare 3–5 real STAR stories (Situation, Task, Action, Result) from public service and the call center. Never invent achievements or numbers.",
      "Test your internet, camera, microphone, and backup connection. Use a quiet, private room.",
      "Have your portfolio open and ready to share: CRM, Service Request Tracker, Excel workbook, and SOPs.",
    ] },
    { t: "h1", text: "60-Second Self-Introduction" }, { t: "p", text: SELF_INTRO },
    ...topics.flatMap((topic) => [
      { t: "h1", text: topic },
      ...INTERVIEW.map((q, i) => ({ ...q, i })).filter((q) => q.topic === topic).flatMap((q) => [{ t: "h2", text: `Q${q.i + 1}. ${q.q}` }, { t: "p", text: q.a }]),
    ]),
    { t: "h1", text: "STAR Story Worksheet" },
    { t: "table", head: ["Story", "Situation", "Task", "Action", "Result"], rows: ["Handled a difficult person", "Managed competing deadlines", "Improved a process", "Protected confidential information", "Coordinated across offices"].map((s) => [s, "", "", "", ""]), widths: [0.24, 0.19, 0.19, 0.19, 0.19] },
    { t: "h1", text: "Closing the Interview" },
    { t: "bullets", items: ["Thank them and restate your interest in one sentence.", "Ask about next steps and the timeline.", "Send a thank-you email within 24 hours that mentions one specific topic you discussed."] },
  ];
  await renderBoth(interview, path.join(A, "Interview-Preparation-Guide"), { title: "Interview Preparation Guide" });

  const refs = [
    { t: "title", text: "Professional References", sub: [PROFILE.name, PROFILE.email, PROFILE.phone].filter(Boolean).join(" · ") },
    { t: "note", text: "Template: replace each placeholder with real details only after the reference agrees to be contacted." },
    ...REFERENCES_TEMPLATE.flatMap((r, i) => [{ t: "h2", text: `Reference ${i + 1}` }, { t: "kv", items: [["Name", r.name], ["Title", r.title], ["Organization", r.org], ["Relationship", r.relationship], ["Phone", r.phone], ["Email", r.email]] }]),
  ];
  await renderBoth(refs, path.join(A, "Professional-References-Template"), { title: "Professional References" });

  const plan = [
    { t: "title", text: "30-60-90-Day Work Plan", sub: `${PROFILE.name} · Client Service Coordinator` },
    { t: "p", text: "A practical plan to learn the practice's systems, take ownership of core client service tasks, and add value through careful, approved improvements." },
    ...PLAN_30_60_90.flatMap((p) => [{ t: "h1", text: p.phase }, { t: "bullets", items: p.items }]),
    { t: "h1", text: "How I Will Measure Progress" },
    { t: "table", head: ["Measure", "Purpose"], rows: [["Requests acknowledged within 1 business day", "Responsiveness"], ["Post-meeting notes logged within 24 hours", "Follow-through"], ["Outstanding items followed up on schedule", "Proactivity"], ["Error-free paperwork submissions", "Accuracy"], ["Weekly report delivered on time", "Reliability"]], widths: [0.6, 0.4] },
    { t: "note", text: "Targets would be agreed with my supervisor. This plan does not assume any specific firm systems." },
  ];
  await renderBoth(plan, path.join(A, "30-60-90-Day-Work-Plan"), { title: "30-60-90-Day Plan" });
  log("Application documents: resume, cover letter, profile, skills matrix, project summary, interview guide, references, 30-60-90 plan (DOCX + PDF)");
}

/* ---------------------------------------------------------------- n8n */
{
  const d = dir("n8n");
  for (const a of AUTOMATIONS) fs.writeFileSync(path.join(d, a.file), JSON.stringify(buildN8n(a), null, 2));
  fs.writeFileSync(path.join(d, "README.txt"), [
    "n8n WORKFLOW TEMPLATES: PORTFOLIO DEMONSTRATION",
    "",
    "Import: n8n > Workflows > Import from File > choose a .json file.",
    "All credentials are placeholders (MOCK_*). Replace them with your own TEST accounts.",
    "All YOUR_TEST_* IDs must be replaced with test Google Sheets, Calendars, Drive folders, and Trello lists.",
    "Every Gmail node is DISABLED so importing never sends email.",
    "Each workflow includes 'Test: run manually' + 'Mock test data' nodes for safe testing.",
    "Free options: self-host n8n with Docker (docker run -it --rm -p 5678:5678 n8nio/n8n) or with npx n8n.",
    "",
    "Fictional data only. Not affiliated with any financial firm. Do not connect real client data.",
  ].join("\n"));
  log("7 n8n workflow JSON files");
}

/* ------------------------------------------------------------ datasets */
{
  const d = dir("data");
  fs.writeFileSync(path.join(d, "sample-dataset.json"), JSON.stringify({ _notice: "FICTIONAL DATA for portfolio demonstration only.", ...ds }, null, 2));
  const csv = (rows) => { const h = Object.keys(rows[0]); return [h.join(","), ...rows.map((r) => h.map((k) => { const v = r[k]; const s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(","))].join("\n"); };
  const tables = {
    clients: ds.clients.map(({ tasks, interactions, ...c }) => ({ ...c, openTasks: tasks.filter((t) => !t.done).length, interactions: interactions.length })),
    service_requests: ds.requests.map((r) => ({ ...r, pending: r.pending.join("; "), followUps: r.followUps.length })),
    appointments: ds.appointments, documents: ds.documents, monthly_stats: ds.months,
    meeting_actions: ds.meetings.flatMap((m) => m.actions.map((a) => ({ meetingId: m.id, client: m.clientName, date: m.date, ...a, docs: a.docs.join("; ") }))),
  };
  const csvDir = path.join(d, "csv");
  fs.mkdirSync(csvDir, { recursive: true });
  for (const [k, rows] of Object.entries(tables)) fs.writeFileSync(path.join(csvDir, `${k}.csv`), csv(rows));
  log("Sample datasets (JSON + 6 CSV)");
}

/* ---------------------------------------------------------------- ZIPs */
function zip(target, entries) {
  return new Promise((resolve, reject) => {
    const out = fs.createWriteStream(target);
    const ar = archiver("zip", { zlib: { level: 9 } });
    out.on("close", resolve);
    ar.on("error", reject);
    ar.pipe(out);
    for (const [src, name] of entries) {
      if (fs.statSync(src).isDirectory()) ar.directory(src, name);
      else ar.file(src, { name });
    }
    ar.finalize();
  });
}
const filesIn = (d, ext) => fs.readdirSync(d).filter((f) => !ext || ext.some((e) => f.endsWith(e))).map((f) => [path.join(d, f), f]);
await zip(path.join(OUT, "sops", "Administrative-SOPs.zip"), filesIn(path.join(OUT, "sops"), [".docx", ".pdf"]));
await zip(path.join(OUT, "n8n", "n8n-workflow-templates.zip"), filesIn(path.join(OUT, "n8n"), [".json", ".txt"]));
await zip(path.join(OUT, "data", "sample-datasets-csv.zip"), filesIn(path.join(OUT, "data", "csv")));
await zip(path.join(OUT, "application", "Application-Documents.zip"), filesIn(path.join(OUT, "application"), [".docx", ".pdf"]));
await zip(path.join(OUT, "Complete-Work-Samples.zip"), [
  [path.join(OUT, "excel"), "01-Excel"], [path.join(OUT, "presentations"), "02-PowerPoint"], [path.join(OUT, "sops"), "03-SOPs"],
  [path.join(OUT, "n8n"), "04-n8n-Workflows"], [path.join(OUT, "data"), "05-Sample-Data"], [path.join(OUT, "application"), "06-Application-Documents"],
]);
log("ZIP packages");
console.log("Done.");
