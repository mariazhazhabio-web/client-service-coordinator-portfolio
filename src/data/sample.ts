/*
 * FICTIONAL SAMPLE DATASET
 * ------------------------------------------------------------
 * Every person, household, phone number, email address and reference
 * number in this file is invented for portfolio demonstration only.
 * - Phone numbers use the reserved fictional 555-01xx range.
 * - Emails use the reserved example.com / example.org domains.
 * - Account references use a "DEMO-" prefix and are not real accounts.
 * No real client, financial account or government ID data is used.
 *
 * Dates are generated relative to a base date so overdue alerts and
 * upcoming appointments always look realistic whenever the demo is opened.
 * This file has no imports so it can be used by both the Next.js app and
 * the Node asset generator (scripts/generate-assets.mjs).
 */

export type Advisor = { id: string; name: string; title: string; color: string };
export type Staff = { id: string; name: string; role: string };
export type ClientStatus = "Active" | "Onboarding" | "Prospect" | "Inactive";
export type Interaction = { date: string; type: "Call" | "Email" | "Meeting" | "Note"; summary: string; by: string };
export type Client = {
  id: string;
  name: string;
  household: string;
  email: string;
  phone: string;
  city: string;
  advisorId: string;
  status: ClientStatus;
  segment: "Individual" | "Family" | "Retiree" | "Business Owner";
  accountRef: string;
  since: string;
  lastContact: string;
  nextFollowUp: string;
  tasks: { id: string; title: string; assignee: string; due: string; done: boolean }[];
  interactions: Interaction[];
};
export type RequestStatus = "Received" | "In Progress" | "Pending Client" | "Pending Home Office" | "Completed";
export type ServiceRequest = {
  ref: string;
  clientId: string;
  clientName: string;
  category: string;
  received: string;
  assignedTo: string;
  priority: "High" | "Medium" | "Low";
  target: string;
  status: RequestStatus;
  pending: string[];
  followUps: { date: string; note: string }[];
  resolved: string | null;
};
export type Appointment = {
  id: string;
  advisorId: string;
  clientId: string;
  clientName: string;
  type: string;
  date: string; // YYYY-MM-DD (Pacific)
  start: string; // HH:MM Pacific
  duration: number; // minutes
  mode: "Video" | "Phone" | "In-Office";
  status: "Confirmed" | "Tentative" | "Rescheduled" | "Completed";
};
export type MeetingAction = { id: string; task: string; owner: string; due: string; docs: string[]; clientDeliverable: boolean; done: boolean };
export type Meeting = { id: string; clientId: string; clientName: string; advisorId: string; date: string; type: string; summary: string; actions: MeetingAction[] };
export type DocRecord = {
  id: string;
  clientId: string;
  clientName: string;
  category: string;
  fileName: string;
  status: "Received" | "Under Review" | "Verified" | "Missing" | "Archived";
  version: number;
  uploaded: string;
  uploadedBy: string;
  access: "Advisor + Ops" | "Ops Only" | "Advisor Only";
};
export type MonthStat = { month: string; received: number; completed: number; overdue: number; newClients: number; avgTat: number; onTime: number };

/* ---------- deterministic helpers ---------- */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
export function iso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
export function addDays(base: Date, n: number) {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  d.setDate(d.getDate() + n);
  return d;
}
function skipWeekend(d: Date) {
  const r = new Date(d);
  while (r.getDay() === 0 || r.getDay() === 6) r.setDate(r.getDate() + 1);
  return r;
}

export const ADVISORS: Advisor[] = [
  { id: "ADV-01", name: "Jordan Whitaker", title: "Lead Financial Advisor (fictional)", color: "#213b73" },
  { id: "ADV-02", name: "Elena Marsh", title: "Associate Financial Advisor (fictional)", color: "#b98b30" },
  { id: "ADV-03", name: "Samuel Ortiz", title: "Financial Planner (fictional)", color: "#4f6fae" },
];

export const STAFF: Staff[] = [
  { id: "ST-01", name: "Client Service Coordinator (Demo User)", role: "Client Service Coordinator" },
  { id: "ST-02", name: "Priya Natarajan", role: "Operations Associate (fictional)" },
  { id: "ST-03", name: "Marcus Lee", role: "Paraplanner (fictional)" },
  { id: "ST-04", name: "Hannah Brooks", role: "Office Administrator (fictional)" },
];

