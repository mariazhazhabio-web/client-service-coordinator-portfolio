/*
 * Client meeting deck builder, shared by the browser demo and the Node generator.
 * Only type imports (erased at runtime): the caller passes a PptxGenJS instance.
 * ADMINISTRATIVE SUPPORT DEMONSTRATION: not financial advice.
 */

import type { Dataset } from "./sample";

export type DeckInput = {
  clientName: string;
  household: string;
  clientId: string;
  segment: string;
  city: string;
  email: string;
  phone: string;
  since: string;
  advisorName: string;
  coordinator: string;
  meetingDate: string;
  meetingType: string;
  requests: { ref: string; category: string; status: string; target: string }[];
  outstanding: { item: string; owner: string; due: string }[];
  documents: string[];
  followUps: { date: string; what: string }[];
};

export type DeckSlide = { title: string; kind: string; bullets?: string[]; table?: string[][]; note?: string };

const DISCLAIMER = "Administrative support demonstration · Fictional data · Not financial advice · Not affiliated with any financial firm";

export function deckOutline(d: DeckInput): DeckSlide[] {
  return [
    { kind: "title", title: `${d.meetingType}`, bullets: [`Prepared for: ${d.clientName} (${d.household})`, `Advisor: ${d.advisorName}`, `Meeting date: ${d.meetingDate}`, `Prepared by: ${d.coordinator}, Client Service Coordinator`] },
    { kind: "list", title: "Meeting Agenda", bullets: ["Welcome and meeting objectives", "Client profile and contact details review", "Account service overview: open and recent requests", "Outstanding administrative requirements", "Financial goals discussion (led by advisor)", "Advisor-approved recommendations (advisor only)", "Required documentation", "Next steps and follow-up schedule"] },
    { kind: "table", title: "Client Profile Summary", table: [["Field", "Details on file (please confirm)"], ["Client", `${d.clientName} · ${d.clientId}`], ["Household / segment", `${d.household} · ${d.segment}`], ["City", d.city], ["Email", d.email], ["Phone", d.phone], ["Client since", d.since], ["Assigned advisor", d.advisorName]], note: "Confirm contact details and preferred communication method during the meeting." },
    { kind: "table", title: "Account Service Overview", table: [["Ref #", "Request", "Status", "Target date"], ...(d.requests.length ? d.requests.map((r) => [r.ref, r.category, r.status, r.target]) : [["—", "No service requests on file", "—", "—"]])] },
    { kind: "table", title: "Outstanding Administrative Requirements", table: [["Item", "Owner", "Due"], ...(d.outstanding.length ? d.outstanding.map((o) => [o.item, o.owner, o.due]) : [["No outstanding items", "—", "—"]])] },
    { kind: "placeholder", title: "Financial Goals Discussion", bullets: ["[ADVISOR TO COMPLETE] Client's stated goals and priorities", "[ADVISOR TO COMPLETE] Changes since the last review", "[ADVISOR TO COMPLETE] Questions raised by the client"], note: "Placeholder only. The Client Service Coordinator does not provide or draft financial advice." },
    { kind: "placeholder", title: "Advisor-Approved Recommendations", bullets: ["[ADVISOR-APPROVED CONTENT ONLY]", "This section is intentionally blank in the administrative template.", "Content must be prepared, reviewed, and approved by the financial advisor according to firm procedures."], note: "Placeholder only. Not prepared by administrative staff." },
    { kind: "list", title: "Required Documentation", bullets: d.documents.length ? d.documents : ["No additional documents required at this time"], note: "Clients should send documents only through the firm's secure, approved methods." },
    { kind: "list", title: "Next Steps", bullets: ["Coordinator sends the meeting recap within 2 business days", "Coordinator prepares any forms discussed for signature", "Client returns the outstanding documents listed", "Advisor reviews completed paperwork before submission", "Coordinator confirms completion with the client"] },
    { kind: "table", title: "Follow-up Schedule", table: [["Date", "Follow-up"], ...d.followUps.map((f) => [f.date, f.what])] },
    { kind: "list", title: "Questions & Contact", bullets: [`Advisor: ${d.advisorName}`, `Client Service Coordinator: ${d.coordinator}`, "Office: [Practice phone] · [Practice email]", "Thank you for meeting with us today."] },
    { kind: "disclaimer", title: "Important Notice", bullets: ["This presentation is an independent portfolio demonstration of administrative meeting preparation.", "All client names and data are fictional.", "It contains no financial, investment, tax, or legal advice.", "It is not affiliated with, endorsed by, or connected to Ameriprise Financial or any financial institution.", "Advisor-only sections are placeholders and would be completed by a qualified advisor under firm procedures."] },
  ];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildDeck(pptx: any, d: DeckInput) {
  const NAVY = "112144", GOLD = "B98B30", GRAY = "6B7485", LIGHT = "F1F3F6";
  pptx.layout = "LAYOUT_WIDE";
  pptx.title = `Client Meeting: ${d.clientName} (Demo)`;
  pptx.company = "Portfolio Demonstration";
  pptx.author = d.coordinator;
  pptx.defineSlideMaster({
    title: "MASTER",
    background: { color: "FFFFFF" },
    objects: [
      { rect: { x: 0, y: 0, w: 13.33, h: 0.12, fill: { color: NAVY } } },
      { rect: { x: 0, y: 0.12, w: 13.33, h: 0.04, fill: { color: GOLD } } },
      { text: { text: DISCLAIMER, options: { x: 0.5, y: 7.05, w: 10.5, h: 0.3, fontSize: 9, color: GRAY, fontFace: "Calibri" } } },
    ],
    slideNumber: { x: 12.3, y: 7.05, fontSize: 9, color: GRAY },
  });

  deckOutline(d).forEach((s, idx) => {
    if (s.kind === "title") {
      const sl = pptx.addSlide();
      sl.background = { color: NAVY };
      sl.addShape(pptx.ShapeType.rect, { x: 0.6, y: 2.2, w: 0.12, h: 2.2, fill: { color: GOLD } });
      sl.addText("CLIENT MEETING", { x: 0.95, y: 1.6, w: 10, h: 0.5, fontSize: 14, color: "DCBC6C", bold: true, charSpacing: 4, fontFace: "Calibri" });
      sl.addText(s.title, { x: 0.95, y: 2.1, w: 11, h: 1.0, fontSize: 40, color: "FFFFFF", bold: true, fontFace: "Georgia" });
      sl.addText((s.bullets ?? []).map((b) => ({ text: b, options: { breakLine: true } })), { x: 0.95, y: 3.2, w: 11, h: 1.6, fontSize: 16, color: "D6DFF0", fontFace: "Calibri" });
      sl.addText("ADMINISTRATIVE SUPPORT DEMONSTRATION: NOT FINANCIAL ADVICE", { x: 0.95, y: 6.3, w: 11, h: 0.4, fontSize: 11, color: "DCBC6C", bold: true, fontFace: "Calibri" });
      return;
    }
    const sl = pptx.addSlide({ masterName: "MASTER" });
    sl.addText(s.title, { x: 0.5, y: 0.4, w: 12.3, h: 0.8, fontSize: 28, bold: true, color: NAVY, fontFace: "Georgia" });
    sl.addText(String(idx + 1).padStart(2, "0"), { x: 11.8, y: 0.4, w: 1, h: 0.8, fontSize: 28, color: GOLD, align: "right", fontFace: "Georgia" });
    if (s.kind === "table" && s.table) {
      const rows = s.table.map((r, ri) => r.map((c) => ({ text: c, options: ri === 0 ? { bold: true, color: "FFFFFF", fill: { color: NAVY } } : { color: "1B2440", fill: { color: ri % 2 ? "FFFFFF" : LIGHT } } })));
      sl.addTable(rows, { x: 0.5, y: 1.45, w: 12.3, fontSize: 13, fontFace: "Calibri", border: { type: "solid", pt: 0.5, color: "CFD4DC" }, rowH: 0.42, valign: "middle" });
    } else {
      const placeholder = s.kind === "placeholder";
      if (placeholder) sl.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.4, w: 12.3, h: 4.4, fill: { color: "FBF7EC" }, line: { color: GOLD, width: 1.5, dashType: "dash" } });
      sl.addText((s.bullets ?? []).map((b) => ({ text: b, options: { bullet: { code: "25A0" }, breakLine: true } })), { x: placeholder ? 0.8 : 0.6, y: 1.5, w: 11.8, h: 4.2, fontSize: 18, color: placeholder ? "72521E" : "1B2440", valign: "top", paraSpaceAfter: 8, fontFace: "Calibri" });
    }
    if (s.note) sl.addText(s.note, { x: 0.5, y: 6.25, w: 12.3, h: 0.55, fontSize: 12, italic: true, color: GRAY, fill: { color: LIGHT }, margin: 6, fontFace: "Calibri" });
    sl.addNotes(`Speaker notes (administrative): Review "${s.title}" with the advisor before the meeting. Fictional demo data.`);
  });
  return pptx;
}

