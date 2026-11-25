/*
 * Text content for SOPs, application documents and interview preparation.
 * Used by the website and by scripts/generate-assets.mjs.
 */

export type Sop = {
  code: string;
  slug: string;
  title: string;
  purpose: string;
  scope: string;
  responsibilities: { role: string; duty: string }[];
  procedure: string[];
  qc: string[];
  outputs: string[];
};

const R_CSC = "Client Service Coordinator";
const R_ADV = "Financial Advisor";
const R_OPS = "Operations Associate / Lead";

export const SOPS: Sop[] = [
  {
    code: "SOP-01", slug: "Client-Onboarding-Procedure", title: "Client Onboarding Procedure",
    purpose: "To onboard new clients consistently, accurately, and promptly so that every required item is collected, verified, and recorded before account work begins.",
    scope: "Applies to all new clients from the first confirmed meeting until onboarding is marked complete in the CRM.",
    responsibilities: [
      { role: R_CSC, duty: "Creates the CRM record, sends the welcome packet and checklist, tracks documents, and follows up on missing items." },
      { role: R_ADV, duty: "Confirms the client relationship and reviews the completed onboarding file." },
      { role: R_OPS, duty: "Verifies documents against firm requirements and resolves exceptions." },
    ],
    procedure: [
      "Search the CRM for an existing record to prevent duplicates.",
      "Create the client record with all required fields (legal name, contact details, preferred contact method, assigned advisor).",
      "Generate the standard onboarding checklist and attach it to the client record.",
      "Send the welcome email and document checklist using the approved template within 1 business day.",
      "Log each document as it arrives. Rename and file it using the naming convention (SOP-07).",
      "Route documents to Operations for verification and record the verification status.",
      "Follow up on missing requirements every 3 business days using the Missing Document Reminder template.",
      "When every item is verified, update the status to 'Onboarded', notify the advisor, and schedule the first review meeting.",
    ],
    qc: ["Checklist 100% complete before status changes", "Second-person review of the record fields", "No sensitive data sent by unsecured email", "Every follow-up logged in the CRM"],
    outputs: ["Complete CRM record", "Verified onboarding file", "Welcome email logged", "First review appointment scheduled"],
  },
  {
    code: "SOP-02", slug: "Client-Application-Processing", title: "Client Application Processing",
    purpose: "To prepare, check, submit, and track client applications and forms accurately through to completion.",
    scope: "Applies to all new account applications and related forms prepared by the practice for submission to the home office.",
    responsibilities: [
      { role: R_CSC, duty: "Prepares forms, checks completeness, obtains signatures, submits, and tracks status." },
      { role: R_ADV, duty: "Reviews and approves applications before submission." },
      { role: R_OPS, duty: "Handles home office exceptions and escalations." },
    ],
    procedure: [
      "Log the application in the Service Request Tracker with a reference number.",
      "Pre-fill forms from verified CRM data only. Never guess missing information.",
      "Complete the completeness checklist: all fields, signatures, dates, and required attachments.",
      "Send the forms to the client for signature through the approved method and set a follow-up date.",
      "Submit to the advisor for review and approval.",
      "Submit through the approved channel and record the submission date and confirmation.",
      "Track status daily and follow up on any 'not in good order' notices within 1 business day.",
      "Confirm completion with the client and close the tracker entry with the resolution date.",
    ],
    qc: ["Completeness checklist signed off before submission", "Advisor approval recorded", "Submission confirmation filed", "Turnaround time recorded for reporting"],
    outputs: ["Submitted application with confirmation", "Updated tracker entry", "Client notified of status"],
  },
  {
    code: "SOP-03", slug: "Service-Request-Management", title: "Service Request Management",
    purpose: "To receive, prioritize, process, and close client service requests (such as address, contact, or beneficiary updates) within target timelines.",
    scope: "Applies to all client account maintenance and service requests received by phone, email, or meeting.",
    responsibilities: [
      { role: R_CSC, duty: "Logs, prioritizes, processes, follows up, and closes requests." },
      { role: R_OPS, duty: "Supports complex requests and home office coordination." },
      { role: R_ADV, duty: "Approves requests that need advisor sign-off." },
    ],
    procedure: [
      "Log the request immediately with reference number, category, client, date received, and priority.",
      "Verify the requester's identity following firm procedures before discussing or changing any account information.",
      "Send an acknowledgment to the client with the expected timeline within 1 business day.",
      "List the pending requirements and request them from the client or department.",
      "Process the request and update the status at each stage.",
      "Follow up on items pending with the client or home office at least every 2 business days.",
      "Escalate requests at risk of missing the target date (SOP-09).",
      "Close the request with a resolution date and send the Issue Resolution confirmation.",
    ],
    qc: ["No request without a reference number", "Overdue report reviewed daily", "Resolution confirmed with the client", "Monthly on-time rate reported"],
    outputs: ["Closed request with full history", "Client confirmation sent", "Data for KPI reporting"],
  },
  {
    code: "SOP-04", slug: "Post-Meeting-Administrative-Procedures", title: "Post-Meeting Administrative Procedures",
    purpose: "To make sure every client meeting is followed by documented notes, assigned action items, and timely delivery of promised materials.",
    scope: "Applies to all client meetings, reviews, and calls held by advisors in the practice.",
    responsibilities: [
      { role: R_ADV, duty: "Provides the meeting summary and approves client-facing recaps." },
      { role: R_CSC, duty: "Creates action items, prepares paperwork, sends recaps, and tracks deliverables." },
      { role: R_OPS, duty: "Completes assigned processing tasks." },
    ],
    procedure: [
      "Within 24 hours, record the meeting summary in the CRM.",
      "Break the summary into action items, each with an owner, due date, and required documents.",
      "Prepare any forms or paperwork discussed and route them for signature.",
      "Send the advisor-approved recap email to the client within 2 business days.",
      "Create follow-up reminders for each client deliverable.",
      "Review open post-meeting items daily and follow up on overdue items.",
      "Close the meeting record when all action items are complete.",
    ],
    qc: ["Notes logged within 24 hours", "Every action item has an owner and date", "Recap approved by the advisor before sending"],
    outputs: ["Meeting record", "Action item list", "Client recap email", "Completed paperwork"],
  },
  {
    code: "SOP-05", slug: "Client-Communication-Guidelines", title: "Client Communication Guidelines",
    purpose: "To keep all client communication professional, accurate, timely, consistent, and properly documented.",
    scope: "Applies to email, phone, and other approved channels used with clients and internal teams.",
    responsibilities: [
      { role: R_CSC, duty: "Uses approved templates, responds within service standards, and logs communication." },
      { role: R_ADV, duty: "Handles any discussion of financial advice or recommendations." },
    ],
    procedure: [
      "Respond to client emails and voicemails within 1 business day, even if only to acknowledge.",
      "Use approved templates and personalize them for the situation.",
      "Never give financial advice or recommendations. Refer those questions to the advisor.",
      "Never send sensitive personal or account information by unsecured email.",
      "Proofread for names, dates, and accuracy before sending.",
      "Log every client communication in the CRM with date, channel, and summary.",
      "Use a warm, clear, and professional tone. Confirm next steps and timelines.",
    ],
    qc: ["Template use spot-checked weekly", "Response-time tracking", "No advice language in coordinator messages"],
    outputs: ["Consistent client communication", "Complete communication log"],
  },
  {
    code: "SOP-06", slug: "Appointment-Scheduling", title: "Appointment Scheduling",
    purpose: "To schedule, confirm, remind, and reschedule client appointments accurately across time zones.",
    scope: "Applies to all advisor calendars and client appointments, including remote scheduling from outside the U.S. Pacific time zone.",
    responsibilities: [
      { role: R_CSC, duty: "Manages calendars, sends invitations and reminders, and handles reschedules." },
      { role: R_ADV, duty: "Keeps availability blocks up to date." },
    ],
    procedure: [
      "Always schedule in the advisor's local time (Pacific Time) and confirm the client's time zone.",
      "Check the advisor's availability and buffer rules before offering times.",
      "Book the appointment with the type, mode (video, phone, or office), and agenda.",
      "Send the calendar invitation and the Appointment Confirmation email.",
      "Send a reminder 24 hours before the appointment.",
      "For reschedules, offer two to three alternatives, update the calendar, and send the Rescheduling template.",
      "After the meeting, mark it completed and start the post-meeting workflow (SOP-04).",
    ],
    qc: ["No double bookings", "Time zone stated in every confirmation", "Reminders sent for all appointments"],
    outputs: ["Accurate advisor calendars", "Confirmed appointments", "Reduced no-shows"],
  },
  {
    code: "SOP-07", slug: "Electronic-Filing-and-Document-Management", title: "Electronic Filing and Document Management",
    purpose: "To store client documents in a consistent, secure, and searchable way with clear version control.",
    scope: "Applies to all client documents received, created, or scanned by the practice.",
    responsibilities: [
      { role: R_CSC, duty: "Names, files, versions, and maintains document status." },
      { role: R_OPS, duty: "Reviews access permissions and retention." },
    ],
    procedure: [
      "Name files as LASTNAME_Firstname_DOCTYPE_YYYYMMDD_vN (example: BENNETT_Olivia_APPFORM_20260115_v1).",
      "File each document in the client folder under the correct category.",
      "Set the status: Received, Under Review, Verified, or Archived.",
      "Upload new versions with an increased version number. Do not overwrite or duplicate.",
      "Scan paper documents at a readable resolution and confirm legibility before shredding, as allowed by firm policy.",
      "Keep sensitive categories in restricted folders according to access rules.",
      "Run a monthly check for misfiled or unnamed documents.",
    ],
    qc: ["Monthly naming audit", "Access permissions reviewed quarterly", "No documents saved to personal devices"],
    outputs: ["Organized, searchable client folders", "Clear version history"],
  },
  {
    code: "SOP-08", slug: "Confidential-Information-Handling", title: "Confidential Information Handling",
    purpose: "To protect client personal and account information in daily administrative work.",
    scope: "Applies to all client information in any format: digital, paper, and verbal.",
    responsibilities: [
      { role: R_CSC, duty: "Follows confidentiality practices and reports incidents immediately." },
      { role: R_OPS, duty: "Maintains access controls and handles incident response with the firm's compliance contacts." },
    ],
    procedure: [
      "Access only the information needed for the task (minimum necessary access).",
      "Verify identity before discussing any account information by phone.",
      "Use only firm-approved systems and secure channels for sensitive information.",
      "Lock screens when away. Use a private workspace for calls, especially when working remotely.",
      "Do not store client data on personal devices or personal cloud accounts.",
      "Dispose of paper records using approved shredding.",
      "Report any suspected data incident to the supervisor immediately.",
    ],
    qc: ["Periodic self-check against this SOP", "Access reviews", "Incident log reviewed"],
    outputs: ["Protected client information", "Documented incidents and responses"],
  },
  {
    code: "SOP-09", slug: "Administrative-Issue-Escalation", title: "Administrative Issue Escalation",
    purpose: "To escalate administrative issues early and to the right person so client service is not delayed.",
    scope: "Applies to requests at risk of missing target dates, home office exceptions, client complaints, and system issues.",
    responsibilities: [
      { role: R_CSC, duty: "Identifies, documents, and escalates issues, and keeps the client informed." },
      { role: R_OPS, duty: "Resolves or escalates further to the home office." },
      { role: R_ADV, duty: "Handles client relationship concerns and any advice-related questions." },
    ],
    procedure: [
      "Level 1: The coordinator resolves routine issues within 1 business day.",
      "Level 2: If not resolved, or if the target date is at risk, escalate to the Operations Lead with a written summary.",
      "Level 3: Complaints, potential errors, or client-impacting delays go to the advisor the same day.",
      "Document every escalation with date, issue, action taken, and owner.",
      "Update the client on the status without speculating about the outcome.",
      "Close the escalation once resolved and note the lessons learned.",
    ],
    qc: ["Escalation log reviewed weekly", "No issue open without an owner"],
    outputs: ["Timely resolution", "Escalation log", "Process improvement ideas"],
  },
  {
    code: "SOP-10", slug: "Weekly-and-Monthly-Reporting", title: "Weekly and Monthly Reporting",
    purpose: "To give the practice accurate, consistent reports on client service workload and performance.",
    scope: "Applies to the weekly operations report and the monthly performance report.",
    responsibilities: [
      { role: R_CSC, duty: "Prepares the reports from the trackers and highlights exceptions." },
      { role: R_ADV, duty: "Reviews the reports and agrees on actions." },
    ],
    procedure: [
      "Every Friday, make sure all trackers are up to date.",
      "Refresh the KPI Dashboard: total, completed, pending, and overdue requests; average turnaround; completion rate; on-time rate.",
      "List overdue items with owner and next action.",
      "Summarize upcoming appointments for the next week.",
      "On the first business day of each month, prepare the Monthly Performance Report with trends.",
      "Share the reports and record agreed actions.",
    ],
    qc: ["Numbers reconciled to the tracker", "Formulas checked monthly", "Reports sent on schedule"],
    outputs: ["Weekly operations report", "Monthly performance report", "Action list"],
  },
];

