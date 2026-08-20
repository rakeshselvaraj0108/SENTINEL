import clsx from "clsx";
import { IconShieldCheckFilled, IconRobot, IconUserCircle } from "@tabler/icons-react";
import { Panel } from "../../command-center/Panel";
import { signers } from "@/lib/evidence-data";

function truncateHash(hash: string) {
  return `${hash.slice(0, 18)}…${hash.slice(-6)}`;
}

export function CompleteSecurePanel({ highlighted }: { highlighted: boolean }) {
  return (
    <Panel
      title="Sign-off"
      className={clsx("transition-shadow", highlighted && "ring-1 ring-amber/50 border-amber/40")}
      bodyClassName="flex flex-col gap-3 p-3"
    >
      <div className="flex w-fit items-center gap-1.5 border border-success/40 bg-success/10 px-2.5 py-1 font-data text-[10.5px] uppercase tracking-[0.08em] text-success">
        <IconShieldCheckFilled size={13} strokeWidth={1.5} />
        Complete &amp; Secure
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[10px] uppercase tracking-[0.06em] text-text-dim">Signed by</p>
        {signers.map((signer) => {
          const Icon = signer.kind === "service" ? IconRobot : IconUserCircle;
          return (
            <div key={signer.id} className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border-soft bg-white/[0.03] text-text-muted">
                <Icon size={13} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] text-text">{signer.name}</p>
                <p className="truncate text-[9.5px] text-text-dim">{signer.role}</p>
              </div>
              <span
                className="shrink-0 font-data text-[9.5px] text-text-dim"
                title={signer.signatureHash}
              >
                {truncateHash(signer.signatureHash)}
              </span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
