"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { WS_URL } from "@/lib/api";

interface ProgressEvent {
  query_id: string;
  status: string;
  progress: number;
  step: string;
  message: string;
}

interface Props {
  queryId: string;
  onComplete?: () => void;
  onError?: (msg: string) => void;
}

const STEPS = [
  { key: "discovery", label: "Поиск сайтов" },
  { key: "profiling", label: "Анализ профилей" },
  { key: "analysis",  label: "AI-анализ отзывов" },
  { key: "done",      label: "Сохранение результатов" },
];

export function SearchProgress({ queryId, onComplete, onError }: Props) {
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/api/v1/search/queries/${queryId}/progress`);

    ws.onmessage = (e) => {
      const data: ProgressEvent = JSON.parse(e.data);
      setEvents((prev) => [...prev, data]);
      setProgress(data.progress);
      if (data.status === "completed") { setDone(true); onComplete?.(); }
      if (data.status === "failed")    { setFailed(true); onError?.(data.message); }
    };

    return () => ws.close();
  }, [queryId]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [events]);

  const currentStep = events[events.length - 1]?.step ?? "discovery";

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">
            {done ? "Поиск завершён" : failed ? "Ошибка" : "Идёт поиск..."}
          </span>
          <span className="font-mono text-accent">{progress}%</span>
        </div>
        <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full", failed ? "bg-negative" : "bg-accent")}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-4 gap-2">
        {STEPS.map((step, i) => {
          const stepIdx = STEPS.findIndex((s) => s.key === currentStep);
          const isDone = i < stepIdx || done;
          const isActive = i === stepIdx && !done && !failed;
          return (
            <div key={step.key} className={cn("flex flex-col items-center gap-1.5 text-center", i > stepIdx && !done && "opacity-30")}>
              <div className={cn(
                "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors",
                isDone && "border-positive bg-[#4ADE8020]",
                isActive && "border-accent bg-accent-muted",
                !isDone && !isActive && "border-border",
              )}>
                {isDone ? <CheckCircle className="w-4 h-4 text-positive" /> :
                 isActive ? <Loader2 className="w-4 h-4 text-accent animate-spin" /> :
                 <span className="text-xs text-text-subtle font-mono">{i + 1}</span>}
              </div>
              <span className={cn("text-xs", isActive ? "text-text-primary" : "text-text-subtle")}>{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Log */}
      <div ref={logRef} className="h-40 overflow-y-auto space-y-1 bg-bg-elevated rounded-card p-3 font-mono text-xs">
        <AnimatePresence>
          {events.map((ev, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex items-start gap-2",
                ev.status === "failed" ? "text-negative" :
                ev.status === "completed" ? "text-positive" :
                "text-text-muted"
              )}
            >
              <span className="text-text-subtle flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
              <span>{ev.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {!done && !failed && (
          <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="text-accent">▊</motion.span>
        )}
      </div>

      {/* Final state */}
      {done && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 p-3 rounded-card bg-[#4ADE8015] border border-[#4ADE8030]">
          <CheckCircle className="w-4 h-4 text-positive" />
          <span className="text-sm text-positive">Поиск завершён успешно</span>
        </motion.div>
      )}
      {failed && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 p-3 rounded-card bg-[#F8717115] border border-[#F8717130]">
          <XCircle className="w-4 h-4 text-negative" />
          <span className="text-sm text-negative">Ошибка при выполнении поиска</span>
        </motion.div>
      )}
    </div>
  );
}
