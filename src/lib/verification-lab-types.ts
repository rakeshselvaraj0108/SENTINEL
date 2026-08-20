export type Compliance = "compliant" | "outdated";

export interface AssetInstance {
  id: string;
  serviceId: string;
  version: string;
  compliance: Compliance;
  checked: boolean;
}

export interface AssetService {
  id: string;
  name: string;
}

export type ScanStageId = "static" | "dependency" | "container" | "dynamic";

export type ScanStatus = "pending" | "running" | "complete" | "failed";

export interface ScanStage {
  id: ScanStageId;
  label: string;
  status: ScanStatus;
  progressPct?: number;
  failureReason?: string;
  failureFindingId?: string;
}

export interface AssetScanState {
  assetId: string;
  elapsedSeconds: number;
  stages: ScanStage[];
}

export interface LogLine {
  stageId: ScanStageId;
  level: "info" | "warn" | "error" | "assert";
  text: string;
}

export interface SignOffTask {
  id: string;
  findingId: string;
  label: string;
  agent: string;
  checked: boolean;
}

export type FlatAssetRow =
  | { type: "service"; serviceId: string; name: string; instanceCount: number }
  | { type: "instance"; instance: AssetInstance; serviceName: string };
