import type { AssetInstance, AssetScanState, AssetService, LogLine, ScanStage, SignOffTask } from "./verification-lab-types";

export const assetServices: AssetService[] = [
  { id: "backend-api", name: "Backend API Service" },
  { id: "frontend-web", name: "Frontend Web Application" },
  { id: "database-cluster", name: "Database Cluster" },
  { id: "auth-service", name: "Auth Service" },
  { id: "payment-gateway", name: "Payment Gateway Service" },
  { id: "notification-worker", name: "Notification Worker" },
  { id: "search-indexer", name: "Search Indexer" },
  { id: "media-cdn-edge", name: "Media CDN Edge" },
];

export const assetInstances: AssetInstance[] = [
  { id: "backend-api-2.8.1", serviceId: "backend-api", version: "2.8.1", compliance: "outdated", checked: true },
  { id: "backend-api-2.8.2", serviceId: "backend-api", version: "2.8.2", compliance: "compliant", checked: true },
  { id: "backend-api-2.7.9", serviceId: "backend-api", version: "2.7.9", compliance: "outdated", checked: true },

  { id: "frontend-web-2.3.3", serviceId: "frontend-web", version: "2.3.3", compliance: "outdated", checked: true },
  { id: "frontend-web-2.3.1a", serviceId: "frontend-web", version: "2.3.1", compliance: "compliant", checked: true },
  { id: "frontend-web-2.3.1b", serviceId: "frontend-web", version: "2.3.1", compliance: "outdated", checked: true },

  { id: "database-cluster-2.2.1", serviceId: "database-cluster", version: "2.2.1", compliance: "compliant", checked: true },
  { id: "database-cluster-2.3.1a", serviceId: "database-cluster", version: "2.3.1", compliance: "compliant", checked: true },
  { id: "database-cluster-2.3.1b", serviceId: "database-cluster", version: "2.3.1", compliance: "outdated", checked: true },
  { id: "database-cluster-2.3.0", serviceId: "database-cluster", version: "2.3.0", compliance: "outdated", checked: false },

  { id: "auth-service-4.1.0", serviceId: "auth-service", version: "4.1.0", compliance: "outdated", checked: true },
  { id: "auth-service-4.1.1", serviceId: "auth-service", version: "4.1.1", compliance: "compliant", checked: true },

  { id: "payment-gateway-1.9.4", serviceId: "payment-gateway", version: "1.9.4", compliance: "compliant", checked: true },
  { id: "payment-gateway-1.9.2", serviceId: "payment-gateway", version: "1.9.2", compliance: "outdated", checked: true },

  { id: "notification-worker-3.0.2", serviceId: "notification-worker", version: "3.0.2", compliance: "compliant", checked: true },
  { id: "notification-worker-3.0.1", serviceId: "notification-worker", version: "3.0.1", compliance: "compliant", checked: false },

  { id: "search-indexer-1.4.0", serviceId: "search-indexer", version: "1.4.0", compliance: "compliant", checked: true },
  { id: "search-indexer-1.3.6", serviceId: "search-indexer", version: "1.3.6", compliance: "outdated", checked: true },

  { id: "media-cdn-edge-5.2.0", serviceId: "media-cdn-edge", version: "5.2.0", compliance: "compliant", checked: true },
  { id: "media-cdn-edge-5.1.8", serviceId: "media-cdn-edge", version: "5.1.8", compliance: "compliant", checked: true },
];

export const defaultSelectedAssetId = "database-cluster-2.3.1b";

const stageLabel: Record<ScanStage["id"], string> = {
  static: "Static code scan",
  dependency: "Dependency audit",
  container: "Container image scan",
  dynamic: "Dynamic fuzzing",
};

function stage(id: ScanStage["id"], status: ScanStage["status"], extra: Partial<ScanStage> = {}): ScanStage {
  return { id, label: stageLabel[id], status, ...extra };
}

