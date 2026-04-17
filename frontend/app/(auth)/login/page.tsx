"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, Mail, KeyRound, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "email" | "otp";

export default function LoginPage() {
  const { sendOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendOtp(email);
      setStep("otp");
    } catch {
      setError("Не удалось отправить код. Проверьте email.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtp(email, otp);
    } catch {
      setError("Неверный или устаревший код.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg-primary">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm"
      >
        {/* Logo */}
        <div className="mb-10 text-center">
          <span className="font-display text-3xl font-bold text-text-primary tracking-tight">
            otzovik<span className="text-accent">.</span>
          </span>
          <p className="text-sm text-text-muted mt-2">Поиск площадок для отзывов</p>
        </div>

        <div className="bg-bg-surface rounded-card border border-border p-8">
          <AnimatePresence mode="wait">
            {step === "email" ? (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSendOtp}
                className="space-y-5"
              >
                <div>
                  <h2 className="font-display text-xl font-semibold text-text-primary mb-1">Войти</h2>
                  <p className="text-sm text-text-muted">Мы отправим код подтверждения на ваш email</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-text-muted font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                      className="w-full pl-9 pr-4 py-2.5 bg-bg-elevated border border-border rounded text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-accent/50 transition-colors"
                    />
                  </div>
                </div>

                {error && <p className="text-xs text-negative">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent text-bg-primary rounded text-sm font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Получить код <ArrowRight className="w-4 h-4" /></>}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleVerify}
                className="space-y-5"
              >
                <div>
                  <h2 className="font-display text-xl font-semibold text-text-primary mb-1">Введите код</h2>
                  <p className="text-sm text-text-muted">
                    Код отправлен на <span className="text-text-primary font-mono">{email}</span>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-text-muted font-medium">Код из письма</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                      placeholder="000000"
                      maxLength={6}
                      className="w-full pl-9 pr-4 py-2.5 bg-bg-elevated border border-border rounded text-sm font-mono text-text-primary placeholder-text-subtle focus:outline-none focus:border-accent/50 tracking-[0.5em] transition-colors"
                    />
                  </div>
                </div>

                {error && <p className="text-xs text-negative">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent text-bg-primary rounded text-sm font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Войти <ArrowRight className="w-4 h-4" /></>}
                </button>

                <button type="button" onClick={() => { setStep("email"); setOtp(""); setError(""); }}
                  className="w-full text-xs text-text-subtle hover:text-text-muted transition-colors">
                  ← Изменить email
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
