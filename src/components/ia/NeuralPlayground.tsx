"use client";

import { useEffect, useRef, useState } from "react";
import { BrainCircuit, Eraser, Play, RotateCcw, Square } from "lucide-react";
import { useI18n } from "@/contexts/LocaleProvider";

/* Rede neural de verdade, no navegador: MLP 2-8-8-1 (tanh/tanh/sigmoide)
   com forward e backpropagation escritos à mão, treino full-batch por
   gradiente descendente. O usuário pinta pontos de duas classes no canvas
   (botão direito inverte a classe) ou carrega presets clássicos (espiral,
   XOR, anéis) e vê a fronteira de decisão aprender em tempo real, junto
   com a curva de perda. Zero bibliotecas de ML. */

const SIZES = [2, 8, 8, 1];
const LR = 1.2; // full-batch pede passo maior
const EPOCHS_PER_FRAME = 6;
const WORLD = 1.15; // meia-largura do mundo em unidades
const GOLD = "#fcb847"; // classe B (fixa); classe A é o accent do tema

type Sample = { x: number; y: number; label: 0 | 1 };
type Net = { w: number[][][]; b: number[][] };

function makeNet(): Net {
  const w: number[][][] = [];
  const b: number[][] = [];
  for (let l = 0; l < SIZES.length - 1; l++) {
    const scale = Math.sqrt(1 / SIZES[l]);
    w.push(
      Array.from({ length: SIZES[l + 1] }, () =>
        Array.from({ length: SIZES[l] }, () => (Math.random() * 2 - 1) * scale),
      ),
    );
    b.push(new Array(SIZES[l + 1]).fill(0));
  }
  return { w, b };
}

function predict(net: Net, x: number, y: number): number {
  let a = [x, y];
  for (let l = 0; l < net.w.length; l++) {
    const last = l === net.w.length - 1;
    const next: number[] = [];
    for (let i = 0; i < net.w[l].length; i++) {
      let z = net.b[l][i];
      for (let j = 0; j < a.length; j++) z += net.w[l][i][j] * a[j];
      next.push(last ? 1 / (1 + Math.exp(-z)) : Math.tanh(z));
    }
    a = next;
  }
  return a[0];
}

/** Uma época full-batch: acumula gradientes do BCE, dá um passo, devolve a perda média. */
function trainEpoch(net: Net, samples: Sample[]): number {
  const L = net.w.length;
  const gw: number[][][] = net.w.map((layer) => layer.map((row) => row.map(() => 0)));
  const gb: number[][] = net.b.map((layer) => layer.map(() => 0));
  let loss = 0;

  for (const s of samples) {
    const acts: number[][] = [[s.x, s.y]];
    for (let l = 0; l < L; l++) {
      const prev = acts[l];
      const last = l === L - 1;
      const next: number[] = [];
      for (let i = 0; i < net.w[l].length; i++) {
        let z = net.b[l][i];
        for (let j = 0; j < prev.length; j++) z += net.w[l][i][j] * prev[j];
        next.push(last ? 1 / (1 + Math.exp(-z)) : Math.tanh(z));
      }
      acts.push(next);
    }
    const p = acts[L][0];
    loss += -(s.label * Math.log(p + 1e-9) + (1 - s.label) * Math.log(1 - p + 1e-9));

    // Backprop: dL/dz da saída é (p - y) para BCE+sigmoide
    let delta: number[] = [p - s.label];
    for (let l = L - 1; l >= 0; l--) {
      const prev = acts[l];
      for (let i = 0; i < delta.length; i++) {
        gb[l][i] += delta[i];
        for (let j = 0; j < prev.length; j++) gw[l][i][j] += delta[i] * prev[j];
      }
      if (l > 0) {
        const back: number[] = new Array(prev.length).fill(0);
        for (let j = 0; j < prev.length; j++) {
          let sum = 0;
          for (let i = 0; i < delta.length; i++) sum += net.w[l][i][j] * delta[i];
          back[j] = (1 - prev[j] * prev[j]) * sum; // derivada da tanh
        }
        delta = back;
      }
    }
  }

  const n = samples.length;
  for (let l = 0; l < L; l++) {
    for (let i = 0; i < net.w[l].length; i++) {
      net.b[l][i] -= (LR * gb[l][i]) / n;
      for (let j = 0; j < net.w[l][i].length; j++) net.w[l][i][j] -= (LR * gw[l][i][j]) / n;
    }
  }
  return loss / n;
}

