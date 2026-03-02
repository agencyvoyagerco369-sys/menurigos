import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrdersContext";
import { useEffect, useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  BarChart3, Bell, Box, DollarSign, Home, LogOut,
  Menu as MenuIcon, Moon, Settings, Sun, TrendingUp, X,
} from "lucide-react";
import logoRigos from "@/assets/logo-rigos.png";

const SIDEBAR = {
  bg: "#1A1A2E",
  border: "#2A2A42",
  brand: "#D42B2B",
  text: "#9CA3AF",
  textActive: "#FFFFFF",
  hoverBg: "rgba(255,255,255,0.05)",
  activeBg: "rgba(212,43,43,0.15)",
};

const NAV_ITEMS = [
  { path: "/admin/inicio", label: "Inicio", icon: Home },
  { path: "/admin/pedidos", label: "Pedidos activos", icon: Bell },
  { path: "/admin/productos", label: "Productos", icon: Box },
  { path: "/admin/caja", label: "Caja del día", icon: DollarSign },
  { path: "/admin/reportes", label: "Reportes", icon: TrendingUp },
  { path: "/admin/config", label: "Configuración", icon: Settings },
];

const AdminLayout = () => {
  const { user, loading, signOut } = useAuth();
  const { orders } = useOrders();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [kitchenMode, setKitchenMode] = useState(() => {
    try { return localStorage.getItem("rigos-kitchen-mode") === "true"; } catch { return false; }
  });

  const hasActiveOrders = orders.some((o) => o.status !== "entregado");
  const activeCount = orders.filter((o) => o.status !== "entregado").length;

  useEffect(() => {
    if (!loading && !user) navigate("/admin");
  }, [user, loading, navigate]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("rigos-kitchen-mode", String(kitchenMode));
    if (kitchenMode) {
      document.documentElement.style.filter = "brightness(0.7) saturate(0.8)";
      document.documentElement.style.background = "#000";
    } else {
      document.documentElement.style.filter = "";
      document.documentElement.style.background = "";
    }
    return () => {
      document.documentElement.style.filter = "";
      document.documentElement.style.background = "";
    };
  }, [kitchenMode]);

  // 🔔 Notification sound
  const prevOrderCountRef = useRef(orders.length);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playNotificationSound = useCallback(() => {
    try {
      if (!audioContextRef.current) audioContextRef.current = new AudioContext();
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;
      [0, 0.15].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = i === 0 ? 830 : 1100;
        gain.gain.setValueAtTime(0.3, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.4);
        osc.start(now + delay);
        osc.stop(now + delay + 0.4);
      });
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🛎 Nuevo pedido en Rigo's", { body: "Tienes un nuevo pedido por atender." });
      }
    } catch (e) { console.warn("Could not play notification sound:", e); }
  }, []);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
  }, []);

  useEffect(() => {
    if (orders.length > prevOrderCountRef.current) playNotificationSound();
    prevOrderCountRef.current = orders.length;
  }, [orders.length, playNotificationSound]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#F8F9FA" }}>
        <div className="animate-pulse font-pos text-2xl font-bold" style={{ color: SIDEBAR.brand }}>Cargando...</div>
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin");
  };

  return (
    <div className="flex min-h-screen w-full font-pos">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ background: "#00000040", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: SIDEBAR.bg, borderRight: `1px solid ${SIDEBAR.border}` }}>

        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom: `1px solid ${SIDEBAR.border}` }}>
          <div className="flex items-center gap-3">
            <img src={logoRigos} alt="Rigo's" className="h-9 w-9 rounded-lg" />
            <div>
              <h2 className="text-xl font-extrabold leading-tight" style={{ color: SIDEBAR.brand, fontFamily: "Georgia, serif" }}>
                Rigo's
              </h2>
            </div>
            <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X size={18} strokeWidth={2} style={{ color: SIDEBAR.text }} />
            </button>
          </div>
          <div className="mt-2" style={{ width: 40, height: 3, background: SIDEBAR.brand, borderRadius: 2 }} />
          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: SIDEBAR.text }}>Restaurant POS</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className="relative flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-150"
                style={{
                  background: active ? SIDEBAR.activeBg : "transparent",
                  color: active ? SIDEBAR.textActive : SIDEBAR.text,
                  borderLeft: active ? `3px solid ${SIDEBAR.brand}` : "3px solid transparent",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = SIDEBAR.hoverBg; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                <item.icon size={18} strokeWidth={2} />
                <span>{item.label}</span>
                {item.path === "/admin/pedidos" && activeCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded px-1 text-[10px] font-bold text-white"
                    style={{ background: SIDEBAR.brand }}>
                    {activeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4" style={{ borderTop: `1px solid ${SIDEBAR.border}` }}>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-150"
            style={{ color: SIDEBAR.text }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#F87171"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = SIDEBAR.text; e.currentTarget.style.background = "transparent"; }}>
            <LogOut size={18} strokeWidth={2} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col" style={{ background: "#F8F9FA" }}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:px-6"
          style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E7EB" }}>
          <button className="rounded-lg p-2 lg:hidden" style={{ color: "#6B7280" }}
            onClick={() => setSidebarOpen(true)}>
            <MenuIcon size={20} strokeWidth={2} />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-lg font-bold font-pos" style={{ color: "#111827" }}>
              {NAV_ITEMS.find((i) => i.path === location.pathname)?.label || "Panel"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Kitchen mode */}
            <button onClick={() => setKitchenMode((v) => !v)}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150"
              style={{
                background: kitchenMode ? "rgba(212,43,43,0.1)" : "#F3F4F6",
                color: kitchenMode ? SIDEBAR.brand : "#6B7280",
                border: `1px solid ${kitchenMode ? SIDEBAR.brand + "30" : "#E5E7EB"}`,
              }}>
              {kitchenMode ? <Moon size={14} strokeWidth={2} /> : <Sun size={14} strokeWidth={2} />}
              Modo cocina
            </button>

            {/* Live */}
            {hasActiveOrders && (
              <div className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                style={{ background: "#DCFCE7", border: "1px solid #BBF7D0" }}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "#16A34A" }} />
                  <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#16A34A" }} />
                </span>
                <span className="text-xs font-semibold" style={{ color: "#15803D" }}>En vivo</span>
              </div>
            )}

            {/* Clock */}
            <span className="font-pos-mono text-sm font-medium tabular-nums" style={{ color: "#6B7280" }}>
              {time.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }).toUpperCase()}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
