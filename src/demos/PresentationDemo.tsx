"use client";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { deckInputFor, deckOutline, buildDeck } from "@/data/deck";
import { DL } from "@/data/downloads";
import { useDataset } from "./shared";

export default function PresentationDemo() {
  const ds = useDataset();
  const [cid, setCid] = useState(ds.clients[2].id);
  const [coord, setCoord] = useState("Maria Bio");
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const input = useMemo(() => deckInputFor(ds, cid, coord), [ds, cid, coord]);
  const slides = useMemo(() => deckOutline(input), [input]);
  const s = slides[i];

  async function generate() {
    setBusy(true);
    try {
      const PptxGenJS = (await import("pptxgenjs")).default;
      const pptx = buildDeck(new PptxGenJS(), input);
      await pptx.writeFile({ fileName: `Client-Meeting-${input.clientName.replace(/\s+/g, "-")}-DEMO.pptx` });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div><label className="label" htmlFor="pr-c">Fictional client</label><select id="pr-c" className="input" value={cid} onChange={(e) => { setCid(e.target.value); setI(0); }}>{ds.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label className="label" htmlFor="pr-me">Prepared by</label><input id="pr-me" className="input" value={coord} onChange={(e) => setCoord(e.target.value)} /></div>
        <button className="btn-primary" onClick={generate} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Generate editable PPTX for this client</button>
        <a className="btn-outline" href={DL.pptx} download>Download sample deck</a>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <div>
          <div className={cn("relative aspect-video w-full overflow-hidden rounded-xl border border-mist-200 shadow-lg", s.kind === "title" ? "bg-navy-900 text-white" : "bg-white")}>
            {s.kind !== "title" && <div className="absolute inset-x-0 top-0 h-1.5 bg-navy-900"><div className="mt-1.5 h-0.5 bg-gold-500" /></div>}
            <div className="flex h-full flex-col p-[4%] text-[clamp(9px,1.4vw,16px)]">
              {s.kind === "title" ? (
                <div className="my-auto border-l-4 border-gold-500 pl-[3%]">
                  <p className="text-[0.8em] font-bold tracking-[0.3em] text-gold-300">CLIENT MEETING</p>
                  <p className="mt-2 font-serif text-[2.4em] font-semibold leading-tight">{s.title}</p>
                  {s.bullets?.map((b) => <p key={b} className="text-navy-100">{b}</p>)}
                  <p className="mt-4 text-[0.75em] font-bold text-gold-300">ADMINISTRATIVE SUPPORT DEMONSTRATION: NOT FINANCIAL ADVICE</p>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between"><p className="font-serif text-[1.7em] font-semibold text-navy-900">{s.title}</p><p className="font-serif text-[1.7em] text-gold-500">{String(i + 1).padStart(2, "0")}</p></div>
                  <div className="mt-[2%] flex-1 overflow-hidden">
                    {s.table ? (
                      <table className="w-full border-collapse text-[0.85em]">
                        <tbody>{s.table.map((r, ri) => <tr key={ri} className={ri === 0 ? "bg-navy-900 font-semibold text-white" : ri % 2 ? "bg-white" : "bg-mist-100"}>{r.map((c, ci) => <td key={ci} className="border border-mist-200 px-2 py-1">{c}</td>)}</tr>)}</tbody>
                      </table>
                    ) : (
                      <ul className={cn("space-y-[1.2%]", s.kind === "placeholder" && "h-full rounded-lg border-2 border-dashed border-gold-400 bg-gold-50 p-[2%] text-gold-700")}>
                        {s.bullets?.map((b) => <li key={b} className="flex gap-2"><span className="text-gold-500">■</span>{b}</li>)}
                      </ul>
                    )}
                  </div>
                  {s.note && <p className="mt-2 rounded bg-mist-100 px-2 py-1 text-[0.75em] italic text-mist-600">{s.note}</p>}
                  <p className="mt-1 text-[0.6em] text-mist-500">Administrative support demonstration · Fictional data · Not financial advice</p>
                </>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <button className="btn-outline btn-sm" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}><ChevronLeft className="h-4 w-4" /> Previous</button>
            <span className="text-sm text-mist-500">Slide {i + 1} of {slides.length}</span>
            <button className="btn-outline btn-sm" onClick={() => setI((x) => Math.min(slides.length - 1, x + 1))} disabled={i === slides.length - 1}>Next <ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
        <ol className="card max-h-[520px] space-y-1 overflow-y-auto p-2">
          {slides.map((sl, k) => (
            <li key={k}><button onClick={() => setI(k)} className={cn("w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-mist-50", k === i && "bg-navy-50 font-semibold")}>{k + 1}. {sl.title}{sl.kind === "placeholder" && <span className="ml-1 text-gold-600">(advisor)</span>}</button></li>
          ))}
        </ol>
      </div>
    </div>
  );
}