export const INTERVIEW: { topic: string; q: string; a: string }[] = [
  { topic: "Introduction", q: "Tell me about yourself.", a: "I'm an administrative and operations professional with 18 years in public service. My work centered on processing applications, maintaining confidential records, preparing documents and reports, and coordinating meetings. Before that, I worked in a call center from 2007 to 2008, handling customer concerns by phone, email, and chat, and in 2016 I taught English online as an ESL teacher. I enjoy work that needs organization and follow-through, and I'm now bringing those skills to client service in a financial advisory practice. I built this portfolio to show exactly how I would support your advisors and clients." },
  { topic: "Motivation", q: "Why do you want this Client Service Coordinator role?", a: "The role combines what I do best: accurate paperwork, organized records, and caring follow-up with people. A financial advisory practice relies on trust and precision, and that matches how I have worked for 18 years. I also like that the role includes process improvement and Excel and PowerPoint work." },
  { topic: "Industry transition", q: "You have not worked in financial services. How will you get up to speed?", a: "I'll be upfront: I haven't worked in financial services or on Ameriprise platforms. I have learned many government systems, regulations, and procedures over my career, and I learn quickly when I have documentation. My plan is to study the practice's workflows and forms in the first 30 days, keep my own process notes, ask questions early, and complete any required training. I will never guess on a regulated process. I'll ask and follow the procedure." },
  { topic: "Client service", q: "How do you define excellent client service?", a: "Clients should feel heard, know what happens next, and never have to chase us. In practice that means acknowledging requests quickly, giving a realistic timeline, following up before the client asks, and confirming once the request is resolved." },
  { topic: "Client service", q: "Describe a time you went beyond expectations for a client or member of the public.", a: "[Use a real example from your public service. Structure it as Situation, Task, Action, Result. For example: a person with an urgent application missing a requirement, how you explained the options, coordinated with the right office, and followed up, and what the outcome was.]" },
  { topic: "Difficult clients", q: "How do you handle an upset or difficult client?", a: "I stay calm, let them finish, and acknowledge the frustration without being defensive. Then I restate the issue to confirm I understand it, explain what I can do and by when, and follow through. In the call center and in public service I learned that most frustration comes from uncertainty, so clear next steps calm things down. If the issue is outside my role, such as advice questions, I connect them to the advisor quickly." },
  { topic: "Difficult clients", q: "What would you do if a client demanded information you aren't allowed to share?", a: "I would politely explain that I need to follow our verification and privacy procedures to protect their information. Then I'd offer the right way forward, such as completing verification or having the advisor call them back. I would never bend the rules to make a conversation easier." },
  { topic: "Administrative management", q: "How do you keep track of many outstanding items at once?", a: "I use one tracker as the single source of truth. Every item gets a reference, owner, target date, and pending requirements. I review it every morning, sort by due date and priority, and send follow-ups before items become overdue. My Service Request Tracker demo shows exactly this approach." },
  { topic: "Competing deadlines", q: "How do you manage competing deadlines?", a: "I sort by client impact and due date first. Time-sensitive client paperwork and meeting preparation usually come first. I break large tasks into steps, and if two priorities truly conflict, I tell the advisor early and ask which comes first instead of quietly missing one." },
  { topic: "Competing deadlines", q: "Tell me about a time you missed a deadline or nearly did.", a: "[Use an honest real example. Focus on how you communicated early, what you did to recover, and what you changed in your process afterward.]" },
  { topic: "CRM", q: "What is your experience with CRM systems?", a: "My records experience comes mainly from government databases and the customer management system I used in the call center. The principles are the same: accurate data entry, logging every interaction, and using tasks and reminders. I built a working CRM demo in this portfolio to show how I organize client profiles, interactions, and follow-ups. I'm ready to learn the specific CRM your practice uses." },
  { topic: "CRM", q: "How do you keep client records accurate?", a: "I search before creating records to avoid duplicates, use required fields and standard formats, verify changes against the client's signed request or confirmed details, and log the source of every update. I also do a periodic clean-up review for missing fields or outdated contact information." },
  { topic: "Confidential information", q: "How do you handle confidential information?", a: "For 18 years I handled confidential records in public service, so discretion is a habit for me. I access only what I need, verify identity before discussing anything, use approved systems only, keep a private workspace for calls, and never store client data on personal devices. If something seems wrong, I report it right away." },
  { topic: "Confidential information", q: "Working remotely from the Philippines, how would you protect client data?", a: "I would work only within the firm's approved systems and devices or secure access setup, in a private room with a locked screen policy, on a secured network. I would never download client files to personal storage. I'd follow every security requirement the practice and its partners set, and I'm comfortable with monitoring or audits." },
  { topic: "Appointment coordination", q: "How would you manage advisor calendars across time zones?", a: "I would schedule everything in Pacific Time, which is the advisor's time zone, and state the time zone in every confirmation. Manila is 16 hours ahead of Pacific during U.S. daylight saving time and 15 hours ahead otherwise, and I track the change dates. My calendar demo includes a converter for this. I'd also send confirmations and 24-hour reminders to reduce no-shows." },
  { topic: "Appointment coordination", q: "A client cancels an hour before a review meeting. What do you do?", a: "I'd thank them for letting us know, offer two or three new times right away, update the advisor's calendar, and tell the advisor. I'd send the rescheduling confirmation and note the reason in the CRM. If preparation materials were ready, I'd keep them for the new date." },
  { topic: "Remote work", q: "How do you stay productive and reachable when working remotely?", a: "I keep a fixed schedule aligned with the practice's hours, a dedicated workspace, and a reliable internet connection with a backup. I post my status in the team's chat tool, respond quickly, and send a short end-of-day update on open items. I worked remotely as an online teacher, so I'm used to being self-managed across time zones." },
  { topic: "Remote work", q: "Can you work U.S. Pacific business hours?", a: "I work remotely from the Philippines (UTC+8), and I'm open to part-time or flexible hours. I can work an agreed schedule that covers the practice's key Pacific Time hours, and I'd confirm the exact hours with you before starting." },
  { topic: "Process improvement", q: "Give an example of a process you improved.", a: "[Use a real example from your public service work, such as simplifying a requirements checklist, creating a tracking log, or reducing processing steps. Describe what you changed and the outcome without sensitive details. Don't overstate numbers you can't support.]" },
  { topic: "Process improvement", q: "If you joined us, how would you identify improvements?", a: "First I would learn and follow the current process exactly. After about 30 days, I'd note repeated delays, double data entry, and frequent client questions. Then I'd suggest small, low-risk changes such as templates, checklists, or tracker improvements, and only make changes with the advisor's approval." },
  { topic: "Microsoft Excel", q: "How do you use Excel in administrative work?", a: "I use Excel for trackers and reports: tables with filters, data validation for consistent entries, conditional formatting to highlight overdue items, and formulas such as COUNTIFS, SUMIFS, AVERAGEIFS, IF, and XLOOKUP or VLOOKUP for KPIs. My portfolio workbook has nine linked sheets with formulas for completion rate, on-time rate, and average turnaround time." },
  { topic: "Microsoft PowerPoint", q: "How would you prepare a client meeting presentation?", a: "I'd start from the practice's approved template, fill in client details and administrative items from the CRM, and leave advisor-only sections, such as goals and recommendations, as clearly marked placeholders. I'd check every name and figure, then send it to the advisor for review well before the meeting. My sample deck shows this structure." },
  { topic: "Document management", q: "How do you organize electronic files?", a: "I use a consistent naming convention with last name, first name, document type, date, and version. I file into client folders by category, track status, and upload new versions instead of creating duplicates. I also do a monthly check for misfiled documents. My document management demo shows the naming builder and audit log." },
  { topic: "Workflow automation", q: "What is your experience with workflow automation?", a: "I've built demonstration workflows in n8n that connect tools such as Google Forms, Sheets, Calendar, and Trello for intake, reminders, and weekly reports, using test data only. In a regulated environment, I'd only suggest automations that use approved systems and get proper sign-off, but even simple templates and reminders can save a lot of time." },
  { topic: "Attention to detail", q: "How do you make sure paperwork is complete and accurate before submission?", a: "I use a completeness checklist for each form type: every field, signature, date, and attachment. I compare the information with verified records and do a final read-through. In my chemical technician and government work, I learned that one missed field can delay everything, so I check before submitting, not after." },
  { topic: "Teamwork", q: "How do you coordinate with other departments to resolve an issue?", a: "I gather the facts first, contact the right person with a clear and concise summary of what's needed and by when, and log the contact. I follow up on the agreed date. I've coordinated across government offices for years, and being clear, polite, and persistent gets results." },
  { topic: "Closing", q: "Where do you see yourself in a few years?", a: "Growing within the practice as a trusted operations and client service resource, taking on more responsibility, special projects, and process improvement, and continuing to learn the financial services side of the business." },
  { topic: "Closing", q: "Do you have any questions for us?", a: "Examples: What does a typical week look like for this role? Which CRM and systems does the practice use, and what training is available? How do you measure success in the first 90 days? What are the biggest administrative challenges right now? What are the expected working hours for a remote team member?" },
];

