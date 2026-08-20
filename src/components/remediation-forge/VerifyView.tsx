import type { VerificationRun } from "@/hooks/useVerificationRun";
import { TestEnginePanel } from "./verify/TestEnginePanel";
import { ReVerificationStatusPanel } from "./verify/ReVerificationStatusPanel";
import { ClaimVsEvidencePanel } from "./verify/ClaimVsEvidencePanel";

export function VerifyView({ containers, tests, claims, auditLog, allPassed }: VerificationRun) {
  return (
    <div className="grid grid-rows-3 gap-3">
      <TestEnginePanel tests={tests} />
      <ReVerificationStatusPanel containers={containers} allPassed={allPassed} />
      <ClaimVsEvidencePanel claims={claims} auditLog={auditLog} />
    </div>
  );
}