function fmt(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function plus(isoDate: string, n: number) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

/** Build deck input for a client from the fictional dataset. */
export function deckInputFor(ds: Dataset, clientId: string, coordinator = "Maria Bio"): DeckInput {
  const c = ds.clients.find((x) => x.id === clientId) ?? ds.clients[0];
  const adv = ds.advisors.find((a) => a.id === c.advisorId)!;
  const appt = ds.appointments.find((a) => a.clientId === c.id && a.date >= ds.base);
  const meetingDate = appt?.date ?? plus(ds.base, 7);
  const reqs = ds.requests.filter((r) => r.clientId === c.id);
  const open = reqs.filter((r) => r.status !== "Completed");
  const outstanding = [
    ...open.flatMap((r) => r.pending.map((p) => ({ item: `${p} (${r.ref})`, owner: p.toLowerCase().includes("advisor") ? adv.name : "Client / Coordinator", due: fmt(r.target) }))),
    ...c.tasks.filter((t) => !t.done).map((t) => ({ item: t.title, owner: t.assignee, due: fmt(t.due) })),
  ].slice(0, 8);
  const docs = Array.from(new Set(open.flatMap((r) => r.pending).filter((p) => /form|statement|proof|signature/i.test(p))));
  return {
    clientName: c.name, household: c.household, clientId: c.id, segment: c.segment, city: c.city, email: c.email, phone: c.phone, since: fmt(c.since),
    advisorName: adv.name, coordinator, meetingDate: fmt(meetingDate), meetingType: appt?.type ?? "Annual Review Meeting",
    requests: reqs.slice(0, 7).map((r) => ({ ref: r.ref, category: r.category, status: r.status, target: fmt(r.target) })),
    outstanding,
    documents: docs.length ? docs.map((d) => `${d}`) : ["Updated contact information confirmation (if changed)", "Any forms discussed during the meeting"],
    followUps: [
      { date: fmt(plus(meetingDate, 2)), what: "Recap email with action items sent to client" },
      { date: fmt(plus(meetingDate, 7)), what: "Follow-up on outstanding documents" },
      { date: fmt(plus(meetingDate, 14)), what: "Status update on open service requests" },
      { date: fmt(plus(meetingDate, 30)), what: "Check-in call; confirm all items complete" },
    ],
  };
}
