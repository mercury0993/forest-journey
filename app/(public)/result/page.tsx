"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import WaitingAnimation from "@/components/result/WaitingAnimation";
import ServiceCard from "@/components/result/ServiceCard";
import FullReport from "@/components/result/FullReport";
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
          isPaid: false,
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
    const updated = { ...reportData, isPaid: true };
    setReportData(updated);
    saveReport(updated);
    setStage("report");
  };

  const handleSave = () => {
    if (reportData && !reportData.isPaid) {
      saveReport({ ...reportData, isPaid: true });
    }
  };

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
          {!user && !syncedToCloud && (
            <div className="mt-6">
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
        <FullReport
          report={reportData.fullReport}
          scores={reportData.scores}
          roleTitle={reportData.roleTitle}
          onSave={handleSave}
        />
      )}
    </main>
  );
}
