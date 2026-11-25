"use client";
import { useMemo, useState } from "react";
import { Folder, FolderOpen, FileText, Upload, Search, ShieldCheck, Lock, History, CheckCircle2, XCircle } from "lucide-react";
import { Badge, statusTone } from "@/components/ui";
import { useLocalState } from "@/lib/hooks";
import { cn, fmtDate, todayIso, exportCsv } from "@/lib/utils";
import type { DocRecord } from "@/data/sample";
import { useDataset, ResetButton } from "./shared";

type Role = "Client Service Coordinator" | "Financial Advisor" | "Operations Lead" | "Read-only Auditor";
type Audit = { ts: string; user: Role; action: string; target: string; result: "Allowed" | "Denied" };
const ROLES: Role[] = ["Client Service Coordinator", "Financial Advisor", "Operations Lead", "Read-only Auditor"];
const CATEGORIES = ["Identification (mock)", "Application Forms", "Account Maintenance Forms", "Meeting Notes", "Correspondence", "Statements (mock)"];
const CODES: Record<string, string> = { "Identification (mock)": "IDENT", "Application Forms": "APPFORM", "Account Maintenance Forms": "MAINT", "Meeting Notes": "MTGNOTE", Correspondence: "CORRESP", "Statements (mock)": "STMT" };
const REQUIRED = ["Identification (mock)", "Application Forms", "Correspondence"];

/* SIMULATED role-based access matrix (concept demonstration, not a security control) */
const CAN = {
  view: (r: Role, d: DocRecord) => r === "Operations Lead" || r === "Read-only Auditor" || (r === "Financial Advisor" ? d.access !== "Ops Only" : d.access !== "Advisor Only"),
  upload: (r: Role) => r === "Client Service Coordinator" || r === "Operations Lead",
  status: (r: Role) => r !== "Read-only Auditor",
  archive: (r: Role) => r === "Operations Lead",
};

