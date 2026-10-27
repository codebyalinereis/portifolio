"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { RotateCcw, Trophy } from "lucide-react";
import { useI18n } from "@/contexts/LocaleProvider";
import { useMounted } from "@/lib/hooks";
import { cn } from "@/lib/utils";

type Pair = { key: string; emoji: string; name: string };
type Card = Pair & { id: number };
type Best = { moves: number; seconds: number };

const PAIRS: Pair[] = [
  { key: "react", emoji: "⚛️", name: "React" },
  { key: "next", emoji: "▲", name: "Next.js" },
  { key: "node", emoji: "🟢", name: "Node.js" },
  { key: "python", emoji: "🐍", name: "Python" },
  { key: "postgres", emoji: "🐘", name: "PostgreSQL" },
  { key: "docker", emoji: "🐳", name: "Docker" },
  { key: "n8n", emoji: "⚙️", name: "n8n" },
  { key: "ts", emoji: "🟦", name: "TypeScript" },
];

const BEST_KEY = "lab-memory-best";

/* Recorde persistido como external store: leitura reativa sem setState em
   efeito — o snapshot é cacheado por conteúdo bruto (identidade estável). */
const bestCache: { raw: string | null; value: Best | null } = { raw: null, value: null };
const bestListeners = new Set<() => void>();

function bestSnapshot(): Best | null {
  const raw = localStorage.getItem(BEST_KEY);
  if (raw !== bestCache.raw) {
    bestCache.raw = raw;
    try {
      bestCache.value = raw ? (JSON.parse(raw) as Best) : null;
    } catch {
      bestCache.value = null;
    }
  }
  return bestCache.value;
}

function subscribeBest(onChange: () => void) {
  bestListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    bestListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function saveBest(record: Best) {
  localStorage.setItem(BEST_KEY, JSON.stringify(record));
  bestListeners.forEach((listener) => listener());
}

function shuffle(deck: Card[]): Card[] {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* Baralho canônico (ordem fixa, ids estáveis) no SSR e na primeira renderização
   do cliente — hidratação idêntica ao HTML do servidor. Embaralha só depois do
   mount: Math.random() nunca entra num render que o servidor também renderiza
   (mismatch de hidratação). As costas das cartas são iguais, a troca é invisível. */
function buildDeck(shuffled: boolean): Card[] {
  const base = PAIRS.flatMap((pair, index) => [
    { ...pair, id: index * 2 + 1 },
    { ...pair, id: index * 2 + 2 },
  ]);
  return shuffled ? shuffle(base) : base;
}

/**
 * Jogo da memória da stack: 8 pares, flip 3D em CSS puro, cronômetro e
 * recorde de movimentos no localStorage. Sem dependências externas.
 */
export function MemoryGame() {
  const { d } = useI18n();
  const mounted = useMounted();
  const best = useSyncExternalStore(subscribeBest, bestSnapshot, () => null);
  const [rounds, setRounds] = useState(0);
  const deck = useMemo<Card[]>(() => buildDeck(mounted || rounds > 0), [mounted, rounds]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [newRecord, setNewRecord] = useState(false);
  const unflipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const won = matched.size === PAIRS.length;

  // Cronômetro roda entre a primeira carta e a vitória.
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const reset = useCallback(() => {
    if (unflipTimer.current) clearTimeout(unflipTimer.current);
    setRounds((rounds) => rounds + 1);
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setSeconds(0);
    setRunning(false);
    setNewRecord(false);
  }, []);

  function flip(index: number) {
    if (flipped.length === 2 || flipped.includes(index) || matched.has(deck[index].key)) return;
    if (!running && !won) setRunning(true);

    const next = [...flipped, index];
    setFlipped(next);

    if (next.length === 2) {
      const finalMoves = moves + 1;
      setMoves(finalMoves);
      const [a, b] = next;

      if (deck[a].key === deck[b].key) {
        const nextMatched = new Set(matched).add(deck[a].key);
        setMatched(nextMatched);
        setFlipped([]);

        // Vitória: decide tudo aqui no handler (nenhum efeito precisando de setState)
        if (nextMatched.size === PAIRS.length) {
          setRunning(false);
          if (best === null || finalMoves < best.moves || (finalMoves === best.moves && seconds < best.seconds)) {
            saveBest({ moves: finalMoves, seconds });
            setNewRecord(true);
          }
        }
      } else {
        unflipTimer.current = setTimeout(() => setFlipped([]), 750);
      }
    }
  }

  return (
    <section id="game" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 data-reveal className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {d.lab.game.title}
        </h2>
        <span aria-hidden="true" className="heading-underline mt-2 block" />
        <p data-reveal className="mt-3 max-w-2xl text-muted">
          {d.lab.game.subtitle}
        </p>

        {/* Placar */}
        <div data-reveal className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="text-muted">
            {d.lab.game.moves}: <strong className="tabular-nums text-foreground">{moves}</strong>
          </span>
          <span className="text-muted">
            {d.lab.game.time}: <strong className="tabular-nums text-foreground">{seconds}{d.lab.game.seconds}</strong>
          </span>
          <span className="inline-flex items-center gap-1 text-muted">
            <Trophy className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            {d.lab.game.best}:{" "}
            {best ? (
              <strong className="tabular-nums text-foreground">
                {best.moves} · {best.seconds}{d.lab.game.seconds}
              </strong>
            ) : (
              "—"
            )}
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1 transition-colors hover:bg-surface-2"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> {d.lab.game.reset}
          </button>
        </div>

        {/* Tabuleiro */}
        <div data-reveal className="relative mt-6">
          <div className="mx-auto grid max-w-xl grid-cols-4 gap-2.5 sm:gap-3">
            {deck.map((card, index) => {
              const isUp = flipped.includes(index) || matched.has(card.key);
              const isMatched = matched.has(card.key);
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => flip(index)}
                  aria-label={`${d.lab.game.title} — ${index + 1}`}
                  className="memory-card aspect-square"
                >
                  <span
                    className={cn(
                      "memory-inner",
                      isUp && "memory-flipped",
                      isMatched && "memory-matched"
                    )}
                  >
                    <span className="memory-face memory-front" aria-hidden="true">
                      ✦
                    </span>
                    <span className="memory-face memory-back">
                      <span className="text-2xl sm:text-3xl" aria-hidden="true">
                        {card.emoji}
                      </span>
                      <span className="mt-1 text-[10px] font-medium text-muted sm:text-xs">{card.name}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Overlay de vitória */}
          {won ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="win-pop rounded-xl border border-accent/40 bg-background/95 px-6 py-4 text-center shadow-lg">
                <p className="text-2xl" aria-hidden="true">🎉</p>
                <p className="font-semibold">{d.lab.game.win}</p>
                <p className="text-sm text-muted">
                  {moves} {d.lab.game.moves.toLowerCase()} · {seconds}
                  {d.lab.game.seconds}
                  {newRecord ? ` — ${d.lab.game.newRecord}` : ""}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