const FIRST = ["Olivia", "Benjamin", "Grace", "Nathan", "Sofia", "Ethan", "Chloe", "Lucas", "Amelia", "Henry", "Isabel", "Owen", "Mia", "Caleb", "Harper", "Wyatt", "Lily", "Julian", "Ava", "Gabriel", "Nora", "Isaac", "Zoe", "Miles"];
const LAST = ["Bennett", "Calloway", "Delgado", "Ellison", "Fairbanks", "Garrison", "Holloway", "Iverson", "Jennings", "Kensington", "Langford", "Montague", "Northcott", "Ashby", "Pemberton", "Quinlan", "Redfield", "Sterling", "Thornton", "Underwood", "Vance", "Westbrook", "Yardley", "Abernathy"];
const CITIES = ["Simi Valley, CA", "Thousand Oaks, CA", "Moorpark, CA", "Camarillo, CA", "Ventura, CA", "Oxnard, CA", "Westlake Village, CA", "Agoura Hills, CA"];
const SEGMENTS: Client["segment"][] = ["Individual", "Family", "Retiree", "Business Owner"];
const STATUSES: ClientStatus[] = ["Active", "Active", "Active", "Active", "Onboarding", "Prospect", "Active", "Inactive"];

export const REQUEST_CATEGORIES = [
  "New Account Application",
  "Address Change",
  "Beneficiary Update",
  "Contact Information Update",
  "Account Maintenance",
  "Transfer Paperwork",
  "Document Request",
  "Systematic Contribution Setup",
];

const PENDING_BY_CATEGORY: Record<string, string[]> = {
  "New Account Application": ["Signed application form", "Proof of address (mock)", "Client signature on disclosure acknowledgment"],
  "Address Change": ["Signed address change form"],
  "Beneficiary Update": ["Signed beneficiary designation form", "Beneficiary contact details"],
  "Contact Information Update": ["Client verbal confirmation logged"],
  "Account Maintenance": ["Advisor review", "Home office confirmation"],
  "Transfer Paperwork": ["Signed transfer form", "Recent statement copy (mock)"],
  "Document Request": ["Document retrieval from archive"],
  "Systematic Contribution Setup": ["Signed authorization form", "Advisor approval"],
};

export type Dataset = {
  base: string;
  advisors: Advisor[];
  staff: Staff[];
  clients: Client[];
  requests: ServiceRequest[];
  appointments: Appointment[];
  meetings: Meeting[];
  documents: DocRecord[];
  months: MonthStat[];
};

