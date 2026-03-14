"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  User, Mail, Phone, Lock, Calendar, MapPin, 
  Stethoscope, Landmark, Briefcase, Clock, 
  ChevronRight, ChevronLeft, Loader2, CheckCircle2,
  ShieldCheck, FileText, Building
} from "lucide-react"
import { signupDoctor, verifyDoctorOtp, DoctorSignupPayload } from "../api/doctor"
import toast from "react-hot-toast"

interface DoctorRegistrationProps {
  onSuccess: () => void;
  onBack: () => void;
}

type Step = "basic" | "professional" | "workplace" | "consultation" | "documents" | "otp";

export default function DoctorRegistration({ onSuccess, onBack }: DoctorRegistrationProps) {
  const [step, setStep] = useState<Step>("basic")
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])

  // Combined Form State
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", password: "", gender: "male", dob: "",
    city: "", state: "", pincode: "", full_address: "",
    license_number: "", medical_council: "", registration_year: "",
    degree: "", higher_degree: "", university: "", graduation_year: "",
    specialization: "", sub_specialization: "", experience_years: "",
    workplace_type: "hospital", hospital_name: "", department: "",
    work_city: "", work_state: "", work_pincode: "", work_full_address: "",
    consultation_fee: "", consultation_type: "both",
    available_days: [] as string[], available_time: ""
  })

  const updateField = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter(d => d !== day)
        : [...prev.available_days, day]
    }))
  }

  const handleNext = () => {
    const sequence: Step[] = ["basic", "professional", "workplace", "consultation", "documents"]
    const currentIndex = sequence.indexOf(step)
    if (currentIndex < sequence.length - 1) {
      setStep(sequence[currentIndex + 1])
    }
  }

  const handlePrev = () => {
    const sequence: Step[] = ["basic", "professional", "workplace", "consultation", "documents"]
    const currentIndex = sequence.indexOf(step)
    if (currentIndex > 0) {
      setStep(sequence[currentIndex - 1])
    } else {
      onBack()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload: DoctorSignupPayload = {
      basic_details: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        gender: formData.gender,
        dob: formData.dob,
        address: {
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          full_address: formData.full_address
        }
      },
      professional_details: {
        license_number: formData.license_number,
        medical_council: formData.medical_council,
        registration_year: formData.registration_year,
        qualification: {
          degree: formData.degree,
          higher_degree: formData.higher_degree,
          university: formData.university,
          graduation_year: formData.graduation_year
        },
        specialization: formData.specialization,
        sub_specialization: formData.sub_specialization,
        experience_years: formData.experience_years
      },
      workplace_details: {
        workplace_type: formData.workplace_type,
        hospital_or_clinic_name: formData.hospital_name,
        department: formData.department,
        work_address: {
          city: formData.work_city,
          state: formData.work_state,
          pincode: formData.work_pincode,
          full_address: formData.work_full_address
        }
      },
      consultation_details: {
        consultation_fee: formData.consultation_fee,
        consultation_type: formData.consultation_type,
        available_days: formData.available_days,
        available_time: formData.available_time
      },
      documents: {} // Future file upload support
    }

    try {
      await signupDoctor(payload)
      toast.success("Account created! Check your email for the OTP.")
      setStep("otp")
    } catch (err) {
      toast.error((err as Error).message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) {
      const next = document.getElementById(`doc-otp-${index + 1}`)
      next?.focus()
    }
  }

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`doc-otp-${index - 1}`)
      prev?.focus()
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join("")
    if (otpCode.length < 6) {
      toast.error("Please enter the complete 6-digit OTP.")
      return
    }
    setLoading(true)
    try {
      await verifyDoctorOtp(formData.email, otpCode)
      toast.success("Registration successful! Admin will verify your profile.")
      onSuccess()
    } catch (err) {
      toast.error((err as Error).message || "OTP verification failed.")
    } finally {
      setLoading(false)
    }
  }

  const stepsInfo = [
    { id: "basic", label: "Identity", icon: User },
    { id: "professional", label: "Credentials", icon: Stethoscope },
    { id: "workplace", label: "Workplace", icon: Building },
    { id: "consultation", label: "Practice", icon: Clock },
    { id: "documents", label: "Verify", icon: FileText },
  ]

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      {/* Progress Header */}
      <div className="mb-8 px-2">
        <div className="flex items-center justify-between relative">
          {stepsInfo.map((s, idx) => {
            const Icon = s.icon
            const isActive = step === s.id
            const isCompleted = stepsInfo.findIndex(x => x.id === step) > idx
            
            return (
              <div key={s.id} className="flex flex-col items-center z-10">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${isActive ? "bg-[#074185] text-white ring-4 ring-[#074185]/20" : 
                    isCompleted ? "bg-green-500 text-white" : "bg-zinc-100 text-zinc-400"}
                `}>
                  {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                </div>
                <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${isActive ? "text-[#074185]" : "text-zinc-400"}`}>
                  {s.label}
                </span>
              </div>
            )
          })}
          {/* Progress Line */}
          <div className="absolute top-5 left-0 w-full h-[2px] bg-zinc-100 -z-0" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-6">
        <AnimatePresence mode="wait">
          {/* STEP 1: BASIC DETAILS */}
          {step === "basic" && (
            <motion.div 
              key="basic" 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 1.05 }} 
              transition={{ duration: 0.4, ease: "backOut" }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#074185] transition-colors" size={16} />
                    <input type="text" value={formData.name} onChange={e => updateField("name", e.target.value)} placeholder="Dr. John Doe" className={`w-full rounded-xl bg-zinc-50 border transition-all pl-10 pr-4 py-2.5 text-sm font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:bg-white ${formData.name ? "border-[#074185]/30 shadow-[0_0_15px_-5px_rgba(7,65,133,0.1)]" : "border-zinc-200"}`} />
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#074185] transition-colors" size={16} />
                    <input type="email" value={formData.email} onChange={e => updateField("email", e.target.value)} placeholder="doctor@example.com" className={`w-full rounded-xl bg-zinc-50 border transition-all pl-10 pr-4 py-2.5 text-sm font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:bg-white ${formData.email.includes("@") ? "border-[#074185]/30 shadow-[0_0_15px_-5px_rgba(7,65,133,0.1)]" : "border-zinc-200"}`} />
                  </div>
                </motion.div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#074185] transition-colors" size={16} />
                    <input type="tel" value={formData.phone} onChange={e => updateField("phone", e.target.value)} placeholder="+91 98765 43210" className="w-full rounded-xl bg-zinc-50 border border-zinc-200 pl-10 pr-4 py-2.5 text-sm font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:border-[#074185] focus:bg-white transition-all focus:shadow-[0_0_15px_-5px_rgba(7,65,133,0.1)]" />
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Date of Birth</label>
                  <div className="relative group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input type="date" value={formData.dob} onChange={e => updateField("dob", e.target.value)} className="w-full rounded-xl bg-zinc-50 border border-zinc-200 pl-10 pr-4 py-2.5 text-sm font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:border-[#074185] focus:bg-white transition-all" />
                  </div>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">Create Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#074185] transition-colors" size={16} />
                  <input type="password" value={formData.password} onChange={e => updateField("password", e.target.value)} placeholder="••••••••" className="w-full rounded-xl bg-zinc-50 border border-zinc-200 pl-10 pr-4 py-2.5 text-sm font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:border-[#074185] focus:bg-white transition-all" />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="pt-2">
                <h4 className="flex items-center gap-2 text-xs font-bold text-[#074185] mb-3">
                  <MapPin size={14} /> RESIDENTIAL ADDRESS
                </h4>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <input type="text" value={formData.city} onChange={e => updateField("city", e.target.value)} placeholder="City" className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-2.5 text-xs font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:border-[#074185] transition-all" />
                  <input type="text" value={formData.state} onChange={e => updateField("state", e.target.value)} placeholder="State" className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-2.5 text-xs font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:border-[#074185] transition-all" />
                  <input type="text" value={formData.pincode} onChange={e => updateField("pincode", e.target.value)} placeholder="Pincode" className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-2.5 text-xs font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:border-[#074185] transition-all" />
                </div>
                <textarea value={formData.full_address} onChange={e => updateField("full_address", e.target.value)} placeholder="Detailed Address" className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:border-[#074185] resize-none h-16 transition-all" />
              </motion.div>
            </motion.div>
          )}

          {/* STEP 2: PROFESSIONAL DETAILS */}
          {step === "professional" && (
            <motion.div 
              key="professional" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">License Number</label>
                  <input type="text" value={formData.license_number} onChange={e => updateField("license_number", e.target.value)} placeholder="MC-123456" className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:border-[#074185] transition-all" />
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Medical Council</label>
                  <input type="text" value={formData.medical_council} onChange={e => updateField("medical_council", e.target.value)} placeholder="e.g. MCI" className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:border-[#074185] transition-all" />
                </motion.div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Primary Specialization</label>
                  <input type="text" value={formData.specialization} onChange={e => updateField("specialization", e.target.value)} placeholder="e.g. Cardiologist" className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:border-[#074185] transition-all" />
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Experience (Years)</label>
                  <input type="number" value={formData.experience_years} onChange={e => updateField("experience_years", e.target.value)} placeholder="5" className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:border-[#074185] transition-all" />
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="pt-2">
                <h4 className="flex items-center gap-2 text-xs font-bold text-[#074185] mb-3">
                  <Landmark size={14} /> QUALIFICATION
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <input type="text" value={formData.degree} onChange={e => updateField("degree", e.target.value)} placeholder="MBBS" className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:border-[#074185] transition-all" />
                  <input type="text" value={formData.university} onChange={e => updateField("university", e.target.value)} placeholder="University Name" className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:border-[#074185] transition-all" />
                </div>
                <input type="text" value={formData.graduation_year} onChange={e => updateField("graduation_year", e.target.value)} placeholder="Year of Graduation" className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:border-[#074185] transition-all" />
              </motion.div>
            </motion.div>
          )}

          {/* STEP 3: WORKPLACE DETAILS */}
          {step === "workplace" && (
            <motion.div 
              key="workplace" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">Workplace Type</label>
                <div className="flex gap-2">
                  {["hospital", "clinic", "private"].map((t, i) => (
                    <motion.button 
                      initial={{ scale: 0.9 }} 
                      animate={{ scale: 1 }} 
                      transition={{ delay: i * 0.1 }}
                      key={t} 
                      type="button" 
                      onClick={() => updateField("workplace_type", t)} 
                      className={`flex-1 py-2 text-sm font-bold rounded-xl border transition-all ${formData.workplace_type === t ? "bg-[#074185] text-white border-[#074185] shadow-lg shadow-[#074185]/20" : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-300"}`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">Hospital / Clinic Name</label>
                <input type="text" value={formData.hospital_name} onChange={e => updateField("hospital_name", e.target.value)} placeholder="Apex Health Hospital" className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:border-[#074185] transition-all" />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="pt-2">
                <h4 className="flex items-center gap-2 text-xs font-bold text-[#074185] mb-3">
                  <MapPin size={14} /> WORK ADDRESS
                </h4>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <input type="text" value={formData.work_city} onChange={e => updateField("work_city", e.target.value)} placeholder="City" className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-2.5 text-xs font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:border-[#074185] transition-all" />
                  <input type="text" value={formData.work_state} onChange={e => updateField("work_state", e.target.value)} placeholder="State" className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-2.5 text-xs font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:border-[#074185] transition-all" />
                  <input type="text" value={formData.work_pincode} onChange={e => updateField("work_pincode", e.target.value)} placeholder="Pincode" className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-2.5 text-xs font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:border-[#074185] transition-all" />
                </div>
                <textarea value={formData.work_full_address} onChange={e => updateField("work_full_address", e.target.value)} placeholder="Detailed workplace address" className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:border-[#074185] resize-none h-16 transition-all" />
              </motion.div>
            </motion.div>
          )}

          {/* STEP 4: CONSULTATION DETAILS */}
          {step === "consultation" && (
            <motion.div 
              key="consultation" 
              initial={{ opacity: 0, rotateX: 90 }} 
              animate={{ opacity: 1, rotateX: 0 }} 
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Consultation Fee (₹)</label>
                  <input type="number" value={formData.consultation_fee} onChange={e => updateField("consultation_fee", e.target.value)} placeholder="500" className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:border-[#074185] transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Type</label>
                  <select value={formData.consultation_type} onChange={e => updateField("consultation_type", e.target.value)} className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:border-[#074185] transition-all">
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500">Available Days</label>
                <div className="flex flex-wrap gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                    <motion.button 
                      initial={{ scale: 0.8, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      transition={{ delay: i * 0.05 }}
                      key={day} 
                      type="button" 
                      onClick={() => toggleDay(day)} 
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${formData.available_days.includes(day) ? "bg-[#074185] text-white border-[#074185] shadow-md shadow-[#074185]/10" : "bg-zinc-50 text-zinc-400 border-zinc-200 hover:border-zinc-300"}`}
                    >
                      {day}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">Available Timings</label>
                <input type="text" value={formData.available_time} onChange={e => updateField("available_time", e.target.value)} placeholder="e.g. 10:00 AM - 04:00 PM" className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-[#074185] outline-none placeholder:text-zinc-400 focus:border-[#074185] transition-all" />
              </div>
            </motion.div>
          )}

          {/* STEP 5: FINAL VERIFICATION */}
          {step === "documents" && (
            <motion.div 
              key="documents" 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 1.2 }} 
              className="space-y-6 text-center py-4"
            >
              <motion.div 
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} 
                transition={{ repeat: Infinity, duration: 4 }}
                className="mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-[#074185]/20 to-[#55bbc5]/20 flex items-center justify-center text-[#074185] shadow-inner"
              >
                <ShieldCheck size={40} />
              </motion.div>
              <div className="space-y-2">
                <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl font-extrabold text-[#074185]">Identity Verification</motion.h3>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-sm font-medium text-zinc-500 max-w-[300px] mx-auto">
                  By submitting, you agree that your medical credentials will be manually verified by our audit team.
                </motion.p>
              </div>
              
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="rounded-2xl border-2 border-dashed border-zinc-200 p-6 bg-white shadow-xl shadow-zinc-200/50">
                <div className="mx-auto w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-300 mb-3 hover:text-[#074185] transition-colors cursor-pointer border border-zinc-100">
                  <FileText size={24} />
                </div>
                <p className="text-xs font-bold text-zinc-400">
                  Document upload feature coming soon. For now, complete your profile registration.
                </p>
              </motion.div>

              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center gap-3 p-4 rounded-xl bg-[#074185]/5 border border-[#074185]/10 text-left">
                <Briefcase size={20} className="text-[#074185] shrink-0" />
                <p className="text-[10px] font-bold text-[#074185]/80 leading-tight">
                  Verification usually takes 24-48 business hours. You&apos;ll receive an email once approved.
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* STEP 6: OTP VERIFICATION */}
          {step === "otp" && (
            <motion.div 
              key="otp" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="space-y-6 text-center py-4"
            >
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#074185]/10">
                  <Mail size={24} className="text-[#074185]" />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight text-[#074185]">Check Your Email</h2>
                <p className="mt-1.5 text-sm font-medium text-zinc-500">
                  We sent a 6-digit code to<br />
                  <span className="font-bold text-[#074185]">{formData.email}</span>
                </p>
              </div>
              <form onSubmit={handleVerifyOTP}>
                <div className="mb-6 flex justify-center gap-3">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`doc-otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOTPChange(i, e.target.value)}
                      onKeyDown={e => handleOTPKeyDown(i, e)}
                      className="h-12 w-12 rounded-xl border-2 border-zinc-200 bg-zinc-50 text-center text-lg font-extrabold text-[#074185] outline-none transition-all focus:border-[#074185] focus:bg-white focus:ring-4 focus:ring-[#074185]/10"
                    />
                  ))}
                </div>
                <button type="submit" disabled={loading} className="group relative w-full overflow-hidden rounded-xl bg-[#074185] py-3.5 font-bold text-white shadow-lg shadow-[#074185]/20 transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.99]">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                    {loading ? "Verifying…" : "Verify Email"}
                  </span>
                  <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      {step !== "otp" && (
        <div className="pt-6 flex gap-3 border-t border-zinc-100 mt-auto">
          <motion.button whileHover={{ x: -2 }} whileTap={{ scale: 0.98 }} onClick={handlePrev} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-zinc-200 py-3 text-sm font-bold text-zinc-500 hover:bg-zinc-50 transition-colors">
            <ChevronLeft size={18} /> {step === "basic" ? "Cancel" : "Previous"}
          </motion.button>
          
          {step !== "documents" ? (
          <motion.button 
            whileHover={{ x: 2 }} 
            whileTap={{ scale: 0.98 }} 
            onClick={handleNext} 
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#074185] py-3 text-sm font-bold text-white hover:bg-[#074185]/90 shadow-lg shadow-[#074185]/20"
          >
            Next <ChevronRight size={18} />
          </motion.button>
        ) : (
          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }} 
            onClick={handleSubmit} 
            disabled={loading} 
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#074185] to-[#55bbc5] py-3 text-sm font-bold text-white hover:opacity-90 shadow-lg shadow-[#074185]/20 disabled:opacity-50 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {loading ? "Registering..." : "Submit Profile"}
          </motion.button>
        )}
      </div>
      )}
    </div>
  )
}
