"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import Link from "next/link";

const sidebarItems = [
  { href: "/admin", label: "数据仪表盘", icon: "📊" },
  { href: "/admin/invite-codes", label: "测评码管理", icon: "🎫" },
  { href: "/admin/team-dashboard", label: "团队看板", icon: "👥" },
  { href: "/admin/role-models", label: "岗位模型", icon: "🎯" },
  { href: "/admin/export", label: "报告导出", icon: "📤" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, signOut } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (!isAdmin) {
      router.replace("/");
    }
  }, [user, isAdmin, loading, router]);

  if (loading) return null;
  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#0a1210] text-white flex">
      <aside className="w-[200px] min-h-screen bg-[#061208] border-r border-white/5 flex flex-col">
        <div className="p-5 border-b border-white/5">
          <h1 className="text-sm font-bold text-green-300 tracking-wide">森林之旅 · 管理</h1>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-green-900/30 text-green-300 border border-green-800/30"
                    : "text-white/50 hover:text-white/80 hover:bg-white/[0.03]"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/30 hover:text-white/50 text-xs transition-colors"
          >
            ← 返回首页
          </Link>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/30 hover:text-red-400 text-xs transition-colors"
          >
            退出登录
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-6">
          <h2 className="text-sm text-white/60 font-medium">
            {sidebarItems.find((i) => i.href === pathname)?.label || "后台管理"}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/30">{user.email}</span>
          </div>
        </header>

        <main className="flex-1 p-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
