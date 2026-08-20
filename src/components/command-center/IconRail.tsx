"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  IconLayoutDashboard,
  IconFlask2,
  IconGitPullRequest,
  IconFileCheck,
  IconShieldLock,
  IconDoorExit,
  IconBell,
} from "@tabler/icons-react";

const navItems = [
  { id: "command-center", icon: IconLayoutDashboard, label: "Command Center" },
  { id: "verification-lab", icon: IconFlask2, label: "Verification Lab" },
  { id: "patch-forge", icon: IconGitPullRequest, label: "Remediation" },
  { id: "evidence", icon: IconFileCheck, label: "Evidence Report" },
  { id: "governance", icon: IconShieldLock, label: "Governance" },
  { id: "gate", icon: IconDoorExit, label: "Deployment Gate" },
  { id: "alerts", icon: IconBell, label: "Alerts" },
];

export function IconRail() {
  const [active, setActive] = useState("command-center");

  return (
    <nav className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border-soft bg-panel/40 py-3">
      {navItems.map(({ id, icon: Icon, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            title={label}
            aria-label={label}
            aria-current={isActive}
            onClick={() => setActive(id)}
            className={clsx(
              "relative flex h-10 w-10 items-center justify-center transition-colors",
              isActive ? "text-amber" : "text-text-dim hover:text-text-muted"
            )}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 bg-amber" />
            )}
            <Icon size={18} strokeWidth={1.5} />
          </button>
        );
      })}
    </nav>
  );
}
