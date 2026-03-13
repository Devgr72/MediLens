"use client";

import Link from "next/link";
import Image from "next/image";
import { Twitter, Linkedin, Github, Mail, ShieldCheck } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks: Record<string, { name: string; href: string; icon?: React.ReactNode }[]> = {
    Solutions: [
      { name: "Symptom Checker", href: "#" },
      { name: "AI Triage Guide", href: "#" },
      { name: "Instant Analysis", href: "#" },
    ],
    Company: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Contact Us", href: "#" },
    ],
    Social: [
      { name: "Twitter", href: "#", icon: <Twitter size={18} /> },
      { name: "LinkedIn", href: "#", icon: <Linkedin size={18} /> },
      { name: "GitHub", href: "#", icon: <Github size={18} /> },
    ],
  };

  return (
    <footer className="border-t border-zinc-100 bg-white pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 md:grid-cols-2">
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl shadow-md ring-1 ring-zinc-100">
                <Image
                  src="/assests/logo.png"
                  alt="MediLens AI Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-2xl font-black tracking-tight text-[#074185]">
                MediLens AI
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-zinc-500 font-medium">
              Empowering individuals with instant, AI-driven healthcare guidance. 
              Always available, scientifically grounded.
            </p>
            <div className="flex items-center gap-2 rounded-full bg-blue-50/50 px-4 py-2 w-fit">
              <span className="text-sm font-bold text-[#074185]">Made in India</span>
              <span className="text-lg">🇮🇳</span>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="flex flex-col gap-6">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#074185]/60">
                {title}
              </h3>
              <ul className="flex flex-col gap-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-2 text-sm font-semibold text-zinc-500 transition-colors hover:text-[#074185]"
                    >
                      {link.icon && (
                        <span className="text-zinc-400 group-hover:text-[#074185] transition-colors">
                          {link.icon}
                        </span>
                      )}
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 border-t border-zinc-100 pt-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-4 text-xs font-medium text-zinc-400">
              <span>© {currentYear} MediLens AI. All rights reserved.</span>
              <span className="hidden h-1 w-1 rounded-full bg-zinc-300 md:block" />
              <span className="hidden md:block">Hackathon Edition</span>
            </div>
            
            <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-1.5 ring-1 ring-zinc-100">
              <ShieldCheck className="text-[#55bbc5]" size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                HIPAA Compliant Platform
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
