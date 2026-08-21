import type { AssetInstance, AssetScanState, AssetService, LogLine, ScanStage, SignOffTask } from "./verification-lab-types";

// Real data, synced from backend/workdir/snapshot.json via gen_frontend_data.py.
// "Assets" here are the real npm packages Hunter's actual npm audit scan
// flagged in OWASP Juice Shop - each real GHSA finding modeled as a package
// instance, with compliance derived from its real severity.

export const assetServices: AssetService[] = [
  { id: "SENTINEL-F-GHSA-v75r-vx73-82pj", name: "@cyclonedx/cyclonedx-npm" },
  { id: "SENTINEL-F-GHSA-vpq2-c234-7xj6", name: "@tootallnate/once" },
  { id: "SENTINEL-F-GHSA-rvg8-pwq2-xj7q", name: "base64url" },
  { id: "SENTINEL-F-GHSA-pxg6-pf52-xh8x", name: "cookie" },
  { id: "SENTINEL-F-GHSA-xwcq-pm8m-c4vf", name: "crypto-js" },
  { id: "SENTINEL-F-GHSA-mp2f-45pm-3cg9", name: "decompress" },
  { id: "SENTINEL-F-GHSA-r635-g3xr-vw7x", name: "engine.io" },
  { id: "SENTINEL-F-GHSA-6g6m-m6h5-w9gf", name: "express-jwt" },
  { id: "SENTINEL-F-GHSA-5v7r-6r5c-r473", name: "file-type" },
  { id: "SENTINEL-F-GHSA-pfrx-2q88-qq97", name: "got" },
  { id: "SENTINEL-F-GHSA-rc47-6667-2j5j", name: "http-cache-semantics" },
  { id: "SENTINEL-F-GHSA-8cf7-32gw-wr33", name: "jsonwebtoken" },
  { id: "SENTINEL-F-GHSA-gjcw-v447-2w7q", name: "jws" },
  { id: "SENTINEL-F-GHSA-jf85-cpcp-j695", name: "lodash" },
  { id: "SENTINEL-F-GHSA-5mrr-rgp6-x4gr", name: "marsdb" },
  { id: "SENTINEL-F-GHSA-7r86-cg39-jmmj", name: "minimatch" },
  { id: "SENTINEL-F-GHSA-446m-mv8f-q348", name: "moment" },
  { id: "SENTINEL-F-GHSA-8g4m-cjm2-96wq", name: "notevil" },
  { id: "SENTINEL-F-GHSA-6fx8-h7jm-663j", name: "parseuri" },
  { id: "SENTINEL-F-GHSA-cgfm-xwp7-2cvr", name: "sanitize-html" },
  { id: "SENTINEL-F-GHSA-25hc-qcg6-38wj", name: "socket.io" },
  { id: "SENTINEL-F-GHSA-2m8v-j782-fhvr", name: "socket.io-parser" },
  { id: "SENTINEL-F-GHSA-r6q2-hw4h-h46w", name: "tar" },
  { id: "SENTINEL-F-GHSA-w5hq-g745-h8pq", name: "uuid" },
  { id: "SENTINEL-F-GHSA-3h5v-q93c-6h6q", name: "ws" },
];

