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

const DARK = {
  sidebar: "#0F1117",
  sidebarBorder: "#1A1D27",
  bg: "#151820",
  card: "#1E2330",
  cardBorder: "#2A3040",
  text: "#E8ECF4",
  textMuted: "#8A94A6",
  textDim: "#5A6478",
  surface: "#252B3B",
  accent: "#10B981",
  accentBg: "#10B98115",
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
      <div className="flex min-h-screen items-center justify-center" style={{ background: DARK.bg }}>
        <div className="animate-pulse font-pos-display text-2xl font-bold" style={{ color: DARK.accent }}>Cargando...</div>
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
        <div className="fixed inset-0 z-40 lg:hidden" style={{ background: "#00000060", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: DARK.sidebar, borderRight: `1px solid ${DARK.sidebarBorder}` }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: `1px solid ${DARK.sidebarBorder}` }}>
          <img src={logoRigos} alt="Rigo's" className="h-9 w-9 rounded-lg" />
          <div>
            <h2 className="text-xl font-extrabold font-pos-display leading-tight" style={{ color: DARK.text }}>
              Rigo's
            </h2>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: DARK.textDim }}>Restaurant POS</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={18} style={{ color: DARK.textDim }} />
          </button>
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
                  background: active ? DARK.accentBg : "transparent",
                  color: active ? DARK.accent : DARK.textMuted,
                  borderLeft: active ? `3px solid ${DARK.accent}` : "3px solid transparent",
                }}>
                <item.icon size={18} />
                <span>{item.label}</span>
                {item.path === "/admin/pedidos" && activeCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[10px] font-bold"
                    style={{ background: "#EF444425", color: "#F87171" }}>
                    {activeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4" style={{ borderTop: `1px solid ${DARK.sidebarBorder}` }}>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-150"
            style={{ color: DARK.textDim }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#F87171"; e.currentTarget.style.background = "#EF444410"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = DARK.textDim; e.currentTarget.style.background = "transparent"; }}>
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col" style={{ background: DARK.bg }}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:px-6"
          style={{ background: DARK.card, borderBottom: `1px solid ${DARK.cardBorder}` }}>
          <button className="rounded-lg p-2 lg:hidden" style={{ color: DARK.textMuted }}
            onClick={() => setSidebarOpen(true)}>
            <MenuIcon size={20} />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-lg font-bold font-pos-display" style={{ color: DARK.text }}>
              {NAV_ITEMS.find((i) => i.path === location.pathname)?.label || "Panel"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Kitchen mode */}
            <button onClick={() => setKitchenMode((v) => !v)}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150"
              style={{
                background: kitchenMode ? DARK.accentBg : DARK.surface || DARK.cardBorder,
                color: kitchenMode ? DARK.accent : DARK.textDim,
                border: `1px solid ${kitchenMode ? DARK.accent + "30" : DARK.cardBorder}`,
              }}>
              {kitchenMode ? <Moon size={14} /> : <Sun size={14} />}
              Modo cocina
            </button>

            {/* Live */}
            {hasActiveOrders && (
              <div className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                style={{ background: "#10B98112", border: "1px solid #10B98120" }}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "#10B981" }} />
                  <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#10B981" }} />
                </span>
                <span className="text-xs font-semibold" style={{ color: "#34D399" }}>En vivo</span>
              </div>
            )}

            {/* Clock */}
            <span className="font-pos text-sm font-medium tabular-nums" style={{ color: DARK.textMuted }}>
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
