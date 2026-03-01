import { useOrders } from "@/context/OrdersContext";
import { Clock, ChefHat, CheckCircle, Truck, ShoppingCart, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  const { orders } = useOrders();

  const active = orders.filter((o) => o.status !== "entregado");
  const received = orders.filter((o) => o.status === "recibido").length;
  const preparing = orders.filter((o) => o.status === "preparando").length;
  const ready = orders.filter((o) => o.status === "listo").length;
  const delivered = orders.filter((o) => o.status === "entregado").length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { label: "Pedidos activos", value: active.length, icon: ShoppingCart, color: "text-primary" },
    { label: "Recibidos", value: received, icon: Clock, color: "text-accent" },
    { label: "Preparando", value: preparing, icon: ChefHat, color: "text-primary" },
    { label: "Listos", value: ready, icon: CheckCircle, color: "text-success" },
    { label: "Entregados hoy", value: delivered, icon: Truck, color: "text-muted-foreground" },
    { label: "Venta del día", value: `$${totalRevenue}`, icon: TrendingUp, color: "text-success" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-display text-3xl text-card-foreground">Resumen del día</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="mb-2 flex items-center gap-2">
              <s.icon size={20} className={s.color} />
              <span className="text-sm text-muted-foreground">{s.label}</span>
            </div>
            <p className={`font-display text-4xl ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {active.length > 0 && (
        <div>
          <h3 className="mb-3 font-display text-xl text-card-foreground">Últimos pedidos activos</h3>
          <div className="space-y-2">
            {active.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                <div>
                  <span className="text-sm font-semibold text-foreground">{order.id}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {order.orderType === "mesa" ? `Mesa ${order.tableNumber}` : "Domicilio"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary">${order.total}</span>
                  <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success capitalize">
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
