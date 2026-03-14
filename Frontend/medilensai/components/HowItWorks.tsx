"use client";

import { motion } from "framer-motion";
import { UserPlus, Stethoscope, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: <UserPlus className="text-blue-600" size={24} />,
    title: "Select Profile",
    description: "Choose a saved family member or enter details manually for a personalized assessment.",
    color: "bg-blue-50",
    borderColor: "border-blue-100",
  },
  {
    icon: <Stethoscope className="text-[#55bbc5]" size={24} />,
    title: "Describe Symptoms",
    description: "Type your symptoms, use voice input, or upload photos for visual conditions like rashes.",
    color: "bg-[#55bbc5]/5",
    borderColor: "border-[#55bbc5]/10",
  },
  {
    icon: <ShieldCheck className="text-[#074185]" size={24} />,
    title: "Instant Results",
    description: "Receive an AI-powered triage level (Green to Red) and actionable next steps in seconds.",
    color: "bg-[#074185]/5",
    borderColor: "border-[#074185]/10",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24 px-6 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#074185] text-[#074185] text-sm font-bold mb-6"
          >
            How it works
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl lg:text-6xl mb-6"
          >
            Three Simple Steps to <span className="text-[#074185]">Safety</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-zinc-500 font-medium max-w-2xl mx-auto"
          >
            MediLens AI simplifies the medical assessment process, providing fast 
            and accurate triage guidance when you need it most.
          </motion.p>
        </div>

        <div className="relative mt-20">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-zinc-100 -z-10" />

          <div className="grid gap-12 lg:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div className={cn(
                  "relative mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] border-2 shadow-sm transition-all duration-500",
                  "group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl",
                  step.color, step.borderColor
                )}>
                  <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-white border border-zinc-100 shadow-sm flex items-center justify-center text-sm font-black text-zinc-400">
                    0{index + 1}
                  </div>
                  {step.icon}
                </div>
                
                <h3 className="mb-4 text-2xl font-bold text-zinc-900">{step.title}</h3>
                <p className="text-zinc-500 font-medium leading-relaxed max-w-[280px]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
