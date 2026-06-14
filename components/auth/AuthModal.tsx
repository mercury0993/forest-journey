"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";

export default function AuthModal() {
  const { authModalOpen, authModalMode, closeAuthModal, openAuthModal } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleGoogleLogin = async () => {
    setError("");
    setSubmitting(true);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/profile`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const supabase = createClient();

    if (authModalMode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        const msg = signUpError.message.includes("already registered")
          ? "该邮箱已注册，请直接登录"
          : signUpError.message;
        setError(msg);
        setSubmitting(false);
        return;
      }
      closeAuthModal();
      setEmail("");
      setPassword("");
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError("邮箱或密码错误");
        setSubmitting(false);
        return;
      }
      closeAuthModal();
      setEmail("");
      setPassword("");
    }

    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/70" onClick={closeAuthModal} />

        <motion.div
          className="relative z-10 w-full max-w-sm bg-[#0d1f14] border border-green-800/40 rounded-2xl p-6 shadow-2xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          <h2 className="text-xl font-bold text-green-100 text-center mb-6">
            {authModalMode === "signup" ? "注册保存你的报告" : "登录查看历史报告"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="邮箱"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 transition-colors"
            />
            <input
              type="password"
              placeholder="密码"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 transition-colors"
            />

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-green-700 to-green-600 text-white font-medium disabled:opacity-50 transition-opacity"
            >
              {submitting ? "处理中..." : authModalMode === "signup" ? "注册并保存" : "登录"}
            </button>
          </form>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30">或</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={submitting}
            className="mt-4 w-full py-2.5 rounded-full bg-white text-gray-800 font-medium flex items-center justify-center gap-2 hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google 登录
          </button>

          <div className="mt-4 text-center text-sm text-white/40">
            {authModalMode === "signup" ? (
              <p>
                已有账号？{" "}
                <button
                  onClick={() => openAuthModal("login")}
                  className="text-green-400 hover:text-green-300 transition-colors"
                >
                  去登录
                </button>
              </p>
            ) : (
              <p>
                还没有账号？{" "}
                <button
                  onClick={() => openAuthModal("signup")}
                  className="text-green-400 hover:text-green-300 transition-colors"
                >
                  注册
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
