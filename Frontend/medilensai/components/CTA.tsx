"use client";

import { motion } from "framer-motion";
import { Shield, ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="bg-zinc-50/50 py-12 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-5xl overflow-hidden rounded-[48px] bg-white px-8 py-12 text-center shadow-xl shadow-zinc-200/50 ring-1 ring-zinc-100"
      >
        <div className="relative z-10 flex flex-col items-center">
          {/* Icon */}
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#1e73e8] to-[#55bbc5] shadow-lg shadow-[#1e73e8]/20">
            <Shield className="text-white" size={32} />
          </div>

          {/* Title */}
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl lg:text-6xl">
            Don&apos;t Ignore <span className="bg-gradient-to-r from-[#1e73e8] to-[#55bbc5] bg-clip-text text-transparent">Small Symptoms</span>
          </h2>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-500 font-medium">
            Use MediLens AI to detect health issues early and take action 
            before conditions worsen.
          </p>

          {/* Button */}
          <div className="flex flex-col items-center gap-6">
            <button className="group relative flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1e73e8] to-[#55bbc5] px-10 py-4 text-lg font-bold text-white shadow-xl shadow-[#1e73e8]/30 transition-all hover:scale-105 active:scale-95">
              Start Your AI Health Assessment
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Footer Text */}
            <p className="text-sm font-medium text-zinc-400">
              No sign-up required • Free to use • Results in seconds
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
