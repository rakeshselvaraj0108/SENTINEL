"use client";

import { useEffect, useMemo, useState } from "react";
import { List, type RowComponentProps } from "react-window";
import { Panel } from "../../command-center/Panel";
import { LedgerFilterBar, type LedgerFilters } from "./LedgerFilterBar";
import { VerifyChainAction } from "./VerifyChainAction";
import { GroupHeaderRow } from "./GroupHeaderRow";
import { EntryRow } from "./EntryRow";
import { LedgerEntryDetail } from "./LedgerEntryDetail";
import { ledgerEntries } from "@/lib/ledger-data";
import { getFullLedger } from "@/lib/ledger-runtime";
import type { FlatRow, LedgerEntry } from "@/lib/ledger-types";

const GROUP_ROW_HEIGHT = 34;
const ENTRY_ROW_HEIGHT = 34;

interface RowRenderProps {
  rows: FlatRow[];
  expandedGroups: Set<string>;
  selectedHash: string | null;
  toggleGroup: (id: string) => void;
  selectEntry: (entry: LedgerEntry) => void;
}

function Row({
  index,
  style,
  rows,
  expandedGroups,
  selectedHash,
  toggleGroup,
  selectEntry,
}: RowComponentProps<RowRenderProps>) {
  const row = rows[index];
  if (!row) return null;
  if (row.type === "group") {
    return (
      <GroupHeaderRow
        style={style}
        findingId={row.findingId}
        title={row.title}
        count={row.count}
        expanded={expandedGroups.has(row.findingId)}
        onToggle={() => toggleGroup(row.findingId)}
      />
    );
  }
  return (
    <EntryRow
      style={style}
      entry={row.entry}
      selected={selectedHash === row.entry.hash}
      onSelect={() => selectEntry(row.entry)}
    />
  );
}

export function DeterministicAuditLedgerPanel() {
  const [allEntries, setAllEntries] = useState<LedgerEntry[]>(ledgerEntries);
  const [filters, setFilters] = useState<LedgerFilters>({ agent: "all", query: "", dateFrom: "", dateTo: "" });
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(ledgerEntries.map((e) => e.findingId))
  );
  const [selected, setSelected] = useState<LedgerEntry | null>(null);

  useEffect(() => {
    const load = () => setAllEntries(getFullLedger());
    load();
    window.addEventListener("focus", load);
    return () => window.removeEventListener("focus", load);
  }, []);

  const filteredEntries = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return allEntries.filter((e) => {
      if (filters.agent !== "all" && e.agent !== filters.agent) return false;
      if (q && !(e.findingId.toLowerCase().includes(q) || e.title.toLowerCase().includes(q))) return false;
      if (filters.dateFrom && e.timestamp < filters.dateFrom) return false;
      if (filters.dateTo && e.timestamp > `${filters.dateTo}T23:59:59Z`) return false;
      return true;
    });
  }, [filters, allEntries]);

  const rows: FlatRow[] = useMemo(() => {
    const groups = new Map<string, { title: string; entries: LedgerEntry[] }>();
    for (const e of filteredEntries) {
      if (!groups.has(e.findingId)) groups.set(e.findingId, { title: e.title, entries: [] });
      groups.get(e.findingId)!.entries.push(e);
    }
    const ordered = [...groups.entries()].sort(
      (a, b) => new Date(b[1].entries.at(-1)!.timestamp).getTime() - new Date(a[1].entries.at(-1)!.timestamp).getTime()
    );
    const out: FlatRow[] = [];
    for (const [findingId, group] of ordered) {
      out.push({ type: "group", findingId, title: group.title, count: group.entries.length, allConfirmed: true });
      if (expandedGroups.has(findingId)) {
        for (const entry of group.entries) out.push({ type: "entry", entry, expanded: false });
      }
    }
    return out;
  }, [filteredEntries, expandedGroups]);

  const toggleGroup = (id: string) =>
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const rowHeight = (index: number) => (rows[index]?.type === "group" ? GROUP_ROW_HEIGHT : ENTRY_ROW_HEIGHT);

  return (
    <Panel
      title="Deterministic Audit Ledger"
      headerRight={<VerifyChainAction entries={allEntries} />}
      className="h-full"
      bodyClassName="flex min-h-0 flex-1 flex-col"
    >
      <LedgerFilterBar filters={filters} onChange={setFilters} />
      <div className="min-h-0 flex-1">
        <List<RowRenderProps>
          rowComponent={Row}
          rowCount={rows.length}
          rowHeight={rowHeight}
          rowProps={{
            rows,
            expandedGroups,
            selectedHash: selected?.hash ?? null,
            toggleGroup,
            selectEntry: setSelected,
          }}
          defaultHeight={520}
          style={{ height: "100%" }}
        />
      </div>
      {selected && <LedgerEntryDetail entry={selected} onClose={() => setSelected(null)} />}
    </Panel>
  );
}
