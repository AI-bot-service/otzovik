"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Search, Globe, TrendingUp } from "lucide-react";
import { searchApi } from "@/lib/api";
import { StatusBadge } from "@/components/modules/StatusBadge";
import { EmptyState } from "@/components/modules/EmptyState";
import { formatRelative } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: queries, isLoading } = useQuery({
    queryKey: ["queries"],
    queryFn: () => searchApi.list(0, 10).then((r) => r.data),
  });

  const stats = [
    { label: "Запросов всего", value: queries?.length ?? 0, icon: Search },
    { label: "Завершено", value: queries?.filter((q: { status: string }) => q.status === "completed").length ?? 0, icon: TrendingUp },
    { label: "Активных", value: queries?.filter((q: { status: string }) => q.status === "running").length ?? 0, icon: Globe },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-text-primary">
          Привет{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
          <span className="text-accent">.</span>
        </h1>
        <p className="text-text-muted mt-1">Находи площадки и управляй репутацией</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-bg-surface rounded-card border border-border p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-subtle">{s.label}</span>
              <s.icon className="w-4 h-4 text-text-subtle" />
            </div>
            <span className="font-display text-3xl font-bold text-text-primary">{isLoading ? "—" : s.value}</span>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <Link href="/dashboard/search/new">
        <motion.div
          whileHover={{ y: -2 }}
          className="flex items-center gap-4 p-5 bg-accent-muted border border-accent/20 rounded-card cursor-pointer hover:border-accent/40 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <Plus className="w-5 h-5 text-bg-primary" />
          </div>
          <div>
            <p className="font-semibold text-text-primary">Новый поиск</p>
            <p className="text-sm text-text-muted">Найти площадки для объекта</p>
          </div>
        </motion.div>
      </Link>

      {/* Recent queries */}
      <div>
        <h2 className="font-display text-lg font-semibold text-text-primary mb-4">Последние запросы</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => <div key={i} className="h-16 rounded-card shimmer-bg" />)}
          </div>
        ) : !queries?.length ? (
          <EmptyState
            title="Нет запросов"
            description="Создайте первый поиск, чтобы найти подходящие площадки"
            action={{ label: "Создать поиск", onClick: () => window.location.href = "/dashboard/search/new" }}
          />
        ) : (
          <div className="space-y-2">
            {queries.map((q: { id: string; query_text: string; status: string; created_at: string; topic?: string }, i: number) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/dashboard/search/${q.id}`}>
                  <div className="flex items-center justify-between p-4 bg-bg-surface rounded-card border border-border hover:border-[#3F3F45] transition-colors cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{q.query_text}</p>
                      {q.topic && <p className="text-xs text-text-subtle mt-0.5">{q.topic}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-subtle">{formatRelative(q.created_at)}</span>
                      <StatusBadge status={q.status as "pending" | "running" | "completed" | "failed"} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
