import { sha256Hex } from "./sha256";
import type { LedgerAgent, LedgerEntry, LedgerEntryInput, ReviewTask, VaultDocument } from "./ledger-types";

interface FindingTemplate {
  id: string;
  cve: string;
  title: string;
  sourceScan: string;
  layers: [string, string];
  startDate: string; // ISO date, entries generated a few hours apart from here
}

const findingTemplates: FindingTemplate[] = [
  {
    id: "F-1042",
    cve: "CVE-2026-1147",
    title: "SQLi — /api/checkout",
    sourceScan: "SCA dependency manifest",
    layers: ["parameterized query (C++)", "WAF rule (Terraform)"],
    startDate: "2026-08-19T14:02:11Z",
  },
  {
    id: "F-1051",
    cve: "CVE-2026-1151",
    title: "Outdated TLS cipher suite — /api/webhook",
    sourceScan: "TLS configuration audit",
    layers: ["cipher suite allowlist (nginx.conf)", "TLS policy (Terraform)"],
    startDate: "2026-08-17T09:14:02Z",
  },
  {
    id: "F-1058",
    cve: "CVE-2026-1158",
    title: "Verbose error stack trace — /api/orders",
    sourceScan: "DAST crawl",
    layers: ["generic error handler (Python)", "error sanitization middleware"],
    startDate: "2026-08-15T11:41:53Z",
  },
  {
    id: "F-1063",
    cve: "CVE-2026-1163",
    title: "Hardcoded API key — billing_worker.py",
    sourceScan: "secret scan",
    layers: ["Vault-backed secret injection (Python)", "IAM policy scope-down (Terraform)"],
    startDate: "2026-08-13T08:05:44Z",
  },
  {
    id: "F-1069",
    cve: "CVE-2026-1169",
    title: "Insecure deserialization — /api/import",
    sourceScan: "SAST scan",
    layers: ["schema-validated deserializer (Python)", "input size limit (nginx.conf)"],
    startDate: "2026-08-11T16:22:19Z",
  },
  {
    id: "F-1074",
    cve: "CVE-2026-1174",
    title: "Reflected XSS — /search query param",
    sourceScan: "DAST crawl",
    layers: ["output encoding (React)", "CSP header (Terraform)"],
    startDate: "2026-08-09T13:37:08Z",
  },
  {
    id: "F-1081",
    cve: "CVE-2026-1181",
    title: "SSRF via webhook URL callback — /api/integrations",
    sourceScan: "SAST scan",
    layers: ["allowlist resolver (Go)", "egress firewall rule (Terraform)"],
    startDate: "2026-08-07T10:51:36Z",
  },
  {
    id: "F-1088",
    cve: "CVE-2026-1188",
    title: "Missing rate limit — /api/auth/login",
    sourceScan: "DAST crawl",
    layers: ["token-bucket limiter (Go)", "WAF rate rule (Terraform)"],
    startDate: "2026-08-05T07:28:51Z",
  },
  {
    id: "F-1093",
    cve: "CVE-2026-1193",
    title: "Weak JWT signing algorithm — auth_service",
    sourceScan: "SCA dependency manifest",
    layers: ["RS256 migration (Go)", "key rotation policy (Terraform)"],
    startDate: "2026-08-03T15:09:27Z",
  },
  {
    id: "F-1099",
    cve: "CVE-2026-1199",
    title: "Path traversal — /api/files/download",
    sourceScan: "SAST scan",
    layers: ["canonical path guard (Python)", "chroot storage mount (Terraform)"],
    startDate: "2026-08-01T12:44:15Z",
  },
  {
    id: "F-1104",
    cve: "CVE-2026-1204",
    title: "Permissive CORS policy — /api/public",
    sourceScan: "DAST crawl",
    layers: ["origin allowlist (Go)", "CORS policy (Terraform)"],
    startDate: "2026-07-30T09:16:42Z",
  },
  {
    id: "F-1110",
    cve: "CVE-2026-1210",
    title: "Exposed debug endpoint — /internal/debug",
    sourceScan: "external attack-surface scan",
    layers: ["route removal (Go)", "network policy (Terraform)"],
    startDate: "2026-07-28T06:33:59Z",
  },
];

