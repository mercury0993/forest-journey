"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";

const navItems = [
  { href: "/", label: "探索", icon: "🗺️" },
  { href: "#", label: "发现", icon: "🧭", disabled: true },
  { href: "/profile", label: "我的", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { isAdmin } = useUser();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center py-3 px-4 bg-black/80 backdrop-blur-md border-t border-white/5">
      {isAdmin && (
        <Link
          href="/admin"
          className={`flex flex-col items-center gap-1 transition-colors ${pathname.startsWith("/admin") ? "text-amber-400" : "text-white/50 hover:text-white/70"}`}
        >
          <span className="text-lg">⚙️</span>
          <span className="text-[10px]">管理</span>
        </Link>
      )}
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        if (item.disabled) {
          return (
            <div key={item.label} className="flex flex-col items-center gap-1 opacity-30 cursor-not-allowed">
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] text-white/30">{item.label}</span>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-colors ${isActive ? "text-green-400" : "text-white/50 hover:text-white/70"}`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
