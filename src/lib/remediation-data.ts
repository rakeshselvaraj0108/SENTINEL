import type {
  AuditLogEntry,
  GeneratedTest,
  LanguagePatch,
  RelatedFinding,
  RemediationClaim,
  SandboxContainer,
} from "./remediation-types";

export const remediationFindingId = "F-1042";
export const remediationCve = "CVE-2026-1147";

export const relatedFindings: RelatedFinding[] = [
  {
    id: "F-1042",
    title: "SQLi — /api/checkout",
    context: "user_id concatenated into raw SQL in checkout order lookup",
    tone: "critical",
    callChain: ["handleCheckout()", "buildQuery()", "db.execute()"],
  },
  {
    id: "F-1051",
    title: "Outdated TLS cipher suite — /api/webhook",
    context: "TLS_RSA_WITH_3DES_EDE_CBC_SHA still accepted on inbound webhook listener",
    tone: "review",
  },
  {
    id: "F-1058",
    title: "Verbose error stack trace — /api/orders",
    context: "unhandled exception returns full stack trace to client in 500 response",
    tone: "info",
  },
];

export const languagePatches: LanguagePatch[] = [
  {
    key: "cpp",
    label: "C++",
    file: "checkout_service/order_lookup.cpp",
    isDiff: true,
    lines: [
      { kind: "context", text: "std::string OrderLookup::fetchByUserId(const std::string& user_id) {" },
      { kind: "removed", text: '  std::string q = "SELECT * FROM orders WHERE id=" + user_id;' },
      { kind: "removed", text: "  sqlite3_exec(db_, q.c_str(), callback, nullptr, &err_msg);" },
      { kind: "added", text: "  sqlite3_stmt* stmt;" },
      { kind: "added", text: '  sqlite3_prepare_v2(db_, "SELECT * FROM orders WHERE id=?", -1, &stmt, nullptr);' },
      { kind: "added", text: "  sqlite3_bind_text(stmt, 1, user_id.c_str(), -1, SQLITE_TRANSIENT);" },
      { kind: "added", text: "  sqlite3_step(stmt);" },
      { kind: "context", text: "  ..." },
      { kind: "context", text: "}" },
    ],
  },
  {
    key: "python",
    label: "Python",
    file: "order_service/checkout.py",
    isDiff: true,
    lines: [
      { kind: "context", text: "def fetch_order(cur, user_id):" },
      { kind: "removed", text: '    cur.execute(f"SELECT * FROM orders WHERE id={user_id}")' },
      { kind: "added", text: '    cur.execute("SELECT * FROM orders WHERE id = %s", (user_id,))' },
      { kind: "context", text: "    return cur.fetchone()" },
    ],
  },
  {
    key: "terraform",
    label: "Terraform",
    file: "infra/waf/checkout_rules.tf",
    isDiff: false,
    lines: [
      { kind: "context", text: 'resource "aws_wafv2_web_acl_rule" "block_sqli_checkout" {' },
      { kind: "context", text: '  name     = "block-sqli-checkout"' },
      { kind: "context", text: "  priority = 10" },
      { kind: "context", text: "" },
      { kind: "context", text: "  action {" },
      { kind: "context", text: "    block {}" },
      { kind: "context", text: "  }" },
      { kind: "context", text: "" },
      { kind: "context", text: "  statement {" },
      { kind: "context", text: "    and_statement {" },
      { kind: "context", text: "      statement {" },
      { kind: "context", text: "        byte_match_statement {" },
      { kind: "context", text: '          search_string = "/api/checkout"' },
      { kind: "context", text: '          positional_constraint = "STARTS_WITH"' },
      { kind: "context", text: "          field_to_match { uri_path {} }" },
      { kind: "context", text: '          text_transformation { priority = 0, type = "NONE" }' },
      { kind: "context", text: "        }" },
      { kind: "context", text: "      }" },
      { kind: "context", text: "      statement {" },
      { kind: "context", text: "        sqli_match_statement {" },
      { kind: "context", text: "          field_to_match { body {} }" },
      { kind: "context", text: '          text_transformation { priority = 0, type = "URL_DECODE" }' },
      { kind: "context", text: "        }" },
      { kind: "context", text: "      }" },
      { kind: "context", text: "    }" },
      { kind: "context", text: "  }" },
      { kind: "context", text: "}" },
    ],
  },
];

export const generatedTests: GeneratedTest[] = [
  { id: "unit", label: "Unit tests", count: 18, total: 18 },
  { id: "sqli", label: "SQLi payload regression tests", count: 12, total: 12 },
  { id: "integration", label: "Integration tests /api/checkout", count: 9, total: 9 },
  { id: "suite", label: "Full suite total", count: 39, total: 39, isSummary: true },
];

export const initialSandboxContainers: SandboxContainer[] = [
  { id: "runsc-8841", label: "Isolated Sandbox Test Container #1501", progressPct: 0, status: "queued" },
  { id: "runsc-8842", label: "Isolated Sandbox Test Container #1502", progressPct: 0, status: "queued" },
];

export const initialClaims: RemediationClaim[] = [
  {
    id: "claim-parameterized",
    claim: "Parameterized query eliminates string-concatenated SQL in checkout handler",
    evidence: "0 raw string concatenation into SQL literal path across 18 unit tests",
    status: "pending",
  },
  {
    id: "claim-waf",
    claim: "WAF rule blocks SQLi payloads on /api/checkout without blocking legitimate traffic",
    evidence: "12/12 payloads blocked, 0 false-positives on legitimate traffic sample",
    status: "pending",
  },
];

export const initialAuditLog: AuditLogEntry = {
  entryId: "SENT-0396-CVE-2026-1147-PF-047",
  hash: "sha256:33865b871147a3f9c1e0d5764cba90112fe",
  sealed: false,
};
