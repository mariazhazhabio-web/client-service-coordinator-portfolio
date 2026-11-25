/* eslint-disable @next/next/no-img-element */
import { PHOTO } from "@/data/photo";

export default function Headshot({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute -inset-2 rounded-2xl border border-gold-400/50" aria-hidden />
      <img src={PHOTO.src} alt={PHOTO.alt} className="relative aspect-[5/6] w-full rounded-xl object-cover shadow-xl" />
    </div>
  );
}
