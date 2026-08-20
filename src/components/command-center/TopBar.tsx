import {
  IconShieldCheck,
  IconClipboardList,
  IconSettings2,
  IconPlayerStopFilled,
  IconTerminal2,
} from "@tabler/icons-react";

const controls = [
  { icon: IconClipboardList, label: "audit log" },
  { icon: IconSettings2, label: "ops" },
  { icon: IconPlayerStopFilled, label: "abort" },
  { icon: IconTerminal2, label: "output" },
];

export function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-soft bg-panel/60 px-4">
      <div className="flex items-center gap-3">
        <IconShieldCheck size={22} strokeWidth={1.5} className="text-amber" />
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-semibold tracking-tight text-amber">
            SENTINEL
          </span>
          <span className="hidden text-[11px] text-text-muted sm:inline">
            Evidence-Driven Security Fleet
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 border border-border px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          v2.4 · autonomous
        </div>
        <div className="flex items-center divide-x divide-border-soft border border-border-soft">
          {controls.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] uppercase tracking-[0.06em] text-text-muted transition-colors hover:bg-white/[0.03] hover:text-text"
            >
              <Icon size={14} strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
