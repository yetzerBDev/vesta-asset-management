"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Building2,
  Wrench,
  TrendingDown,
  Plus,
  Monitor,
  CalendarDays,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import type { Activo, Sucursal } from "@/types/database";
import {
  SkeletonCard,
  SkeletonRow,
  SkeletonChart,
  SkeletonAudit,
} from "@/components/Skeletons";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const estadoColor: Record<string, { dot: string; text: string; label: string }> = {
  activo: { dot: "bg-secondary", text: "text-secondary", label: "Activo" },
  mantenimiento: { dot: "bg-tertiary-fixed-dim", text: "text-tertiary", label: "Mantenimiento" },
  baja: { dot: "bg-error", text: "text-error", label: "Baja" },
  en_reparacion: { dot: "bg-tertiary-fixed-dim", text: "text-tertiary", label: "En Reparación" },
};

function formatLempiras(amount: number) {
  return `L ${amount.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Home() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      const [activosRes, sucursalesRes] = await Promise.all([
        supabase
          .from("activos")
          .select("*")
          .order("ultima_modificacion", { ascending: false })
          .limit(5),
        supabase.from("sucursales").select("*"),
      ]);

      if (activosRes.data) setActivos(activosRes.data);
      if (sucursalesRes.data) setSucursales(sucursalesRes.data);
      setLoading(false);
    }

    fetchData();
  }, []);

  // Computed metrics
  const totalValue = activos.reduce((sum, a) => sum + (a.costo_inicial ?? 0), 0);
  const offlineCount = activos.filter(
    (a) => a.estado === "mantenimiento" || a.estado === "en_reparacion" || a.estado === "baja"
  ).length;
  const depreciation = activos.reduce((sum, a) => {
    const rescate = a.valor_rescate ?? 0;
    const costo = a.costo_inicial ?? 0;
    const vida = a.vida_util_anos ?? 1;
    if (vida <= 0) return sum;
    const compra = a.fecha_compra ? new Date(a.fecha_compra) : new Date();
    const yearsElapsed = Math.max(
      0,
      (Date.now() - compra.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );
    const annualDep = (costo - rescate) / vida;
    return sum + Math.min(annualDep * yearsElapsed, costo - rescate);
  }, 0);

  // Distribution by sucursal
  const distribution = sucursales.map((s) => ({
    name: s.nombre,
    count: activos.filter((a) => a.sucursal_id === s.id).length,
  }));
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <main className="flex-1 px-6 lg:px-10 py-8 lg:py-12 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between sm:items-end mb-12 lg:mb-16 gap-4"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold font-headline tracking-tight text-primary mb-2">
            Sovereign Ledger
          </h1>
          <p className="text-on-surface-variant font-light">
            Resumen ejecutivo del capital tecnológico y operativo.
          </p>
        </div>
        <button className="bg-primary text-on-primary px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-semibold shadow-[0_8px_30px_rgb(0,21,42,0.15)] flex items-center gap-2 hover:scale-[0.98] transition-transform active:scale-95 self-start sm:self-auto">
          <Plus className="w-5 h-5" />
          <span>Nuevo Activo</span>
        </button>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16 lg:mb-20">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {/* Total Assets Card */}
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 shadow-[0_12px_40px_rgba(0,21,42,0.04)] relative overflow-hidden flex flex-col gap-6"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-12 -mt-12 rounded-full blur-3xl" />
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-primary text-white flex items-center justify-center rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-secondary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
                  Auditado
                </span>
              </div>
              <div>
                <p className="text-on-surface-variant text-sm font-light mb-1">
                  Total Assets (Property Value)
                </p>
                <h2 className="text-2xl lg:text-3xl font-bold font-headline text-primary">
                  {formatLempiras(totalValue)}
                </h2>
                <p className="text-[11px] font-medium text-on-surface-variant/60 mt-4 uppercase tracking-tighter">
                  Costo histórico de adquisición
                </p>
              </div>
            </motion.div>

            {/* Operational Status Card */}
            <motion.div
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="bg-surface-container-lowest p-8 rounded-xl border-l-4 border-l-tertiary-fixed-dim shadow-[0_12px_40px_rgba(0,21,42,0.04)] flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-tertiary text-white flex items-center justify-center rounded-lg">
                  <Wrench className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-on-tertiary-fixed-variant bg-tertiary-fixed-dim/20 px-2 py-0.5 rounded">
                  Atención
                </span>
              </div>
              <div>
                <p className="text-on-surface-variant text-sm font-light mb-1">
                  Operational Status
                </p>
                <h2 className="text-2xl lg:text-3xl font-bold font-headline text-primary">
                  {offlineCount}
                </h2>
                <p className="text-[11px] font-medium text-on-surface-variant/60 mt-4 uppercase tracking-tighter">
                  Activos fuera de línea / En taller
                </p>
              </div>
            </motion.div>

            {/* Financial Health Card */}
            <motion.div
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 shadow-[0_12px_40px_rgba(0,21,42,0.04)] flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-surface-container text-on-surface-variant flex items-center justify-center rounded-lg">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div className="w-24 h-6 bg-surface-container-low rounded relative overflow-hidden">
                  <div
                    className="absolute inset-0 bg-primary/10"
                    style={{
                      width: totalValue > 0 ? `${Math.min((depreciation / totalValue) * 100, 100)}%` : "0%",
                    }}
                  />
                </div>
              </div>
              <div>
                <p className="text-on-surface-variant text-sm font-light mb-1">
                  Financial Health
                </p>
                <h2 className="text-2xl lg:text-3xl font-bold font-headline text-on-surface-variant">
                  {formatLempiras(depreciation)}
                </h2>
                <p className="text-[11px] font-medium text-on-surface-variant/60 mt-4 uppercase tracking-tighter">
                  Pérdida de valor acumulada
                </p>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Bento Layout */}
      <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Recent Assets Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-6 lg:p-10 shadow-[0_12px_40px_rgba(0,21,42,0.04)]"
        >
          <div className="flex justify-between items-center mb-8 lg:mb-10">
            <h3 className="text-xl font-bold font-headline text-primary">
              Activos Recientes
            </h3>
            <a
              className="text-primary text-xs font-semibold underline underline-offset-4"
              href="#"
            >
              Ver Inventario Completo
            </a>
          </div>
          <div className="space-y-6 lg:space-y-8">
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : activos.length === 0 ? (
              <p className="text-on-surface-variant text-sm text-center py-8">
                No hay activos registrados aún.
              </p>
            ) : (
              activos.map((activo, i) => {
                const estado = estadoColor[activo.estado] ?? {
                  dot: "bg-outline",
                  text: "text-outline",
                  label: activo.estado,
                };
                return (
                  <motion.div
                    key={activo.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex gap-4 lg:gap-6 items-center">
                      <div className="w-12 h-12 lg:w-14 lg:h-14 bg-surface rounded-lg flex items-center justify-center">
                        <Monitor className="w-6 h-6 text-primary/40" />
                      </div>
                      <div>
                        <p className="font-bold text-primary text-sm lg:text-base">
                          {activo.nombre_equipo}
                        </p>
                        <p className="text-xs font-light text-on-surface-variant">
                          QR: {activo.codigo_qr}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
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
              })
            )}
          </div>
        </motion.div>

        {/* Sidebar Column */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 lg:gap-8">
          {/* Distribution Chart */}
          {loading ? (
            <SkeletonChart />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-primary p-8 rounded-xl text-white shadow-[0_12px_40px_rgba(0,21,42,0.1)]"
            >
              <h4 className="text-sm font-semibold opacity-70 mb-8 uppercase tracking-widest">
                Distribución por Sucursal
              </h4>
              {distribution.length === 0 ? (
                <p className="text-sm opacity-50 text-center py-8">
                  Sin datos de sucursales
                </p>
              ) : (
                <>
                  <div className="flex items-end justify-between h-32 gap-3 mb-6">
                    {distribution.map((d) => (
                      <motion.div
                        key={d.name}
                        className="w-full bg-white/10 rounded-t flex items-center justify-center text-[10px] font-bold"
                        initial={{ height: 0 }}
                        animate={{
                          height: `${(d.count / maxCount) * 100}%`,
                        }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                      >
                        {d.count}
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] opacity-60 font-light">
                    {distribution.map((d) => (
                      <span key={d.name} className="truncate max-w-[60px] text-center">
                        {d.name}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Upcoming Audits */}
          {loading ? (
            <SkeletonAudit />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="bg-surface-container-low p-8 rounded-xl flex flex-col gap-6"
            >
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                <h4 className="text-sm font-bold text-primary uppercase">
                  Próximas Auditorías
                </h4>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="bg-white px-2 py-1 rounded text-center min-w-[40px]">
                    <p className="text-[10px] font-bold text-primary">ABR</p>
                    <p className="text-sm font-black leading-tight">15</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Inventario General</p>
                    <p className="text-[10px] text-on-surface-variant font-light">
                      Sede Central — Piso 2
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="bg-white px-2 py-1 rounded text-center min-w-[40px]">
                    <p className="text-[10px] font-bold text-primary">MAY</p>
                    <p className="text-sm font-black leading-tight">08</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Revisión de Licencias</p>
                    <p className="text-[10px] text-on-surface-variant font-light">
                      TI — Software &amp; SaaS
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile FAB */}
      <div className="fixed bottom-8 right-8 lg:hidden z-30">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="bg-primary text-on-primary w-14 h-14 rounded-full shadow-2xl flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </div>
    </main>
  );
}
