import { CodePanels } from "./generate/CodePanels";
import { GeneratedTestsPanel } from "./generate/GeneratedTestsPanel";

export function GenerateView({ onSendToVerification }: { onSendToVerification: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <CodePanels />
      <GeneratedTestsPanel onSendToVerification={onSendToVerification} />
    </div>
  );
}
