"use client";

import { useEffect, useState } from "react";
import { Building2, Wrench, TrendingDown } from "lucide-react";
import { createClient } from "@/lib/supabase";
import type { Activo, ReporteDepreciacion } from "@/types/database";
import MetricCard from "@/components/MetricCard";

function formatLempiras(monto: number) {
  return `L ${monto.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Home() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [reporte, setReporte] = useState<ReporteDepreciacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      const [activosRes, reporteRes] = await Promise.all([
        supabase.from("activos").select("*"),
        supabase.from("reporte_depreciacion").select("*"),
      ]);

      if (activosRes.data) setActivos(activosRes.data);
      if (reporteRes.data) setReporte(reporteRes.data as ReporteDepreciacion[]);
      setLoading(false);
    }

    fetchData();
  }, []);

  // --- Métricas desde la DB + vista de depreciación ---
  const valorTotal = activos.reduce((sum, a) => sum + (a.costo_inicial ?? 0), 0);

  const fueraDeLinea = activos.filter(
    (a) => a.estado === "mantenimiento" || a.estado === "en_reparacion" || a.estado === "baja"
  ).length;

  // Depreciación viene pre-calculada desde el backend
  const depreciacionAcumulada = reporte.reduce(
    (sum, r) => sum + ((r.costo_inicial ?? 0) - (r.valor_actual_contable ?? 0)),
    0
  );

  const porcentajeDepreciacion =
    valorTotal > 0 ? (depreciacionAcumulada / valorTotal) * 100 : 0;

  return (
    <main className="flex-1 px-6 lg:px-10 py-8 lg:py-12 max-w-7xl mx-auto w-full">
      <div className="mb-12 lg:mb-16">
        <h1 className="text-3xl lg:text-4xl font-extrabold font-headline tracking-tight text-primary mb-2">
          Panel Principal
        </h1>
        <p className="text-on-surface-variant font-light">
          Resumen ejecutivo del capital tecnológico y operativo.
        </p>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {/* 1. Valor total de activos */}
        <MetricCard
          icon={Building2}
          iconBg="bg-primary text-white"
          titulo="Valor Total de Activos"
          valor={formatLempiras(valorTotal)}
          subtitulo="Costo histórico de adquisición"
          loading={loading}
          indice={0}
          badge={{
            label: "Auditado",
            color: "text-secondary",
            pulso: true,
          }}
        />

        {/* 2. Estado operativo */}
        <MetricCard
          icon={Wrench}
          iconBg="bg-tertiary text-white"
          titulo="Estado Operativo"
          valor={String(fueraDeLinea)}
          subtitulo="Activos fuera de línea / En taller"
          loading={loading}
          indice={1}
          borderLeft="border-l-tertiary-fixed-dim"
          badge={{
            label: "Atención",
            color: "text-on-tertiary-fixed-variant",
            bgColor: "bg-tertiary-fixed-dim/20",
          }}
        />

        {/* 3. Salud financiera (depreciación) */}
        <MetricCard
          icon={TrendingDown}
          iconBg="bg-surface-container text-on-surface-variant"
          titulo="Salud Financiera"
          valor={formatLempiras(depreciacionAcumulada)}
          subtitulo="Pérdida de valor acumulada"
          loading={loading}
          indice={2}
          badge={{
            label: "En libros",
            color: "text-on-surface-variant",
            bgColor: "bg-surface-container/40",
          }}
        />
      </div>
    </main>
  );
}
