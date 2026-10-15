import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard — ETL & Analytics | Aline Reis",
  description: "Demo de ETL e analytics: upload de CSV de notas fiscais, transformação, PostgreSQL e SQL analítico.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
