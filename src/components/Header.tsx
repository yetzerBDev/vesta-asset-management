"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Bell, Settings, Menu, X } from "lucide-react";
import MobileNav from "./MobileNav";

const headerLinks = [
  { href: "/", label: "Dashboard", active: true },
  { href: "/assets", label: "Assets" },
  { href: "/licenses", label: "Licenses" },
  { href: "/maintenance", label: "Maintenance" },
  { href: "/reports", label: "Reports" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 bg-white/70 dark:bg-[#00152a]/70 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,21,42,0.06)] flex justify-between items-center w-full px-6 lg:px-10 py-4"
      >
        <div className="flex items-center gap-6 lg:gap-12">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-full hover:bg-[#f3f4f5] dark:hover:bg-[#102a43] transition-all"
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-primary dark:text-white" />
            ) : (
              <Menu className="w-5 h-5 text-primary dark:text-white" />
            )}
          </button>

          <div className="text-2xl font-black tracking-tighter text-[#00152a] dark:text-white font-headline">
            VESTA
          </div>

          <nav className="hidden md:flex gap-8 items-center">
            {headerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`font-body text-sm transition-all duration-200 ${
                  link.active
                    ? "text-[#00152a] dark:text-white font-bold border-b-2 border-[#1b6b51] pb-1"
                    : "text-[#191c1d]/60 dark:text-white/60 font-medium hover:text-[#00152a] dark:hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          {/* Search */}
          <div className="relative group hidden sm:block">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-[#43474d]/50" />
            </div>
            <input
              className="bg-[#f3f4f5] border-none rounded-full pl-10 pr-4 py-2 text-sm w-48 lg:w-64 focus:ring-1 focus:ring-primary transition-all focus:outline-none"
              placeholder="Buscar activos..."
              type="text"
            />
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button className="p-2 rounded-full hover:bg-[#f3f4f5] dark:hover:bg-[#102a43] transition-all relative">
              <Bell className="w-5 h-5 text-primary dark:text-white" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full" />
            </button>
            <button className="p-2 rounded-full hover:bg-[#f3f4f5] dark:hover:bg-[#102a43] transition-all">
              <Settings className="w-5 h-5 text-primary dark:text-white" />
            </button>
            <div className="w-10 h-10 rounded-full bg-[#e7e8e9] overflow-hidden border border-[#c3c6ce]/20 flex items-center justify-center">
              <span className="text-sm font-bold text-[#00152a]">YH</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile nav overlay */}
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
