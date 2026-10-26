"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useI18n } from "@/contexts/LocaleProvider";
import { usePrefersReducedMotion } from "@/lib/hooks";

/**
 * Corrida de barras (bar chart race) — dados ilustrativos de popularidade de
 * linguagens, 2010–2026. Feita à mão: interpolação linear entre keyframes,
 * ranking animado com CSS transforms e scrubber de anos.
 *
 * Cores: paleta categórica validada (dataviz, checks 6/6 light+dark). O slot
 * de cor segue a ENTIDADE (fixo por linguagem), nunca o rank. Alívio de
 * contraste: rótulo direto (nome + valor) em todas as linhas + legenda.
 */

type Language = {
  name: string;
  slot: number; // slot fixo da paleta — a cor nunca muda com o rank
  points: Array<[year: number, value: number]>; // keyframes 2010–2026
};

const START_YEAR = 2010;
const END_YEAR = 2026;
const YEAR_MS = 1300; // duração de cada ano na animação
const ROW_HEIGHT = 44;

// Dados ilustrativos — curvas com ultrapassagens para a corrida ficar divertida.
const LANGUAGES: Language[] = [
  { name: "Python", slot: 1, points: [[2010, 22], [2013, 32], [2016, 48], [2019, 62], [2022, 78], [2026, 92]] },
  { name: "JavaScript", slot: 2, points: [[2010, 38], [2013, 52], [2016, 68], [2019, 80], [2022, 86], [2026, 88]] },
  { name: "TypeScript", slot: 3, points: [[2010, 2], [2013, 8], [2016, 18], [2019, 36], [2022, 56], [2026, 74]] },
  { name: "Java", slot: 4, points: [[2010, 72], [2013, 68], [2016, 60], [2019, 50], [2022, 42], [2026, 34]] },
  { name: "Go", slot: 5, points: [[2010, 4], [2013, 10], [2016, 18], [2019, 28], [2022, 38], [2026, 48]] },
  { name: "Rust", slot: 6, points: [[2010, 1], [2013, 4], [2016, 9], [2019, 16], [2022, 26], [2026, 38]] },
  { name: "PHP", slot: 7, points: [[2010, 58], [2013, 50], [2016, 38], [2019, 28], [2022, 20], [2026, 14]] },
  { name: "Ruby", slot: 8, points: [[2010, 34], [2013, 30], [2016, 22], [2019, 15], [2022, 10], [2026, 7]] },
];

/** Interpolação linear entre keyframes (clamp nas pontas). */
function valueAt(language: Language, year: number): number {
  const points = language.points;
  if (year <= points[0][0]) return points[0][1];
  if (year >= points[points.length - 1][0]) return points[points.length - 1][1];
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i - 1];
    const [x2, y2] = points[i];
    if (year <= x2) {
      const t = (year - x1) / (x2 - x1);
      return y1 + (y2 - y1) * t;
    }
  }
  return points[points.length - 1][1];
}

