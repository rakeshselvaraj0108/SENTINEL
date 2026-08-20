import { ProgressPanel } from "./ProgressPanel";
import { LogPanel } from "./LogPanel";
import { assetInstances, assetServices, scanStateFor } from "@/lib/verification-lab-data";

function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export function SecurityAssertionWorkflow({ selectedAssetId }: { selectedAssetId: string }) {
  const instance = assetInstances.find((a) => a.id === selectedAssetId);
  const serviceName = assetServices.find((s) => s.id === instance?.serviceId)?.name;
  const scanState = scanStateFor(selectedAssetId);
  const activeStage =
    scanState.stages.find((s) => s.status === "running") ??
    scanState.stages.find((s) => s.status === "failed") ??
    scanState.stages[scanState.stages.length - 1];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 items-baseline gap-3 border-b border-border-soft px-1 pb-2">
        <h2 className="text-[13px] font-medium text-text">
          {instance ? `${serviceName ?? instance.serviceId} ${instance.version}` : selectedAssetId}
        </h2>
        <span className="font-data text-[10px] uppercase tracking-[0.06em] text-amber">
          {formatElapsed(scanState.elapsedSeconds)} autonomous scan time
        </span>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
        <ProgressPanel stages={scanState.stages} />
        <LogPanel key={`${selectedAssetId}:${activeStage.id}`} assetId={selectedAssetId} stage={activeStage} />
      </div>
    </div>
  );
}
