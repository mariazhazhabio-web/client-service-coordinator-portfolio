import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Info } from "lucide-react";

export function PageHeader({ eyebrow, title, intro, children }: { eyebrow?: string; title: string; intro?: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-navy-900 text-white">
      <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" aria-hidden />
      <div className="container-x relative py-14 sm:py-16">
        {eyebrow && <p className="eyebrow text-gold-300">{eyebrow}</p>}
        <h1 className="mt-2 max-w-4xl text-3xl font-semibold sm:text-4xl lg:text-5xl animate-fade-up">{title}</h1>
        {intro && <div className="mt-4 max-w-3xl text-base text-navy-100 sm:text-lg">{intro}</div>}
        {children && <div className="mt-6">{children}</div>}
      </div>
      <div className="h-1 bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500" />
    </section>
  );
}

export function Section({ title, eyebrow, intro, children, className }: { title?: string; eyebrow?: string; intro?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("container-x py-12 sm:py-16", className)}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {title && <h2 className="mt-1 text-2xl font-semibold text-navy-900 sm:text-3xl">{title}</h2>}
      {intro && <div className="mt-3 max-w-3xl text-mist-600">{intro}</div>}
      <div className={cn(title || intro ? "mt-8" : "")}>{children}</div>
    </section>
  );
}

const tones: Record<string, string> = {
  navy: "bg-navy-50 text-navy-700",
  gold: "bg-gold-100 text-gold-700",
  green: "bg-emerald-50 text-emerald-700",
  red: "bg-rose-50 text-rose-700",
  amber: "bg-amber-50 text-amber-800",
  gray: "bg-mist-100 text-mist-600",
  blue: "bg-sky-50 text-sky-700",
};
export function Badge({ tone = "navy", children, className }: { tone?: keyof typeof tones | string; children: ReactNode; className?: string }) {
  return <span className={cn("badge", tones[tone] ?? tones.navy, className)}>{children}</span>;
}

export function Kpi({ label, value, hint, tone = "navy", icon }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "navy" | "gold" | "red" | "green"; icon?: ReactNode }) {
  const bar = { navy: "bg-navy-500", gold: "bg-gold-400", red: "bg-rose-500", green: "bg-emerald-500" }[tone];
  return (
    <div className="card relative overflow-hidden p-4">
      <div className={cn("absolute left-0 top-0 h-full w-1", bar)} aria-hidden />
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-mist-500">{label}</p>
        {icon && <span className="text-mist-400">{icon}</span>}
      </div>
      <p className="mt-1 text-2xl font-semibold text-navy-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-mist-500">{hint}</p>}
    </div>
  );
}

export function DemoNotice({ children }: { children?: ReactNode }) {
  return (
    <div className="flex gap-2 rounded-lg border border-gold-200 bg-gold-50 px-3 py-2 text-xs text-gold-700" role="note">
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>
        {children ?? (
          <>
            <strong>Independent portfolio demonstration.</strong> All client data is fictional. Changes are saved only in this browser (localStorage). Nothing is sent, emailed, or connected to any real financial system.
          </>
        )}
      </p>
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className={cn("max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl", wide ? "sm:max-w-3xl" : "sm:max-w-lg")} onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-mist-200 bg-white px-5 py-3">
          <h3 className="font-sans text-base font-semibold">{title}</h3>
          <button className="btn-ghost btn-sm" onClick={onClose} aria-label="Close dialog">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children, htmlFor }: { label: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

export function Progress({ value, className }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-mist-200", className)} role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full transition-all duration-500", v >= 100 ? "bg-emerald-500" : "bg-navy-600")} style={{ width: `${v}%` }} />
    </div>
  );
}

export function statusTone(s: string) {
  if (/complete|verified|confirmed|active|done|onboarded/i.test(s)) return "green";
  if (/overdue|missing|high|inactive|cancel/i.test(s)) return "red";
  if (/pending|tentative|review|medium|resched/i.test(s)) return "amber";
  if (/progress|received|onboarding/i.test(s)) return "blue";
  if (/prospect|low|archived/i.test(s)) return "gray";
  return "navy";
}
