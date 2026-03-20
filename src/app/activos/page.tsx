"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, SlidersHorizontal, Calendar } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { ReporteDepreciacion } from "@/types/database";
import AssetModal from "@/components/AssetModal";

/* ── Estado → colores ── */
const estadoConfig: Record<string, { label: string; dot: string; text: string; shadow: string }> = {
  activo:        { label: "Activo",        dot: "bg-secondary",         text: "text-secondary",                shadow: "shadow-[0_0_4px_#1b6b51]" },
  mantenimiento: { label: "Mantenimiento", dot: "bg-tertiary",          text: "text-on-tertiary-container",    shadow: "shadow-[0_0_4px_#270c00]" },
  en_reparacion: { label: "En Reparación", dot: "bg-tertiary-fixed-dim", text: "text-on-tertiary-container",   shadow: "shadow-[0_0_4px_#270c00]" },
  baja:          { label: "Baja",          dot: "bg-error",             text: "text-error",                    shadow: "shadow-[0_0_4px_#ba1a1a]" },
};
const fallbackEstado = { label: "Desconocido", dot: "bg-outline", text: "text-outline", shadow: "" };

type Filtro = "todos" | "activo" | "mantenimiento" | "baja";

const ITEMS_POR_PAGINA = 8;

function formatLempiras(monto: number) {
  return `L ${monto.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/* ── Skeleton de fila ── */
function SkeletonTableRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-5"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-lg bg-surface-container-high" /><div className="space-y-2"><div className="w-32 h-4 bg-surface-container rounded" /><div className="w-20 h-3 bg-surface-container-high rounded" /></div></div></td>
      <td className="px-6 py-5"><div className="w-16 h-5 bg-surface-container rounded-full" /></td>
      <td className="px-6 py-5"><div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-surface-container-high" /><div className="w-24 h-4 bg-surface-container rounded" /></div></td>
      <td className="px-6 py-5"><div className="w-24 h-4 bg-surface-container rounded" /></td>
      <td className="px-6 py-5"><div className="w-16 h-4 bg-surface-container rounded" /></td>
    </tr>
  );
}

export default function ActivosPage() {
  const [datos, setDatos] = useState<ReporteDepreciacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [pagina, setPagina] = useState(1);
  const [seleccionado, setSeleccionado] = useState<ReporteDepreciacion | null>(null);

  useEffect(() => {
    const supabase = createClient();
    async function fetchData() {
      const { data } = await supabase
        .from("reporte_depreciacion")
        .select("*")
        .order("fecha_compra", { ascending: false });
      if (data) setDatos(data as ReporteDepreciacion[]);
      setLoading(false);
    }
    fetchData();
  }, []);

  /* Filtrado */
  const filtrados = useMemo(() => {
    if (filtro === "todos") return datos;
    return datos.filter((a) =>
      filtro === "baja"
        ? a.estado === "baja"
        : filtro === "mantenimiento"
          ? a.estado === "mantenimiento" || a.estado === "en_reparacion"
          : a.estado === "activo"
    );
  }, [datos, filtro]);

  /* Paginación */
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITEMS_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const paginados = filtrados.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  // Reset página al cambiar filtro
  useEffect(() => setPagina(1), [filtro]);

  const filtros: { key: Filtro; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "activo", label: "Activos" },
    { key: "mantenimiento", label: "Mantenimiento" },
    { key: "baja", label: "Baja" },
  ];

  /* Generar botones de página */
  function getPaginasBotones() {
    const pages: (number | "...")[] = [];
    if (totalPaginas <= 5) {
      for (let i = 1; i <= totalPaginas; i++) pages.push(i);
    } else {
      pages.push(1);
      if (paginaActual > 3) pages.push("...");
      for (let i = Math.max(2, paginaActual - 1); i <= Math.min(totalPaginas - 1, paginaActual + 1); i++) {
        pages.push(i);
      }
      if (paginaActual < totalPaginas - 2) pages.push("...");
      pages.push(totalPaginas);
    }
    return pages;
  }

  return (
    <main className="flex-1 px-6 lg:px-10 py-8 lg:py-12 max-w-7xl mx-auto w-full">
      {/* Breadcrumb + Título */}
      <section className="space-y-2 mb-8">
        <nav className="flex text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-medium">
          <Link href="/" className="hover:text-primary transition-colors">VESTA</Link>
          <span className="mx-2">/</span>
          <span className="text-primary">Inventario</span>
        </nav>
        <h1 className="text-3xl lg:text-4xl font-headline font-extrabold tracking-tight text-primary">
          Inventario de Activos
        </h1>
      </section>

      {/* Filtros */}
      <section className="flex flex-wrap items-end justify-between gap-6 border-b border-outline-variant/10 pb-6 mb-8">
        <div className="flex gap-2">
          {filtros.map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${
                filtro === f.key
                  ? "bg-primary text-on-primary font-semibold shadow-sm"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-surface-container-low px-4 py-2 rounded-lg gap-3">
            <Calendar className="w-4 h-4 text-on-surface-variant" />
            <span className="text-xs font-light text-on-surface-variant">Todas las fechas</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-primary border border-outline-variant/20 rounded-lg hover:bg-surface-container-low transition-all">
            <SlidersHorizontal className="w-4 h-4" />
            Más Filtros
          </button>
        </div>
      </section>

      {/* Tabla */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="bg-surface-container-lowest rounded-xl shadow-[0_12px_40px_rgba(0,21,42,0.03)]"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/70">
                  Nombre del Activo
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/70">
                  Categoría
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/70">
                  Responsable
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/70">
                  Valor Actual
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/70">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              <AnimatePresence mode="wait">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonTableRow key={i} />)
                ) : paginados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-on-surface-variant/60 text-sm">
                      No se encontraron activos con este filtro.
                    </td>
                  </tr>
                ) : (
                  paginados.map((activo, i) => {
                    const estado = estadoConfig[activo.estado] ?? fallbackEstado;
                    return (
                      <motion.tr
                        key={activo.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                        onClick={() => setSeleccionado(activo)}
                        className="group hover:bg-surface-container-low/30 transition-colors cursor-pointer"
                      >
                        {/* Nombre */}
                        <td className="px-6 py-5">
                          <div className="min-w-0">
                            <p className="font-headline font-bold text-primary text-sm truncate">
                              {activo.nombre_equipo}
                            </p>
                            <p className="font-label text-xs font-light text-on-surface-variant/60">
                              {activo.codigo_qr}
                            </p>
                          </div>
                        </td>

                        {/* Categoría */}
                        <td className="px-6 py-5">
                          <span className="px-3 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-semibold">
                            {activo.categoria}
                          </span>
                        </td>

                        {/* Responsable */}
                        <td className="px-6 py-5">
                          <span className="text-sm font-medium text-on-surface">
                            {activo.responsable}
                          </span>
                        </td>

                        {/* Valor actual contable */}
                        <td className="px-6 py-5 text-sm font-semibold text-primary">
                          {formatLempiras(activo.valor_actual_contable)}
                        </td>

                        {/* Estado */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${estado.dot} ${estado.shadow}`} />
                            <span className={`text-xs font-semibold ${estado.text}`}>
                              {estado.label}
                            </span>
                          </div>
                        </td>


                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {!loading && filtrados.length > 0 && (
          <div className="px-6 py-6 border-t border-outline-variant/5 flex items-center justify-between">
            <p className="text-xs font-light text-on-surface-variant/60">
              Mostrando{" "}
              <span className="font-semibold text-primary">{paginados.length}</span> de{" "}
              <span className="font-semibold text-primary">{filtrados.length}</span> activos
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="p-2 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface-variant/40 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPaginasBotones().map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="px-2 text-on-surface-variant/40">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPagina(p)}
                    className={`w-8 h-8 flex items-center justify-center text-xs font-medium rounded-lg transition-colors ${
                      p === paginaActual
                        ? "bg-primary text-on-primary font-bold"
                        : "text-on-surface-variant hover:bg-surface-container-low"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="p-2 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface-variant disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.section>

      {/* Modal de detalle */}
      {seleccionado && (
        <AssetModal
          activo={seleccionado}
          onClose={() => setSeleccionado(null)}
          onUpdated={(updated) => {
            setDatos((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
            setSeleccionado(null);
          }}
        />
      )}
    </main>
  );
}
