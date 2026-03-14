"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DoctorRegistration from "@/components/doctor/DoctorRegistration";

export default function DoctorSignupPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-6 mt-16 pb-20">
        <div className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-zinc-100 flex flex-col">
          <div className="text-center p-8 bg-gradient-to-r from-[#074185]/5 to-[#55bbc5]/5 border-b border-zinc-100">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#074185]">Doctor Application</h1>
            <p className="mt-2 text-sm text-zinc-500 font-medium">Complete your professional profile to join MediLens AI</p>
          </div>
          
          <div className="p-8">
            <DoctorRegistration 
              onSuccess={() => router.push("/doctor/login")}
              onBack={() => router.push("/doctor/login")}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
