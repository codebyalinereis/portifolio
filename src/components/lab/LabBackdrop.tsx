/* Cenário de fundo do /lab — 100% CSS (grade em perspectiva, pontilhado,
   horizonte com glow e scanline), sem JS: nada compete com os experimentos.
   Vive atrás do conteúdo (z-index -1) e respeita prefers-reduced-motion. */
export function LabBackdrop() {
  return (
    <div aria-hidden="true" className="lab-backdrop">
      <div className="lab-glow" />
      <div className="lab-dots" />
      <div className="lab-grid" />
      <div className="lab-horizon" />
      <div className="lab-scan" />
    </div>
  );
}
