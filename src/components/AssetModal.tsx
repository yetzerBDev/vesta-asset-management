"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Package,
  Pencil,
  Save,
  User,
  Tag,
  MapPin,
  Activity,
  Calendar,
  DollarSign,
  TrendingDown,
  Clock,
  QrCode,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import type { ReporteDepreciacion } from "@/types/database";

/* ── Estado → colores ── */
const estadoConfig: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  activo:        { label: "Activo",        dot: "bg-secondary",          text: "text-secondary",              bg: "bg-secondary/10" },
  mantenimiento: { label: "Mantenimiento", dot: "bg-tertiary-fixed-dim", text: "text-on-tertiary-container",  bg: "bg-tertiary-fixed-dim/10" },
  en_reparacion: { label: "En Reparación", dot: "bg-tertiary-fixed-dim", text: "text-on-tertiary-container",  bg: "bg-tertiary-fixed-dim/10" },
  baja:          { label: "Baja",          dot: "bg-error",              text: "text-error",                  bg: "bg-error/10" },
};
const fallbackEstado = { label: "Desconocido", dot: "bg-outline", text: "text-outline", bg: "bg-outline/10" };

const estadoOpciones = ["activo", "mantenimiento", "en_reparacion", "baja"];

function formatLempiras(monto: number) {
  return `L ${monto.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-HN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface AssetModalProps {
  activo: ReporteDepreciacion;
  onClose: () => void;
  onUpdated: (updated: ReporteDepreciacion) => void;
}

export default function AssetModal({ activo, onClose, onUpdated }: AssetModalProps) {
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [nombreSucursal, setNombreSucursal] = useState<string>("");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("sucursales")
      .select("nombre, ciudad")
      .eq("id", activo.sucursal_id)
      .single()
      .then(({ data }: { data: { nombre: string; ciudad: string } | null }) => {
        if (data) setNombreSucursal(`${data.nombre}, ${data.ciudad}`);
      });
  }, [activo.sucursal_id]);

  // Campos editables
  const [responsable, setResponsable] = useState(activo.responsable);
  const [categoria, setCategoria] = useState(activo.categoria);
  const [estado, setEstado] = useState(activo.estado);
  const [nombreEquipo, setNombreEquipo] = useState(activo.nombre_equipo);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  const estadoInfo = estadoConfig[activo.estado] ?? fallbackEstado;
  const estadoEditInfo = estadoConfig[estado] ?? fallbackEstado;

  async function handleGuardar() {
    setGuardando(true);
    setErrorMsg(null);
    const supabase = createClient();
    const payload = {
      responsable,
      categoria,
      estado,
      nombre_equipo: nombreEquipo,
    };

    const { data, error } = await supabase
      .from("activos")
      // @ts-expect-error — incompatibilidad de genéricos @supabase/ssr + supabase-js v2.99
      .update(payload)
      .eq("id", activo.id)
      .select();

    if (error) {
      console.error("Error al actualizar:", error);
      setErrorMsg(error.message);
      setGuardando(false);
      return;
    }

    if (!data || (data as unknown[]).length === 0) {
      console.error("Update no afectó filas. Posible problema de RLS.");
      setErrorMsg("No se pudo guardar. Verificá los permisos (RLS) en Supabase.");
      setGuardando(false);
      return;
    }

    onUpdated({
      ...activo,
      responsable,
      categoria,
      estado,
      nombre_equipo: nombreEquipo,
    });
    setGuardando(false);
    setGuardadoExitoso(true);
    setTimeout(() => {
      setGuardadoExitoso(false);
      setEditando(false);
    }, 1800);
  }

  function handleCancelar() {
    setResponsable(activo.responsable);
    setCategoria(activo.categoria);
    setEstado(activo.estado);
    setNombreEquipo(activo.nombre_equipo);
    setEditando(false);
  }

  const depreciacionPorcentaje =
    activo.costo_inicial > 0
      ? ((activo.costo_inicial - activo.valor_actual_contable) / activo.costo_inicial) * 100
      : 0;

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="bg-surface-container-lowest rounded-2xl shadow-[0_24px_80px_rgba(0,21,42,0.12)] w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header del modal */}
          <div className="sticky top-0 bg-surface-container-lowest/95 backdrop-blur-sm z-10 px-8 pt-8 pb-4 flex items-start justify-between border-b border-outline-variant/10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl bg-surface-container-high overflow-hidden flex items-center justify-center border border-outline-variant/10 shrink-0">
                {activo.imagen_url ? (
                  <img src={activo.imagen_url} alt={activo.nombre_equipo} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-7 h-7 text-primary/40" />
                )}
              </div>
              <div>
                {editando ? (
                  <input
                    value={nombreEquipo}
                    onChange={(e) => setNombreEquipo(e.target.value)}
                    className="text-xl font-headline font-bold text-primary bg-surface-container-low rounded-lg px-3 py-1 border border-outline-variant/20 focus:ring-1 focus:ring-primary/30 focus:outline-none w-full"
                  />
                ) : (
                  <h2 className="text-xl font-headline font-bold text-primary">
                    {activo.nombre_equipo}
                  </h2>
                )}
                <p className="text-sm text-on-surface-variant/60 mt-1 flex items-center gap-2">
                  <QrCode className="w-3.5 h-3.5" />
                  {activo.codigo_qr}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!editando ? (
                <button
                  onClick={() => setEditando(true)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-primary border border-outline-variant/20 rounded-lg hover:bg-surface-container-low transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelar}
                    className="px-4 py-2 text-xs font-semibold text-on-surface-variant border border-outline-variant/20 rounded-lg hover:bg-surface-container-low transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardar}
                    disabled={guardando}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-all disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {guardando ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant/60 ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cuerpo */}
          <div className="px-8 py-6 space-y-8">
            {/* Mensajes de estado */}
            <AnimatePresence>
              {guardadoExitoso && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="px-4 py-3 rounded-lg bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Cambios guardados correctamente
                </motion.div>
              )}
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm"
                >
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>
            {/* Estado badge grande */}
            <div className="flex items-center gap-3">
              {editando ? (
                <div className="flex gap-2 flex-wrap">
                  {estadoOpciones.map((opt) => {
                    const info = estadoConfig[opt] ?? fallbackEstado;
                    const selected = estado === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => setEstado(opt)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                          selected
                            ? `${info.bg} ${info.text} border-current`
                            : "border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${info.dot}`} />
                        {info.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${estadoInfo.bg} ${estadoInfo.text}`}>
                  <span className={`w-2 h-2 rounded-full ${estadoInfo.dot}`} />
                  {estadoInfo.label}
                </span>
              )}
            </div>

            {/* Grid de información */}
            <div className="grid grid-cols-2 gap-6">
              {/* Responsable */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/60 flex items-center gap-1.5">
                  <User className="w-3 h-3" /> Responsable
                </label>
                {editando ? (
                  <input
                    value={responsable}
                    onChange={(e) => setResponsable(e.target.value)}
                    className="w-full bg-surface-container-low rounded-lg px-3 py-2 text-sm border border-outline-variant/20 focus:ring-1 focus:ring-primary/30 focus:outline-none"
                  />
                ) : (
                  <p className="text-sm font-medium text-on-surface">{activo.responsable}</p>
                )}
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/60 flex items-center gap-1.5">
                  <Tag className="w-3 h-3" /> Categoría
                </label>
                {editando ? (
                  <input
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full bg-surface-container-low rounded-lg px-3 py-2 text-sm border border-outline-variant/20 focus:ring-1 focus:ring-primary/30 focus:outline-none"
                  />
                ) : (
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-semibold">
                    {activo.categoria}
                  </span>
                )}
              </div>

              {/* Sucursal */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/60 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> Sucursal
                </label>
                <p className="text-sm font-medium text-on-surface">{nombreSucursal || "Cargando..."}</p>
              </div>

              {/* Fecha de compra */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/60 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Fecha de Compra
                </label>
                <p className="text-sm font-medium text-on-surface">{formatFecha(activo.fecha_compra)}</p>
              </div>
            </div>

            {/* Sección financiera */}
            <div className="border-t border-outline-variant/10 pt-6">
              <h3 className="text-xs uppercase tracking-widest font-bold text-on-surface-variant/60 mb-5 flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" /> Información Financiera
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface-container-low rounded-xl p-4 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/60 font-medium mb-1">Costo Inicial</p>
                  <p className="text-lg font-bold font-headline text-primary">{formatLempiras(activo.costo_inicial)}</p>
                </div>
                <div className="bg-surface-container-low rounded-xl p-4 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/60 font-medium mb-1">Valor Actual</p>
                  <p className="text-lg font-bold font-headline text-secondary">{formatLempiras(activo.valor_actual_contable)}</p>
                </div>
                <div className="bg-surface-container-low rounded-xl p-4 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/60 font-medium mb-1">Valor Rescate</p>
                  <p className="text-lg font-bold font-headline text-on-surface-variant">{formatLempiras(activo.valor_rescate)}</p>
                </div>
              </div>

              {/* Barra de depreciación */}
              <div className="mt-5 bg-surface-container-low rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-on-surface-variant flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5" /> Depreciación
                  </span>
                  <span className="text-xs font-bold text-primary">{depreciacionPorcentaje.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary/30 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(depreciacionPorcentaje, 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
                <div className="flex justify-between mt-3 text-[10px] text-on-surface-variant/60">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3 h-3" />
                    <span>Dep. anual: {formatLempiras(activo.depreciacion_anual)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{activo.anos_transcurridos} de {activo.vida_util_anos} años</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Última modificación */}
            <div className="text-right">
              <p className="text-[10px] text-on-surface-variant/40">
                Última modificación: {formatFecha(activo.ultima_modificacion)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
