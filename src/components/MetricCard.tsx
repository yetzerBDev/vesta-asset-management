"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { SkeletonCard } from "./Skeletons";

interface MetricCardProps {
  icon: LucideIcon;
  iconBg: string;
  titulo: string;
  valor: string;
  subtitulo: string;
  loading?: boolean;
  indice: number;
  badge?: {
    label: string;
    color: string;      // text color
    bgColor?: string;   // background color (optional)
    pulso?: boolean;     // animated dot
  };
  barra?: {
    porcentaje: number;  // 0-100
  };
  borderLeft?: string;   // border-l color class
}

export default function MetricCard({
  icon: Icon,
  iconBg,
  titulo,
  valor,
  subtitulo,
  loading,
  indice,
  badge,
  barra,
  borderLeft,
}: MetricCardProps) {
  if (loading) return <SkeletonCard />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: indice * 0.1,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={`bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_40px_rgba(0,21,42,0.04)] relative overflow-hidden flex flex-col gap-6 ${
        borderLeft
          ? `border-l-4 ${borderLeft}`
          : "border border-outline-variant/10"
      }`}
    >
      {/* Decoración de fondo (solo primera tarjeta) */}
      {indice === 0 && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-12 -mt-12 rounded-full blur-3xl" />
      )}

      {/* Encabezado: ícono + badge o barra */}
      <div className="flex items-center justify-between">
        <div
          className={`w-12 h-12 ${iconBg} flex items-center justify-center rounded-lg`}
        >
          <Icon className="w-5 h-5" />
        </div>

        {badge && (
          <span
            className={`text-[10px] uppercase tracking-widest font-bold ${badge.color} flex items-center gap-1 ${
              badge.bgColor ? `${badge.bgColor} px-2 py-0.5 rounded` : ""
            }`}
          >
            {badge.pulso && (
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${badge.color.replace("text-", "bg-")}`}
              />
            )}
            {badge.label}
          </span>
        )}

        {barra && (
          <div className="w-24 h-6 bg-surface-container-low rounded relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-primary/10"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(barra.porcentaje, 100)}%` }}
              transition={{ duration: 0.8, delay: 0.3 + indice * 0.1 }}
            />
          </div>
        )}
      </div>

      {/* Contenido */}
      <div>
        <p className="text-on-surface-variant text-sm font-light mb-1">
          {titulo}
        </p>
        <h2 className="text-2xl lg:text-3xl font-bold font-headline text-primary">
          {valor}
        </h2>
        <p className="text-[11px] font-medium text-on-surface-variant/60 mt-4 uppercase tracking-tighter">
          {subtitulo}
        </p>
      </div>
    </motion.div>
  );
}
