import { Panel } from "../../command-center/Panel";
import { SemicircularGauge } from "./SemicircularGauge";
import { assetInstances } from "@/lib/verification-lab-data";

export function CompliancePosturePanel() {
  const compliant = assetInstances.filter((a) => a.compliance === "compliant").length;
  const pct = (compliant / assetInstances.length) * 100;

  return (
    <Panel title="Current Compliance Posture" bodyClassName="flex flex-col items-center justify-center p-3">
      <SemicircularGauge pct={pct} />
      <p className="mt-1 font-data text-[9.5px] text-text-dim">
        {compliant}/{assetInstances.length} monitored instances compliant
      </p>
    </Panel>
  );
}
