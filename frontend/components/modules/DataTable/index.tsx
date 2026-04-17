"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DataTableProps, ColDef } from "./DataTable.types";

function getValue<T>(row: T, key: keyof T | string): unknown {
  return (row as Record<string, unknown>)[key as string];
}

export function DataTable<T>({ data, columns, actions, keyField, loading, emptyMessage, pagination, onRowClick }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (col: ColDef<T>) => {
    if (!col.sortable) return;
    if (sortKey === String(col.key)) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(String(col.key));
      setSortDir("asc");
    }
  };

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const av = getValue(a, sortKey);
    const bv = getValue(b, sortKey);
    const cmp = String(av).localeCompare(String(bv), "ru", { numeric: true });
    return sortDir === "asc" ? cmp : -cmp;
  });

  const SortIcon = ({ col }: { col: ColDef<T> }) => {
    if (!col.sortable) return null;
    if (sortKey !== String(col.key)) return <ChevronsUpDown className="w-3 h-3 text-text-subtle" />;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-accent" /> : <ChevronDown className="w-3 h-3 text-accent" />;
  };

  return (
    <div className="w-full overflow-hidden rounded-card border border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-elevated">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-medium text-text-muted",
                    col.sortable && "cursor-pointer hover:text-text-primary select-none",
                    col.width
                  )}
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    <SortIcon col={col} />
                  </div>
                </th>
              ))}
              {actions && actions.length > 0 && <th className="px-4 py-3 w-24" />}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3">
                      <div className="h-4 rounded shimmer-bg" />
                    </td>
                  ))}
                  {actions && <td className="px-4 py-3" />}
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12 text-center text-text-subtle">
                  {emptyMessage ?? "Нет данных"}
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {sorted.map((row) => (
                  <motion.tr
                    key={String(getValue(row, keyField))}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "border-b border-border last:border-0 transition-colors",
                      onRowClick && "cursor-pointer hover:bg-bg-elevated"
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => (
                      <td key={String(col.key)} className="px-4 py-3 text-text-primary">
                        {col.render ? col.render(row) : String(getValue(row, col.key) ?? "—")}
                      </td>
                    ))}
                    {actions && actions.length > 0 && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {actions
                            .filter((a) => !a.hidden?.(row))
                            .map((action, ai) => (
                              <button
                                key={ai}
                                title={action.label}
                                onClick={(e) => { e.stopPropagation(); action.onClick(row); }}
                                className={cn(
                                  "p-1.5 rounded transition-colors",
                                  action.variant === "destructive"
                                    ? "text-text-subtle hover:text-negative hover:bg-[#F8717115]"
                                    : "text-text-subtle hover:text-text-primary hover:bg-bg-elevated"
                                )}
                              >
                                {action.icon}
                              </button>
                            ))}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-bg-elevated">
          <span className="text-xs text-text-muted">
            {pagination.total} записей · стр. {pagination.page + 1} из {Math.ceil(pagination.total / pagination.pageSize)}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={pagination.page === 0}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              className="p-1.5 rounded hover:bg-bg-primary disabled:opacity-30 disabled:cursor-not-allowed text-text-muted hover:text-text-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={(pagination.page + 1) * pagination.pageSize >= pagination.total}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              className="p-1.5 rounded hover:bg-bg-primary disabled:opacity-30 disabled:cursor-not-allowed text-text-muted hover:text-text-primary transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
