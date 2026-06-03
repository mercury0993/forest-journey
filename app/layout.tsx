import type { Metadata } from "next";
import { AudioProvider } from "@/context/AudioContext";
import { AssessmentProvider } from "@/context/AssessmentContext";
import ForestLayout from "@/components/layout/ForestLayout";
import BottomNav from "@/components/layout/BottomNav";
import AudioToggle from "@/components/shared/AudioToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forest Journey — 森林之旅",
  description: "一次深入心灵的森林探索，发现你的服务者原型",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <AudioProvider>
          <AssessmentProvider>
            <ForestLayout>
              {children}
              <AudioToggle />
              <BottomNav />
            </ForestLayout>
          </AssessmentProvider>
        </AudioProvider>
      </body>
    </html>
  );
}
