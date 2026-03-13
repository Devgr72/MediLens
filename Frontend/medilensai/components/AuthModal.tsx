"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck, KeyRound } from "lucide-react"
import Script from "next/script"
import toast from "react-hot-toast"
import {
  login,
  signup,
  verifyOTP,
  resendOTP,
  googleLogin,
  forgotPassword,
  resetPassword,
  AuthResponse
} from "./api/auth"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess?: (token: string, user: AuthResponse["user"]) => void
}

type Screen = "login" | "signup" | "otp" | "forgot_password" | "reset_password"

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [mounted, setMounted] = useState(false)
  const [screen, setScreen] = useState<Screen>("login")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const error = ""
  const setError = (msg: string) => { if (msg) toast.error(msg, { duration: 3000 }) }
  const success = ""
  const setSuccess = (msg: string) => { if (msg) toast.success(msg, { duration: 3000 }) }

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])

  // Pending email for OTP or reset
  const [pendingEmail, setPendingEmail] = useState("")

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      setError("")
      setSuccess("")
      // Reset to login if it was closed elsewhere
      if (screen === "otp" && !pendingEmail) setScreen("login")
    } else {
      document.body.style.overflow = "unset"
    }
    return () => { document.body.style.overflow = "unset" }
  }, [isOpen])

  // Programmatic Google Button Rendering (to ensure visibility on screen-switches)
  useEffect(() => {
    const initializeGoogle = () => {
      const google = (window as any).google;
      if (google?.accounts?.id && isOpen && (screen === "login" || screen === "signup")) {
        google.accounts.id.initialize({
          client_id: "491944073674-oinr48ljj99uercq4o0iek5svt5ofcft.apps.googleusercontent.com",
          callback: (window as any).onGoogleSignIn,
          context: "signin",
          ux_mode: "popup"
        });

        const containerId = screen === "login" ? "google-signin-button" : "google-signin-button-signup";
        const container = document.getElementById(containerId);
        if (container) {
          google.accounts.id.renderButton(container, {
            type: "standard",
            shape: "pill",
            theme: "outline",
            text: "continue_with",
            size: "large",
            logo_alignment: "left",
            width: 400
          });
        }
      }
    };

    if (isOpen) {
      // Define the callback globally so Google can find it
      (window as any).onGoogleSignIn = async (response: any) => {
        setLoading(true);
        setError("");
        try {
          const res = await googleLogin(response.credential);
          setSuccess("Google login successful!");
          setTimeout(() => {
            onLoginSuccess?.(res.access_token, res.user);
            onClose();
          }, 800);
        } catch (err: unknown) {
          if (err instanceof Error) setError(err.message);
          else setError("Google login failed.");
        } finally {
          setLoading(false);
        }
      };

      // Try to initialize immediately, or wait for script to load
      if ((window as any).google) {
        initializeGoogle();
      } else {
        const check = setInterval(() => {
          if ((window as any).google) {
            initializeGoogle();
            clearInterval(check);
          }
        }, 100);
        setTimeout(() => clearInterval(check), 5000);
      }
    }
  }, [isOpen, screen, onLoginSuccess, onClose])

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await forgotPassword(email)
      setPendingEmail(email)
      setSuccess("Reset code sent! Check your inbox.")
      setTimeout(() => {
        setSuccess("")
        setOtp(["", "", "", "", "", ""])
        switchScreen("reset_password")
      }, 1500)
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return }
    const otpCode = otp.join("")
    if (otpCode.length < 6) { setError("Please enter the complete 6-digit OTP."); return }
    setError("")
    setLoading(true)
    try {
      await resetPassword({ email: pendingEmail, otp: otpCode, new_password: newPassword })
      setSuccess("Password reset successful! You can now log in.")
      setTimeout(() => {
        setSuccess("")
        setEmail(pendingEmail)
        switchScreen("login")
      }, 2000)
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
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
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
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
                className="relative w-full max-w-[480px] rounded-[24px] bg-gradient-to-r from-[#074185] via-[#55bbc5] to-[#074185] p-[2px] shadow-2xl"
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
                    <AnimatePresence mode="wait">

                      {/* ── LOGIN SCREEN ── */}
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
                              <button type="button" onClick={() => switchScreen("forgot_password")} className="text-xs font-bold text-zinc-400 hover:text-[#074185] hover:underline transition-colors">Forgot Password?</button>
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

                          {/* Google One Tap Logic or Button */}
                          <div className="my-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-zinc-200" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#074185]">or continue with</span>
                            <div className="h-px flex-1 bg-zinc-200" />
                          </div>

                          <div className="relative flex justify-center w-full">
                            <div id="google-signin-button" className="flex justify-center w-full"></div>
                          </div>

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

                          {/* Google Auth for Signup */}
                          <div className="my-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-zinc-200" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#074185]">or continue with</span>
                            <div className="h-px flex-1 bg-zinc-200" />
                          </div>

                          <div className="relative flex justify-center w-full">
                            <div id="google-signin-button-signup" className="flex justify-center w-full"></div>
                          </div>

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

                      {/* ── FORGOT PASSWORD SCREEN ── */}
                      {screen === "forgot_password" && (
                        <motion.div key="forgot" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                          <div className="mb-6 text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#074185]/10">
                              <KeyRound size={24} className="text-[#074185]" />
                            </div>
                            <h2 className="text-2xl font-extrabold tracking-tight text-[#074185]">Reset Password</h2>
                            <p className="mt-1 text-sm font-medium text-zinc-500">Enter your email to receive a reset code</p>
                          </div>
                          <form className="space-y-4" onSubmit={handleForgotPassword}>
                            <div className="group relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#074185] transition-colors" size={18} />
                              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" required className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-10 py-3.5 text-sm font-bold text-[#074185] outline-none focus:bg-white focus:border-[#074185]" />
                            </div>
                            {error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600">{error}</p>}
                            {success && <div className="rounded-lg bg-green-50 px-4 py-2.5 text-xs font-semibold text-green-600 underline decoration-green-300">{success}</div>}
                            <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#074185] py-3.5 font-bold text-white shadow-lg shadow-[#074185]/20">
                              {loading ? <Loader2 size={18} className="mx-auto animate-spin" /> : "Send Reset Code"}
                            </button>
                          </form>
                          <div className="mt-6 text-center">
                            <button onClick={() => switchScreen("login")} className="text-xs font-bold text-[#074185] hover:underline transition-colors">← Back to Login</button>
                          </div>
                        </motion.div>
                      )}

                      {/* ── RESET PASSWORD SCREEN ── */}
                      {screen === "reset_password" && (
                        <motion.div key="reset" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                          <div className="mb-6 text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                              <ShieldCheck size={24} className="text-green-600" />
                            </div>
                            <h2 className="text-2xl font-extrabold tracking-tight text-[#074185]">Set New Password</h2>
                            <p className="mt-1 text-sm font-medium text-zinc-500">Check <span className="font-bold">{pendingEmail}</span> for the code</p>
                          </div>
                          <form className="space-y-4" onSubmit={handleResetPassword}>
                            <div className="flex justify-center gap-2 mb-4">
                              {otp.map((digit, i) => (
                                <input
                                  key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                                  onChange={e => handleOTPChange(i, e.target.value)} onKeyDown={e => handleOTPKeyDown(i, e)}
                                  className="h-10 w-10 rounded-lg border-2 border-zinc-200 text-center font-bold text-[#074185] focus:border-[#074185]"
                                />
                              ))}
                            </div>
                            <div className="group relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#074185]" size={18} />
                              <input type={showPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" required className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-10 py-3.5 text-sm font-bold text-[#074185] outline-none focus:border-[#074185]" />
                            </div>
                            <div className="group relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#074185]" size={18} />
                              <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm Password" required className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-10 py-3.5 text-sm font-bold text-[#074185] outline-none focus:border-[#074185]" />
                            </div>
                            {error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600">{error}</p>}
                            <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#074185] py-3.5 font-bold text-white">
                              {loading ? <Loader2 size={18} className="mx-auto animate-spin" /> : "Reset & Login"}
                            </button>
                          </form>
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>,
    document.body
  )
}

export default AuthModal
