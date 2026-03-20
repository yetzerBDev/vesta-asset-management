"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Settings,
  Menu,
  X,
  Package,
  Moon,
  Sun,
  Monitor,
  LogOut,
  User,
  HelpCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import MobileNav from "./MobileNav";

const headerLinks = [
  { href: "/", label: "Panel" },
  { href: "/activos", label: "Activos" },
  { href: "/licencias", label: "Licencias" },
  { href: "/mantenimiento", label: "Mantenimiento" },
  { href: "/reportes", label: "Reportes" },
];

interface SearchResult {
  id: string;
  nombre_equipo: string;
  codigo_qr: string;
  estado: string;
  categoria: string;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ── Búsqueda ── */
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<SearchResult[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResultados([]);
      setSearchOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      setBuscando(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("activos")
        .select("id, nombre_equipo, codigo_qr, estado, categoria")
        .or(`nombre_equipo.ilike.%${query}%,codigo_qr.ilike.%${query}%,categoria.ilike.%${query}%`)
        .limit(5);
      setResultados((data as SearchResult[]) ?? []);
      setSearchOpen(true);
      setBuscando(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  /* ── Notificaciones ── */
  const [notiOpen, setNotiOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState<
    { id: string; nombre_equipo: string; estado: string; ultima_modificacion: string }[]
  >([]);
  const notiRef = useRef<HTMLDivElement>(null);

  function abrirNotificaciones() {
    if (!notiOpen) {
      const supabase = createClient();
      supabase
        .from("activos")
        .select("id, nombre_equipo, estado, ultima_modificacion")
        .order("ultima_modificacion", { ascending: false })
        .limit(5)
        .then(({ data }) => {
          if (data) setNotificaciones(data);
        });
    }
    setNotiOpen(!notiOpen);
    setConfigOpen(false);
    setPerfilOpen(false);
  }

  /* ── Config ── */
  const [configOpen, setConfigOpen] = useState(false);
  const configRef = useRef<HTMLDivElement>(null);

  /* ── Perfil ── */
  const [perfilOpen, setPerfilOpen] = useState(false);
  const perfilRef = useRef<HTMLDivElement>(null);

  /* ── Click fuera cierra todos ── */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const t = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(t)) setSearchOpen(false);
      if (notiRef.current && !notiRef.current.contains(t)) setNotiOpen(false);
      if (configRef.current && !configRef.current.contains(t)) setConfigOpen(false);
      if (perfilRef.current && !perfilRef.current.contains(t)) setPerfilOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Ahora";
    if (mins < 60) return `Hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Hace ${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `Hace ${days}d`;
  }

  const estadoDot: Record<string, string> = {
    activo: "bg-secondary",
    mantenimiento: "bg-tertiary-fixed-dim",
    en_reparacion: "bg-tertiary-fixed-dim",
    baja: "bg-error",
  };

  const dropdownMotion = {
    initial: { opacity: 0, scale: 0.95, y: -8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -8 },
    transition: { duration: 0.15 },
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 bg-white/70 dark:bg-[#00152a]/70 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,21,42,0.06)] flex justify-between items-center w-full px-6 lg:px-10 py-4"
      >
        <div className="flex items-center gap-6 lg:gap-10">
          {/* Menú móvil */}
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

          {/* Navegación principal */}
          <nav className="hidden md:flex gap-8 items-center">
            {headerLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-body text-sm transition-all duration-200 ${
                    isActive
                      ? "text-[#00152a] dark:text-white font-bold border-b-2 border-[#1b6b51] pb-1"
                      : "text-[#191c1d]/60 dark:text-white/60 font-medium hover:text-[#00152a] dark:hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          {/* ═══ 1. BÚSQUEDA ═══ */}
          <div className="relative hidden sm:block" ref={searchRef}>
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-[#43474d]/50" />
            </div>
            <input
              className="bg-[#f3f4f5] border-none rounded-full pl-10 pr-4 py-2 text-sm w-48 lg:w-64 focus:ring-1 focus:ring-primary transition-all focus:outline-none"
              placeholder="Buscar activos..."
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => resultados.length > 0 && setSearchOpen(true)}
            />
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  {...dropdownMotion}
                  className="absolute top-full mt-2 right-0 w-80 bg-surface-container-lowest rounded-xl shadow-[0_12px_40px_rgba(0,21,42,0.12)] border border-outline-variant/10 overflow-hidden z-50"
                >
                  {buscando ? (
                    <div className="px-4 py-6 text-center text-on-surface-variant/60 text-sm">
                      Buscando...
                    </div>
                  ) : resultados.length === 0 ? (
                    <div className="px-4 py-6 text-center text-on-surface-variant/60 text-sm">
                      Sin resultados para &ldquo;{query}&rdquo;
                    </div>
                  ) : (
                    <div className="py-1.5">
                      {resultados.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => {
                            setSearchOpen(false);
                            setQuery("");
                            router.push("/activos");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-primary/60" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-primary truncate">{r.nombre_equipo}</p>
                            <p className="text-[11px] text-on-surface-variant/50">{r.codigo_qr} · {r.categoria}</p>
                          </div>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${estadoDot[r.estado] ?? "bg-outline"}`} />
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            {/* ═══ 2. NOTIFICACIONES ═══ */}
            <div className="relative" ref={notiRef}>
              <button
                onClick={abrirNotificaciones}
                className="p-2 rounded-full hover:bg-[#f3f4f5] dark:hover:bg-[#102a43] transition-all relative"
              >
                <Bell className="w-5 h-5 text-primary dark:text-white" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full" />
              </button>
              <AnimatePresence>
                {notiOpen && (
                  <motion.div
                    {...dropdownMotion}
                    className="absolute top-full mt-2 right-0 w-80 bg-surface-container-lowest rounded-xl shadow-[0_12px_40px_rgba(0,21,42,0.12)] border border-outline-variant/10 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-outline-variant/10">
                      <h3 className="text-sm font-bold text-primary">Actividad Reciente</h3>
                    </div>
                    {notificaciones.length === 0 ? (
                      <div className="px-4 py-8 text-center text-on-surface-variant/50 text-sm">
                        No hay actividad reciente
                      </div>
                    ) : (
                      <div className="max-h-72 overflow-y-auto">
                        {notificaciones.map((n) => (
                          <div
                            key={n.id}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors"
                          >
                            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${estadoDot[n.estado] ?? "bg-outline"}`} />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-on-surface truncate">{n.nombre_equipo}</p>
                              <p className="text-[11px] text-on-surface-variant/50">
                                Estado: {n.estado} · {timeAgo(n.ultima_modificacion)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="px-4 py-2.5 border-t border-outline-variant/10">
                      <Link
                        href="/activos"
                        onClick={() => setNotiOpen(false)}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Ver todos los activos
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ═══ 3. CONFIGURACIÓN ═══ */}
            <div className="relative" ref={configRef}>
              <button
                onClick={() => { setConfigOpen(!configOpen); setNotiOpen(false); setPerfilOpen(false); }}
                className="p-2 rounded-full hover:bg-[#f3f4f5] dark:hover:bg-[#102a43] transition-all"
              >
                <Settings className={`w-5 h-5 text-primary dark:text-white transition-transform duration-300 ${configOpen ? "rotate-90" : ""}`} />
              </button>
              <AnimatePresence>
                {configOpen && (
                  <motion.div
                    {...dropdownMotion}
                    className="absolute top-full mt-2 right-0 w-56 bg-surface-container-lowest rounded-xl shadow-[0_12px_40px_rgba(0,21,42,0.12)] border border-outline-variant/10 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-outline-variant/10">
                      <h3 className="text-sm font-bold text-primary">Configuración</h3>
                    </div>
                    <div className="py-1.5">
                      <div className="px-4 py-2.5">
                        <p className="text-[11px] uppercase tracking-widest font-bold text-on-surface-variant/50 mb-2">Tema</p>
                        <div className="flex gap-1.5">
                          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-on-primary text-xs font-medium">
                            <Sun className="w-3.5 h-3.5" />
                            Claro
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low text-on-surface-variant text-xs font-medium hover:bg-surface-container-high transition-colors">
                            <Moon className="w-3.5 h-3.5" />
                            Oscuro
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low text-on-surface-variant text-xs font-medium hover:bg-surface-container-high transition-colors">
                            <Monitor className="w-3.5 h-3.5" />
                            Auto
                          </button>
                        </div>
                      </div>
                      <div className="border-t border-outline-variant/10 my-1" />
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors">
                        <HelpCircle className="w-4 h-4 text-on-surface-variant/60" />
                        Centro de Ayuda
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ═══ 4. PERFIL ═══ */}
            <div className="relative" ref={perfilRef}>
              <button
                onClick={() => { setPerfilOpen(!perfilOpen); setNotiOpen(false); setConfigOpen(false); }}
                className="w-10 h-10 rounded-full bg-[#e7e8e9] overflow-hidden border border-[#c3c6ce]/20 flex items-center justify-center hover:ring-2 hover:ring-primary/20 transition-all"
              >
                <span className="text-sm font-bold text-[#00152a]">YH</span>
              </button>
              <AnimatePresence>
                {perfilOpen && (
                  <motion.div
                    {...dropdownMotion}
                    className="absolute top-full mt-2 right-0 w-64 bg-surface-container-lowest rounded-xl shadow-[0_12px_40px_rgba(0,21,42,0.12)] border border-outline-variant/10 overflow-hidden z-50"
                  >
                    <div className="px-4 py-4 border-b border-outline-variant/10 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">YH</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">Yetzer Heber</p>
                        <p className="text-[11px] text-on-surface-variant/50">Administrador</p>
                      </div>
                    </div>
                    <div className="py-1.5">
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors">
                        <User className="w-4 h-4 text-on-surface-variant/60" />
                        Mi Perfil
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors">
                        <Settings className="w-4 h-4 text-on-surface-variant/60" />
                        Preferencias
                      </button>
                      <div className="border-t border-outline-variant/10 my-1" />
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors">
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
