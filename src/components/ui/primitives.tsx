import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface p-6 transition-colors",
        className
      )}
      {...props}
    />
  );
}

export function Badge({ className, children, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

type ButtonVariant = "primary" | "outline" | "ghost" | "danger";

const buttonVariants: Record<ButtonVariant, string> = {
  // btn-primary (globals.css): gradiente roxo + glow no hover
  primary: "btn-primary text-accent-ink",
  outline: "border border-border bg-transparent hover:bg-surface-2",
  ghost: "hover:bg-surface-2",
  danger: "bg-red-700 text-white hover:opacity-90",
};

export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
    "disabled:cursor-not-allowed disabled:opacity-50",
    buttonVariants[variant],
    className
  );
}

export function Button({ variant = "primary", className, ...props }: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export function SectionHeading({
  id,
  title,
  subtitle,
  className,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-8", className)}>
      <h2 id={id} className="scroll-mt-24 text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      <span aria-hidden="true" className="heading-underline mt-2 block" />
      {subtitle ? <p className="mt-3 max-w-2xl text-muted">{subtitle}</p> : null}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted">{children}</p>;
}
