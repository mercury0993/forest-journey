"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import WaitingAnimation from "@/components/result/WaitingAnimation";
import ServiceCard from "@/components/result/ServiceCard";
import FullReport from "@/components/result/FullReport";
import ShareCardImage from "@/components/result/ShareCardImage";
import { calculateScores, matchTemplate } from "@/lib/mapping-engine";
import { nlpFallback } from "@/lib/nlp-fallback";
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

      const runNLP = async () => {
        let nlpResult;
        try {
          const res = await fetch("/api/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              animal1Text: `${answers.scene1.animalName} ${answers.scene1.description} ${answers.scene1.followUp1}`,
              animal2Text: `${answers.scene4.animalName} ${answers.scene4.description}`,
              animal2Feeling: answers.scene4.firstFeeling,
            }),
          });
          if (res.ok) {
            nlpResult = (await res.json()).data;
          } else {
            throw new Error("API failed");
          }
        } catch {
          nlpResult = nlpFallback(
            `${answers.scene1.animalName} ${answers.scene1.description} ${answers.scene1.followUp1}`,
            `${answers.scene4.animalName} ${answers.scene4.description}`,
            answers.scene4.firstFeeling
          );
        }

        const scores = calculateScores(answers, nlpResult);
        const match = matchTemplate(scores);

        const report: ReportData = {
          id: Date.now().toString(36),
          createdAt: new Date().toISOString(),
          answers,
          scores,
          nlp: nlpResult,
          templateIndex: match.templateIndex,
          roleTitle: match.roleTitle,
          cardTitle: match.cardTitle,
          cardInterpretation: match.cardInterpretation,
          fullReport: match.fullReport,
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
