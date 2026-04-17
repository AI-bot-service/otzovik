"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex flex-col items-center justify-center py-16 px-8 text-center", className)}
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center mb-6 text-text-subtle">
          {icon}
        </div>
      )}
      {!icon && (
        <div className="w-16 h-16 mb-6 opacity-20">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="8" width="48" height="48" rx="8" stroke="#D1FF3C" strokeWidth="2" strokeDasharray="4 4"/>
            <circle cx="32" cy="28" r="8" stroke="#D1FF3C" strokeWidth="2"/>
            <path d="M20 48c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#D1FF3C" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      )}
      <h3 className="font-display font-semibold text-text-primary text-lg mb-2">{title}</h3>
      {description && <p className="text-sm text-text-muted max-w-xs mb-6">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2.5 rounded bg-accent text-bg-primary text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
