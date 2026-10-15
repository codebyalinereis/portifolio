"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Paleta dos gráficos — valores validados com o script de dataviz
 * (checks de lightness band, chroma, CVD ΔE, contraste vs superfície).
 * As cores dependem do tema RESOLVIDO (claro/escuro têm passos próprios),
 * então os componentes de chart leem daqui em vez de CSS vars.
 */

export type ChartPalette = {
  series1: string;
  series2: string;
  grid: string;
  text: string;
  surface: string;
  /** Cor sequencial (magnitude) na fração t ∈ [0,1], interpolada em OKLab. */
  seq: (t: number) => string;
};

const LIGHT: ChartPalette = {
  series1: "#6d28d9",
  series2: "#d97706",
  grid: "#e7e2f2",
  text: "#655e7e",
  surface: "#fdfcff",
  seq: seqInterpolator("#a78bfa", "#4c1d95"),
};

const DARK: ChartPalette = {
  series1: "#8b5cf6",
  series2: "#d97706",
  grid: "#2e2844",
  text: "#a89fc6",
  surface: "#1b1726",
  seq: seqInterpolator("#6d28d9", "#c4b5fd"),
};

// ── Interpolação em OKLab (monotone em luminância, um único hue) ──────────

type Rgb = { r: number; g: number; b: number };

function hexToRgb(hex: string): Rgb {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.slice(0, 2), 16) / 255,
    g: parseInt(value.slice(2, 4), 16) / 255,
    b: parseInt(value.slice(4, 6), 16) / 255,
  };
}

function rgbToHex({ r, g, b }: Rgb): string {
  const to255 = (channel: number) => Math.round(Math.min(1, Math.max(0, channel)) * 255);
  return `#${[to255(r), to255(g), to255(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function srgbToLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
}

function linearToSrgb(channel: number): number {
  return channel <= 0.0031308 ? channel * 12.92 : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
}

function rgbToOklab({ r, g, b }: Rgb) {
  const lr = srgbToLinear(r), lg = srgbToLinear(g), lb = srgbToLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return { L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
           a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
           b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s };
}

function oklabToRgb({ L, a, b }: { L: number; a: number; b: number }): Rgb {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return {
    r: linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

function seqInterpolator(fromHex: string, toHex: string): (t: number) => string {
  const from = rgbToOklab(hexToRgb(fromHex));
  const to = rgbToOklab(hexToRgb(toHex));
  return (t: number) => {
    const clamped = Math.min(1, Math.max(0, t));
    return rgbToHex(
      oklabToRgb({
        L: from.L + (to.L - from.L) * clamped,
        a: from.a + (to.a - from.a) * clamped,
        b: from.b + (to.b - from.b) * clamped,
      })
    );
  };
}

const FALLBACK = LIGHT;

/** Hook: paleta conforme o tema resolvido. No SSR usa o claro (fallback). */
export function useChartPalette(): ChartPalette {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return FALLBACK;
  return resolvedTheme === "dark" ? DARK : LIGHT;
}
