"use client";

import { motion } from "framer-motion";
import { Info, Asterisk, Zap, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";

const levels = [
  {
    level: "1",
    title: "Resuscitation",
    subtitle: "IMMEDIATE CARE",
    description: "Life-threatening conditions requiring instant intervention.",
    color: "text-red-600",
    borderColor: "border-red-100",
    bgColor: "bg-red-50/50",
    icon: <Asterisk className="text-red-600" />,
  },
  {
    level: "2",
    title: "Emergent",
    subtitle: "HIGH RISK",
    description: "Potential threat to life or limb. Rapid assessment needed.",
    color: "text-orange-600",
    borderColor: "border-orange-100",
    bgColor: "bg-orange-50/50",
    icon: <Zap className="text-orange-600" />,
  },
  {
    level: "3",
    title: "Urgent",
    subtitle: "STABLE",
    description: "Requires multiple resources but vital signs are stable.",
    color: "text-amber-600",
    borderColor: "border-amber-100",
    bgColor: "bg-amber-50/50",
    icon: <AlertCircle className="text-amber-600" />,
  },
  {
    level: "4",
    title: "Less Urgent",
    subtitle: "MINOR",
    description: "Requires a single resource like an X-ray or stitches.",
    color: "text-[#074185]",
    borderColor: "border-[#074185]/10",
    bgColor: "bg-[#074185]/5",
    icon: <RefreshCw className="text-[#074185]" />,
  },
  {
    level: "5",
    title: "Non-Urgent",
    subtitle: "ROUTINE",
    description: "Minor issues or routine checkups with no testing needed.",
    color: "text-emerald-600",
    borderColor: "border-emerald-100",
    bgColor: "bg-emerald-50/50",
    icon: <CheckCircle2 className="text-emerald-600" />,
  },
];

export default function TriageLevels() {
  return (
    <section className="bg-white pt-4 pb-24 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
          <div className="max-w-xl">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-[#074185]">
              Supported Triage Levels
            </h2>
            <p className="text-lg text-zinc-600">
              Our system uses the Emergency Severity Index (ESI) to categorize your 
              symptoms and guide you to the right care level.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
            <Info size={16} /> Clinically Validated Protocol
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {levels.map((item, index) => (
            <motion.div
              key={item.level}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-3xl border ${item.borderColor} ${item.bgColor} p-4 flex flex-col`}
            >
              {/* Giant Level Number Background */}
              <span className="absolute -right-2 -top-6 select-none text-8xl font-black text-[#074185]/5">
                {item.level}
              </span>

              <div className="relative mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-zinc-200/50">
                {item.icon}
              </div>
              
              <div className="relative mt-auto">
                <h3 className="text-lg font-bold text-[#074185]">{item.title}</h3>
                <p className={`mb-3 text-[10px] font-black uppercase tracking-widest ${item.color}`}>
                  {item.subtitle}
                </p>
                <p className="text-xs leading-relaxed text-zinc-500">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
