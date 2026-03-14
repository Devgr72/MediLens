"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getHistory, AIHistoryRecord } from "@/components/api/assessment";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Calendar, ChevronRight, Activity, AlertTriangle, Shield, CheckCircle2, Clock, Trash2, X, History } from "lucide-react";
import { createPortal } from "react-dom";
import ResultsView from "@/components/ResultsView";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
    const router = useRouter();
    const [history, setHistory] = useState<AIHistoryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [severityFilter, setSeverityFilter] = useState("all");
    const [riskFilter, setRiskFilter] = useState("all");

    const [selectedReport, setSelectedReport] = useState<AIHistoryRecord | null>(null);

    useEffect(() => {
        async function fetchHistory() {
            const token = localStorage.getItem("medilens_token");
            if (!token) {
                setLoading(false);
                return;
            }
            const data = await getHistory();
            setHistory(data);
            setLoading(false);
        }
        fetchHistory();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getRiskColor = (risk: string) => {
        const r = (risk || "").toUpperCase();
        if (r.includes("HIGH") || r.includes("EMERGENCY")) return "bg-red-100 text-red-700 ring-red-200";
        if (r.includes("MODERATE") || r.includes("URGENT")) return "bg-orange-100 text-orange-700 ring-orange-200";
        if (r.includes("LOW") || r.includes("NON")) return "bg-emerald-100 text-emerald-700 ring-emerald-200";
        return "bg-blue-100 text-blue-700 ring-blue-200";
    };

    const filteredHistory = history.filter((item) => {
        // 1. Search Query
        const searchMatch =
            item.result.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.result.suspected_condition.toLowerCase().includes(searchQuery.toLowerCase());

        // 2. Risk Level Filter
        let riskMatch = true;
        if (riskFilter !== "all") {
            const risk = item.result.risk_level.toLowerCase();
            riskMatch = risk.includes(riskFilter.toLowerCase());
        }

        // 3. Severity Filter
        let severityMatch = true;
        if (severityFilter !== "all") {
            const score = item.result.severity_score;
            if (severityFilter === "low" && score > 3) severityMatch = false;
            if (severityFilter === "medium" && (score <= 3 || score > 6)) severityMatch = false;
            if (severityFilter === "high" && score <= 6) severityMatch = false;
        }

        return searchMatch && riskMatch && severityMatch;
    });

    return (
        <main className="min-h-screen bg-zinc-50 flex flex-col">
            <Navbar />

            <div className="flex-1 mx-auto w-full max-w-5xl px-6 py-12">
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-[#074185] tracking-tight">Assessment History</h1>
                    <p className="mt-2 font-medium text-zinc-500">View and filter your past AI symptom analyses.</p>
                </div>

                {/* Filters and Search */}
                <div className="mb-8 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search assessments by symptoms or condition..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-12 pr-4 text-sm font-semibold text-zinc-700 outline-none transition-all focus:border-[#074185] focus:ring-4 focus:ring-[#074185]/10 shadow-sm"
                        />
                    </div>

                    <div className="flex gap-4">
                        <select
                            value={severityFilter}
                            onChange={(e) => setSeverityFilter(e.target.value)}
                            className="rounded-2xl border border-zinc-200 bg-white py-3 px-4 text-sm font-semibold text-zinc-600 outline-none transition-all focus:border-[#074185] focus:ring-4 focus:ring-[#074185]/10 shadow-sm appearance-none cursor-pointer"
                        >
                            <option value="all">Severity Score</option>
                            <option value="low">Low (1-3)</option>
                            <option value="medium">Moderate (4-6)</option>
                            <option value="high">High (7-10)</option>
                        </select>

                        <select
                            value={riskFilter}
                            onChange={(e) => setRiskFilter(e.target.value)}
                            className="rounded-2xl border border-zinc-200 bg-white py-3 px-4 text-sm font-semibold text-zinc-600 outline-none transition-all focus:border-[#074185] focus:ring-4 focus:ring-[#074185]/10 shadow-sm appearance-none cursor-pointer"
                        >
                            <option value="all">Risk Level</option>
                            <option value="low">Low Risk</option>
                            <option value="moderate">Moderate Risk</option>
                            <option value="high">High Risk</option>
                        </select>
                    </div>
                </div>

                {/* List */}
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-[#074185]"></div>
                    </div>
                ) : history.length === 0 ? (
                    <div className="mt-12 flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-zinc-200 bg-white p-12 text-center">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-[#074185]">
                            <History size={32} />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-zinc-900">No History Found</h3>
                        <p className="mb-8 max-w-md text-sm font-medium text-zinc-500 leading-relaxed">
                            You haven't completed any symptom assessments yet. Start a new assessment to get an AI-powered analysis of your symptoms.
                        </p>
                        <button
                            onClick={() => router.push("/assessment?new=true")}
                            className="rounded-2xl bg-[#074185] px-8 py-4 font-bold text-white shadow-xl shadow-[#074185]/20 transition-all hover:bg-[#074185]/90 hover:scale-[1.02]"
                        >
                            Start Assessment
                        </button>
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="mt-8 text-center text-zinc-500 py-12">
                        No assessments match your current filters.
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredHistory.map((item, idx) => {
                            const severityPct = Math.min(100, Math.max(0, (item.result.severity_score / 10) * 100));

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={item._id}
                                    className="rounded-[24px] border border-zinc-100 bg-white p-6 shadow-xl shadow-zinc-200/30 transition-all hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-900/5 group"
                                >
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h3 className="text-xl font-bold text-[#074185]">
                                                    {item.result.suspected_condition || "Assessment"}
                                                </h3>
                                                <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-500 flex items-center gap-1.5">
                                                    <Calendar size={12} />
                                                    {formatDate(item.created_at)}
                                                </div>
                                                <div className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getRiskColor(item.result.risk_level)}`}>
                                                    {item.result.risk_level} Risk
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2 text-sm">
                                                <span className="font-bold text-zinc-400 mt-0.5"><Activity size={16} /></span>
                                                <p className="text-zinc-600 font-medium leading-relaxed">
                                                    <span className="font-bold text-zinc-700">Summary: </span>
                                                    {item.result.summary}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4 max-w-sm">
                                                <div className="flex-1">
                                                    <div className="mb-1 flex justify-between text-xs font-bold">
                                                        <span className="text-zinc-500">Severity</span>
                                                        <span className="text-zinc-900">{item.result.severity_score}/10</span>
                                                    </div>
                                                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${severityPct > 60 ? 'bg-red-500' : severityPct > 30 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                                            style={{ width: `${severityPct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-end">
                                            <button
                                                onClick={() => setSelectedReport(item)}
                                                className="flex items-center justify-center gap-2 rounded-xl border border-[#074185]/20 bg-blue-50/50 px-6 py-3 text-sm font-bold text-[#074185] transition-all hover:bg-[#074185] hover:text-white"
                                            >
                                                View Full Report
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Footer />

            {/* Full Report Modal */}
            {selectedReport && typeof window !== "undefined" && createPortal(
                <AnimatePresence>
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-zinc-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[32px] bg-white shadow-2xl"
                        >
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="absolute right-6 top-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-500 shadow-md hover:bg-zinc-50 hover:text-zinc-900"
                            >
                                <X size={20} />
                            </button>

                            {/* Reuse ResultsView, adapt slightly for strict types if needed, or pass the payload. 
                  ResultsView expects AssessmentResponse but AIHistoryPayload is very similar. */}
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent z-40 hidden" />
                            <div className="mt-8">
                                <ResultsView
                                    data={{
                                        ...selectedReport.result,
                                        assessment_id: selectedReport._id,
                                        potential_causes: selectedReport.result.potential_causes.map(name => ({ name, confidence: 1 }))
                                    } as any}
                                    onReset={() => setSelectedReport(null)}
                                />
                            </div>
                        </motion.div>
                    </div>
                </AnimatePresence>,
                document.body
            )}
        </main>
    );
}
