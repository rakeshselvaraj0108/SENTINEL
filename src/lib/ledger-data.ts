import type { LedgerAgent, LedgerEntry, ReviewTask, VaultDocument } from "./ledger-types";

// Real data, synced from backend/workdir/snapshot.json via gen_frontend_data.py.
// Every entry below is a real SHA-256 hash-chained record of actual agent
// output (Hunter's real npm audit findings; the full real pipeline for
// SENTINEL-F-GHSA-8cf7-32gw-wr33 through Analyst, Verification Lab and Patch Forge).

export const ledgerEntries: LedgerEntry[] = [
  { seq: 0, findingId: "SENTINEL-F-GHSA-v75r-vx73-82pj", title: "@cyclonedx/cyclonedx-npm \u2014 GHSA-v75r-vx73-82pj", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-v75r-vx73-82pj in @cyclonedx/cyclonedx-npm@2.1.0 - 4.2.1 (severity: high) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:5b6d21b144cd60ec6d5bd54932b315f68f06f47485deed292be18fe4e86d063a", prevHash: "sha256:genesis" },
  { seq: 1, findingId: "SENTINEL-F-GHSA-vpq2-c234-7xj6", title: "@tootallnate/once \u2014 GHSA-vpq2-c234-7xj6", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-vpq2-c234-7xj6 in @tootallnate/once@<2.0.1 (severity: low) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:6309f41c147012bee79f7082ea62d3ff6d0146daa1bbb985e843e9f2fb241fcc", prevHash: "sha256:5b6d21b144cd60ec6d5bd54932b315f68f06f47485deed292be18fe4e86d063a" },
  { seq: 2, findingId: "SENTINEL-F-GHSA-rvg8-pwq2-xj7q", title: "base64url \u2014 GHSA-rvg8-pwq2-xj7q", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-rvg8-pwq2-xj7q in base64url@<3.0.0 (severity: medium) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:0fb05e543788ce1c28e9b4e20ea34c28efb5c37660a90cdecba2a8df8a003d03", prevHash: "sha256:6309f41c147012bee79f7082ea62d3ff6d0146daa1bbb985e843e9f2fb241fcc" },
  { seq: 3, findingId: "SENTINEL-F-GHSA-pxg6-pf52-xh8x", title: "cookie \u2014 GHSA-pxg6-pf52-xh8x", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-pxg6-pf52-xh8x in cookie@<0.7.0 (severity: low) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:1a487f88b2e958cd3c49f5d26d4243ff8c8ca77837011411b1d24aa20af2779a", prevHash: "sha256:0fb05e543788ce1c28e9b4e20ea34c28efb5c37660a90cdecba2a8df8a003d03" },
  { seq: 4, findingId: "SENTINEL-F-GHSA-xwcq-pm8m-c4vf", title: "crypto-js \u2014 GHSA-xwcq-pm8m-c4vf", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-xwcq-pm8m-c4vf in crypto-js@<=4.1.1 (severity: critical) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:e6fd1376fc71a08d0da749c66c4301e3f88b5f9b56ebf052aa698e211cda1470", prevHash: "sha256:1a487f88b2e958cd3c49f5d26d4243ff8c8ca77837011411b1d24aa20af2779a" },
  { seq: 5, findingId: "SENTINEL-F-GHSA-mp2f-45pm-3cg9", title: "decompress \u2014 GHSA-mp2f-45pm-3cg9", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-mp2f-45pm-3cg9 in decompress@* (severity: critical) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:210a23aefa387a3e4c95714617faaad805819bfcdaa2cb6c3eeec4f4c509d207", prevHash: "sha256:e6fd1376fc71a08d0da749c66c4301e3f88b5f9b56ebf052aa698e211cda1470" },
  { seq: 6, findingId: "SENTINEL-F-GHSA-r635-g3xr-vw7x", title: "engine.io \u2014 GHSA-r635-g3xr-vw7x", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-r635-g3xr-vw7x in engine.io@0.7.8 - 0.7.9 || 1.8.0 - 6.6.6 (severity: high) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:8c525eb001c3c2171b4bad880bbf75ba8aae758306a58a38bcbddb23c7678b5b", prevHash: "sha256:210a23aefa387a3e4c95714617faaad805819bfcdaa2cb6c3eeec4f4c509d207" },
  { seq: 7, findingId: "SENTINEL-F-GHSA-6g6m-m6h5-w9gf", title: "express-jwt \u2014 GHSA-6g6m-m6h5-w9gf", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-6g6m-m6h5-w9gf in express-jwt@<=7.7.7 (severity: high) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:d714984d6c58ef590b49dcfd6ee4ec94b1a330f3566aee8003b776c0cb010c0f", prevHash: "sha256:8c525eb001c3c2171b4bad880bbf75ba8aae758306a58a38bcbddb23c7678b5b" },
  { seq: 8, findingId: "SENTINEL-F-GHSA-5v7r-6r5c-r473", title: "file-type \u2014 GHSA-5v7r-6r5c-r473", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-5v7r-6r5c-r473 in file-type@13.0.0 - 21.3.0 (severity: medium) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:e368ba35b0461e6cc23f69af3ef949480d0e9cbaf28b2cbf2322fcdf24f5eed2", prevHash: "sha256:d714984d6c58ef590b49dcfd6ee4ec94b1a330f3566aee8003b776c0cb010c0f" },
  { seq: 9, findingId: "SENTINEL-F-GHSA-pfrx-2q88-qq97", title: "got \u2014 GHSA-pfrx-2q88-qq97", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-pfrx-2q88-qq97 in got@<=11.8.3 (severity: high) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:6e03049ce7bf5bd534faa9294cad0f619850fa9befa682467b100b49b0d3a5d2", prevHash: "sha256:e368ba35b0461e6cc23f69af3ef949480d0e9cbaf28b2cbf2322fcdf24f5eed2" },
  { seq: 10, findingId: "SENTINEL-F-GHSA-rc47-6667-2j5j", title: "http-cache-semantics \u2014 GHSA-rc47-6667-2j5j", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-rc47-6667-2j5j in http-cache-semantics@<4.1.1 (severity: high) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:fe9607803ffada9f19ca8d0408f55ee5fb79bb150390bf6aa80e40936dcaab60", prevHash: "sha256:6e03049ce7bf5bd534faa9294cad0f619850fa9befa682467b100b49b0d3a5d2" },
  { seq: 11, findingId: "SENTINEL-F-GHSA-gjcw-v447-2w7q", title: "jws \u2014 GHSA-gjcw-v447-2w7q", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-gjcw-v447-2w7q in jws@<=3.2.2 (severity: high) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:7614c3dd849487771aa8373f03e916a7896642cebe6aba927ce429a3dd7fe23d", prevHash: "sha256:fe9607803ffada9f19ca8d0408f55ee5fb79bb150390bf6aa80e40936dcaab60" },
  { seq: 12, findingId: "SENTINEL-F-GHSA-jf85-cpcp-j695", title: "lodash \u2014 GHSA-jf85-cpcp-j695", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-jf85-cpcp-j695 in lodash@<=4.17.23 (severity: critical) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:69bf61e324be22a537822eed2a1310fb2690ba6caaaa7e9ee639b99eb5ab1724", prevHash: "sha256:7614c3dd849487771aa8373f03e916a7896642cebe6aba927ce429a3dd7fe23d" },
  { seq: 13, findingId: "SENTINEL-F-GHSA-5mrr-rgp6-x4gr", title: "marsdb \u2014 GHSA-5mrr-rgp6-x4gr", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-5mrr-rgp6-x4gr in marsdb@* (severity: critical) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:0e384c983de753a347b370f437b881476732ad9b5fb0471cba6593a956ba8e71", prevHash: "sha256:69bf61e324be22a537822eed2a1310fb2690ba6caaaa7e9ee639b99eb5ab1724" },
  { seq: 14, findingId: "SENTINEL-F-GHSA-7r86-cg39-jmmj", title: "minimatch \u2014 GHSA-7r86-cg39-jmmj", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-7r86-cg39-jmmj in minimatch@<=3.1.3 (severity: high) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:3c23a6b2b7a9ef547f3acd43f9f4fcc6033316d91cce81cc4a85ed569f9022f5", prevHash: "sha256:0e384c983de753a347b370f437b881476732ad9b5fb0471cba6593a956ba8e71" },
  { seq: 15, findingId: "SENTINEL-F-GHSA-446m-mv8f-q348", title: "moment \u2014 GHSA-446m-mv8f-q348", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-446m-mv8f-q348 in moment@<=2.29.1 (severity: high) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:5aff0cb56d124cca9343999e7af1e5a96f7dc6b195f13341d6475b14ddbb336a", prevHash: "sha256:3c23a6b2b7a9ef547f3acd43f9f4fcc6033316d91cce81cc4a85ed569f9022f5" },
  { seq: 16, findingId: "SENTINEL-F-GHSA-8g4m-cjm2-96wq", title: "notevil \u2014 GHSA-8g4m-cjm2-96wq", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-8g4m-cjm2-96wq in notevil@* (severity: medium) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:22ed092000f990632c236ea157ec8c7d64c0450f205788245f2624bf401cc205", prevHash: "sha256:5aff0cb56d124cca9343999e7af1e5a96f7dc6b195f13341d6475b14ddbb336a" },
  { seq: 17, findingId: "SENTINEL-F-GHSA-6fx8-h7jm-663j", title: "parseuri \u2014 GHSA-6fx8-h7jm-663j", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-6fx8-h7jm-663j in parseuri@<2.0.0 (severity: medium) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:3ca3a3b7a21073f849e4a681e06bfc08c57a4ef8417fbc70046b4c1ad2cea876", prevHash: "sha256:22ed092000f990632c236ea157ec8c7d64c0450f205788245f2624bf401cc205" },
  { seq: 18, findingId: "SENTINEL-F-GHSA-cgfm-xwp7-2cvr", title: "sanitize-html \u2014 GHSA-cgfm-xwp7-2cvr", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-cgfm-xwp7-2cvr in sanitize-html@<=2.12.0 (severity: high) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:409e7846afb1a3ca067ebf15ba373080e1a55b1c61437e1ebbd5ab2e89123107", prevHash: "sha256:3ca3a3b7a21073f849e4a681e06bfc08c57a4ef8417fbc70046b4c1ad2cea876" },
  { seq: 19, findingId: "SENTINEL-F-GHSA-25hc-qcg6-38wj", title: "socket.io \u2014 GHSA-25hc-qcg6-38wj", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-25hc-qcg6-38wj in socket.io@3.0.0-rc1 - 4.6.1 (severity: medium) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:4b4d848ad13b3dc4056e3d1b808996032b5f84aeeb1b4c9c1d918aa7dfe8fe4c", prevHash: "sha256:409e7846afb1a3ca067ebf15ba373080e1a55b1c61437e1ebbd5ab2e89123107" },
  { seq: 20, findingId: "SENTINEL-F-GHSA-2m8v-j782-fhvr", title: "socket.io-parser \u2014 GHSA-2m8v-j782-fhvr", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-2m8v-j782-fhvr in socket.io-parser@4.0.0 - 4.2.6 (severity: high) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:34159c0a33e65ada35218b1f660dccd8388b62dec728560392f23536985f96bd", prevHash: "sha256:4b4d848ad13b3dc4056e3d1b808996032b5f84aeeb1b4c9c1d918aa7dfe8fe4c" },
  { seq: 21, findingId: "SENTINEL-F-GHSA-r6q2-hw4h-h46w", title: "tar \u2014 GHSA-r6q2-hw4h-h46w", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-r6q2-hw4h-h46w in tar@<=7.5.20 (severity: critical) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:22c91e7ae87ccf34e7ca167a7859308c4d077f1e03f0dff307dbcdea2b22369e", prevHash: "sha256:34159c0a33e65ada35218b1f660dccd8388b62dec728560392f23536985f96bd" },
  { seq: 22, findingId: "SENTINEL-F-GHSA-w5hq-g745-h8pq", title: "uuid \u2014 GHSA-w5hq-g745-h8pq", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-w5hq-g745-h8pq in uuid@<11.1.1 (severity: medium) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:2221955bfaebcef921f9fefade9e6e12dfae91461cbed89db4d75f986ee03afe", prevHash: "sha256:22c91e7ae87ccf34e7ca167a7859308c4d077f1e03f0dff307dbcdea2b22369e" },
  { seq: 23, findingId: "SENTINEL-F-GHSA-3h5v-q93c-6h6q", title: "ws \u2014 GHSA-3h5v-q93c-6h6q", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-3h5v-q93c-6h6q in ws@7.0.0 - 7.5.10 (severity: high) - queued for triage", timestamp: "2026-08-21T03:55:00.000000+00:00", hash: "sha256:d1a56a8f0a99e5aa0e2561c503913db888418f29a1c3c5eef2111aacc634af6e", prevHash: "sha256:2221955bfaebcef921f9fefade9e6e12dfae91461cbed89db4d75f986ee03afe" },
  { seq: 24, findingId: "SENTINEL-F-GHSA-8cf7-32gw-wr33", title: "jsonwebtoken \u2014 GHSA-8cf7-32gw-wr33", agent: "hunter", action: "ingestion verified", detail: "Detected GHSA-8cf7-32gw-wr33 in jsonwebtoken@<=8.5.1 (severity: critical)", timestamp: "2026-08-21T03:55:48.475847+00:00", hash: "sha256:9a1f0bfc01157fa7497cfb19608424e81eb35a6bf603522825b61b9f949e1331", prevHash: "sha256:d1a56a8f0a99e5aa0e2561c503913db888418f29a1c3c5eef2111aacc634af6e" },
  { seq: 25, findingId: "SENTINEL-F-GHSA-8cf7-32gw-wr33", title: "jsonwebtoken \u2014 GHSA-8cf7-32gw-wr33", agent: "analyst", action: "reachability confirmed", detail: "Relevance verdict: confirmed - The application directly imports 'jsonwebtoken' in multiple files, including 'lib/insecurity.ts', 'routes/authenticatedUsers.ts', and 'routes/verify.ts'. The vulnerability, GHSA-8cf7-32gw-wr33, concerns 'unrestricted key type' in 'jsonwebtoken'. Given the direct imports and the nature of the vulnerability related to key handling, it is highly plausible that the application's usage of the library exercises the vulnerable behavior, especially with 'import { decode } from \"jsonwebtoken\"' in a route handler.", timestamp: "2026-08-21T03:55:48.476850+00:00", hash: "sha256:514b9bae9b6ffa4f6bdae0226a971a501819a3b5049a7fdac23d9a5c71e117ed", prevHash: "sha256:9a1f0bfc01157fa7497cfb19608424e81eb35a6bf603522825b61b9f949e1331" },
  { seq: 26, findingId: "SENTINEL-F-GHSA-8cf7-32gw-wr33", title: "jsonwebtoken \u2014 GHSA-8cf7-32gw-wr33", agent: "verifier", action: "sandbox scenario executed", detail: "Scenario 'RS256->HS256 key-confusion forgery against jsonwebtoken@0.4.0 usage in master' -> CONFIRMED_EXPLOITABLE (sandbox sandbox-76917b859255, 135780ms)", timestamp: "2026-08-21T03:55:48.476850+00:00", hash: "sha256:069ffa042661c59217fd84d0aa61576ec210dee4cf0b6c05500473a1b156c6e7", prevHash: "sha256:514b9bae9b6ffa4f6bdae0226a971a501819a3b5049a7fdac23d9a5c71e117ed" },
  { seq: 27, findingId: "SENTINEL-F-GHSA-8cf7-32gw-wr33", title: "jsonwebtoken \u2014 GHSA-8cf7-32gw-wr33", agent: "verifier", action: "sandbox scenario executed", detail: "Scenario 'RS256->HS256 key-confusion forgery against jsonwebtoken@^9.0.0 usage in sentinel/fix-ghsa-8cf7-32gw-wr33' -> RESOLVED (sandbox sandbox-fac1cd307245, 101359ms)", timestamp: "2026-08-21T03:55:48.476850+00:00", hash: "sha256:39004ea0b27566f7fb4f1c3b8028b27e7e676557bbca45dc0ff9e3dc6359f202", prevHash: "sha256:069ffa042661c59217fd84d0aa61576ec210dee4cf0b6c05500473a1b156c6e7" },
  { seq: 28, findingId: "SENTINEL-F-GHSA-8cf7-32gw-wr33", title: "jsonwebtoken \u2014 GHSA-8cf7-32gw-wr33", agent: "patch-forge", action: "remediation generated", detail: "Generated fix on sentinel/fix-ghsa-8cf7-32gw-wr33 touching ['lib/insecurity.ts', 'package.json']: The jsonwebtoken library prior to version 8.5.1 is vulnerable to unrestricted key type usage (GHSA-8cf7-32gw-wr33). This allows an attacker to forge JWTs by changing the algorithm in the header (e.g., to HS256) and signing them with the public key, which jsonwebtoken.verify would then incorrectly accept if no explicit algorithms are specified. This fix explicitly restricts the accepted algorithm to RS256 for all jsonwebtoken.verify and express-jwt calls, matching the algorithm used for signing tokens with insecurity.authorize. Dynamic Verification Lab testing then proved this code-only fix insufficient against the actually pinned jsonwebtoken@0.4.0, which ignores the `algorithms` option entirely - so this revision additionally bumps jsonwebtoken to ^9.0.0 in package.json, the release confirmed by direct sandbox testing to enforce algorithm restriction by key type even without explicit options.", timestamp: "2026-08-21T03:55:48.477852+00:00", hash: "sha256:87e65b2ccf67bc843eb3e89f99989d829c97bb6d57be1b646c32b0895d234d2c", prevHash: "sha256:39004ea0b27566f7fb4f1c3b8028b27e7e676557bbca45dc0ff9e3dc6359f202" },
];

/** Same payload format used to build the base chain - reused by runtime appends (e.g. the Deployment Gate). */
export function ledgerEntryPayload(input: { findingId: string; agent: string; action: string; detail: string; timestamp: string }): string {
  return `${input.findingId}|${input.agent}|${input.action}|${input.detail}|${input.timestamp}`;
}

export const ledgerAgents: LedgerAgent[] = ["hunter", "analyst", "patch-forge", "verifier", "human"];

export const findingsIndex = [
  {
    "id": "SENTINEL-F-GHSA-v75r-vx73-82pj",
    "title": "@cyclonedx/cyclonedx-npm \u2014 GHSA-v75r-vx73-82pj"
  },
  {
    "id": "SENTINEL-F-GHSA-vpq2-c234-7xj6",
    "title": "@tootallnate/once \u2014 GHSA-vpq2-c234-7xj6"
  },
  {
    "id": "SENTINEL-F-GHSA-rvg8-pwq2-xj7q",
    "title": "base64url \u2014 GHSA-rvg8-pwq2-xj7q"
  },
  {
    "id": "SENTINEL-F-GHSA-pxg6-pf52-xh8x",
    "title": "cookie \u2014 GHSA-pxg6-pf52-xh8x"
  },
  {
    "id": "SENTINEL-F-GHSA-xwcq-pm8m-c4vf",
    "title": "crypto-js \u2014 GHSA-xwcq-pm8m-c4vf"
  },
  {
    "id": "SENTINEL-F-GHSA-mp2f-45pm-3cg9",
    "title": "decompress \u2014 GHSA-mp2f-45pm-3cg9"
  },
  {
    "id": "SENTINEL-F-GHSA-r635-g3xr-vw7x",
    "title": "engine.io \u2014 GHSA-r635-g3xr-vw7x"
  },
  {
    "id": "SENTINEL-F-GHSA-6g6m-m6h5-w9gf",
    "title": "express-jwt \u2014 GHSA-6g6m-m6h5-w9gf"
  },
  {
    "id": "SENTINEL-F-GHSA-5v7r-6r5c-r473",
    "title": "file-type \u2014 GHSA-5v7r-6r5c-r473"
  },
  {
    "id": "SENTINEL-F-GHSA-pfrx-2q88-qq97",
    "title": "got \u2014 GHSA-pfrx-2q88-qq97"
  },
  {
    "id": "SENTINEL-F-GHSA-rc47-6667-2j5j",
    "title": "http-cache-semantics \u2014 GHSA-rc47-6667-2j5j"
  },
  {
    "id": "SENTINEL-F-GHSA-8cf7-32gw-wr33",
    "title": "jsonwebtoken \u2014 GHSA-8cf7-32gw-wr33"
  },
  {
    "id": "SENTINEL-F-GHSA-gjcw-v447-2w7q",
    "title": "jws \u2014 GHSA-gjcw-v447-2w7q"
  },
  {
    "id": "SENTINEL-F-GHSA-jf85-cpcp-j695",
    "title": "lodash \u2014 GHSA-jf85-cpcp-j695"
  },
  {
    "id": "SENTINEL-F-GHSA-5mrr-rgp6-x4gr",
    "title": "marsdb \u2014 GHSA-5mrr-rgp6-x4gr"
  },
  {
    "id": "SENTINEL-F-GHSA-7r86-cg39-jmmj",
    "title": "minimatch \u2014 GHSA-7r86-cg39-jmmj"
  },
  {
    "id": "SENTINEL-F-GHSA-446m-mv8f-q348",
    "title": "moment \u2014 GHSA-446m-mv8f-q348"
  },
  {
    "id": "SENTINEL-F-GHSA-8g4m-cjm2-96wq",
    "title": "notevil \u2014 GHSA-8g4m-cjm2-96wq"
  },
  {
    "id": "SENTINEL-F-GHSA-6fx8-h7jm-663j",
    "title": "parseuri \u2014 GHSA-6fx8-h7jm-663j"
  },
  {
    "id": "SENTINEL-F-GHSA-cgfm-xwp7-2cvr",
    "title": "sanitize-html \u2014 GHSA-cgfm-xwp7-2cvr"
  },
  {
    "id": "SENTINEL-F-GHSA-25hc-qcg6-38wj",
    "title": "socket.io \u2014 GHSA-25hc-qcg6-38wj"
  },
  {
    "id": "SENTINEL-F-GHSA-2m8v-j782-fhvr",
    "title": "socket.io-parser \u2014 GHSA-2m8v-j782-fhvr"
  },
  {
    "id": "SENTINEL-F-GHSA-r6q2-hw4h-h46w",
    "title": "tar \u2014 GHSA-r6q2-hw4h-h46w"
  },
  {
    "id": "SENTINEL-F-GHSA-w5hq-g745-h8pq",
    "title": "uuid \u2014 GHSA-w5hq-g745-h8pq"
  },
  {
    "id": "SENTINEL-F-GHSA-3h5v-q93c-6h6q",
    "title": "ws \u2014 GHSA-3h5v-q93c-6h6q"
  }
];

export const sealedFindingIds = new Set(["SENTINEL-F-GHSA-8cf7-32gw-wr33"]);

export const vaultDocuments: VaultDocument[] = [
  {
    id: "ev-pkg-jsonwebtoken",
    filename: "EVIDENCE-SENTINEL-F-GHSA-8cf7-32gw-wr33.json",
    hash: "sha256:136c6433af91e4e05d927a1ce900ab1ff81a2804d90c38ba91533a47d61619ce",
    verificationId: "sha256:136c6433af91e4e05d927a1ce900ab1ff81a2804d90c38ba91533a47d61619ce",
    sealedAt: "2026-08-21T03:55:48.477852+00:00",
    findingId: "SENTINEL-F-GHSA-8cf7-32gw-wr33",
  },
];

export const reviewTasks: ReviewTask[] = [
  {
    id: "review-jsonwebtoken",
    label: "EVIDENCE-SENTINEL-F-GHSA-8cf7-32gw-wr33.json (sealed, awaiting Deployment Gate decision)",
    sealed: true,
    submittedAt: "2026-08-21T03:55:48.477852+00:00",
  },
];
