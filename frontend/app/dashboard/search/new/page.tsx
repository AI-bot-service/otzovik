"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Loader2, Search, Tag, Hash } from "lucide-react";
import { searchApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const schema = z.object({
  query_text: z.string().min(2, "Минимум 2 символа").max(500),
  topic: z.string().max(255).optional(),
  sites_requested: z.number().min(1).max(20).default(10),
});

type FormData = z.infer<typeof schema>;

export default function NewSearchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { sites_requested: 10 },
  });

  const sitesReq = watch("sites_requested");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const { data: query } = await searchApi.create(data);
      router.push(`/dashboard/search/${query.id}`);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
            Новый поиск<span className="text-accent">.</span>
          </h1>
          <p className="text-text-muted">Укажите объект — мы найдём все площадки, где его обсуждают</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" /> Объект поиска
            </label>
            <input
              {...register("query_text")}
              placeholder="например: онлайн школа EasyCode или iPhone 15 Pro"
              className="w-full px-4 py-3 bg-bg-surface border border-border rounded text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-accent/50 transition-colors"
            />
            {errors.query_text && <p className="text-xs text-negative">{errors.query_text.message}</p>}
            <p className="text-xs text-text-subtle">Можно название бренда, продукта, компании или мероприятия</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Тематика (необязательно)
            </label>
            <input
              {...register("topic")}
              placeholder="например: онлайн образование, смартфоны, рестораны..."
              className="w-full px-4 py-3 bg-bg-surface border border-border rounded text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-accent/50 transition-colors"
            />
            <p className="text-xs text-text-subtle">Помогает найти более релевантные нишевые сайты</p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium text-text-muted flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" /> Количество сайтов: <span className="text-accent font-mono ml-1">{sitesReq}</span>
            </label>
            <input
              type="range"
              min={1}
              max={20}
              {...register("sites_requested", { valueAsNumber: true })}
              className="w-full accent-[#D1FF3C]"
            />
            <div className="flex justify-between text-xs text-text-subtle">
              <span>1 — быстро</span>
              <span>20 — подробно</span>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-bg-primary rounded font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Начать поиск <ArrowRight className="w-4 h-4" /></>}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
