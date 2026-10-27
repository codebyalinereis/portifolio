import type { Metadata } from "next";
import { Raymarcher } from "@/components/lab/Raymarcher";
import { FlowField } from "@/components/lab/FlowField";
import { DataRace } from "@/components/lab/DataRace";
import { FourierDraw } from "@/components/lab/FourierDraw";
import { MemoryGame } from "@/components/lab/MemoryGame";

export const metadata: Metadata = {
  title: "Lab — experimentos interativos | Aline Reis",
  description:
    "Playground interativo: escultura procedural em raymarching WebGL, campo de fluxo generativo, corrida de dados animada, máquina de Fourier que redesenha o seu traço e jogo da memória — tudo feito à mão com React, sem bibliotecas de efeito.",
};

export default function LabPage() {
  return (
    <div className="flex flex-col">
      <Raymarcher />
      <FlowField />
      <DataRace />
      <FourierDraw />
      <MemoryGame />
    </div>
  );
}
