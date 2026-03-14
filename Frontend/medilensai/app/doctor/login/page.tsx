"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { loginDoctor } from "@/components/api/doctor";
import toast from "react-hot-toast";

export default function DoctorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginDoctor(email, password);
      // Explicit backend call will be done later
      setSuccess("Logged in successfully!");
      setTimeout(() => {
        router.push("/doctor/dashboard"); // Modify this to intended target
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-6 mt-16">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-zinc-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#074185]">Doctor Login</h1>
            <p className="mt-2 text-sm text-zinc-500 font-medium">Access your professional dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="group relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#074185] transition-colors" size={18} />
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Email Address" 
                required 
                className="w-full rounded-2xl bg-zinc-50 border border-transparent px-11 py-4 text-sm font-bold text-[#074185] outline-none transition-all placeholder:text-zinc-400 hover:bg-zinc-100 focus:bg-white focus:border-[#074185]/30 focus:shadow-[0_0_15px_-5px_rgba(7,65,133,0.1)]" 
              />
            </div>
            
            <div className="group relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#074185] transition-colors" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Password" 
                required 
                className="w-full rounded-2xl bg-zinc-50 border border-transparent px-11 py-4 text-sm font-bold text-[#074185] outline-none transition-all placeholder:text-zinc-400 hover:bg-zinc-100 focus:bg-white focus:border-[#074185]/30 focus:shadow-[0_0_15px_-5px_rgba(7,65,133,0.1)]" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#074185] transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-xs font-bold text-zinc-400 hover:text-[#074185] hover:underline transition-colors">
                Forgot Password?
              </button>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-semibold text-red-600 animate-in fade-in">
                {error}
              </div>
            )}
            
            {success && (
              <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm font-semibold text-green-600 animate-in fade-in">
                <CheckCircle2 size={16} /> {success}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="group relative w-full overflow-hidden rounded-2xl bg-[#074185] py-4 font-bold text-white shadow-lg shadow-[#074185]/20 transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.98]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? "Logging in..." : "Secure Login"}
              </span>
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-semibold text-zinc-500">
            Are you a new provider?{" "}
            <button onClick={() => router.push("/doctor/signup")} className="font-bold text-[#074185] hover:underline transition-colors">
              Apply here
            </button>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
