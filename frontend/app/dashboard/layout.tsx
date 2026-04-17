"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Search, LayoutDashboard, Globe, LogOut, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard",               label: "Обзор",   icon: LayoutDashboard },
  { href: "/dashboard/search/new",    label: "Поиск",   icon: Search },
  { href: "/dashboard/sites",         label: "Каталог", icon: Globe },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      <aside className="w-56 flex-shrink-0 flex flex-col border-r border-border bg-bg-surface">
        <div className="px-5 py-5 border-b border-border">
          <span className="font-display text-lg font-bold tracking-tight">
            otzovik<span className="text-accent">.</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
                    active
                      ? "bg-accent-muted text-accent"
                      : "text-text-muted hover:text-text-primary hover:bg-bg-elevated"
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </motion.div>
              </Link>
            );
          })}

          {user.role === "admin" && (
            <Link href="/dashboard/admin">
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
                  pathname.startsWith("/dashboard/admin")
                    ? "bg-accent-muted text-accent"
                    : "text-text-muted hover:text-text-primary hover:bg-bg-elevated"
                )}
              >
                <Shield className="w-4 h-4 flex-shrink-0" />
                Админка
              </motion.div>
            </Link>
          )}
        </nav>

        <div className="px-3 py-4 border-t border-border space-y-1">
          <div className="px-3 py-2 text-xs text-text-subtle font-mono truncate">{user.email}</div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-text-muted hover:text-negative hover:bg-[#F8717110] transition-colors"
          >
            <LogOut className="w-4 h-4" /> Выйти
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
