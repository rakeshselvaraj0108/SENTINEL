import type { AuditTrailNode, DwsSeal, SignerIdentity, TestCaseGroup } from "./evidence-types";

export const evidenceFindingId = "F-1042";
export const evidenceCve = "CVE-2026-1147";
export const evidenceSummary =
  "SQL injection via unsanitized user_id concatenated into the checkout order lookup query.";

export const reachabilityChecks = [
  "Reachability path confirmed: handleCheckout() → buildQuery() → db.execute()",
  "Vulnerable path is externally reachable from POST /api/checkout",
];

export const sandboxVerificationChecks = [
  { id: "runsc-8841", note: "confirmed exploitable pre-patch, unsanitized input reached db.execute()" },
  { id: "runsc-8842", note: "confirmed resolved post-patch, parameterized bind verified" },
];

export const commitInfo = {
  file: "checkout_service/order_lookup.cpp",
  commitHash: "a81f92c3f5e6d0b8471c9e2a7d3f6081b5c9e4a2",
};

export const evidenceDiff = [
  { kind: "removed" as const, text: 'std::string q = "SELECT * FROM orders WHERE id=" + user_id;' },
  { kind: "removed" as const, text: "sqlite3_exec(db_, q.c_str(), callback, nullptr, &err_msg);" },
  { kind: "added" as const, text: 'sqlite3_prepare_v2(db_, "SELECT * FROM orders WHERE id=?", -1, &stmt, nullptr);' },
  { kind: "added" as const, text: "sqlite3_bind_text(stmt, 1, user_id.c_str(), -1, SQLITE_TRANSIENT);" },
];

export const testGroups: TestCaseGroup[] = [
  {
    id: "regression",
    label: "Regression tests",
    passed: 18,
    total: 18,
    tests: [
      "test_order_lookup_returns_correct_row",
      "test_order_lookup_missing_id_returns_404",
      "test_order_lookup_numeric_id",
      "test_order_lookup_alpha_id_rejected",
      "test_order_lookup_empty_id_rejected",
      "test_order_lookup_sql_metacharacters_escaped",
      "test_order_lookup_unicode_id",
      "test_order_lookup_max_length_id",
      "test_order_lookup_concurrent_requests",
      "test_order_lookup_db_connection_reuse",
      "test_order_lookup_prepared_statement_cache",
      "test_order_lookup_response_schema_unchanged",
      "test_order_lookup_latency_within_budget",
      "test_order_lookup_error_message_no_sql_leak",
      "test_order_lookup_auth_required",
      "test_order_lookup_rate_limit_respected",
      "test_order_lookup_logging_redacts_pii",
      "test_order_lookup_rollback_on_failure",
    ],
  },
  {
    id: "integration",
    label: "Integration tests",
    passed: 6,
    total: 6,
    tests: [
      "test_checkout_flow_end_to_end",
      "test_checkout_order_lookup_service_contract",
      "test_checkout_payment_gateway_handoff",
      "test_checkout_inventory_hold_release",
      "test_checkout_waf_rule_allows_legit_traffic",
      "test_checkout_waf_rule_blocks_known_payloads",
    ],
  },
  {
    id: "sqli-regression",
    label: "SQLi payload regression",
    passed: 4,
    total: 4,
    tests: [
      "test_sqli_payload_union_select_blocked",
      "test_sqli_payload_boolean_blind_blocked",
      "test_sqli_payload_stacked_query_blocked",
      "test_sqli_payload_time_based_blocked",
    ],
  },
];

export const auditTrail: AuditTrailNode[] = [
  {
    id: "hunter",
    actor: "hunter",
    action: "approved finding",
    detail: "F-1042 flagged from SCA scan of checkout_service dependency manifest",
    timestamp: "2026-08-19T14:02:11Z",
    highlightTarget: "summary",
  },
  {
    id: "analyst",
    actor: "analyst",
    action: "confirmed relevance",
    detail: "reachability confirmed via static call-graph analysis",
    timestamp: "2026-08-19T14:02:27Z",
    highlightTarget: "reachability",
  },
  {
    id: "patch-forge",
    actor: "patch-forge",
    action: "proposed fix",
    detail: "parameterized query (C++), parameterized query (Python), WAF rule (Terraform)",
    timestamp: "2026-08-19T14:03:15Z",
    highlightTarget: "evidence-pack",
  },
  {
    id: "verifier",
    actor: "verifier",
    action: "confirmed resolution",
    detail: "sandbox re-verification passed, 28/28 tests green",
    timestamp: "2026-08-19T14:04:02Z",
    highlightTarget: "reverify",
  },
  {
    id: "human",
    actor: "human",
    action: "final approval",
    detail: "reviewed evidence pack and sealed the record",
    timestamp: "2026-08-19T14:06:48Z",
    highlightTarget: "signoff",
  },
];

export const signers: SignerIdentity[] = [
  {
    id: "patch-forge-agent",
    name: "patch-forge-agent",
    kind: "service",
    role: "service identity",
    signatureHash: "sigstore:sha256:7e2a19c4f0b8d6e1a3c5f9b2d4e6a8c0f1b3d5e7",
  },
  {
    id: "re-verifier-agent",
    name: "re-verifier-agent",
    kind: "service",
    role: "service identity",
    signatureHash: "sigstore:sha256:c9d1b4a6e8f0a2c4b6d8e0f2a4c6b8d0e2f4a6c8",
  },
  {
    id: "priya-nandakumar",
    name: "Priya Nandakumar",
    kind: "human",
    role: "Security Lead, final reviewer",
    signatureHash: "sigstore:sha256:4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a",
  },
];

export const dwsSeal: DwsSeal = {
  documentId: "nutrient:doc-id:8f2c1a9e-6b3d-4c7e-9a1f-5d8b2e4c6a0f",
  verificationId: "DWS-VRF-2026-081947-F1042",
  sealedAt: "2026-08-19T14:06:52Z",
};
