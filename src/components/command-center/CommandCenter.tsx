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
import { useCommandCenterState } from "@/lib/sentinel/hooks";
import type { AgentId } from "@/lib/types";

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
  const { state, loading, error, starting, aborting, start, abort } = useCommandCenterState();

  const replaySteps = state?.replaySteps ?? [];
  const jumpedStepId = selectedAgentId
    ? latestStepByAgent[selectedAgentId] ?? replaySteps.find((s) => s.status === "active")?.id
    : null;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar job={state?.job ?? null} starting={starting} aborting={aborting} onStart={start} onAbort={abort} />
      <div className="flex min-h-0 flex-1">
        <IconRail />
        <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-auto p-3 lg:grid-cols-[1.3fr_1fr_1fr] lg:grid-rows-2">
          <AgentNetworkPanel
            graphNodes={state?.graphNodes ?? []}
            graphEdges={state?.graphEdges ?? []}
            activeEdgeIds={state?.activeEdgeIds ?? []}
            finding={state?.finding ?? null}
            loading={loading}
            error={error}
            selectedAgentId={selectedAgentId}
            onSelectAgent={setSelectedAgentId}
          />

          <VerificationRuntimePanel
            verificationState={state?.verificationState ?? null}
            verificationLog={state?.verificationLog ?? []}
            loading={loading}
            error={error}
          />

          <div className="grid min-h-0 grid-rows-2 gap-3">
            <VerificationStatePanel verificationState={state?.verificationState ?? null} loading={loading} error={error} />
            <ReplayTimelinePanel replaySteps={replaySteps} jumpedStepId={jumpedStepId} loading={loading} error={error} />
          </div>

          <EvidenceVaultPanel evidenceDoc={state?.evidenceDoc ?? null} loading={loading} error={error} />

          <AgentRegistryPanel
            agents={state?.agents ?? []}
            loading={loading}
            error={error}
            selectedAgentId={selectedAgentId}
            onSelectAgent={setSelectedAgentId}
          />
        </main>
      </div>
    </div>
  );
}
