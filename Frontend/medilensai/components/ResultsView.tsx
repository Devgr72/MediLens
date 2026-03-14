"use client";

import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  Activity, 
  Stethoscope, 
  ClipboardList, 
  Phone, 
  Save,
  Home,
  ChevronRight,
  ShieldAlert,
  Info,
  Eye,
  Heart,
  Clock,
  User
} from "lucide-react";
import { AssessmentResponse } from "./api/assessment";
import { cn } from "@/lib/utils";

interface ResultsViewProps {
  data: AssessmentResponse;
  onReset: () => void;
}

export default function ResultsView({ data, onReset }: ResultsViewProps) {
  const getRiskColor = (risk: string) => {
    const r = (risk || "").toUpperCase().replace(/_/g, " ");
    if (r.includes("EMERGENCY") || r.includes("EMERGENT")) return "bg-red-600";
    if (r.includes("URGENT") && !r.includes("LESS")) return "bg-orange-600";
    if (r.includes("LESS")) return "bg-yellow-500";
    if (r.includes("NON")) return "bg-emerald-600";
    return "bg-[#074185]";
  };

  const getSeverityTextColor = (score: number) => {
    if (score <= 2) return "text-emerald-500";
    if (score <= 4) return "text-yellow-500";
    if (score <= 6) return "text-orange-500";
    return "text-red-500";
  };

  // severity_score is 0–10
  const severityPct = Math.min(100, Math.max(0, ((data.severity_score ?? 0) / 10) * 100));

  const riskBg = getRiskColor(data.risk_level);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Risk Banner */}
      <div className={cn("relative overflow-hidden pt-12 pb-24 text-white", riskBg)}>
        <div className="absolute inset-0 bg-black/10 opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-from),_transparent_50%)] from-white/20" />
        
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-6">
            <button onClick={onReset} className="rounded-xl bg-white/20 p-2 text-white hover:bg-white/30 transition-all">
              <Home size={20} />
            </button>
            <div className="h-px w-8 bg-white/30" />
            <div className="flex items-center gap-2 text-sm font-bold opacity-80 uppercase tracking-widest">
              Real-time Analysis Complete
            </div>
          </div>

          <div className="mt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md ring-1 ring-white/30">
                <AlertTriangle size={40} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest opacity-80">Risk Level</h3>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
                  {(data.risk_level || "UNKNOWN").replace(/_/g, " ")}
                </h1>
                <p className="mt-2 text-base font-bold opacity-90">{data.triage_advice}</p>
                <p className="mt-1 text-sm opacity-70">{data.triage_level}</p>
              </div>
            </div>
            
            <button className="flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-4 text-sm font-bold backdrop-blur-md ring-1 ring-white/30 hover:bg-white/20 transition-all">
              <Save size={20} />
              Save History
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-16 max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Severity Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-[32px] bg-white p-8 shadow-xl shadow-zinc-200/50"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#074185]">
                    <Activity size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-[#074185]">Severity Score</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-zinc-400 mr-2 uppercase tracking-wide">Score</span>
                  <span className={cn("text-4xl font-black", getSeverityTextColor(data.severity_score ?? 0))}>
                    {data.severity_score ?? "N/A"}
                  </span>
                  <span className="text-lg font-bold text-zinc-300">/10</span>
                </div>
              </div>
              
              <div className="h-4 w-full overflow-hidden rounded-full bg-zinc-100">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${severityPct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={cn("h-full", riskBg)}
                />
              </div>

              {/* Suspected Condition */}
              {data.suspected_condition && (
                <div className="mt-6 rounded-2xl bg-[#074185]/5 p-5 ring-1 ring-[#074185]/10">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#074185] opacity-70">
                    <Stethoscope size={14} /> Suspected Condition
                  </div>
                  <p className="font-bold text-[#074185]">{data.suspected_condition}</p>
                </div>
              )}

              {/* Potential Causes */}
              {data.potential_causes && data.potential_causes.length > 0 && (
                <div className="mt-4 rounded-2xl bg-[#074185]/5 p-5 ring-1 ring-[#074185]/10">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold text-[#074185] opacity-70">
                    <ClipboardList size={14} /> Potential Causes
                  </div>
                  <div className="space-y-2">
                    {data.potential_causes.map((cause, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                        <span className="font-bold text-[#074185]">{cause.name}</span>
                        <span className="text-xs font-black px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                          {(cause.confidence * 100).toFixed(0)}% Match
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="mt-6">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-400">
                  <ChevronRight size={16} /> Summary
                </h4>
                <p className="text-sm leading-relaxed text-zinc-600 bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                  {data.summary || "No summary provided."}
                </p>
              </div>

              {/* Reasoning */}
              {data.reasoning && (
                <div className="mt-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-400">
                    <ChevronRight size={16} /> Reasoning
                  </h4>
                  <p className="text-sm leading-relaxed text-zinc-600 bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                    {data.reasoning}
                  </p>
                </div>
              )}
            </motion.div>

            {/* First Aid & Watch For */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-[32px] bg-white p-8 shadow-xl shadow-zinc-200/50"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldAlert size={20} />
                </div>
                <h3 className="text-xl font-bold text-[#074185]">First Aid & Watch For</h3>
              </div>

              {data.first_aid && data.first_aid.length > 0 && (
                <div className="mb-6">
                  <h4 className="mb-3 flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    <Heart size={14} /> First Aid Steps
                  </h4>
                  <ul className="space-y-2">
                    {data.first_aid.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm font-medium text-zinc-600 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">
                          {idx + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.watch_for && data.watch_for.length > 0 && (
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider">
                    <Clock size={14} /> Watch Out For
                  </h4>
                  <ul className="space-y-2">
                    {data.watch_for.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm font-medium text-zinc-600 bg-orange-50 rounded-xl p-3 border border-orange-100">
                        <AlertTriangle size={14} className="mt-0.5 text-orange-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Specialist */}
            {data.specialist && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-[28px] bg-[#074185] p-6 text-white"
              >
                <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider opacity-70">
                  <User size={14} /> See A Specialist
                </div>
                <p className="text-xl font-black">{data.specialist}</p>
              </motion.div>
            )}

            {/* Visual Findings */}
            {data.visual_findings && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-[28px] bg-blue-50 p-6 ring-1 ring-blue-100"
              >
                <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-700">
                  <Eye size={14} /> Visual Findings
                </div>
                <p className="text-sm font-medium text-blue-950/70 leading-relaxed">{data.visual_findings}</p>
              </motion.div>
            )}

            {/* AI Confidence */}
            {data.ai_confidence && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-[28px] bg-zinc-50 p-6 ring-1 ring-zinc-200"
              >
                <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-500">
                  <Activity size={14} /> AI Confidence
                </div>
                <p className="text-sm font-bold text-zinc-700">{data.ai_confidence}</p>
              </motion.div>
            )}

            {/* Emergency */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-[28px] bg-red-50 p-6 ring-1 ring-red-100"
            >
              <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-600">
                <Phone size={14} /> Emergency
              </div>
              <p className="text-xs font-bold text-red-800/70 leading-relaxed">
                If you experience severe pain, difficulty breathing, or uncontrolled bleeding — call emergency services immediately.
              </p>
            </motion.div>

            {/* Sources */}
            {data.sources && data.sources.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-[28px] bg-zinc-50 p-6 ring-1 ring-zinc-200"
              >
                <h4 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  <Info size={14} /> Knowledge Sources
                </h4>
                <ul className="space-y-2">
                  {data.sources.map((source, idx) => (
                    <li key={idx} className="text-xs font-semibold text-zinc-600 bg-white p-2.5 rounded-lg border border-zinc-100 shadow-sm truncate" title={source}>
                      {source}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Note */}
            {data.note && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="rounded-[28px] bg-amber-50 p-6 ring-1 ring-amber-100"
              >
                <div className="mb-3 flex items-center gap-2 text-amber-600">
                  <AlertTriangle size={16} />
                  <h3 className="font-black uppercase tracking-widest text-xs">Note</h3>
                </div>
                <p className="text-sm font-bold text-amber-900/70 leading-relaxed whitespace-pre-wrap">
                  {data.note}
                </p>
              </motion.div>
            )}

            {/* AI Disclaimer */}
            <div className="px-2 text-center">
              <p className="text-[10px] font-bold text-zinc-400 leading-relaxed">
                MediLens AI provides suggestions based on available data and RAG matching. This is not a formal diagnosis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
