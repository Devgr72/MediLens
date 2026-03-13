"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck, ChevronRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white px-6 pt-12 pb-6 lg:pt-10 lg:pb-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[rgba(85,187,197,0.1)] px-4 py-1.5 text-sm font-medium text-[#074185]">
              <span className="h-2 w-2 rounded-full bg-[#074185] animate-pulse" />
              Next-Gen AI Triage System
            </div>
            
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-[#074185] md:text-6xl lg:text-7xl">
              Your Health, <br />
              <span className="text-[#55bbc5]">Decoded.</span>
            </h1>
            
            <p className="mb-10 max-w-xl text-lg leading-relaxed text-zinc-600 lg:mx-0 mx-auto">
              AI-powered medical triage and symptom analysis in seconds. 
              Identify health risks early before minor symptoms turn into serious conditions.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <button className="inline-flex items-center justify-center rounded-2xl bg-[#074185] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-[rgba(7,65,133,0.3)] transition-all hover:bg-[#074185]/90 hover:shadow-[rgba(7,65,133,0.4)]">
                Start Assessment
              </button>
              <button className="inline-flex items-center justify-center rounded-2xl border-2 border-[#074185] bg-white px-8 py-4 text-lg font-semibold text-[#074185] transition-all hover:bg-[#074185]/5">
                How it works
              </button>
            </div>
            
          </motion.div>

          {/* Right Image/Orb */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex-1 lg:max-w-xl"
          >
            <div className="relative aspect-square overflow-hidden rounded-[40px] shadow-2xl ring-1 ring-zinc-200">
              <Image
                src="/assests/hero.png"
                alt="AI Health Orb"
                fill
                className="object-cover"
                priority
              />
              
              {/* Badge */}
              <div className="absolute bottom-6 right-6 flex items-center gap-3 rounded-2xl bg-white/95 backdrop-blur-md px-5 py-3 shadow-xl ring-1 ring-zinc-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Security</p>
                  <p className="text-sm font-bold text-[#074185]">HIPAA Compliant</p>
                </div>
              </div>
            </div>
            
            {/* Background elements */}
            <div className="absolute -z-10 -bottom-10 -right-10 h-64 w-64 rounded-full bg-[#55bbc5]/5 blur-3xl" />
            <div className="absolute -z-10 -top-10 -left-10 h-64 w-64 rounded-full bg-[#074185]/5 blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
