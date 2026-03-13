"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  Mic, 
  ChevronDown, 
  Search, 
  CheckCircle2, 
  Globe, 
  Plus, 
  User 
} from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";

type Language = "en" | "hi";

const translations = {
  en: {
    newAssessment: "New Assessment",
    subTitle: "Provide details for an accurate AI analysis",
    visualEvidence: "Visual Evidence",
    uploadPrompt: "Uploading a photo significantly improves the AI's ability to assess severity for visual conditions (rashes, cuts, swelling).",
    uploadImage: "Upload Image",
    takePhoto: "Take Photo",
    dragDrop: "Click to upload or drag and drop",
    maxSize: "SVG, PNG, JPG or GIF (max. 5MB)",
    patientDetails: "Patient Details",
    selectMember: "Select Member",
    searchMember: "Search members...",
    noMemberFound: "No member found",
    age: "Age",
    egAge: "e.g. 25",
    gender: "Gender",
    selectGender: "Select Gender",
    symptoms: "Symptoms",
    somethingElse: "Something else?",
    egSymptom: "e.g. Sharp pain in lower back...",
    details: "Timeline & Severity",
    painIntensity: "Pain Intensity",
    noPain: "NO PAIN",
    moderate: "MODERATE",
    severe: "SEVERE",
    duration: "Duration",
    durationPrompt: "How long have symptoms persisted?",
    additionalNotes: "Additional Notes",
    voiceInput: "VOICE INPUT",
    describePrompt: "Describe exactly what happened...",
    generateAssessment: "Generate Results",
    symptomList: [
      "Fever", "Severe Pain", "Bleeding", "Swelling", "Redness", "Difficulty Breathing",
      "Nausea/Vomiting", "Dizziness", "Rash/Skin Changes", "Numbness/Tingling"
    ],
    genders: ["Male", "Female", "Other", "Prefer not to say"],
    durations: ["Less than 24 hours", "1-3 days", "4-7 days", "1-2 weeks", "More than 2 weeks"]
  },
  hi: {
    newAssessment: "नया मूल्यांकन",
    subTitle: "सटीक AI विश्लेषण के लिए विवरण प्रदान करें",
    visualEvidence: "दृश्य साक्ष्य",
    uploadPrompt: "फोटो अपलोड करने से दृश्य स्थितियों (चकत्ते, कट, सूजन) की गंभीरता का आकलन करने की AI की क्षमता में काफी सुधार होता है।",
    uploadImage: "छवि अपलोड करें",
    takePhoto: "फोटो लें",
    dragDrop: "अपलोड करने के लिए क्लिक करें या खींचें और छोड़ें",
    maxSize: "SVG, PNG, JPG या GIF (अधिकतम 5MB)",
    patientDetails: "रोगी विवरण",
    selectMember: "सदस्य चुनें",
    searchMember: "सदस्य खोजें...",
    noMemberFound: "कोई सदस्य नहीं मिला",
    age: "आयु",
    egAge: "जैसे: 25",
    gender: "लिंग",
    selectGender: "लिंग चुनें",
    symptoms: "लक्षण",
    somethingElse: "कुछ और?",
    egSymptom: "जैसे: पीठ के निचले हिस्से में तेज दर्द...",
    details: "अवधि और गंभीरता",
    painIntensity: "दर्द की तीव्रता",
    noPain: "कोई दर्द नहीं",
    moderate: "मध्यम",
    severe: "गंभीर",
    duration: "अवधि",
    durationPrompt: "लक्षण कितने समय से बने हुए हैं?",
    additionalNotes: "अतिरिक्त टिप्पणियाँ",
    voiceInput: "वॉयस इनपुट",
    describePrompt: "बताएं कि वास्तव में क्या हुआ...",
    generateAssessment: "परिणाम उत्पन्न करें",
    symptomList: [
      "बुखार", "गंभीर दर्द", "रक्तस्राव", "सूजन", "लालिमा", "सांस लेने में कठिनाई",
      "मतली/उल्टी", "चक्कर आना", "चकत्ते/त्वचा में बदलाव", "सुन्नता/झुनझुनी"
    ],
    genders: ["पुरुष", "महिला", "अन्य", "बताना नहीं चाहते"],
    durations: ["24 घंटे से कम", "1-3 दिन", "4-7 दिन", "1-2 सप्ताह", "2 सप्ताह से अधिक"]
  }
};

const mockMembers = [
  { id: "1", name: "Prabhjot Singh", age: "25", gender: "Male" },
  { id: "2", name: "John Doe", age: "30", gender: "Male" },
  { id: "3", name: "Jane Smith", age: "28", gender: "Female" },
];