/* Datasets clássicos de playground */
function spiralDataset(n = 120): Sample[] {
  const out: Sample[] = [];
  for (let arm = 0; arm < 2; arm++) {
    for (let i = 0; i < n; i++) {
      const t = (i / n) * 1.75 * Math.PI + arm * Math.PI; // ~1.75 voltas
      const r = 0.12 + (i / n) * 0.98;
      out.push({
        x: r * Math.cos(t) + (Math.random() - 0.5) * 0.05,
        y: r * Math.sin(t) + (Math.random() - 0.5) * 0.05,
        label: arm as 0 | 1,
      });
    }
  }
  return out;
}
function xorDataset(n = 60): Sample[] {
  const out: Sample[] = [];
  const corners: [number, number, 0 | 1][] = [
    [-0.55, -0.55, 0],
    [0.55, 0.55, 0],
    [-0.55, 0.55, 1],
    [0.55, -0.55, 1],
  ];
  for (const [cx, cy, label] of corners) {
    for (let i = 0; i < n; i++) {
      out.push({ x: cx + (Math.random() - 0.5) * 0.55, y: cy + (Math.random() - 0.5) * 0.55, label });
    }
  }
  return out;
}
function ringsDataset(n = 80): Sample[] {
  const out: Sample[] = [];
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.35;
    out.push({ x: r * Math.cos(a), y: r * Math.sin(a), label: 0 });
  }
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.62 + Math.random() * 0.3;
    out.push({ x: r * Math.cos(a), y: r * Math.sin(a), label: 1 });
  }
  return out;
}

