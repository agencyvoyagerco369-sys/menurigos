import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrdersContext";
import { useEffect, useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { T } from "@/lib/admin-theme";
import {
  BarChart3, Bell, Box, DollarSign, Home, LogOut,
  Menu as MenuIcon, Moon, Settings, Sun, TrendingUp, X, ShoppingCart
} from "lucide-react";
import logoRigos from "@/assets/logo-rigos.png";

const D = T;

const NAV_ITEMS = [
  { path: "/admin/inicio", label: "Inicio", icon: Home },
  { path: "/admin/pos", label: "Punto de Venta", icon: ShoppingCart },
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

  const hasActiveOrders = orders.some((o) => o.status !== "entregado");
  const activeCount = orders.filter((o) => o.status !== "entregado").length;

  useEffect(() => {
    if (!loading && !user) navigate("/admin");
  }, [user, loading, navigate]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

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
      <div className="flex min-h-screen items-center justify-center" style={{ background: D.bg }}>
        <div className="animate-pulse font-pos text-2xl font-bold" style={{ color: D.brand }}>Cargando...</div>
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin");
  };

  return (
    <div className="flex min-h-screen w-full font-pos" style={{ background: D.bg }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ background: "#00000070", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: D.sidebar, borderRight: `1px solid ${D.sidebarBorder}` }}>

        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom: `1px solid ${D.sidebarBorder}` }}>
          <div className="flex items-center gap-3">
            <img src={logoRigos} alt="Rigo's" className="h-9 w-9 rounded-lg" />
            <div>
              <h2 className="text-xl font-extrabold leading-tight" style={{ color: D.brand, fontFamily: "Georgia, serif" }}>
                Rigo's
              </h2>
            </div>
            <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X size={18} strokeWidth={2} style={{ color: D.textMuted }} />
            </button>
          </div>
          <div className="mt-2" style={{ width: 40, height: 3, background: D.brand, borderRadius: 2 }} />
          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: D.textDim }}>Restaurant POS</p>
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
                  background: active ? "rgba(234,88,12,0.15)" : "transparent",
                  color: active ? D.brand : D.textMuted,
                  borderLeft: active ? `3px solid ${D.brand}` : "3px solid transparent",
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = D.text; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = D.textMuted; } }}>
                <item.icon size={18} strokeWidth={2} />
                <span>{item.label}</span>
                {item.path === "/admin/pedidos" && activeCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded px-1 text-[10px] font-bold text-white"
                    style={{ background: D.brand }}>
                    {activeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4" style={{ borderTop: `1px solid ${D.sidebarBorder}` }}>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-150"
            style={{ color: D.textMuted }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#DC2626"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = D.textMuted; e.currentTarget.style.background = "transparent"; }}>
            <LogOut size={18} strokeWidth={2} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col" style={{ background: D.bg }}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:px-6"
          style={{ background: D.topbar, borderBottom: `1px solid ${D.topbarBorder}` }}>
          <button className="rounded-lg p-2 lg:hidden" style={{ color: D.textMuted }}
            onClick={() => setSidebarOpen(true)}>
            <MenuIcon size={20} strokeWidth={2} />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-lg font-bold font-pos" style={{ color: D.text }}>
              {NAV_ITEMS.find((i) => i.path === location.pathname)?.label || "Panel"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Live */}
            {hasActiveOrders && (
              <div className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "#10B981" }} />
                  <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#10B981" }} />
                </span>
                <span className="text-xs font-semibold" style={{ color: "#10B981" }}>En vivo</span>
              </div>
            )}

            {/* Clock */}
            <span className="font-pos-mono text-sm font-medium tabular-nums" style={{ color: D.textMuted }}>
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
