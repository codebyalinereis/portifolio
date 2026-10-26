"use client";

import { useEffect, useRef } from "react";

/**
 * Dois motores de scroll em um componente que não re-renderiza nada:
 * 1. [data-reveal] → .revealed ao entrar na viewport (CSS faz a animação),
 *    com MutationObserver cobrindo navegação client-side;
 * 2. barra de progresso de leitura no topo — atualizada direto no style,
 *    sem setState (zero re-render por evento de scroll).
 */
export function ScrollWatcher() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("revealed"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed");
              io.unobserve(entry.target);
            }
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );

      const observeAll = (root: ParentNode) => {
        root.querySelectorAll("[data-reveal]:not(.revealed)").forEach((el) => io.observe(el));
      };

      observeAll(document);

      const mo = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              if (node.hasAttribute("data-reveal")) io.observe(node);
              observeAll(node);
            }
          });
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });

      return () => {
        io.disconnect();
        mo.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    const bar = progressRef.current;
    if (!bar) return;

    function update() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const progress = max > 0 ? Math.min(1, doc.scrollTop / max) : 0;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${progress})`;
      }
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return <div ref={progressRef} className="scroll-progress" aria-hidden="true" />;
}
