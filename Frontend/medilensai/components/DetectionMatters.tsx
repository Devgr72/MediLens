"use client";

import { motion } from "framer-motion";

const metrics = [
  {
    value: "70%",
    label: "of serious conditions start with minor symptoms",
  },
  {
    value: "3x",
    label: "faster detection with AI-powered analysis",
  },
  {
    value: "24/7",
    label: "always available health monitoring",
  },
];

export default function DetectionMatters() {
  return (
    <section className="bg-white pt-12 pb-12 px-6 border-t border-zinc-50">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 text-4xl font-bold tracking-tight text-[#074185] md:text-5xl lg:text-6xl"
          >
            Why Early Symptom Detection <br />
            <span className="text-[#55bbc5]">Matters</span>
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-2xl"
          >
            <p className="text-xl font-medium text-zinc-500 leading-relaxed">
              Identify health risks early with instant, AI-powered triage guidance for every symptom.
            </p>
          </motion.div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mt-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group flex flex-col items-center justify-center rounded-[32px] bg-zinc-50/50 p-6 text-center ring-1 ring-zinc-100 transition-all hover:bg-white hover:shadow-2xl hover:shadow-[#074185]/10 hover:ring-[#074185]/20"
            >
              <div className="mb-2 text-4xl font-black tracking-tighter text-[#074185] md:text-5xl transition-transform group-hover:scale-110">
                {metric.value}
              </div>
              <p className="text-sm font-semibold leading-relaxed text-zinc-500 max-w-[150px]">
                {metric.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
