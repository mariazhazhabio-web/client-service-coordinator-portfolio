/*
 * APPLICANT PROFILE CONTENT
 * Items in [SQUARE BRACKETS] are editable placeholders. Replace them with
 * your own verified details before sending the application. Nothing in
 * square brackets should be submitted as-is.
 */

export const PROFILE = {
  name: "Maria Zha-Zha Cornillez Bio",
  shortName: "Maria Bio",
  title: "Client Service Coordinator | Administrative & Operations Specialist | Executive Virtual Assistant",
  location: "Philippines (Philippine Standard Time, UTC+8); open to remote work, with working hours set by agreed schedule",
  email: "mariazhazhacbio@gmail.com",
  phone: "", // kept private; shared on request
  linkedin: "linkedin.com/in/zha-zha-bio-56824a195",
  portfolioUrl: "maria-bio-portfolio.vercel.app",
  headline: "Delivering Organized, Accurate, and Client-Focused Administrative Support",
  subheading:
    "Administrative and operations professional with 18 years of public service experience, specializing in client coordination, documentation, records management, reporting, workflow improvement, and operational efficiency.",
  summary:
    "Administrative and operations professional with 18 years of public service experience in administrative and operational management, client service and application processing, confidential records and database management, document preparation, regulatory compliance support, monitoring and reporting, and meeting coordination. Adds call center customer service experience (phone, email, and chat support) and online ESL teaching experience, bringing clear, patient, professional communication. Holds a Master in Management (Public Administration) and four professional credentials. Ready to support a financial advisory team with accurate paperwork, organized client records, timely follow-ups, and well-prepared meeting materials.",
  stats: [
    { value: "18", label: "Years of public service" },
    { value: "3", label: "Client-facing sectors: government, BPO, online education" },
    { value: "4", label: "Academic degrees" },
    { value: "4", label: "Professional credentials" },
  ],
};

export const CORE_COMPETENCIES = [
  "Client application & form processing",
  "Service request tracking & follow-up",
  "Confidential records management",
  "CRM data entry & interaction logging",
  "Calendar & appointment coordination",
  "Professional email & phone communication",
  "Document preparation & electronic filing",
  "Policy & procedure compliance",
  "Monitoring, reporting & KPI tracking",
  "Microsoft Excel & PowerPoint",
  "Process improvement & SOP writing",
  "Meeting coordination & minutes",
];

/** Government-to-corporate translation table. Describes types of work only, no sensitive details. */
export const TRANSLATION = [
  { gov: "Processing applications from the public and checking completeness against requirements", corp: "Client application processing, completeness checks, and missing-requirement follow-up" },
  { gov: "Front-line public assistance and handling of inquiries and concerns", corp: "Client service, issue resolution, and professional phone and email communication" },
  { gov: "Maintaining confidential records and databases", corp: "Client record maintenance, CRM data accuracy, and confidential information handling" },
  { gov: "Preparing official documents, memoranda, and reports", corp: "Document preparation, client correspondence, and administrative reporting" },
  { gov: "Ensuring work follows laws, regulations, and agency policies", corp: "Following firm procedures and compliance checklists; escalating exceptions appropriately" },
  { gov: "Plans and policy development", corp: "Writing SOPs, checklists, and workflow guidelines" },
  { gov: "Monitoring and evaluation; periodic accomplishment reports", corp: "Tracking outstanding items, KPI reporting, and weekly or monthly status reports" },
  { gov: "Coordinating meetings, activities, and inter-office concerns", corp: "Advisor calendar management, meeting preparation, and coordination with the home office and other departments" },
  { gov: "Identifying bottlenecks and improving office procedures", corp: "Administrative process improvement and workflow automation" },
];

export type Experience = { role: string; org: string; period: string; location: string; bullets: string[]; note?: string };

