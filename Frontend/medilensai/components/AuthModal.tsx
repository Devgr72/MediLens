"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Chrome, ArrowRight, Eye, EyeOff } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Center Wrapper */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="relative w-full max-w-[400px] rounded-[24px] bg-gradient-to-r from-[#074185] via-[#55bbc5] to-[#074185] p-[3px] shadow-[0_32px_80px_-16px_rgba(7,65,133,0.2)]"
            >
              <div className="relative w-full overflow-hidden rounded-[21px] bg-white">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-all hover:bg-zinc-200 hover:text-black active:scale-95 z-20"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>

                <div className="px-8 pb-8 pt-8">
                  {/* Header */}
                  <div className="mb-6 text-center">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                    <h2 className="text-3xl font-extrabold tracking-tight text-[#074185]">
                      Welcome Back
                    </h2>
                    <p className="mt-2 text-sm font-medium text-zinc-500">
                      Enter your credentials to access your account
                    </p>
                    </motion.div>
                  </div>

                {/* Form */}
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()} autoComplete="off">
                  <div className="group relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#074185] transition-colors" size={18} />
                    <input
                      type="email"
                      name="emailAddress"
                      placeholder="Email Address"
                      autoComplete="off"
                      className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-10 py-3.5 text-sm font-bold text-[#074185] outline-none transition-all placeholder:text-zinc-400 placeholder:font-medium hover:border-zinc-300 focus:bg-white focus:border-[#074185] focus:ring-4 focus:ring-[#074185]/10 shadow-sm"
                    />
                  </div>

                  <div className="group relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#074185] transition-colors" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="securityKey"
                      placeholder="Password"
                      autoComplete="new-password"
                      className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-10 py-3.5 text-sm font-bold text-[#074185] outline-none transition-all placeholder:text-zinc-400 placeholder:font-medium hover:border-zinc-300 focus:bg-white focus:border-[#074185] focus:ring-4 focus:ring-[#074185]/10 shadow-sm"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#074185] transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button type="button" className="text-xs font-bold text-zinc-500 hover:text-[#074185] hover:underline transition-colors mt-[-4px]">
                      Forgot Password?
                    </button>
                  </div>

                  <button className="group relative mt-2 w-full overflow-hidden rounded-xl bg-[#074185] py-3.5 font-bold text-white shadow-lg shadow-[#074185]/20 transition-all hover:scale-[1.01] hover:shadow-[#074185]/30 active:scale-[0.99]">
                    <span className="relative z-10 flex items-center justify-center">
                      Login
                    </span>
                    <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </button>
                </form>

                {/* Divider */}
                <div className="my-8 flex items-center gap-4">
                  <div className="h-px flex-1 bg-zinc-200" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#074185]">or continue with</span>
                  <div className="h-px flex-1 bg-zinc-200" />
                </div>

                {/* Social Login */}
                <div>
                  <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-white border border-zinc-200 py-3.5 text-sm font-bold text-zinc-700 transition-all hover:bg-zinc-50 hover:border-zinc-300 shadow-sm">
                    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    Continue with Google
                  </button>
                </div>

                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
