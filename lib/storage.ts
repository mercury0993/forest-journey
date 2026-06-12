import { AssessmentAnswers, ReportData } from "./types";

const KEYS = {
  currentAssessment: "fj_current_assessment",
  latestAnswers: "fj_latest_answers",
  reports: "fj_reports",
  audioOn: "fj_audio_on",
} as const;

const MAX_REPORTS = 5;

export function saveCurrentAssessment(answers: AssessmentAnswers): void {
  try {
    localStorage.setItem(KEYS.currentAssessment, JSON.stringify(answers));
  } catch { /* storage full, silently ignore */ }
}

export function loadCurrentAssessment(): AssessmentAnswers | null {
  try {
    const raw = localStorage.getItem(KEYS.currentAssessment);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearCurrentAssessment(): void {
  localStorage.removeItem(KEYS.currentAssessment);
}

export function saveLatestAnswers(answers: AssessmentAnswers & { scene4: Record<string, unknown> }): void {
  try {
    localStorage.setItem(KEYS.latestAnswers, JSON.stringify(answers));
  } catch { /* storage full, silently ignore */ }
}

export function loadLatestAnswers(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(KEYS.latestAnswers);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearLatestAnswers(): void {
  localStorage.removeItem(KEYS.latestAnswers);
}

export function getReports(): ReportData[] {
  try {
    const raw = localStorage.getItem(KEYS.reports);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveReport(report: ReportData): void {
  const reports = getReports();
  reports.unshift(report);
  const trimmed = reports.slice(0, MAX_REPORTS);
  try {
    localStorage.setItem(KEYS.reports, JSON.stringify(trimmed));
  } catch {
    if (trimmed.length > 1) {
      localStorage.setItem(KEYS.reports, JSON.stringify(trimmed.slice(0, -1)));
    }
  }
}

export function getReportById(id: string): ReportData | undefined {
  return getReports().find((r) => r.id === id);
}