export const SELF_INTRO =
  "Hello, I'm Maria Bio. For 18 years I've worked in public service, where my job was keeping things organized and moving: processing applications, maintaining confidential records, preparing official documents and reports, and coordinating meetings and follow-ups. Before that, I worked in a call center helping customers by phone, email, and chat, and I've also taught English online, so clear and patient communication is something I practice every day. I hold a Master in Management in Public Administration, and I'm a licensed professional teacher, a registered chemical technician, and a registered criminologist. Those credentials all reflect the same habits: accuracy, integrity, and discretion. I'm excited about this Client Service Coordinator role because it brings these strengths together: tracking client paperwork through to completion, keeping CRM records accurate, coordinating advisor calendars, and preparing meeting materials in Excel and PowerPoint. I built a portfolio of working demonstrations to show exactly how I'd support your advisors and clients, and I'd love to walk you through it.";

export const PLAN_30_60_90 = [
  { phase: "Days 1–30: Learn", items: ["Complete all onboarding, compliance, privacy, and systems training", "Learn the practice's CRM, forms, and home office workflows", "Shadow the current processes and document them in my own notes", "Take ownership of calendar management and client communication logging", "Build relationships with advisors and team members; agree on communication preferences"] },
  { phase: "Days 31–60: Contribute", items: ["Independently process routine service requests and applications", "Own the post-meeting workflow: recaps, action items, and paperwork tracking", "Maintain the outstanding-items tracker with proactive follow-ups", "Prepare meeting materials and presentations for advisor review", "Start the weekly operations report"] },
  { phase: "Days 61–90: Improve", items: ["Run the full client service workflow with minimal supervision", "Propose two or three small improvements, such as templates, checklists, or tracker fields, for approval", "Draft or update SOPs for the processes I own", "Deliver the first monthly performance report", "Review progress with my supervisor and set goals for the next quarter"] },
];

