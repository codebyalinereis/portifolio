"use client";

import { Code, Link2, Mail, MapPin } from "lucide-react";
import { useI18n } from "@/contexts/LocaleProvider";

export const CONTACT = {
  email: "alinemch98@gmail.com",
  linkedin: "https://linkedin.com/in/alinereis98",
  github: "https://github.com/alinereis98",
  location: "Uberlândia — MG, Brasil",
};

export function Footer() {
  const { d } = useI18n();
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold">Aline Reis</p>
          <p className="text-sm text-muted">{d.footer.builtWith}</p>
        </div>
        <div className="flex items-center gap-4 text-muted">
          <a href={`mailto:${CONTACT.email}`} aria-label="E-mail" className="hover:text-foreground">
            <Mail className="h-4 w-4" />
          </a>
          <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-foreground">
            <Link2 className="h-4 w-4" />
          </a>
          <a href={CONTACT.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-foreground">
            <Code className="h-4 w-4" />
          </a>
          <span className="inline-flex items-center gap-1 text-sm">
            <MapPin className="h-4 w-4" /> Uberlândia, MG
          </span>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} Aline Reis. {d.footer.rights}
      </div>
    </footer>
  );
}
