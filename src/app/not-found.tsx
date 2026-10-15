"use client";

import Link from "next/link";
import { buttonClass } from "@/components/ui/primitives";
import { useI18n } from "@/contexts/LocaleProvider";

export default function NotFound() {
  const { d } = useI18n();
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-32 text-center">
      <p className="text-6xl font-bold text-accent tabular-nums">404</p>
      <h1 className="text-2xl font-semibold">{d.notFound.title}</h1>
      <p className="text-muted">{d.notFound.subtitle}</p>
      <Link href="/" className={buttonClass("primary", "mt-4")}>
        {d.common.backHome}
      </Link>
    </div>
  );
}