export const assetInstances: AssetInstance[] = [
  { id: "SENTINEL-F-GHSA-v75r-vx73-82pj@2.1.0 - 4.2.1", serviceId: "SENTINEL-F-GHSA-v75r-vx73-82pj", version: "2.1.0 - 4.2.1", compliance: "outdated", checked: true },
  { id: "SENTINEL-F-GHSA-vpq2-c234-7xj6@<2.0.1", serviceId: "SENTINEL-F-GHSA-vpq2-c234-7xj6", version: "<2.0.1", compliance: "compliant", checked: true },
  { id: "SENTINEL-F-GHSA-rvg8-pwq2-xj7q@<3.0.0", serviceId: "SENTINEL-F-GHSA-rvg8-pwq2-xj7q", version: "<3.0.0", compliance: "compliant", checked: true },
  { id: "SENTINEL-F-GHSA-pxg6-pf52-xh8x@<0.7.0", serviceId: "SENTINEL-F-GHSA-pxg6-pf52-xh8x", version: "<0.7.0", compliance: "compliant", checked: true },
  { id: "SENTINEL-F-GHSA-xwcq-pm8m-c4vf@<=4.1.1", serviceId: "SENTINEL-F-GHSA-xwcq-pm8m-c4vf", version: "<=4.1.1", compliance: "outdated", checked: true },
  { id: "SENTINEL-F-GHSA-mp2f-45pm-3cg9@*", serviceId: "SENTINEL-F-GHSA-mp2f-45pm-3cg9", version: "*", compliance: "outdated", checked: true },
  { id: "SENTINEL-F-GHSA-r635-g3xr-vw7x@0.7.8 - 0.7.9 || 1.8.0 - 6.6.6", serviceId: "SENTINEL-F-GHSA-r635-g3xr-vw7x", version: "0.7.8 - 0.7.9 || 1.8.0 - 6.6.6", compliance: "outdated", checked: true },
  { id: "SENTINEL-F-GHSA-6g6m-m6h5-w9gf@<=7.7.7", serviceId: "SENTINEL-F-GHSA-6g6m-m6h5-w9gf", version: "<=7.7.7", compliance: "outdated", checked: true },
  { id: "SENTINEL-F-GHSA-5v7r-6r5c-r473@13.0.0 - 21.3.0", serviceId: "SENTINEL-F-GHSA-5v7r-6r5c-r473", version: "13.0.0 - 21.3.0", compliance: "compliant", checked: true },
  { id: "SENTINEL-F-GHSA-pfrx-2q88-qq97@<=11.8.3", serviceId: "SENTINEL-F-GHSA-pfrx-2q88-qq97", version: "<=11.8.3", compliance: "outdated", checked: true },
  { id: "SENTINEL-F-GHSA-rc47-6667-2j5j@<4.1.1", serviceId: "SENTINEL-F-GHSA-rc47-6667-2j5j", version: "<4.1.1", compliance: "outdated", checked: true },
  { id: "SENTINEL-F-GHSA-8cf7-32gw-wr33@<=8.5.1", serviceId: "SENTINEL-F-GHSA-8cf7-32gw-wr33", version: "<=8.5.1", compliance: "outdated", checked: true },
  { id: "SENTINEL-F-GHSA-gjcw-v447-2w7q@<=3.2.2", serviceId: "SENTINEL-F-GHSA-gjcw-v447-2w7q", version: "<=3.2.2", compliance: "outdated", checked: true },
  { id: "SENTINEL-F-GHSA-jf85-cpcp-j695@<=4.17.23", serviceId: "SENTINEL-F-GHSA-jf85-cpcp-j695", version: "<=4.17.23", compliance: "outdated", checked: true },
  { id: "SENTINEL-F-GHSA-5mrr-rgp6-x4gr@*", serviceId: "SENTINEL-F-GHSA-5mrr-rgp6-x4gr", version: "*", compliance: "outdated", checked: true },
  { id: "SENTINEL-F-GHSA-7r86-cg39-jmmj@<=3.1.3", serviceId: "SENTINEL-F-GHSA-7r86-cg39-jmmj", version: "<=3.1.3", compliance: "outdated", checked: true },
  { id: "SENTINEL-F-GHSA-446m-mv8f-q348@<=2.29.1", serviceId: "SENTINEL-F-GHSA-446m-mv8f-q348", version: "<=2.29.1", compliance: "outdated", checked: true },
  { id: "SENTINEL-F-GHSA-8g4m-cjm2-96wq@*", serviceId: "SENTINEL-F-GHSA-8g4m-cjm2-96wq", version: "*", compliance: "compliant", checked: true },
  { id: "SENTINEL-F-GHSA-6fx8-h7jm-663j@<2.0.0", serviceId: "SENTINEL-F-GHSA-6fx8-h7jm-663j", version: "<2.0.0", compliance: "compliant", checked: true },
  { id: "SENTINEL-F-GHSA-cgfm-xwp7-2cvr@<=2.12.0", serviceId: "SENTINEL-F-GHSA-cgfm-xwp7-2cvr", version: "<=2.12.0", compliance: "outdated", checked: true },
  { id: "SENTINEL-F-GHSA-25hc-qcg6-38wj@3.0.0-rc1 - 4.6.1", serviceId: "SENTINEL-F-GHSA-25hc-qcg6-38wj", version: "3.0.0-rc1 - 4.6.1", compliance: "compliant", checked: true },
  { id: "SENTINEL-F-GHSA-2m8v-j782-fhvr@4.0.0 - 4.2.6", serviceId: "SENTINEL-F-GHSA-2m8v-j782-fhvr", version: "4.0.0 - 4.2.6", compliance: "outdated", checked: true },
  { id: "SENTINEL-F-GHSA-r6q2-hw4h-h46w@<=7.5.20", serviceId: "SENTINEL-F-GHSA-r6q2-hw4h-h46w", version: "<=7.5.20", compliance: "outdated", checked: true },
  { id: "SENTINEL-F-GHSA-w5hq-g745-h8pq@<11.1.1", serviceId: "SENTINEL-F-GHSA-w5hq-g745-h8pq", version: "<11.1.1", compliance: "compliant", checked: true },
  { id: "SENTINEL-F-GHSA-3h5v-q93c-6h6q@7.0.0 - 7.5.10", serviceId: "SENTINEL-F-GHSA-3h5v-q93c-6h6q", version: "7.0.0 - 7.5.10", compliance: "outdated", checked: true },
];

