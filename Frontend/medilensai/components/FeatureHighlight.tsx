"use client";

import { motion } from "framer-motion";
import { Gauge, Lock, LifeBuoy } from "lucide-react";

const items = [
  {
    title: "Instant Analysis",
    description: "Get clinical-grade insights in under 30 seconds using our proprietary transformer model.",
    icon: <Gauge size={24} />,
    color: "bg-[#074185]/20 text-[#55bbc5]",
    glow: "shadow-[#55bbc5]/20",
  },
  {
    title: "Private & Secure",
    description: "Your data is end-to-end encrypted and never shared. We prioritize medical ethics and privacy.",
    icon: <Lock size={24} />,
    color: "bg-[#55bbc5]/20 text-[#55bbc5]",
    glow: "shadow-[#55bbc5]/20",
  },
  {
    title: "First Aid Guidance",
    description: "Immediate, actionable steps to take while waiting for professional medical assistance.",
    icon: <LifeBuoy size={24} />,
    color: "bg-[#55bbc5]/20 text-[#55bbc5]",
    glow: "shadow-[#55bbc5]/20",
  },
];

export default function FeatureHighlight() {
  return (
    <section className="bg-[#021831] py-24 px-6 overflow-hidden relative">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 md:grid-cols-3">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="flex flex-col items-center text-center group"
            >
              <div className={`mb-8 flex h-16 w-16 items-center justify-center rounded-full ${item.color} shadow-2xl ${item.glow} transition-transform duration-500 group-hover:scale-110`}>
                {item.icon}
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white tracking-tight">
                {item.title}
              </h3>
              <p className="max-w-xs text-zinc-400 leading-relaxed font-light">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Decorative gradient */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#074185]/10 blur-[120px]" />
    </section>
  );
}
