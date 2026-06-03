"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import HistoryList from "@/components/profile/HistoryList";

interface CloudReport {
  id: string;
  roleTitle: string;
  fullReport: Record<string, unknown>;
  dimensions: Record<string, number>;
  isPaid: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, loading, openAuthModal, signOut } = useUser();
  const [cloudReports, setCloudReports] = useState<CloudReport[]>([]);
  const [cloudLoading, setCloudLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    setCloudLoading(true);
    fetch("/api/reports/sync")
      .then((res) => res.json())
      .then((data) => {
        if (data.reports) {
          setCloudReports(data.reports);
        }
      })
      .catch(() => {})
      .finally(() => setCloudLoading(false));
  }, [user]);

  return (
    <main className="min-h-screen px-6 pt-12 pb-24 max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
          {user ? "🌲" : "🌿"}
        </div>
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="text-white/30 text-sm">加载中...</div>
          ) : user ? (
            <>
              <h1 className="text-white/80 font-medium truncate">{user.email}</h1>
              <button
                onClick={() => signOut()}
                className="text-white/30 text-xs mt-0.5 hover:text-white/50 transition-colors"
              >
                退出登录
              </button>
            </>
          ) : (
            <>
              <h1 className="text-white/70 font-medium">未登录</h1>
              <button
                onClick={() => openAuthModal("login")}
                className="text-green-400/60 text-xs mt-0.5 hover:text-green-400 transition-colors"
              >
                登录以查看云端报告
              </button>
            </>
          )}
        </div>
      </div>

      <HistoryList cloudReports={cloudReports} cloudLoading={cloudLoading} />
    </main>
  );
}
