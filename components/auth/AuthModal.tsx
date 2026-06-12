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
