"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  { href: "/", icon: IconLayoutDashboard, label: "Command Center" },
  { href: null, icon: IconFlask2, label: "Verification Lab" },
  { href: "/remediation", icon: IconGitPullRequest, label: "Remediation" },
  { href: "/evidence", icon: IconFileCheck, label: "Evidence Report" },
  { href: null, icon: IconShieldLock, label: "Governance" },
  { href: null, icon: IconDoorExit, label: "Deployment Gate" },
  { href: null, icon: IconBell, label: "Alerts" },
];

export function IconRail() {
  const pathname = usePathname();

  return (
    <nav className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border-soft bg-panel/40 py-3">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = href !== null && pathname === href;
        const content = (
          <>
            {isActive && (
              <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 bg-amber" />
            )}
            <Icon size={18} strokeWidth={1.5} />
          </>
        );
        const className = clsx(
          "relative flex h-10 w-10 items-center justify-center transition-colors",
          isActive ? "text-amber" : href ? "text-text-dim hover:text-text-muted" : "cursor-not-allowed text-text-dim/40"
        );

        if (href) {
          return (
            <Link key={label} href={href} title={label} aria-label={label} aria-current={isActive} className={className}>
              {content}
            </Link>
          );
        }

        return (
          <button key={label} type="button" title={`${label} (not yet built)`} aria-label={label} disabled className={className}>
            {content}
          </button>
        );
      })}
    </nav>
  );
}
