"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  positive: number;
  negative: number;
  neutral: number;
  showLabels?: boolean;
  className?: string;
}

export function SentimentBar({ positive, negative, neutral, showLabels = true, className }: Props) {
  const total = positive + negative + neutral;
  if (total === 0) return <div className={cn("h-2 rounded-full bg-bg-elevated", className)} />;

  const pct = (n: number) => Math.round((n / total) * 100);
  const pp = pct(positive);
  const np = pct(negative);
  const neuP = 100 - pp - np;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex h-2 w-full overflow-hidden rounded-full gap-px">
        {pp > 0 && (
          <motion.div
            className="bg-positive h-full"
            style={{ width: `${pp}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${pp}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}
        {neuP > 0 && (
          <motion.div
            className="bg-neutral h-full"
            style={{ width: `${neuP}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${neuP}%` }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          />
        )}
        {np > 0 && (
          <motion.div
            className="bg-negative h-full"
            style={{ width: `${np}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${np}%` }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          />
        )}
      </div>
      {showLabels && (
        <div className="flex gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-positive" />{pp}% позитивных
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-negative" />{np}% негативных
          </span>
          {neuP > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-neutral" />{neuP}% нейтральных
            </span>
          )}
        </div>
      )}
    </div>
  );
}
