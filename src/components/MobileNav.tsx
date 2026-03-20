"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Package,
  DollarSign,
  Wrench,
  Store,
  ClipboardCheck,
  HelpCircle,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Inventario", icon: Package },
  { href: "/financials", label: "Finanzas", icon: DollarSign },
  { href: "/operations", label: "Operaciones", icon: Wrench },
  { href: "/vendors", label: "Proveedores", icon: Store },
  { href: "/audit", label: "Auditoría", icon: ClipboardCheck },
  { href: "/help", label: "Centro de Ayuda", icon: HelpCircle },
  { href: "/signout", label: "Cerrar Sesión", icon: LogOut },
];

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileNav({ open, onClose }: MobileNavProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          />
          {/* Panel */}
          <motion.nav
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-screen w-64 bg-[#f3f4f5] dark:bg-[#00152a] z-50 p-6 flex flex-col gap-4 lg:hidden"
          >
            <div className="mb-4">
              <h2 className="text-lg font-bold font-headline tracking-tight text-[#00152a] dark:text-white uppercase">
                VESTA
              </h2>
              <p className="font-label text-[10px] font-light opacity-60">
                Gestión de Activos
              </p>
            </div>
            {navItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * i }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 text-[#191c1d]/70 dark:text-white/70 hover:bg-white/50 dark:hover:bg-white/5 rounded-lg transition-all"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-label text-sm">{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
