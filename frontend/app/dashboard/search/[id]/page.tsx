"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, RotateCcw } from "lucide-react";
import { searchApi } from "@/lib/api";
import { StatusBadge } from "@/components/modules/StatusBadge";
import { SearchProgress } from "@/components/modules/SearchProgress";
import { SiteCard, SiteCardData } from "@/components/modules/SiteCard";
import { Filters } from "@/components/modules/Filters";
import { ConfirmDialog } from "@/components/modules/ConfirmDialog";
import { EmptyState } from "@/components/modules/EmptyState";
import { formatDate } from "@/lib/utils";

const SORT_OPTIONS = [
  { key: "relevance_score", label: "Релевантность" },
  { key: "reviews_total", label: "Отзывов" },
  { key: "activity_score", label: "Активность" },
];

export default function SearchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sort, setSort] = useState("relevance_score");
  const [search, setSearch] = useState("");

  const { data: query, isLoading } = useQuery({
    queryKey: ["query", id],
    queryFn: () => searchApi.get(id).then((r) => r.data),
    refetchInterval: (query) => (query.state.data?.status === "running" || query.state.data?.status === "pending" ? 5000 : false),
  });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await searchApi.delete(id);
      router.push("/dashboard");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const analyses: SiteCardData[] = (query?.analyses ?? [])
    .filter((a: SiteCardData) => !search || a.site.domain.includes(search.toLowerCase()))
    .sort((a: SiteCardData, b: SiteCardData) => {
      const av = (a as unknown as Record<string, number>)[sort] ?? 0;
      const bv = (b as unknown as Record<string, number>)[sort] ?? 0;
      return bv - av;
    });

  if (isLoading) return <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="h-32 rounded-card shimmer-bg" />)}</div>;

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => router.push("/dashboard")} className="flex items-center gap-1.5 text-sm text-text-subtle hover:text-text-muted transition-colors mb-3">
            <ArrowLeft className="w-4 h-4" /> Назад
          </button>
          <h1 className="font-display text-2xl font-bold text-text-primary">{query?.query_text}</h1>
          <div className="flex items-center gap-3 mt-2">
            {query?.topic && <span className="text-xs text-text-subtle bg-bg-surface border border-border px-2 py-0.5 rounded-full">{query.topic}</span>}
            <StatusBadge status={query?.status} />
            <span className="text-xs text-text-subtle">{formatDate(query?.created_at)}</span>
          </div>
        </div>
        <button onClick={() => setDeleteOpen(true)} className="p-2 rounded text-text-subtle hover:text-negative hover:bg-[#F8717115] transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Progress */}
      {(query?.status === "running" || query?.status === "pending") && (
        <div className="bg-bg-surface rounded-card border border-border p-6">
          <SearchProgress
            queryId={id}
            onComplete={() => qc.invalidateQueries({ queryKey: ["query", id] })}
          />
        </div>
      )}

      {/* Results */}
      {query?.status === "completed" && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">
              {analyses.length} площадок<span className="text-accent">.</span>
            </h2>
            <Filters
              sorts={SORT_OPTIONS}
              onSearch={setSearch}
              onSortChange={setSort}
              defaultSort="relevance_score"
              searchPlaceholder="Поиск по домену..."
            />
          </div>

          {analyses.length === 0 ? (
            <EmptyState title="Площадки не найдены" description="Попробуйте другой запрос или тематику" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analyses.map((a, i) => (
                <SiteCard key={a.id} data={a} index={i} />
              ))}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Удалить запрос?"
        description="Все найденные площадки для этого запроса будут удалены. Действие необратимо."
        confirmLabel="Удалить"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
