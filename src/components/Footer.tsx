import Link from "next/link";
import { NAV } from "./nav-links";

export default function Footer() {
  return (
    <footer className="mt-16 bg-navy-950 text-navy-200">
      <div className="container-x grid gap-8 py-12 md:grid-cols-3">
        <div>
          <p className="font-serif text-lg text-white">Maria Zha-Zha Cornillez Bio</p>
          <p className="mt-1 text-sm">Client Service Coordinator · Administrative &amp; Operations Specialist · Executive Virtual Assistant</p>
          <p className="mt-3 text-sm">Philippines · Remote</p>
        </div>
        <nav aria-label="Footer">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-300">Explore</p>
          <ul className="mt-3 grid grid-cols-2 gap-1 text-sm">
            {NAV.map((n) => (
              <li key={n.href}><Link className="hover:text-white" href={n.href}>{n.label}</Link></li>
            ))}
          </ul>
        </nav>
        <div className="text-xs leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-300">Important disclaimer</p>
          <p className="mt-3">
            This website is an <strong className="text-white">independent portfolio demonstration</strong> created by the applicant. It is not affiliated with, endorsed by, or connected to Ameriprise Financial, MethodM Wealth, The Jambalaya Group, or any financial institution. All client names, data, and reference numbers are fictional. Security features shown (roles, audit logs) are simulations of concepts, not production security controls. Nothing here is financial advice or a claim of regulatory compliance.
          </p>
        </div>
      </div>
      <div className="border-t border-navy-800 py-4 text-center text-xs">© {new Date().getFullYear()} Maria Zha-Zha Cornillez Bio · Built with Next.js, React, TypeScript, Tailwind CSS &amp; Recharts</div>
    </footer>
  );
}