export const REFERENCES_TEMPLATE = [
  { name: "[Reference Full Name]", title: "[Position / Title]", org: "[Organization]", relationship: "[e.g., Former direct supervisor, 20XX–20XX]", phone: "[Phone]", email: "[Email]" },
  { name: "[Reference Full Name]", title: "[Position / Title]", org: "[Organization]", relationship: "[e.g., Department head / colleague]", phone: "[Phone]", email: "[Email]" },
  { name: "[Reference Full Name]", title: "[Position / Title]", org: "[Organization]", relationship: "[e.g., Call center team leader]", phone: "[Phone]", email: "[Email]" },
];

export const SKILLS_MATRIX = [
  { req: "Prepare, process, and track client applications and service requests", evidence: "18 years processing applications in public service; Projects 2 and 3", level: "Strong" },
  { req: "Post-meeting administration and tracking deliverables", evidence: "Meeting coordination and minutes in public service; Project 4", level: "Strong" },
  { req: "Coordinate with the home office and other departments", evidence: "Inter-office coordination in government; SOP-09 escalation", level: "Strong" },
  { req: "Maintain client records (address, beneficiary, contact)", evidence: "Confidential records and database management; Projects 1 and 9", level: "Strong" },
  { req: "Monitor outstanding requests and follow up", evidence: "Monitoring and reporting duties; Project 3 overdue alerts", level: "Strong" },
  { req: "Maintain CRM systems and document interactions", evidence: "Call center customer management system; Project 1", level: "Developing (platform-specific training needed)" },
  { req: "Client communication by phone and email", evidence: "Call center phone, email, and chat support (2007–2008); online ESL teaching; Project 6", level: "Strong" },
  { req: "Coordinate appointments and advisor calendars", evidence: "Meeting and activity coordination; Project 5", level: "Strong" },
  { req: "Prepare meeting materials and presentations", evidence: "Licensed teacher; report preparation; Project 8", level: "Strong" },
  { req: "Excel and PowerPoint for reporting", evidence: "Project 7 workbook with formulas; Project 8 deck", level: "Proficient" },
  { req: "Electronic filing, scanning, and record maintenance", evidence: "Records management; Project 9 and SOP-07", level: "Strong" },
  { req: "Process improvement and efficiency", evidence: "Plans and policy development; Projects 10 and 11", level: "Strong" },
  { req: "Ameriprise / financial services platform experience", evidence: "None yet. Committed to completing all required training.", level: "Gap (to be learned)" },
];

