import { useOrders } from "@/context/OrdersContext";
import { Clock, ChefHat, CheckCircle, Truck, ShoppingCart, TrendingUp, Zap, DollarSign } from "lucide-react";

const D = {
  bg: "#151820",
  card: "#1A1F2E",
  border: "#252D3D",
  text: "#F1F3F8",
  textMuted: "#8892A6",
  textDim: "#5C6478",
  brand: "#D42B2B",
};

const AdminDashboard = () => {
  const { orders } = useOrders();

  const active = orders.filter((o) => o.status !== "entregado");
  const received = orders.filter((o) => o.status === "recibido").length;
  const preparing = orders.filter((o) => o.status === "preparando").length;
  const ready = orders.filter((o) => o.status === "listo").length;
  const delivered = orders.filter((o) => o.status === "entregado").length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { label: "Pedidos activos", value: active.length, icon: Zap, color: "#F59E0B" },
    { label: "Recibidos", value: received, icon: Clock, color: "#3B82F6" },
    { label: "Preparando", value: preparing, icon: ChefHat, color: "#F59E0B" },
    { label: "Listos", value: ready, icon: CheckCircle, color: "#10B981" },
    { label: "Entregados hoy", value: delivered, icon: Truck, color: "#6B7280" },
    { label: "Venta del día", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: D.brand },
  ];

  return (
    <div className="space-y-6 font-pos">
      <h2 className="text-2xl font-extrabold" style={{ color: D.text }}>Resumen del día</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl p-5 transition-all duration-150 hover:-translate-y-0.5"
            style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${s.color}18` }}>
                <s.icon size={20} strokeWidth={2} style={{ color: s.color }} />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.08em]" style={{ color: D.textDim }}>{s.label}</span>
            </div>
            <p className="text-4xl font-extrabold" style={{ color: s.color === D.brand ? D.brand : D.text }}>{s.value}</p>
          </div>
        ))}
      </div>

      {active.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-bold" style={{ color: D.text }}>Últimos pedidos activos</h3>
          <div className="space-y-2">
            {active.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-150"
                style={{ background: D.card, border: `1px solid ${D.border}` }}>
                <div>
                  <span className="font-pos-mono text-sm font-semibold" style={{ color: D.text }}>
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="ml-2 text-xs" style={{ color: D.textMuted }}>
                    {order.orderType === "mesa" ? `Mesa ${order.tableNumber}` : "Domicilio"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold" style={{ color: D.text }}>${order.total}</span>
                  <span className="rounded px-2 py-0.5 text-xs font-bold uppercase"
                    style={{
                      background: order.status === "recibido" ? "rgba(59,130,246,0.12)" :
                        order.status === "preparando" ? "rgba(245,158,11,0.12)" :
                        "rgba(16,185,129,0.12)",
                      color: order.status === "recibido" ? "#60A5FA" :
                        order.status === "preparando" ? "#FBBF24" :
                        "#34D399",
                    }}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
