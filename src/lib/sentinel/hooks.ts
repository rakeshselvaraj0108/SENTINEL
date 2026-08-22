"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  abortJob,
  getGatewayLog,
  getModelArmorLog,
  getRegistry,
  getState,
  startInvestigation,
  SentinelApiError,
  type CommandCenterState,
  type GatewayLogEntry,
  type ModelArmorLogEntry,
  type RegistryEntry,
} from "./api";

const POLL_INTERVAL_MS = 2000;

/**
 * Generic poll-on-interval hook shared by the simpler read-only resources
 * (registry, gateway log, model armor log) - same real-time-via-polling
 * approach as useCommandCenterState, just without the job start/abort
 * mutations that only the Command Center needs.
 */
function usePolledResource<T>(fetcher: () => Promise<T>, intervalMs = POLL_INTERVAL_MS) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const poll = useCallback(async () => {
    try {
      const next = await fetcherRef.current();
      if (!mounted.current) return;
      setData(next);
      setError(null);
    } catch (err) {
      if (!mounted.current) return;
      setError(err instanceof SentinelApiError ? err.message : "Failed to reach the agent engine.");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    const kickoff = setTimeout(poll, 0);
    const id = setInterval(poll, intervalMs);
    return () => {
      mounted.current = false;
      clearTimeout(kickoff);
      clearInterval(id);
    };
  }, [poll, intervalMs]);

  return { data, loading, error };
}

export function useRegistry() {
  const { data, loading, error } = usePolledResource<{ agents: RegistryEntry[] }>(getRegistry, 5000);
  return { agents: data?.agents ?? [], loading, error };
}

export function useGatewayLog(limit = 100) {
  const fetcher = useCallback(() => getGatewayLog(limit), [limit]);
  const { data, loading, error } = usePolledResource<{ log: GatewayLogEntry[] }>(fetcher, 2000);
  return { log: data?.log ?? [], loading, error };
}

export function useModelArmorLog(limit = 100) {
  const fetcher = useCallback(() => getModelArmorLog(limit), [limit]);
  const { data, loading, error } = usePolledResource<{ log: ModelArmorLogEntry[] }>(fetcher, 5000);
  return { log: data?.log ?? [], loading, error };
}

interface UseCommandCenterStateResult {
  state: CommandCenterState | null;
  loading: boolean;
  error: string | null;
  starting: boolean;
  aborting: boolean;
  start: () => Promise<void>;
  abort: () => Promise<void>;
}

/**
 * Polls GET /api/state on a fixed interval. This is real-time in the sense
 * that matters here: every tick reflects the agent engine's actual current
 * condition (queue + evidence store + gateway log), not a value computed
 * once at build time. Survives the "close the browser, reopen later" test
 * because the state lives in the backend, not in React state.
 */
export function useCommandCenterState(findingId?: string | null): UseCommandCenterStateResult {
  const [state, setState] = useState<CommandCenterState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [aborting, setAborting] = useState(false);
  const mounted = useRef(true);
  const currentJobId = useRef<string | null>(null);

  const poll = useCallback(async () => {
    try {
      const next = await getState(findingId);
      if (!mounted.current) return;
      setState(next);
      currentJobId.current = next.job?.job_id ?? null;
      setError(null);
    } catch (err) {
      if (!mounted.current) return;
      setError(err instanceof SentinelApiError ? err.message : "Failed to reach the agent engine.");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [findingId]);

  useEffect(() => {
    mounted.current = true;
    // Fire the first fetch from a timer callback (not directly in the effect
    // body) so it goes through the same "external callback triggers
    // setState" path as every subsequent interval tick.
    const kickoff = setTimeout(poll, 0);
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      mounted.current = false;
      clearTimeout(kickoff);
      clearInterval(id);
    };
  }, [poll]);

  const start = useCallback(async () => {
    setStarting(true);
    try {
      await startInvestigation(findingId);
      await poll();
    } catch (err) {
      setError(err instanceof SentinelApiError ? err.message : "Failed to start investigation.");
    } finally {
      setStarting(false);
    }
  }, [findingId, poll]);

  const abort = useCallback(async () => {
    const jobId = currentJobId.current;
    if (!jobId) return;
    setAborting(true);
    try {
      await abortJob(jobId);
      await poll();
    } catch (err) {
      setError(err instanceof SentinelApiError ? err.message : "Failed to abort job.");
    } finally {
      setAborting(false);
    }
  }, [poll]);

  return { state, loading, error, starting, aborting, start, abort };
}