function minutesLater(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

function buildFindingEntries(f: FindingTemplate): LedgerEntryInput[] {
  return [
    {
      findingId: f.id,
      title: f.title,
      agent: "hunter",
      action: "ingestion verified",
      detail: `${f.cve} flagged from ${f.sourceScan}`,
      timestamp: minutesLater(f.startDate, 0),
    },
    {
      findingId: f.id,
      title: f.title,
      agent: "analyst",
      action: "reachability confirmed",
      detail: "reachability confirmed via static call-graph analysis",
      timestamp: minutesLater(f.startDate, 4),
    },
    {
      findingId: f.id,
      title: f.title,
      agent: "patch-forge",
      action: "remediation generated",
      detail: `${f.layers[0]} proposed`,
      timestamp: minutesLater(f.startDate, 9),
    },
    {
      findingId: f.id,
      title: f.title,
      agent: "patch-forge",
      action: "remediation generated",
      detail: `${f.layers[1]} proposed`,
      timestamp: minutesLater(f.startDate, 10),
    },
    {
      findingId: f.id,
      title: f.title,
      agent: "verifier",
      action: "sandbox test passed",
      detail: "regression suite — all green",
      timestamp: minutesLater(f.startDate, 17),
    },
    {
      findingId: f.id,
      title: f.title,
      agent: "verifier",
      action: "sandbox test passed",
      detail: "integration suite — all green",
      timestamp: minutesLater(f.startDate, 18),
    },
    {
      findingId: f.id,
      title: f.title,
      agent: "verifier",
      action: "sandbox test passed",
      detail: "targeted payload regression — all green",
      timestamp: minutesLater(f.startDate, 19),
    },
    {
      findingId: f.id,
      title: f.title,
      agent: "human",
      action: "final approval",
      detail: "reviewed evidence pack and approved",
      timestamp: minutesLater(f.startDate, 26),
    },
  ];
}

const GENESIS_HASH = sha256Hex("SENTINEL:genesis");

function buildChain(inputs: LedgerEntryInput[]): LedgerEntry[] {
  let prevHash = GENESIS_HASH;
  return inputs.map((input, i) => {
    const payload = `${input.findingId}|${input.agent}|${input.action}|${input.detail}|${input.timestamp}`;
    const hash = sha256Hex(prevHash + payload);
    const entry: LedgerEntry = { ...input, seq: i, hash, prevHash };
    prevHash = hash;
    return entry;
  });
}

// Entries are chained in chronological order across all findings, oldest first.
const allInputs = findingTemplates
  .flatMap(buildFindingEntries)
  .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

export const ledgerEntries: LedgerEntry[] = buildChain(allInputs);

export const ledgerAgents: LedgerAgent[] = ["hunter", "analyst", "patch-forge", "verifier", "human"];

export const findingsIndex = findingTemplates.map((f) => ({ id: f.id, title: f.title }));

export const sealedFindingIds = new Set(["F-1042"]);

export const vaultDocuments: VaultDocument[] = [
  {
    id: "ev-pkg-f1042",
    filename: "EV-PACKAGE-CVE-2026-1147-verified.pdf",
    hash: sha256Hex("EV-PACKAGE-CVE-2026-1147-verified"),
    verificationId: "DWS-VRF-2026-081947-F1042",
    sealedAt: "2026-08-19T14:06:52Z",
    findingId: "F-1042",
  },
  {
    id: "audit-trail-f1042",
    filename: "AUDIT-TRAIL-F-1042-v1.1.log",
    hash: sha256Hex("AUDIT-TRAIL-F-1042-v1.1"),
    verificationId: "DWS-VRF-2026-081947-F1042-LOG",
    sealedAt: "2026-08-19T14:06:52Z",
    findingId: "F-1042",
  },
  {
    id: "ev-pkg-f1051",
    filename: "EV-PACKAGE-CVE-2026-1151-verified.pdf",
    hash: sha256Hex("EV-PACKAGE-CVE-2026-1151-verified"),
    verificationId: "DWS-VRF-2026-081741-F1051",
    sealedAt: "2026-08-17T09:41:10Z",
    findingId: "F-1051",
  },
  {
    id: "audit-trail-f1058",
    filename: "AUDIT-TRAIL-F-1058-v1.0.log",
    hash: sha256Hex("AUDIT-TRAIL-F-1058-v1.0"),
    verificationId: "DWS-VRF-2026-081512-F1058-LOG",
    sealedAt: "2026-08-15T12:09:31Z",
    findingId: "F-1058",
  },
  {
    id: "fleet-monthly-digest",
    filename: "SENTINEL-FLEET-DIGEST-2026-08.pdf",
    hash: sha256Hex("SENTINEL-FLEET-DIGEST-2026-08"),
    verificationId: "DWS-VRF-2026-081923-DIGEST",
    sealedAt: "2026-08-19T23:59:00Z",
    findingId: null,
  },
];

export const reviewTasks: ReviewTask[] = [
  {
    id: "review-f1069",
    label: "EV-PACKAGE-CVE-2026-1169-verified (sealed)",
    sealed: true,
    submittedAt: "2026-08-11T17:05:00Z",
  },
  {
    id: "review-f1074",
    label: "EV-PACKAGE-CVE-2026-1174-verified (sealed)",
    sealed: true,
    submittedAt: "2026-08-09T14:02:00Z",
  },
  {
    id: "review-f1081",
    label: "AUDIT-TRAIL-F-1081-v1.0.log (sealed)",
    sealed: true,
    submittedAt: "2026-08-07T11:20:00Z",
  },
];