export default function DocumentDemo() {
  const ds = useDataset();
  const today = todayIso();
  const folders = ds.clients.slice(0, 10);
  const [docs, setDocs, resetDocs] = useLocalState<DocRecord[]>("dms-docs", () => ds.documents);
  const [audit, setAudit, resetAudit] = useLocalState<Audit[]>("dms-audit", () => []);
  const [role, setRole] = useState<Role>("Client Service Coordinator");
  const [folder, setFolder] = useState<string | "ALL">(folders[0].id);
  const [q, setQ] = useState("");
  const [catF, setCatF] = useState("All");
  const [showArchived, setShowArchived] = useState(false);
  const [up, setUp] = useState({ category: CATEGORIES[1], original: "" });
  const [historyOf, setHistoryOf] = useState<string | null>(null);

  const log = (action: string, target: string, result: Audit["result"] = "Allowed") => setAudit((a) => [{ ts: new Date().toLocaleString("en-US"), user: role, action, target, result }, ...a].slice(0, 200));
  const client = folders.find((c) => c.id === folder);
  const inScope = docs.filter((d) => (folder === "ALL" || d.clientId === folder) && (showArchived || d.status !== "Archived"));
  const list = useMemo(() => inScope.filter((d) => (catF === "All" || d.category === catF) && (!q || `${d.fileName} ${d.clientName} ${d.category}`.toLowerCase().includes(q.toLowerCase()))), [inScope, catF, q]);

  const nameFor = (clientName: string, category: string, version: number) => {
    const [first, ...rest] = clientName.split(" ");
    return `${rest.join("").toUpperCase()}_${first}_${CODES[category]}_${today.replace(/-/g, "")}_v${version}.pdf`;
  };
  const latestVersion = (cid: string, category: string) => Math.max(0, ...docs.filter((d) => d.clientId === cid && d.category === category).map((d) => d.version));

  function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!client) { alert("Select a client folder first."); return; }
    if (!CAN.upload(role)) { log("Upload attempt", `${client.name} / ${up.category}`, "Denied"); return; }
    const v = latestVersion(client.id, up.category) + 1;
    const fileName = nameFor(client.name, up.category, v);
    setDocs((ds0) => [
      { id: `DOC-${String(ds0.length + 1).padStart(4, "0")}-${Date.now() % 1000}`, clientId: client.id, clientName: client.name, category: up.category, fileName, status: "Received", version: v, uploaded: today, uploadedBy: role, access: up.category.startsWith("Identification") ? "Ops Only" : up.category === "Meeting Notes" ? "Advisor Only" : "Advisor + Ops" },
      ...ds0.map((d) => (d.clientId === client.id && d.category === up.category && d.status !== "Archived" ? { ...d, status: "Archived" as const } : d)),
    ]);
    log(`Uploaded (simulated)${up.original ? ` "${up.original}"` : ""} → renamed`, fileName);
    if (v > 1) log("Previous version auto-archived", `${client.name} / ${up.category} v${v - 1}`);
    setUp({ ...up, original: "" });
  }
  function open(d: DocRecord) {
    if (!CAN.view(role, d)) { log("View attempt", d.fileName, "Denied"); return; }
    log("Viewed (simulated preview)", d.fileName);
    alert(`SIMULATED PREVIEW\n\n${d.fileName}\nCategory: ${d.category}\nStatus: ${d.status} · v${d.version}\n\nNo real file exists. This is a portfolio demonstration.`);
  }
  function setStatus(d: DocRecord, s: DocRecord["status"]) {
    if (!CAN.status(role) || (s === "Archived" && !CAN.archive(role))) { log(`Status change to ${s}`, d.fileName, "Denied"); return; }
    setDocs((x) => x.map((y) => (y.id === d.id ? { ...y, status: s } : y)));
    log(`Status: ${d.status} → ${s}`, d.fileName);
  }

  const checklist = client ? REQUIRED.map((c) => ({ c, ok: docs.some((d) => d.clientId === client.id && d.category === c && ["Verified", "Received", "Under Review"].includes(d.status)) })) : [];
  const hist = historyOf ? docs.filter((d) => `${d.clientId}|${d.category}` === historyOf).sort((a, b) => b.version - a.version) : [];

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center gap-3 p-3">
        <ShieldCheck className="h-5 w-5 text-gold-500" />
        <label className="text-sm font-semibold" htmlFor="role">Viewing as (simulated role):</label>
        <select id="role" className="input w-auto" value={role} onChange={(e) => { setRole(e.target.value as Role); }}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select>
        <span className="text-xs text-mist-500">Role-based access here is a <strong>simulation of the concept</strong>. Real protection requires server-side authentication and authorization.</span>
        <div className="ml-auto"><ResetButton onReset={() => { resetDocs(); resetAudit(); }} /></div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[230px_1fr]">
        <nav className="card self-start p-2" aria-label="Client folders">
          <button onClick={() => setFolder("ALL")} className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-mist-50", folder === "ALL" && "bg-navy-50 font-semibold")}><FolderOpen className="h-4 w-4 text-gold-500" /> All client folders</button>
          {folders.map((c) => (
            <button key={c.id} onClick={() => setFolder(c.id)} className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-mist-50", folder === c.id && "bg-navy-50 font-semibold")}>
              {folder === c.id ? <FolderOpen className="h-4 w-4 text-navy-600" /> : <Folder className="h-4 w-4 text-mist-400" />}
              <span className="flex-1 truncate">{c.name.split(" ").reverse().join(", ")}</span>
              <span className="text-[11px] text-mist-400">{docs.filter((d) => d.clientId === c.id && d.status !== "Archived").length}</span>
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-mist-400" /><input className="input pl-9" placeholder="Search file names…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search documents" /></div>
            <select className="input w-auto" value={catF} onChange={(e) => setCatF(e.target.value)} aria-label="Filter by category"><option>All</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
            <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} /> Show archived</label>
            <button className="btn-outline btn-sm" onClick={() => { exportCsv(list.map((d) => ({ ...d })), "document-index-demo.csv"); log("Exported document index", `${list.length} records`); }}>Export index</button>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead><tr className="border-b border-mist-200"><th className="th">File name</th><th className="th">Category</th><th className="th">Ver.</th><th className="th">Status</th><th className="th">Uploaded</th><th className="th">Access</th><th className="th"></th></tr></thead>
              <tbody className="divide-y divide-mist-100">
                {list.map((d) => {
                  const ok = CAN.view(role, d);
                  return (
                    <tr key={d.id} className={cn(!ok && "bg-mist-50 text-mist-400")}>
                      <td className="td"><button className="flex items-center gap-2 text-left font-mono text-xs hover:underline" onClick={() => open(d)}>{ok ? <FileText className="h-4 w-4 text-navy-600" /> : <Lock className="h-4 w-4" />}{ok ? d.fileName : "Restricted: insufficient role"}</button></td>
                      <td className="td text-xs">{d.category}</td>
                      <td className="td"><button className="text-xs text-navy-700 underline" onClick={() => setHistoryOf(`${d.clientId}|${d.category}`)}>v{d.version}</button></td>
                      <td className="td">
                        <select disabled={!ok} className="input py-1 text-xs" value={d.status} onChange={(e) => setStatus(d, e.target.value as DocRecord["status"])} aria-label="Document status">{["Received", "Under Review", "Verified", "Missing", "Archived"].map((s) => <option key={s}>{s}</option>)}</select>
                      </td>
                      <td className="td text-xs">{fmtDate(d.uploaded)}<br /><span className="text-mist-400">{d.uploadedBy}</span></td>
                      <td className="td"><Badge tone={d.access === "Ops Only" ? "red" : d.access === "Advisor Only" ? "amber" : "gray"}>{d.access}</Badge></td>
                      <td className="td"><Badge tone={statusTone(d.status)}>{d.status}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!list.length && <p className="p-6 text-center text-sm text-mist-500">No documents.</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <form className="card space-y-3 p-4" onSubmit={upload}>
              <p className="flex items-center gap-2 text-sm font-semibold"><Upload className="h-4 w-4" /> Upload simulation {client ? `→ ${client.name}` : "(select a client folder)"}</p>
              <div><label className="label" htmlFor="u-cat">Document category</label><select id="u-cat" className="input" value={up.category} onChange={(e) => setUp({ ...up, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
              <div>
                <label className="label" htmlFor="u-file">Choose any file (only its name is read; contents never leave your device or get read)</label>
                <input id="u-file" type="file" className="block w-full text-xs" onChange={(e) => setUp({ ...up, original: e.target.files?.[0]?.name ?? "" })} />
              </div>
              {client && <p className="rounded-md bg-mist-100 px-2 py-1.5 font-mono text-[11px]">Will be saved as: {nameFor(client.name, up.category, latestVersion(client.id, up.category) + 1)}</p>}
              <p className="text-[11px] text-mist-500">Naming convention: LASTNAME_Firstname_DOCTYPE_YYYYMMDD_vN. Re-uploading the same category creates a new version and archives the old one.</p>
              <button className="btn-primary btn-sm" disabled={!client}>Upload (simulated)</button>
            </form>
            <div className="card p-4">
              <p className="text-sm font-semibold">Document checklist {client ? `· ${client.name}` : ""}</p>
              {client ? (
                <ul className="mt-2 space-y-1 text-sm">{checklist.map((x) => <li key={x.c} className="flex items-center gap-2">{x.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-rose-500" />}{x.c}{!x.ok && <span className="text-xs text-rose-600">missing</span>}</li>)}</ul>
              ) : <p className="mt-2 text-xs text-mist-500">Select a client folder to see its checklist.</p>}
              <p className="mt-4 text-sm font-semibold">Access matrix (simulated)</p>
              <table className="mt-1 w-full text-[11px]"><thead><tr className="text-left text-mist-500"><th>Role</th><th>Ops Only</th><th>Advisor Only</th><th>Upload</th><th>Archive</th></tr></thead>
                <tbody>{ROLES.map((r) => { const t = (v: boolean) => (v ? "✓" : "—"); const fake = (a: DocRecord["access"]) => CAN.view(r, { access: a } as DocRecord); return <tr key={r} className={cn(r === role && "font-semibold text-navy-800")}><td>{r}</td><td>{t(fake("Ops Only"))}</td><td>{t(fake("Advisor Only"))}</td><td>{t(CAN.upload(r))}</td><td>{t(CAN.archive(r))}</td></tr>; })}</tbody></table>
            </div>
          </div>

          {historyOf && (
            <div className="card p-4">
              <div className="flex justify-between"><p className="flex items-center gap-2 text-sm font-semibold"><History className="h-4 w-4" /> Version history</p><button className="text-xs underline" onClick={() => setHistoryOf(null)}>Close</button></div>
              <ul className="mt-2 space-y-1 text-xs">{hist.map((h) => <li key={h.id} className="flex flex-wrap gap-2"><strong>v{h.version}</strong><span className="font-mono">{h.fileName}</span><Badge tone={statusTone(h.status)}>{h.status}</Badge><span className="text-mist-500">{fmtDate(h.uploaded)} · {h.uploadedBy}</span></li>)}</ul>
            </div>
          )}

          <div className="card p-4">
            <p className="flex items-center gap-2 text-sm font-semibold"><History className="h-4 w-4 text-gold-500" /> Audit history ({audit.length})</p>
            <div className="mt-2 max-h-56 overflow-y-auto">
              <table className="w-full text-xs"><tbody className="divide-y divide-mist-100">
                {audit.map((a, i) => <tr key={i}><td className="py-1 pr-2 text-mist-500">{a.ts}</td><td className="pr-2">{a.user}</td><td className="pr-2">{a.action}</td><td className="pr-2 font-mono">{a.target}</td><td><Badge tone={a.result === "Denied" ? "red" : "green"}>{a.result}</Badge></td></tr>)}
                {!audit.length && <tr><td className="py-2 text-mist-500">Actions such as viewing, uploading, status changes, and denied attempts are recorded here. Try switching roles.</td></tr>}
              </tbody></table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
