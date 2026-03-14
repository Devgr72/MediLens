"use client";

import { useState, useEffect } from "react";
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
  User,
  CheckCircle2,
  MapPin,
  Siren,
  Clock,
  Calendar,
  Wallet,
  Download
} from "lucide-react";
import { AssessmentResponse } from "./api/assessment";
import { AIHistoryPayload, saveHistory } from "./api/assessment";
import { MatchedDoctor, matchDoctors, bookConsultation } from "./api/matching";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface ResultsViewProps {
  data: AssessmentResponse;
  onReset: () => void;
}

export default function ResultsView({ data, onReset }: ResultsViewProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Doctor Matching State
  const [matchedDoctors, setMatchedDoctors] = useState<MatchedDoctor[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{ id: string; status: "idle" | "booking" | "success" }>({ id: "", status: "idle" });

  // Fetch match doctors when component mounts
  useEffect(() => {
    const fetchDoctors = async () => {
      const criteria = data.recommended_specialists || (data.specialist ? [data.specialist] : []);
      if (criteria.length > 0) {
        setIsMatching(true);
        const docs = await matchDoctors(criteria);
        setMatchedDoctors(docs);
        setIsMatching(false);
      }
    };
    fetchDoctors();
  }, [data.recommended_specialists, data.specialist]);

  const handleBookConsultation = async (doctorId: string) => {
    setBookingDetails({ id: doctorId, status: "booking" });

    try {
      let finalAssessmentId = data.assessment_id;

      // If assessment_id is not a valid MongoDB ObjectId (24 hex characters), it needs saving first
      if (!finalAssessmentId || finalAssessmentId.length !== 24) {
        setBookingDetails({ id: doctorId, status: "booking" });
        const savedRecord = await handleSaveHistory();
        if (savedRecord && savedRecord._id) {
          finalAssessmentId = savedRecord._id;
          data.assessment_id = finalAssessmentId; // Update local ref so we don't save again

          // Also update the local storage copy if it exists, so a refresh keeps this valid ID
          if (typeof window !== "undefined") {
            const stored = localStorage.getItem("medilens_assessment_result");
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                parsed.assessment_id = finalAssessmentId;
                localStorage.setItem("medilens_assessment_result", JSON.stringify(parsed));
              } catch (e) { }
            }
          }
        } else {
          throw new Error("You must log in and save assessment history to book a consultation.");
        }
      }

      const response = await bookConsultation(doctorId, finalAssessmentId);
      // bookConsultation now throws on failure, so reaching here means success
      if (response._id) {
        setBookingDetails({ id: doctorId, status: "success" });
        toast.success("Consultation booked! The doctor will be notified.");
      }
    } catch (err: any) {
      setBookingDetails({ id: "", status: "idle" });
      toast.error(err.message || "Something went wrong. Please try again.");
    }
  };

  const handleSaveHistory = async () => {
    if (saving) return null;  // only block concurrent saves, not already-saved state
    setSaving(true);
    const payload: AIHistoryPayload = {
      summary: data.summary || "",
      potential_causes: (data.potential_causes || []).map((c) =>
        typeof c === "string" ? c : (c as { name?: string }).name || JSON.stringify(c)
      ),
      alternative_conditions: [],
      risk_level: data.risk_level || "",
      triage_level: data.triage_level || "",
      triage_advice: data.triage_advice || "",
      severity_score: data.severity_score ?? 0,
      visual_findings: data.visual_findings || "",
      suspected_condition: data.suspected_condition || "",
      reasoning: data.reasoning || "",
      first_aid: data.first_aid || [],
      watch_for: data.watch_for || [],
      specialist: data.specialist || "",
      recommended_specialists: data.recommended_specialists || [],
      ai_confidence: data.ai_confidence || "",
      sources: data.sources || [],
      note: data.note || null,
    };
    const result = await saveHistory(payload);
    setSaving(false);
    if (result) {
      setSaved(true);
      toast.success("History saved successfully!");
      return result;
    } else {
      toast.error("Please log in to save history to your account.");
      return null;
    }
  };
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
      <div className={cn("relative overflow-hidden pt-12 pb-32 text-white", riskBg)}>
        <div className="absolute inset-0 bg-black/10 opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-from),_transparent_50%)] from-white/20" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-6 print:hidden">
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

            <div className="flex items-center gap-3 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-2xl px-6 py-4 text-sm font-bold bg-white text-[#074185] hover:bg-blue-50 transition-all shadow-lg"
              >
                <Download size={20} />
                Download Report
              </button>

              <button
                onClick={handleSaveHistory}
                disabled={saving || saved}
                className={cn(
                  "flex items-center gap-2 rounded-2xl px-6 py-4 text-sm font-bold backdrop-blur-md ring-1 transition-all",
                  saved
                    ? "bg-emerald-500/30 ring-emerald-300/40 text-white cursor-default"
                    : saving
                      ? "bg-white/10 ring-white/20 text-white/60 cursor-wait"
                      : "bg-white/10 ring-white/30 text-white hover:bg-white/20"
                )}
              >
                {saved ? <CheckCircle2 size={20} /> : <Save size={20} />}
                {saved ? "Saved!" : saving ? "Saving..." : "Save History"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 mx-auto -mt-16 max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Emergency Actions Header (Only for High/Emergency Risk) */}
            {((data.risk_level || "").toUpperCase().includes("HIGH") || (data.risk_level || "").toUpperCase().includes("EMERGENCY")) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-[32px] bg-red-50 p-6 md:p-8 shadow-xl shadow-red-200/50 border border-red-100"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-500/30">
                    <Siren size={24} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-red-700">Immediate Action Required</h3>
                    <p className="mt-1 font-bold text-red-600/80">
                      Based on your symptoms, this could be a medical emergency. Please seek urgent care.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="https://www.google.com/maps/search/hospitals+near+me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-black text-red-600 shadow-md shadow-red-200/50 transition-all hover:bg-red-600 hover:text-white"
                  >
                    <MapPin size={20} /> Find Nearby Hospitals
                  </a>
                  <a
                    href="tel:102"
                    className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-red-600 px-6 py-4 text-sm font-black text-white shadow-md shadow-red-600/30 transition-all hover:bg-red-700 hover:scale-[1.02]"
                  >
                    <Phone size={20} /> Call Ambulance (102)
                  </a>
                </div>
              </motion.div>
            )}

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
                    {data.potential_causes.map((cause, idx) => {
                      const name = typeof cause === "string" ? cause : cause.name;
                      const confidence = typeof cause === "string" ? null : cause.confidence;
                      return (
                        <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                          <span className="font-bold text-[#074185]">{name}</span>
                          {confidence !== null && (
                            <span className="text-xs font-black px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                              {(confidence * 100).toFixed(0)}% Match
                            </span>
                          )}
                        </div>
                      );
                    })}
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

            {/* AI Recommended Specialist (Raw Output) */}
            {(data.specialist || (data.recommended_specialists && data.recommended_specialists.length > 0)) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-[28px] bg-blue-50 p-6 ring-1 ring-blue-100"
              >
                <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-700 opacity-80 border-b border-blue-200 pb-3">
                  <Stethoscope size={16} /> AI Recommended Specialist
                </div>

                <div className="space-y-2">
                  {data.recommended_specialists && data.recommended_specialists.length > 0 ? (
                    data.recommended_specialists.map((spec, idx) => (
                      <p key={idx} className="text-xl font-black text-[#074185] flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> {spec}
                      </p>
                    ))
                  ) : (
                    <p className="text-xl font-black text-[#074185] flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> {data.specialist}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Find a Doctor Match Container */}
            {(data.specialist || (data.recommended_specialists && data.recommended_specialists.length > 0)) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-[32px] overflow-hidden bg-white shadow-xl shadow-zinc-200/50 border border-zinc-100 print:hidden"
              >
                <div className="bg-[#074185] p-6 text-white text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#074185] shadow-lg mb-4">
                    <User size={32} />
                  </div>
                  <h3 className="text-2xl font-black">Connect With a Doctor</h3>
                  <p className="mt-2 text-sm font-medium text-blue-100">
                    We found specialists matching your suspected condition.
                  </p>
                </div>

                <div className="p-6 bg-zinc-50 space-y-4">
                  {isMatching ? (
                    <div className="py-8 text-center animate-pulse text-zinc-400 font-bold">
                      Searching for available specialists...
                    </div>
                  ) : matchedDoctors.length > 0 ? (
                    matchedDoctors.map((doc, idx) => (
                      <div key={idx} className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm transition-all hover:shadow-md hover:border-blue-200 group">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-black text-lg text-zinc-800">{doc.name}</h4>
                            <p className="text-sm font-bold text-blue-600">
                              {doc.professional_details?.specialization}
                              <span className="text-zinc-400 font-normal ml-1">
                                • {doc.professional_details?.experience_years} exp
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm font-medium text-zinc-600">
                            <Wallet size={16} className="text-zinc-400" />
                            Consultation Fee: <span className="font-bold text-zinc-800">{doc.consultation_details?.consultation_fee}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm font-medium text-zinc-600 text-ellipsis overflow-hidden whitespace-nowrap">
                            <MapPin size={16} className="text-zinc-400 shrink-0" />
                            {doc.workplace_details?.hospital_or_clinic_name}, {doc.workplace_details?.work_address?.city}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-100 flex gap-3">
                          <button
                            onClick={() => handleBookConsultation(doc._id)}
                            disabled={bookingDetails.id === doc._id && bookingDetails.status !== "idle"}
                            className={cn(
                              "flex-1 justify-center py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
                              bookingDetails.id === doc._id && bookingDetails.status === "success"
                                ? "bg-emerald-500 text-white shadow-emerald-500/30"
                                : "bg-[#074185] text-white hover:bg-blue-800 shadow-md shadow-blue-900/20"
                            )}
                          >
                            {bookingDetails.id === doc._id && bookingDetails.status === "booking" ? (
                              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin mx-auto" />
                            ) : bookingDetails.id === doc._id && bookingDetails.status === "success" ? (
                              <><CheckCircle2 size={16} /> Booked</>
                            ) : (
                              <><Calendar size={16} /> Book Consultation</>
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-sm font-medium text-zinc-500 border-2 border-dashed border-zinc-200 rounded-2xl">
                      No matching doctors available right now.<br />
                      Try checking back later.
                    </div>
                  )}
                </div>
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
