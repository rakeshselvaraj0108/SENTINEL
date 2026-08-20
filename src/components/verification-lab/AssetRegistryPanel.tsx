"use client";

import { useMemo, useState } from "react";
import { List, type RowComponentProps } from "react-window";
import clsx from "clsx";
import { IconSearch, IconChevronRight, IconCircleCheck, IconCircle } from "@tabler/icons-react";
import { Panel } from "../command-center/Panel";
import { assetServices, assetInstances } from "@/lib/verification-lab-data";
import type { FlatAssetRow } from "@/lib/verification-lab-types";

const ROW_HEIGHT = 30;

interface RowRenderProps {
  rows: FlatAssetRow[];
  expanded: Set<string>;
  selectedId: string;
  toggleService: (id: string) => void;
  selectInstance: (id: string) => void;
}

function Row({ index, style, rows, expanded, selectedId, toggleService, selectInstance }: RowComponentProps<RowRenderProps>) {
  const row = rows[index];
  if (!row) return null;

  if (row.type === "service") {
    return (
      <div style={style} className="px-1">
        <button
          type="button"
          onClick={() => toggleService(row.serviceId)}
          className="flex h-full w-full items-center gap-2 border-b border-border-soft bg-white/[0.02] px-2 text-left transition-colors hover:bg-white/[0.04]"
        >
          <IconChevronRight
            size={12}
            strokeWidth={1.5}
            className={clsx("shrink-0 text-text-dim transition-transform", expanded.has(row.serviceId) && "rotate-90")}
          />
          <span className="flex-1 truncate text-[11px] text-text">{row.name}</span>
          <span className="shrink-0 font-data text-[9.5px] text-text-dim">{row.instanceCount}</span>
        </button>
      </div>
    );
  }

  const inst = row.instance;
  const selected = inst.id === selectedId;
  return (
    <div style={style} className="px-1">
      <button
        type="button"
        onClick={() => selectInstance(inst.id)}
        className={clsx(
          "grid h-full w-full grid-cols-[1fr_54px_72px_28px] items-center gap-1 pl-7 pr-2 text-left transition-colors",
          selected ? "bg-amber-soft" : "hover:bg-white/[0.02]"
        )}
      >
        <span className={clsx("truncate text-[10.5px]", selected ? "text-amber" : "text-text-muted")}>{row.serviceName}</span>
        <span className="font-data text-[10px] text-text-dim">{inst.version}</span>
        <span
          className={clsx(
            "border px-1 py-0.5 text-center font-data text-[8.5px] uppercase tracking-[0.04em]",
            inst.compliance === "compliant"
              ? "border-success/40 bg-success/10 text-success"
              : "border-warning/40 bg-warning/10 text-warning"
          )}
        >
          {inst.compliance}
        </span>
        {inst.checked ? (
          <IconCircleCheck size={12} strokeWidth={1.5} className="justify-self-center text-text-muted" />
        ) : (
          <IconCircle size={12} strokeWidth={1.5} className="justify-self-center text-text-dim" />
        )}
      </button>
    </div>
  );
}

export function AssetRegistryPanel({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(assetServices.map((s) => s.id)));

  const filteredInstances = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assetInstances;
    return assetInstances.filter((i) => {
      const service = assetServices.find((s) => s.id === i.serviceId);
      return service?.name.toLowerCase().includes(q) || i.version.toLowerCase().includes(q);
    });
  }, [query]);

  const rows: FlatAssetRow[] = useMemo(() => {
    const out: FlatAssetRow[] = [];
    for (const service of assetServices) {
      const instances = filteredInstances.filter((i) => i.serviceId === service.id);
      if (instances.length === 0) continue;
      out.push({ type: "service", serviceId: service.id, name: service.name, instanceCount: instances.length });
      if (expanded.has(service.id)) {
        for (const inst of instances) out.push({ type: "instance", instance: inst, serviceName: service.name });
      }
    }
    return out;
  }, [filteredInstances, expanded]);

  const toggleService = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Panel title="Static & Dynamic Asset Registry" className="h-full" bodyClassName="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-1.5 border-b border-border-soft px-2 py-1.5">
        <IconSearch size={12} strokeWidth={1.5} className="shrink-0 text-text-dim" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search assets…"
          className="w-full bg-transparent font-data text-[10.5px] text-text placeholder:text-text-dim focus:outline-none"
        />
      </div>
      <div className="grid grid-cols-[1fr_54px_72px_28px] gap-1 border-b border-border-soft py-1 pl-9 pr-2 font-data text-[8.5px] uppercase tracking-[0.05em] text-text-dim">
        <span>Asset</span>
        <span>Version</span>
        <span>Compliance</span>
        <span className="text-center">Check</span>
      </div>
      <div className="min-h-0 flex-1">
        <List<RowRenderProps>
          rowComponent={Row}
          rowCount={rows.length}
          rowHeight={ROW_HEIGHT}
          rowProps={{ rows, expanded, selectedId, toggleService, selectInstance: onSelect }}
          defaultHeight={520}
          style={{ height: "100%" }}
        />
      </div>
    </Panel>
  );
}
