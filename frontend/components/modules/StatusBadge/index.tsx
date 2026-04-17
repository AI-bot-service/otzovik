"use client";
import { cn } from "@/lib/utils";

export type Status = "pending" | "running" | "completed" | "failed";

const config: Record<Status, { label: string; dot: string; bg: string; text: string }> = {
  pending:   { label: "Ожидает",    dot: "bg-[#8A8A94]", bg: "bg-[#8A8A9420]", text: "text-[#8A8A94]" },
  running:   { label: "Выполняется", dot: "bg-[#FBBF24] animate-pulse", bg: "bg-[#FBBF2420]", text: "text-[#FBBF24]" },
  completed: { label: "Завершён",   dot: "bg-positive",  bg: "bg-[#4ADE8020]", text: "text-positive" },
  failed:    { label: "Ошибка",     dot: "bg-negative",  bg: "bg-[#F8717120]", text: "text-negative" },
};

interface Props {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: Props) {
  const c = config[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", c.bg, c.text, className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}
