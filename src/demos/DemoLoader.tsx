"use client";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const Loading = () => <div className="card grid h-64 place-items-center text-sm text-mist-500">Loading interactive demo…</div>;

/* Demos render client-side only: they use today's date and localStorage. */
const DEMOS: Record<string, ComponentType> = {
  crm: dynamic(() => import("./CrmDemo"), { ssr: false, loading: Loading }),
  onboarding: dynamic(() => import("./OnboardingDemo"), { ssr: false, loading: Loading }),
  "service-requests": dynamic(() => import("./RequestTrackerDemo"), { ssr: false, loading: Loading }),
  "post-meeting": dynamic(() => import("./PostMeetingDemo"), { ssr: false, loading: Loading }),
  calendar: dynamic(() => import("./CalendarDemo"), { ssr: false, loading: Loading }),
  communications: dynamic(() => import("./CommunicationDemo"), { ssr: false, loading: Loading }),
  "excel-reporting": dynamic(() => import("./ExcelDemo"), { ssr: false, loading: Loading }),
  presentation: dynamic(() => import("./PresentationDemo"), { ssr: false, loading: Loading }),
  documents: dynamic(() => import("./DocumentDemo"), { ssr: false, loading: Loading }),
  sops: dynamic(() => import("./SopDemo"), { ssr: false, loading: Loading }),
  automation: dynamic(() => import("./AutomationDemo"), { ssr: false, loading: Loading }),
  dashboard: dynamic(() => import("./DashboardDemo"), { ssr: false, loading: Loading }),
};

export default function DemoLoader({ slug }: { slug: string }) {
  const D = DEMOS[slug];
  return D ? <D /> : null;
}
