"use client";
import { useMemo, useState } from "react";
import { ChevronDown, Shuffle } from "lucide-react";
import { INTERVIEW } from "@/data/documents";
import { cn } from "@/lib/utils";

export default function InterviewPrep() {
  const topics = useMemo(() => ["All", ...Array.from(new Set(INTERVIEW.map((q) => q.topic)))], []);
  const [topic, setTopic] = useState("All");
  const [open, setOpen] = useState<number | null>(0);
  const [practice, setPractice] = useState<number | null>(null);
  const list = INTERVIEW.map((q, i) => ({ ...q, i })).filter((q) => topic === "All" || q.topic === topic);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {topics.map((t) => (
          <button key={t} onClick={() => setTopic(t)} className={cn("rounded-full border px-3 py-1 text-xs font-medium", topic === t ? "border-navy-800 bg-navy-800 text-white" : "border-mist-300 bg-white hover:bg-mist-100")} aria-pressed={topic === t}>{t}</button>
        ))}
        <button className="btn-gold btn-sm ml-auto" onClick={() => { const n = Math.floor(Math.random() * INTERVIEW.length); setPractice(n); setTopic("All"); setOpen(null); }}><Shuffle className="h-3.5 w-3.5" /> Random practice question</button>
      </div>
      {practice !== null && (
        <div className="card mt-4 border-gold-300 bg-gold-50 p-5">
          <p className="eyebrow">Practice mode: answer aloud first, then reveal</p>
          <p className="mt-2 text-lg font-semibold">{INTERVIEW[practice].q}</p>
          <button className="btn-outline btn-sm mt-3" onClick={() => { setOpen(practice); setPractice(null); document.getElementById(`q-${practice}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>Reveal suggested answer</button>
        </div>
      )}
      <p className="mt-4 text-xs text-mist-500">{list.length} of {INTERVIEW.length} questions</p>
      <ul className="mt-2 space-y-2">
        {list.map((q) => (
          <li key={q.i} id={`q-${q.i}`} className="card overflow-hidden">
            <button className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left" onClick={() => setOpen(open === q.i ? null : q.i)} aria-expanded={open === q.i}>
              <span><span className="mr-2 text-xs font-bold text-gold-600">Q{q.i + 1}</span><span className="font-semibold">{q.q}</span><span className="ml-2 text-xs text-mist-500">· {q.topic}</span></span>
              <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform", open === q.i && "rotate-180")} />
            </button>
            {open === q.i && <div className="border-t border-mist-100 bg-mist-50 px-5 py-4 text-sm leading-relaxed">{q.a}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
