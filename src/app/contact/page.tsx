import { PageHeader, Section } from "@/components/ui";
import ContactForm from "./ContactForm";
import { PROFILE } from "@/data/profile";
import { Mail, Phone, Linkedin, MapPin, Clock } from "lucide-react";

export const metadata = { title: "Contact Me" };

export default function Contact() {
  return (
    <>
      <PageHeader eyebrow="Contact me" title="Let's talk about how I can support your practice" intro="I'm available for interviews by appointment, and I can work an agreed schedule across U.S. and Philippine time zones." />
      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            {[
              { icon: Mail, label: "Email", value: PROFILE.email },
              { icon: Phone, label: "Phone", value: PROFILE.phone },
              { icon: Linkedin, label: "LinkedIn", value: PROFILE.linkedin },
              { icon: MapPin, label: "Location", value: PROFILE.location },
              { icon: Clock, label: "Availability", value: "Start date subject to agreement · Interviews by appointment · Remote, part-time or flexible hours · Philippine Standard Time (UTC+8); international working hours by agreed schedule" },
            ].filter(({ value }) => value).map(({ icon: I, label, value }) => (
              <div key={label} className="card flex items-start gap-4 p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy-800 text-gold-300"><I className="h-5 w-5" /></span>
                <div><p className="label !mb-0">{label}</p><p className="text-sm">{value}</p></div>
              </div>
            ))}
          </div>
          <ContactForm />
        </div>
      </Section>
    </>
  );
}