/** Hex (#rgb/#rrggbb) → componentes RGB — o heatmap mistura as classes por byte. */
function hexRGB(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function NeuralPlayground() {
  const { d } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const epochRef = useRef<HTMLSpanElement>(null);
  const lossRef = useRef<HTMLSpanElement>(null);
  const [training, setTraining] = useState(false);
  const [brush, setBrush] = useState<"a" | "b">("a");
  const [canTrain, setCanTrain] = useState(true);
  const brushRef = useRef<"a" | "b">("a");
  const actionsRef = useRef<{
    toggle: () => void;
    resetNet: () => void;
    clear: () => void;
    preset: (which: "spiral" | "xor" | "rings") => void;
  }>({ toggle: () => {}, resetNet: () => {}, clear: () => {}, preset: () => {} });

  useEffect(() => {
    const canvas = canvasRef.current;
    const chart = chartRef.current;
    if (!canvas || !chart) return;
    const ctx = canvas.getContext("2d");
    const chartCtx = chart.getContext("2d");
    if (!ctx || !chartCtx) return;

    // Narrowing não vaza para closures — fixa em consts locais
    const element = canvas;
    const context = ctx;
    const chartElement = chart;
    const chartContext = chartCtx;

    let width = 0;
    let height = 0;
    let raf = 0;
    let visible = true;
    let running = false;

    let net = makeNet();
    const samples: Sample[] = [];
    const lossHistory: number[] = [];
    let epoch = 0;

    // Accent em cache — atualiza quando o tema troca (classe no <html>)
    let accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#7c3aed";
    const themeObserver = new MutationObserver(() => {
      accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || accent;
      draw();
      drawChart();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // Offscreen 64×64 com a fronteira de decisão, escalado com smoothing
    const off = document.createElement("canvas");
    off.width = 64;
    off.height = 64;
    const offCtx = off.getContext("2d");
    const offData = offCtx ? offCtx.createImageData(64, 64) : null;

    function hasBoth(): boolean {
      let a = 0;
      let b = 0;
      for (const s of samples) {
        if (s.label) b++;
        else a++;
      }
      return a >= 2 && b >= 2;
    }
    function refreshCanTrain() {
      setCanTrain(hasBoth());
    }

    function draw() {
      context.clearRect(0, 0, width, height);

      // Heatmap da fronteira: cor = mix(gold, accent, p), alpha = confiança
      if (offCtx && offData) {
        const [ar, ag, ab] = hexRGB(accent);
        const [gr, gg, gb2] = hexRGB(GOLD);
        for (let py = 0; py < 64; py++) {
          for (let px = 0; px < 64; px++) {
            const wx = ((px + 0.5) / 64) * 2 * WORLD - WORLD;
            const wy = ((py + 0.5) / 64) * 2 * WORLD - WORLD;
            const p = predict(net, wx, wy);
            const idx = (py * 64 + px) * 4;
            offData.data[idx] = gr + (ar - gr) * p;
            offData.data[idx + 1] = gg + (ag - gg) * p;
            offData.data[idx + 2] = gb2 + (ab - gb2) * p;
            offData.data[idx + 3] = Math.round((0.04 + Math.abs(p - 0.5) * 0.30) * 255);
          }
        }
        offCtx.putImageData(offData, 0, 0);
        context.imageSmoothingEnabled = true;
        context.drawImage(off, 0, 0, width, height);
      }

      // Pontos
      for (const s of samples) {
        const px = ((s.x + WORLD) / (2 * WORLD)) * width;
        const py = ((s.y + WORLD) / (2 * WORLD)) * height;
        context.fillStyle = s.label === 0 ? accent : GOLD;
        context.strokeStyle = "rgba(0, 0, 0, 0.35)";
        context.lineWidth = 1;
        context.beginPath();
        context.arc(px, py, 5, 0, Math.PI * 2);
        context.fill();
        context.stroke();
      }
    }

    function drawChart() {
      chartContext.clearRect(0, 0, chartElement.width, chartElement.height);
      if (lossHistory.length < 2) return;
      const w = chartElement.width;
      const h = chartElement.height;
      const max = Math.max(...lossHistory, 1e-6);
      chartContext.strokeStyle = accent;
      chartContext.lineWidth = 2;
      chartContext.lineJoin = "round";
      chartContext.beginPath();
      for (let i = 0; i < lossHistory.length; i++) {
        const x = (i / (lossHistory.length - 1)) * (w - 8) + 4;
        const y = h - 6 - (lossHistory[i] / max) * (h - 14);
        if (i === 0) chartContext.moveTo(x, y);
        else chartContext.lineTo(x, y);
      }
      chartContext.stroke();
    }

    function stopTraining() {
      running = false;
      setTraining(false);
    }

    function frame() {
      raf = 0; // id volta a 0 a cada frame — o loop pode renascer via IntersectionObserver
      for (let k = 0; k < EPOCHS_PER_FRAME; k++) {
        if (!hasBoth()) {
          stopTraining();
          break;
        }
        lossHistory.push(trainEpoch(net, samples));
        if (lossHistory.length > 600) lossHistory.shift();
        epoch++;
      }
      draw();
      drawChart();
      if (epochRef.current) epochRef.current.textContent = String(epoch);
      if (lossRef.current && lossHistory.length) lossRef.current.textContent = lossHistory[lossHistory.length - 1].toFixed(3);
      if (running && visible) raf = requestAnimationFrame(frame);
    }

    function resize() {
      for (const [el, c2d] of [
        [element, context],
        [chartElement, chartContext],
      ] as [HTMLCanvasElement, CanvasRenderingContext2D][]) {
        const rect = el.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        el.width = Math.max(1, Math.round(rect.width * dpr));
        el.height = Math.max(1, Math.round(rect.height * dpr));
        c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      width = element.getBoundingClientRect().width;
      height = element.getBoundingClientRect().height;
      draw();
      drawChart();
    }

    // Pintura de pontos: botão direito inverte a classe do traço
    let painting = false;
    let strokeClass: 0 | 1 = 0;
    let lastPx = -99;
    let lastPy = -99;
    function addPoint(event: PointerEvent) {
      const rect = element.getBoundingClientRect();
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top;
      if (Math.hypot(px - lastPx, py - lastPy) < 7) return;
      lastPx = px;
      lastPy = py;
      const x = (px / rect.width) * 2 * WORLD - WORLD;
      const y = (py / rect.height) * 2 * WORLD - WORLD;
      samples.push({ x, y, label: strokeClass });
      refreshCanTrain();
      draw();
    }
    function onDown(event: PointerEvent) {
      painting = true;
      lastPx = -99;
      lastPy = -99;
      strokeClass = event.button === 2 ? (brushRef.current === "a" ? 1 : 0) : brushRef.current === "a" ? 0 : 1;
      element.setPointerCapture(event.pointerId);
      addPoint(event);
    }
    function onMove(event: PointerEvent) {
      if (!painting) return;
      addPoint(event);
    }
    function onUp() {
      painting = false;
    }
    function onContext(event: MouseEvent) {
      event.preventDefault(); // botão direito pinta, não abre menu
    }

    actionsRef.current = {
      toggle: () => {
        if (running) {
          stopTraining();
        } else if (hasBoth()) {
          running = true;
          setTraining(true);
          if (raf === 0) raf = requestAnimationFrame(frame);
        }
      },
      resetNet: () => {
        stopTraining();
        net = makeNet();
        epoch = 0;
        lossHistory.length = 0;
        if (epochRef.current) epochRef.current.textContent = "0";
        if (lossRef.current) lossRef.current.textContent = "—";
        draw();
        drawChart();
      },
      clear: () => {
        stopTraining();
        samples.length = 0;
        refreshCanTrain();
        draw();
      },
      preset: (which) => {
        stopTraining();
        samples.length = 0;
        samples.push(...(which === "spiral" ? spiralDataset() : which === "xor" ? xorDataset() : ringsDataset()));
        net = makeNet();
        epoch = 0;
        lossHistory.length = 0;
        if (epochRef.current) epochRef.current.textContent = "0";
        if (lossRef.current) lossRef.current.textContent = "—";
        refreshCanTrain();
        draw();
      },
    };

    // Estado inicial: espiral pronta pra treinar
    actionsRef.current.preset("spiral");
    resize();

    const io = new IntersectionObserver((entries) => {
      const was = visible;
      visible = entries[entries.length - 1].isIntersecting;
      if (visible && !was && running && raf === 0) raf = requestAnimationFrame(frame);
    });
    io.observe(element);
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    observer.observe(chartElement);
    element.addEventListener("pointerdown", onDown);
    element.addEventListener("pointermove", onMove, { passive: true });
    element.addEventListener("pointerup", onUp);
    element.addEventListener("pointercancel", onUp);
    element.addEventListener("contextmenu", onContext);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      observer.disconnect();
      themeObserver.disconnect();
      element.removeEventListener("pointerdown", onDown);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerup", onUp);
      element.removeEventListener("pointercancel", onUp);
      element.removeEventListener("contextmenu", onContext);
    };
  }, []);

  const chip = (active: boolean) =>
    `inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${
      active ? "border-accent/60 bg-accent-soft font-medium" : "border-border hover:bg-surface-2"
    }`;

  return (
    <div data-reveal className="mt-10">
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <BrainCircuit className="h-5 w-5 text-accent" aria-hidden="true" />
        {d.ai.playground.title}
      </h3>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-xl border border-border bg-background">
          <canvas
            ref={canvasRef}
            className="block aspect-square w-full cursor-crosshair touch-none"
            aria-label={d.ai.playground.canvasLabel}
          />
          <p className="border-t border-border px-4 py-2 text-xs text-muted">{d.ai.playground.hint}</p>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{d.ai.playground.classA} / {d.ai.playground.classB}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => { setBrush("a"); brushRef.current = "a"; }} className={chip(brush === "a")}>
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-accent" />
                {d.ai.playground.classA}
              </button>
              <button type="button" onClick={() => { setBrush("b"); brushRef.current = "b"; }} className={chip(brush === "b")}>
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: GOLD }} />
                {d.ai.playground.classB}
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{d.ai.playground.presets}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => actionsRef.current.preset("spiral")} className={chip(false)}>
                {d.ai.playground.presetSpiral}
              </button>
              <button type="button" onClick={() => actionsRef.current.preset("xor")} className={chip(false)}>
                {d.ai.playground.presetXor}
              </button>
              <button type="button" onClick={() => actionsRef.current.preset("rings")} className={chip(false)}>
                {d.ai.playground.presetRings}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => actionsRef.current.toggle()}
              disabled={!canTrain}
              className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              {training ? <Square className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
              {training ? d.ai.playground.pause : d.ai.playground.train}
            </button>
            <button
              type="button"
              onClick={() => actionsRef.current.resetNet()}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-surface-2"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              {d.ai.playground.resetNet}
            </button>
            <button
              type="button"
              onClick={() => actionsRef.current.clear()}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-surface-2"
            >
              <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
              {d.ai.playground.clearPoints}
            </button>
          </div>
          {!canTrain ? <p className="text-xs text-muted">{d.ai.playground.needBoth}</p> : null}

          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-md border border-border bg-background px-3 py-2">
              <dt className="text-xs text-muted">{d.ai.playground.epoch}</dt>
              <dd ref={epochRef} className="tabular-nums font-semibold">0</dd>
            </div>
            <div className="rounded-md border border-border bg-background px-3 py-2">
              <dt className="text-xs text-muted">{d.ai.playground.loss}</dt>
              <dd ref={lossRef} className="tabular-nums font-semibold">—</dd>
            </div>
          </dl>

          <canvas ref={chartRef} className="block h-20 w-full" aria-label={d.ai.playground.chartLabel} />
          <p className="text-xs leading-relaxed text-muted">{d.ai.playground.architecture}</p>
        </div>
      </div>
    </div>
  );
}
