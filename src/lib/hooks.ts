"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** true só depois da hidratação no cliente (evita mismatch de tema/ícone). */
export function useMounted(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/** prefers-reduced-motion reativo a mudanças do usuário, sem setState em efeito. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia("(prefers-reduced-motion: reduce)");
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}
