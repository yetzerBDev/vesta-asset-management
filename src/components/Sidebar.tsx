"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  DollarSign,
  Wrench,
  Store,
  ClipboardCheck,
  HelpCircle,
  LogOut,
  Building2,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Inventario", icon: Package },
  { href: "/financials", label: "Finanzas", icon: DollarSign },
  { href: "/operations", label: "Operaciones", icon: Wrench },
  { href: "/vendors", label: "Proveedores", icon: Store },
  { href: "/audit", label: "Auditoría", icon: ClipboardCheck },
];

const bottomItems = [
  { href: "/help", label: "Centro de Ayuda", icon: HelpCircle },
  { href: "/signout", label: "Cerrar Sesión", icon: LogOut },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-[#f3f4f5] dark:bg-[#00152a] text-[#00152a] dark:text-[#f8f9fa] z-40 p-6 gap-8">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold font-headline tracking-tight text-[#00152a] dark:text-white uppercase">
            VESTA
          </h2>
          <p className="font-label text-[10px] font-light opacity-60">
            Gestión de Activos
          </p>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item, i) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * i }}
            >
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-white dark:bg-[#102a43] text-[#00152a] dark:text-white font-semibold shadow-sm"
                    : "text-[#191c1d]/70 dark:text-white/70 hover:bg-white/50 dark:hover:bg-white/5 hover:translate-x-1"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-label text-sm">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom Links */}
      <div className="pt-6 border-t border-outline-variant/10 flex flex-col gap-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-[#191c1d]/70 dark:text-white/70 hover:translate-x-1 transition-all"
            >
              <Icon className="w-5 h-5" />
              <span className="font-label text-sm">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
