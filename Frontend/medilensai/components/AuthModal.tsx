"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"
import { login, signup, verifyOTP, resendOTP, AuthResponse } from "./api/auth"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess?: (token: string, user: AuthResponse["user"]) => void
}

type Screen = "login" | "signup" | "otp"

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [mounted, setMounted] = useState(false)
  const [screen, setScreen] = useState<Screen>("login")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])

  // Pending email for OTP (after signup)
  const [pendingEmail, setPendingEmail] = useState("")

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      setError("")
      setSuccess("")
    } else {
      document.body.style.overflow = "unset"
    }
    return () => { document.body.style.overflow = "unset" }
  }, [isOpen])

  // Reset state when switching screens
  const switchScreen = (s: Screen) => {
    setError("")
    setSuccess("")
    setScreen(s)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await login(email, password)
      setSuccess("Logged in successfully!")
      setTimeout(() => {
        onLoginSuccess?.(res.access_token, res.user)
        onClose()
      }, 800)
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
      else setError("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await signup(name, email, password)
      setPendingEmail(email)
      setSuccess("Account created! Check your email for the OTP.")
      setTimeout(() => {
        setSuccess("")
        switchScreen("otp")
      }, 1200)
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
      else setError("Signup failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    // Auto-focus next box
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`)
      next?.focus()
    }
  }

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`)
      prev?.focus()
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join("")
    if (otpCode.length < 6) { setError("Please enter the complete 6-digit OTP."); return }
    setError("")
    setLoading(true)
    try {
      await verifyOTP(pendingEmail, otpCode)
      setSuccess("Email verified! You can now log in.")
      setTimeout(() => {
        setSuccess("")
        setOtp(["", "", "", "", "", ""])
        setEmail(pendingEmail)
        setPassword("")
        switchScreen("login")
      }, 1500)
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
      else setError("OTP verification failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setError("")
    setLoading(true)
    try {
      await resendOTP(pendingEmail)
      setSuccess("OTP resent! Check your inbox.")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="relative w-full max-w-[420px] rounded-[24px] bg-gradient-to-r from-[#074185] via-[#55bbc5] to-[#074185] p-[2px] shadow-2xl"
            >
              <div className="relative w-full overflow-hidden rounded-[22px] bg-white">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-all hover:bg-zinc-200 hover:text-black active:scale-95 z-20"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>

                <div className="px-8 pb-8 pt-8">

                  {/* ── LOGIN SCREEN ── */}
                  <AnimatePresence mode="wait">
                    {screen === "login" && (
                      <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                        <div className="mb-6 text-center">
                          <h2 className="text-3xl font-extrabold tracking-tight text-[#074185]">Welcome Back</h2>
                          <p className="mt-1 text-sm font-medium text-zinc-500">Enter your credentials to continue</p>
                        </div>
                        <form className="space-y-4" onSubmit={handleLogin}>
                          <div className="group relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#074185] transition-colors" size={18} />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" autoComplete="email" required className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-10 py-3.5 text-sm font-bold text-[#074185] outline-none transition-all placeholder:text-zinc-400 hover:border-zinc-300 focus:bg-white focus:border-[#074185] focus:ring-4 focus:ring-[#074185]/10" />
                          </div>
                          <div className="group relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#074185] transition-colors" size={18} />
                            <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" required className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-10 py-3.5 text-sm font-bold text-[#074185] outline-none transition-all placeholder:text-zinc-400 hover:border-zinc-300 focus:bg-white focus:border-[#074185] focus:ring-4 focus:ring-[#074185]/10" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#074185] transition-colors">
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          <div className="flex justify-end">
                            <button type="button" className="text-xs font-bold text-zinc-400 hover:text-[#074185] hover:underline transition-colors">Forgot Password?</button>
                          </div>
                          {error && <p className="rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-xs font-semibold text-red-600">{error}</p>}
                          {success && (
                            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-100 px-4 py-2.5 text-xs font-semibold text-green-600">
                              <CheckCircle2 size={14} /> {success}
                            </div>
                          )}
                          <button type="submit" disabled={loading} className="group relative mt-2 w-full overflow-hidden rounded-xl bg-[#074185] py-3.5 font-bold text-white shadow-lg shadow-[#074185]/20 transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.99]">
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                              {loading ? "Logging in…" : "Login"}
                            </span>
                            <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                          </button>
                        </form>
                        <div className="my-6 flex items-center gap-3">
                          <div className="h-px flex-1 bg-zinc-200" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#074185]">or continue with</span>
                          <div className="h-px flex-1 bg-zinc-200" />
                        </div>
                        <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-white border border-zinc-200 py-3.5 text-sm font-bold text-zinc-700 transition-all hover:bg-zinc-50 hover:border-zinc-300 shadow-sm">
                          <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                          </svg>
                          Continue with Google
                        </button>
                        <p className="mt-6 text-center text-sm font-semibold text-zinc-500">
                          Don&apos;t have an account?{" "}
                          <button onClick={() => switchScreen("signup")} className="font-bold text-[#074185] hover:underline transition-colors">Sign up</button>
                        </p>
                      </motion.div>
                    )}

                    {/* ── SIGNUP SCREEN ── */}
                    {screen === "signup" && (
                      <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                        <div className="mb-6 text-center">
                          <h2 className="text-3xl font-extrabold tracking-tight text-[#074185]">Create Account</h2>
                          <p className="mt-1 text-sm font-medium text-zinc-500">Join MediLens AI today</p>
                        </div>
                        <form className="space-y-4" onSubmit={handleSignup}>
                          <div className="group relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#074185] transition-colors" size={18} />
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" autoComplete="name" required className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-10 py-3.5 text-sm font-bold text-[#074185] outline-none transition-all placeholder:text-zinc-400 hover:border-zinc-300 focus:bg-white focus:border-[#074185] focus:ring-4 focus:ring-[#074185]/10" />
                          </div>
                          <div className="group relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#074185] transition-colors" size={18} />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" autoComplete="email" required className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-10 py-3.5 text-sm font-bold text-[#074185] outline-none transition-all placeholder:text-zinc-400 hover:border-zinc-300 focus:bg-white focus:border-[#074185] focus:ring-4 focus:ring-[#074185]/10" />
                          </div>
                          <div className="group relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#074185] transition-colors" size={18} />
                            <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" autoComplete="new-password" required className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-10 py-3.5 text-sm font-bold text-[#074185] outline-none transition-all placeholder:text-zinc-400 hover:border-zinc-300 focus:bg-white focus:border-[#074185] focus:ring-4 focus:ring-[#074185]/10" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#074185] transition-colors">
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          {error && <p className="rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-xs font-semibold text-red-600">{error}</p>}
                          {success && (
                            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-100 px-4 py-2.5 text-xs font-semibold text-green-600">
                              <CheckCircle2 size={14} /> {success}
                            </div>
                          )}
                          <button type="submit" disabled={loading} className="group relative mt-2 w-full overflow-hidden rounded-xl bg-[#074185] py-3.5 font-bold text-white shadow-lg shadow-[#074185]/20 transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.99]">
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                              {loading ? "Creating account…" : "Create Account"}
                            </span>
                            <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                          </button>
                        </form>
                        <p className="mt-6 text-center text-sm font-semibold text-zinc-500">
                          Already have an account?{" "}
                          <button onClick={() => switchScreen("login")} className="font-bold text-[#074185] hover:underline transition-colors">Log in</button>
                        </p>
                      </motion.div>
                    )}

                    {/* ── OTP SCREEN ── */}
                    {screen === "otp" && (
                      <motion.div key="otp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                        <div className="mb-6 text-center">
                          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#074185]/10">
                            <Mail size={24} className="text-[#074185]" />
                          </div>
                          <h2 className="text-2xl font-extrabold tracking-tight text-[#074185]">Check Your Email</h2>
                          <p className="mt-1.5 text-sm font-medium text-zinc-500">
                            We sent a 6-digit code to<br />
                            <span className="font-bold text-[#074185]">{pendingEmail}</span>
                          </p>
                        </div>
                        <form onSubmit={handleVerifyOTP}>
                          <div className="mb-6 flex justify-center gap-3">
                            {otp.map((digit, i) => (
                              <input
                                key={i}
                                id={`otp-${i}`}
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
                          {error && <p className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-xs font-semibold text-red-600">{error}</p>}
                          {success && (
                            <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-100 px-4 py-2.5 text-xs font-semibold text-green-600">
                              <CheckCircle2 size={14} /> {success}
                            </div>
                          )}
                          <button type="submit" disabled={loading} className="group relative w-full overflow-hidden rounded-xl bg-[#074185] py-3.5 font-bold text-white shadow-lg shadow-[#074185]/20 transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.99]">
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                              {loading ? "Verifying…" : "Verify Email"}
                            </span>
                            <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                          </button>
                        </form>
                        <div className="mt-5 text-center text-sm text-zinc-500">
                          Didn&apos;t receive the code?{" "}
                          <button onClick={handleResendOTP} disabled={loading} className="font-bold text-[#074185] hover:underline disabled:opacity-50">
                            Resend OTP
                          </button>
                        </div>
                        <div className="mt-2 text-center">
                          <button onClick={() => switchScreen("login")} className="text-xs font-medium text-zinc-400 hover:text-[#074185] hover:underline transition-colors">
                            ← Back to Login
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default AuthModal