export function buildDataset(baseDate: Date = new Date()): Dataset {
  const base = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const r = rng(20261125);
  const pick = <T,>(arr: T[]) => arr[Math.floor(r() * arr.length)];
  const day = (n: number) => iso(addDays(base, n));
  const staffNames = STAFF.map((s) => s.name.replace(" (Demo User)", ""));

  /* clients */
  const clients: Client[] = FIRST.map((first, i) => {
    const last = LAST[i];
    const advisor = ADVISORS[i % ADVISORS.length];
    const status = STATUSES[i % STATUSES.length];
    const lastContact = -Math.floor(r() * 40) - 1;
    const nextFollow = Math.floor(r() * 24) - 5;
    const id = `CL-${String(1001 + i)}`;
    const interactions: Interaction[] = [
      { date: day(lastContact), type: "Call", summary: "Confirmed preferred contact method and availability for next review.", by: staffNames[0] },
      { date: day(lastContact - 9), type: "Email", summary: "Sent meeting recap and list of outstanding paperwork.", by: staffNames[i % 2 === 0 ? 0 : 1] },
      { date: day(lastContact - 21), type: "Meeting", summary: `Review meeting with ${advisor.name}. Administrative follow-ups logged.`, by: advisor.name },
    ];
    return {
      id,
      name: `${first} ${last}`,
      household: `${last} Household`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      phone: `(805) 555-01${String(10 + i).padStart(2, "0")}`,
      city: CITIES[i % CITIES.length],
      advisorId: advisor.id,
      status,
      segment: SEGMENTS[i % SEGMENTS.length],
      accountRef: `DEMO-${String(4000 + i * 37).padStart(5, "0")}`,
      since: day(-30 * (2 + Math.floor(r() * 60))),
      lastContact: day(lastContact),
      nextFollowUp: day(nextFollow),
      tasks: [
        { id: `${id}-T1`, title: "Send post-meeting recap email", assignee: staffNames[0], due: day(nextFollow - 2), done: r() > 0.5 },
        { id: `${id}-T2`, title: "Update contact preferences in CRM", assignee: staffNames[1], due: day(nextFollow), done: r() > 0.6 },
      ],
      interactions,
    };
  });

  /* service requests */
  const statuses: RequestStatus[] = ["Received", "In Progress", "Pending Client", "Pending Home Office", "Completed", "Completed", "Completed", "Completed", "Completed", "In Progress"];
  const requests: ServiceRequest[] = Array.from({ length: 40 }, (_, i) => {
    const c = clients[Math.floor(r() * clients.length)];
    const category = REQUEST_CATEGORIES[i % REQUEST_CATEGORIES.length];
    const status = statuses[Math.floor(r() * statuses.length)];
    const receivedOff = status === "Completed" ? -Math.floor(r() * 45) - 6 : -Math.floor(r() * 12) - 1;
    const sla = 3 + Math.floor(r() * 8);
    const priority = (["High", "Medium", "Medium", "Low"] as const)[Math.floor(r() * 4)];
    let resolved: string | null = null;
    if (status === "Completed") {
      const tat = Math.max(1, sla + Math.floor(r() * 6) - 3);
      resolved = day(Math.min(-1, receivedOff + tat));
    }
    const pending = status === "Completed" ? [] : PENDING_BY_CATEGORY[category].slice(0, 1 + Math.floor(r() * PENDING_BY_CATEGORY[category].length));
    return {
      ref: `SR-${base.getFullYear()}-${String(1201 + i)}`,
      clientId: c.id,
      clientName: c.name,
      category,
      received: day(receivedOff),
      assignedTo: pick(staffNames),
      priority,
      target: day(receivedOff + sla),
      status,
      pending,
      followUps: [
        { date: day(receivedOff + 1), note: "Acknowledgment sent to client with expected timeline." },
        ...(status !== "Received" ? [{ date: day(receivedOff + 3), note: "Checked status; outstanding items confirmed with responsible party." }] : []),
      ],
      resolved,
    };
  });

  /* appointments */
  const apptTypes = ["Annual Review", "Discovery Meeting", "Paperwork Signing", "Follow-up Call", "Planning Presentation", "Onboarding Session"];
  const appointments: Appointment[] = [];
  let aid = 1;
  for (let d = -10; d <= 35; d++) {
    const dt = addDays(base, d);
    if (dt.getDay() === 0 || dt.getDay() === 6) continue;
    const count = Math.floor(r() * 3);
    const used = new Set<string>();
    for (let k = 0; k < count; k++) {
      const adv = ADVISORS[Math.floor(r() * ADVISORS.length)];
      const hour = 8 + Math.floor(r() * 9);
      const key = `${adv.id}-${hour}`;
      if (used.has(key)) continue;
      used.add(key);
      const c = clients[Math.floor(r() * clients.length)];
      appointments.push({
        id: `AP-${String(aid++).padStart(3, "0")}`,
        advisorId: adv.id,
        clientId: c.id,
        clientName: c.name,
        type: pick(apptTypes),
        date: iso(dt),
        start: `${String(hour).padStart(2, "0")}:${r() > 0.5 ? "00" : "30"}`,
        duration: pick([30, 45, 60, 60, 90]),
        mode: pick(["Video", "Phone", "In-Office"] as const),
        status: d < 0 ? "Completed" : r() > 0.8 ? "Tentative" : "Confirmed",
      });
    }
  }

  /* meetings for post-meeting workflow */
  const meetings: Meeting[] = clients.slice(0, 6).map((c, i) => {
    const mDate = -1 - i * 2;
    const adv = ADVISORS.find((a) => a.id === c.advisorId)!;
    return {
      id: `MT-${String(301 + i)}`,
      clientId: c.id,
      clientName: c.name,
      advisorId: adv.id,
      date: day(mDate),
      type: ["Annual Review", "Planning Presentation", "Discovery Meeting", "Paperwork Signing", "Annual Review", "Follow-up Call"][i],
      summary: [
        "Reviewed household contact details and upcoming life events. Client asked for an updated beneficiary form and a summary of items discussed.",
        "Advisor presented planning materials. Client requested printed copies and will return signed forms within two weeks.",
        "Introductory meeting. Client will provide onboarding documents; coordinator to send welcome packet and checklist.",
        "Signing session for administrative paperwork. Two forms signed; one form needs a second signature.",
        "Annual review. Client moved recently; address change and contact update required.",
        "Short follow-up call to confirm outstanding items and schedule next review.",
      ][i],
      actions: [
        { id: `MT-${301 + i}-A1`, task: "Send meeting recap email with outstanding items", owner: staffNames[0], due: day(mDate + 1), docs: [], clientDeliverable: false, done: i > 2 },
        { id: `MT-${301 + i}-A2`, task: ["Prepare beneficiary update form", "Mail printed planning materials", "Send welcome packet and document checklist", "Obtain second signature", "Process address change request", "Schedule next review appointment"][i], owner: staffNames[i % 2 === 0 ? 0 : 1], due: day(mDate + 3), docs: [["Beneficiary form (mock)"], ["Planning summary (mock)"], ["Welcome packet", "Onboarding checklist"], ["Joint form (mock)"], ["Address change form (mock)"], []][i], clientDeliverable: i !== 5, done: i > 3 },
        { id: `MT-${301 + i}-A3`, task: "Log meeting notes and tasks in CRM", owner: staffNames[0], due: day(mDate + 1), docs: [], clientDeliverable: false, done: i !== 0 },
        { id: `MT-${301 + i}-A4`, task: "Follow up with client on returned documents", owner: staffNames[0], due: day(mDate + 7), docs: [], clientDeliverable: false, done: false },
      ],
    };
  });

  /* documents */
  const docCats = ["Identification (mock)", "Application Forms", "Account Maintenance Forms", "Meeting Notes", "Correspondence", "Statements (mock)"];
  const docStatuses: DocRecord["status"][] = ["Verified", "Verified", "Received", "Under Review", "Missing", "Verified", "Archived"];
  const documents: DocRecord[] = [];
  clients.slice(0, 10).forEach((c, ci) => {
    const [first, last] = c.name.split(" ");
    const n = 3 + Math.floor(r() * 3);
    for (let k = 0; k < n; k++) {
      const cat = docCats[(ci + k) % docCats.length];
      const up = -Math.floor(r() * 90);
      const ver = 1 + Math.floor(r() * 3);
      const short = cat.split(" ")[0].replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 6);
      const status = docStatuses[Math.floor(r() * docStatuses.length)];
      documents.push({
        id: `DOC-${String(documents.length + 1).padStart(4, "0")}`,
        clientId: c.id,
        clientName: c.name,
        category: cat,
        fileName: `${last.toUpperCase()}_${first}_${short}_${day(up).replace(/-/g, "")}_v${ver}.pdf`,
        status,
        version: ver,
        uploaded: day(up),
        uploadedBy: pick(staffNames),
        access: cat.startsWith("Identification") ? "Ops Only" : cat === "Meeting Notes" ? "Advisor Only" : "Advisor + Ops",
      });
    }
  });

  /* monthly trend (12 months) */
  const months: MonthStat[] = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(base.getFullYear(), base.getMonth() - 11 + i, 1);
    const received = 38 + Math.floor(r() * 22) + i;
    const completed = received - 3 - Math.floor(r() * 7);
    return {
      month: d.toLocaleString("en-US", { month: "short", year: "2-digit" }),
      received,
      completed,
      overdue: 2 + Math.floor(r() * 6),
      newClients: 2 + Math.floor(r() * 6),
      avgTat: Math.round((4.2 + r() * 2.6 - i * 0.08) * 10) / 10,
      onTime: Math.round(84 + r() * 9 + i * 0.3),
    };
  });

  return { base: iso(base), advisors: ADVISORS, staff: STAFF, clients, requests, appointments, meetings, documents, months };
}

/* ---------- shared calculations (also mirrored as Excel formulas) ---------- */
export function daysBetween(a: string, b: string) {
  const [y1, m1, d1] = a.split("-").map(Number);
  const [y2, m2, d2] = b.split("-").map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}
export function isOverdue(req: ServiceRequest, today: string) {
  return req.status !== "Completed" && req.target < today;
}
export function requestKpis(reqs: ServiceRequest[], today: string) {
  const total = reqs.length;
  const completed = reqs.filter((q) => q.status === "Completed");
  const pending = total - completed.length;
  const overdue = reqs.filter((q) => isOverdue(q, today)).length;
  const tats = completed.map((q) => daysBetween(q.received, q.resolved!));
  const avgTat = tats.length ? tats.reduce((a, b) => a + b, 0) / tats.length : 0;
  const onTime = completed.filter((q) => q.resolved! <= q.target).length;
  return {
    total,
    completed: completed.length,
    pending,
    overdue,
    avgTat: Math.round(avgTat * 10) / 10,
    completionRate: total ? Math.round((completed.length / total) * 1000) / 10 : 0,
    onTimeRate: completed.length ? Math.round((onTime / completed.length) * 1000) / 10 : 0,
  };
}
export { skipWeekend };
