"use client";
import { motion } from "framer-motion";
import { ExternalLink, Shield, ShieldOff, Mail, MessageSquare } from "lucide-react";
import { SentimentBar } from "@/components/modules/SentimentBar";
import { cn, formatRelative, scoreToColor } from "@/lib/utils";

export interface SiteCardData {
  id: string;
  site: {
    domain: string;
    url: string;
    title?: string | null;
    description?: string | null;
    site_type: string;
    registration_methods: string[];
    has_antibot: boolean;
    antibot_type?: string | null;
  };
  description?: string | null;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  reviews_total: number;
  latest_review_date?: string | null;
  activity_score: number;
  relevance_score: number;
}

interface Props {
  data: SiteCardData;
  index?: number;
  onClick?: () => void;
}

const siteTypeLabel: Record<string, string> = {
  review_platform: "Отзовик",
  forum: "Форум",
  marketplace: "Маркетплейс",
  blog: "Блог",
  other: "Сайт",
};

const regMethodIcons: Record<string, string> = {
  google: "G",
  vk: "VK",
  yandex: "Я",
  facebook: "f",
  email: "@",
  phone: "☏",
};

export function SiteCard({ data, index = 0, onClick }: Props) {
  const relevancePct = Math.round(data.relevance_score * 100);
  const scoreClass = scoreToColor(data.relevance_score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        "group relative bg-bg-surface rounded-card p-5 cursor-pointer",
        "border border-border transition-all duration-base",
        "hover:border-[#3F3F45] hover:shadow-card-hover"
      )}
    >
      {/* Relevance indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        <span className={cn("font-mono text-sm font-semibold", scoreClass)}>
          {relevancePct}%
        </span>
        <span className="text-xs text-text-subtle">релевантность</span>
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 mb-4 pr-20">
        <div className="w-8 h-8 rounded bg-bg-elevated flex items-center justify-center text-xs font-mono text-text-muted flex-shrink-0">
          {data.site.domain.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-text-primary font-medium truncate">{data.site.domain}</span>
            <a
              href={data.site.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-text-subtle hover:text-accent transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-text-subtle">{siteTypeLabel[data.site.site_type] ?? "Сайт"}</span>
            {data.latest_review_date && (
              <span className="text-xs text-text-subtle">· {formatRelative(data.latest_review_date)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {data.description && (
        <p className="text-sm text-text-muted mb-4 line-clamp-2">{data.description}</p>
      )}

      {/* Sentiment */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-subtle">{data.reviews_total} отзывов</span>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-positive">+{data.positive_count}</span>
            <span className="text-text-subtle">/</span>
            <span className="text-negative">-{data.negative_count}</span>
          </div>
        </div>
        <SentimentBar
          positive={data.positive_count}
          negative={data.negative_count}
          neutral={data.neutral_count}
          showLabels={false}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {data.site.registration_methods.slice(0, 4).map((m) => (
            <span
              key={m}
              className="px-1.5 py-0.5 rounded bg-bg-elevated text-xs font-mono text-text-muted border border-border"
            >
              {regMethodIcons[m] ?? m}
            </span>
          ))}
          {data.site.registration_methods.length === 0 && (
            <span className="text-xs text-text-subtle">регистрация неизвестна</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {data.site.has_antibot ? (
            <span className="flex items-center gap-1 text-xs text-[#FBBF24]">
              <Shield className="w-3 h-3" />
              {data.site.antibot_type ?? "антибот"}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-positive">
              <ShieldOff className="w-3 h-3" />
              свободный
            </span>
          )}
        </div>
      </div>

      {/* Activity indicator */}
      {data.activity_score > 60 && (
        <div className="absolute bottom-4 right-4">
          <span className="flex items-center gap-1 text-xs text-accent">
            <MessageSquare className="w-3 h-3" />
            активный
          </span>
        </div>
      )}
    </motion.div>
  );
}
