import type { Metadata } from "next";
import { FlowField } from "@/components/lab/FlowField";
import { DataRace } from "@/components/lab/DataRace";
import { MemoryGame } from "@/components/lab/MemoryGame";

export const metadata: Metadata = {
  title: "Lab — experimentos interativos | Aline Reis",
  description:
    "Playground interativo: campo de fluxo generativo em canvas, corrida de dados animada e jogo da memória da stack — feitos à mão com React, sem bibliotecas de efeito.",
};

export default function LabPage() {
  return (
    <div className="flex flex-col">
      <FlowField />
      <DataRace />
      <MemoryGame />
    </div>
  );
}
