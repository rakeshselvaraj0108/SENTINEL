"use client";

import { useState } from "react";
import { TopBar } from "./TopBar";
import { IconRail } from "./IconRail";
import { AgentNetworkPanel } from "./panels/AgentNetworkPanel";
import { VerificationRuntimePanel } from "./panels/VerificationRuntimePanel";
import { VerificationStatePanel } from "./panels/VerificationStatePanel";
import { ReplayTimelinePanel } from "./panels/ReplayTimelinePanel";
import { EvidenceVaultPanel } from "./panels/EvidenceVaultPanel";
import { AgentRegistryPanel } from "./panels/AgentRegistryPanel";
import type { AgentId } from "@/lib/types";
import { replaySteps } from "@/lib/mock-data";

const latestStepByAgent: Partial<Record<AgentId, string>> = {
  hunter: "discovery",
  analyst: "verification",
  verifier: "verification",
  "patch-forge": "patch",
  "re-verifier": "re-verify",
  watchdog: "resolution",
};

export function CommandCenter() {
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId | null>(null);

  const jumpedStepId = selectedAgentId
    ? latestStepByAgent[selectedAgentId] ?? replaySteps.find((s) => s.status === "active")?.id
    : null;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <IconRail />
        <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-auto p-3 lg:grid-cols-[1.3fr_1fr_1fr] lg:grid-rows-2">
          <AgentNetworkPanel selectedAgentId={selectedAgentId} onSelectAgent={setSelectedAgentId} />

          <VerificationRuntimePanel />

          <div className="grid min-h-0 grid-rows-2 gap-3">
            <VerificationStatePanel />
            <ReplayTimelinePanel jumpedStepId={jumpedStepId} />
          </div>

          <EvidenceVaultPanel />

          <AgentRegistryPanel selectedAgentId={selectedAgentId} onSelectAgent={setSelectedAgentId} />
        </main>
      </div>
    </div>
  );
}
