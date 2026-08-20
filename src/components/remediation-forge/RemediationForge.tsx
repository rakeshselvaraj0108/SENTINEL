"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "../command-center/TopBar";
import { IconRail } from "../command-center/IconRail";
import { RemediationHeader } from "./RemediationHeader";
import { FindingsPanel } from "./FindingsPanel";
import { GenerateView } from "./GenerateView";
import { VerifyView } from "./VerifyView";
import { useVerificationRun } from "@/hooks/useVerificationRun";
import type { ForgeState } from "@/lib/remediation-types";

export function RemediationForge() {
  const [state, setState] = useState<ForgeState>("generate");
  const [hasSent, setHasSent] = useState(false);
  const verification = useVerificationRun(hasSent);

  const handleSendToVerification = () => {
    setHasSent(true);
    setState("verify");
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <IconRail />
        <div className="flex min-h-0 flex-1 flex-col">
          <RemediationHeader state={state} onStateChange={setState} verifyEnabled={hasSent} />
          <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-auto p-3 lg:grid-cols-[minmax(240px,0.32fr)_1fr]">
            <FindingsPanel />
            <AnimatePresence mode="wait">
              <motion.div
                key={state}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="min-h-0"
              >
                {state === "generate" ? (
                  <GenerateView onSendToVerification={handleSendToVerification} />
                ) : (
                  <VerifyView {...verification} />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
