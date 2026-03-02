import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrdersContext";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bell,
  Box,
  DollarSign,
  Home,
  LogOut,
  Menu as MenuIcon,
  Moon,
  Settings,
  Sun,
  TrendingUp,
  X,
} from "lucide-react";
import logoRigos from "@/assets/logo-rigos.png";

const NAV_ITEMS = [
  { path: "/admin/inicio", label: "Inicio", icon: Home, emoji: "📊" },
  { path: "/admin/pedidos", label: "Pedidos activos", icon: Bell, emoji: "🛎" },
  { path: "/admin/productos", label: "Productos", icon: Box, emoji: "📦" },
  { path: "/admin/caja", label: "Caja del día", icon: DollarSign, emoji: "💰" },
  { path: "/admin/reportes", label: "Reportes", icon: TrendingUp, emoji: "📈" },
  { path: "/admin/config", label: "Configuración", icon: Settings, emoji: "⚙️" },
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

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Kitchen mode persistence & CSS
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse font-display text-3xl text-primary">Cargando...</div>
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin");
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-secondary transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
          <img src={logoRigos} alt="Rigo's" className="h-10 w-10" />
          <div>
            <h2 className="font-display text-2xl leading-tight text-accent">Rigo's</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/50">Panel de Control</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} className="text-sidebar-foreground/60" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  active
                    ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <span className="text-base">{item.emoji}</span>
                <span>{item.label}</span>
                {item.path === "/admin/pedidos" && hasActiveOrders && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {orders.filter((o) => o.status !== "entregado").length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-sidebar-border px-3 py-4">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-sidebar-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col bg-muted/30">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3 shadow-sm lg:px-6">
          <button
            className="rounded-lg p-2 text-foreground hover:bg-muted lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon size={22} />
          </button>

          <div className="hidden lg:block">
            <h1 className="font-display text-xl text-card-foreground">
              {NAV_ITEMS.find((i) => i.path === location.pathname)?.label || "Panel"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Kitchen mode toggle */}
            <button
              onClick={() => setKitchenMode((v) => !v)}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                kitchenMode
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {kitchenMode ? <Moon size={14} /> : <Sun size={14} />}
              Modo cocina 🌙
            </button>

            {/* Live indicator */}
            {hasActiveOrders && (
              <div className="flex items-center gap-2 rounded-full bg-success/10 px-3 py-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                </span>
                <span className="text-xs font-semibold text-success">En vivo</span>
              </div>
            )}

            {/* Clock */}
            <span className="font-mono text-sm font-medium text-muted-foreground">
              {time.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
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