export function DataRace() {
  const { d } = useI18n();
  const reduced = usePrefersReducedMotion();
  const [year, setYear] = useState(START_YEAR);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState<{ name: string; value: number; x: number; y: number } | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Espelho de `year` para o loop de animação ler sem capturar valor stale.
  const yearRef = useRef(year);
  useEffect(() => {
    yearRef.current = year;
  }, [year]);

  // Motor da corrida: um ano a cada YEAR_MS de tempo real.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      const next = yearRef.current + dt / YEAR_MS;
      if (next >= END_YEAR) {
        setYear(END_YEAR);
        setPlaying(false);
        return;
      }
      setYear(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const ranked = useMemo(() => {
    const rows = LANGUAGES.map((language) => ({
      language,
      value: valueAt(language, year),
    }));
    rows.sort((a, b) => b.value - a.value);
    const leader = rows[0]?.value ?? 1;
    return rows.map((row, rank) => ({ ...row, rank, pct: Math.max(2, (row.value / Math.max(leader, 1)) * 100) }));
  }, [year]);

  function togglePlay() {
    if (!playing && yearRef.current >= END_YEAR) setYear(START_YEAR);
    setPlaying((value) => !value);
  }

  function handleRowPointer(event: React.PointerEvent, name: string, value: number) {
    const rect = chartRef.current?.getBoundingClientRect();
    const rowRect = event.currentTarget.getBoundingClientRect();
    if (!rect) return;
    setHovered({
      name,
      value,
      x: rowRect.right - rect.left - 8,
      y: rowRect.top - rect.top + rowRect.height / 2,
    });
  }

  const displayYear = Math.floor(year);

  return (
    <section id="race" className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 data-reveal className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {d.lab.race.title}
        </h2>
        <span aria-hidden="true" className="heading-underline mt-2 block" />
        <p data-reveal className="mt-3 max-w-2xl text-muted">
          {d.lab.race.subtitle}
        </p>

        {/* Controles — uma linha, acima do gráfico */}
        <div data-reveal className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          {!reduced ? (
            <button
              type="button"
              onClick={togglePlay}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 transition-colors hover:bg-surface-2"
              aria-label={playing ? d.lab.race.pause : d.lab.race.play}
            >
              {playing ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
              {playing ? d.lab.race.pause : d.lab.race.play}
            </button>
          ) : null}
          <label className="inline-flex flex-1 items-center gap-3 min-w-56">
            <span className="whitespace-nowrap text-muted">
              {d.lab.race.year} <strong className="tabular-nums text-foreground">{displayYear}</strong>
            </span>
            <input
              type="range"
              min={START_YEAR}
              max={END_YEAR}
              step={0.05}
              value={year}
              onChange={(event) => {
                setPlaying(false);
                setYear(Number(event.target.value));
              }}
              className="w-full accent-[var(--accent)]"
              aria-label={d.lab.race.year}
            />
          </label>
        </div>

        {/* Gráfico */}
        <div data-reveal className="mt-6 overflow-hidden rounded-xl border border-border bg-background p-4 sm:p-6">
          <div ref={chartRef} className="relative" role="img" aria-label={d.lab.race.title}>
            {/* Grade vertical recessiva (hairlines) */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-[128px] right-0">
              {[25, 50, 75].map((pct) => (
                <span key={pct} className="absolute inset-y-0 w-px bg-border" style={{ left: `${pct}%` }} />
              ))}
            </div>

            {/* Linhas: nome fixo à esquerda + barra com valor na ponta */}
            <div className="relative" style={{ height: LANGUAGES.length * ROW_HEIGHT }}>
              {ranked.map(({ language, value, rank, pct }) => (
                <div
                  key={language.name}
                  className="race-row absolute left-0 right-0 top-0 flex items-center gap-3"
                  style={{ transform: `translateY(${rank * ROW_HEIGHT}px)` }}
                  tabIndex={0}
                  aria-label={`${language.name}: ${Math.round(value)} ${d.lab.race.valueLabel} (${displayYear})`}
                  onPointerMove={(event) => handleRowPointer(event, language.name, value)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() =>
                    setHovered({
                      name: language.name,
                      value,
                      x: 160,
                      y: rank * ROW_HEIGHT + ROW_HEIGHT / 2,
                    })
                  }
                  onBlur={() => setHovered(null)}
                >
                  <span className="w-28 shrink-0 truncate text-right text-sm font-medium">{language.name}</span>
                  <div className="relative h-6 flex-1">
                    <span
                      className="race-bar block h-full"
                      style={{ width: `${pct}%`, background: `var(--race-${language.slot})` }}
                    />
                    <span className="absolute top-1/2 -translate-y-1/2 pl-1.5 text-xs tabular-nums text-muted" style={{ left: `${pct}%` }}>
                      {Math.round(value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tooltip — valor em destaque, nome secundário, chave de cor curta */}
            {hovered ? (
              <div
                className="pointer-events-none absolute z-10 -translate-y-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-md"
                style={{ left: hovered.x, top: hovered.y - 6 }}
              >
                <p className="font-semibold tabular-nums">{Math.round(hovered.value)}</p>
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <span className="h-0.5 w-3 rounded" style={{ background: `var(--race-${LANGUAGES.find((l) => l.name === hovered.name)?.slot ?? 1})` }} />
                  {hovered.name} · {displayYear}
                </p>
              </div>
            ) : null}
          </div>

          {/* Legenda — sempre presente com 2+ séries; texto em ink, não na cor da série */}
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4">
            {LANGUAGES.map((language) => (
              <li key={language.name} className="flex items-center gap-1.5 text-xs text-muted">
                <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: `var(--race-${language.slot})` }} aria-hidden="true" />
                {language.name}
              </li>
            ))}
          </ul>
        </div>

        <p data-reveal className="mt-3 text-xs text-muted">{d.lab.race.note}</p>
      </div>
    </section>
  );
}
