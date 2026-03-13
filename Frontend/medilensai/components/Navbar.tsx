"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, User, Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AuthModal } from "./AuthModal";
import { AuthResponse } from "./api/auth";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthResponse["user"] | null>(null);

  const handleLoginSuccess = (_token: string, user: AuthResponse["user"]) => {
    localStorage.setItem("medilens_token", _token);
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("medilens_token");
    setCurrentUser(null);
  };

  const isLoggedIn = !!currentUser;

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
            <Link
              key={item}
              href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
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
            </Link>
          ))}
        </div>

        {/* Right Actions - Desktop */}
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden items-center gap-2 sm:flex">
            <button className="rounded-full p-2.5 text-zinc-500 hover:bg-zinc-50 transition-colors">
              <Bell size={20} />
            </button>
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#074185] text-xs font-bold text-white">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-zinc-700">
                    {currentUser.name.split(" ")[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="rounded-full p-2.5 text-zinc-500 hover:bg-zinc-100 hover:text-red-500 transition-colors"
                >
                  <LogOut size={18} />
                </button>
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
              <div className="flex items-center justify-around rounded-2xl bg-zinc-50 p-4">
                <button className="flex items-center gap-2 font-semibold text-zinc-600">
                  <Bell size={20} /> Notifications
                </button>
                <div className="h-6 w-px bg-zinc-200" />
                {isLoggedIn ? (
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#074185] text-xs font-bold text-white">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-zinc-700">{currentUser.name.split(" ")[0]}</span>
                    <button onClick={handleLogout} className="ml-1 text-zinc-500 hover:text-red-500">
                      <LogOut size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 font-bold text-[#074185]"
                  >
                    <User size={20} /> Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </nav>
  );
}