export const defaultSelectedAssetId = "SENTINEL-F-GHSA-8cf7-32gw-wr33@<=8.5.1";

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
  "SENTINEL-F-GHSA-8cf7-32gw-wr33@<=8.5.1": {
    assetId: "SENTINEL-F-GHSA-8cf7-32gw-wr33@<=8.5.1",
    elapsedSeconds: 237,
    stages: [
      stage("static", "complete"),
      stage("dependency", "complete"),
      stage("container", "complete"),
      stage("dynamic", "failed", {
        failureReason: "Algorithm confusion forgery accepted by jwt.verify (GHSA-8cf7-32gw-wr33)",
        failureFindingId: "SENTINEL-F-GHSA-8cf7-32gw-wr33",
      }),
    ],
  },
  "SENTINEL-F-GHSA-xwcq-pm8m-c4vf@<=4.1.1": {
    assetId: "SENTINEL-F-GHSA-xwcq-pm8m-c4vf@<=4.1.1",
    elapsedSeconds: 96,
    stages: [
      stage("static", "complete"),
      stage("dependency", "running", { progressPct: 64 }),
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

const streamingLogPool: Partial<Record<string, string[]>> = {};

export function streamingLogFor(assetId: string, stageId: string): string[] | null {
  return streamingLogPool[`${assetId}:${stageId}`] ?? null;
}

export const staticLogLines: Record<string, LogLine[]> = {
  "SENTINEL-F-GHSA-8cf7-32gw-wr33@<=8.5.1": [
    { stageId: "static", level: "info", text: "scanning application source for jsonwebtoken usage..." },
    { stageId: "static", level: "info", text: "direct imports found in lib/insecurity.ts, routes/authenticatedUsers.ts, routes/verify.ts" },
    { stageId: "dependency", level: "info", text: "npm audit — resolving dependency graph..." },
    { stageId: "dependency", level: "error", text: "GHSA-8cf7-32gw-wr33 flagged in jsonwebtoken@<=8.5.1 (severity: critical)" },
    { stageId: "container", level: "info", text: "container image scan — 0 critical CVEs in base image" },
    { stageId: "dynamic", level: "info", text: "forging HS256 token signed with the app's RSA public key as the HMAC secret..." },
    { stageId: "dynamic", level: "assert", text: "assert jwt.verify(forged, publicKey) -> REJECTED" },
    { stageId: "dynamic", level: "error", text: "dynamic fuzzing FAILED \u2014 forged token ACCEPTED, see SENTINEL-F-GHSA-8cf7-32gw-wr33" },
  ],
};

export const signOffTasks: SignOffTask[] = [
  { id: "so-1", findingId: "SENTINEL-F-GHSA-8cf7-32gw-wr33", label: "remediation for GHSA-8cf7-32gw-wr33", agent: "Patch Forge", checked: true },
  { id: "so-2", findingId: "SENTINEL-F-GHSA-xwcq-pm8m-c4vf", label: "remediation for GHSA-xwcq-pm8m-c4vf", agent: "Analyst", checked: false },
  { id: "so-3", findingId: "SENTINEL-F-GHSA-vpq2-c234-7xj6", label: "remediation for GHSA-vpq2-c234-7xj6", agent: "Verification Lab", checked: false },
];
