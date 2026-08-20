"use client";

import { useState } from "react";
import { TopBar } from "../command-center/TopBar";
import { IconRail } from "../command-center/IconRail";
import { AssetRegistryPanel } from "./AssetRegistryPanel";
import { SecurityAssertionWorkflow } from "./column2/SecurityAssertionWorkflow";
import { CompliancePosturePanel } from "./column3/CompliancePosturePanel";
import { PendingSignOffsPanel } from "./column3/PendingSignOffsPanel";
import { defaultSelectedAssetId } from "@/lib/verification-lab-data";

export function VerificationLabPage() {
  const [selectedAssetId, setSelectedAssetId] = useState(defaultSelectedAssetId);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <IconRail />
        <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 lg:grid-cols-[0.3fr_0.45fr_0.25fr]">
          <div className="h-full min-h-0">
            <AssetRegistryPanel selectedId={selectedAssetId} onSelect={setSelectedAssetId} />
          </div>

          <div className="h-full min-h-0">
            <SecurityAssertionWorkflow selectedAssetId={selectedAssetId} />
          </div>

          <div className="flex min-h-0 flex-col gap-3">
            <CompliancePosturePanel />
            <PendingSignOffsPanel />
          </div>
        </main>
      </div>
    </div>
  );
}
