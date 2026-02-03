/**
 * Load pending decisions from GET /decisions (persisted to GitHub + Redis).
 * Converts records with status "pending" to UnifiedPreviewItem so the Decisions panel
 * can show them without relying on stream/refetch timing.
 */
import { useCallback, useEffect, useState } from "react";
import type { UnifiedPreviewItem } from "./use-unified-previews";

interface DecisionRecord {
  id: string;
  type: string;
  title: string;
  status: string;
  args?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

function recordToPreviewItem(record: DecisionRecord, threadId: string | undefined): UnifiedPreviewItem {
  const args = record.args ?? {};
  const preview_data = args.preview_data as Record<string, unknown> | undefined;
  return {
    id: record.id,
    type: record.type,
    title: record.title,
    summary: (args.model_summary as string) || `${record.type} ready to apply`,
    status: "pending",
    data: {
      name: record.type,
      args,
      preview_data,
      diff: preview_data?.diff,
    },
    threadId,
    fromMessages: true,
  };
}

export function usePendingDecisions(threadId: string | undefined): {
  pending: UnifiedPreviewItem[];
  isLoading: boolean;
  refetch: () => Promise<void>;
} {
  const [pending, setPending] = useState<UnifiedPreviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (typeof window === "undefined" || !threadId?.trim()) {
      setPending([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ thread_id: threadId });
      const headers: Record<string, string> = {};
      const orgContext = localStorage.getItem("reflexion_org_context");
      if (orgContext) headers["X-Organization-Context"] = orgContext;
      const res = await fetch(`/api/decisions?${params}`, { headers });
      if (!res.ok) {
        setPending([]);
        return;
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const pendingRecords = list.filter(
        (r: DecisionRecord) => r && typeof r.id === "string" && r.status === "pending"
      ) as DecisionRecord[];
      setPending(pendingRecords.map((r) => recordToPreviewItem(r, threadId)));
    } catch (e) {
      console.warn("[usePendingDecisions] Load failed", e);
      setPending([]);
    } finally {
      setIsLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    load();
  }, [load]);

  return { pending, isLoading, refetch: load };
}
