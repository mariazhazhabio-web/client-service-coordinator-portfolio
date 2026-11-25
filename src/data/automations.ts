/*
 * Administrative automation workflows (demonstration).
 * Used by the in-browser simulator and by the n8n JSON generator.
 * All credentials are placeholders. Notification nodes are disabled in the
 * generated n8n files so importing them never sends a real message.
 */

export type AutoStep = {
  name: string;
  app: "Google Forms" | "Google Sheets" | "Gmail" | "Google Calendar" | "Google Drive" | "Trello" | "Schedule" | "Logic" | "Webhook";
  action: string;
  output: string;
};

export type Automation = { id: string; file: string; title: string; trigger: string; manualMinutes: string; steps: AutoStep[] };

export const AUTOMATIONS: Automation[] = [
  {
    id: "intake", file: "01-new-client-intake-to-crm.json", title: "New client intake → CRM", trigger: "Google Form submission (test form)", manualMinutes: "Manual copy-paste of each intake",
    steps: [
      { name: "Intake form submitted", app: "Google Forms", action: "New response received via Google Sheets trigger", output: "Response row: Olivia Test, olivia.test@example.com" },
      { name: "Validate & normalize", app: "Logic", action: "Trim fields, format phone, check required fields", output: "Valid record. Phone formatted (805) 555-0100" },
      { name: "Check for duplicates", app: "Google Sheets", action: "Look up email in 'CRM_Clients' sheet", output: "No duplicate found" },
      { name: "Create CRM record", app: "Google Sheets", action: "Append row to 'CRM_Clients' with ID CL-TEST-01", output: "Row 25 created" },
      { name: "Create client folder", app: "Google Drive", action: "Create folder 'TEST_Olivia' from template", output: "Folder created (mock ID)" },
      { name: "Notify coordinator", app: "Gmail", action: "Draft internal notice (node disabled)", output: "Draft only. Not sent." },
    ],
  },
  {
    id: "tasks", file: "02-automatic-task-creation.json", title: "Automatic task creation", trigger: "New row in 'Service_Requests' sheet", manualMinutes: "Manually creating cards for each request",
    steps: [
      { name: "New service request row", app: "Google Sheets", action: "Trigger on new row", output: "SR-TEST-1201 Address Change" },
      { name: "Apply category checklist", app: "Logic", action: "Map category to standard checklist", output: "Checklist: signed form, CRM update, client confirmation" },
      { name: "Set due date by priority", app: "Logic", action: "High = +2 days, Medium = +5, Low = +7 business days", output: "Due in 5 business days" },
      { name: "Create Trello card", app: "Trello", action: "Create card on 'Client Service' board, list 'To Do'", output: "Card created with checklist (mock)" },
      { name: "Write back card link", app: "Google Sheets", action: "Update row with card URL and status 'In Progress'", output: "Row updated" },
    ],
  },
  {
    id: "followups", file: "03-follow-up-reminders.json", title: "Follow-up reminders", trigger: "Schedule: weekdays 8:00 AM Pacific", manualMinutes: "Daily manual scan of the follow-up list",
    steps: [
      { name: "Daily schedule", app: "Schedule", action: "Cron 0 8 * * 1-5 (America/Los_Angeles)", output: "Run started" },
      { name: "Read follow-up tracker", app: "Google Sheets", action: "Get rows where Next Follow-up <= today and Status != Done", output: "6 follow-ups due" },
      { name: "Group by owner", app: "Logic", action: "Aggregate rows by assigned staff", output: "3 owners" },
      { name: "Send daily digest", app: "Gmail", action: "One digest per owner (node disabled)", output: "3 drafts prepared. Not sent." },
    ],
  },
  {
    id: "missingdocs", file: "04-missing-document-notifications.json", title: "Missing document notifications", trigger: "Schedule: Mon/Wed/Fri 9:00 AM Pacific", manualMinutes: "Checking every onboarding checklist by hand",
    steps: [
      { name: "Scheduled run", app: "Schedule", action: "Cron 0 9 * * 1,3,5", output: "Run started" },
      { name: "Read pending requirements", app: "Google Sheets", action: "Rows where Status = Missing and Last Reminder older than 3 days", output: "4 clients with missing items" },
      { name: "Build reminder from template", app: "Logic", action: "Merge client name and missing items into template", output: "4 personalized reminders" },
      { name: "Send reminder", app: "Gmail", action: "Send to client (node disabled; test addresses only)", output: "Drafts only. Not sent." },
      { name: "Log reminder date", app: "Google Sheets", action: "Update Last Reminder = today", output: "4 rows updated" },
    ],
  },
  {
    id: "appointments", file: "05-appointment-confirmations.json", title: "Appointment confirmations", trigger: "New Google Calendar event on advisor calendar", manualMinutes: "Writing each confirmation email by hand",
    steps: [
      { name: "New calendar event", app: "Google Calendar", action: "Event created: 'Annual Review – Test Client'", output: "Event at 10:00 AM PT" },
      { name: "Convert time zones", app: "Logic", action: "Format Pacific and Manila times", output: "10:00 AM PT = 1:00 AM (next day) PHT" },
      { name: "Send confirmation", app: "Gmail", action: "Appointment Confirmation template (node disabled)", output: "Draft only. Not sent." },
      { name: "Schedule 24-hour reminder", app: "Logic", action: "Wait until 24 hours before start", output: "Reminder queued (simulation)" },
      { name: "Log in appointment sheet", app: "Google Sheets", action: "Append to 'Appointment_Schedule'", output: "Row added" },
    ],
  },
  {
    id: "overdue", file: "06-overdue-request-alerts.json", title: "Overdue request alerts", trigger: "Schedule: weekdays 7:30 AM Pacific", manualMinutes: "Manually filtering the tracker for late items",
    steps: [
      { name: "Scheduled run", app: "Schedule", action: "Cron 30 7 * * 1-5", output: "Run started" },
      { name: "Read open requests", app: "Google Sheets", action: "Rows where Status != Completed", output: "20 open requests" },
      { name: "Find overdue", app: "Logic", action: "Filter Target Date < today", output: "7 overdue" },
      { name: "Move Trello cards", app: "Trello", action: "Add red 'Overdue' label to matching cards", output: "7 cards labeled (mock)" },
      { name: "Alert operations lead", app: "Gmail", action: "Overdue summary (node disabled)", output: "Draft only. Not sent." },
    ],
  },
  {
    id: "weekly", file: "07-weekly-performance-report.json", title: "Weekly performance report", trigger: "Schedule: Fridays 3:00 PM Pacific", manualMinutes: "Compiling KPIs manually every Friday",
    steps: [
      { name: "Weekly schedule", app: "Schedule", action: "Cron 0 15 * * 5", output: "Run started" },
      { name: "Read request tracker", app: "Google Sheets", action: "Get rows received or closed this week", output: "42 rows" },
      { name: "Calculate KPIs", app: "Logic", action: "Total, completed, pending, overdue, average turnaround, on-time %", output: "Completion 81% · On-time 88% · Avg TAT 4.6 days" },
      { name: "Save report", app: "Google Drive", action: "Create 'Weekly Report YYYY-MM-DD' in Reports folder", output: "Report file created (mock)" },
      { name: "Email advisors", app: "Gmail", action: "Send summary with link (node disabled)", output: "Draft only. Not sent." },
    ],
  },
];
