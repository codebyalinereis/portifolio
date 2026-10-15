import { cookies } from "next/headers";
import Link from "next/link";
import { getDictionary, isLocale, DEFAULT_LOCALE, LOCALE_COOKIE } from "@/lib/i18n";
import { API_ENDPOINTS } from "@/lib/api-docs";

const METHOD_STYLES: Record<string, string> = {
  GET: "bg-accent-soft text-accent",
  POST: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  PATCH: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

export default async function DocsPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const d = getDictionary(locale);
  const lang = locale === "en" ? "en" : "pt";

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-2">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          ← {d.nav.home}
        </Link>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">{d.docs.title}</h1>
      <p className="mt-2 max-w-2xl text-muted">{d.docs.subtitle}</p>
      <p className="mt-4 max-w-3xl rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed text-muted">
        {d.docs.intro}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">{d.docs.endpointsTitle}</h2>
          {API_ENDPOINTS.map((endpoint) => (
            <section key={`${endpoint.method} ${endpoint.path}`} id={endpoint.path.replaceAll("/", "-").slice(1)} className="rounded-lg border border-border bg-surface">
              <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
                <span className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${METHOD_STYLES[endpoint.method]}`}>
                  {endpoint.method}
                </span>
                <code className="break-all font-mono text-sm">{endpoint.path}</code>
              </div>
              <div className="space-y-3 p-4 text-sm">
                <p>{endpoint.summary[lang]}</p>
                {endpoint.params && endpoint.params.length > 0 ? (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{d.docs.parameters}</p>
                    <ul className="space-y-1">
                      {endpoint.params.map((param) => (
                        <li key={param.name} className="font-mono text-xs text-muted">
                          <span className="text-foreground">{param.name}</span>
                          {param.example ? ` = ${param.example}` : ""}
                          {param.note ? <span className="font-sans"> — {param.note[lang]}</span> : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{d.docs.response}</p>
                  <pre className="overflow-x-auto rounded-md bg-surface-2 p-3 font-mono text-xs leading-relaxed">
                    {endpoint.response}
                  </pre>
                </div>
              </div>
            </section>
          ))}
        </div>

        <aside className="h-fit space-y-6 lg:sticky lg:top-24">
          <nav aria-label={d.docs.endpointsTitle} className="rounded-lg border border-border bg-surface p-4">
            <ul className="space-y-2 text-sm">
              {API_ENDPOINTS.map((endpoint) => (
                <li key={`nav-${endpoint.method}-${endpoint.path}`}>
                  <a href={`#${endpoint.path.replaceAll("/", "-").slice(1)}`} className="group flex items-center gap-2 text-muted hover:text-foreground">
                    <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${METHOD_STYLES[endpoint.method]}`}>
                      {endpoint.method}
                    </span>
                    <span className="truncate font-mono text-xs">{endpoint.path}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="rounded-lg border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold">{d.docs.notesTitle}</h2>
            <ul className="mt-3 space-y-3">
              {d.docs.notes.map((note) => (
                <li key={note.title}>
                  <p className="text-sm font-medium">{note.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">{note.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
