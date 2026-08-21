import type {
  AuditLogEntry,
  GeneratedTest,
  LanguagePatch,
  RelatedFinding,
  RemediationClaim,
  SandboxContainer,
} from "./remediation-types";

// Real data, synced from backend/workdir/snapshot.json via gen_frontend_data.py.

export const remediationFindingId = "SENTINEL-F-GHSA-8cf7-32gw-wr33";
export const remediationCve = "GHSA-8cf7-32gw-wr33";

export const relatedFindings: RelatedFinding[] = [
  { id: "SENTINEL-F-GHSA-8cf7-32gw-wr33", title: "jsonwebtoken \u2014 GHSA-8cf7-32gw-wr33", context: "jsonwebtoken unrestricted key type could lead to legacy keys usage ", tone: "critical" },
  { id: "SENTINEL-F-GHSA-6g6m-m6h5-w9gf", title: "express-jwt \u2014 GHSA-6g6m-m6h5-w9gf", context: "Authorization bypass in express-jwt", tone: "review" },
  { id: "SENTINEL-F-GHSA-gjcw-v447-2w7q", title: "jws \u2014 GHSA-gjcw-v447-2w7q", context: "Forgeable Public/Private Tokens in jws", tone: "review" },
];

export const languagePatches: LanguagePatch[] = [
  {
    key: "typescript",
    label: "TypeScript",
    file: "lib/insecurity.ts",
    isDiff: true,
    lines: [
      { kind: "context", text: "export const authorize = (user = {}) => jwt.sign(user, privateKey, { expiresIn: '6h', algorithm: 'RS256' })" },
      { kind: "removed", text: "export const isAuthorized = () => expressJwt(({ secret: publicKey }) as any)" },
      { kind: "added", text: "export const isAuthorized = () => expressJwt({ secret: publicKey, algorithms: ['RS256'] })" },
      { kind: "context", text: "export const decode = (token: string) => { return jws.decode(token)?.payload }" },
      { kind: "context", text: "export const updateAuthenticatedUsers = () => (req: Request, res: Response, next: NextFunction) => {" },
      { kind: "removed", text: "    jwt.verify(token, publicKey, (err: Error | null, decoded: any) => {" },
      { kind: "added", text: "    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err: Error | null, decoded: any) => {" },
    ],
  },
  {
    key: "json",
    label: "package.json",
    file: "package.json",
    isDiff: true,
    lines: [
      { kind: "context", text: "\"js-yaml\": \"^3.14.0\"," },
      { kind: "removed", text: "\"jsonwebtoken\": \"0.4.0\"," },
      { kind: "added", text: "\"jsonwebtoken\": \"^9.0.0\"," },
      { kind: "context", text: "\"libxml2-wasm\": \"^0.7.1\"," },
    ],
  },
  {
    key: "test",
    label: "Generated Test",
    file: "test/server/insecurity.spec.ts",
    isDiff: false,
    lines: [
      { kind: "context", text: "describe('insecurity', () => {" },
      { kind: "context", text: "  describe('updateAuthenticatedUsers', () => {" },
      { kind: "context", text: "    it('should reject HS256 token signed with RSA public key when algorithms are restricted', (done) => {" },
      { kind: "context", text: "      const forgedToken = jwt.sign(payload, publicKey, { algorithm: 'HS256' })" },
      { kind: "context", text: "      const middleware = updateAuthenticatedUsers()" },
      { kind: "context", text: "      middleware(req, res, next)" },
      { kind: "context", text: "      setTimeout(() => {" },
      { kind: "context", text: "        expect(authenticatedUsersPutStub.called).to.be.false" },
      { kind: "context", text: "        expect(next.calledOnce).to.be.true" },
      { kind: "context", text: "        done()" },
      { kind: "context", text: "      }, 10)" },
      { kind: "context", text: "    })" },
      { kind: "context", text: "  })" },
      { kind: "context", text: "})" },
    ],
  },
];

export const generatedTests: GeneratedTest[] = [
  { id: "container-0", label: "Pre-patch exploit confirmation (sandbox-76917b859255)", count: 1, total: 1 },
  { id: "container-1", label: "Post-patch resolution (sandbox-fac1cd307245)", count: 1, total: 1 },
  { id: "suite", label: "Verification Lab total", count: 2, total: 2, isSummary: true },
];

export const initialSandboxContainers: SandboxContainer[] = [
  { id: "sandbox-76917b859255", label: "Sandbox — master (jsonwebtoken@0.4.0)", progressPct: 0, status: "queued" },
  { id: "sandbox-fac1cd307245", label: "Sandbox — fix branch (jsonwebtoken@^9.0.0)", progressPct: 0, status: "queued" },
];

export const initialClaims: RemediationClaim[] = [
  {
    id: "claim-algorithms",
    claim: "Explicit algorithms: ['RS256'] restriction added to all jwt.verify / express-jwt calls in lib/insecurity.ts",
    evidence: "Verification Lab: jsonwebtoken@0.4.0 ignores the algorithms option entirely — forged HS256 token still ACCEPTED (135780ms)",
    status: "pending",
  },
  {
    id: "claim-version-bump",
    claim: "jsonwebtoken bumped from 0.4.0 to ^9.0.0 in package.json",
    evidence: "Verification Lab: jsonwebtoken@^9.0.0 enforces algorithm-by-key-type — forged HS256 token REJECTED, 'invalid algorithm' (101359ms)",
    status: "pending",
  },
];

export const initialAuditLog: AuditLogEntry = {
  entryId: "SENT-SENTINEL-F-GHSA-8cf7-32gw-wr33-PF",
  hash: "sha256:136c6433af91e4e05d927a1ce900ab1ff81a2804d90c38ba91533a47d61619ce",
  sealed: false,
};
