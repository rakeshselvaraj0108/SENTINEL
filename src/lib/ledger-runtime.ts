import { sha256Hex } from "./sha256";
import { ledgerEntries, ledgerEntryPayload } from "./ledger-data";
import type { LedgerAgent, LedgerEntry, LedgerEntryInput } from "./ledger-types";

const STORAGE_KEY = "sentinel.ledger.runtimeAppends";

function readAppended(): LedgerEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LedgerEntry[]) : [];
  } catch {
    return [];
  }
}

function writeAppended(entries: LedgerEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage unavailable — the append still returns to the caller, it just won't persist
  }
}

/** All base + runtime-appended entries, in chain order. Client-only — call after mount. */
export function getFullLedger(): LedgerEntry[] {
  return [...ledgerEntries, ...readAppended()];
}

/**
 * Appends one new entry to the tail of the real hash chain, exactly like the
 * base chain builder does, and persists it to localStorage so any page
 * reading getFullLedger() (e.g. the Audit Ledger) sees it. This is the
 * Deployment Gate's write point into the ledger — not a separate log.
 */
export function appendLedgerEntry(input: {
  findingId: string;
  title: string;
  agent: LedgerAgent;
  action: string;
  detail: string;
}): LedgerEntry {
  const appended = readAppended();
  const tail = appended.length > 0 ? appended[appended.length - 1] : ledgerEntries[ledgerEntries.length - 1];

  const entryInput: LedgerEntryInput = { ...input, timestamp: new Date().toISOString() };
  const hash = sha256Hex(tail.hash + ledgerEntryPayload(entryInput));
  const entry: LedgerEntry = { ...entryInput, seq: ledgerEntries.length + appended.length, hash, prevHash: tail.hash };

  writeAppended([...appended, entry]);
  return entry;
}
