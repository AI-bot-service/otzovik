"use client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open, title, description, confirmLabel = "Подтвердить", cancelLabel = "Отмена",
  variant = "destructive", loading, onConfirm, onCancel,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative z-10 w-full max-w-sm bg-bg-elevated rounded-card border border-border p-6 shadow-2xl"
          >
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 p-1 rounded text-text-subtle hover:text-text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                variant === "destructive" ? "bg-[#F8717120]" : "bg-accent-muted"
              )}>
                <AlertTriangle className={cn("w-5 h-5", variant === "destructive" ? "text-negative" : "text-accent")} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-text-primary mb-1">{title}</h3>
                {description && <p className="text-sm text-text-muted">{description}</p>}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onCancel}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded text-sm font-medium bg-bg-surface border border-border text-text-muted hover:text-text-primary hover:border-[#3F3F45] transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={cn(
                  "flex-1 px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50",
                  variant === "destructive"
                    ? "bg-negative/10 border border-negative/30 text-negative hover:bg-negative/20"
                    : "bg-accent text-bg-primary hover:bg-accent-hover"
                )}
              >
                {loading ? "..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
