"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Shield, Users, TrendingUp, XCircle } from "lucide-react";
import { adminApi } from "@/lib/api";
import { DataTable } from "@/components/modules/DataTable";
import { StatusBadge } from "@/components/modules/StatusBadge";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { formatDate } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => {
    if (user && user.role !== "admin") router.push("/dashboard");
  }, [user, router]);

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminApi.users().then((r) => r.data),
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.stats().then((r) => r.data),
  });

  const toggleActive = useMutation({
    mutationFn: (u: User) => adminApi.updateUser(u.id, { is_active: !u.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const statCards = [
    { label: "Пользователей", value: stats?.users ?? "—", icon: Users },
    { label: "Запросов", value: stats?.queries_total ?? "—", icon: TrendingUp },
    { label: "Завершено", value: stats?.queries_completed ?? "—", icon: Shield },
    { label: "Ошибок", value: stats?.queries_failed ?? "—", icon: XCircle },
  ];

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-text-primary">
          Админка<span className="text-accent">.</span>
        </h1>
        <p className="text-text-muted mt-1">Управление пользователями и мониторинг системы</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-bg-surface rounded-card border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-subtle">{s.label}</span>
              <s.icon className="w-3.5 h-3.5 text-text-subtle" />
            </div>
            <span className="font-display text-2xl font-bold text-text-primary">{s.value}</span>
          </motion.div>
        ))}
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-text-primary mb-4">Пользователи</h2>
        <DataTable<User>
          data={users}
          keyField="id"
          loading={usersLoading}
          emptyMessage="Нет пользователей"
          columns={[
            { key: "email", header: "Email", sortable: true, render: (u) => <span className="font-mono text-xs">{u.email}</span> },
            { key: "full_name", header: "Имя", render: (u) => u.full_name ?? <span className="text-text-subtle">—</span> },
            { key: "role", header: "Роль", render: (u) => (
              <span className={u.role === "admin" ? "text-accent text-xs font-medium" : "text-text-muted text-xs"}>{u.role}</span>
            )},
            { key: "is_active", header: "Статус", render: (u) => (
              <StatusBadge status={u.is_active ? "completed" : "failed"} />
            )},
            { key: "created_at", header: "Создан", sortable: true, render: (u) => (
              <span className="text-xs text-text-muted">{formatDate(u.created_at)}</span>
            )},
          ]}
          actions={[{
            icon: <XCircle className="w-4 h-4" />,
            label: "Заблокировать / разблокировать",
            variant: "destructive",
            onClick: (u) => toggleActive.mutate(u),
          }]}
        />
      </div>
    </div>
  );
}
