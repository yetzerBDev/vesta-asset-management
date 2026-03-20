"use client";

import { motion } from "framer-motion";
import { Package } from "lucide-react";
import type { Activo } from "@/types/database";

/* ── Mapa de estados → colores (MD3 tokens de globals.css) ── */
const estadoConfig: Record<string, { label: string; dot: string; text: string }> = {
  activo:        { label: "Activo",        dot: "bg-secondary",         text: "text-secondary" },
  mantenimiento: { label: "Mantenimiento", dot: "bg-tertiary-fixed-dim", text: "text-tertiary" },
  en_reparacion: { label: "En Reparación", dot: "bg-tertiary-fixed-dim", text: "text-tertiary" },
  baja:          { label: "Baja",          dot: "bg-error",             text: "text-error" },
};

const fallbackEstado = { label: "Desconocido", dot: "bg-outline", text: "text-outline" };

function formatLempiras(monto: number) {
  return `L ${monto.toLocaleString("es-HN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/* ── Skeleton ── */
function SkeletonRow() {
  return (
    <div className="flex items-center justify-between animate-pulse">
      <div className="flex gap-6 items-center">
        <div className="w-14 h-14 bg-surface-container rounded-lg" />
        <div className="space-y-2">
          <div className="w-40 h-4 bg-surface-container rounded" />
          <div className="w-28 h-3 bg-surface-container-high rounded" />
        </div>
      </div>
      <div className="space-y-2 text-right">
        <div className="w-20 h-4 bg-surface-container rounded ml-auto" />
        <div className="w-16 h-3 bg-surface-container-high rounded ml-auto" />
      </div>
    </div>
  );
}

/* ── Componente principal ── */
interface AssetListProps {
  activos: Activo[];
  loading: boolean;
}

export default function AssetList({ activos, loading }: AssetListProps) {
  // Últimos 5 activos por fecha de compra
  const recientes = [...activos]
    .sort((a, b) => new Date(b.fecha_compra).getTime() - new Date(a.fecha_compra).getTime())
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-surface-container-lowest rounded-xl p-10 shadow-[0_12px_40px_rgba(0,21,42,0.04)]"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-xl font-bold font-headline text-primary">
          Activos Recientes
        </h3>
        <a
          className="text-primary text-xs font-semibold underline underline-offset-4 hover:text-primary-container transition-colors"
          href="#"
        >
          Ver Inventario Completo
        </a>
      </div>

      {/* Lista */}
      <div className="space-y-8">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
          : recientes.map((activo, i) => {
              const estado = estadoConfig[activo.estado] ?? fallbackEstado;

              return (
                <motion.div
                  key={activo.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.4 + i * 0.08,
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="flex items-center justify-between group"
                >
                  {/* Izquierda: ícono + info */}
                  <div className="flex gap-6 items-center min-w-0">
                    <div className="w-14 h-14 bg-surface rounded-lg flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-primary/40" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-primary truncate">
                        {activo.nombre_equipo}
                      </p>
                      <p className="text-xs font-light text-on-surface-variant">
                        ID: {activo.codigo_qr}
                      </p>
                    </div>
                  </div>

                  {/* Derecha: precio + estado */}
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-semibold text-primary">
                      {formatLempiras(activo.costo_inicial)}
                    </p>
                    <div className="flex items-center gap-1 justify-end">
                      <span className={`w-2 h-2 rounded-full ${estado.dot}`} />
                      <span
                        className={`text-[10px] font-bold uppercase tracking-tighter ${estado.text}`}
                      >
                        {estado.label}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}

        {/* Estado vacío */}
        {!loading && recientes.length === 0 && (
          <p className="text-center text-on-surface-variant/60 text-sm py-8">
            No hay activos registrados aún.
          </p>
        )}
      </div>
    </motion.div>
  );
}
