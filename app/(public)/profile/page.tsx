"use client";

import HistoryList from "@/components/profile/HistoryList";

export default function ProfilePage() {
  return (
    <main className="min-h-screen px-6 pt-12 pb-24 max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
          🌿
        </div>
        <div>
          <h1 className="text-white/70 font-medium">未登录</h1>
          <p className="text-white/20 text-xs mt-0.5">注册以永久保存报告</p>
        </div>
      </div>

      <HistoryList />
    </main>
  );
}
