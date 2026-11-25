"use client";
import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { PROFILE } from "@/data/profile";

/**
 * No backend: the form validates input, then opens the visitor's own email app
 * (mailto:) with the message pre-filled. Nothing is stored or sent by this site.
 */
export default function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", company: "", subject: "Interview request: Client Service Coordinator", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!f.name.trim()) er.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) er.email = "Please enter a valid email address.";
    if (f.message.trim().length < 10) er.message = "Please enter a message (at least 10 characters).";
    setErrors(er);
    if (Object.keys(er).length) return;
    const body = `${f.message}\n\n— ${f.name}${f.company ? `, ${f.company}` : ""}\n${f.email}`;
    const to = PROFILE.email.startsWith("[") ? "" : PROFILE.email;
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(f.subject)}&body=${encodeURIComponent(body)}`;
    setDone(true);
  }

  return (
    <form onSubmit={submit} noValidate className="card space-y-4 p-6" aria-describedby="contact-note">
      <h2 className="font-sans text-lg font-semibold">Send a message</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="c-name">Name *</label>
          <input id="c-name" className="input" value={f.name} onChange={set("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "e-name" : undefined} />
          {errors.name && <p id="e-name" className="mt-1 text-xs text-rose-600">{errors.name}</p>}
        </div>
        <div>
          <label className="label" htmlFor="c-email">Email *</label>
          <input id="c-email" type="email" className="input" value={f.email} onChange={set("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "e-email" : undefined} />
          {errors.email && <p id="e-email" className="mt-1 text-xs text-rose-600">{errors.email}</p>}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="c-company">Company</label>
        <input id="c-company" className="input" value={f.company} onChange={set("company")} />
      </div>
      <div>
        <label className="label" htmlFor="c-subject">Subject</label>
        <input id="c-subject" className="input" value={f.subject} onChange={set("subject")} />
      </div>
      <div>
        <label className="label" htmlFor="c-msg">Message *</label>
        <textarea id="c-msg" rows={5} className="input" value={f.message} onChange={set("message")} aria-invalid={!!errors.message} aria-describedby={errors.message ? "e-msg" : undefined} />
        {errors.message && <p id="e-msg" className="mt-1 text-xs text-rose-600">{errors.message}</p>}
      </div>
      <button className="btn-primary" type="submit"><Send className="h-4 w-4" /> Open in my email app</button>
      {done && <p className="flex items-center gap-2 text-sm text-emerald-700" role="status"><CheckCircle2 className="h-4 w-4" /> Your email app should now open with the message ready to send.</p>}
      <p id="contact-note" className="text-xs text-mist-500">This site has no server and stores nothing. Submitting opens your own email app with the message pre-filled.</p>
    </form>
  );
}
