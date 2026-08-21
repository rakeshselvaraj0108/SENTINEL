"use client";

import { useEffect, useState } from "react";
import {
  generatedTests,
  initialAuditLog,
  initialClaims,
  initialSandboxContainers,
} from "@/lib/remediation-data";
import type {
  AuditLogEntry,
  RemediationClaim,
  SandboxContainer,
  TestRun,
  TestRunStatus,
} from "@/lib/remediation-types";

export interface VerificationRun {
  containers: SandboxContainer[];
  tests: TestRun[];
  claims: RemediationClaim[];
  auditLog: AuditLogEntry;
  allPassed: boolean;
}

function statusFor(progress: number): SandboxContainer["status"] {
  if (progress <= 0) return "queued";
  if (progress < 100) return "running";
  return "passed";
}

export function useVerificationRun(active: boolean): VerificationRun {
  const [containers, setContainers] = useState<SandboxContainer[]>(initialSandboxContainers);

  useEffect(() => {
    if (!active) return;
    const rates = [9, 6];
    const id = setInterval(() => {
      setContainers((prev) => {
        if (prev.every((c) => c.progressPct >= 100)) return prev;
        return prev.map((c, i) => {
          const progressPct = Math.min(100, c.progressPct + rates[i]);
          return { ...c, progressPct, status: statusFor(progressPct) };
        });
      });
    }, 350);
    return () => clearInterval(id);
  }, [active]);

  const [container0, container1] = containers;
  const container0Done = container0.progressPct >= 100;
  const container1Running = container1.progressPct > 0;
  const container1Done = container1.progressPct >= 100;
  const allPassed = container0Done && container1Done;

  const statusOf = (id: string): TestRunStatus => {
    if (id === "container-0") return container0Done ? "passed" : container0.progressPct > 0 ? "running" : "queued";
    if (id === "container-1") return container1Done ? "passed" : container1Running ? "running" : "queued";
    return allPassed ? "passed" : "running";
  };

  const tests: TestRun[] = generatedTests.map((t) => ({ ...t, status: statusOf(t.id) }));

  const claims: RemediationClaim[] = initialClaims.map((c) => ({
    ...c,
    status: c.id === "claim-algorithms" ? (container0Done ? "confirmed" : "pending") : container1Done ? "confirmed" : "pending",
  }));

  const auditLog: AuditLogEntry = { ...initialAuditLog, sealed: allPassed };

  return { containers, tests, claims, auditLog, allPassed };
}
