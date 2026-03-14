"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, User, Menu, X, LogOut, History, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import HistoryDashboard from "./HistoryDashboard";

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const { isLoggedIn, currentUser, isAuthModalOpen, setIsAuthModalOpen, login, logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLoginSuccess = (_token: string, user: any) => {
    login(_token, user);
    router.push("/assessment");
  };

  const handleLogout = () => {
    setIsLogoutConfirmOpen(true);
    setIsDropdownOpen(false);
  };

  const confirmLogout = () => {
    logout();
    setIsLogoutConfirmOpen(false);
    router.push("/");
  };

  const openHistory = () => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsHistoryOpen(true);
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assests/logo.png"
            alt="MediLens AI Logo"
            width={58}
            height={58}
            className="rounded-xl"
          />
          <span className="text-2xl font-bold tracking-tight text-[#074185]">
            MediLens AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-10 lg:flex">
          {["Home", "History", "Resources"].map((item) => (
            <button
              key={item}
              onClick={item === "History" ? openHistory : () => item === "Home" ? router.push("/") : router.push("/resources")}
              className={cn(
                "group relative text-sm font-semibold transition-all hover:text-[#074185]",
                item === "Home" ? "text-[#074185]" : "text-zinc-500"
              )}
            >
              {item}
              <span
                className={`absolute -bottom-1 left-0 h-0.5 rounded-full transition-all duration-300 ${
                  item === "Home" ? "bg-[#074185] w-full" : "bg-[#55bbc5] w-0 group-hover:w-full"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Right Actions - Desktop */}
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden items-center gap-2 sm:flex">
            <button 
              onClick={() => router.push("/doctor/login")}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-600 transition-all hover:border-[#074185]/30 hover:bg-zinc-50 hover:text-[#074185]"
            >
              Doctor Login
            </button>
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 transition-all hover:border-[#074185]/30 hover:bg-white hover:shadow-md"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#074185] to-[#1e73e8] text-xs font-bold text-white shadow-sm">
                    {currentUser?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-zinc-700">
                    {currentUser?.name?.toLowerCase().split(" ")[0]}
                  </span>
                  <ChevronDown 
                    size={16} 
                    className={cn("text-zinc-400 transition-transform duration-300", isDropdownOpen && "rotate-180")} 
                  />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-2 min-w-[260px] w-max max-w-[320px] origin-top-right rounded-2xl border border-zinc-100 bg-white p-2 shadow-2xl shadow-zinc-200/50 ring-1 ring-black/5"
                    >
                      <div className="mb-2 px-3 py-2 border-b border-zinc-50">
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Account</p>
                        <p className="text-sm font-bold text-[#074185] break-all">{currentUser?.email}</p>
                      </div>

                      {/* NEW: History Link */}
                      <button
                        onClick={openHistory}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#074185]">
                          <History size={18} />
                        </div>
                        Diagnostic History
                      </button>

                      <div className="my-1 h-px bg-zinc-50" />

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                          <LogOut size={18} />
                        </div>
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="rounded-xl bg-[#074185] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#074185]/90 hover:shadow-lg hover:shadow-[#074185]/20"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-xl bg-zinc-50 p-2.5 text-zinc-600 hover:bg-zinc-100 transition-colors lg:hidden"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute left-0 top-full w-full border-b border-zinc-100 bg-white p-8 shadow-2xl lg:hidden">
          <div className="flex flex-col gap-6">
            {["Home", "History", "Resources"].map((item) => (
              <Link
                key={item}
                href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "text-xl font-bold transition-colors",
                  item === "Home" ? "text-[#074185]" : "text-zinc-600"
                )}
              >
                {item}
              </Link>
            ))}

            <div className="mt-2 flex flex-col gap-4 border-t border-zinc-100 pt-8">
                {isLoggedIn ? (
                  <div className="flex w-full flex-col gap-4">
                    <div className="flex items-center gap-3 rounded-2xl bg-zinc-100/50 p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#074185] text-xs font-bold text-white">
                        {currentUser?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-zinc-900 truncate">{currentUser?.name}</span>
                        <span className="text-xs font-medium text-zinc-500 break-all">{currentUser?.email}</span>
                      </div>
                    </div>
                    

                      <button
                        onClick={openHistory}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 p-3 text-sm font-bold text-[#074185] hover:bg-blue-100"
                      >
                        <History size={18} />
                        Diagnostic History
                      </button>

                      <button
                        onClick={handleLogout}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600 hover:bg-red-100"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        router.push("/doctor/login");
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-2 font-semibold text-zinc-600"
                    >
                      <User size={20} /> Doctor Login
                    </button>
                    <div className="h-6 w-px bg-zinc-200" />
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-2 font-bold text-[#074185]"
                    >
                      <User size={20} /> Login
                    </button>
                  </>
                )}
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* History Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {isHistoryOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsHistoryOpen(false)}
                className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full max-w-5xl h-[85vh] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)]"
              >
                <HistoryDashboard onClose={() => setIsHistoryOpen(false)} />
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Logout Confirmation Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {isLogoutConfirmOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-sm rounded-[32px] bg-gradient-to-br from-[#074185] via-[#1e73e8] to-[#55bbc5] p-1 shadow-2xl shadow-zinc-200/50"
              >
                <div className="relative flex flex-col items-center rounded-[30px] bg-white p-8">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <LogOut size={32} />
                  </div>
                  
                  <h3 className="mb-2 text-center text-xl font-bold text-zinc-900">Confirm Logout</h3>
                  <p className="mb-8 text-center text-zinc-500 font-medium">
                    Are you sure you want to logout? You will need to login again to access your assessments.
                  </p>

                  <div className="flex w-full gap-3">
                    <button
                      onClick={() => setIsLogoutConfirmOpen(false)}
                      className="flex-1 rounded-2xl border border-zinc-200 py-3 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmLogout}
                      className="flex-1 rounded-2xl bg-red-500 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 transition-all hover:bg-red-600 hover:shadow-red-300"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </nav>
  );
}
