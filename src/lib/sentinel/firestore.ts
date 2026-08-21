/**
 * Real-time Firestore hooks for P0-P2 pages.
 * Every page uses onSnapshot for live updates; no polling.
 */

'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  onSnapshot,
  QueryConstraint,
  where,
  orderBy,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  Finding,
  RelevanceVerdict,
  VerificationResult,
  EvidenceObject,
  RegistryEntry,
  GatewayLogEntry,
  Job,
} from './types';

export function useFindings(): [Finding[], boolean, Error | null] {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'findings'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          finding_id: doc.id,
          ...doc.data(),
        } as Finding));
        setFindings(data);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return [findings, loading, error];
}

export function useFinding(findingId: string): [Finding | null, boolean, Error | null] {
  const [finding, setFinding] = useState<Finding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'findings'), where('finding_id', '==', findingId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const doc = snapshot.docs[0];
        setFinding(doc ? ({ finding_id: doc.id, ...doc.data() } as Finding) : null);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [findingId]);

  return [finding, loading, error];
}

export function useVerificationResults(findingId?: string): [VerificationResult[], boolean, Error | null] {
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const constraints: QueryConstraint[] = [];
    if (findingId) {
      constraints.push(where('finding_id', '==', findingId));
    }
    constraints.push(orderBy('duration_ms', 'desc'));

    const q = query(collection(db, 'verification_results'), ...constraints);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          finding_id: doc.id,
          ...doc.data(),
        } as VerificationResult));
        setResults(data);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [findingId]);

  return [results, loading, error];
}

export function useEvidence(findingId: string): [EvidenceObject | null, boolean, Error | null] {
  const [evidence, setEvidence] = useState<EvidenceObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'evidence'), where('finding_id', '==', findingId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const doc = snapshot.docs[0];
        setEvidence(doc ? ({ finding_id: doc.id, ...doc.data() } as EvidenceObject) : null);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [findingId]);

  return [evidence, loading, error];
}

export function useAgentRegistry(): [RegistryEntry[], boolean, Error | null] {
  const [registry, setRegistry] = useState<RegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'agent_registry'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          agent_name: doc.id,
          ...doc.data(),
        } as RegistryEntry));
        setRegistry(data);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return [registry, loading, error];
}

export function useGatewayLog(limit: number = 50): [GatewayLogEntry[], boolean, Error | null] {
  const [log, setLog] = useState<GatewayLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'gateway_log'),
      orderBy('timestamp', 'desc'),
      firestoreLimit(limit)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          timestamp: doc.id,
          ...doc.data(),
        } as GatewayLogEntry));
        setLog(data);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [limit]);

  return [log, loading, error];
}

export function useJobs(): [Job[], boolean, Error | null] {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          job_id: doc.id,
          ...doc.data(),
        } as Job));
        setJobs(data);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return [jobs, loading, error];
}

export function useActiveJob(): [Job | null, boolean, Error | null] {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const constraints = [
      where('status', 'in', ['enqueued', 'claimed', 'processing']),
      orderBy('updated_at', 'desc'),
      firestoreLimit(1),
    ];
    const q = query(collection(db, 'jobs'), ...constraints);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const doc = snapshot.docs[0];
        setJob(doc ? ({ job_id: doc.id, ...doc.data() } as Job) : null);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return [job, loading, error];
}
