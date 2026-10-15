"use client";

import { useState } from "react";
import { Link2, Mail, MapPin, Send } from "lucide-react";
import { Button, Card, SectionHeading } from "@/components/ui/primitives";
import { useI18n } from "@/contexts/LocaleProvider";
import { CONTACT } from "@/components/layout/Footer";

export function ContactSection() {
  const { d } = useI18n();
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [validationError, setValidationError] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setStatus("sending");
    setValidationError(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
          company: formData.get("company"), // honeypot
        }),
      });
      if (response.status === 400) {
        setValidationError(true);
        setStatus("error");
        return;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const inputClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted focus:border-accent";

  return (
    <section id="contato" className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading title={d.contact.title} subtitle={d.contact.subtitle} />
        <div className="grid gap-10 lg:grid-cols-2">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className="mb-1 block text-sm font-medium">
                  {d.contact.name}
                </label>
                <input id="contact-name" name="name" required minLength={2} maxLength={120} className={inputClass} placeholder={d.contact.namePlaceholder} />
              </div>
              <div>
                <label htmlFor="contact-email" className="mb-1 block text-sm font-medium">
                  {d.contact.email}
                </label>
                <input id="contact-email" name="email" type="email" required maxLength={160} className={inputClass} placeholder={d.contact.emailPlaceholder} />
              </div>
            </div>
            <div>
              <label htmlFor="contact-message" className="mb-1 block text-sm font-medium">
                {d.contact.message}
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                minLength={10}
                maxLength={4000}
                rows={5}
                className={inputClass}
                placeholder={d.contact.messagePlaceholder}
              />
            </div>
            {/* Honeypot anti-spam: invisível para humanos */}
            <div aria-hidden="true" className="hidden">
              <label htmlFor="contact-company">Company</label>
              <input id="contact-company" name="company" tabIndex={-1} autoComplete="off" />
            </div>
            <Button type="submit" disabled={status === "sending"}>
              <Send className="h-4 w-4" aria-hidden="true" />
              {status === "sending" ? d.contact.sending : d.contact.send}
            </Button>
            {status === "success" ? (
              <p role="status" className="text-sm text-accent">
                {d.contact.success}
              </p>
            ) : null}
            {status === "error" ? (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {validationError ? d.contact.validation : d.contact.error}
              </p>
            ) : null}
          </form>

          <Card className="h-fit">
            <h3 className="font-semibold">{d.contact.directTitle}</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-2 hover:text-accent">
                  <Mail className="h-4 w-4 text-accent" aria-hidden="true" /> {CONTACT.email}
                </a>
              </li>
              <li>
                <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-accent">
                  <Link2 className="h-4 w-4 text-accent" aria-hidden="true" /> linkedin.com/in/alinereis98
                </a>
              </li>
              <li className="inline-flex items-center gap-2 text-muted">
                <MapPin className="h-4 w-4 text-accent" aria-hidden="true" /> {d.contact.location}
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}