export const COVER_LETTER = {
  date: "November 25, 2026",
  to: ["Hiring Team", "The Jambalaya Group (recruiting on behalf of MethodM Wealth)", "Re: Client Service Coordinator"],
  greeting: "Dear Hiring Team,",
  paragraphs: [
    "I am writing to apply for the Client Service Coordinator position supporting MethodM Wealth's financial advisory practice. I bring 18 years of public service experience in administrative and operational management, application processing, confidential records management, and reporting, plus call center customer service experience. I would welcome the chance to help your advisors and clients with organized, accurate, and timely administrative support.",
    "In public service, I processed applications and service requests from start to finish. I checked documents for completeness, followed up on missing requirements, and kept confidential records accurate and secure. I prepared official documents and reports, monitored pending transactions, coordinated meetings and their action items, and helped develop written procedures and policies. These responsibilities closely match the core of this role: tracking client applications and forms, managing post-meeting paperwork, maintaining client records, and following up proactively.",
    "My call center and online teaching experience strengthened my professional phone, email, and chat communication. I am calm with frustrated callers, clear about next steps, and careful to document every interaction. I also hold a Master in Management in Public Administration and am a Licensed Professional Teacher, Registered Chemical Technician, and Registered Criminologist, credentials that reflect my habits of accuracy, integrity, and discretion.",
    "To be transparent, I have not yet worked in financial services or on Ameriprise platforms. To show how I would approach the work, I built an independent portfolio of working demonstrations using entirely fictional data: a CRM, an onboarding tracker, a service request tracker with overdue alerts, a post-meeting workflow, a cross-time-zone calendar, an Excel reporting workbook with KPI formulas, a client meeting presentation, and ten written SOPs. I learn new systems quickly and am fully committed to completing any training and following every procedure your practice requires. I work remotely from the Philippines (UTC+8) and am open to part-time or flexible hours on an agreed schedule that covers your practice's key business hours.",
    "Thank you for your time and consideration. My portfolio is available at https://maria-bio-portfolio.vercel.app, and I would be glad to walk you through it in an interview.",
  ],
  closing: "Sincerely,",
};