export default function AssessmentPage() {
  const [lang, setLang] = useState<Language>("en");
  const t = translations[lang];

  const [formData, setFormData] = useState({
    memberId: "",
    manualAge: "",
    manualGender: "",
    selectedSymptoms: [] as string[],
    customSymptom: "",
    painIntensity: 0,
    duration: "",
    notes: ""
  });

  const [memberSearch, setMemberSearch] = useState("");
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);

  // Helper to handle manual entry toggle
  const enableManualEntry = () => {
    setFormData(prev => ({ ...prev, memberId: "" }));
    setIsManualEntry(true);
    setIsMemberDropdownOpen(false);
  };

  const filteredMembers = mockMembers.filter(m => 
    m.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const selectedMember = mockMembers.find(m => m.id === formData.memberId);

  const toggleSymptom = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSymptoms: prev.selectedSymptoms.includes(symptom)
        ? prev.selectedSymptoms.filter(s => s !== symptom)
        : [...prev.selectedSymptoms, symptom]
    }));
  };

  const handleLangToggle = () => {
    setLang(prev => prev === "en" ? "hi" : "en");
  };

  return (
    <main className="min-h-screen bg-[#f8fbff]">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header and Language Switcher */}
        <div className="mb-10 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Link 
              href="/" 
              className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-all hover:bg-zinc-50"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 leading-tight">
                {t.newAssessment}
              </h1>
              <p className="mt-1 text-zinc-500 font-medium italic">
                {t.subTitle}
              </p>
            </div>
          </div>

          <button
            onClick={handleLangToggle}
            className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 active:scale-95"
          >
            <Globe size={18} className="text-[#074185]" />
            <span>{lang === "en" ? "हिंदी (Hindi)" : "English"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Visual Evidence */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
            <div className="relative overflow-hidden rounded-3xl border-b-4 border-b-blue-600 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-zinc-100">
              <div className="mb-6 flex items-center gap-2 text-blue-600 font-bold">
                <Camera size={20} />
                <span>{t.visualEvidence}</span>
              </div>
              
              <p className="mb-8 text-sm leading-relaxed text-zinc-500 font-medium">
                {t.uploadPrompt}
              </p>

              <div className="flex gap-1 p-1 bg-zinc-50 rounded-2xl mb-6">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white shadow-sm text-sm font-bold text-zinc-800 transition-all border border-zinc-100">
                  <Upload size={16} className="text-blue-500" />
                  {t.uploadImage}
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-zinc-500 hover:bg-white/50 transition-all">
                  <Camera size={16} />
                  {t.takePhoto}
                </button>
              </div>

              <div className="group relative flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 transition-all hover:border-blue-400 hover:bg-blue-50/30">
                <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-zinc-100">
                  <Image 
                    src="/assests/image-upload.png" 
                    alt="Upload icon" 
                    width={40} 
                    height={40}
                    className="opacity-20 group-hover:opacity-100 transition-opacity"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                    }}
                  />
                  <div className="fallback-icon hidden">
                    <Upload size={30} className="text-zinc-300" />
                  </div>
                </div>
                <p className="text-center text-sm font-bold text-zinc-800 px-6">
                  {t.dragDrop}
                </p>
                <p className="mt-2 text-center text-xs text-zinc-400">
                  {t.maxSize}
                </p>
                <input type="file" className="absolute inset-0 cursor-pointer opacity-0" />
              </div>
            </div>
          </div>

          {/* Right Column: Main Form */}
          <div className="space-y-8 lg:col-span-8">
            {/* Section 1: Patient Details -> Member Selector */}
            <section className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-zinc-100">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                  1
                </div>
                <h2 className="text-xl font-bold text-zinc-900">{t.patientDetails}</h2>
              </div>

              <div className="relative">
                <label className="text-sm font-bold text-zinc-700 block mb-2">{t.selectMember}</label>
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => setIsMemberDropdownOpen(!isMemberDropdownOpen)}
                >
                  <div className="w-full flex items-center justify-between rounded-2xl bg-zinc-50 border-transparent px-5 py-4 text-base font-medium text-zinc-900 transition-all ring-1 ring-zinc-100 hover:bg-zinc-100/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[#074185] text-sm font-bold text-white uppercase shadow-sm">
                        {selectedMember ? selectedMember.name.charAt(0) : <User size={18} />}
                      </div>
                      <div>
                        <span className={cn("block font-bold", selectedMember ? "text-zinc-900" : "text-zinc-400")}>
                          {selectedMember ? selectedMember.name : (isManualEntry ? "Manual Entry Patient" : t.searchMember)}
                        </span>
                        {selectedMember && (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">{selectedMember.gender}</span>
                            <span className="text-xs bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">{selectedMember.age} YRS</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronDown size={20} className={cn("text-zinc-400 transition-transform", isMemberDropdownOpen && "rotate-180")} />
                  </div>
                </div>

                {isMemberDropdownOpen && (
                  <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-zinc-50">
                      <div className="flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2 ring-1 ring-zinc-100 focus-within:ring-blue-500/20 focus-within:bg-white transition-all">
                        <Search size={16} className="text-zinc-400" />
                        <input
                          type="text"
                          placeholder={t.searchMember}
                          value={memberSearch}
                          onChange={(e) => setMemberSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-transparent border-none text-sm font-medium focus:ring-0 p-0"
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1">
                      {filteredMembers.length > 0 ? (
                        filteredMembers.map(member => (
                          <button
                            key={member.id}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, memberId: member.id }));
                              setIsManualEntry(false);
                              setIsMemberDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-all hover:bg-blue-50 group",
                              formData.memberId === member.id && "bg-blue-50"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-sm font-bold text-zinc-700 ring-1 ring-zinc-100 group-hover:ring-blue-200">
                                {member.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-zinc-900">{member.name}</p>
                                <p className="text-xs text-zinc-500">{member.gender}, {member.age} yrs</p>
                              </div>
                            </div>
                            {formData.memberId === member.id && <CheckCircle2 size={18} className="text-blue-600" />}
                          </button>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                          <Plus size={32} className="mb-2 opacity-20" />
                          <p className="text-sm font-bold">{t.noMemberFound}</p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              enableManualEntry();
                            }}
                            className="mt-3 text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
                          >
                            ADD MANUALLY
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Manual Entry Inputs */}
              {(isManualEntry || (filteredMembers.length === 0 && !isMemberDropdownOpen)) && !selectedMember && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700">{t.age}</label>
                    <input
                      type="text"
                      placeholder={t.egAge}
                      value={formData.manualAge}
                      onChange={(e) => setFormData(prev => ({ ...prev, manualAge: e.target.value }))}
                      className="w-full rounded-2xl bg-zinc-50 border-transparent px-5 py-4 text-base font-medium text-zinc-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ring-1 ring-zinc-100 placeholder:text-zinc-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700">{t.gender}</label>
                    <div className="relative group">
                      <select
                        value={formData.manualGender}
                        onChange={(e) => setFormData(prev => ({ ...prev, manualGender: e.target.value }))}
                        className="w-full appearance-none rounded-2xl bg-zinc-50 border-transparent px-5 py-4 text-base font-medium text-zinc-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ring-1 ring-zinc-100"
                      >
                        <option value="" disabled>{t.selectGender}</option>
                        {t.genders.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                      <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-zinc-600 transition-colors" />
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Section 2: Symptoms */}
            <section className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-zinc-100">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                  2
                </div>
                <h2 className="text-xl font-bold text-zinc-900">{t.symptoms}</h2>
              </div>

              <div className="flex flex-wrap gap-3">
                {t.symptomList.map((symptom) => {
                  const isSelected = formData.selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={cn(
                        "rounded-2xl border px-5 py-3 text-sm font-bold transition-all duration-300",
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                          : "bg-white border-zinc-100 text-zinc-600 hover:border-zinc-300 shadow-sm"
                      )}
                    >
                      {symptom}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 space-y-3">
                <label className="text-sm font-bold text-zinc-700">{t.somethingElse}</label>
                <textarea
                  placeholder={t.egSymptom}
                  rows={3}
                  value={formData.customSymptom}
                  onChange={(e) => setFormData(prev => ({ ...prev, customSymptom: e.target.value }))}
                  className="w-full rounded-2xl bg-zinc-50 border-transparent px-5 py-4 text-base font-medium text-zinc-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ring-1 ring-zinc-100 resize-none"
                />
              </div>
            </section>

            {/* Section 3: Details */}
            <section className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-zinc-100">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                  3
                </div>
                <h2 className="text-xl font-bold text-zinc-900">{t.details}</h2>
              </div>

              <div className="space-y-10">
                {/* Pain Slider */}
                <div className="rounded-2xl bg-[#f8fbff] p-8 ring-1 ring-blue-50">
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-sm font-bold text-blue-900">{t.painIntensity}</span>
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">
                      {formData.painIntensity} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={formData.painIntensity}
                    onChange={(e) => setFormData(prev => ({ ...prev, painIntensity: parseInt(e.target.value) }))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-blue-600 transition-all hover:accent-blue-700"
                  />
                  <div className="mt-4 flex justify-between text-[10px] font-black tracking-widest text-zinc-400">
                    <span>{t.noPain}</span>
                    <span>{t.moderate}</span>
                    <span>{t.severe}</span>
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">{t.duration}</label>
                  <div className="relative group">
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full appearance-none rounded-2xl bg-zinc-50 border-transparent px-5 py-4 text-base font-medium text-zinc-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ring-1 ring-zinc-100"
                    >
                      <option value="" disabled>{t.durationPrompt}</option>
                      {t.durations.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-zinc-600 transition-colors" />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-zinc-700">{t.additionalNotes}</label>
                    <button className="flex items-center gap-2 rounded-full bg-zinc-50 px-4 py-1.5 text-[10px] font-black tracking-wider text-zinc-600 transition-all hover:bg-zinc-100 active:scale-95 shadow-sm border border-zinc-100">
                      <Mic size={14} className="text-blue-500" />
                      {t.voiceInput}
                    </button>
                  </div>
                  <div className="relative">
                    <textarea
                      placeholder={t.describePrompt}
                      rows={5}
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full rounded-2xl bg-zinc-50 border-transparent px-5 py-4 text-base font-medium text-zinc-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ring-1 ring-zinc-100 resize-none"
                    />
                    <div className="absolute bottom-4 right-5 text-[10px] font-bold text-zinc-400">
                      {formData.notes.length} / 500
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button className="group relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#074185] to-[#1e60ad] px-12 py-5 text-xl font-black text-white shadow-xl shadow-blue-900/20 transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-95">
                <span className="relative z-10">{t.generateAssessment}</span>
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