// Per-asset scan state. Assets not listed here get a default all-compliant scan state generated on read.
export const assetScanStates: Record<string, AssetScanState> = {
  "backend-api-2.8.1": {
    assetId: "backend-api-2.8.1",
    elapsedSeconds: 214,
    stages: [
      stage("static", "complete"),
      stage("dependency", "complete"),
      stage("container", "complete"),
      stage("dynamic", "failed", {
        failureReason: "SQL injection payload accepted at /api/checkout (CVE-2026-1147)",
        failureFindingId: "F-1042",
      }),
    ],
  },
  "database-cluster-2.3.1b": {
    assetId: "database-cluster-2.3.1b",
    elapsedSeconds: 96,
    stages: [
      stage("static", "complete"),
      stage("dependency", "complete"),
      stage("container", "running", { progressPct: 64 }),
      stage("dynamic", "pending"),
    ],
  },
  "frontend-web-2.3.3": {
    assetId: "frontend-web-2.3.3",
    elapsedSeconds: 301,
    stages: [
      stage("static", "complete"),
      stage("dependency", "failed", {
        failureReason: "react-router-dom@6.4.1 has a known open-redirect vulnerability (CVE-2026-1174)",
        failureFindingId: "F-1074",
      }),
      stage("container", "complete"),
      stage("dynamic", "complete"),
    ],
  },
  "search-indexer-1.3.6": {
    assetId: "search-indexer-1.3.6",
    elapsedSeconds: 58,
    stages: [
      stage("static", "running", { progressPct: 32 }),
      stage("dependency", "pending"),
      stage("container", "pending"),
      stage("dynamic", "pending"),
    ],
  },
};

export function scanStateFor(assetId: string): AssetScanState {
  return (
    assetScanStates[assetId] ?? {
      assetId,
      elapsedSeconds: 143,
      stages: [
        stage("static", "complete"),
        stage("dependency", "complete"),
        stage("container", "complete"),
        stage("dynamic", "complete"),
      ],
    }
  );
}

const streamingLogPool: Partial<Record<string, string[]>> = {
  "database-cluster-2.3.1b:container": [
    "pulling image sha256:9e2b1f4a...c6b3 (7 layers)",
    "layer 3/7 scanned — 0 critical CVEs",
    "layer 5/7 scanned — 1 medium (openssl 3.0.11, patch available)",
    "layer 7/7 scanned — base image verified",
  ],
  "search-indexer-1.3.6:static": [
    "scanning 4,812 files across search_indexer/...",
    "1,204/4,812 files analyzed",
    "2,890/4,812 files analyzed — 0 high severity findings so far",
  ],
};

export function streamingLogFor(assetId: string, stageId: string): string[] | null {
  return streamingLogPool[`${assetId}:${stageId}`] ?? null;
}

export const staticLogLines: Record<string, LogLine[]> = {
  "backend-api-2.8.1": [
    { stageId: "static", level: "info", text: "scanning 2,140 files across checkout_service/..." },
    { stageId: "static", level: "info", text: "0 high severity findings — static scan complete" },
    { stageId: "dependency", level: "info", text: "resolving dependency graph (318 packages)..." },
    { stageId: "dependency", level: "info", text: "0 packages flagged — dependency audit complete" },
    { stageId: "container", level: "info", text: "pulling image sha256:4c1a9e2b...d081 (6 layers)" },
    { stageId: "container", level: "info", text: "0 critical CVEs in base image — container scan complete" },
    { stageId: "dynamic", level: "info", text: "sending 4,096 mutated requests to /api/checkout..." },
    { stageId: "dynamic", level: "warn", text: "anomalous 500 response at payload #1187" },
    { stageId: "dynamic", level: "assert", text: "assert sanitized(user_id) → FAILED" },
    { stageId: "dynamic", level: "error", text: "dynamic fuzzing FAILED — SQLi payload accepted, see F-1042" },
  ],
  "frontend-web-2.3.3": [
    { stageId: "static", level: "info", text: "scanning 3,402 files across frontend_web/..." },
    { stageId: "static", level: "info", text: "0 high severity findings — static scan complete" },
    { stageId: "dependency", level: "info", text: "resolving dependency graph (642 packages)..." },
    { stageId: "dependency", level: "warn", text: "react-router-dom@6.4.1 flagged — known open-redirect (CVE-2026-1174)" },
    { stageId: "dependency", level: "error", text: "dependency audit FAILED — 1 package blocked" },
    { stageId: "container", level: "info", text: "pulling image sha256:7a3f0c1d...9e44 (5 layers)" },
    { stageId: "container", level: "info", text: "0 critical CVEs in base image — container scan complete" },
    { stageId: "dynamic", level: "info", text: "0 anomalous responses across 2,048 fuzz requests — dynamic fuzzing complete" },
  ],
};

export const signOffTasks: SignOffTask[] = [
  { id: "so-1", findingId: "F-1042", label: "fix verified by Patch Forge", agent: "Patch Forge", checked: false },
  { id: "so-2", findingId: "F-1074", label: "dependency patch pending re-scan", agent: "Analyst", checked: false },
  { id: "so-3", findingId: "F-1163", label: "secret rotation verified by Verifier", agent: "Verifier", checked: false },
];
