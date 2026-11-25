"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV } from "./nav-links";
import { cn } from "@/lib/utils";

export default function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <header className="sticky top-0 z-40 border-b border-navy-800 bg-navy-950/95 text-white backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded focus:bg-gold-400 focus:px-3 focus:py-1 focus:text-navy-950">Skip to content</a>
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3" aria-label="Home">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-gold-400/60 font-serif text-sm font-semibold text-gold-300">MB</span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold">Maria Zha-Zha C. Bio</span>
            <span className="block text-[11px] text-navy-200">Client Service Coordinator Portfolio</span>
          </span>
        </Link>
        <nav className="hidden xl:block" aria-label="Main">
          <ul className="flex items-center gap-0.5">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={active(n.href) ? "page" : undefined} className={cn("rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors", active(n.href) ? "bg-navy-800 text-gold-300" : "text-navy-100 hover:bg-navy-800 hover:text-white")}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button className="rounded-md p-2 text-navy-100 hover:bg-navy-800 xl:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-nav" aria-label="Toggle navigation">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="border-t border-navy-800 xl:hidden" aria-label="Mobile">
          <ul className="container-x grid gap-1 py-3 sm:grid-cols-2">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className={cn("block rounded-md px-3 py-2 text-sm", active(n.href) ? "bg-navy-800 text-gold-300" : "text-navy-100 hover:bg-navy-800")}>{n.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
