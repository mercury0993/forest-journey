"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import WaitingAnimation from "@/components/result/WaitingAnimation";
import ServiceCard from "@/components/result/ServiceCard";
import FullReport from "@/components/result/FullReport";
import ShareCardImage from "@/components/result/ShareCardImage";
import { saveReport, loadLatestAnswers, clearLatestAnswers } from "@/lib/storage";
import { useUser } from "@/context/UserContext";
import { AssessmentAnswers, ReportData } from "@/lib/types";

type Stage = "waiting" | "card" | "report";

export default function ResultPage() {
  const router = useRouter();
  const { user, openAuthModal } = useUser();
  const [stage, setStage] = useState<Stage>("waiting");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncedToCloud, setSyncedToCloud] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const handleDownloadShareCard = useCallback(async () => {
    if (!shareRef.current) return;
    try {
      const dataUrl = await toPng(shareRef.current, {
        pixelRatio: 2,
        backgroundColor: "#061208",
      });
      const blob = await (await fetch(dataUrl)).blob();

      // showSaveFilePicker: lets user choose save location (Chrome/Edge)
      if ("showSaveFilePicker" in window) {
        const handle = await (window as { showSaveFilePicker: (opts: { suggestedName: string; types: Array<{ description: string; accept: Record<string, string[]> }> }) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
          suggestedName: "forest-journey-card.png",
          types: [{ description: "PNG Image", accept: { "image/png": [".png"] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        const link = document.createElement("a");
        link.download = "forest-journey-card.png";
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      }
    } catch {
      // Silently fail — download is a bonus feature
    }
  }, []);

  useEffect(() => {
    const raw = loadLatestAnswers();
    if (!raw) {
      router.push("/");
      return;
    }

    try {
      const answers = raw as unknown as AssessmentAnswers;

      // 前置校验：必填字段不完整则跳过 API 请求，直接降级
      const hasRequiredFields =
        typeof answers?.scene1?.animalName === "string" &&
        answers.scene1.animalName.trim().length > 0 &&
        typeof answers?.scene4?.animalName === "string" &&
        answers.scene4.animalName.trim().length > 0 &&
        answers?.scene2 &&
        answers?.scene3;

      const runNLP = async () => {
        let apiData: Record<string, unknown> | null = null;

        // 仅当必填字段完整时才发起 API 请求
        if (hasRequiredFields) {
          try {
            const res = await fetch("/api/report", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(answers),
            });
            if (res.ok) {
              apiData = (await res.json()).data;
            }
            // API 返回非 200 也走降级，不抛异常
          } catch {
            // 网络错误或超时 → 静默降级
          }
        }

        // API 未返回数据 → 使用本地降级
        if (!apiData) {
          const animal1Text = `${answers.scene1?.animalName || ""} ${answers.scene1?.description || ""} ${answers.scene1?.followUp1 || ""}`;
          const animal2Text = `${answers.scene4?.animalName || ""} ${answers.scene4?.description || ""}`;

          const { nlpFallback } = await import("@/lib/nlp-fallback");
          const { calculateScores, applyAICalibration } = await import("@/lib/mapping-engine");
          const { findArchetype } = await import("@/lib/templates");

          const fallbackNLP = nlpFallback(animal1Text, animal2Text, answers.scene4?.firstFeeling || "");
          const ruleScores = calculateScores(answers, {
            animal1Name: fallbackNLP.animal1Name,
            animal1Category: fallbackNLP.animal1Category,
            animal2Name: fallbackNLP.animal2Name,
            animal2Category: fallbackNLP.animal2Category,
            animal1Sentiment: fallbackNLP.animal1Sentiment,
            animal2Sentiment: fallbackNLP.animal2Sentiment,
          });
          const calibration = applyAICalibration(ruleScores, null);
          const archetype = findArchetype(calibration.finalScores);

          apiData = {
            nlp: fallbackNLP,
            scores: calibration.finalScores,
            calibrationTrusted: false,
            archetypeIndex: calibration.archetypeIndex,
            roleTitle: archetype.roleTitle,
            cardTitle: archetype.cardTitle,
            cardInterpretation: archetype.cardInterpretation,
            fullReport: archetype.defaultReport,
          };
        }

        const report: ReportData = {
          id: Date.now().toString(36),
          createdAt: new Date().toISOString(),
          answers,
          scores: apiData.scores as ReportData["scores"],
          nlp: apiData.nlp as ReportData["nlp"],
          templateIndex: apiData.archetypeIndex as number,
          roleTitle: apiData.roleTitle as string,
          cardTitle: apiData.cardTitle as string,
          cardInterpretation: apiData.cardInterpretation as string,
          fullReport: apiData.fullReport as ReportData["fullReport"],
          isPaid: true,
        };

        setReportData(report);
        clearLatestAnswers();
      };

      runNLP();
    } catch {
      setError(true);
    }
  }, [router]);

  // Transition to card stage when report data is ready
  useEffect(() => {
    if (reportData && stage === "waiting") {
      setStage("card");
    }
  }, [reportData, stage]);

  // When user becomes authenticated after signup, sync the report to cloud
  useEffect(() => {
    if (!user || !reportData || syncedToCloud || syncing) return;

    const syncToCloud = async () => {
      setSyncing(true);
      try {
        const res = await fetch("/api/reports/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reports: [{
              id: reportData.id,
              createdAt: reportData.createdAt,
              roleTitle: reportData.roleTitle,
              fullReport: reportData.fullReport,
              dimensions: reportData.scores,
              isPaid: reportData.isPaid,
            }],
          }),
        });
        if (res.ok) {
          setSyncedToCloud(true);
        }
      } catch {
        // Silently fail — report still in localStorage
      }
      setSyncing(false);
    };

    syncToCloud();
  }, [user, reportData, syncedToCloud, syncing]);

  const handleUnlock = () => {
    if (!reportData) return;
    setStage("report");
  };

  const handleSave = () => {};

  const handleSaveToCloud = () => {
    openAuthModal("signup");
  };

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-white/50">出了点问题，请返回重试</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center pb-20">
      {stage === "waiting" && !reportData && (
        <WaitingAnimation />
      )}

      {stage === "card" && reportData && (
        <div className="text-center">
          <ServiceCard
            animalName={reportData.answers.scene1.animalName}
            roleTitle={reportData.roleTitle}
            cardTitle={reportData.cardTitle}
            cardInterpretation={reportData.cardInterpretation}
            onUnlock={handleUnlock}
          />
          <div className="mt-6">
            <button
              onClick={handleDownloadShareCard}
              className="px-6 py-2.5 rounded-full border border-amber-500/30 text-amber-400/80 text-sm hover:bg-amber-500/10 transition-colors"
            >
              下载分享卡片
            </button>
          </div>
          {!user && !syncedToCloud && (
            <div className="mt-3">
              <button
                onClick={handleSaveToCloud}
                className="px-6 py-2.5 rounded-full border border-green-500/30 text-green-400/80 text-sm hover:bg-green-500/10 transition-colors"
              >
                {syncing ? "保存中..." : "注册以永久保存报告"}
              </button>
            </div>
          )}
          {syncedToCloud && (
            <p className="text-green-400/60 text-xs mt-2">已保存到云端</p>
          )}
        </div>
      )}

      {stage === "report" && reportData && (
        <>
          <FullReport
            report={reportData.fullReport}
            scores={reportData.scores}
            roleTitle={reportData.roleTitle}
            onSave={handleSave}
          />
          <div className="text-center mt-6">
            <button
              onClick={handleDownloadShareCard}
              className="px-6 py-2.5 rounded-full border border-amber-500/30 text-amber-400/80 text-sm hover:bg-amber-500/10 transition-colors"
            >
              下载分享卡片
            </button>
          </div>
        </>
      )}

      {/* Hidden share card for html-to-image capture */}
      <div className="fixed left-[-9999px] top-0" aria-hidden="true">
        {reportData && (
          <ShareCardImage
            ref={shareRef}
            animalName={reportData.answers.scene1.animalName}
            roleTitle={reportData.roleTitle}
            cardTitle={reportData.cardTitle}
            cardInterpretation={reportData.cardInterpretation}
          />
        )}
      </div>
    </main>
  );
}