export const EXPERIENCE: Experience[] = [
  {
    role: "Administrative, Research, and Policy Management Professional",
    org: "National Government Agency, Philippines",
    period: "2008 – Present",
    location: "Philippines",
    note: "No confidential or sensitive government information is shown.",
    bullets: [
      "Managed administrative and operational functions of the office, including workload scheduling, records, and day-to-day coordination.",
      "Received, reviewed, and processed applications and service requests; checked documents for completeness and followed up on missing requirements.",
      "Maintained confidential records and databases with a focus on accuracy, access control, and proper retention.",
      "Prepared official correspondence, memoranda, reports, and other documents in line with applicable regulations and office policies.",
      "Monitored pending transactions and prepared periodic monitoring and accomplishment reports for management.",
      "Contributed to plans and policy development, including written procedures and guidelines.",
      "Coordinated meetings and activities, prepared materials, and documented minutes and action items.",
      "Identified process improvements to reduce delays and improve service to the public.",
    ],
  },
  {
    role: "Customer Service Representative",
    org: "ICT Marketing Services",
    period: "2007 – 2008",
    location: "Philippines",
    bullets: [
      "Handled customer inquiries and concerns by phone, email, and chat, following scripts, policies, and quality standards.",
      "Documented each interaction accurately in the customer management system.",
      "De-escalated difficult conversations calmly and routed complex issues to the correct team.",
    ],
  },
  {
    role: "Online English as a Second Language (ESL) Teacher",
    org: "Bibo Global Opportunity, Inc.",
    period: "2016",
    location: "Remote",
    bullets: [
      "Delivered live online lessons with clear explanations adapted to each learner.",
      "Managed class schedules across time zones and kept accurate session records.",
      "Built rapport and trust with students and parents through professional, patient communication.",
    ],
  },
];

export const EDUCATION = [
  { degree: "Master in Management, major in Public Administration", school: "Philippine Christian University", year: "2023" },
  { degree: "Bachelor of Secondary Education, major in Social Studies", school: "College of the Most Holy Trinity Catholic Foundation", year: "2022" },
  { degree: "Bachelor of Science in Criminology", school: "University of La Salette", year: "2011" },
  { degree: "Bachelor of Science in Chemical Engineering", school: "Eastern Visayas State University", year: "2006" },
];

export const CREDENTIALS = [
  { name: "Licensed Professional Teacher", body: "Professional Regulation Commission (PRC), Philippines", relevance: "Clear communication, explaining processes, preparing learning materials and presentations" },
  { name: "Registered Chemical Technician", body: "Professional Regulation Commission (PRC), Philippines", relevance: "Precision, documentation discipline, following procedures exactly" },
  { name: "Registered Criminologist", body: "Professional Regulation Commission (PRC), Philippines", relevance: "Integrity, discretion, confidentiality, and careful record handling" },
  { name: "Civil Service Professional Eligibility", body: "Civil Service Commission, Philippines", relevance: "Demonstrated professional-level administrative competence" },
];

export const SKILL_GROUPS = [
  {
    group: "Client Service",
    skills: [
      { name: "Phone & email communication", level: 5 },
      { name: "Handling inquiries and concerns", level: 5 },
      { name: "Follow-up discipline", level: 5 },
      { name: "De-escalation", level: 4 },
    ],
  },
  {
    group: "Administration & Records",
    skills: [
      { name: "Application & form processing", level: 5 },
      { name: "Confidential records management", level: 5 },
      { name: "Document preparation", level: 5 },
      { name: "Electronic filing & naming conventions", level: 4 },
    ],
  },
  {
    group: "Operations & Reporting",
    skills: [
      { name: "Monitoring & status reporting", level: 5 },
      { name: "SOP & policy writing", level: 5 },
      { name: "Process improvement", level: 4 },
      { name: "Meeting & calendar coordination", level: 4 },
    ],
  },
  {
    group: "Tools (self-assessed; adjust as needed)",
    skills: [
      { name: "Microsoft Word & Outlook", level: 4 },
      { name: "Microsoft Excel (formulas, tables, charts)", level: 4 },
      { name: "Microsoft PowerPoint", level: 4 },
      { name: "Google Workspace", level: 4 },
      { name: "CRM concepts (records, tasks, activity logs)", level: 3 },
      { name: "Workflow automation concepts (n8n, Trello)", level: 3 },
    ],
  },
];

export const TOOLS = [
  "Microsoft Word", "Microsoft Excel", "Microsoft PowerPoint", "Microsoft Outlook", "Google Sheets", "Google Docs", "Google Forms",
  "Google Calendar", "Google Drive", "Gmail", "Trello", "n8n (workflow automation)", "Zoom / Google Meet", "CRM systems (general)",
];
