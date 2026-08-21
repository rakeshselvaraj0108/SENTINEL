import type { AuditTrailNode, DwsSeal, SignerIdentity, TestCaseGroup } from "./evidence-types";

// Real data, synced from backend/workdir/snapshot.json via gen_frontend_data.py.

export const evidenceFindingId = "SENTINEL-F-GHSA-8cf7-32gw-wr33";
export const evidenceCve = "GHSA-8cf7-32gw-wr33";
export const evidenceSummary =
  "Algorithm confusion in jsonwebtoken: jwt.verify() accepted a token forged with HS256 and signed using the app's own RSA public key as the HMAC secret, because no `algorithms` restriction was enforced (GHSA-8cf7-32gw-wr33).";

export const reachabilityChecks = [
  "Reachability path confirmed: jsonwebtoken imported directly in lib/insecurity.ts, routes/authenticatedUsers.ts, routes/verify.ts",
  "Vulnerable call site: jwt.verify(token, publicKey, callback) in updateAuthenticatedUsers() — lib/insecurity.ts:189, reached on every authenticated request",
];

export const sandboxVerificationChecks = [
  { id: "sandbox-76917b859255", note: "confirmed exploitable pre-patch on master \u2014 jsonwebtoken@0.4.0 accepted a forged HS256 token signed with the RSA public key as the HMAC secret (135780ms)" },
  { id: "sandbox-fac1cd307245", note: "confirmed resolved post-patch on the fix branch \u2014 jsonwebtoken@^9.0.0 rejected the same forged token with 'invalid algorithm' (101359ms)" },
];

export const commitInfo = {
  file: "lib/insecurity.ts",
  commitHash: "55e6cf35be0405f8be23247eac5ef9f64e714a5c",
};

export const evidenceDiff = [
  { kind: "removed" as const, text: "export const isAuthorized = () => expressJwt(({ secret: publicKey }) as any)" },
  { kind: "added" as const, text: "export const isAuthorized = () => expressJwt({ secret: publicKey, algorithms: ['RS256'] })" },
  { kind: "removed" as const, text: "jwt.verify(token, publicKey, (err: Error | null, decoded: any) => {" },
  { kind: "added" as const, text: "jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err: Error | null, decoded: any) => {" },
  { kind: "removed" as const, text: "\"jsonwebtoken\": \"0.4.0\"," },
  { kind: "added" as const, text: "\"jsonwebtoken\": \"^9.0.0\"," },
];

export const testGroups: TestCaseGroup[] = [
  {
    id: "generated-regression",
    label: "Patch Forge generated tests",
    passed: 1,
    total: 1,
    tests: [
      "insecurity > updateAuthenticatedUsers > should reject HS256 token signed with RSA public key when algorithms are restricted",
    ],
  },
];

export const auditTrail: AuditTrailNode[] = [
  { id: "hunter", actor: "hunter", action: "ingestion verified", detail: "Detected GHSA-8cf7-32gw-wr33 in jsonwebtoken@<=8.5.1 (severity: critical)", timestamp: "2026-08-21T03:55:48.475847+00:00", highlightTarget: "summary" },
  { id: "analyst", actor: "analyst", action: "reachability confirmed", detail: "Direct imports confirmed in lib/insecurity.ts, routes/authenticatedUsers.ts, routes/verify.ts", timestamp: "2026-08-21T03:55:48.476850+00:00", highlightTarget: "reachability" },
  { id: "verifier", actor: "verifier", action: "sandbox scenario: exploit confirmed then resolved", detail: "Pre-patch: forged HS256 token ACCEPTED on master (sandbox-76917b859255, 135780ms)). Post-patch: same token REJECTED on the fix branch (sandbox-fac1cd307245, 101359ms)).", timestamp: "2026-08-21T03:55:48.476850+00:00", highlightTarget: "reverify" },
  { id: "patch-forge", actor: "patch-forge", action: "remediation generated", detail: "algorithms: ['RS256'] restriction added + jsonwebtoken bumped to ^9.0.0 in package.json", timestamp: "2026-08-21T03:55:48.477852+00:00", highlightTarget: "evidence-pack" },
];

export const signers: SignerIdentity[] = [
  {
    id: "patch-forge-agent",
    name: "patch-forge-agent",
    kind: "service",
    role: "service identity",
    signatureHash: "sha256:136c6433af91e4e05d927a1ce900ab1ff81a2804d90c38ba91533a47d61619ce",
  },
];

export const dwsSeal: DwsSeal = {
  documentId: "sentinel:evidence:SENTINEL-F-GHSA-8cf7-32gw-wr33",
  verificationId: "sha256:136c6433af91e4e05d927a1ce900ab1ff81a2804d90c38ba91533a47d61619ce",
  sealedAt: "2026-08-21T03:55:48.477852+00:00",
};
