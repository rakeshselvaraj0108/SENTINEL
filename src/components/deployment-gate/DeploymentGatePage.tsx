import { TopBar } from "../command-center/TopBar";
import { IconRail } from "../command-center/IconRail";
import { DeploymentGateCard } from "./DeploymentGateCard";

export function DeploymentGatePage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <IconRail />
        <main className="flex flex-1 items-center justify-center overflow-auto p-6">
          <DeploymentGateCard />
        </main>
      </div>
    </div>
  );
}
