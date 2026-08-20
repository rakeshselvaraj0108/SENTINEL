"use client";

import { useState } from "react";
import { TopBar } from "../command-center/TopBar";
import { IconRail } from "../command-center/IconRail";
import { EvidenceHeader } from "./EvidenceHeader";
import { VulnerabilitySummaryPanel } from "./column1/VulnerabilitySummaryPanel";
import { ReachabilityAnalysisPanel } from "./column1/ReachabilityAnalysisPanel";
import { SandboxVerificationPanel } from "./column1/SandboxVerificationPanel";
import { RemediationEvidencePackPanel } from "./column1/RemediationEvidencePackPanel";
import { ReVerificationResultsPanel } from "./column2/ReVerificationResultsPanel";
import { AuditTrailPanel } from "./column3/AuditTrailPanel";
import { ExecutionTimelineLink } from "./column3/ExecutionTimelineLink";
import { CompleteSecurePanel } from "./column3/CompleteSecurePanel";
import { DwsViewerSlot } from "./column3/DwsViewerSlot";

export function EvidenceReport() {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <IconRail />
        <div className="flex min-h-0 flex-1 flex-col">
          <EvidenceHeader />
          <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-auto p-3 lg:grid-cols-[0.85fr_1fr_1fr]">
            <div className="flex flex-col gap-3">
              <VulnerabilitySummaryPanel highlighted={selectedTarget === "summary"} />
              <ReachabilityAnalysisPanel highlighted={selectedTarget === "reachability"} />
              <SandboxVerificationPanel highlighted={selectedTarget === "reverify"} />
              <RemediationEvidencePackPanel highlighted={selectedTarget === "evidence-pack"} />
            </div>

            <div className="flex flex-col gap-3">
              <ReVerificationResultsPanel highlighted={selectedTarget === "reverify"} />
            </div>

            <div className="flex flex-col gap-3">
              <AuditTrailPanel selectedTarget={selectedTarget} onSelect={setSelectedTarget} />
              <ExecutionTimelineLink />
              <CompleteSecurePanel highlighted={selectedTarget === "signoff"} />
              <DwsViewerSlot />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
