"use client";
import { useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { buildDataset } from "@/data/sample";

/** Fresh fictional dataset relative to today's date (memoized per component). */
export function useDataset() {
  return useMemo(() => buildDataset(new Date()), []);
}

export function ResetButton({ onReset }: { onReset: () => void }) {
  return (
    <button className="btn-ghost btn-sm" onClick={() => { if (confirm("Reset this demo to the original sample data?")) onReset(); }}>
      <RotateCcw className="h-3.5 w-3.5" /> Reset demo
    </button>
  );
}

export function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

export const advisorName = (id: string, advisors: { id: string; name: string }[]) => advisors.find((a) => a.id === id)?.name ?? id;
