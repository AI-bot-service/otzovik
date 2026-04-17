"use client";
import { useState, useCallback } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FilterOption {
  key: string;
  label: string;
}

export interface SortOption {
  key: string;
  label: string;
}

interface Props {
  searchPlaceholder?: string;
  filters?: FilterOption[];
  sorts?: SortOption[];
  onSearch?: (q: string) => void;
  onFilterChange?: (active: string[]) => void;
  onSortChange?: (sort: string) => void;
  defaultSort?: string;
  className?: string;
}

export function Filters({ searchPlaceholder, filters, sorts, onSearch, onFilterChange, onSortChange, defaultSort, className }: Props) {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sort, setSort] = useState(defaultSort ?? "");

  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    onSearch?.(v);
  }, [onSearch]);

  const toggleFilter = (key: string) => {
    const next = activeFilters.includes(key) ? activeFilters.filter((f) => f !== key) : [...activeFilters, key];
    setActiveFilters(next);
    onFilterChange?.(next);
  };

  const handleSort = (key: string) => {
    setSort(key);
    onSortChange?.(key);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        {onSearch !== undefined && (
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle pointer-events-none" />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder ?? "Поиск..."}
              className="w-full pl-9 pr-4 py-2 bg-bg-surface border border-border rounded text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-[#3F3F45] transition-colors"
            />
            {search && (
              <button onClick={() => handleSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-primary">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Sort */}
        {sorts && sorts.length > 0 && (
          <div className="flex items-center gap-1 p-1 bg-bg-elevated rounded border border-border">
            <SlidersHorizontal className="w-3.5 h-3.5 text-text-subtle ml-1.5" />
            {sorts.map((s) => (
              <button
                key={s.key}
                onClick={() => handleSort(s.key)}
                className={cn(
                  "px-3 py-1 rounded text-xs font-medium transition-colors",
                  sort === s.key ? "bg-accent text-bg-primary" : "text-text-muted hover:text-text-primary"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter tags */}
      {filters && filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => toggleFilter(f.key)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                activeFilters.includes(f.key)
                  ? "bg-accent-muted border-accent/40 text-accent"
                  : "bg-transparent border-border text-text-muted hover:border-[#3F3F45] hover:text-text-primary"
              )}
            >
              {f.label}
            </button>
          ))}
          <AnimatePresence>
            {activeFilters.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => { setActiveFilters([]); onFilterChange?.([]); }}
                className="px-3 py-1 rounded-full text-xs text-text-subtle hover:text-negative transition-colors"
              >
                <X className="w-3 h-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
