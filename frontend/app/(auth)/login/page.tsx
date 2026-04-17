"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, Loader2 } from "lucide-react";

type Step = "email" | "otp";

export default function LoginPage() {
  const { sendOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    pasted.split("").forEach((d, i) => { next[i] = d; });
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const otpValue = otp.join("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtp(email, otpValue);
    } catch {
      setError("Неверный или устаревший код.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === "otp") setTimeout(() => otpRefs.current[0]?.focus(), 300);
  }, [step]);

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center" style={{ background: "var(--color-bg-primary)", fontFamily: "var(--font-sans)" }}>

      {/* Grain overlay */}
      <svg className="pointer-events-none fixed inset-0 w-full h-full opacity-[0.035] z-10" style={{ mixBlendMode: "overlay" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* Ambient glow top-left */}
      <div className="pointer-events-none fixed -top-32 -left-32 w-[500px] h-[500px] rounded-full" style={{
        background: "radial-gradient(circle, rgba(209,255,60,0.06) 0%, transparent 70%)"
      }} />
      {/* Ambient glow bottom-right */}
      <div className="pointer-events-none fixed -bottom-48 -right-24 w-[600px] h-[600px] rounded-full" style={{
        background: "radial-gradient(circle, rgba(209,255,60,0.04) 0%, transparent 70%)"
      }} />

      {/* Giant background wordmark */}
      <div className="pointer-events-none fixed inset-0 flex items-end justify-start pl-6 pb-4 select-none" aria-hidden>
        <span className="text-[clamp(80px,18vw,220px)] font-black leading-none tracking-tighter" style={{
          fontFamily: "var(--font-display)",
          color: "transparent",
          WebkitTextStroke: "1px rgba(255,255,255,0.04)",
          userSelect: "none",
        }}>
          OTZOVIK
        </span>
      </div>

      {/* Main content */}
      <div className="relative z-20 w-full max-w-[400px] px-6">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-baseline gap-1">
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 5vw, 36px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "var(--color-text-primary)",
            }}>
              otzovik
            </span>
            <span style={{ color: "var(--color-accent)", fontSize: "40px", lineHeight: 1, fontWeight: 800 }}>.</span>
          </div>
          <p style={{ color: "var(--color-text-subtle)", fontSize: "13px", marginTop: "4px", letterSpacing: "0.01em" }}>
            Поиск площадок для отзывов
          </p>
        </motion.div>

        {/* Form card */}
        <AnimatePresence mode="wait">
          {step === "email" ? (
            <motion.form
              key="email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              onSubmit={handleSendOtp}
            >
              <div className="mb-8">
                <h1 style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(32px, 5vw, 42px)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  color: "var(--color-text-primary)",
                }}>
                  Добро<br />пожаловать
                </h1>
                <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginTop: "10px" }}>
                  Введите email — отправим код для входа
                </p>
              </div>

              <div className="mb-3">
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-subtle)", marginBottom: "8px" }}>
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      background: "var(--color-bg-elevated)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius)",
                      color: "var(--color-text-primary)",
                      fontSize: "15px",
                      fontFamily: "var(--font-sans)",
                      outline: "none",
                      transition: "border-color 0.15s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "rgba(209,255,60,0.5)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ color: "var(--color-negative)", fontSize: "13px", marginBottom: "8px" }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading || !email}
                whileHover={{ scale: loading || !email ? 1 : 1.01 }}
                whileTap={{ scale: loading || !email ? 1 : 0.98 }}
                style={{
                  marginTop: "20px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "14px 24px",
                  background: loading || !email ? "rgba(209,255,60,0.35)" : "var(--color-accent)",
                  color: "#0A0A0B",
                  border: "none",
                  borderRadius: "var(--radius)",
                  fontSize: "14px",
                  fontWeight: 700,
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "0.02em",
                  cursor: loading || !email ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                }}
              >
                {loading ? (
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <>Получить код <ArrowRight size={16} /></>
                )}
              </motion.button>
            </motion.form>

          ) : (
            <motion.form
              key="otp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              onSubmit={handleVerify}
            >
              <div className="mb-8">
                <h1 style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(32px, 5vw, 42px)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  color: "var(--color-text-primary)",
                }}>
                  Введите<br />код
                </h1>
                <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginTop: "10px" }}>
                  Отправили на{" "}
                  <span style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                    {email}
                  </span>
                </p>
              </div>

              {/* OTP boxes */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "4px" }} onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <motion.input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{
                      flex: 1,
                      aspectRatio: "1",
                      textAlign: "center",
                      background: digit ? "rgba(209,255,60,0.08)" : "var(--color-bg-elevated)",
                      border: `1px solid ${digit ? "rgba(209,255,60,0.5)" : "var(--color-border)"}`,
                      borderRadius: "var(--radius)",
                      color: digit ? "var(--color-accent)" : "var(--color-text-primary)",
                      fontSize: "22px",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      outline: "none",
                      transition: "all 0.15s",
                      caretColor: "var(--color-accent)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(209,255,60,0.7)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(209,255,60,0.08)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = digit ? "rgba(209,255,60,0.5)" : "var(--color-border)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                ))}
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ color: "var(--color-negative)", fontSize: "13px", marginTop: "8px" }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading || otpValue.length !== 6}
                whileHover={{ scale: loading || otpValue.length !== 6 ? 1 : 1.01 }}
                whileTap={{ scale: loading || otpValue.length !== 6 ? 1 : 0.98 }}
                style={{
                  marginTop: "20px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "14px 24px",
                  background: loading || otpValue.length !== 6 ? "rgba(209,255,60,0.35)" : "var(--color-accent)",
                  color: "#0A0A0B",
                  border: "none",
                  borderRadius: "var(--radius)",
                  fontSize: "14px",
                  fontWeight: 700,
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "0.02em",
                  cursor: loading || otpValue.length !== 6 ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                }}
              >
                {loading ? (
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <>Войти <ArrowRight size={16} /></>
                )}
              </motion.button>

              <button
                type="button"
                onClick={() => { setStep("email"); setOtp(["","","","","",""]); setError(""); }}
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: "14px",
                  padding: "10px",
                  background: "none",
                  border: "none",
                  color: "var(--color-text-subtle)",
                  fontSize: "13px",
                  fontFamily: "var(--font-sans)",
                  cursor: "pointer",
                  transition: "color 0.15s",
                  textAlign: "center",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-subtle)")}
              >
                ← Изменить email
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Divider line */}
        <div style={{ marginTop: "48px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
          <span style={{ fontSize: "11px", color: "var(--color-text-subtle)", letterSpacing: "0.06em" }}>
            БЕЗОПАСНЫЙ ВХОД
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: var(--color-text-subtle); }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
