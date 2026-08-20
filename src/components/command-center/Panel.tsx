import type { ReactNode } from "react";
import clsx from "clsx";

interface PanelProps {
  title: string;
  className?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
}

export function Panel({ title, className, headerRight, children, bodyClassName }: PanelProps) {
  return (
    <section
      className={clsx(
        "flex flex-col rounded-[6px] border border-border bg-panel/80 backdrop-blur-sm",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]",
        className
      )}
    >
      <header className="flex items-center justify-between border-b border-border-soft px-3 py-2 shrink-0">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
          {title}
        </h2>
        {headerRight}
      </header>
      <div className={clsx("min-h-0 flex-1", bodyClassName)}>{children}</div>
    </section>
  );
}
