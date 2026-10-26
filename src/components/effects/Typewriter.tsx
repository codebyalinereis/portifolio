"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";

/**
 * Máquina de escrever que roda entre as palavras (papéis do hero).
 * Digita, segura, apaga e vai para a próxima — em loop. A máquina de
 * estados vive inteira dentro do callback do timeout (nada de setState
 * síncrono no corpo do efeito).
 * prefers-reduced-motion: mostra a primeira palavra, parada.
 * O texto animado é aria-hidden; um span sr-only carrega o papel real.
 */
export function Typewriter({ words }: { words: string[] }) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const word = words[index % words.length];
    const isFull = !deleting && text === word;
    const isEmpty = deleting && text === "";
    const delay = isFull ? 1900 : isEmpty ? 220 : deleting ? 38 : 74;

    const timer = setTimeout(() => {
      if (isFull) {
        setDeleting(true);
      } else if (isEmpty) {
        setDeleting(false);
        setIndex((i) => (i + 1) % words.length);
      } else {
        setText((current) => (deleting ? word.slice(0, current.length - 1) : word.slice(0, current.length + 1)));
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [text, deleting, index, words, reduced]);

  return (
    <span>
      <span className="sr-only">{words[0]}</span>
      <span aria-hidden="true">
        {reduced ? words[0] : text}
        <span className="typewriter-caret" />
      </span>
    </span>
  );
}
