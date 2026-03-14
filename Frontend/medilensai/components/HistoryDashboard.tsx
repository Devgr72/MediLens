"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  History, Clock, ChevronRight, AlertCircle, 
  CheckCircle2, Search, Filter, Trash2,
  Calendar, Activity, Shield
} from "lucide-react"

interface AssessmentHistoryItem {
  assessment_id: string
  status: string
  analysis: {
    summary: string
    potential_causes: string[]
    risk_level: string
    recommendations: string[]
    ai_confidence: string
  }
  created_at: string
}

export default function HistoryDashboard({ onClose }: { onClose: () => void }) {
  const [history, setHistory] = useState<AssessmentHistoryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<AssessmentHistoryItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const savedHistory = localStorage.getItem("medilens_assessment_history")
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const filteredHistory = history.filter(item => 
    item.analysis.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.assessment_id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const deleteItem = (id: string) => {
    const updated = history.filter(h => h.assessment_id !== id)
    setHistory(updated)
    localStorage.setItem("medilens_assessment_history", JSON.stringify(updated))
    if (selectedItem?.assessment_id === id) setSelectedItem(null)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#074185] flex items-center justify-center text-white">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#074185]">Diagnostic History</h2>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Mock Mode Persistence</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
            <ChevronRight className="rotate-90" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="Search assessments..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold outline-none focus:border-[#074185] transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* List View */}
        <div className="w-full md:w-1/2 border-r border-zinc-100 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-200 mb-4">
                <Activity size={32} />
              </div>
              <p className="text-sm font-bold text-zinc-400">No diagnostic history found.</p>
            </div>
          ) : (
            filteredHistory.map((item, idx) => (
              <motion.div 
                key={item.assessment_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedItem(item)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group ${selectedItem?.assessment_id === item.assessment_id ? "bg-[#074185]/5 border-[#074185]/20 shadow-lg shadow-[#074185]/5" : "bg-white border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50"}`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.analysis.risk_level === "HIGH" ? "bg-red-500" : item.analysis.risk_level === "MODERATE" ? "bg-yellow-500" : "bg-green-500"}`} />
                      <h4 className="text-sm font-extrabold text-[#074185] line-clamp-1">{item.analysis.summary}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                      <Calendar size={12} />
                      {formatDate(item.created_at)}
                    </div>
                  </div>
                  <ChevronRight size={18} className={`text-zinc-300 transition-transform ${selectedItem?.assessment_id === item.assessment_id ? "translate-x-1 text-[#074185]" : ""}`} />
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Detail View */}
        <div className="hidden md:block flex-1 overflow-y-auto custom-scrollbar bg-zinc-50/30 p-6">
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div 
                key={selectedItem.assessment_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedItem.analysis.risk_level === "HIGH" ? "bg-red-100 text-red-600" : selectedItem.analysis.risk_level === "MODERATE" ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"}`}>
                    {selectedItem.analysis.risk_level} RISK
                  </div>
                  <button onClick={() => deleteItem(selectedItem.assessment_id)} className="p-2 text-zinc-300 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-[#074185] leading-tight">{selectedItem.analysis.summary}</h3>
                  <p className="text-xs font-bold text-zinc-400">Assessment ID: {selectedItem.assessment_id}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Potential Causes</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.analysis.potential_causes.map((cause, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-white border border-zinc-100 text-xs font-bold text-zinc-600 shadow-sm">
                        {cause}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Doctor Recommendations</h4>
                  <div className="space-y-2">
                    {selectedItem.analysis.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-xl bg-white border border-zinc-100 shadow-sm">
                        <div className="mt-0.5"><CheckCircle2 size={16} className="text-[#074185]" /></div>
                        <p className="text-xs font-bold text-zinc-600 leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-gradient-to-br from-[#074185] to-[#55bbc5] text-white flex items-center justify-between shadow-xl shadow-[#074185]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">AI Confidence</p>
                      <p className="text-lg font-black">{selectedItem.analysis.ai_confidence}</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-white/20 flex items-center justify-center font-black text-xs">
                    95%
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-zinc-100 shadow-inner">
                  <AlertCircle size={40} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-zinc-300">Select an assessment</h3>
                  <p className="text-sm font-bold text-zinc-300">Choose a record from the list to view the full AI analysis.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
