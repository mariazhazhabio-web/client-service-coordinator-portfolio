/*
 * Case studies for the 12 portfolio demonstrations.
 * "Expected benefits" are design goals of each demo, NOT measured results.
 */

export type Project = {
  n: number;
  slug: string;
  title: string;
  short: string;
  icon: string;
  problem: string;
  objective: string;
  solution: string;
  tools: string[];
  workflow: string[];
  features: string[];
  benefits: string[];
  responsibilities: string[];
  download: { label: string; href: string };
};

export const PROJECTS: Project[] = [
  {
    n: 1, slug: "crm", title: "Client Relationship Management System", short: "Client profiles, interaction history, tasks, follow-ups and analytics in one view.", icon: "Users",
    problem: "Client details, interaction notes, and follow-up dates often live in separate inboxes, spreadsheets, and sticky notes, so follow-ups are missed and advisors walk into meetings without context.",
    objective: "Keep one accurate, searchable record per client with contact details, assigned advisor, interaction history, open service requests, and scheduled follow-ups.",
    solution: "A browser-based CRM demo with searchable client profiles, add/edit forms, interaction logging, task assignment, and summary analytics. Data is saved in the browser's local storage.",
    tools: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Recharts", "LocalStorage"],
    workflow: ["Receive new client details or an update", "Search for the existing record to avoid duplicates", "Add or edit the profile and confirm the assigned advisor", "Log every call, email, and meeting as an interaction", "Create follow-up tasks with owner and due date", "Review the dashboard for due and overdue follow-ups"],
    features: ["Search by name, email, ID, or city", "Filter by status and advisor", "Add and edit client profiles", "Interaction history with logging form", "Task assignment and completion", "Linked service requests", "Status and advisor analytics charts", "Reset to sample data"],
    benefits: ["Fewer missed follow-ups through due-date visibility", "Faster meeting prep with interaction history in one place", "Cleaner data through duplicate checks and required fields"],
    responsibilities: ["Maintain CRM systems and document client interactions", "Maintain accurate client records", "Process client contact information updates", "Monitor outstanding requests and follow up"],
    download: { label: "Client Master List (XLSX)", href: "/downloads/excel/Client-Service-Admin-Reporting-System.xlsx" },
  },
  {
    n: 2, slug: "onboarding", title: "Client Onboarding System", short: "Registration form, document checklist, verification status and progress tracking.", icon: "UserPlus",
    problem: "New-client onboarding stalls when required documents are missing and no one can see who is responsible for the next step.",
    objective: "Give every new client a clear checklist, a visible progress indicator, and named owners for each verification step.",
    solution: "A digital onboarding workflow: register a new (fictional) client, track mock document submissions, mark verification, see missing requirements, and trigger a simulated completion notice.",
    tools: ["React", "TypeScript", "Tailwind CSS", "LocalStorage"],
    workflow: ["Register the new client with required fields validated", "Generate the standard onboarding checklist", "Record each mock document as received", "Verify documents and note any issues", "Follow up on missing requirements", "Mark complete and send the (simulated) welcome notice"],
    features: ["Validated registration form", "Auto-generated checklist", "Document submission tracking", "Verification status per item", "Missing requirements list", "Assigned personnel per step", "Progress bar", "Completion notification simulation"],
    benefits: ["Clear status for every onboarding case", "Fewer back-and-forth requests for missing documents", "Consistent onboarding experience"],
    responsibilities: ["Prepare, process, and track client applications and forms", "Coordinate with internal departments", "Maintain accurate client records"],
    download: { label: "Client Onboarding SOP (DOCX)", href: "/downloads/sops/SOP-01-Client-Onboarding-Procedure.docx" },
  },
  {
    n: 3, slug: "service-requests", title: "Client Application & Service Request Tracker", short: "Kanban and table views with priorities, SLAs, follow-up history and overdue alerts.", icon: "ClipboardList",
    problem: "Account maintenance requests and applications pass through several hands. Without one tracker, requests sit in 'pending' and clients chase the office for updates.",
    objective: "Track every request from receipt to resolution with a reference number, owner, target date, pending requirements, and follow-up history.",
    solution: "A tracker with Kanban and table views, drag-free status changes, overdue alerts, follow-up logging, and KPI cards for totals, overdue items, and turnaround time.",
    tools: ["React", "TypeScript", "Tailwind CSS", "LocalStorage"],
    workflow: ["Log the request and auto-assign a reference number", "Set category, priority, owner, and target date", "List pending requirements", "Follow up and log each contact", "Move the request through each status", "Close with a resolution date and confirm with the client"],
    features: ["Kanban view by status", "Sortable, filterable table view", "Auto reference numbers", "Priority and target date", "Pending requirements checklist", "Follow-up history", "Resolution date capture", "Overdue alerts and KPI cards", "CSV export"],
    benefits: ["Overdue items are visible before clients need to ask", "Measurable turnaround and on-time rates", "Clean handoffs between team members"],
    responsibilities: ["Prepare, process, and track client applications, forms, and service requests", "Monitor outstanding requests and follow up", "Coordinate with the home office on account maintenance"],
    download: { label: "Service Request Tracker (XLSX)", href: "/downloads/excel/Client-Service-Admin-Reporting-System.xlsx" },
  },
  {
    n: 4, slug: "post-meeting", title: "Post-Meeting Administrative Workflow", short: "Meeting summaries become owned action items, document lists and reminders.", icon: "ListChecks",
    problem: "After client meetings, paperwork and promised deliverables can slip because action items are not recorded in one place right away.",
    objective: "Turn each meeting into a documented summary with owned, dated action items, required documents, and client deliverables.",
    solution: "A workflow board for each fictional meeting: summary, action items, owners, required documents, deliverables, completion status, and a simulated reminder engine.",
    tools: ["React", "TypeScript", "Tailwind CSS", "LocalStorage"],
    workflow: ["Capture the meeting summary within 24 hours", "Break it into action items with owners and due dates", "List required documents and client deliverables", "Send the recap (template) to the client", "Run reminders for items due or overdue", "Close the meeting record once every item is complete"],
    features: ["Meeting list with completion %", "Editable summary", "Add, assign, and complete action items", "Required document tags", "Client deliverable flag", "Automated reminder simulation log"],
    benefits: ["Every meeting has a clear, documented next step", "Advisors spend less time chasing paperwork", "Clients receive consistent recaps"],
    responsibilities: ["Manage post-meeting administrative tasks", "Process paperwork and track outstanding client deliverables"],
    download: { label: "Post-Meeting SOP (DOCX)", href: "/downloads/sops/SOP-04-Post-Meeting-Administrative-Procedures.docx" },
  },
  {
    n: 5, slug: "calendar", title: "Appointment & Calendar Management", short: "Advisor calendars with day, week and month views and California ↔ Philippines time conversion.", icon: "CalendarDays",
    problem: "A remote coordinator in the Philippines who supports a California practice must schedule accurately across a 15–16 hour time difference and handle frequent reschedules.",
    objective: "Show advisor availability clearly, book and reschedule appointments without conflicts, and always display both Pacific and Philippine times.",
    solution: "An interactive scheduler with advisor filters, daily, weekly, and monthly views, conflict checks, availability settings, reminder simulation, and a live time zone converter.",
    tools: ["React", "TypeScript", "Intl.DateTimeFormat (time zones)", "LocalStorage"],
    workflow: ["Check advisor availability", "Book the appointment in Pacific Time", "Run the conflict check", "Send the (simulated) invitation and confirmation", "Send the reminder 24 hours before", "Reschedule or mark complete as needed"],
    features: ["Day, week, and month views", "Filter by advisor", "Create, reschedule, and cancel appointments", "Double-booking prevention", "Advisor working-hours settings", "Reminder simulation", "Pacific ↔ Philippine time converter with DST handling"],
    benefits: ["Fewer scheduling errors across time zones", "Faster rescheduling", "Clear calendars for advisors"],
    responsibilities: ["Coordinate client appointments, advisor calendars, and meeting schedules", "Communicate professionally through email and phone"],
    download: { label: "Appointment Schedule (XLSX)", href: "/downloads/excel/Client-Service-Admin-Reporting-System.xlsx" },
  },
  {
    n: 6, slug: "communications", title: "Client Communication Center", short: "Nine editable templates with merge fields, preview and communication history.", icon: "Mail",
    problem: "Writing every client email from scratch takes time and leads to inconsistent tone, missing details, and typos.",
    objective: "Provide approved, editable templates with merge fields so every message is accurate, professional, and logged.",
    solution: "A communication center with nine templates, merge-field fill from fictional client records, a live preview, a copy button, and a communication history. No email is ever sent.",
    tools: ["React", "TypeScript", "Clipboard API", "LocalStorage"],
    workflow: ["Choose the template that matches the situation", "Select the client to fill merge fields", "Edit the text for the specific case", "Proofread in the preview", "'Send' (simulated) and log to history", "Set a follow-up if a reply is needed"],
    features: ["9 editable templates", "Merge fields ({{ClientName}}, etc.)", "Live preview", "Copy to clipboard", "Simulated send with history log", "Search history"],
    benefits: ["Consistent, professional tone", "Faster response times", "A full record of client communications"],
    responsibilities: ["Communicate professionally through email and phone", "Document client interactions"],
    download: { label: "Communication Guidelines SOP (DOCX)", href: "/downloads/sops/SOP-05-Client-Communication-Guidelines.docx" },
  },
  {
    n: 7, slug: "excel-reporting", title: "Excel Administrative Reporting System", short: "A real XLSX workbook: 9 worksheets, live formulas, filters, formatting and charts.", icon: "FileSpreadsheet",
    problem: "Weekly and monthly status reports are often rebuilt by hand, which causes errors and inconsistent numbers.",
    objective: "Build a workbook where KPIs calculate automatically from the trackers, so reports stay consistent and current.",
    solution: "A generated Excel workbook with nine linked worksheets. KPIs use COUNTIFS, AVERAGEIFS, and IF formulas. Tables have filters and conditional formatting. Charts are included as images, and a browser preview recalculates the same KPIs.",
    tools: ["Microsoft Excel", "ExcelJS", "Node.js"],
    workflow: ["Enter or paste data into each tracker", "Formulas update KPIs automatically", "Filter by status, owner, or category", "Review conditional formatting for overdue items", "Copy the KPI dashboard into the weekly report"],
    features: ["Client Master List", "Application Tracker", "Service Request Tracker", "Pending Requirements", "Appointment Schedule", "Follow-up Tracker", "Staff Task Assignment", "Monthly Performance Report", "KPI Dashboard with formulas"],
    benefits: ["Consistent numbers in every report", "Less manual counting", "Easy hand-off to other team members"],
    responsibilities: ["Use Microsoft Excel for reporting and administrative support", "Monitor outstanding requests"],
    download: { label: "Admin Reporting Workbook (XLSX)", href: "/downloads/excel/Client-Service-Admin-Reporting-System.xlsx" },
  },
  {
    n: 8, slug: "presentation", title: "Client Meeting Presentation", short: "An editable PowerPoint client meeting deck, built as administrative support.", icon: "Presentation",
    problem: "Advisors need well-organized, on-brand meeting materials prepared ahead of time, with administrative items clearly listed.",
    objective: "Prepare a complete, editable client meeting deck that the advisor finalizes. The coordinator never writes recommendations.",
    solution: "A generated PowerPoint deck (12 slides) with agenda, client profile summary, account service overview, outstanding requirements, placeholders for advisor content, documents, next steps, and follow-up schedule.",
    tools: ["Microsoft PowerPoint", "PptxGenJS", "Node.js"],
    workflow: ["Pull client details and open items from the CRM", "Fill the deck template", "Leave advisor-only sections as clearly marked placeholders", "Advisor reviews and approves", "Print or share materials before the meeting"],
    features: ["Agenda", "Client profile summary", "Account service overview", "Outstanding requirements", "Financial goals placeholder (advisor)", "Advisor-approved recommendations placeholder", "Required documentation", "Next steps and follow-up schedule", "Disclaimer slide"],
    benefits: ["Advisors walk into meetings prepared", "Consistent, professional materials", "Administrative items are never forgotten"],
    responsibilities: ["Prepare client meeting materials and presentations", "Use PowerPoint for administrative support"],
    download: { label: "Client Meeting Deck (PPTX)", href: "/downloads/presentations/Client-Meeting-Presentation-Demo.pptx" },
  },
  {
    n: 9, slug: "documents", title: "Electronic Document Management System", short: "Client folders, naming conventions, versions, role-based access and audit history.", icon: "FolderLock",
    problem: "Files saved with inconsistent names in shared folders are hard to find, versions get mixed up, and there is no record of who accessed what.",
    objective: "Demonstrate organized client folders, a strict naming convention, version tracking, role-based access, and an audit trail.",
    solution: "A simulated DMS: client folders, categories, status, mock uploads with automatic file naming, search, version history, a role switcher that shows access control, and an audit log of every action.",
    tools: ["React", "TypeScript", "LocalStorage"],
    workflow: ["Receive the document", "Rename it with the naming convention", "File it in the client folder and category", "Set status (Received, Under Review, Verified)", "Upload new versions instead of duplicates", "Review the audit log regularly"],
    features: ["Client folders", "Document categories", "Status tracking", "Upload simulation (file name only, contents never read)", "Search", "Version tracking", "Naming convention builder", "Per-client document checklist", "Role-based access demo", "Audit history"],
    benefits: ["Documents found in seconds", "No confusion between versions", "Access and audit concepts shown clearly"],
    responsibilities: ["Perform electronic filing and document management", "Maintain accurate client records", "Handle confidential information"],
    download: { label: "Electronic Filing SOP (DOCX)", href: "/downloads/sops/SOP-07-Electronic-Filing-and-Document-Management.docx" },
  },
  {
    n: 10, slug: "sops", title: "Administrative Standard Operating Procedures", short: "Ten SOPs in DOCX and PDF covering onboarding to monthly reporting.", icon: "BookOpenCheck",
    problem: "When procedures exist only in people's heads, quality varies and new team members take longer to become productive.",
    objective: "Document the core client service procedures in a consistent format: purpose, scope, responsibilities, procedure, quality control, and expected outputs.",
    solution: "Ten professionally formatted SOPs generated as editable Word files and PDFs, plus an in-browser reader.",
    tools: ["Microsoft Word", "docx (Node library)", "PDFKit"],
    workflow: ["Interview the team about the current process", "Draft the SOP in the standard format", "Review with the advisor or operations lead", "Publish and train", "Review every quarter"],
    features: ["10 SOPs", "DOCX and PDF formats", "Consistent six-part structure", "Version and review table", "In-browser reader"],
    benefits: ["Consistent quality", "Faster training", "Clear accountability"],
    responsibilities: ["Improve administrative processes and operational efficiency", "Support special projects"],
    download: { label: "All SOPs (ZIP)", href: "/downloads/sops/Administrative-SOPs.zip" },
  },
  {
    n: 11, slug: "automation", title: "Administrative Workflow Automation", short: "A step-by-step simulator plus 7 importable n8n workflow templates.", icon: "Workflow",
    problem: "Repetitive tasks such as copying intake forms into the CRM, sending reminders, and compiling weekly reports take up time that could go to clients.",
    objective: "Show how routine administrative steps can be automated with free tools, using test data and mock credentials only.",
    solution: "An interactive simulator that runs each workflow step by step, plus seven n8n workflow JSON files that import into a self-hosted or trial n8n instance. Credentials are placeholders, and email and calendar nodes are disabled by default.",
    tools: ["n8n", "Google Forms", "Google Sheets", "Gmail", "Google Calendar", "Google Drive", "Trello"],
    workflow: ["Map the manual process", "Identify the trigger and the data needed", "Build the workflow with test data", "Run in test mode and review outputs", "Get approval before connecting real systems"],
    features: ["7 workflows: intake to CRM, task creation, follow-up reminders, missing document notices, appointment confirmations, overdue alerts, weekly report", "Step-by-step run simulation", "Execution log", "Downloadable n8n JSON"],
    benefits: ["Less manual data entry", "Reminders that never get forgotten", "Reports compiled automatically"],
    responsibilities: ["Improve administrative processes and operational efficiency", "Monitor outstanding requests and follow up"],
    download: { label: "n8n Workflows (ZIP)", href: "/downloads/n8n/n8n-workflow-templates.zip" },
  },
  {
    n: 12, slug: "dashboard", title: "Client Service Performance Dashboard", short: "Operations KPIs, workload and 12-month trends with date filters and export.", icon: "LayoutDashboard",
    problem: "Without a live view of workload and turnaround, managers find problems only after clients complain.",
    objective: "Give the practice a single view of client service performance with filters and exportable data.",
    solution: "An interactive dashboard with KPI tiles, trend charts, staff workload, upcoming appointments, date-range filters, and CSV and XLSX export.",
    tools: ["React", "Recharts", "ExcelJS (browser)", "TypeScript"],
    workflow: ["Choose the date range", "Review KPI tiles and alerts", "Check workload balance across staff", "Export data for the weekly or monthly report", "Agree on actions in the team meeting"],
    features: ["Active and new clients", "Requests received, completed, outstanding, and overdue", "Average turnaround and on-time rate", "Upcoming appointments", "Staff workload chart", "Monthly trends", "Date filters", "CSV and XLSX export"],
    benefits: ["Earlier visibility of backlogs", "Balanced workloads", "Data-based team discussions"],
    responsibilities: ["Use Excel for reporting", "Improve administrative processes", "Support special projects"],
    download: { label: "KPI Dashboard Workbook (XLSX)", href: "/downloads/excel/Client-Service-Admin-Reporting-System.xlsx" },
  },
];
