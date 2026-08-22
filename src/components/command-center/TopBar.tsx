"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  IconShieldCheck,
  IconClipboardList,
  IconSettings2,
  IconPlayerStopFilled,
  IconTerminal2,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import type { JobRecord, SystemInfo } from "@/lib/sentinel/api";
import { getSystemInfo } from "@/lib/sentinel/api";

interface TopBarProps {
  job?: JobRecord | null;
  starting?: boolean;
  aborting?: boolean;
  onStart?: () => void;
  onAbort?: () => void;
}

export function TopBar({ job = null, starting = false, aborting = false, onStart, onAbort }: TopBarProps) {
  const router = useRouter();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [showOps, setShowOps] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const isRunning = job?.status === "queued" || job?.status === "running";

  async function handleOps() {
    if (!systemInfo) {
      try {
        setSystemInfo(await getSystemInfo());
      } catch {
        // system-info panel just stays empty if the API is unreachable
      }
    }
    setShowOps((v) => !v);
    setShowOutput(false);
  }

  return (
    <header className="relative flex h-14 shrink-0 items-center justify-between border-b border-border-soft bg-panel/60 px-4">
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

        {onStart && (
          <button
            type="button"
            onClick={onStart}
            disabled={isRunning || starting}
            className="flex items-center gap-1.5 border border-amber/50 bg-amber/10 px-2.5 py-1.5 text-[11px] uppercase tracking-[0.06em] text-amber transition-colors hover:bg-amber/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <IconPlayerPlayFilled size={13} strokeWidth={1.5} />
            {starting ? "starting…" : isRunning ? "investigation running" : "start investigation"}
          </button>
        )}

        <div className="flex items-center divide-x divide-border-soft border border-border-soft">
          <button
            type="button"
            onClick={() => router.push("/governance")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] uppercase tracking-[0.06em] text-text-muted transition-colors hover:bg-white/[0.03] hover:text-text"
          >
            <IconClipboardList size={14} strokeWidth={1.5} />
            audit log
          </button>
          <button
            type="button"
            onClick={handleOps}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] uppercase tracking-[0.06em] text-text-muted transition-colors hover:bg-white/[0.03] hover:text-text"
          >
            <IconSettings2 size={14} strokeWidth={1.5} />
            ops
          </button>
          <button
            type="button"
            onClick={onAbort}
            disabled={!onAbort || !isRunning || aborting}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] uppercase tracking-[0.06em] text-text-muted transition-colors hover:bg-white/[0.03] hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
          >
            <IconPlayerStopFilled size={14} strokeWidth={1.5} />
            {aborting ? "aborting…" : "abort"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowOutput((v) => !v);
              setShowOps(false);
            }}
            disabled={!job}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] uppercase tracking-[0.06em] text-text-muted transition-colors hover:bg-white/[0.03] hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
          >
            <IconTerminal2 size={14} strokeWidth={1.5} />
            output
          </button>
        </div>
      </div>

      {showOps && (
        <div className="absolute right-4 top-14 z-20 w-72 border border-border bg-panel p-3 font-data text-[11px] text-text-muted shadow-xl">
          <p className="mb-2 text-[10px] uppercase tracking-[0.06em] text-text-dim">system info (live)</p>
          {systemInfo ? (
            <dl className="space-y-1">
              <div className="flex justify-between"><dt>queue backend</dt><dd className="text-text">{systemInfo.queue_backend}</dd></div>
              <div className="flex justify-between"><dt>store backend</dt><dd className="text-text">{systemInfo.store_backend}</dd></div>
              <div className="flex justify-between"><dt>gcp project</dt><dd className="text-text">{systemInfo.gcp_project_id ?? "not set"}</dd></div>
              <div className="flex justify-between"><dt>nutrient dws</dt><dd className="text-text">{systemInfo.nutrient_configured ? "configured" : "not set"}</dd></div>
            </dl>
          ) : (
            <p>unreachable</p>
          )}
        </div>
      )}

      {showOutput && (
        <div className="absolute right-4 top-14 z-20 max-h-96 w-[28rem] overflow-auto border border-border bg-panel p-3 font-data text-[10px] text-text-muted shadow-xl">
          <p className="mb-2 text-[10px] uppercase tracking-[0.06em] text-text-dim">
            latest job result (raw, live)
          </p>
          <pre className="whitespace-pre-wrap break-words">
            {job ? JSON.stringify(job, null, 2) : "no job yet"}
          </pre>
        </div>
      )}
    </header>
  );
}
