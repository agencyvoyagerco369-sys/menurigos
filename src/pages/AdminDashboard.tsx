import { useOrders } from "@/context/OrdersContext";
import { useNavigate } from "react-router-dom";
import { T, STATUS, ACCENT } from "@/lib/admin-theme";
import {
  Clock, ChefHat, CheckCircle, Truck, ShoppingCart, TrendingUp,
  Zap, DollarSign, ArrowRight, Bell, Package,
} from "lucide-react";

const AdminDashboard = () => {
  const { orders } = useOrders();
  const navigate = useNavigate();

  const active = orders.filter((o) => o.status !== "entregado");
  const received = orders.filter((o) => o.status === "recibido").length;
  const preparing = orders.filter((o) => o.status === "preparando").length;
  const ready = orders.filter((o) => o.status === "listo").length;
  const delivered = orders.filter((o) => o.status === "entregado").length;
  const totalRevenue = orders.filter((o) => o.status === "entregado").reduce((s, o) => s + o.total, 0);
  const avgTicket = delivered > 0 ? Math.round(totalRevenue / delivered) : 0;

  const stats = [
    { label: "Pedidos hoy", value: orders.length, icon: ShoppingCart, color: ACCENT.blue },
    { label: "Activos", value: active.length, icon: Zap, color: ACCENT.amber },
    { label: "Ventas del día", value: `$${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: T.brand, isBrand: true },
    { label: "Ticket promedio", value: `$${avgTicket}`, icon: DollarSign, color: ACCENT.green },
  ];

  const pipeline = [
    { label: STATUS.recibido.label, value: received, icon: Bell, color: STATUS.recibido },
    { label: STATUS.preparando.label, value: preparing, icon: ChefHat, color: STATUS.preparando },
    { label: STATUS.listo.label, value: ready, icon: CheckCircle, color: STATUS.listo },
    { label: STATUS.entregado.label, value: delivered, icon: Package, color: STATUS.entregado },
  ];

  return (
    <div className="space-y-6 font-pos">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold" style={{ color: T.text }}>Resumen del día</h2>
        <button onClick={() => navigate("/admin/pedidos")}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all duration-150 hover:brightness-110"
          style={{ background: T.brand, color: "#FFFFFF" }}>
          Ir a pedidos <ArrowRight size={16} strokeWidth={2} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl p-5 transition-all duration-150 hover:-translate-y-0.5"
            style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${s.color}18` }}>
                <s.icon size={20} strokeWidth={2} style={{ color: s.color }} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: T.textDim }}>{s.label}</span>
            </div>
            <p className="text-3xl font-extrabold" style={{ color: s.isBrand ? T.brand : T.text }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Pipeline de estados */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider" style={{ color: T.textDim }}>Pipeline de pedidos</h3>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {pipeline.map((p) => (
            <button key={p.label} onClick={() => navigate("/admin/pedidos")}
              className="group rounded-xl p-4 transition-all duration-150 hover:-translate-y-0.5"
              style={{ background: p.color.bg, border: `1px solid ${p.color.hex}30` }}>
              <div className="flex items-center gap-2 mb-2">
                <p.icon size={16} strokeWidth={2} style={{ color: p.color.text }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: p.color.text }}>{p.label}</span>
              </div>
              <p className="text-4xl font-extrabold" style={{ color: p.color.text }}>{p.value}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Últimos pedidos activos */}
      {active.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: T.textDim }}>Últimos pedidos activos</h3>
            <button onClick={() => navigate("/admin/pedidos")}
              className="text-xs font-bold transition-colors" style={{ color: ACCENT.blue }}>
              Ver todos →
            </button>
          </div>
          <div className="space-y-2">
            {active.slice(0, 5).map((order) => {
              const sc = STATUS[order.status];
              return (
                <div key={order.id} className="flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-150 cursor-pointer hover:-translate-y-0.5"
                  style={{ background: T.card, border: `1px solid ${T.border}`, borderLeft: `4px solid ${sc.border}` }}
                  onClick={() => navigate("/admin/pedidos")}>
                  <div className="flex items-center gap-3">
                    <span className="font-pos-mono text-sm font-semibold" style={{ color: T.textMuted }}>
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-xs font-medium" style={{ color: T.textDim }}>
                      {order.orderType === "mesa" ? `Mesa ${order.tableNumber}` : "Domicilio"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold" style={{ color: T.text }}>${order.total}</span>
                    <span className="rounded px-2.5 py-0.5 text-[11px] font-bold uppercase"
                      style={{ background: sc.bg, color: sc.text }}>
                      {sc.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
